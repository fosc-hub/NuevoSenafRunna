# MPE Page UX Refactoring Workflow
## Data-Driven Architecture Following MPI Pattern

**Date**: 2025-10-20
**Status**: Implementation Plan
**Priority**: High - UX Consistency & Code Maintainability

---

## 📋 Executive Summary

This document outlines the comprehensive refactoring strategy to improve the MPE (Medida de Protección Excepcional) page UX by adopting the simpler, data-driven pattern currently used in MPI (Medida de Protección Inmediata).

### Goals
1. ✅ **Unified UX Pattern**: Apply MPI's clean, data-driven approach across all MPE workflow phases
2. ✅ **Component Reusability**: Create unified components for all document types (intervenciones, nota aval, informe jurídico, ratificación judicial)
3. ✅ **API Unification**: Standardize API service interactions across all document types
4. ✅ **Code Maintainability**: Reduce duplication across tabs (apertura, innovación, prórroga, cese)
5. ✅ **Scalability**: Enable easy addition of new workflow phases or document types

### Impact
- **User Experience**: Consistent, intuitive interface across all workflow phases
- **Development**: 60-70% reduction in code duplication
- **Maintenance**: Single source of truth for workflow components
- **Performance**: Improved data fetching and rendering efficiency

---

## 🔍 Current State Analysis

### MPI Pattern (Target Inspiration)
**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/apertura-section.tsx`

**Key Characteristics**:
```typescript
// Simple, data-driven approach
1. Fetch data dynamically: getIntervencionesByMedida(medidaId)
2. Display last intervention: "Ver Última Intervención" button
3. Create new intervention: "Nueva Intervención" button
4. Single modal for view/edit/create: RegistroIntervencionModal
5. Auto-reload after changes
6. Clean UI with minimal buttons
```

**Benefits**:
- Dynamic data loading (not hardcoded)
- Simple user flow: view last → or → create new
- Single modal handles all operations
- Automatic state management
- Clean, uncluttered interface

### MPE Current Pattern (Needs Improvement)
**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/apertura-tab.tsx`

**Current Issues**:
```typescript
// Complex, static approach
1. Hardcoded carousel with 5 steps (775 lines of JSX)
2. Manual UI construction with checkboxes, buttons, document lists
3. Multiple separate modals per document type (9+ modals)
4. No dynamic data fetching in initial render
5. Duplicated across all tabs (innovación, prórroga, cese)
6. Complex state management with many useState hooks
```

**Problems**:
- ❌ Hardcoded data and UI (not flexible)
- ❌ Massive component file (difficult to maintain)
- ❌ Duplicated logic across 4 tabs
- ❌ Inconsistent with MPI pattern
- ❌ Hard to add new document types or workflow steps

### API Services Analysis

All four document types follow similar patterns but have separate implementations:

#### 1. Intervenciones API
**File**: `api/intervenciones-api-service.ts`
- CRUD operations (create, getList, getDetail, update, delete)
- State transitions (enviar, aprobar, rechazar)
- Adjuntos management
- Query parameters support

#### 2. Nota Aval API
**File**: `api/nota-aval-api-service.ts`
- CRUD operations (create, getList, getDetail)
- Adjuntos management (PDF only)
- Decision tracking (APROBAR/OBSERVAR)
- Helper functions (getMostRecent, hasNotasAval)

#### 3. Informe Jurídico API
**File**: `api/informe-juridico-api-service.ts`
- CRUD operations (create, getList, getDetail, update)
- Enviar action (state transition)
- Adjuntos management (INFORME/ACUSE types)
- Helper functions (canSendInformeJuridico)

#### 4. Ratificación Judicial API
**File**: `api/ratificacion-judicial-api-service.ts`
- Read operations (getRatificacion, getHistorial)
- Create with multipart/form-data
- Single active ratificación per medida

**Commonalities**:
- All return arrays or single items
- All support medidaId as primary parameter
- All handle file uploads (adjuntos)
- All have similar error handling patterns
- All use similar TypeScript type definitions

**Unification Opportunity**: Create unified API facade with adapter pattern

---

## 🎯 Target Architecture

### Component Hierarchy

```
MPE Tab Component (apertura/innovación/prórroga/cese)
└─ WorkflowStepper (carousel/accordion)
   └─ WorkflowSection (unified component - reusable)
      ├─ Section Header (title, status chip, icons)
      ├─ Data Display (cards/list of items)
      ├─ Action Buttons
      │  ├─ "Ver Último [Type]" (if items exist)
      │  └─ "Agregar Nuevo [Type]" (always visible)
      └─ UnifiedWorkflowModal
         ├─ View Mode (read-only display)
         ├─ Edit Mode (form with validation)
         └─ Create Mode (empty form)
```

### Core Components

#### 1. WorkflowSection Component

**Purpose**: Generic section component that adapts to any document type

**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/workflow-section.tsx`

```typescript
interface WorkflowSectionProps {
  // Identifiers
  medidaId: number
  sectionType: 'intervencion' | 'nota-aval' | 'informe-juridico' | 'ratificacion'
  tipoMedida: 'MPE' | 'MPI'
  workflowPhase: 'apertura' | 'innovacion' | 'prorroga' | 'cese'

  // Configuration
  config: SectionConfig

  // Optional
  legajoData?: LegajoData
  onDataChange?: (data: any) => void
}

interface SectionConfig {
  // Display
  title: string
  icon: ReactNode
  description?: string

  // API Integration
  apiService: WorkflowApiService

  // Modal Configuration
  modalConfig: ModalConfig

  // Display Configuration
  displayConfig: DisplayConfig

  // Permissions
  permissions: PermissionConfig

  // Custom Behaviors
  customActions?: CustomAction[]
}
```

**Key Features**:
- Fetches data on mount using configured API service
- Displays items in configurable format (cards/list/table)
- Handles loading and error states
- Shows "Ver Último" button when items exist
- Shows "Agregar Nuevo" button always
- Opens unified modal with correct mode and configuration
- Auto-refreshes data after modal closes
- Supports custom action buttons per section type

**Example Usage**:
```typescript
<WorkflowSection
  medidaId={medidaId}
  sectionType="intervencion"
  tipoMedida="MPE"
  workflowPhase="apertura"
  config={intervencionSectionConfig}
  legajoData={legajoData}
