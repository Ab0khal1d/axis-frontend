import { PublicClientApplication } from '@azure/msal-browser';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/authConfig';

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
  private tokenAcquisitionAttempts = 0;
  private lastTokenFailure = 0;
  private readonly MAX_TOKEN_ATTEMPTS = 3;
  private readonly TOKEN_COOLDOWN = 30000; // 30 seconds

  constructor() {
    // log all vite env variables
    console.log('VITE_AZURE_CLIENT_ID:', import.meta.env.VITE_AZURE_CLIENT_ID);
    console.log('VITE_AZURE_TENANT_ID:', import.meta.env.VITE_AZURE_TENANT_ID);
    console.log('VITE_AZURE_REDIRECT_URI:', import.meta.env.VITE_AZURE_REDIRECT_URI);
    console.log('VITE_AZURE_POST_LOGOUT_REDIRECT_URI:', import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI);
    console.log('VITE_AZURE_API_SCOPES:', import.meta.env.VITE_AZURE_API_SCOPES);
    console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
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
   * Get access token silently with circuit breaker
   */
  async getAccessToken(): Promise<string | null> {
    // Circuit breaker: prevent infinite token acquisition attempts
    const now = Date.now();
    if (this.tokenAcquisitionAttempts >= this.MAX_TOKEN_ATTEMPTS &&
      now - this.lastTokenFailure < this.TOKEN_COOLDOWN) {
      console.warn('Token acquisition in cooldown period, skipping attempt');
      return null;
    }

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

      // Reset failure counter on success
      this.tokenAcquisitionAttempts = 0;
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      this.tokenAcquisitionAttempts++;
      this.lastTokenFailure = now;

      // If we haven't exceeded max attempts, try interactive
      if (this.tokenAcquisitionAttempts < this.MAX_TOKEN_ATTEMPTS) {
        try {
          const response = await this.msalInstance.acquireTokenPopup(loginRequest);
          // Reset failure counter on success
          this.tokenAcquisitionAttempts = 0;
          return response.accessToken;
        } catch (interactiveError) {
          console.error('Failed to acquire token interactively:', interactiveError);
          this.tokenAcquisitionAttempts++;
          this.lastTokenFailure = Date.now();
          throw interactiveError;
        }
      }

      console.warn('Max token acquisition attempts exceeded, entering cooldown');
      throw error;
    }
  }

  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // const accessToken = await this.getAccessToken();
      // if (!accessToken) {
      //   return null;
      // }

      // const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      // }
      // const userData = await response.json();
      // return {
      //         id: curentLoginedUser?.idTokenClaims?.oid || '',
      //         displayName: userData.displayName,
      //         email: userData.mail || userData.userPrincipalName,
      //         givenName: userData.givenName,
      //         surname: userData.surname,
      //         jobTitle: userData.jobTitle,
      //         officeLocation: userData.officeLocation,
      //       };
      const curentLoginedUser = this.getCurrentAccount();
      if (!curentLoginedUser) {
        throw new Error(`Failed to fetch user profile`);
      }
      return {
        id: curentLoginedUser?.idTokenClaims?.oid || '',
        displayName: curentLoginedUser.name || '',
        email: curentLoginedUser.username,
        givenName: curentLoginedUser.name?.split(" ")[0],
        surname: curentLoginedUser.name?.split(" ")[1],
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