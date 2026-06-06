# Phase 1 - Authentication System - Technical Reference

Quick reference for the authentication system architecture and implementation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       App Component                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            AuthProvider (Context)                      │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Session Management                             │  │ │
│  │  │  - Initialize auth on mount                     │  │ │
│  │  │  - Listen to auth state changes                 │  │ │
│  │  │  - Auto-refresh tokens                          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Methods                                         │  │ │
│  │  │  - login()      - Sign in user                  │  │ │
│  │  │  - signup()     - Register new user             │  │ │
│  │  │  - logout()     - Sign out user                 │  │ │
│  │  │  - updateProfile() - Update user data           │  │ │
│  │  │  - refreshToken() - Renew access token         │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Router → Protected Routes                      │ │
│  │  - PublicRoute (redirects if logged in)               │ │
│  │  - ProtectedRoute (requires authentication)           │ │
│  │  - AdminRoute (requires admin role)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **AuthContext** (`src/context/AuthContext.tsx`)

```typescript
// Provides to entire app
{
  user: User | null                    // Current user profile
  authUser: AuthUser | null            // Supabase auth user
  isLoading: boolean                   // Auth state loading
  isAuthenticated: boolean             // User logged in
  userRole: 'admin' | 'user' | null   // User's role
  error: string | null                 // Last error message
  
  // Methods
  login: (credentials) => Promise<void>
  signup: (data) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data) => Promise<void>
  refreshToken: () => Promise<void>
}
```

### 2. **useAuth Hook** (`src/hooks/useAuth.ts`)

```typescript
// Use in any component
const { user, login, logout, isLoading } = useAuth();

// Helper hooks
const isAdmin = useIsAdmin();              // Check if admin
const isAuth = useIsAuthenticated();       // Check if logged in
const loading = useAuthLoading();          // Check if loading
```

### 3. **authService** (`src/services/authService.ts`)

```typescript
// Handles all auth operations with Supabase
authService.signup(data)           // Create new user account
authService.login(credentials)     // Sign in user
authService.logout()               // Sign out user
authService.getCurrentUser()       // Fetch current user
authService.refreshToken()         // Renew token
authService.updateProfile(id, data) // Update user profile
authService.isAdmin(userId)        // Check if user is admin
authService.verifyEmail(token)     // Verify email address
```

### 4. **Protected Routes** (`src/middleware/ProtectedRoute.tsx`)

```typescript
// Protect regular user routes
<ProtectedRoute>
  <HomePage />
</ProtectedRoute>

// Protect admin-only routes
<AdminRoute>
  <AdminDashboard />
</AdminRoute>

// Public routes that redirect if logged in
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

## Authentication Flow

### Signup Flow

```
User enters credentials
         ↓
validateForm()  ← Check format, strength
         ↓
authService.signup()
  ├─ Create Supabase Auth user
  ├─ Create custom user profile in DB
  └─ Return user + session
         ↓
AuthContext updates state
         ↓
Redirect to verification/dashboard
```

### Login Flow

```
User enters email + password
         ↓
validateForm()  ← Check format
         ↓
authService.login()
  ├─ Authenticate with Supabase
  ├─ Fetch user profile from DB
  ├─ Check if user is banned
  └─ Update last_login_at
         ↓
AuthContext updates state
         ↓
Redirect to appropriate dashboard
  ├─ Admin → /admin
  └─ User → /
```

### Auto-Refresh Flow

```
AuthProvider mounts
         ↓
getCurrentUser()  ← Check for existing session
         ↓
onAuthStateChange listener
  ├─ SIGNED_IN → Fetch user profile
  ├─ SIGNED_OUT → Clear state
  └─ TOKEN_REFRESHED → Update token
         ↓
Token expiry approaching (60 min)
         ↓
refreshToken()  ← Get new access token
         ↓
Update session (transparent to user)
```

## Database Tables

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,              -- Links to Supabase Auth
  email VARCHAR(255) UNIQUE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',  -- 'admin' or 'user'
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login_at TIMESTAMP
)

-- RLS Policies:
-- Users can view all profiles (but not sensitive data)
-- Users can only update their own profile
-- Admins can view and update any user
```

