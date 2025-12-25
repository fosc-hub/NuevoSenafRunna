# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev              # Starts Next.js dev server at http://localhost:3000

# Build and production
npm run build            # Production build (note: TypeScript errors are ignored in build)
npm start                # Start production server

# Code quality
npm run lint             # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14.2 (App Router)
- **UI Library**: Material-UI (MUI) v6 with Emotion styling
- **State Management**:
  - Zustand for global state
  - TanStack Query (React Query) for server state
  - React Hook Form with Zod validation for forms
- **HTTP Client**: Axios with custom interceptors
- **Authentication**: JWT-based (httpOnly cookies)
- **Styling**: Tailwind CSS + MUI

### Project Structure

```
src/
├── app/
│   ├── (runna)/              # Protected routes with Navbar layout
│   │   ├── demanda/          # Demanda management
│   │   ├── evaluacion/       # Evaluation system
│   │   ├── legajo/           # Case file management (core feature)
│   │   ├── legajo-mesa/      # Case file inbox
│   │   ├── mesadeentrada/    # Entry desk
│   │   └── nuevoingreso/     # New entry registration
│   ├── api/
│   │   ├── apiService.ts     # Generic CRUD operations (get, create, update, patch, put, remove)
│   │   └── utils/
│   │       ├── axiosInstance.ts  # Axios instance with JWT interceptors
│   │       └── errorHandler.ts   # Centralized error handling
│   ├── interfaces/           # TypeScript interfaces for domain models
│   ├── login/                # Login page (public route)
│   └── layout.tsx            # Root layout with ToastContainer + ReactQueryProvider
├── components/
│   ├── evaluacion/           # Evaluation-specific components
│   ├── forms/                # Reusable form components
│   ├── layoutComponents/     # Layout components (Navbar, etc.)
│   └── searchModal/          # Search modal components
├── features/
│   └── legajo/               # Feature-based organization for case files
│       ├── api/              # Feature-specific API services
│       ├── components/       # Feature-specific components
│       ├── hooks/            # Feature-specific hooks
│       └── types/            # Feature-specific TypeScript types
└── utils/
    ├── auth/                 # Server-side auth utilities (login, getSession, logout)
    └── providers/            # React context providers
```

### Key Architectural Patterns

#### 1. API Layer (`src/app/api/apiService.ts`)
Generic CRUD functions for all API operations:
- `get<T>()` - Fetch resources with optional filters
- `getWithCustomParams<T>()` - Supports both query params and path params
- `create<T>()` - POST with optional toast notification
- `update<T>()` - PATCH with optional toast notification
- `put<T>()` - PUT with optional toast notification
- `patch<T>()` - PATCH without toast
- `remove()` - DELETE operation

**Usage Pattern:**
```typescript
import { get, create, update } from '@/app/api/apiService'

// Fetching data
const users = await get<User[]>('users/')

// Creating with toast
const newUser = await create<User>('users/', userData, true, 'User created!')

// Updating
const updatedUser = await update<User>('users/', userId, updates, true)
```

#### 2. Authentication Flow
- **Server Actions**: `login()`, `getSession()`, `logout()` in `src/utils/auth/`
- **Token Storage**: httpOnly cookies (accessToken, refreshToken)
- **Auto-refresh**: Handled in `getSession()` when token expires
- **Request Interceptor**: Automatically adds `Bearer ${token}` to all axios requests
- **User Data**: `getSession(true)` returns user data with permissions

