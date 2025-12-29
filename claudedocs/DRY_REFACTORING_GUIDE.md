# DRY Refactoring & Code Optimization Guide

**Project:** RUNNA (Next.js 14.2 + TypeScript + MUI v6)
**Session Date Range:** December 2024 - Ongoing
**Total Impact:** ~2,150+ lines eliminated, 66+ files refactored
**Current Progress:** 9/17 major tasks complete (P8 newly completed)

---

## 🎯 Mission Overview

Systematic elimination of code duplication across the RUNNA codebase following DRY (Don't Repeat Yourself) principles. This is a multi-session effort to consolidate duplicate patterns into reusable components, hooks, and utilities.

**Core Principle:** Search Before Creating → Reuse → Extract → Standardize

---

## 📊 Progress Summary

### ✅ **COMPLETED TASKS** (9/17)

#### 🔴 **P1: DocumentUploadModal Component** ✅ COMPLETE
- **Impact:** 3 files refactored, ~289 lines saved
- **Pattern:** Consolidated duplicate document upload dialogs
- **Location:** `src/components/shared/DocumentUploadModal.tsx`
- **Files Refactored:**
  - Document upload patterns from multiple features
  - Standardized file validation and preview
  - Unified error handling and progress tracking

#### 🔴 **P2: BaseDialog Migration** ✅ COMPLETE
- **Impact:** 8 modals refactored, ~206 lines saved
- **Pattern:** Replaced manual Dialog boilerplate with BaseDialog
- **Location:** `src/components/shared/BaseDialog.tsx`
- **Key Features:**
  - Standardized title with optional icon
  - Built-in error/warning/success/info alerts
  - Configurable action buttons with loading states
  - Consistent close button behavior
- **Files Migrated:**
  - CancelActividadModal
  - EditActividadModal
  - DesvincularVinculoDialog
  - CrearVinculoLegajoDialog (fixed import error)
  - 4+ other dialog components

**BaseDialog Import Pattern:**
```typescript
// ✅ CORRECT (default export)
import BaseDialog from "@/components/shared/BaseDialog"

// ❌ WRONG (named import)
import { BaseDialog } from "@/components/shared/BaseDialog"
```

#### 🔴 **P3: Date Utilities Adoption** ✅ COMPLETE
- **Impact:** 7 files refactored, 12 duplicate patterns eliminated
- **Pattern:** Replaced `toLocaleDateString` duplicates with shared utilities
- **Existing Utilities:** Check `src/utils/` for date formatting functions
- **Approach:** Identify → Replace → Validate

#### 🔴 **P4: useApiQuery System** ✅ COMPLETE
- **Impact:** 20+ files refactored, ~455 lines saved
- **Pattern:** Replaced manual useEffect data fetching with TanStack Query
- **Hook Location:** `src/hooks/useApiQuery.ts`
- **Migration Pattern:**

**Before (Manual Fetching):**
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await get<Data[]>('endpoint/')
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**After (useApiQuery):**
```typescript
import { useApiQuery } from '@/hooks/useApiQuery'

const { data = [], isLoading, error } = useApiQuery<Data[]>(
  'endpoint/',
  undefined,
  {
    enabled: true, // optional
  }
)
```

**Benefits:**
- Automatic caching and refetching
- Built-in loading and error states
- Optimistic updates support
- Reduced boilerplate by ~20-25 lines per component

#### 🟡 **P6: useCatalogData Hook** ✅ COMPLETE
- **Impact:** Integrated into P4 refactoring
- **Pattern:** Centralized catalog/lookup data fetching
- **Location:** Check `src/hooks/` or `src/features/*/hooks/`
- **Use Case:** Dropdown options, lookup tables, reference data

#### 🟡 **P10 Wave 1: Simple Dialog Migration** ✅ COMPLETE
- **Impact:** 3 dialogs, ~15 lines saved
- **Pattern:** Simple confirmation/info dialogs to BaseDialog
- **Complexity:** Single action, minimal state

#### 🟡 **P10 Wave 2: Medium Dialog Migration** ✅ COMPLETE
- **Impact:** 6 dialogs, ~89 lines saved
- **Pattern:** Multi-action dialogs with form state to BaseDialog
- **Complexity:** Multiple actions, validation, error handling

#### 🔴 **P7: useFormSubmission Hook** ✅ COMPLETE (WAVE 1-3)
- **Impact:** 7 forms migrated, ~155+ lines saved + hook infrastructure
- **Pattern:** Consolidated form submission with loading/error/toast handling
- **Location:** `src/hooks/useFormSubmission.ts`, `src/hooks/useSequentialSubmission.ts`

**Created Hooks:**
- `useFormSubmission<TData, TResponse>` - Main hook for form submissions
- `useSequentialSubmission` - Multi-step form submissions

**useFormSubmission Migration Pattern:**

**Before (Manual State Management):**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleSubmit = async (data: FormData) => {
  setLoading(true)
  setError(null)
  try {
    await api.create(data)
    onSuccess()
    onClose()
  } catch (err) {
    console.error('Error:', err)
    setError(err.response?.data?.detail || 'Error')
  } finally {
    setLoading(false)
  }
}
```

**After (useFormSubmission):**
```typescript
import { useFormSubmission } from '@/hooks'

const { submit, isLoading, error, close } = useFormSubmission({
  onSubmit: async (data) => api.create(data),
  validate: (data) => !data.field ? 'Field required' : undefined,
  showSuccessToast: true,
  successMessage: 'Created successfully',
  onSuccess: () => onSuccess(),
  onClose,
  invalidateQueries: [['queryKey']],
})
```

**Migrations Completed (7 total):**

| Wave | File | Lines Saved | Pattern |
|------|------|-------------|---------|
| 1 | `CancelActividadModal.tsx` | ~15 | Simple async |
| 1 | `EditActividadModal.tsx` | ~15 | React Hook Form |
| 1 | `TransferirDialog.tsx` | ~15 | Multi-field validation |
| 2 | `RechazarCierreModal.tsx` | ~42 | Simple rejection form |
| 2 | `InformeCierreModal.tsx` | ~45 | Multi-step (create + upload) |
| 2 | `AsignarActividadModal.tsx` | ~13 | Dual handlers (2 tabs) |
| 3 | `AddItemDialog.tsx` | ~2 | Multi-mode form |

**Skipped (Already use hooks or different patterns):**
- `AddTaskDialog.tsx` - Uses callback pattern, no async
- `DesvincularVinculoDialog.tsx` - Uses custom `useVinculos` hook
- `EnviarRespuestaModal.tsx` - React Hook Form + Snackbar pattern

**Remaining Migrations:** ~20+ forms identified for future migration

---

### 🔄 **IN PROGRESS** (1/17)

#### 🔴 **P5: SectionCard Standardization** 🔄 IN PROGRESS
- **Current:** 26/35 sections complete (~74% done)
- **Impact This Session:** 16 files migrated, ~495 lines saved
- **Remaining:** 9 sections (2 complex in medida directory + 7 others)
- **Location:** `src/components/shared/SectionCard.tsx` or similar

**Migration Pattern:**

**Before (Manual Paper/Box Header):**
```typescript
import { Paper, Box, Typography } from "@mui/material"
import SomeIcon from "@mui/icons-material/Some"

return (
  <Paper elevation={2} sx={{ width: "100%", mb: 4, p: 3, borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <SomeIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Section Title
        </Typography>
        <Chip label="5 items" color="primary" size="small" sx={{ ml: 2 }} />
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
        Add Item
      </Button>
    </Box>
    {/* Section content */}
  </Paper>
)
```

**After (SectionCard):**
```typescript
import { SectionCard } from "@/components/shared/SectionCard"

return (
  <SectionCard
    title="Section Title"
    chips={[{ label: "5 items", color: "primary" }]}
    headerActions={
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
        Add Item
      </Button>
    }
  >
    {/* Section content - unchanged */}
  </SectionCard>
)
```

**Benefits:**
- ~30-45 lines saved per section
- Consistent visual appearance
- Reduced import statements
- Easier maintenance

**SectionCard API:**
```typescript
interface SectionCardProps {
  title: string | React.ReactNode
  chips?: Array<{
    label: string
    color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
    variant?: "filled" | "outlined"
  }>
  headerActions?: React.ReactNode
  additionalInfo?: string[]
  children: React.ReactNode
  // ... other MUI Paper props
}
```

**Completed Migrations (23 files):**

**From Previous Sessions (10):**
1. actividades-section.tsx
2. comentarios-section.tsx
3. conexiones-section.tsx
4. datos-basicos-section.tsx
5. dispositivo-section.tsx
6. estado-section.tsx
7. informe-section.tsx
8. personas-section.tsx
9. timeline-section.tsx
10. vulneraciones-section.tsx

**From Current Session (16):**
11. documentos-section.tsx (~34 lines saved)
12. datos-personales-section.tsx (~26 lines saved)
13. responsables-section.tsx (~40 lines saved)
14. demandas-section.tsx (~28 lines saved)
15. asignaciones-section.tsx (~40 lines saved)
16. plan-trabajo-section.tsx (~35 lines saved)
17. oficios-section.tsx (~30 lines saved)
18. historial-medidas-section.tsx (~8 lines saved)
19. medidas-activas-section.tsx (~65 lines saved) - **Complex: 4 render states**
20. historial-asignaciones-section.tsx (~46 lines saved)
21. historial-cambios-section.tsx (~49 lines saved) - **Complex: 3 render states**
22. intervenciones-section.tsx (~24 lines saved) - **Complex: 3 render states**
23. localizacion-section.tsx (~44 lines saved) - **Complex: 4 render states**
24. mpe-post-cese-section.tsx (~11 lines saved) - **NEW: P5 Quick Win**
25. medida-documentos-section.tsx (~1 line, standardized) - **NEW: P5 Quick Win**
26. nota-aval-section.tsx (~14 lines saved) - **NEW: P5 Quick Win, dynamic chips**

**Remaining Files (9):**

**High Priority - Medida Directory (2 complex files):**
1. `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/informe-juridico-section.tsx`
   - **Complexity:** VERY HIGH (~600+ lines)
   - **Note:** Large complex component, may need careful migration
   - **Estimated Impact:** ~40-50 lines saved

2. `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/ratificacion-judicial-section.tsx`
   - **Complexity:** MEDIUM-HIGH
   - **Estimated Impact:** ~30-35 lines saved

**To Discover - Other Directories (7 files):**
- Search other features/pages for Paper/Box header patterns
- Use grep to find remaining instances:
  ```bash
  # Find potential section components with Paper/Box patterns
  grep -r "Paper.*elevation.*mb.*p.*borderRadius" src/
  grep -r "display.*flex.*alignItems.*center.*justifyContent.*space-between.*mb" src/
  ```

**Migration Strategy for Remaining Sections:**

1. **Start with Simple Sections** (single render state, no complex logic)
2. **Move to Medium Complexity** (2-3 render states, conditional content)
3. **End with Complex Sections** (informe-juridico-section.tsx - 4+ render states, heavy logic)

**Pattern for Multiple Render States:**

```typescript
// Loading state
if (isLoading) {
  return (
    <SectionCard title="Section Title" headerActions={actions}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    </SectionCard>
  )
}

// Error state
if (error) {
  return (
    <SectionCard title="Section Title" headerActions={actions}>
      <Alert severity="error">{error}</Alert>
    </SectionCard>
  )
}

// Empty state
if (data.length === 0) {
  return (
    <SectionCard title="Section Title" headerActions={actions}>
      <Typography variant="body1" color="text.secondary">
        No data available
      </Typography>
    </SectionCard>
  )
}

// Data state
return (
  <SectionCard
    title="Section Title"
    chips={[{ label: `${data.length} items`, color: "primary" }]}
    headerActions={actions}
  >
    {/* Content */}
  </SectionCard>
)
```

**Validation Checklist for Each Migration:**
- [ ] Remove Paper, Box imports (if no longer used)
- [ ] Remove icon imports (if only used for header)
- [ ] Preserve all functionality (buttons, tooltips, chips)
- [ ] Test all render states (loading, error, empty, data)
- [ ] Verify responsive behavior
- [ ] Check that headerActions work correctly
- [ ] Ensure chips display properly
- [ ] Validate no visual regressions

---

### ⏳ **PENDING TASKS** (7/17)

#### 🟡 **P18: formatDate Consolidation** ⏳ NEW
- **Priority:** IMPORTANT
- **Impact:** 12+ duplicate date formatting functions
- **Pattern:** Consolidate toLocaleDateString patterns to central dateUtils
- **Central Utility:** `src/utils/dateUtils.ts` (already exists)

**Existing Utilities:**
- `formatDateLocaleAR(date)` - DD/MM/YYYY format
- `formatDateTimeLocaleAR(date)` - DD/MM/YYYY HH:MM format
- `formatDateLocaleES(date)` - Same as AR, using es-ES locale

**Duplicates Found (12+ files):**
- `adjuntos-informe-juridico.tsx` - es-AR with time
- `adjuntos-ratificacion.tsx` - es-AR with time
- `adjuntos-nota-aval.tsx` - es-AR with time
- `AsignarActividadModal.tsx` - es-AR with time
- `asignar-legajo-modal.tsx` - es-AR with time
- `asignarModal.tsx` - es-ES with time
- `informe-juridico-section.tsx` - es-AR with month: "long"
- `nota-aval-section.tsx` - es-AR with month: "long" + time
- `ratificacion-judicial-section.tsx` - es-AR with month: "long"
- Others...

**Needs New Utilities:**
```typescript
// Add to src/utils/dateUtils.ts
export const formatDateLongAR = (date: Date | string): string => {
  // DD de Month de YYYY format
}

export const formatDateTimeLongAR = (date: Date | string): string => {
  // DD de Month de YYYY HH:MM format
}
```

**Migration Steps:**
1. Add missing utility variants to `src/utils/dateUtils.ts`
2. Replace each duplicate with appropriate utility import
3. Remove local function definitions

**Estimated Impact:** ~7-8 lines saved per duplicate × 12+ files = ~84-96 lines

---

#### 🟢 **P8: formatFileSize Utility** ✅ COMPLETE
- **Status:** COMPLETED (Dec 2024)
- **Impact:** 6 files refactored, ~41 lines saved
- **Pattern:** Consolidated bytes → human-readable size conversions
- **Central Utility:** `src/utils/fileUtils.ts`

**Files Migrated:**
1. `adjuntos-informe-juridico.tsx`
2. `AdjuntoCard.tsx`
3. `EvidenciasTab.tsx`
4. `adjuntar-nota-modal.tsx`
5. `file-upload-section.tsx`
6. `useNotaAvalAdjuntos.ts`

**Usage:**
```typescript
import { formatFileSize } from '@/utils/fileUtils'

formatFileSize(1024)      // "1.00 KB"
formatFileSize(1048576)   // "1.00 MB"
formatFileSize(500, 1)    // "500 B" (with 1 decimal)
```

---

#### 🟡 **P9: Create avatarUtils.ts**
- **Priority:** IMPORTANT
- **Impact:** 8+ duplicate avatar/initials generation functions
- **Pattern:** Consolidate user initials extraction and avatar color generation
- **Target Patterns:**

**Current Duplicates:**
```typescript
// Pattern 1: Initials extraction
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Pattern 2: Avatar color generation
const stringToColor = (string: string) => {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }
  return color
}
```

**Discovery Steps:**
1. Search for avatar/initials patterns:
   ```bash
   grep -r "getInitials" src/
   grep -r "stringToColor" src/
   grep -r "split.*' '.*map.*n.*0.*join" src/
   grep -r "charCodeAt.*hash" src/
   ```
2. Create `src/utils/avatarUtils.ts`
3. Implement utilities
4. Migrate all duplicates

**Proposed API:**
```typescript
// src/utils/avatarUtils.ts
export const getInitials = (name: string, maxLength: number = 2): string
export const stringToColor = (string: string): string
export const getAvatarProps = (name: string) => ({
  children: getInitials(name),
  sx: { bgcolor: stringToColor(name) }
})
```

**Estimated Impact:** ~10-15 lines saved per duplicate × 8+ files = ~80-120 lines

---

#### 🟢 **P11: Refactor Forms API Utility**
- **Priority:** RECOMMENDED
- **Impact:** Fix apiService violations, improve type safety
- **Issue:** Some form components bypass `apiService.ts` generic functions
- **Pattern:** Standardize all API calls through `apiService.ts`

**Discovery Steps:**
1. Find direct axios usage:
   ```bash
   grep -r "axios\." src/ --include="*.tsx" --include="*.ts"
   grep -r "axiosInstance" src/ --include="*.tsx" --include="*.ts"
   ```
2. Identify files not using `apiService.ts`
3. Refactor to use `get`, `create`, `update`, `patch`, `remove` from apiService
4. Verify error handling consistency

**apiService Location:** `src/app/api/apiService.ts`

**Standard API Calls:**
```typescript
import { get, create, update, remove } from '@/app/api/apiService'

// GET
const users = await get<User[]>('users/')

// POST with toast
const newUser = await create<User>('users/', data, true, 'User created!')

// PATCH with toast
const updated = await update<User>('users/', userId, data, true)

// DELETE
await remove('users/', userId)
```

**Estimated Impact:** ~5-10 lines saved per file × 10+ files = ~50-100 lines

---

#### 🟢 **P12: Create arrayUtils.ts**
- **Priority:** RECOMMENDED
- **Impact:** 33+ duplicate array manipulation patterns
- **Pattern:** Consolidate common array operations
- **Target Patterns:**

**Common Duplicates:**
```typescript
// Pattern 1: Group by key
const groupBy = (arr, key) => arr.reduce((acc, item) => {
  (acc[item[key]] = acc[item[key]] || []).push(item)
  return acc
}, {})

// Pattern 2: Unique by key
const uniqueBy = (arr, key) => [...new Map(arr.map(item => [item[key], item])).values()]

// Pattern 3: Sort by multiple keys
const sortByMultiple = (arr, keys) => arr.sort((a, b) => {
  for (const key of keys) {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
  }
  return 0
})

// Pattern 4: Chunk array
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
  arr.slice(i * size, i * size + size)
)
```

**Discovery Steps:**
1. Search for array patterns:
   ```bash
   grep -r "\.reduce.*acc.*push" src/
   grep -r "new Map.*\.map.*values()" src/
   grep -r "\.sort.*\(a, b\)" src/
   grep -r "Array.from.*Math.ceil" src/
   ```
2. Create `src/utils/arrayUtils.ts`
3. Implement utilities
4. Migrate duplicates

**Estimated Impact:** ~5-10 lines saved per pattern × 33+ instances = ~165-330 lines

---

#### 🟢 **P13: Create objectUtils.ts**
- **Priority:** RECOMMENDED
- **Impact:** 11+ duplicate object manipulation patterns
- **Pattern:** Consolidate common object operations
- **Target Patterns:**

**Common Duplicates:**
```typescript
// Pattern 1: Deep clone
const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

// Pattern 2: Remove null/undefined
const removeEmpty = (obj) => Object.fromEntries(
  Object.entries(obj).filter(([_, v]) => v != null)
)

// Pattern 3: Pick keys
const pick = (obj, keys) => keys.reduce((acc, key) => {
  if (key in obj) acc[key] = obj[key]
  return acc
}, {})

// Pattern 4: Omit keys
const omit = (obj, keys) => Object.fromEntries(
  Object.entries(obj).filter(([key]) => !keys.includes(key))
)
```

**Discovery Steps:**
1. Search for object patterns:
   ```bash
   grep -r "JSON.parse.*JSON.stringify" src/
   grep -r "Object.fromEntries.*filter" src/
   grep -r "\.reduce.*acc.*key" src/
   ```
2. Create `src/utils/objectUtils.ts`
3. Implement utilities
4. Migrate duplicates

**Estimated Impact:** ~5-8 lines saved per pattern × 11+ instances = ~55-88 lines

---

#### 🟢 **P14: Extend apiService Features**
- **Priority:** RECOMMENDED
- **Impact:** Add DELETE with response data, singleton PATCH
- **Pattern:** Enhance `apiService.ts` with missing features
- **Missing Features:**

**Feature 1: DELETE with response data**
```typescript
// Current: remove() doesn't return data
await remove('endpoint/', id)

// Needed: removeWithData() returns deleted resource
const deletedUser = await removeWithData<User>('users/', id)
```

**Feature 2: Singleton PATCH (no ID)**
```typescript
// Current: patch() requires ID
await patch('endpoint/', id, data)

// Needed: patchSingleton() for singleton resources
await patchSingleton('settings/', data) // PATCH /settings/
```

**Implementation:**
1. Add to `src/app/api/apiService.ts`
2. Update type definitions
3. Document usage in CLAUDE.md
4. Migrate existing workarounds

**Estimated Impact:** Enable cleaner code in ~10+ files, ~20-30 lines saved total

---

#### 🟢 **P15: Replace DateRangeFilter with MUI DatePicker**
- **Priority:** RECOMMENDED
- **Impact:** Standardize date range selection across app
- **Pattern:** Replace custom DateRangeFilter with MUI DateRangePicker
- **MUI Component:** `@mui/x-date-pickers` (already in dependencies)

**Current Custom Component:**
```typescript
// Custom DateRangeFilter implementation
<DateRangeFilter onChange={handleChange} />
```

**Target MUI Component:**
```typescript
import { DateRangePicker } from '@mui/x-date-pickers-pro'

<DateRangePicker
  startText="Fecha inicio"
  endText="Fecha fin"
  value={dateRange}
  onChange={setDateRange}
/>
```

**Discovery Steps:**
1. Find DateRangeFilter usage:
   ```bash
   grep -r "DateRangeFilter" src/
   grep -r "date.*range" src/ -i
   ```
2. Check MUI DateRangePicker docs via MUI MCP
3. Plan migration strategy
4. Update to MUI component
5. Remove custom component if no longer needed

**Benefits:**
- Better accessibility
- Consistent with MUI design system
- Less maintenance overhead
- Professional date range UX

**Estimated Impact:** ~30-50 lines saved by removing custom component, improved UX

---

#### 🟢 **P16: Add Skeleton Loading States**
- **Priority:** RECOMMENDED (Progressive Enhancement)
- **Impact:** Improve perceived performance with skeleton screens
- **Pattern:** Replace CircularProgress with content-shaped skeletons
- **MUI Component:** `Skeleton` from `@mui/material`

**Current Loading State:**
```typescript
if (isLoading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  )
}
```

**Target Skeleton State:**
```typescript
if (isLoading) {
  return (
    <Box>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
      <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
    </Box>
  )
}
```

**Discovery Steps:**
1. Find loading states with CircularProgress:
   ```bash
   grep -r "CircularProgress" src/ --include="*.tsx"
   grep -r "isLoading.*return" src/
   ```
2. Identify high-traffic components
3. Design skeleton layouts matching content structure
4. Implement progressively (start with most visible pages)

**Benefits:**
- Better perceived performance
- Reduced layout shift
- Modern UX pattern

**Estimated Impact:** UX improvement, ~5-10 lines per component, ~50-100 files potential

---

## 🔍 Investigation Areas

### 1. **Component Duplication Analysis** (COMPLETED)
**Status:** ✅ Analysis done by Explore agent

**Findings:**
- **Modal/Dialog patterns** - Consolidated via BaseDialog (P2)
- **Section headers** - Consolidated via SectionCard (P5 in progress)
- **Document upload** - Consolidated via DocumentUploadModal (P1)

---

### 2. **Custom Hooks Analysis** (COMPLETED)
**Status:** ✅ Analysis done by Explore agent

**Findings:**
- **Data fetching** - Consolidated via useApiQuery (P4 complete)
- **Catalog data** - Consolidated via useCatalogData (P6 complete)
- **Form submission** - Needs consolidation (P7 pending)

**Recommended Next Hooks:**
- `useFormSubmission` - P7
- `useDebounce` - Check if duplicated
- `useLocalStorage` - Check if duplicated

---

### 3. **API Service Violations** (NEEDS INVESTIGATION)
**Status:** ⏳ Partially analyzed

**Known Issues:**
- Some components use direct axios calls
- Inconsistent error handling
- Missing DELETE with response data
- No singleton PATCH support

**Investigation Steps:**
```bash
# Find direct axios usage
grep -r "axios\." src/ --include="*.tsx" --include="*.ts" | grep -v "apiService.ts" | grep -v "axiosInstance.ts"

