# Authentication Setup Guide

This guide explains how to use the authentication system with the protected `helloNameHandler` endpoint.

## Overview

The application uses [SuperTokens](https://supertokens.com/) for authentication with:
- **Email/Password** authentication
- **Session management** with secure cookies
- **Protected API endpoints** requiring authentication

## Quick Start

### 1. Start the Backend API

```bash
cd apps/api
pnpm dev
```

The API will run on `http://localhost:3000`

### 2. Start the Frontend

```bash
cd apps/web
pnpm dev
```

The web app will run on `http://localhost:5173`

### 3. Access the Application

1. Open `http://localhost:5173` in your browser
2. You'll see the authentication status at the top
3. Click **"Sign In / Sign Up"** to create an account or log in

## Using the Protected Endpoint

### Sign Up / Sign In Flow

1. Click the **"Sign In / Sign Up"** button
2. You'll be redirected to `/auth` route with the SuperTokens login form
3. Choose to either:
   - **Sign Up**: Enter email and password to create a new account
   - **Sign In**: Enter your existing credentials
4. After successful authentication, you'll be redirected back to the home page

### Accessing the Protected API

Once logged in:

1. You'll see a **✅ Logged in** status
2. Click the **"Fetch Personalized Greeting (Protected)"** button
3. The app will call the `/api/hello/me` endpoint with your authenticated session
4. You'll receive a personalized greeting using your email address

### Sign Out

Click the **"Sign Out"** button to end your session and clear cookies.

## Technical Details

### Backend (API)

#### Protected Route
- **Endpoint**: `GET /api/hello/me`
- **Handler**: `helloNameHandler` in [greeting.handler.ts](../apps/api/src/handlers/greeting.handler.ts)
- **Middleware**: `authMiddleware` validates the session
- **Authentication**: SuperTokens session cookies

#### How It Works

```typescript
// The protected handler receives an authenticated context
export const helloNameHandler = async (
  c: Context<{ Variables: AuthenticatedContext }>
) => {
  // User object is available from middleware
  const user = c.get("user");
  const displayName = user.getDisplayName();
  
  return c.json({
    message: `Hello ${displayName}! Welcome back.`,
    timestamp: new Date().toISOString(),
  });
};
```

### Frontend (React)

#### Key Components

1. **SuperTokens Configuration** ([supertokens.config.ts](../apps/web/src/supertokens.config.ts))
   - Initializes SuperTokens with EmailPassword recipe
   - Configures session management

2. **Authentication UI** ([main.tsx](../apps/web/src/main.tsx))
   - Routes authentication pages (`/auth`)
   - Wraps app with `SuperTokensWrapper` and `SessionAuth`

3. **Session Management** ([App.tsx](../apps/web/src/App.tsx))
   - Uses `useSessionContext()` to check authentication status
   - Displays login/logout buttons based on session state
   - Includes `credentials: "include"` in fetch requests for cookies

#### Protected API Call

```typescript
const fetchProtectedGreeting = async () => {
  const res = await fetch("/api/hello/me", {
    credentials: "include", // Include session cookies
  });
  
  if (res.status === 401) {
    setError("Not authenticated. Please log in.");
    return;
  }
  
  const data: HelloResponse = await res.json();
  setProtectedMessage(data.message);
};
```

## Environment Variables

### API (Optional)

Create `apps/api/.env` if you want to customize:

```bash
# SuperTokens Configuration
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
# SUPERTOKENS_API_KEY=  # For production

# Application domains
API_DOMAIN=http://localhost:3000
WEBSITE_DOMAIN=http://localhost:5173

# Environment
NODE_ENV=development
```

### Frontend (Optional)

Create `apps/web/.env` if needed:

```bash
VITE_API_DOMAIN=http://localhost:3000
VITE_WEBSITE_DOMAIN=http://localhost:5173
```

## API Endpoints

### Public Endpoints
- `GET /api/hello` - Public hello world endpoint

### Protected Endpoints (Require Authentication)
- `GET /api/hello/me` - Personalized greeting using authenticated user's name

### Authentication Endpoints (SuperTokens)
- `POST /auth/signup` - Create new account
- `POST /auth/signin` - Sign in with credentials
- `POST /auth/signout` - Sign out (revoke session)
- `GET /auth/session/refresh` - Refresh session token

## Troubleshooting

### "Not authenticated" Error

If you get a 401 error when calling the protected endpoint:
1. Make sure you're signed in (check the authentication status)
2. Verify cookies are enabled in your browser
3. Check that both API and frontend are running
4. Clear cookies and sign in again

### CORS Issues

The Vite dev server proxies `/api` and `/auth` requests to the backend, so CORS shouldn't be an issue in development.

### Session Not Persisting

SuperTokens uses httpOnly cookies for security. Make sure:
- Your browser accepts cookies
- You're using the same domain for both frontend and backend (localhost)
- The `credentials: "include"` option is set in fetch requests

## Next Steps

- Add password reset functionality
- Implement email verification
- Add third-party authentication (Google, GitHub, etc.)
- Add user profile management
- Implement role-based access control (RBAC)

## Resources

- [SuperTokens Documentation](https://supertokens.com/docs/guides)
- [SuperTokens React SDK](https://supertokens.com/docs/emailpassword/quick-setup/frontend)
- [Hono Documentation](https://hono.dev/)