#### 3. Feature-Based Organization (`src/features/legajo/`)
The `legajo` (case file) feature demonstrates the preferred pattern:
- **api/**: Service functions for API calls specific to this feature
- **components/**: React components used only in this feature
- **hooks/**: Custom hooks (e.g., `useCreateLegajo`, `useSearchNnya`)
- **types/**: TypeScript interfaces and types

This pattern should be followed for new major features.

#### 4. Route Groups
- **(runna)**: Protected routes with Navbar layout
- **login**: Public route without layout
- Root pages inherit from root layout

#### 5. State Management Patterns
- **Server State**: TanStack Query for data fetching and caching
- **Global State**: Zustand stores (e.g., user permissions)
- **Form State**: React Hook Form + Zod schemas
- **Local State**: useState for component-local state

#### 6. Toast Notifications
- Global ToastContainer in root layout
- Import from 'react-toastify'
- API service functions accept `showToast` parameter
- Custom error toasts via `showErrorToast` utility

## Important Configuration Details

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL (defaults to Railway deployment)
- `JWT_SECRET`: Secret for JWT verification (server-side only)

### Next.js Configuration
- **TypeScript Build Errors**: Ignored (`ignoreBuildErrors: true`) - Fix this in production
- **ESM Externals**: Set to 'loose' for compatibility
- **Images**: Unoptimized set to false (optimization enabled)

### Path Aliases
Use `@/` for imports from `src/`:
```typescript
import { get } from '@/app/api/apiService'
import Navbar from '@/components/layoutComponents/Navbar'
```

### MCP Servers Configured

#### MUI MCP Server
The MUI MCP server provides access to Material-UI documentation, component APIs, and best practices.

**Capabilities:**
- Official MUI v6 component documentation
- API reference for components, hooks, and utilities
- Pattern guidance for common MUI use cases
- Theme customization examples
- Accessibility best practices

**When to Use:**
- Looking up MUI component props and APIs
- Understanding MUI theming and customization
- Finding MUI patterns for complex UI components
- Checking MUI best practices for accessibility
- Exploring MUI hook usage (useTheme, useMediaQuery, etc.)

**Example Queries:**
```
"How do I use MUI DataGrid with server-side pagination?"
"What are the props for MUI DatePicker?"
"How to customize MUI theme colors?"
"MUI form validation with TextField"
```

**Integration with Codebase:**
This project uses MUI v6 with:
- `@mui/material` - Core components
- `@mui/x-data-grid` - DataGrid component
- `@mui/x-date-pickers` - Date/Time pickers
- `@mui/lab` - Lab components
- `@emotion/react` and `@emotion/styled` - Styling solution

**Best Practices:**
- Always check MUI MCP before creating custom components that MUI provides
- Use MUI components for complex UI (modals, tables, date pickers, autocomplete)
- Combine MUI with Tailwind for layout and spacing utilities
- Reference MUI MCP for proper TypeScript typing of component props

## React/Next.js Best Practices for This Codebase

### 1. Server vs Client Components
- **Default to Server Components** for data fetching and layouts
- **Use "use client"** directive only when needed:
  - Interactive components (forms, modals, buttons with onClick)
  - React hooks (useState, useEffect, custom hooks)
  - Browser APIs (window, document)
  - TanStack Query hooks

### 2. Data Fetching Patterns
**Preferred**: TanStack Query for client-side data fetching
```typescript
import { useQuery } from '@tanstack/react-query'
import { get } from '@/app/api/apiService'

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => get<User[]>('users/')
})
```

**Server Components**: Direct async/await in component
```typescript
async function UsersPage() {
  const users = await get<User[]>('users/')
  return <UserList users={users} />
}
```

### 3. Form Handling
Use React Hook Form + Zod validation:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
})

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

### 4. Error Handling
- API errors are handled globally by axios interceptors
- Use `handleApiError` from `@/app/api/utils/errorHandler`
- API service functions throw errors that should be caught in components
- Display errors via toast notifications

### 5. Authentication Guards
- Check authentication in Server Components: `await getSession()`
- Redirect to `/login` if no session
- Access token is automatically added to requests by axios interceptor

### 6. TypeScript Usage
- Interfaces are in `src/app/interfaces/` for domain models
- Feature-specific types in `src/features/[feature]/types/`
- Generic types with API functions: `get<User[]>('users/')`
- ESLint rules allow `any` and unused vars as warnings (not errors)

### 7. Styling Conventions
- **Primary**: Tailwind utility classes
- **Components**: MUI components for complex UI (DataGrid, DatePickers, Modals)
- **Avoid**: Inline styles when possible
- **Theme**: MUI theme customization available via `@emotion/react`

### 8. File Naming
- Components: PascalCase (e.g., `UserList.tsx`)
- Utilities/Services: camelCase (e.g., `apiService.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useCreateLegajo.ts`)
- Types: kebab-case or camelCase with `.types.ts` suffix

## Code Reuse and DRY Principles

### Critical Rule: Search Before Creating
**ALWAYS search for existing implementations before writing new code:**

```bash
# Search for existing components
grep -r "ComponentName" src/components/
find src -name "*Modal*" -o -name "*Form*"

# Search for similar hooks
find src -name "use*.ts"
grep -r "useQuery" src/

# Search for API service patterns
grep -r "endpoint-name" src/
```

### 1. Component Reuse Strategy

#### Before Creating a New Component:
1. **Check `src/components/`** - Shared components library
2. **Check `src/features/[feature]/components/`** - Feature-specific components that might be generalizable
3. **Search by functionality** - Use grep/find to locate similar patterns
4. **Evaluate for extraction** - If code exists in 2+ places, extract to shared component

#### Component Location Decision Tree:
```
Is it used in multiple features?
├─ YES → src/components/ (make it generic and reusable)
└─ NO → Is it specific to one feature?
    ├─ YES → src/features/[feature]/components/
    └─ NO → Keep in page/route directory (single use)
```

#### Example: Reusing Form Components
```typescript
// ❌ DON'T: Create duplicate form fields
const CustomTextField = () => { /* ... */ }