# Find non-standard API patterns
grep -r "fetch(" src/
grep -r "\.get(" src/ --include="*.tsx" | grep -v "apiService"
grep -r "\.post(" src/ --include="*.tsx" | grep -v "apiService"
```

**Related Task:** P11

---

### 4. **MUI Component Opportunities** (NEEDS INVESTIGATION)
**Status:** ⏳ Requires MUI MCP consultation

**Areas to Investigate:**
- Custom date pickers vs MUI DatePicker (P15)
- Custom autocomplete vs MUI Autocomplete
- Custom data tables vs MUI DataGrid (likely already using DataGrid)
- Custom modals vs MUI Dialog (already using BaseDialog)

**Investigation Steps:**
1. Use MUI MCP to explore available components
2. Search for custom implementations:
   ```bash
   grep -r "class.*extends.*React.Component" src/
   grep -r "custom.*component" src/ -i
   ```
3. Evaluate replacement opportunities
4. Plan migration if beneficial

**MUI MCP Queries:**
- "MUI DateRangePicker usage and props"
- "MUI Autocomplete advanced patterns"
- "MUI DataGrid server-side pagination"

---

### 5. **Utility Function Duplication** (NEEDS DEEP ANALYSIS)
**Status:** ⏳ Initial patterns identified, needs comprehensive search

**Known Patterns:**
- File size formatting (P8) - 8+ duplicates
- Avatar/initials generation (P9) - 8+ duplicates
- Array manipulation (P12) - 33+ duplicates
- Object manipulation (P13) - 11+ duplicates
- Date formatting (P3) - Already consolidated

**Investigation Command:**
```bash
# Generate comprehensive duplicate report
# Search for common utility patterns
grep -r "const.*=.*\(" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "useState" | \
  grep -v "useEffect" | \
  grep -v "import" | \
  sort | \
  uniq -c | \
  sort -rn | \
  head -50