## Row-Level Security (RLS)

All access is enforced at the database level:

```sql
-- Example: Only admins can create games
CREATE POLICY "Only admins can create games" ON games
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Example: Users see only non-deleted, visible games
CREATE POLICY "Users can view visible games" ON games
  FOR SELECT USING (
    is_visible = TRUE AND is_deleted = FALSE
  );
```

**Security Layers:**

1. **Database Level**: RLS policies (cannot be bypassed)
2. **Service Level**: authService checks permissions
3. **Frontend Level**: ProtectedRoute components (UX convenience)

## Error Handling

### AuthError Class

```typescript
class AuthError extends Error {
  code: string;       // Error code (enum)
  statusCode?: number // HTTP status code
}

// Error codes:
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

### Error Flow

```
User Action
    ↓
Try block executes
    ↓
Error occurs
    ↓
Catch block
  ├─ Throw AuthError with code + message
  └─ AuthContext captures in 'error' state
    ↓
Component displays error message
```

## Security Practices

### ✅ Implemented

- [x] Passwords hashed by Supabase (bcrypt)
- [x] JWT tokens with 1-hour expiry
- [x] Row-Level Security on all tables
- [x] Input validation (email format, password strength)
- [x] Banned user detection at login
- [x] Last login tracking
- [x] Secure logout (session revocation)
- [x] Admin-only routes enforced
- [x] Error messages don't leak user existence

### 🔄 Coming Soon (Phase 4+)

- [ ] Two-Factor Authentication (2FA)
- [ ] Email verification requirement
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout with refresh
- [ ] Audit logging of all auth actions
- [ ] IP address tracking
- [ ] Device fingerprinting
- [ ] Suspicious activity detection

## Using the Auth System

### In Components

```typescript
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isLoading, error } = useAuth();
  const isAdmin = useIsAdmin();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (isAdmin) {
    return <AdminPanel />;
  }
  
  return (
    <div>
      {error && <ErrorAlert message={error} />}
      <p>Hello, {user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### In Services

```typescript
import { authService } from '@/services/authService';

// Check if user is admin
const isAdmin = await authService.isAdmin(userId);

// Update profile
const updated = await authService.updateProfile(userId, {
  bio: 'New bio',
  avatar_url: 'https://...'
});
```

## Testing

### Manual Testing Checklist

- [ ] Signup with valid credentials → Account created
- [ ] Signup with weak password → Error shown
- [ ] Signup with existing email → Error shown
- [ ] Login with correct credentials → Dashboard shown
- [ ] Login with wrong password → Error shown
- [ ] Admin login → Admin panel shown
- [ ] Regular user to /admin → Unauthorized page
- [ ] Logout → Redirected to login
- [ ] Token refresh → Silent renewal
- [ ] Session persistence → Login persists on reload

### API Testing

```bash
# Test signup
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Test login
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## Debugging

### Enable Debug Logs

```typescript
// In authService.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Auth action:', action);
  console.log('Response:', response);
}
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot read property 'id' of null" | User not fetched from DB after auth |
| "CORS error" | Missing Redirect URLs in Supabase settings |
| "Invalid credentials" | Check user exists in both Auth + users table |
| "RLS policy violation" | Verify policy allows the operation |
| "Session expired" | Token refresh failed - need manual login |

## Performance Optimization

- **Auth state cached** in context (not fetched every render)
- **Token refresh automatic** before expiry
- **Lazy loading** of protected components
- **Debounced validation** on form inputs
- **Memoized context** to prevent unnecessary re-renders

## Next Steps

1. **Phase 2**: UI Framework - Build components and design system
2. **Phase 3**: Public Platform - Game browsing and library management
3. **Phase 4**: Admin Panel - Game CRUD operations
4. **Phase 5**: Advanced Features - Search, notifications, analytics

---

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html)