// ✅ DO: Check src/components/forms/ first
import { TextField } from '@/components/forms/TextField'

// ✅ DO: Use MUI MCP to find existing MUI components
// Query: "MUI TextField component props and usage"
import { TextField } from '@mui/material'

// ✅ DO: Compose from MUI components if no custom component exists
import { TextField, Select, Autocomplete } from '@mui/material'
```

### 2. Custom Hooks Reuse

#### Existing Hook Patterns:
- **Data fetching hooks** in `src/features/legajo/hooks/`:
  - `useCreateLegajo` - Creating case files
  - `useSearchNnya` - Searching children records
  - `useMedidaDetail` - Fetching measure details
  - `useActividadActions` - Activity CRUD operations

#### When to Create vs Reuse:
```typescript
// ❌ DON'T: Duplicate TanStack Query logic
const useGetUsers = () => {
  const [users, setUsers] = useState([])
  useEffect(() => {
    get<User[]>('users/').then(setUsers)
  }, [])
  return users
}

// ✅ DO: Use standard TanStack Query pattern
const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => get<User[]>('users/')
  })
}

// ✅ BETTER: Extract to shared hook if used 3+ times
// src/hooks/useGenericQuery.ts
const useGenericQuery = <T>(endpoint: string, key: string[]) => {
  return useQuery({
    queryKey: key,
    queryFn: () => get<T>(endpoint)
  })
}
```

### 3. API Service Reuse (Critical)

**NEVER duplicate CRUD operations** - Use `apiService.ts`:

```typescript
// ❌ DON'T: Create custom fetch functions
const fetchUsers = async () => {
  const response = await axios.get('/api/users/')
  return response.data
}

// ✅ DO: Use generic API service
import { get } from '@/app/api/apiService'
const users = await get<User[]>('users/')

// ❌ DON'T: Write custom create/update logic
const createUser = async (data: User) => {
  const response = await axiosInstance.post('/api/users/', data)
  toast.success('User created!')
  return response.data
}

// ✅ DO: Use built-in create with toast
import { create } from '@/app/api/apiService'
const newUser = await create<User>('users/', data, true, 'User created!')
```

### 4. Utility Function Reuse

#### Existing Utilities to Reuse:
- **Error handling**: `handleApiError` from `@/app/api/utils/errorHandler`
- **Toast notifications**: `showErrorToast` from `@/utils/showErrorToast`
- **Error messages**: `errorMessages` from `@/utils/errorMessages`
- **Authentication**: All auth functions from `@/utils/auth/`

```typescript
// ❌ DON'T: Handle API errors manually
try {
  await apiCall()
} catch (error) {
  console.error(error)
  toast.error('Something went wrong')
}

// ✅ DO: Use centralized error handler
import { handleApiError } from '@/app/api/utils/errorHandler'
try {
  await apiCall()
} catch (error) {
  handleApiError(error, 'endpoint-name')
}
```

### 5. Type/Interface Reuse

#### Type Location Strategy:
```
Domain models (User, Legajo, Demanda, etc.)
→ src/app/interfaces/[model].tsx