/>
```

#### 2. UnifiedWorkflowModal Component

**Purpose**: Single modal that adapts to all document types and modes

**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/unified-workflow-modal.tsx`

```typescript
interface UnifiedWorkflowModalProps {
  // State
  open: boolean
  onClose: () => void

  // Identifiers
  medidaId: number
  itemId?: number // undefined for create mode
  sectionType: SectionType

  // Mode
  mode: 'view' | 'edit' | 'create'

  // Configuration
  config: ModalConfig

  // Callbacks
  onSaved?: (item: any) => void
  onDeleted?: () => void
}

interface ModalConfig {
  // Form Configuration
  fields: FieldConfig[]
  validationSchema: ValidationSchema

  // Actions
  allowEdit: boolean
  allowDelete: boolean
  customActions?: ModalAction[]

  // Display
  title: string
  submitButtonText?: string
  cancelButtonText?: string

  // File Uploads
  fileUploadConfig?: FileUploadConfig
}
```

**Key Features**:
- Fetches item data in view/edit modes
- Renders form fields based on configuration
- Handles form validation
- Supports file uploads (adjuntos)
- State transition actions (enviar, aprobar, rechazar)
- Responsive layout
- Loading and error states
- Success/error notifications

#### 3. Unified API Facade

**Purpose**: Standardized interface for all document types

**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/workflow-api-facade.ts`

```typescript
interface WorkflowApiService {
  // Read Operations
  getList: (medidaId: number, params?: QueryParams) => Promise<WorkflowItem[]>
  getDetail: (medidaId: number, itemId: number) => Promise<WorkflowItem>

  // Write Operations
  create: (medidaId: number, data: CreateData) => Promise<WorkflowItem>
  update?: (medidaId: number, itemId: number, data: UpdateData) => Promise<WorkflowItem>
  delete?: (medidaId: number, itemId: number) => Promise<void>

  // State Transitions
  stateActions?: StateActionService

  // File Management
  uploadFile?: (medidaId: number, itemId: number, file: File, type?: string) => Promise<Adjunto>
  getFiles?: (medidaId: number, itemId: number) => Promise<Adjunto[]>
  deleteFile?: (medidaId: number, itemId: number, fileId: number) => Promise<void>

  // Helpers
  getLatest?: (medidaId: number) => Promise<WorkflowItem | null>
  hasItems?: (medidaId: number) => Promise<boolean>
}

interface StateActionService {
  enviar?: (medidaId: number, itemId: number) => Promise<WorkflowItem>
  aprobar?: (medidaId: number, itemId: number) => Promise<WorkflowItem>
  rechazar?: (medidaId: number, itemId: number, reason: string) => Promise<WorkflowItem>
}
```

**Implementation Approach**: Adapter pattern

```typescript
// Example adapter for Intervenciones
export const intervencionApiAdapter: WorkflowApiService = {
  getList: (medidaId, params) => getIntervencionesByMedida(medidaId, params),
  getDetail: (medidaId, itemId) => getIntervencionDetail(medidaId, itemId),
  create: (medidaId, data) => createIntervencion(medidaId, data),
  update: (medidaId, itemId, data) => updateIntervencion(medidaId, itemId, data),
  delete: (medidaId, itemId) => deleteIntervencion(medidaId, itemId),
  stateActions: {
    enviar: (medidaId, itemId) => enviarIntervencion(medidaId, itemId),
    aprobar: (medidaId, itemId) => aprobarIntervencion(medidaId, itemId),
    rechazar: (medidaId, itemId, reason) => rechazarIntervencion(medidaId, itemId, { observaciones_jz: reason })
  },
  uploadFile: (medidaId, itemId, file, type) => uploadAdjunto(medidaId, itemId, file, type || 'MODELO'),
  getFiles: (medidaId, itemId) => getAdjuntos(medidaId, itemId),
  deleteFile: (medidaId, itemId, fileId) => deleteAdjunto(medidaId, itemId, fileId),
  getLatest: async (medidaId) => {
    const items = await getIntervencionesByMedida(medidaId, { ordering: '-fecha_creacion', limit: 1 })
    return items.length > 0 ? items[0] : null
  }
}

// Similar adapters for nota-aval, informe-juridico, ratificacion
```

### Configuration-Driven Architecture

#### Section Configurations

**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/section-configs.ts`

