import { PublicClientApplication } from '@azure/msal-browser';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest, loginRequesToGrapht } from '../config/authConfig';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  officeLocation?: string;
}

export class AuthService {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  /**
   * Initialize the MSAL instance
   */
  async initialize(): Promise<void> {
    try {
      await this.msalInstance.initialize();
      await this.handleRedirectPromise();
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw error;
    }
  }

  /**
   * Handle redirect promise for redirect flow
   */
  private async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    try {
      return await this.msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('Error handling redirect:', error);
      throw error;
    }
  }

  /**
   * Sign in using popup flow
   */
  async signInPopup(): Promise<AuthenticationResult> {
    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      return response;
    } catch (error) {
      console.error('Popup sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Sign in using redirect flow
   */
  async signInRedirect(): Promise<void> {
    try {
      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Redirect sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Sign out the user
   */
  async signOut(): Promise<void> {
    try {
      const account = this.getCurrentAccount();
      if (account) {
        await this.msalInstance.logoutPopup({
          account,
          postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
        });
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Get the current authenticated account
   */
  getCurrentAccount(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentAccount() !== null;
  }

  /**
   * Get access token silently
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const account = this.getCurrentAccount();
      if (!account) {
        return null;
      }

      const silentRequest = {
        ...loginRequest,
        account,
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      // If silent acquisition fails, you might want to fallback to interactive
      try {
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Failed to acquire token interactively:', interactiveError);
        throw interactiveError;
      }
    }
  }
  /**
    * Get access token silently
    */
  async getAccessTokenForGraph(): Promise<string | null> {
    try {
      const account = this.getCurrentAccount();
      if (!account) {
        return null;
      }

      const silentRequest = {
        ...loginRequesToGrapht,
        account,
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      // If silent acquisition fails, you might want to fallback to interactive
      try {
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Failed to acquire token interactively:', interactiveError);
        throw interactiveError;
      }
    }
  }
  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const accessToken = await this.getAccessTokenForGraph();
      if (!accessToken) {
        return null;
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const userData = await response.json();
      return {
        id: userData.id,
        displayName: userData.displayName,
        email: userData.mail || userData.userPrincipalName,
        givenName: userData.givenName,
        surname: userData.surname,
        jobTitle: userData.jobTitle,
        officeLocation: userData.officeLocation,
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Get the MSAL instance for advanced usage
   */
  getMsalInstance(): PublicClientApplication {
    return this.msalInstance;
  }
}

// Export singleton instance
export const authService = new AuthService();