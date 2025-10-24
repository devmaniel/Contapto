# Route Guards

Reusable authentication guards for TanStack Router routes.

## Available Guards

### `requireAuth`
Protects routes that require authentication. Redirects to `/login` if user is not authenticated.

**Usage:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import MyProtectedPage from './MyProtectedPage'

export const Route = createFileRoute('/protected-page/')({
  beforeLoad: requireAuth,
  component: MyProtectedPage,
})
```

**What it does:**
- Checks if user has an active session
- If NO session → redirects to `/login`
- If session exists → allows access and returns session data

**Returns:**
```typescript
{ session: Session }
```

---

### `requireGuest`
Protects routes that should only be accessible to non-authenticated users (e.g., login, register pages). Redirects to `/chats` if user is already authenticated.

**Usage:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { requireGuest } from '@/features/auth/guards'
import Login from './Login'

export const Route = createFileRoute('/login/')({
  beforeLoad: requireGuest,
  component: Login,
})
```

**What it does:**
- Checks if user has an active session
- If session exists → redirects to `/chats`
- If NO session → allows access

---

## Examples

### Protected Route (Requires Auth)
```typescript
// src/routes/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import Dashboard from '@/features/dashboard/Dashboard'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: requireAuth,
  component: Dashboard,
})
```

### Guest-Only Route (Login/Register)
```typescript
// src/routes/login/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireGuest } from '@/features/auth/guards'
import Login from '@/features/login/Login'

export const Route = createFileRoute('/login/')({
  beforeLoad: requireGuest,
  component: Login,
})
```

### Public Route (No Guard)
```typescript
// src/routes/health/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import HealthPage from '@/features/health'

export const Route = createFileRoute('/health/')({
  // No beforeLoad guard - accessible to everyone
  component: HealthPage,
})
```

---

## Current Route Protection

| Route | Guard | Behavior |
|-------|-------|----------|
| `/chats` | `requireAuth` | Requires login, redirects to `/login` if not authenticated |
| `/users` | `requireAuth` | Requires login, redirects to `/login` if not authenticated |
| `/login` | `requireGuest` | Guest only, redirects to `/chats` if authenticated |
| `/register` | `requireGuest` | Guest only, redirects to `/chats` if authenticated |
| `/health` | None | Public, accessible to everyone |

---

## Adding Guards to New Routes

### For Protected Routes
1. Import `requireAuth` from `@/features/auth/guards`
2. Add `beforeLoad: requireAuth` to route config

```typescript
import { requireAuth } from '@/features/auth/guards'

export const Route = createFileRoute('/new-protected-page/')({
  beforeLoad: requireAuth,  // ← Add this line
  component: NewProtectedPage,
})
```

### For Guest-Only Routes
1. Import `requireGuest` from `@/features/auth/guards`
2. Add `beforeLoad: requireGuest` to route config

```typescript
import { requireGuest } from '@/features/auth/guards'

export const Route = createFileRoute('/forgot-password/')({
  beforeLoad: requireGuest,  // ← Add this line
  component: ForgotPassword,
})
```

### For Public Routes
Simply don't add any `beforeLoad` guard.

---

## Benefits

✅ **DRY (Don't Repeat Yourself)**: Write the guard logic once, use everywhere
✅ **Consistency**: All routes use the same authentication logic
✅ **Maintainability**: Update auth logic in one place
✅ **Type Safety**: TypeScript ensures correct usage
✅ **Easy to Use**: Just one line in route config

---

## Implementation Details

Both guards use:
- `supabase.auth.getSession()` to check authentication status
- `redirect()` from TanStack Router to handle navigation
- Async functions to support server-side rendering if needed

The guards are located in:
```
src/features/auth/guards/
├── requireAuth.ts    # Protect authenticated routes
├── requireGuest.ts   # Protect guest-only routes
├── index.ts          # Barrel export
└── README.md         # This file
```