```

**Analysis Steps:**
1. Run comprehensive search
2. Group similar patterns
3. Prioritize by frequency and line count
4. Create utilities in priority order
5. Migrate systematically

---

### 6. **Date Formatting Patterns** (COMPLETED)
**Status:** ✅ Analyzed and consolidated (P3)

**Findings:**
- 12+ instances of `toLocaleDateString` with duplicate options
- Consolidated into shared date utilities
- 7 files migrated

---

### 7. **useEffect Data Fetching** (COMPLETED)
**Status:** ✅ Analyzed and migrated to useApiQuery (P4)

**Findings:**
- 20+ components with manual useEffect data fetching
- All migrated to useApiQuery hook
- ~455 lines eliminated

---

### 8. **Section Component Patterns** (IN PROGRESS)
**Status:** 🔄 P5 - 23/35 complete

**Current Progress:**
- Identified 35 total section components
- 23 migrated to SectionCard
- 12 remaining (5 in medida directory + 7 to discover)

**Pattern Complexity Levels:**
1. **Simple:** Single render state, static content (~30 lines saved)
2. **Medium:** 2-3 render states, conditional content (~35-40 lines saved)
3. **Complex:** 4+ render states, heavy logic (~45-65 lines saved)

---

### 9. **Completed Refactoring Patterns** (CONTINUOUS LEARNING)
**Status:** ✅ Patterns documented for reuse

**Documented Patterns:**

**Pattern 1: BaseDialog Migration**
- Import fix: Default export, not named
- Action button configuration
- Error/success state handling
- Loading state integration

**Pattern 2: useApiQuery Migration**
- Replace useState + useEffect
- Handle loading/error states
- Enable caching and refetching
- Optional query parameters

**Pattern 3: SectionCard Migration**
- Replace Paper/Box boilerplate
- Extract chips from header
- Move actions to headerActions prop
- Apply to all render states

---

## 📁 Key File Locations

### Shared Components
- `src/components/shared/BaseDialog.tsx` - Standardized dialog component
- `src/components/shared/DocumentUploadModal.tsx` - Document upload dialog
- `src/components/shared/SectionCard.tsx` - Section header standardization (verify path)

### Hooks
- `src/hooks/index.ts` - Centralized hook exports
- `src/hooks/useApiQuery.ts` - TanStack Query wrapper
- `src/hooks/useFormSubmission.ts` - Form submission with loading/error/toast
- `src/hooks/useFormSubmission.types.ts` - TypeScript types for form hooks
- `src/hooks/useSequentialSubmission.ts` - Multi-step form submissions

### API Layer
- `src/app/api/apiService.ts` - Generic CRUD operations
- `src/app/api/utils/axiosInstance.ts` - Axios instance with interceptors
- `src/app/api/utils/errorHandler.ts` - Centralized error handling

### Utilities
- `src/utils/` - Utility functions directory
  - Date utilities (consolidated in P3)
  - Error message utilities
  - Auth utilities

### Feature-Specific
- `src/features/legajo/hooks/` - Case file custom hooks
- `src/features/legajo/api/` - Case file API services
- `src/features/legajo/types/` - Case file TypeScript types

---

## 🎨 Established Patterns

### Pattern 1: Component Creation Checklist
Before creating a new component:
1. **Search existing:** `grep -r "ComponentName" src/components/`
2. **Check features:** `find src/features -name "*Component*"`
3. **Query MUI MCP:** "MUI [component type] usage"
4. **Evaluate extraction:** If code exists 2+ places, extract to shared

### Pattern 2: API Call Standard
Always use apiService.ts:
```typescript
import { get, create, update, patch, remove } from '@/app/api/apiService'