```typescript
// 1. Intervencion Section Config
export const intervencionSectionConfig: SectionConfig = {
  title: "Registro de Intervención",
  icon: <AssignmentIcon />,
  description: "Gestión de intervenciones de la medida",

  apiService: intervencionApiAdapter,

  modalConfig: {
    title: "Intervención",
    fields: [
      {
        name: 'tipo_dispositivo',
        label: 'Tipo de Dispositivo',
        type: 'select',
        required: true,
        options: [] // Fetched dynamically
      },
      {
        name: 'motivo',
        label: 'Motivo',
        type: 'select',
        required: true,
        options: []
      },
      {
        name: 'categoria_intervencion',
        label: 'Categoría',
        type: 'select',
        required: true,
        options: []
      },
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        required: false
      }
    ],
    allowEdit: true,
    allowDelete: true,
    customActions: [
      {
        label: 'Enviar a Aprobación',
        action: 'enviar',
        condition: (item) => item.estado === 'BORRADOR',
        requiresConfirmation: true
      },
      {
        label: 'Aprobar',
        action: 'aprobar',
        condition: (item) => item.estado === 'ENVIADO',
        requiresRole: 'JZ'
      },
      {
        label: 'Rechazar',
        action: 'rechazar',
        condition: (item) => item.estado === 'ENVIADO',
        requiresRole: 'JZ',
        requiresInput: {
          field: 'observaciones_jz',
          label: 'Motivo del rechazo'
        }
      }
    ],
    fileUploadConfig: {
      allowed: true,
      types: ['MODELO', 'ACTA', 'RESPALDO', 'INFORME'],
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png']
    }
  },

  displayConfig: {
    itemRenderer: 'card', // 'card' | 'list' | 'table'
    showStatusChip: true,
    showDate: true,
    showUser: true,
    cardFields: [
      { field: 'tipo_dispositivo_detalle.nombre', label: 'Dispositivo' },
      { field: 'motivo_detalle.nombre', label: 'Motivo' },
      { field: 'estado_display', label: 'Estado', chip: true }
    ]
  },

  permissions: {
    canView: ['ET', 'JZ', 'DIRECTOR', 'LEGAL'],
    canCreate: ['ET'],
    canEdit: ['ET'],
    canDelete: ['ET', 'JZ'],
    canApprove: ['JZ']
  }
}

// 2. Nota Aval Section Config
export const notaAvalSectionConfig: SectionConfig = {
  title: "Nota de Aval",
  icon: <ApprovalIcon />,
  description: "Aprobación por Director de Zona",

  apiService: notaAvalApiAdapter,

  modalConfig: {
    title: "Nota de Aval",
    fields: [
      {
        name: 'decision',
        label: 'Decisión',
        type: 'radio',
        required: true,
        options: [
          { value: 'APROBAR', label: 'Aprobar' },
          { value: 'OBSERVAR', label: 'Observar' }
        ]
      },
      {
        name: 'comentarios',
        label: 'Comentarios',
        type: 'textarea',
        required: true,
        minLength: 10,
        helperText: 'Obligatorio si se observa (mínimo 10 caracteres)'
      }
    ],
    allowEdit: false, // Immutable once created
    allowDelete: false,
    fileUploadConfig: {
      allowed: true,
      types: ['PDF'],
      maxSize: 10 * 1024 * 1024,
      acceptedFormats: ['application/pdf'],
      required: true
    }
  },

  displayConfig: {
    itemRenderer: 'card',
    showStatusChip: true,
    showDate: true,
    showUser: true,
    cardFields: [
      { field: 'decision_display', label: 'Decisión', chip: true },
      { field: 'emitido_por_detalle.nombre_completo', label: 'Emitido por' },
      { field: 'fecha_emision', label: 'Fecha', format: 'date' }
    ]
  },

  permissions: {
    canView: ['ET', 'JZ', 'DIRECTOR', 'LEGAL'],
    canCreate: ['DIRECTOR'],
    canEdit: [],
    canDelete: []
  }
}

// 3. Informe Jurídico Section Config
export const informeJuridicoSectionConfig: SectionConfig = {
  title: "Informe Jurídico",
  icon: <GavelIcon />,
  description: "Informe elaborado por Equipo Legal",

  apiService: informeJuridicoApiAdapter,

  modalConfig: {
    title: "Informe Jurídico",
    fields: [
      {
        name: 'instituciones_notificadas',
        label: 'Instituciones Notificadas',
        type: 'text',
        required: true
      },
      {
        name: 'destinatarios',
        label: 'Destinatarios',
        type: 'text',
        required: true
      },
      {
        name: 'fecha_notificaciones',
        label: 'Fecha de Notificaciones',
        type: 'date',
        required: true,
        maxDate: 'today'
      },
      {
        name: 'medio_notificacion',
        label: 'Medio de Notificación',
        type: 'select',
        required: false,
        options: [
          { value: 'EMAIL', label: 'Email' },
          { value: 'CORREO', label: 'Correo Postal' },
          { value: 'PRESENCIAL', label: 'Presencial' }
        ]
      },
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        required: false
      }
    ],
    allowEdit: true,
    allowDelete: false,
    customActions: [
      {
        label: 'Enviar Informe',
        action: 'enviar',
        condition: (item) => !item.enviado && item.tiene_informe_oficial,
        requiresConfirmation: true,
        confirmationMessage: 'Una vez enviado, el informe no podrá ser modificado. ¿Desea continuar?'
      },
      {
        label: 'Enviar Email',
        action: 'send-email',
        condition: (item) => item.enviado,
        customHandler: true
      }
    ],
    fileUploadConfig: {
      allowed: true,
      types: ['INFORME', 'ACUSE'],
      maxSize: 10 * 1024 * 1024,
      acceptedFormats: ['application/pdf'],
      maxFilesByType: {
        'INFORME': 1,
        'ACUSE': 10
      }
    }
  },

  displayConfig: {
    itemRenderer: 'card',
    showStatusChip: true,
    showDate: true,
    showUser: true,
    cardFields: [
      { field: 'instituciones_notificadas', label: 'Instituciones' },
      { field: 'enviado', label: 'Estado', chip: true, formatter: (value) => value ? 'Enviado' : 'Borrador' },
      { field: 'tiene_informe_oficial', label: 'Informe Oficial', icon: true }
    ]
  },

  permissions: {
    canView: ['ET', 'JZ', 'DIRECTOR', 'LEGAL'],
    canCreate: ['LEGAL'],
    canEdit: ['LEGAL'],
    canDelete: [],
    canSend: ['LEGAL']
  }
}

// 4. Ratificación Judicial Section Config
export const ratificacionSectionConfig: SectionConfig = {
  title: "Ratificación Judicial",
  icon: <AccountBalanceIcon />,
  description: "Ratificación por Poder Judicial",

  apiService: ratificacionApiAdapter,

  modalConfig: {
    title: "Ratificación Judicial",
    fields: [
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        required: false
      },
      {
        name: 'archivo_resolucion',
        label: 'Resolución Judicial',
        type: 'file',
        required: true,
        accept: 'application/pdf'
      }
    ],
    allowEdit: false,
    allowDelete: false,
    fileUploadConfig: {
      allowed: false, // Handled in form field
      embedded: true
    }
  },

  displayConfig: {
    itemRenderer: 'card',
    showStatusChip: false,
    showDate: true,
    showUser: true,
    cardFields: [
      { field: 'fecha_ratificacion', label: 'Fecha Ratificación', format: 'date' },
      { field: 'cargado_por_detalle.nombre_completo', label: 'Cargado por' },
      { field: 'tiene_archivo_resolucion', label: 'Resolución', icon: true }
    ]
  },

  permissions: {
    canView: ['ET', 'JZ', 'DIRECTOR', 'LEGAL'],
    canCreate: ['LEGAL', 'JZ'],
    canEdit: [],
    canDelete: []
  }
}
```

### Tab Structure

Each MPE tab (apertura, innovación, prórroga, cese) becomes a simple configuration:

**File**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/apertura-tab-unified.tsx`

```typescript
export const AperturaTabUnified: React.FC<TabProps> = ({ medidaData, legajoData }) => {
  const workflowSections = [
    {
      sectionType: 'intervencion' as const,
      config: intervencionSectionConfig,
      order: 1
    },
    {
      sectionType: 'nota-aval' as const,
      config: notaAvalSectionConfig,
      order: 2
    },
    {
      sectionType: 'informe-juridico' as const,
      config: informeJuridicoSectionConfig,
      order: 3
    },
    {
      sectionType: 'ratificacion' as const,
      config: ratificacionSectionConfig,
      order: 4
    }
  ]

  return (
    <Box sx={{ width: "100%" }}>
      <CarouselStepper steps={workflowSections.map(section => ({
        id: section.sectionType,
        title: section.config.title,
        content: (
          <WorkflowSection
            key={section.sectionType}
            medidaId={medidaData.id}
            sectionType={section.sectionType}
            tipoMedida="MPE"
            workflowPhase="apertura"
            config={section.config}
            legajoData={legajoData}
          />
        )
      }))} />
    </Box>
  )
}
```

**Benefits**:
- Each tab is ~30 lines (vs 775+ lines currently)
- Easy to reorder workflow steps
- Easy to add/remove sections
- All tabs share same components
- Configuration changes propagate automatically

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Create unified components without breaking existing functionality

#### Tasks:
1. **Create Unified API Facade** ⏱️ 3 days
   - File: `api/workflow-api-facade.ts`
   - Create `WorkflowApiService` interface
   - Implement adapters for all 4 document types
   - Add unit tests for each adapter
   - Validate type safety

2. **Create WorkflowSection Component** ⏱️ 4 days
   - File: `components/medida/shared/workflow-section.tsx`
   - Implement generic section component
   - Add data fetching with loading states
   - Implement item display (cards/list/table)
   - Add action buttons ("Ver Último", "Agregar Nuevo")
   - Add error handling and user feedback
   - Create unit tests

3. **Create UnifiedWorkflowModal Component** ⏱️ 4 days
   - File: `components/medida/shared/unified-workflow-modal.tsx`
   - Implement mode handling (view/edit/create)
   - Add form generation from config
   - Implement validation
   - Add file upload support
   - Add state transition actions
   - Create unit tests

4. **Create Section Configurations** ⏱️ 2 days
   - File: `components/medida/shared/section-configs.ts`
   - Define all 4 section configs (intervencion, nota-aval, informe-juridico, ratificacion)
   - Add field configurations
   - Define permissions
   - Add display configurations

**Deliverables**:
- ✅ Unified API facade with adapters
- ✅ WorkflowSection component
- ✅ UnifiedWorkflowModal component
- ✅ Section configurations
- ✅ Unit tests for all components
- ✅ TypeScript type definitions

**Validation**:
- Components render without errors
- All unit tests pass
- TypeScript compilation successful
- Components work in isolation (Storybook stories recommended)

### Phase 2: Pilot Implementation (Week 3)

**Goal**: Create one new tab using unified components for validation

#### Tasks:
1. **Create Apertura Tab V2** ⏱️ 2 days
   - File: `components/medida/mpe-tabs/apertura-tab-unified.tsx`
   - Implement using WorkflowSection components
   - Configure workflow steps
   - Add CarouselStepper integration
   - Test with real data

2. **Feature Flag Setup** ⏱️ 1 day
   - Add config flag: `USE_UNIFIED_MPE_TABS`
   - Create toggle in MPE tabs component
   - Allow switching between old/new implementation

3. **Integration Testing** ⏱️ 2 days
   - Test all CRUD operations
   - Test state transitions (enviar, aprobar, rechazar)
   - Test file uploads
   - Test permissions per role
   - Test error scenarios

4. **User Acceptance Testing** ⏱️ 1 day
   - Deploy to staging environment
   - Get feedback from key users (ET, Director, Legal)
   - Document issues and improvement opportunities

**Deliverables**:
- ✅ Apertura tab unified version
- ✅ Feature flag system
- ✅ Integration test suite
- ✅ UAT feedback document

**Validation**:
- Apertura tab works identically to old version
- All user workflows function correctly
- Performance is equal or better
- Users approve UX changes

### Phase 3: Full Migration (Week 4-5)

**Goal**: Migrate all remaining tabs to unified architecture

#### Tasks:
1. **Migrate Innovación Tab** ⏱️ 1 day
   - File: `components/medida/mpe-tabs/innovacion-tab-unified.tsx`
   - Configure workflow steps for innovación phase
   - Test thoroughly

2. **Migrate Prórroga Tab** ⏱️ 1 day
   - File: `components/medida/mpe-tabs/prorroga-tab-unified.tsx`
   - Configure workflow steps for prórroga phase
   - Test thoroughly

3. **Migrate Cese Tab** ⏱️ 1 day
   - File: `components/medida/mpe-tabs/cese-tab-unified.tsx`
   - Configure workflow steps for cese phase
   - Test thoroughly

4. **Update MPE Tabs Router** ⏱️ 1 day
   - Update `mpe-tabs.tsx` to use unified versions
   - Remove feature flag (make unified default)
   - Add deprecation warnings to old components

5. **Regression Testing** ⏱️ 2 days
   - Test all tabs with real data
   - Verify all user roles and permissions
   - Test edge cases and error scenarios
   - Performance testing

6. **Documentation Update** ⏱️ 1 day
   - Update component documentation
   - Create usage guide for developers
   - Document configuration options
   - Add troubleshooting guide

**Deliverables**:
- ✅ All 4 tabs migrated to unified architecture
- ✅ Feature flag removed
- ✅ Regression test suite passing
- ✅ Updated documentation

**Validation**:
- All tabs work identically to old versions
- No regressions detected
- Performance maintained or improved
- All tests passing

### Phase 4: Cleanup & Optimization (Week 6)

**Goal**: Remove old code and optimize unified components

#### Tasks:
1. **Remove Old Components** ⏱️ 1 day
   - Delete old tab files (apertura-tab.tsx, etc.)
   - Remove unused modal components
   - Clean up imports and dependencies
   - Update references

2. **Code Optimization** ⏱️ 2 days
   - Optimize data fetching (add caching)
   - Improve render performance (React.memo, useMemo)
   - Reduce bundle size
   - Add lazy loading for modals

3. **Accessibility Improvements** ⏱️ 1 day
   - Add ARIA labels
   - Improve keyboard navigation
   - Add screen reader support
   - Test with accessibility tools

4. **Performance Monitoring** ⏱️ 1 day
   - Add performance metrics
   - Monitor render times
   - Track API response times
   - Set up alerts for regressions

5. **Final Documentation** ⏱️ 1 day
   - Create architecture documentation
   - Document extension points
   - Add examples for adding new document types
   - Create maintenance guide

**Deliverables**:
- ✅ Old code removed
- ✅ Optimized components
- ✅ Accessibility improvements
- ✅ Performance monitoring setup
- ✅ Comprehensive documentation

**Validation**:
- Codebase is clean and maintainable
- Performance metrics are excellent
- Accessibility standards met
- Documentation is complete

---

## 🔧 Technical Implementation Details

### Custom Hook: useWorkflowData

Create a reusable hook for data fetching:

**File**: `hooks/useWorkflowData.ts`

```typescript
interface UseWorkflowDataOptions {
  medidaId: number
  sectionType: SectionType
  apiService: WorkflowApiService
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseWorkflowDataReturn {
  items: WorkflowItem[]
  lastItem: WorkflowItem | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  createItem: (data: any) => Promise<WorkflowItem>
  updateItem: (itemId: number, data: any) => Promise<WorkflowItem>
  deleteItem: (itemId: number) => Promise<void>
}

export function useWorkflowData(options: UseWorkflowDataOptions): UseWorkflowDataReturn {
  const { medidaId, sectionType, apiService, autoRefresh, refreshInterval = 30000 } = options

  const [items, setItems] = useState<WorkflowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiService.getList(medidaId)
      setItems(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [medidaId, apiService])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  const lastItem = useMemo(() => {
    if (items.length === 0) return null
    return items[0] // Assuming sorted by date desc
  }, [items])

  const createItem = useCallback(async (data: any) => {
    const newItem = await apiService.create(medidaId, data)
    await refresh()
    return newItem
  }, [medidaId, apiService, refresh])

  const updateItem = useCallback(async (itemId: number, data: any) => {
    if (!apiService.update) throw new Error('Update not supported')
    const updatedItem = await apiService.update(medidaId, itemId, data)
    await refresh()
    return updatedItem
  }, [medidaId, apiService, refresh])

  const deleteItem = useCallback(async (itemId: number) => {
    if (!apiService.delete) throw new Error('Delete not supported')
    await apiService.delete(medidaId, itemId)
    await refresh()
  }, [medidaId, apiService, refresh])

  return {
    items,
    lastItem,
    isLoading,
    error,
    refresh,
    createItem,
    updateItem,
    deleteItem
  }
}
```

### Permission System

**File**: `utils/permissions.ts`

```typescript
interface User {
  role: 'ET' | 'JZ' | 'DIRECTOR' | 'LEGAL' | 'SUPERUSER'
  zona_id: number
}

interface PermissionConfig {
  canView: string[]
  canCreate: string[]
  canEdit: string[]
  canDelete: string[]
  canApprove?: string[]
  canSend?: string[]
}

export function checkPermission(
  user: User,
  action: keyof PermissionConfig,
  config: PermissionConfig
): boolean {
  const allowedRoles = config[action]
  if (!allowedRoles) return false

  return allowedRoles.includes(user.role) || user.role === 'SUPERUSER'
}

export function usePermissions(config: PermissionConfig) {
  const { user } = useUser() // Custom hook to get current user

  return {
    canView: checkPermission(user, 'canView', config),
    canCreate: checkPermission(user, 'canCreate', config),
    canEdit: checkPermission(user, 'canEdit', config),
    canDelete: checkPermission(user, 'canDelete', config),
    canApprove: checkPermission(user, 'canApprove', config),
    canSend: checkPermission(user, 'canSend', config)
  }
}
```

### Error Handling

**File**: `utils/error-handling.ts`

```typescript
interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}

