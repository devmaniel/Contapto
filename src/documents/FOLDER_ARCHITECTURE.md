# Project Architecture & Separation of Concerns

## Overview

This project follows a **feature-based modular architecture** with a clear separation between feature-specific code and shared/reusable components. This approach ensures scalability, maintainability, and prevents code duplication.

---

## Directory Structure

```
src/
├── features/          # Feature-specific components, hooks, and logic
├── shared/            # Reusable components, layouts, and utilities
├── domain/            # Domain models and types
├── routes/            # Route definitions
├── middleware/        # Middleware functions
├── lib/               # Utility functions
├── assets/            # Static assets
└── documents/         # Documentation
```

---

## 1. Features Directory (`/src/features`)

### Purpose
The **features** directory contains all **feature-specific code** that is NOT shared across the application. Each feature is self-contained and should only be used by its corresponding route or page.

### Structure
Each feature folder contains:
- **Components**: UI components specific to that feature
- **Hooks**: Custom React hooks for feature logic
- **Types**: TypeScript types/interfaces specific to the feature
- **Utils**: Helper functions specific to the feature
- **Styles**: Feature-specific styling (if needed)

### Current Features

#### `auth/`
- **Purpose**: Authentication-related logic (login, logout, session management)
- **Components**: Auth-specific components
- **Hooks**: `useAuth()`, `useSession()`
- **Scope**: Only used by login/register routes

#### `login/`
- **File**: `Login.tsx`
- **Purpose**: Login page component with form handling
- **Specific Logic**:
  - Phone number validation
  - Password submission
  - Error handling
  - Navigation to users page
- **Dependencies**: Uses shared UI components (Button, Card, Input, Field)
- **Scope**: Only used by `/login` route

#### `register/`
- **File**: `Register.tsx`
- **Purpose**: User registration page
- **Specific Logic**: Registration form with validation
- **Scope**: Only used by `/register` route

#### `chats/`
- **File**: `ChatsIndexPage.tsx`
- **Purpose**: Chat messaging interface
- **Specific Logic**:
  - Chat list management
  - Search functionality
  - Message display
  - New chat creation
- **Scope**: Only used by `/chats` route

#### `user/`
- **File**: `UserViewPage.tsx`
- **Purpose**: User profile/view page
- **Scope**: Only used by `/users` route

#### `health/`
- **Purpose**: Health check or status monitoring
- **Scope**: Feature-specific logic

#### `test/`
- **Purpose**: Testing components and utilities
- **Files**: `TestIndex.tsx`, `index.tsx`
- **Scope**: Development/testing only

### Best Practices for Features

✅ **DO:**
- Keep all feature logic contained within the feature folder
- Import shared components from `/shared`
- Create custom hooks for complex state management
- Use TypeScript interfaces for type safety
- Keep components focused and single-responsibility

❌ **DON'T:**
- Import from other feature folders
- Create generic components that could be shared
- Mix feature logic with shared utilities
- Create duplicate components across features

---

## 2. Shared Directory (`/src/shared`)

### Purpose
The **shared** directory contains **reusable components and layouts** that are used across multiple features. This includes:
- UI components from shadcn/ui
- Custom shared components
- Layout templates
- Common utilities

### Structure

#### `components/ui/`
**shadcn/ui Components** - Pre-built, accessible UI components:
- `button.tsx` - Reusable button component
- `card.tsx` - Card container component
- `input.tsx` - Input field component
- `field.tsx` - Form field wrapper
- `label.tsx` - Form label component
- `form.tsx` - Form management
- `accordion.tsx` - Accordion component
- `alert.tsx` - Alert/notification component
- `alert-dialog.tsx` - Alert dialog component
- `badge.tsx` - Badge/tag component
- `separator.tsx` - Visual separator
- `spinner.tsx` - Loading spinner
- `table.tsx` - Table component

#### `components/`
**Custom Shared Components**:
- `login-form.tsx` - Reusable login form component (can be used in multiple places)
- `navbar.tsx` - Navigation bar used across pages
- `layout.tsx` - Common layout wrapper

#### `layouts/`
**Layout Templates**:
- `Layout1.tsx` - Primary layout template with navigation and structure

### Best Practices for Shared Components

✅ **DO:**
- Create components that are used in 2+ features
- Use shadcn/ui components as the base
- Make components highly configurable via props
- Document component props and usage
- Keep components generic and reusable

❌ **DON'T:**
- Add feature-specific logic to shared components
- Create components that are only used once
- Hardcode feature-specific data
- Mix multiple concerns in one component

---

## 3. Domain Directory (`/src/domain`)

### Purpose
Contains **domain models and types** that represent core business entities.

### Current Models
- `UserModel.tsx` - User entity and related types
- `AppWalletModel.tsx` - Wallet/app-specific model