// ✅ CORRECT
const users = await get<User[]>('users/')

// ❌ WRONG
const response = await axios.get('/api/users/')
```

### Pattern 3: Data Fetching Standard
Use TanStack Query via useApiQuery:
```typescript
// ✅ CORRECT
const { data, isLoading, error } = useApiQuery<User[]>('users/')

// ❌ WRONG
const [data, setData] = useState([])
useEffect(() => { fetchData() }, [])
```

### Pattern 4: Section Component Standard
Use SectionCard for all section headers:
```typescript
// ✅ CORRECT
<SectionCard title="Title" chips={[...]} headerActions={<Button />}>
  {content}
</SectionCard>

// ❌ WRONG
<Paper>
  <Box>
    <Typography variant="h6">Title</Typography>
    <Button />
  </Box>
  {content}
</Paper>
```

### Pattern 5: Dialog Standard
Use BaseDialog for all dialogs:
```typescript
// ✅ CORRECT
<BaseDialog
  open={open}
  onClose={onClose}
  title="Dialog Title"
  actions={[{ label: "Cancel", onClick: onClose }]}
>
  {content}
</BaseDialog>

// ❌ WRONG
<Dialog open={open}>
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogContent>{content}</DialogContent>
  <DialogActions><Button onClick={onClose}>Cancel</Button></DialogActions>