export function handleApiError(error: any): ApiError {
  // Handle axios errors
  if (error.response) {
    const { data, status } = error.response

    // Validation errors
    if (status === 400 && data.errors) {
      return {
        message: 'Errores de validación',
        code: 'VALIDATION_ERROR',
        details: data.errors
      }
    }

    // Permission errors
    if (status === 403) {
      return {
        message: 'No tiene permisos para realizar esta acción',
        code: 'PERMISSION_DENIED'
      }
    }

    // Not found
    if (status === 404) {
      return {
        message: 'Recurso no encontrado',
        code: 'NOT_FOUND'
      }
    }

    // Server errors
    if (status >= 500) {
      return {
        message: 'Error del servidor. Por favor intente nuevamente.',
        code: 'SERVER_ERROR'
      }
    }

    return {
      message: data.message || 'Error desconocido',
      code: 'UNKNOWN_ERROR'
    }
  }

  // Network errors
  if (error.request) {
    return {
      message: 'Error de conexión. Verifique su conexión a internet.',
      code: 'NETWORK_ERROR'
    }
  }

  // Other errors
  return {
    message: error.message || 'Error desconocido',
    code: 'UNKNOWN_ERROR'
  }
}

export function useErrorHandler() {
  const { showNotification } = useNotifications()

  return (error: any) => {
    const apiError = handleApiError(error)
    showNotification({
      type: 'error',
      message: apiError.message,
      details: apiError.details
    })
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `components/medida/shared/__tests__/workflow-section.test.tsx`

```typescript
describe('WorkflowSection', () => {
  it('fetches and displays items on mount', async () => {
    const mockApiService = {
      getList: jest.fn().mockResolvedValue([mockIntervencion])
    }

    render(
      <WorkflowSection
        medidaId={1}
        sectionType="intervencion"
        tipoMedida="MPE"
        workflowPhase="apertura"
        config={{ ...intervencionSectionConfig, apiService: mockApiService }}
      />
    )

    await waitFor(() => {
      expect(mockApiService.getList).toHaveBeenCalledWith(1)
      expect(screen.getByText('Ver Última Intervención')).toBeInTheDocument()
    })
  })

  it('shows "Agregar Nuevo" button always', () => {
    render(<WorkflowSection {...defaultProps} />)
    expect(screen.getByText('Nueva Intervención')).toBeInTheDocument()
  })

  it('disables "Ver Último" when no items exist', async () => {
    const mockApiService = {
      getList: jest.fn().mockResolvedValue([])
    }

    render(
      <WorkflowSection
        {...defaultProps}
        config={{ ...defaultProps.config, apiService: mockApiService }}
      />
    )

    await waitFor(() => {
      const button = screen.getByText('Sin Intervenciones')
      expect(button).toBeDisabled()
    })
  })

  it('handles API errors gracefully', async () => {
    const mockApiService = {
      getList: jest.fn().mockRejectedValue(new Error('API Error'))
    }

    render(
      <WorkflowSection
        {...defaultProps}
        config={{ ...defaultProps.config, apiService: mockApiService }}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

### Integration Tests

**File**: `__tests__/integration/mpe-apertura-workflow.test.tsx`

```typescript
describe('MPE Apertura Workflow Integration', () => {
  beforeEach(() => {
    setupMockApi()
  })

  it('completes full workflow: create → enviar → aprobar', async () => {
    const { user } = render(<AperturaTabUnified medidaData={mockMedida} />)

    // 1. Create intervention
    await user.click(screen.getByText('Nueva Intervención'))
    await user.selectOptions(screen.getByLabelText('Tipo de Dispositivo'), 'HOGAR_CONVIVIENTE')
    await user.type(screen.getByLabelText('Observaciones'), 'Test intervention')
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('Intervención creada exitosamente')).toBeInTheDocument()
    })

    // 2. Enviar to approval
    await user.click(screen.getByText('Ver Última Intervención'))
    await user.click(screen.getByText('Enviar a Aprobación'))
    await user.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(screen.getByText('Estado: ENVIADO')).toBeInTheDocument()
    })

    // 3. Approve (as JZ role)
    switchUserRole('JZ')
    await user.click(screen.getByText('Aprobar'))

    await waitFor(() => {
      expect(screen.getByText('Estado: APROBADO')).toBeInTheDocument()
    })
  })

  it('prevents unauthorized actions based on role', async () => {
    switchUserRole('ET') // ET cannot approve

    render(<AperturaTabUnified medidaData={mockMedida} />)

    await waitFor(() => {
      expect(screen.queryByText('Aprobar')).not.toBeInTheDocument()
    })
  })
})
```

### E2E Tests (Playwright)

**File**: `e2e/mpe-workflow.spec.ts`

```typescript
test.describe('MPE Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/legajo/123/medida/456')
    await loginAs(page, 'ET')
  })

  test('ET can create and send intervention', async ({ page }) => {
    // Navigate to Apertura tab
    await page.click('text=Apertura')

    // Create intervention
    await page.click('text=Nueva Intervención')
    await page.selectOption('[name="tipo_dispositivo"]', 'HOGAR_CONVIVIENTE')
    await page.fill('[name="observaciones"]', 'E2E test intervention')
    await page.click('text=Guardar')

    // Wait for success message
    await expect(page.locator('text=creada exitosamente')).toBeVisible()

    // Send to approval
    await page.click('text=Ver Última Intervención')
    await page.click('text=Enviar a Aprobación')
    await page.click('text=Confirmar')

    // Verify state change
    await expect(page.locator('text=ENVIADO')).toBeVisible()
  })

  test('JZ can approve sent intervention', async ({ page }) => {
    await loginAs(page, 'JZ')

    // Assume intervention exists and is ENVIADO
    await page.click('text=Apertura')
    await page.click('text=Ver Última Intervención')

    // Approve button should be visible for JZ
    await expect(page.locator('text=Aprobar')).toBeVisible()

    await page.click('text=Aprobar')
    await expect(page.locator('text=APROBADO')).toBeVisible()
  })
})
```

---

## ⚠️ Risk Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Breaking existing functionality | Medium | High | - Keep old code during migration<br>- Feature flags for gradual rollout<br>- Comprehensive testing |
| Performance degradation | Low | Medium | - Performance benchmarks before/after<br>- Optimize data fetching<br>- Use React.memo and useMemo |
| User confusion with UI changes | Low | Medium | - Keep UI identical to current<br>- User training if needed<br>- Clear documentation |
| API incompatibilities | Medium | High | - Thorough API adapter testing<br>- Validate all response formats<br>- Error handling for edge cases |
| Permission issues | Low | High | - Test all role combinations<br>- Validate permissions in backend<br>- Clear error messages |
| Data loss during migration | Low | Critical | - No data migration needed (UI only)<br>- Backup before deployment<br>- Rollback plan ready |

### Rollback Plan

If critical issues arise:

1. **Immediate Rollback** (< 5 minutes)
   - Toggle feature flag to old implementation
   - No code deployment needed
   - Minimal user impact

2. **Code Rollback** (< 30 minutes)
   - Revert to previous git commit
   - Redeploy old version
   - Restore old components

3. **Data Integrity Check**
   - Verify no data corruption
   - Check all recent transactions
   - Validate state transitions

### Monitoring and Alerts

Set up monitoring for:
- **Error Rates**: Alert if error rate > 1%
- **API Response Times**: Alert if p95 > 2 seconds
- **User Activity**: Track usage patterns
- **Performance Metrics**: Monitor render times

---

## 📊 Success Metrics

### Code Quality Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Lines of Code (LOC) | ~3000 | ~1000 | File line counts |
| Component Files | 20+ | 8-10 | File count |
| Code Duplication | 60%+ | <15% | SonarQube |
| Type Safety | 80% | 95%+ | TypeScript strict mode |
| Test Coverage | 40% | 80%+ | Jest coverage |

### Performance Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Initial Load Time | ~2s | <1.5s | Lighthouse |
| Time to Interactive | ~3s | <2s | Lighthouse |
| API Requests | 10+ | 4-6 | Network tab |
| Bundle Size | ~500KB | <350KB | webpack-bundle-analyzer |
| Render Time | ~300ms | <200ms | React DevTools Profiler |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Satisfaction | >4.5/5 | User surveys |
| Task Completion Rate | >95% | User testing |
| Error Rate | <2% | Analytics |
| Support Tickets | -30% | Help desk metrics |

---

## 📝 Migration Checklist

### Pre-Migration

- [ ] Backup current codebase
- [ ] Document current behavior
- [ ] Create test data set
- [ ] Set up staging environment
- [ ] Inform stakeholders of timeline

### Phase 1 Checklist

- [ ] Create WorkflowApiService interface
- [ ] Implement intervencion adapter
- [ ] Implement nota-aval adapter
- [ ] Implement informe-juridico adapter
- [ ] Implement ratificacion adapter
- [ ] Create WorkflowSection component
- [ ] Create UnifiedWorkflowModal component
- [ ] Create section configurations
- [ ] Write unit tests (80%+ coverage)
- [ ] Review and approve component designs

### Phase 2 Checklist

- [ ] Create apertura-tab-unified.tsx
- [ ] Implement feature flag system
- [ ] Test with real data
- [ ] Test all user roles
- [ ] Test error scenarios
- [ ] Conduct UAT with key users
- [ ] Document feedback
- [ ] Fix critical issues

### Phase 3 Checklist

- [ ] Migrate innovacion-tab
- [ ] Migrate prorroga-tab
- [ ] Migrate cese-tab
- [ ] Update MPE tabs router
- [ ] Remove feature flag
- [ ] Run regression tests
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Update documentation

### Phase 4 Checklist

- [ ] Remove old components
- [ ] Remove unused dependencies
- [ ] Optimize bundle size
- [ ] Improve accessibility
- [ ] Set up performance monitoring
- [ ] Final documentation
- [ ] Code review and approval
- [ ] Deploy to production

### Post-Migration

- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Collect user feedback
- [ ] Address issues promptly
- [ ] Document lessons learned
- [ ] Plan next optimizations

---

## 🎓 Learning Resources

### For Developers

1. **Architecture Overview**
   - Read this document thoroughly
   - Review component hierarchy diagram
   - Understand configuration-driven approach

2. **Code Examples**
   - Study WorkflowSection implementation
   - Review adapter pattern usage
   - Examine section configurations

3. **Testing Guide**
   - Unit testing patterns
   - Integration testing approach
   - E2E testing scenarios

### For Users

1. **UI Changes**
   - Interface remains largely the same
   - Improved consistency across tabs
   - Faster loading and better performance

2. **Workflow Changes**
   - No changes to business processes
   - Same actions and permissions
   - Enhanced error messages

---

## 🔮 Future Enhancements

### Phase 5: Advanced Features (Post-Migration)

1. **Real-time Updates**
   - WebSocket integration
   - Live collaboration features
   - Notification system

2. **Bulk Operations**
   - Batch create/update/delete
   - Bulk state transitions
   - Export/import functionality

3. **Advanced Filtering**
   - Date range filters
   - Multi-field search
   - Saved filter presets

4. **Audit Trail**
   - Comprehensive change history
   - User action tracking
   - Data versioning

5. **Mobile Optimization**
   - Responsive design improvements
   - Touch-friendly interactions
   - Offline capabilities

---

## 📞 Support and Contacts

### Technical Support

- **Development Team Lead**: [Name]
- **Architecture Review**: [Name]
- **QA Lead**: [Name]

### Stakeholder Communication

- **Product Owner**: [Name]
- **User Representatives**: [Names]
- **Change Management**: [Name]

### Emergency Contacts

- **On-Call Developer**: [Phone]
- **DevOps Support**: [Phone]
- **Incident Manager**: [Phone]

---

## 📅 Timeline Summary

| Phase | Duration | Start | End | Key Deliverables |
|-------|----------|-------|-----|------------------|
| Phase 1: Foundation | 2 weeks | Week 1 | Week 2 | Unified components |
| Phase 2: Pilot | 1 week | Week 3 | Week 3 | Apertura tab v2 |
| Phase 3: Migration | 2 weeks | Week 4 | Week 5 | All tabs migrated |
| Phase 4: Cleanup | 1 week | Week 6 | Week 6 | Optimized codebase |
| **Total** | **6 weeks** | | | **Production Ready** |

---

## ✅ Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Technical Lead | | | |
| Product Owner | | | |
| QA Lead | | | |
| Architecture Review | | | |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Next Review Date**: After Phase 2 completion

---

## Appendix A: Component File Structure

```
src/app/(runna)/legajo/[id]/medida/[medidaId]/
├── api/
│   ├── workflow-api-facade.ts              # NEW: Unified API interface
│   ├── intervenciones-api-service.ts       # Existing
│   ├── nota-aval-api-service.ts            # Existing
│   ├── informe-juridico-api-service.ts     # Existing
│   └── ratificacion-judicial-api-service.ts # Existing
├── components/
│   └── medida/
│       ├── shared/                          # NEW: Shared components
│       │   ├── workflow-section.tsx         # NEW: Generic section
│       │   ├── unified-workflow-modal.tsx   # NEW: Generic modal
│       │   ├── section-configs.ts           # NEW: Configurations
│       │   ├── item-card.tsx                # NEW: Display component
│       │   └── __tests__/                   # NEW: Tests
│       ├── mpe-tabs/
│       │   ├── apertura-tab-unified.tsx     # NEW: Refactored
│       │   ├── innovacion-tab-unified.tsx   # NEW: Refactored
│       │   ├── prorroga-tab-unified.tsx     # NEW: Refactored
│       │   ├── cese-tab-unified.tsx         # NEW: Refactored
│       │   ├── apertura-tab.tsx             # OLD: To be removed
│       │   ├── innovacion-tab.tsx           # OLD: To be removed
│       │   ├── prorroga-tab.tsx             # OLD: To be removed
│       │   └── cese-tab.tsx                 # OLD: To be removed
│       └── apertura-section.tsx             # Existing MPI pattern
├── hooks/
│   ├── useWorkflowData.ts                   # NEW: Data fetching hook
│   └── usePermissions.ts                    # NEW: Permission hook
├── utils/
│   ├── permissions.ts                       # NEW: Permission utilities
│   └── error-handling.ts                    # NEW: Error utilities
└── types/
    └── workflow.ts                          # NEW: Unified type definitions
