# JWT Authentication & Route Guards Implementation

## Overview
Implemented JWT-based authentication using Supabase Auth with TanStack Router guards to protect routes and manage user sessions.

## Configuration

### Environment Variables (`.env.example`)
```env
VITE_SUPABASE_URL=KEY
VITE_SUPABASE_ANON_KEY=KEY
VITE_JWT_SECRET=KEY
VITE_JWT_EXPIRATION_MINUTES=40
```

**Important Note on JWT Expiration**: 
- The actual JWT expiration (40 minutes) is controlled by **Supabase server settings**, not this environment variable
- `VITE_JWT_EXPIRATION_MINUTES` is for **reference/documentation only**
- To change the actual JWT expiration, you must update it in your Supabase project dashboard:
  - Go to: Authentication → Settings → JWT Expiry
  - Default is typically 3600 seconds (60 minutes)
  - Current setting: 2400 seconds (40 minutes)

## Route Protection Strategy

### Protected Routes (Require Authentication)
- **`/chats`** - Main chat interface
- **`/users`** - User management page
- All other private routes (add `beforeLoad` guard as needed)

### Public Routes (No Authentication Required)
- **`/health`** - Health check endpoint (explicitly left unguarded)

### Auth-Blocked Routes (Redirect if Already Authenticated)
- **`/login`** - Redirects to `/chats` if user is already logged in
- **`/register`** - Redirects to `/chats` if user is already logged in

## Implementation Details

### 1. Supabase Client Configuration
**File**: `src/supabase/supabase-api.tsx`

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const JWT_EXPIRATION_MINUTES = jwtExpirationMinutes;
```

**Features**:
- Auto-refresh tokens before expiration
- Persist session in localStorage
- Detect session from URL (for email confirmation links, etc.)

### 2. Route Guards (Reusable)

**Location**: `src/features/auth/guards/`

We've created reusable route guards to avoid code duplication:

#### `requireAuth` - For Protected Routes
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'

export const Route = createFileRoute('/chats/')({
  beforeLoad: requireAuth,  // ← One line!
  component: RouteComponent,
})
```

#### `requireGuest` - For Login/Register Pages
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { requireGuest } from '@/features/auth/guards'

export const Route = createFileRoute('/login/')({
  beforeLoad: requireGuest,  // ← One line!
  component: Login,
})
```

**Benefits:**
- ✅ Write guard logic once, use everywhere
- ✅ Consistent authentication checks across all routes
- ✅ Easy to maintain and update
- ✅ Type-safe with TypeScript

See `src/features/auth/guards/README.md` for detailed documentation.

### 3. Login Flow
**File**: `src/features/login/Login.tsx`

```typescript
const onSubmit = handleSubmit(async (values) => {
  const [result] = await Promise.all([
    login({ phone: values.phone, password: values.password }),
    new Promise(resolve => setTimeout(resolve, 3000))
  ])

  if (result) {
    // Redirect to chats immediately after successful login
    navigate({ to: '/chats' })
  }
})
```

**Flow**:
1. User submits login form
2. `useLogin` hook calls Supabase `signInWithPassword`
3. On success, Supabase stores session in localStorage
4. User is immediately redirected to `/chats`
5. Route guard validates session and allows access

### 4. Sign Out Utility
**File**: `src/features/auth/hooks/useSignOut.ts`

```typescript
export const useSignOut = () => {
  const navigate = useNavigate()
  
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate({ to: '/login' })
      return true
    }
    return false
  }, [navigate])

  return { signOut, loading, error }
}
```

**Usage in Components**:
```typescript
import { useSignOut } from '@/features/auth/hooks/useSignOut'