</Dialog>
```

### Pattern 6: Form Submission Standard
Use useFormSubmission for all form submissions:
```typescript
import { useFormSubmission } from '@/hooks'

// ✅ CORRECT
const { submit, isLoading, error, close } = useFormSubmission({
  onSubmit: async (data) => api.create(data),
  validate: (data) => !data.field ? 'Required' : undefined,
  showSuccessToast: true,
  successMessage: 'Success!',
  onSuccess: () => { /* callback */ },
  onClose: handleClose,
  invalidateQueries: [['queryKey']],
})

// ❌ WRONG
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleSubmit = async () => {
  setLoading(true)
  setError(null)
  try {
    await api.create(data)
    onSuccess()
  } catch (err) {
    setError(err.response?.data?.detail || 'Error')
  } finally {
    setLoading(false)
  }
}
```

---

## 📏 Metrics and Impact

### Lines of Code Saved
- **P1 (DocumentUploadModal):** ~289 lines
- **P2 (BaseDialog):** ~206 lines
- **P3 (Date Utilities):** ~84 lines (12 patterns × ~7 lines)
- **P4 (useApiQuery):** ~455 lines (20 files × ~20-25 lines avg)
- **P5 (SectionCard - Current):** ~495 lines (16 files this session)
- **P6 (useCatalogData):** Integrated in P4
- **P7 (useFormSubmission):** ~45 lines (3 pilot forms) + hook infrastructure (~300 lines)
- **P10 Wave 1:** ~15 lines
- **P10 Wave 2:** ~89 lines

**Total Saved So Far:** ~2,000+ lines

### Estimated Remaining Impact
- **P5 (Remaining 9 sections):** ~270-350 lines
- **P7 (Remaining 30+ form migrations):** ~300-400 lines
- **P8 (formatFileSize):** ~64-96 lines
- **P9 (avatarUtils):** ~80-120 lines
- **P11 (API violations):** ~50-100 lines
- **P12 (arrayUtils):** ~165-330 lines
- **P13 (objectUtils):** ~55-88 lines
- **P14 (apiService extensions):** ~20-30 lines
- **P15 (DateRangePicker):** ~30-50 lines

**Estimated Total Remaining:** ~1,124-1,664 lines

**Projected Final Impact:** ~2,731-3,271 lines saved

### Files Refactored
- **Completed:** 50+ files
- **In Progress:** 12 files (P5 remaining)
- **Pending:** 60+ files (estimated across all pending tasks)

**Projected Total:** ~120-130 files refactored

---

## 🚀 Next Session Quickstart

### Option 1: Continue P5 (SectionCard Migration)
**Recommended if:** You want to complete the in-progress task

**Steps:**
1. Read remaining section files (start with simpler ones in medida directory)
2. Apply SectionCard migration pattern
3. Test each migration (verify no visual regressions)
4. Update todo list after each file
5. Mark P5 complete when all 35 sections done

**First File to Migrate:**
```typescript
// Start with: medida-documentos-section.tsx (medium complexity)
"src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/medida-documentos-section.tsx"
```

### Option 2: Start P7 (useFormSubmission Hook)
**Recommended if:** You want high impact with clear scope

**Steps:**
1. Search for form submission patterns (see P7 section)
2. Analyze common patterns and edge cases
3. Design hook API
4. Implement in `src/hooks/useFormSubmission.ts`
5. Migrate 3-5 forms as pilot
6. Document and migrate remaining forms

**Discovery Command:**
```bash
grep -r "const.*handleSubmit.*async" src/ -A 20 | head -100
```

### Option 3: Start Investigation
**Recommended if:** You want to plan the next wave of refactoring

**Steps:**
1. Run utility duplication search (see Investigation #5)
2. Analyze results and identify high-frequency patterns
3. Prioritize patterns by impact (frequency × lines saved)
4. Create detailed plan for next 3-5 tasks
5. Update this document with findings

**Investigation Command:**
```bash
# Find most common function patterns
grep -r "const.*=.*\(" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "useState\|useEffect\|import" | \
  awk -F '=' '{print $2}' | \
  sort | uniq -c | sort -rn | head -20