### Usage
- Import domain models in features that need them
- Use for type definitions and interfaces
- Share across features when needed

---

## 4. Routes Directory (`/src/routes`)

### Purpose
Contains **route-level pages** that compose features and shared components.

### Structure
Each route file:
1. Imports the corresponding feature component
2. Wraps it with shared layouts if needed
3. Handles route-specific logic

### Example Pattern
```tsx
// /src/routes/login/index.tsx
import Login from '@/features/login/Login'

export default function LoginRoute() {
  return <Login />
}
```

---

## 5. Import Patterns

### Feature-to-Shared (✅ Allowed)
```tsx
// In /src/features/login/Login.tsx
import { Button } from '@/shared/components/ui/button'
import Layout1 from '@/shared/layouts/Layout1'
```

### Feature-to-Feature (❌ Not Allowed)
```tsx
// DON'T DO THIS:
import { SomeComponent } from '@/features/chats/SomeComponent'
```

### Shared-to-Feature (❌ Not Allowed)
```tsx
// DON'T DO THIS:
import { LoginComponent } from '@/features/login/Login'
```

### Route-to-Feature (✅ Allowed)
```tsx
// In /src/routes/login/index.tsx
import Login from '@/features/login/Login'
```

---

## 6. Adding New Features

### Step 1: Create Feature Folder
```
src/features/my-feature/
├── components/
│   └── MyComponent.tsx
├── hooks/
│   └── useMyHook.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
└── index.ts (export main component)
```

### Step 2: Create Route
```
src/routes/my-feature/
└── index.tsx (imports and renders feature)
```

### Step 3: Import Shared Components
```tsx
import { Button } from '@/shared/components/ui/button'
import Layout1 from '@/shared/layouts/Layout1'
```

### Step 4: Keep It Isolated
- Don't import from other features
- Don't create shared components yet (wait until 2+ features need it)

---

## 7. Adding Shared Components

### When to Create a Shared Component
- Component is used in **2 or more features**
- Component is generic and reusable
- Component doesn't contain feature-specific logic

### Process
1. Create component in `/src/shared/components/`
2. Export from appropriate index file
3. Document props and usage
4. Update features to import from shared

### Example
```tsx
// /src/shared/components/my-shared-button.tsx
interface MySharedButtonProps {
  variant?: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export function MySharedButton({ variant = 'primary', ...props }: MySharedButtonProps) {
  // Implementation
}
```

---

## 8. Benefits of This Architecture

| Benefit | Explanation |
|---------|-------------|
| **Scalability** | Easy to add new features without affecting existing code |
| **Maintainability** | Clear separation makes code easier to understand and modify |
| **Reusability** | Shared components reduce duplication |
| **Testability** | Isolated features are easier to test |
| **Collaboration** | Multiple developers can work on different features independently |
| **Code Organization** | Clear structure makes navigation easier |
| **Performance** | Code splitting by feature is possible |

---

## 9. Common Patterns

### Pattern 1: Feature with Custom Hook
```tsx
// /src/features/my-feature/hooks/useMyFeature.ts
export function useMyFeature() {
  const [state, setState] = useState()
  // Feature-specific logic
  return { state, setState }
}

// /src/features/my-feature/MyFeature.tsx
import { useMyFeature } from './hooks/useMyFeature'
export function MyFeature() {
  const { state } = useMyFeature()
  return <div>{state}</div>
}
```

### Pattern 2: Shared Component with Props
```tsx
// /src/shared/components/my-shared.tsx
interface MySharedProps {
  title: string
  onAction: () => void
}

export function MyShared({ title, onAction }: MySharedProps) {
  return <button onClick={onAction}>{title}</button>
}

// Usage in any feature
import { MyShared } from '@/shared/components/my-shared'
<MyShared title="Click me" onAction={() => {}} />
```

### Pattern 3: Feature Using Domain Model
```tsx
// /src/features/user/UserProfile.tsx
import { UserModel } from '@/domain/UserModel'
import { Button } from '@/shared/components/ui/button'

export function UserProfile() {
  const user: UserModel = { /* ... */ }
  return <div>{user.name}</div>
}
```

---

## 10. Summary

| Directory | Purpose | Shared? | Imports From |
|-----------|---------|---------|--------------|
| `/features` | Feature-specific code | ❌ No | `/shared`, `/domain`, `/lib` |
| `/shared` | Reusable components | ✅ Yes | `/lib`, external packages |
| `/domain` | Business models | ✅ Yes | External packages |
| `/routes` | Page routing | N/A | `/features`, `/shared` |
| `/lib` | Utilities | ✅ Yes | External packages |

This architecture ensures clean code, easy maintenance, and scalability as your project grows.
