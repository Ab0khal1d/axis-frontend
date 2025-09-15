# Microsoft Authentication Setup Guide

This application uses Microsoft Azure AD for authentication. Follow the steps below to configure authentication in your environment.

## 🔧 Prerequisites

1. **Azure Active Directory Tenant**: You need an Azure AD tenant. If you don't have one, create a free Azure account.
2. **Application Registration**: Register your application in Azure AD.

## 📋 Azure AD App Registration Steps

### 1. Register Your Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Your application name (e.g., "LinkWay Chat App")
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: Select "Single-page application (SPA)" and enter `http://localhost:5174`
5. Click **Register**

### 2. Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Redirect URIs**, ensure you have:
   - `http://localhost:5174` (for development)
   - Your production URL (when deployed)
3. Under **Implicit grant and hybrid flows**, check:
   - ✅ **Access tokens**
   - ✅ **ID tokens**
4. Click **Save**

### 3. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `User.Read` (to read user profile)
6. Click **Grant admin consent** if you're an admin

### 4. Get Configuration Values

From your app registration overview page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## 🔐 Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Azure AD values:
   ```env
   # Microsoft Azure AD Application Configuration
   VITE_AZURE_CLIENT_ID=your-actual-client-id-here
   VITE_AZURE_TENANT_ID=your-actual-tenant-id-here
   VITE_AZURE_REDIRECT_URI=http://localhost:5174
   VITE_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/login
   
   # Microsoft Graph API Scopes
   VITE_AZURE_GRAPH_SCOPES=User.Read
   
   # Environment Configuration
   VITE_NODE_ENV=development
   ```

## 🚀 Available Authentication Features

### Login Flow
- **Popup Authentication**: Default method with smooth UX
- **Redirect Authentication**: Alternative method (can be configured)
- **Loading States**: Visual feedback during authentication
- **Error Handling**: Comprehensive error messages

### User Profile
- **Display Name**: User's full name
- **Email**: User's email address
- **Additional Info**: Job title, office location (if available)

### Protected Routes
- Automatic redirection to login for unauthenticated users
- Session management with token refresh
- Secure logout with session cleanup

### State Management
- Redux integration for authentication state
- Persistent authentication across page refreshes
- Loading and error states management

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔒 Security Features

- **Token Management**: Automatic token refresh
- **Secure Storage**: Session storage for tokens
- **CSRF Protection**: Built-in MSAL protection
- **Scope Validation**: Minimal required permissions
- **Logout Protection**: Complete session cleanup

## 📱 Usage Examples

### Programmatic Authentication
```typescript
import { authService } from './features/auth/services/authService';

// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Get user profile
const userProfile = await authService.getUserProfile();

// Sign out
await authService.signOut();
```

### Redux Integration
```typescript
import { useAppDispatch, useAppSelector } from './redux/hook';
import { signInPopup, selectIsAuthenticated, selectUser } from './features/auth';

const LoginComponent = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const handleLogin = () => {
    dispatch(signInPopup());
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.displayName}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

## 🚨 Common Issues & Solutions

### Issue: "AADSTS50011: The reply URL specified in the request does not match..."
**Solution**: Ensure the redirect URI in Azure AD matches exactly with your local development URL.

### Issue: "AADSTS700054: response_type 'id_token' is not enabled for the application"
**Solution**: Enable ID tokens in Azure AD Authentication settings.

### Issue: Login popup blocked
**Solution**: Allow popups for your development domain or use redirect flow instead.

## 🔄 Production Deployment

1. Update redirect URIs in Azure AD to include production URLs
2. Update environment variables for production
3. Ensure HTTPS is enabled for production domains
4. Configure proper CORS settings

## 📞 Support

For authentication issues:
1. Check browser console for detailed error messages
2. Verify Azure AD configuration matches the guide
3. Ensure environment variables are correctly set
4. Check network connectivity and firewall settings

---

**Note**: Keep your client secrets secure and never commit them to version control. The `.env` file is already included in `.gitignore` for security.