```

---

## 🔧 Useful Commands

### Search Commands
```bash
# Find Paper/Box header patterns (P5)
grep -r "Paper.*elevation.*mb.*p.*borderRadius" src/

# Find manual data fetching (P4 - verify completion)
grep -r "useState.*\[\]" src/ | grep "setLoading"

# Find form submission patterns (P7)
grep -r "const.*handleSubmit.*async" src/

# Find file size formatters (P8)
grep -r "formatFileSize\|1024.*KB.*MB" src/

# Find avatar utilities (P9)
grep -r "getInitials\|stringToColor" src/

# Find direct axios calls (P11)
grep -r "axios\.\|axiosInstance\." src/ --include="*.tsx" | grep -v "apiService"

# Find array manipulation (P12)
grep -r "\.reduce.*acc.*push\|\.sort.*\(a, b\)" src/

# Find object manipulation (P13)
grep -r "JSON.parse.*JSON.stringify\|Object.fromEntries" src/

# Find custom date components (P15)
grep -r "DateRangeFilter\|date.*range" src/ -i

# Find CircularProgress loading (P16)
grep -r "CircularProgress" src/ --include="*.tsx"
```

### Build & Validation
```bash
# Build project (TypeScript errors ignored in config)
npm run build

# Run ESLint
npm run lint