function MyComponent() {
  const { signOut, loading } = useSignOut()
  
  return (
    <button onClick={signOut} disabled={loading}>
      Sign Out
    </button>
  )
}
```

## Session Management

### How Sessions Work
1. **Login**: Supabase creates a session with access token and refresh token
2. **Storage**: Session is stored in localStorage (key: `sb-<project-ref>-auth-token`)
3. **Validation**: Route guards check session on every navigation
4. **Refresh**: Supabase automatically refreshes tokens before expiration
5. **Logout**: `signOut()` clears session from localStorage and server

### Session Persistence
- Sessions persist across browser refreshes
- Sessions expire after configured JWT expiration time (40 minutes, set in Supabase)
- Auto-refresh keeps users logged in as long as they're active
- Tokens are automatically refreshed before expiration if the user is active

## Security Considerations

### Current Implementation
✅ JWT tokens stored in localStorage (managed by Supabase)
✅ Automatic token refresh
✅ Route-level authentication guards
✅ Server-side session validation (Supabase)
✅ Protected routes redirect unauthenticated users
✅ Auth pages redirect authenticated users

### Production Recommendations
- [ ] Review JWT expiration setting in Supabase (currently 40 minutes)
- [ ] Consider adjusting to 60 minutes for production or lower for higher security
- [ ] Implement HTTPS in production
- [ ] Add rate limiting on auth endpoints
- [ ] Implement CSRF protection if needed
- [ ] Add session activity monitoring
- [ ] Implement "Remember Me" functionality if needed
- [ ] Add multi-factor authentication (MFA) support

## Testing the Implementation

### Manual Test Checklist

1. **Unauthenticated User**:
   - [ ] Accessing `/chats` redirects to `/login`
   - [ ] Accessing `/users` redirects to `/login`
   - [ ] Accessing `/health` works without authentication
   - [ ] Can access `/login` and `/register`

2. **Login Flow**:
   - [ ] Valid credentials log in successfully
   - [ ] After login, redirected to `/chats`
   - [ ] Session persists after page refresh
   - [ ] Invalid credentials show error message

3. **Authenticated User**:
   - [ ] Can access `/chats`
   - [ ] Can access `/users`
   - [ ] Accessing `/login` redirects to `/chats`
   - [ ] Accessing `/register` redirects to `/chats`
   - [ ] Can access `/health`

4. **Logout Flow**:
   - [ ] Sign out clears session
   - [ ] After logout, redirected to `/login`
   - [ ] Cannot access protected routes after logout

5. **Session Expiration**:
   - [ ] Session expires after 40 minutes (as configured in Supabase)
   - [ ] Expired session redirects to `/login`
   - [ ] Active users get auto-refreshed tokens before expiration

## Troubleshooting

### Common Issues

**Issue**: User stuck in redirect loop
- **Cause**: Session validation failing
- **Fix**: Clear localStorage and try logging in again

**Issue**: Session not persisting
- **Cause**: localStorage disabled or Supabase config issue
- **Fix**: Check browser settings and Supabase client config

**Issue**: Token expired too quickly
- **Cause**: JWT expiration set too low
- **Fix**: Adjust `VITE_JWT_EXPIRATION_MINUTES` in `.env`

**Issue**: Route guard not working
- **Cause**: Missing `beforeLoad` or incorrect session check
- **Fix**: Verify `beforeLoad` implementation in route file

## Future Enhancements

- [ ] Add `AuthProvider` context for component-level auth state
- [ ] Implement role-based access control (RBAC)
- [ ] Add session timeout warnings
- [ ] Implement "Remember Me" functionality
- [ ] Add social auth providers (Google, GitHub, etc.)
- [ ] Add email/password authentication alongside phone
- [ ] Implement password reset flow
- [ ] Add account verification flow
- [ ] Create auth middleware for API calls
- [ ] Add audit logging for auth events

## Files Modified/Created

### Modified
- `src/routes/chats/index.tsx` - Uses `requireAuth` guard
- `src/routes/users/index.tsx` - Uses `requireAuth` guard
- `src/routes/login/index.tsx` - Uses `requireGuest` guard
- `src/routes/register/index.tsx` - Uses `requireGuest` guard
- `src/features/login/Login.tsx` - Immediate redirect on successful login
- `src/supabase/supabase-api.tsx` - Added JWT config
- `.env.example` - Added JWT expiration setting (40 minutes)

### Created
- `src/features/auth/guards/requireAuth.ts` - Reusable auth guard for protected routes
- `src/features/auth/guards/requireGuest.ts` - Reusable guard for guest-only routes
- `src/features/auth/guards/index.ts` - Barrel export for guards
- `src/features/auth/guards/README.md` - Guard documentation
- `src/features/auth/hooks/useSignOut.ts` - Sign out utility hook
- `src/documents/AUTH_IMPLEMENTATION.md` - This documentation

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [TanStack Router Guards](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