Feature-specific types (LegajoCreationData, SearchParams, etc.)
→ src/features/[feature]/types/*.types.ts

Component-specific types (props only used in one component)
→ Same file as component or colocated .types.ts
```

```typescript
// ❌ DON'T: Duplicate type definitions
interface User {
  id: number
  name: string
}

// ✅ DO: Import from interfaces
import { User } from '@/app/interfaces/user'

// ❌ DON'T: Create similar types with different names
interface UserData { id: number, name: string }
interface UserInfo { id: number, name: string }

// ✅ DO: Reuse and extend existing types
import { User } from '@/app/interfaces/user'
interface UserWithPermissions extends User {
  permissions: string[]
}
```

### 6. Component Composition Patterns

#### Compose, Don't Duplicate:
```typescript
// ❌ DON'T: Create similar components with slight variations
const PrimaryButton = ({ label, onClick }) => (
  <button className="bg-blue-500 text-white px-4 py-2" onClick={onClick}>
    {label}
  </button>
)

const SecondaryButton = ({ label, onClick }) => (
  <button className="bg-gray-500 text-white px-4 py-2" onClick={onClick}>
    {label}
  </button>
)

// ✅ DO: Create one flexible component
const Button = ({
  label,
  onClick,
  variant = 'primary'
}: ButtonProps) => (
  <button
    className={`px-4 py-2 ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}
    onClick={onClick}
  >
    {label}
  </button>
)

// ✅ BETTER: Use MUI Button which already exists in the project
// Use MUI MCP to explore all Button variants and props
import { Button } from '@mui/material'
<Button variant="contained" color="primary" onClick={onClick}>
  {label}
</Button>
```

**MUI Components Available (use MUI MCP for full details):**
- **Forms**: TextField, Select, Autocomplete, Checkbox, Radio, Switch
- **Data Display**: DataGrid, Table, Chip, Badge, Avatar, Tooltip
- **Feedback**: Alert, Snackbar, Dialog, CircularProgress, LinearProgress
- **Navigation**: Tabs, Breadcrumbs, Drawer, Menu, Pagination
- **Inputs**: Button, IconButton, ButtonGroup, ToggleButton
- **Date/Time**: DatePicker, TimePicker, DateTimePicker, DateRangePicker
- **Layout**: Container, Grid, Stack, Box, Card, Paper

**Before creating custom UI components, always:**
1. Query MUI MCP for existing MUI components
2. Check `src/components/` for custom wrappers
3. Only create custom if MUI doesn't provide the functionality
```

#### Extract Common Patterns:
```typescript
// If you find yourself copying this pattern 3+ times:
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  get<Data[]>('endpoint/').then(setData).finally(() => setLoading(false))
}, [])

// ✅ Extract to custom hook:
const useEndpointData = <T,>(endpoint: string) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => get<T>(endpoint)
  })
}
```

### 7. Code Duplication Detection Checklist

Before committing code, ask:

- [ ] Does a similar component exist in `src/components/`?
- [ ] **Did I check MUI MCP for existing MUI components?**
- [ ] Does a similar hook exist in `src/hooks/` or `src/features/*/hooks/`?
- [ ] Can I use `apiService.ts` generic functions instead of custom fetch logic?
- [ ] Does this type already exist in `src/app/interfaces/`?
- [ ] Can I compose this from existing MUI components?
- [ ] Am I repeating logic from another feature that should be shared?
- [ ] Would extracting this to a utility function benefit multiple places?

### 8. Refactoring Duplicate Code

When you find duplication:

```typescript
// Step 1: Identify the pattern
// Component A:
const formatDate = (date) => new Date(date).toLocaleDateString()

// Component B:
const formatDate = (date) => new Date(date).toLocaleDateString()

// Step 2: Extract to shared utility
// src/utils/dateUtils.ts
export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString()

// Step 3: Replace in both components
import { formatDate } from '@/utils/dateUtils'
```

## Common Patterns and Anti-Patterns

### ✅ DO
- **Search before creating** - Always check for existing components, hooks, and utilities
- **Use MUI MCP first** - Query MUI MCP before creating custom UI components
- **Reuse generic API functions** - Use `apiService.ts` for all CRUD operations
- **Compose components** - Build from existing MUI and custom components
- **Extract to shared** - If code repeats 3+ times, create shared utility/component/hook
- **Use feature-based organization** - Group related code in `src/features/[feature]/`
- **Follow TanStack Query patterns** - Standard pattern for all client-side data fetching
- **Leverage path aliases** - Use `@/` for all imports from `src/`
- **Keep business logic in services** - Components should be presentational
- **Reuse TypeScript types** - Import from `interfaces/` or feature types
- **Use existing hooks** - Check `src/features/*/hooks/` before creating similar ones
- **Consult MUI docs via MCP** - For props, patterns, and best practices

### ❌ DON'T
- **Create custom UI without checking MUI** - Don't build from scratch what MUI provides
- **Duplicate components** - Don't create similar components with slight variations
- **Duplicate CRUD logic** - Never write custom fetch/create/update functions
- **Duplicate types** - Don't redeclare interfaces that already exist
- **Create new axios instances** - Always use `axiosInstance` from utils
- **Bypass authentication** - Don't skip the auth interceptor
- **Mix param styles** - Use `getWithCustomParams` for path params vs query params
- **Ignore duplication** - Refactor when you notice repeated code
- **Store auth tokens client-side** - Use httpOnly cookies only
- **Copy-paste code** - Extract to shared utilities instead
- **Skip the search step** - Always grep/find before creating new files
- **Ignore MUI MCP** - Don't skip querying MUI MCP for component guidance

## Domain-Specific Context

This is a child protection case management system (RUNNA - Registro Único Nacional de Niños y Niñas) with:
- **Legajo**: Case files for children
- **Demanda**: Incoming requests/demands
- **Medida**: Protection measures assigned to cases
- **Evaluación**: Assessment/evaluation system
- **Vulneración**: Rights violations tracking

Key workflows involve creating case files (legajos), assigning protection measures, tracking activities, and generating legal reports.