# Start dev server
npm run dev
```

### Git Workflow
```bash
# Check current status
git status
git branch

# Create feature branch
git checkout -b refactor/p5-remaining-sections

# Commit incrementally
git add .
git commit -m "refactor(P5): migrate medida-documentos-section to SectionCard"
```

---

## 📝 Session Checklist

### Starting a Session
- [ ] Read this document fully
- [ ] Review todo list in IDE
- [ ] Check git status and branch
- [ ] Choose continuation strategy (Option 1, 2, or 3)
- [ ] Run discovery commands for chosen task

### During the Session
- [ ] Update todo list after each file/task
- [ ] Commit incrementally (every 2-3 files)
- [ ] Test changes in dev server
- [ ] Document new patterns discovered
- [ ] Track lines saved for metrics

### Ending a Session
- [ ] Update this document with progress
- [ ] Update todo list with current state
- [ ] Commit all changes
- [ ] Update metrics section with totals
- [ ] Note any blockers or questions for next session

---

## 🐛 Known Issues & Solutions

### Issue 1: BaseDialog Import Error
**Problem:** Build error "Unexpected token BaseDialog"
**Cause:** Using named import for default export
**Solution:**
```typescript
// ✅ CORRECT
import BaseDialog from "@/components/shared/BaseDialog"