```

---

## Appendix B: Configuration Example

Complete example of intervencion section configuration:

```typescript
export const intervencionSectionConfig: SectionConfig = {
  // Display Configuration
  title: "Registro de Intervención",
  icon: <AssignmentIcon color="primary" />,
  description: "Gestión de intervenciones de la medida",
  emptyStateMessage: "No hay intervenciones registradas",

  // API Integration
  apiService: intervencionApiAdapter,

  // Modal Configuration
  modalConfig: {
    title: "Intervención",
    width: 'md', // 'sm' | 'md' | 'lg' | 'xl'

    // Form Fields
    fields: [
      {
        name: 'tipo_dispositivo',
        label: 'Tipo de Dispositivo',
        type: 'select',
        required: true,
        grid: { xs: 12, sm: 6 },
        options: [], // Fetched dynamically from API
        apiEndpoint: 'tipos-dispositivos',
        helperText: 'Seleccione el tipo de dispositivo para esta intervención'
      },
      {
        name: 'motivo',
        label: 'Motivo',
        type: 'select',
        required: true,
        grid: { xs: 12, sm: 6 },
        options: [],
        apiEndpoint: 'motivos',
        dependsOn: 'tipo_dispositivo' // Only load after tipo_dispositivo selected
      },
      {
        name: 'categoria_intervencion',
        label: 'Categoría de Intervención',
        type: 'select',
        required: true,
        grid: { xs: 12 },
        options: [],
        apiEndpoint: 'categorias-intervencion'
      },
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        required: false,
        grid: { xs: 12 },
        rows: 4,
        maxLength: 1000,
        helperText: 'Información adicional sobre la intervención'
      }
    ],

    // Validation
    validationSchema: yup.object({
      tipo_dispositivo: yup.number().required('Tipo de dispositivo es obligatorio'),
      motivo: yup.number().required('Motivo es obligatorio'),
      categoria_intervencion: yup.number().required('Categoría es obligatoria'),
      observaciones: yup.string().max(1000, 'Máximo 1000 caracteres')
    }),

    // Actions
    allowEdit: true,
    allowDelete: true,
    editableStates: ['BORRADOR'], // Only allow edit when BORRADOR

    // Custom Actions
    customActions: [
      {
        label: 'Enviar a Aprobación',
        action: 'enviar',
        icon: <SendIcon />,
        color: 'primary',
        condition: (item) => item.estado === 'BORRADOR',
        requiresConfirmation: true,
        confirmationTitle: 'Enviar Intervención',
        confirmationMessage: '¿Está seguro que desea enviar esta intervención para aprobación? No podrá editarla después.',
        successMessage: 'Intervención enviada exitosamente',
        errorMessage: 'Error al enviar intervención'
      },
      {
        label: 'Aprobar',
        action: 'aprobar',
        icon: <CheckCircleIcon />,
        color: 'success',
        condition: (item) => item.estado === 'ENVIADO',
        requiresRole: 'JZ',
        requiresConfirmation: true,
        confirmationTitle: 'Aprobar Intervención',
        confirmationMessage: '¿Confirma la aprobación de esta intervención?',
        successMessage: 'Intervención aprobada exitosamente'
      },
      {
        label: 'Rechazar',
        action: 'rechazar',
        icon: <CancelIcon />,
        color: 'error',
        condition: (item) => item.estado === 'ENVIADO',
        requiresRole: 'JZ',
        requiresInput: {
          field: 'observaciones_jz',
          label: 'Motivo del rechazo',
          type: 'textarea',
          required: true,
          minLength: 10,
          helperText: 'Indique el motivo del rechazo (mínimo 10 caracteres)'
        },
        requiresConfirmation: true,
        confirmationTitle: 'Rechazar Intervención',
        confirmationMessage: 'La intervención será devuelta a borrador para correcciones.',
        successMessage: 'Intervención rechazada. Se notificará al equipo técnico.'
      }
    ],

    // File Upload Configuration
    fileUploadConfig: {
      allowed: true,
      multiple: true,
      types: [
        { value: 'MODELO', label: 'Modelo de Intervención' },
        { value: 'ACTA', label: 'Acta' },
        { value: 'RESPALDO', label: 'Documentación de Respaldo' },
        { value: 'INFORME', label: 'Informe Técnico' }
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'],
      showPreview: true,
      allowDelete: true,
      disableWhenSent: true // Disable file operations after estado !== BORRADOR
    }
  },

  // Display Configuration
  displayConfig: {
    itemRenderer: 'card', // 'card' | 'list' | 'table'
    showStatusChip: true,
    showDate: true,
    showUser: true,
    sortBy: 'fecha_creacion',
    sortOrder: 'desc',

    // Card Layout
    cardFields: [
      {
        field: 'tipo_dispositivo_detalle.nombre',
        label: 'Dispositivo',
        icon: <HomeIcon />,
        priority: 1
      },
      {
        field: 'motivo_detalle.nombre',
        label: 'Motivo',
        icon: <InfoIcon />,
        priority: 2
      },
      {
        field: 'estado_display',
        label: 'Estado',
        chip: true,
        chipColor: (value) => {
          switch(value) {
            case 'BORRADOR': return 'default'
            case 'ENVIADO': return 'warning'
            case 'APROBADO': return 'success'
            case 'RECHAZADO': return 'error'
            default: return 'default'
          }
        },
        priority: 0 // Highest priority - always show
      },
      {
        field: 'fecha_creacion',
        label: 'Fecha',
        format: 'date',
        formatString: 'DD/MM/YYYY HH:mm',
        priority: 3
      }
    ],

    // Status Chip Configuration
    statusChipConfig: {
      field: 'estado_display',
      colorMap: {
        'BORRADOR': 'default',
        'ENVIADO': 'warning',
        'APROBADO': 'success',
        'RECHAZADO': 'error'
      }
    },

    // Empty State
    emptyState: {
      icon: <AssignmentIcon fontSize="large" />,
      title: 'No hay intervenciones',
      description: 'Comience agregando una nueva intervención para esta medida.',
      action: {
        label: 'Agregar Primera Intervención',
        icon: <AddIcon />
      }
    }
  },

  // Permissions
  permissions: {
    canView: ['ET', 'JZ', 'DIRECTOR', 'LEGAL', 'SUPERUSER'],
    canCreate: ['ET', 'SUPERUSER'],
    canEdit: ['ET', 'SUPERUSER'],
    canDelete: ['ET', 'JZ', 'SUPERUSER'],
    canApprove: ['JZ', 'SUPERUSER'],
    canSend: ['ET', 'SUPERUSER']
  },

  // Advanced Options
  advanced: {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableNotifications: true,
    trackChanges: true,
    enableComments: false,
    enableHistory: true
  }
}
```

This comprehensive configuration demonstrates the full flexibility of the unified architecture while maintaining clean, declarative code.
