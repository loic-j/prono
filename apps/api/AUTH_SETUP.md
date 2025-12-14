# SuperTokens Authentication Setup

## ✅ Authentication Implementation Complete!

Your application now has full authentication support using SuperTokens with:
- ✅ Email/Password authentication
- ✅ Google OAuth (configurable)
- ✅ Protected routes
- ✅ Session management
- ✅ Clean architecture pattern

## 🚀 Quick Start

### 1. Using SuperTokens Demo Mode (No Configuration Required)

The app is already configured to use SuperTokens' demo server. Just start your application:

```bash
cd /Users/loicj/dev/perso/prono/apps/api
pnpm dev
```

The API will be available at `http://localhost:3000`

### 2. For Production: Set Up Your Own SuperTokens Instance

Create a `.env` file in `apps/api/`:

```bash
# SuperTokens Configuration
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
SUPERTOKENS_API_KEY=your_api_key

# Application URLs
API_DOMAIN=http://localhost:3000
WEBSITE_DOMAIN=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NODE_ENV=development
PORT=3000
```

To get your SuperTokens API key:
1. Visit https://supertokens.com/dashboard
2. Sign up for free (5,000 MAU free tier)
3. Create a new app
4. Copy your Connection URI and API Key

## 📡 Available Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/hello` - Public greeting
- `GET /docs` - API documentation

### Authentication Endpoints (SuperTokens Auto-Generated)

- `POST /auth/signup` - Email/password signup
- `POST /auth/signin` - Email/password signin
- `POST /auth/signout` - Sign out
- `POST /auth/signinup` - Third-party sign in/up (Google)
- `POST /auth/user/password/reset/token` - Password reset
- `POST /auth/user/email/verify/token` - Email verification
- And many more...

### Custom Auth Endpoints

- `GET /auth/user` - Get current user info (protected)
- `POST /auth/signout` - Custom sign out endpoint

### Protected Endpoints

- `GET /api/hello/me` - **Protected** - Returns personalized greeting with logged-in user's name

## 🧪 Testing Authentication

### 1. Sign Up a New User

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "formFields": [
      {"id": "email", "value": "test@example.com"},
      {"id": "password", "value": "password123"}
    ]
  }' \
  -c cookies.txt
```

### 2. Sign In

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "formFields": [
      {"id": "email", "value": "test@example.com"},
      {"id": "password", "value": "password123"}
    ]
  }' \
  -c cookies.txt
```

### 3. Access Protected Endpoint

```bash
curl http://localhost:3000/api/hello/me \
  -b cookies.txt
```

Expected response:
```json
{
  "message": "Hello test! Welcome back.",
  "timestamp": "2025-12-14T..."
}
```

### 4. Get Current User

```bash
curl http://localhost:3000/auth/user \
  -b cookies.txt
```

Expected response:
```json
{
  "id": "...",
  "email": "test@example.com",
  "displayName": "test",
  "timeJoined": "2025-12-14T...",
  "isVerified": false
}
```

### 5. Sign Out

```bash
curl -X POST http://localhost:3000/auth/signout \
  -b cookies.txt
```

## 🏗️ Architecture

The authentication follows clean architecture principles:

```
domain/
├── user.entity.ts          # User domain entity with business rules
├── auth.interface.ts       # IAuthService port (interface)
└── index.ts

infra/supertokens/
├── config.ts               # SuperTokens initialization
├── auth.adapter.ts         # Implements IAuthService (adapter)
└── index.ts

handlers/
├── auth.handler.ts         # Auth request handlers
└── greeting.handler.ts     # Updated to use auth

routes/
├── auth.routes.ts          # Auth endpoints
└── greeting.routes.ts      # Protected greeting endpoint

utils/
└── auth.middleware.ts      # Auth middleware for protecting routes
```

## 🔐 Adding Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:3000/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env` file

## 🌐 Frontend Integration

To integrate with your React frontend (`apps/web`), install SuperTokens:

```bash
cd apps/web
pnpm add supertokens-auth-react
```

Then configure the frontend SDK to connect to your API at `http://localhost:3000/auth`.

## 📚 Next Steps

1. **Frontend UI**: Add SuperTokens pre-built UI components to your React app
2. **Email Verification**: Configure email service for verification
3. **Password Reset**: Set up SMTP for password reset emails
4. **More Providers**: Add GitHub, Apple, Facebook authentication
5. **Self-Hosting**: Set up your own SuperTokens core for full control
6. **User Management**: Create admin endpoints to manage users

## 🔗 Useful Links

- [SuperTokens Documentation](https://supertokens.com/docs/guides)
- [Hono Framework](https://hono.dev/)
- [API Documentation](http://localhost:3000/docs) (when server is running)

## ✨ What Changed

- **Protected Route**: `GET /api/hello/me` now requires authentication and uses the logged-in user's name
- **New Domain Layer**: User entity and auth interface define business rules
- **Infrastructure Adapter**: SuperTokens implementation is isolated and can be swapped
- **Auth Middleware**: Reusable middleware for protecting any route
- **Session Management**: Automatic cookie-based session handling