// ❌ WRONG
import { BaseDialog } from "@/components/shared/BaseDialog"
```

### Issue 2: SectionCard Not Found
**Problem:** Cannot find SectionCard component
**Cause:** Path might be different or component might have different name
**Solution:**
```bash
# Find the actual SectionCard location
find src -name "*SectionCard*" -o -name "*Section*Card*"

# Verify import path
grep -r "export.*SectionCard" src/
```

### Issue 3: useApiQuery Import Error
**Problem:** Cannot import useApiQuery
**Cause:** Hook might be in different location
**Solution:**
```bash
# Find the hook location
find src -name "useApiQuery*"

# Check for alternative names
grep -r "export.*useQuery\|export.*useApi" src/hooks/
```

---

## 💡 Pro Tips

### Tip 1: Use MUI MCP First
Before creating custom UI components, always query MUI MCP:
```
"MUI [component type] props and usage"
"MUI [component type] advanced patterns"
```

### Tip 2: Search Before Creating
Use comprehensive grep before creating new utilities:
```bash
# Search for similar functionality
grep -r "functionName\|similarPattern" src/
```

### Tip 3: Migrate Incrementally
Don't refactor large files all at once:
- Start with simple cases
- Test thoroughly
- Commit frequently
- Build confidence with pattern

### Tip 4: Preserve Functionality
When migrating components:
- Test all render states (loading, error, empty, data)
- Verify button/action functionality
- Check responsive behavior
- Validate no visual regressions

### Tip 5: Document as You Go
Update this document with:
- New patterns discovered
- Metrics (lines saved per file)
- Issues encountered and solutions
- Lessons learned

---

## 📚 References

### Project Documentation
- **CLAUDE.md** - Project architecture and patterns
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **next.config.mjs** - Next.js configuration

### Key Dependencies
- **Next.js:** 14.2.13 (App Router)
- **React:** 18.3.1
- **MUI:** v6 (@mui/material, @mui/x-data-grid, @mui/x-date-pickers)
- **TanStack Query:** v5 (React Query)
- **React Hook Form + Zod:** Form validation
- **Axios:** HTTP client

### External Resources
- MUI Documentation (via MUI MCP)
- TanStack Query Docs
- Next.js App Router Docs

---

## 🎯 Success Criteria

### P5 (SectionCard) Complete When:
- [ ] All 35 sections migrated
- [ ] No Paper/Box header patterns remain
- [ ] All functionality preserved
- [ ] No visual regressions
- [ ] ~800-900 total lines saved

### Overall Refactoring Success When:
- [ ] All 17 priority tasks complete
- [ ] ~2,700-3,300 lines saved
- [ ] ~120-130 files refactored
- [ ] No functionality broken
- [ ] Code maintainability improved
- [ ] Development velocity increased
- [ ] New developer onboarding easier

---

**Document Version:** 1.0
**Last Updated:** 2024-12-28
**Next Update:** After P5 completion or significant progress on pending tasks

---

## 🤝 Contributing to This Refactoring

When working on this refactoring:

1. **Update this document** with your progress
2. **Follow established patterns** documented here
3. **Add new patterns** you discover to the relevant sections
4. **Update metrics** after completing tasks
5. **Document issues** and solutions for future sessions
6. **Commit incrementally** with descriptive messages
7. **Test thoroughly** before marking tasks complete

**Remember:** The goal is not just to reduce lines of code, but to improve maintainability, consistency, and developer experience. Quality over quantity!

---

*Happy refactoring! 🚀*
