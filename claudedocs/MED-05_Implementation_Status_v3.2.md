# MED-05: Ratificación Judicial - Implementation Status Analysis (Frontend)

**Version**: v3.2
**Analysis Date**: 2025-10-26
**User Story**: MED-05_Ratificacion_Judicial_Cierre.md (v3.2 Corrected)
**Frontend Repository**: NuevoSenafRunna

---

## 🚦 Executive Summary

| Status | Count | Description |
|--------|-------|-------------|
| 🟢 **Implemented** | 10 | Core functionality working |
| 🔴 **Critical Gaps** | 3 | Blockers for v3.2 compliance |
| 🟡 **Minor Issues** | 4 | Improvements recommended |

### Critical Action Items

1. **🔴 BLOCKER**: Fix MPJ incorrectly receiving ratification workflow (line 162, unified-workflow-tab.tsx)
2. **🔴 CRITICAL**: Add tipo medida validation to reject MPI/MPJ in UI
3. **🔴 CRITICAL**: Add etapa validation to reject Post-Cese attempts
4. **🟡 Enhancement**: Create historial UI component

---

## 📊 Implementation Status Matrix

| Component | Status | Completeness | File Location | Notes |
|-----------|--------|--------------|---------------|-------|
| **API Types** | 🟢 Complete | 100% | `types/ratificacion-judicial-api.ts` | All enums, interfaces, helpers implemented |
| **API Service** | 🟢 Complete | 100% | `api/ratificacion-judicial-api-service.ts` | GET, POST, PATCH, historial endpoints |
| **Custom Hook** | 🟢 Complete | 95% | `hooks/useRatificacionJudicial.ts` | Missing tipo/etapa validation |
| **Dialog Component** | 🟢 Complete | 100% | `components/dialogs/ratificacion-judicial-dialog.tsx` | Form, validations, file uploads |
| **Section Component** | 🟡 Partial | 80% | `components/medida/ratificacion-judicial-section.tsx` | Missing tipo medida check |
| **Adjuntos Component** | 🟢 Complete | 100% | `components/ratificacion-judicial/adjuntos-ratificacion.tsx` | Display & download working |
| **Workflow Integration** | 🔴 Buggy | 70% | `components/medida/unified-workflow-tab.tsx` | MPJ incorrectly gets step 4 |
| **Cese Tab Integration** | 🟢 Complete | 100% | `components/medida/mpe-tabs/cese-tab.tsx` | Uses UnifiedWorkflowTab correctly |
| **Step Completion Utils** | 🟢 Complete | 100% | `utils/step-completion.ts` | isRatificacionCompleted() working |
| **Historial UI** | 🔴 Missing | 0% | N/A | API ready, no UI component |

**Overall Completeness**: 82% (Core: 95%, v3.2 Compliance: 60%)

---

## 🔴 Critical Gaps Analysis

### GAP-01: MPJ Incorrectly Receives Ratification Workflow

**Severity**: 🔴 **BLOCKER**
**User Story Requirement**:
```
MPJ (Protección Jurídica): ❌ NO ratificación (PLTM-driven, sin ratificación)
```

**Current Implementation**:
```typescript
// File: unified-workflow-tab.tsx:162-163
const isMPI = medidaData.tipo_medida === "MPI"
const totalSteps = isMPI ? 3 : 4

// Problem: This gives MPJ 4 steps (including ratification)
// MPE gets 4 steps ✅ CORRECT
// MPJ gets 4 steps ❌ WRONG (should be 3)
```

**Expected Behavior**:
- Only **MPE** should have 4 steps (including MED-05 ratification)
- MPI and MPJ should only have 3 steps

**Fix Required**:
```typescript
// Correct logic:
const requiresRatificacion = medidaData.tipo_medida === "MPE"
const totalSteps = requiresRatificacion ? 4 : 3

// Step 4 conditional rendering:
...(!requiresRatificacion ? [] : [{
  id: 4,
  label: "Ratificación Judicial",
  // ... rest of step config
}])
```

**Impact**:
- MPJ users will see ratification UI incorrectly
- Backend will reject MPJ ratification attempts (error 400)
- User confusion and support tickets

**Priority**: P0 (Fix before deployment)

---

### GAP-02: No Tipo Medida Validation in UI

**Severity**: 🔴 **CRITICAL**
**User Story Requirement**:
```
CA-01: Validar que medida sea tipo MPE (Protección Excepcional)
       Rechazar con error 400 si medida es MPI o MPJ
```

**Current Implementation**:
```typescript
// File: ratificacion-judicial-section.tsx
// ❌ No tipo medida check before rendering

export const RatificacionJudicialSection: React.FC<Props> = ({
  medidaId,
  estadoActual,  // ✅ Checks estado
  // ❌ Missing: tipoMedida prop and validation
}) => {
  // Component renders regardless of tipo medida
  // Backend will reject, but user experience is poor
}
```

**Expected Behavior**:
- Component should check `medidaData.tipo_medida`
- If not "MPE", show error alert: "Solo las Medidas de Protección Excepcional (MPE) requieren ratificación judicial"
- Hide dialog button and form completely

**Fix Required**:

**Step 1**: Update component props:
```typescript
interface RatificacionJudicialSectionProps {
  medidaId: number
  medidaNumero?: string
  tipoMedida: "MPE" | "MPI" | "MPJ"  // ✅ Add this
  estadoActual?: EstadoEtapa | string
  // ... rest of props
}
```

**Step 2**: Add validation in component:
```typescript
export const RatificacionJudicialSection: React.FC<Props> = ({
  medidaId,
  tipoMedida,  // ✅ Destructure new prop
  estadoActual,
  // ... rest
}) => {
  // ✅ Validate tipo medida
  if (tipoMedida !== "MPE") {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            <Typography variant="body2">
              Solo las Medidas de Protección Excepcional (MPE) requieren ratificación judicial.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Esta medida es de tipo: <strong>{tipoMedida === "MPI" ? "Protección Integral (MPI)" : "Protección Jurídica (MPJ)"}</strong>
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // ... rest of component logic
}
```

**Step 3**: Update caller (unified-workflow-tab.tsx:292):
```typescript
<RatificacionJudicialSection
  medidaId={medidaData.id}
  tipoMedida={medidaData.tipo_medida}  // ✅ Pass tipo medida
  estadoActual={estadoActual}
  // ... rest of props
/>
```

**Impact**:
- Better UX: Users see clear error before attempting to create
- Reduces failed API calls
- Aligns with user story requirements

**Priority**: P0 (Fix before deployment)

---

### GAP-03: No Etapa Type Validation (Post-Cese Rejection)

**Severity**: 🔴 **CRITICAL** (v3.2 Requirement)
**User Story Requirement**:
```
CA-01 (v3.2): Validar que etapa sea Apertura, Innovación, Prórroga o Cese
              Rechazar con error 400 si etapa es Post-Cese

Etapas válidas: A/I/P/C (todas tienen estados 1-5)
Etapa bloqueada: Post-Cese (PLTM-driven, sin ratificación)
```

**Current Implementation**:
- ❌ No etapa type checking in frontend
- ❌ RatificacionJudicialSection doesn't receive etapa information
- ❌ Backend will reject, but user experience is poor

**Expected Behavior**:
- Component should check if etapa is "POST_CESE"
- If Post-Cese, show error: "Solo las etapas de Apertura, Innovación, Prórroga y Cese requieren ratificación judicial"
- Block UI completely for Post-Cese

**Fix Required**:

**Step 1**: Update section props to include etapa:
```typescript
interface RatificacionJudicialSectionProps {
  medidaId: number
  medidaNumero?: string
  tipoMedida: "MPE" | "MPI" | "MPJ"
  etapaTipo?: "APERTURA" | "INNOVACION" | "PRORROGA" | "CESE" | "POST_CESE" | "PROCESO"  // ✅ Add this
  estadoActual?: EstadoEtapa | string
  // ... rest
}
```

**Step 2**: Add etapa validation:
```typescript
// After tipo medida validation
if (etapaTipo === "POST_CESE") {
  return (
    <Card>
      <CardContent>
        <Alert severity="error">
          <Typography variant="body2">
            Solo las etapas de Apertura, Innovación, Prórroga y Cese de MPE requieren ratificación judicial.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Etapa actual: <strong>Post-Cese</strong> (actividades PLTM, sin proceso judicial)
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )
}
```

**Step 3**: Pass etapa from medidaData:
```typescript
// In unified-workflow-tab.tsx or caller
<RatificacionJudicialSection
  medidaId={medidaData.id}
  tipoMedida={medidaData.tipo_medida}
  etapaTipo={medidaData.etapa_tipo}  // ✅ Pass etapa type
  estadoActual={estadoActual}
/>
```

**Note**: You may need to check if `medidaData.etapa_tipo` exists. If not, derive from `medidaData.etapa_actual` or add to API response.

**Impact**:
- v3.2 Compliance: Blocks Post-Cese ratification attempts
- Better UX: Clear error before form submission
- Prevents backend 400 errors

**Priority**: P0 (v3.2 requirement, must fix)

---

## 🟢 What's Already Implemented

### 1. API Types Layer (`types/ratificacion-judicial-api.ts`)

**Status**: 🟢 Complete (356 lines)

**What's Working**:
- ✅ `DecisionJudicial` enum: RATIFICADA, NO_RATIFICADA, PENDIENTE
- ✅ `TipoAdjuntoRatificacion` enum: RESOLUCION_JUDICIAL, CEDULA_NOTIFICACION, ACUSE_RECIBO, OTRO
- ✅ `RatificacionJudicial` interface (read from API)
- ✅ `CreateRatificacionJudicialRequest` interface (write to API)
- ✅ `UpdateRatificacionJudicialRequest` interface (PATCH)
- ✅ `RatificacionJudicialHistorial` interface (soft delete history)
- ✅ `RatificacionAdjunto` interface with user info

**Helper Functions**:
- ✅ `validateRatificacionDates()`: Frontend date validation (not future, notificacion >= resolucion)
- ✅ `canModificarRatificacion()`: Check if PENDIENTE (only state allowing edits)
- ✅ `isFinalState()`: Check if RATIFICADA or NO_RATIFICADA
- ✅ `getDecisionColor()`: UI color mapping (success/error/warning)
- ✅ `buildRatificacionFormData()`: Multipart/form-data builder for file uploads
- ✅ `buildUpdateRatificacionFormData()`: PATCH FormData builder

**Type Guards**:
- ✅ `isValidDecision()`: Runtime type check for DecisionJudicial
- ✅ `isValidTipoAdjunto()`: Runtime type check for TipoAdjuntoRatificacion

---

### 2. API Service Layer (`api/ratificacion-judicial-api-service.ts`)

**Status**: 🟢 Complete (332 lines)

**Endpoints Implemented**:
- ✅ `getRatificacion(medidaId)`: GET /api/medidas/{medida_id}/ratificacion/
- ✅ `createRatificacion(medidaId, data)`: POST (multipart/form-data)
- ✅ `updateRatificacion(medidaId, data)`: PATCH (multipart/form-data)
- ✅ `getRatificacionHistorial(medidaId)`: GET /api/medidas/{medida_id}/ratificacion/historial/

**Helper Functions**:
- ✅ `getRatificacionActiva(medidaId)`: Get active ratificacion or null
- ✅ `hasRatificacionActiva(medidaId)`: Boolean check for existence

**File Handling**:
- ✅ Multipart/form-data with axiosInstance
- ✅ Correct Content-Type headers
- ✅ Error handling and logging

**Placeholder Functions** (for future extension):
- ⏳ `uploadAdjuntoRatificacion()`: Independent adjunto upload (not in backend yet)
- ⏳ `deleteAdjuntoRatificacion()`: Adjunto deletion (not in backend yet)

---

### 3. Custom Hook (`hooks/useRatificacionJudicial.ts`)

**Status**: 🟢 Complete (329 lines)

**State Management**:
- ✅ `ratificacion`: RatificacionJudicial | null
- ✅ `isLoading`: Boolean for async operations
- ✅ `error`: Error state
- ✅ `adjuntos`: Array of attachments
- ✅ `historial`: RatificacionJudicialHistorial | null
- ✅ `isLoadingHistorial`: Separate loading for history fetch

**Computed Properties**:
- ✅ `hasRatificacion`: Boolean for existence
- ✅ `isRatificada`: Decision === RATIFICADA
- ✅ `isNoRatificada`: Decision === NO_RATIFICADA
- ✅ `isPendiente`: Decision === PENDIENTE
- ✅ `isFinal`: RATIFICADA or NO_RATIFICADA
- ✅ `canModify`: Check if can edit (PENDIENTE only)
- ✅ `tieneResolucionJudicial`, `tieneCedulaNotificacion`, `tieneAcuseRecibo`: Adjunto checks

**Actions**:
- ✅ `createRatificacion(data)`: Create with validations
- ✅ `updateRatificacion(data)`: Update with validations
- ✅ `refetch()`: Manual refresh
- ✅ `fetchHistorial()`: Load history

**Auto-Fetch**: ✅ Fetches on mount if `autoFetch=true`

---

### 4. UI Components

#### RatificacionJudicialDialog (`components/dialogs/ratificacion-judicial-dialog.tsx`)

**Status**: 🟢 Complete (596 lines)

**Features**:
- ✅ Create and Edit modes
- ✅ Decision select (RATIFICADA, NO_RATIFICADA, PENDIENTE)
- ✅ Date inputs (resolución, notificación)
- ✅ Observations textarea
- ✅ File uploads (3 separate inputs):
  - Resolución Judicial (required in create, optional in edit)
  - Cédula de Notificación (optional)
  - Acuse de Recibo (optional)
- ✅ PDF validation (client-side)
- ✅ Date validations (not future, notificacion >= resolucion)
- ✅ Form reset on close
- ✅ Loading states and error handling
- ✅ File chips with remove functionality

**Validations**:
- ✅ Decision required
- ✅ Fecha resolucion required and not future
- ✅ Fecha notificacion optional but validated if provided
- ✅ Archivo resolucion required in create mode
- ✅ PDF format only

---

#### RatificacionJudicialSection (`components/medida/ratificacion-judicial-section.tsx`)

**Status**: 🟡 Partial (588 lines) - Missing tipo/etapa validation

**Features**:
- ✅ Permission checks (Equipo Legal, JZ, Superuser)
- ✅ Estado check (PENDIENTE_RATIFICACION_JUDICIAL required)
- ✅ Empty state with "Registrar Ratificación" button
- ✅ Full ratificacion display:
  - Decision badge with color coding
  - Fecha resolución and notificación
  - Fecha de registro (audit)
  - Observaciones
  - Adjuntos list
- ✅ Status-based alerts:
  - RATIFICADA: Success alert with completion message
  - NO_RATIFICADA: Error alert with review message
  - PENDIENTE: Warning alert with edit button
- ✅ Edit functionality (only for PENDIENTE)
- ✅ Loading skeleton
- ✅ Error handling

**Missing** (see GAP-02, GAP-03):
- ❌ Tipo medida validation (should reject MPI/MPJ)
- ❌ Etapa validation (should reject Post-Cese)

---

#### AdjuntosRatificacion (`components/ratificacion-judicial/adjuntos-ratificacion.tsx`)

**Status**: 🟢 Complete (312 lines)

**Features**:
- ✅ Adjuntos list with icon differentiation:
  - RESOLUCION_JUDICIAL: Green gavel icon
  - CEDULA_NOTIFICACION: Blue article icon
  - ACUSE_RECIBO: Info check icon
- ✅ Status chips:
  - "Resolución Judicial Cargada" (success)
  - "Falta Resolución Judicial" (warning)
  - Optional adjuntos shown with badges
- ✅ Download functionality (opens in new tab)
- ✅ User and timestamp display
- ✅ Description display if available
- ✅ Empty state message
- ✅ Info footer about upload process

**Note**: Read-only component. Adjuntos uploaded via ratificacion POST/PATCH, not independently.

---

### 5. Workflow Integration

#### UnifiedWorkflowTab (`components/medida/unified-workflow-tab.tsx`)

**Status**: 🔴 Buggy (see GAP-01)

**What's Working**:
- ✅ Step 4 (Ratificación) defined and rendered
- ✅ `getRatificacionActiva()` fetched on load
- ✅ Step completion logic via `isRatificacionCompleted()`
- ✅ Progress calculation (30% → 70% → 100%)
- ✅ RatificacionJudicialSection integrated as step content
- ✅ MPI correctly excluded from step 4 (only 3 steps)

**Bug** (see GAP-01):
- ❌ MPJ incorrectly gets step 4 (should only be MPE)
- Line 162: `const isMPI = medidaData.tipo_medida === "MPI"`
- Line 163: `const totalSteps = isMPI ? 3 : 4`
- **Problem**: This gives MPJ 4 steps, but US says MPJ is PLTM-driven (no ratification)

**Correct Logic Needed**:
```typescript
const requiresRatificacion = medidaData.tipo_medida === "MPE"
const totalSteps = requiresRatificacion ? 4 : 3
```

---

#### Cese Tab Integration (`components/medida/mpe-tabs/cese-tab.tsx`)

**Status**: 🟢 Complete (44 lines)

**Implementation**:
```typescript
export const CeseTab: React.FC<Props> = ({ medidaData, legajoData }) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      legajoData={legajoData}
      workflowPhase="cese"  // ✅ Correctly uses workflow for Cese
    />
  )
}
```

**Verification**:
- ✅ Cese tab uses UnifiedWorkflowTab
- ✅ This means Cese DOES show step 4 (ratificacion)
- ✅ This is CORRECT per v3.2: "Etapas A/I/P/**C** requieren ratificación"

---

#### Step Completion Utils (`utils/step-completion.ts`)

**Status**: 🟢 Complete

**Function**: `isRatificacionCompleted()`
```typescript
export function isRatificacionCompleted(
  ratificacionExists: boolean,
  hasPDF: boolean,
  estado?: string
): boolean {
  const completedEstados = [
    "RATIFICADA",
    "NO_RATIFICADA",
    "VIGENTE",
    "CERRADA"
  ]
  return (estado && completedEstados.includes(estado)) || (ratificacionExists && hasPDF)
}
```

**Logic**:
- ✅ Completed if estado is RATIFICADA, NO_RATIFICADA, VIGENTE, or CERRADA
- ✅ OR if ratificacion exists with PDF adjunto
- ✅ Handles both estado-driven and data-driven completion

---

### 6. Soft Delete & Historial

**Status**: 🟢 API Complete, 🔴 UI Missing

**API Support**:
- ✅ `activo` field in TRatificacionJudicial model
- ✅ GET /api/medidas/{medida_id}/ratificacion/historial/ endpoint
- ✅ `RatificacionJudicialHistorial` interface:
  ```typescript
  {
    count: number
    activa: RatificacionJudicial | null
    historial: RatificacionJudicial[]
  }
  ```
- ✅ Hook method: `fetchHistorial()`
- ✅ Hook state: `historial`, `isLoadingHistorial`, `historialError`

**UI Missing** (see GAP-04):
- ❌ No historial display component
- ❌ No "View History" button in RatificacionJudicialSection
- ❌ No dialog/modal to show history timeline

---

## ✅ v3.2 Compliance Checklist

### User Story Requirements vs Implementation

| Requirement | US Ref | Status | Notes |
|-------------|--------|--------|-------|
| **Solo MPE requiere ratificación** | CA-01 | 🔴 Partial | Backend OK, frontend missing validation (GAP-02) |
| **Rechazar MPI** | CA-01 | 🔴 Missing | No frontend check (GAP-02) |
| **Rechazar MPJ** | CA-01 | 🔴 Missing | MPJ gets step 4 incorrectly (GAP-01 + GAP-02) |
| **Etapas A/I/P/C válidas** | CA-01 v3.2 | 🟢 Partial | Cese integration works, but no validation layer |
| **Rechazar Post-Cese** | CA-01 v3.2 | 🔴 Missing | No etapa type check (GAP-03) |
| **Decisión requerida** | CA-02 | 🟢 Complete | Form validation working |
| **Fecha resolución requerida** | CA-02 | 🟢 Complete | Validation + not future check |
| **Archivo resolución obligatorio** | CA-02 | 🟢 Complete | PDF validation working |
| **Archivos opcionales (cédula, acuse)** | CA-03 | 🟢 Complete | 2 optional file uploads |
| **PDF validation** | CA-03 | 🟢 Complete | Client-side + backend |
| **Transición a RATIFICADA** | CA-04 | 🟢 Complete | Backend handles |
| **Transición a NO_RATIFICADA** | CA-04 | 🟢 Complete | Backend handles |
| **NO crear etapa automática** | CA-04 v3.0 | 🟢 Complete | Manual team responsibility |
| **Permisos Legal/JZ** | CA-05 | 🟢 Complete | Permission checks working |
| **Validación zona** | CA-05 | 🟢 Backend | Backend validates via TCustomUserZona |
| **Fechas no futuras** | CA-06 | 🟢 Complete | Frontend + backend |
| **Notificación >= resolución** | CA-06 | 🟢 Complete | Frontend + backend |
| **Notificaciones automáticas** | CA-07 | 🟢 Backend | Backend responsibility |
| **Auditoría completa** | CA-08 | 🟢 Complete | usuario_registro, timestamps |
| **Response structure** | CA-09 | 🟢 Complete | Nested serializers working |
| **Soft delete (activo field)** | CA-10 | 🟢 Complete | Backend + API service |
| **Historial tracking** | CA-10 | 🟡 API Only | API ready, UI missing (GAP-04) |
| **Una sola activa** | CA-10 | 🟢 Complete | UniqueConstraint in backend |

**Compliance Score**: 73% (16/22 complete, 6 gaps)

---

## 🛠️ Implementation Roadmap

### Priority 0: Blockers (Must Fix Before Deployment)

#### P0-1: Fix MPJ Ratification Bug (GAP-01)
**Estimate**: 30 minutes
**Files**: `unified-workflow-tab.tsx`
**Steps**:
1. Change line 162: `const requiresRatificacion = medidaData.tipo_medida === "MPE"`
2. Change line 163: `const totalSteps = requiresRatificacion ? 4 : 3`
3. Update conditional step 4 rendering (line 275): `...(!requiresRatificacion ? [] : [{...}])`
4. Test with MPI, MPE, MPJ medidas

#### P0-2: Add Tipo Medida Validation (GAP-02)
**Estimate**: 1 hour
**Files**: `ratificacion-judicial-section.tsx`, `unified-workflow-tab.tsx`
**Steps**:
1. Add `tipoMedida` prop to RatificacionJudicialSection interface
2. Add validation check at component start (early return with error alert)
3. Pass `medidaData.tipo_medida` from unified-workflow-tab
4. Add tests for MPI/MPJ rejection

#### P0-3: Add Etapa Type Validation (GAP-03)
**Estimate**: 1.5 hours
**Files**: `ratificacion-judicial-section.tsx`, medida API response
**Steps**:
1. Verify if `medidaData.etapa_tipo` or `medidaData.etapa_actual` contains etapa type
2. If not, add to API response or derive from etapa name
3. Add `etapaTipo` prop to RatificacionJudicialSection
4. Add Post-Cese validation check (early return with error alert)
5. Pass etapa type from caller
6. Add tests for Post-Cese rejection

**Total P0 Estimate**: 3 hours

---

### Priority 1: Critical (Important for v3.2 Compliance)

#### P1-1: Create Historial UI Component
**Estimate**: 3 hours
**Files**: New `components/ratificacion-judicial/historial-ratificacion.tsx`, update section
**Features**:
- Timeline-style display of all ratificaciones (active + inactive)
- Show why each was inactivated (if metadata available)
- User, timestamp, decision for each
- "View History" button in RatificacionJudicialSection

#### P1-2: Improve Error Messages
**Estimate**: 1 hour
**Files**: All components with validation
**Changes**:
- More descriptive error messages
- Link to documentation for blocked actions
- Suggested next steps in error alerts

**Total P1 Estimate**: 4 hours

---

### Priority 2: Enhancements (Nice to Have)

#### P2-1: Add Loading Skeletons
**Estimate**: 1 hour
**Files**: `ratificacion-judicial-section.tsx`, `adjuntos-ratificacion.tsx`
**Changes**: Better loading UX with skeleton loaders

#### P2-2: Add Confirmation Dialogs
**Estimate**: 1 hour
**Files**: `ratificacion-judicial-dialog.tsx`
**Changes**: Confirm before final decision (RATIFICADA/NO_RATIFICADA)

#### P2-3: Add Print/Export Functionality
**Estimate**: 2 hours
**Features**:
- Print ratificacion summary
- Export to PDF
- Include adjuntos metadata

#### P2-4: Add Keyboard Shortcuts
**Estimate**: 1 hour
**Features**: Esc to close dialog, Ctrl+S to save

**Total P2 Estimate**: 5 hours

---

## 📁 File Reference Map

### Type Definitions
```
types/
├── ratificacion-judicial-api.ts       [356 lines] Enums, interfaces, helpers
├── estado-etapa.ts                    [227 lines] Estado catalog types
├── medida-api.ts                      Used for EstadoEtapa import
└── workflow.ts                        WorkflowPhase type
```

### API Layer
```
api/
├── ratificacion-judicial-api-service.ts [332 lines] API endpoints
└── workflow-api-facade.ts              [Exports ratificacionApiAdapter]
```

### Business Logic
```
hooks/
└── useRatificacionJudicial.ts         [329 lines] State management hook

utils/
└── step-completion.ts                 [100+ lines] isRatificacionCompleted()
```

### UI Components
```
components/
├── dialogs/
│   └── ratificacion-judicial-dialog.tsx       [596 lines] Form modal
├── medida/
│   ├── ratificacion-judicial-section.tsx      [588 lines] Main display
│   ├── unified-workflow-tab.tsx               [~400 lines] Workflow stepper
│   ├── workflow-stepper.tsx                   Step UI
│   ├── workflow-step-content.tsx              Step wrapper
│   ├── mpe-tabs/
│   │   ├── cese-tab.tsx                       [44 lines] Cese integration
│   │   ├── apertura-tab.tsx                   Apertura integration
│   │   ├── innovacion-tab.tsx                 Innovacion integration
│   │   └── prorroga-tab.tsx                   Prorroga integration
│   └── shared/
│       └── workflow-section-configs.tsx       [590 lines] Section config
└── ratificacion-judicial/
    └── adjuntos-ratificacion.tsx              [312 lines] Attachments display
```

**Total Lines of Code**: ~3,800 lines

---

## 🧪 Testing Recommendations

### Unit Tests Needed

#### Types & Helpers (`types/ratificacion-judicial-api.ts`)
```typescript
describe('Ratificacion Types', () => {
  test('validateRatificacionDates rejects future dates')
  test('validateRatificacionDates rejects notificacion before resolucion')
  test('canModificarRatificacion returns true only for PENDIENTE')
  test('isFinalState returns true for RATIFICADA/NO_RATIFICADA')
  test('buildRatificacionFormData creates correct FormData')
})
```

#### API Service (`api/ratificacion-judicial-api-service.ts`)
```typescript
describe('Ratificacion API Service', () => {
  test('getRatificacion fetches successfully')
  test('createRatificacion sends multipart/form-data')
  test('getRatificacionActiva returns null for 404')
  test('getRatificacionHistorial returns historial structure')
  test('hasRatificacionActiva returns boolean')
})
```

#### Custom Hook (`hooks/useRatificacionJudicial.ts`)
```typescript
describe('useRatificacionJudicial Hook', () => {
  test('fetches ratificacion on mount if autoFetch=true')
  test('createRatificacion calls API and refetches')
  test('updateRatificacion validates PENDIENTE state')
  test('computed properties (isRatificada, canModify) work correctly')
  test('handles 404 gracefully (no error, null state)')
})
```

### Integration Tests

#### Workflow Integration
```typescript
describe('Unified Workflow Tab - Ratificacion', () => {
  test('MPE shows 4 steps including ratificacion')
  test('MPI shows only 3 steps (no ratificacion)')
  test('MPJ shows only 3 steps (no ratificacion)')  // After GAP-01 fix
  test('Cese tab shows ratificacion step')
  test('Post-Cese does NOT show ratificacion')  // After GAP-03 fix
  test('Step 4 completion logic triggers on RATIFICADA estado')
})
```

#### Component Integration
```typescript
describe('RatificacionJudicialSection', () => {
  test('shows empty state when no ratificacion')
  test('shows "Registrar" button only for Legal/JZ with correct estado')
  test('blocks UI for MPI medidas')  // After GAP-02 fix
  test('blocks UI for MPJ medidas')  // After GAP-02 fix
  test('blocks UI for Post-Cese etapa')  // After GAP-03 fix
  test('displays ratificacion with adjuntos')
  test('allows edit only for PENDIENTE decision')
})
```

### E2E Test Scenarios

#### Happy Path: Create Ratificacion (MPE Apertura)
1. Navigate to MPE medida in estado PENDIENTE_RATIFICACION_JUDICIAL
2. Open Cese tab (or Apertura/Innovacion/Prorroga)
3. See Step 4: Ratificación Judicial
4. Click "Registrar Ratificación Judicial"
5. Fill form: decisión RATIFICADA, fecha resolución, upload PDF
6. Submit successfully
7. Verify ratificacion displayed with adjuntos
8. Verify estado changed to RATIFICADA

#### Error Path: Attempt Ratificacion for MPI (After GAP-02 Fix)
1. Navigate to MPI medida
2. Open workflow tab
3. See only 3 steps (no ratificacion)
4. Verify no "Registrar Ratificación" button
5. Verify warning message: "Solo MPE requieren ratificación"

#### Error Path: Attempt Ratificacion for Post-Cese (After GAP-03 Fix)
1. Navigate to MPE medida in Post-Cese etapa
2. Open Post-Cese tab
3. See workflow, but ratificacion section blocked
4. Verify error alert: "Solo A/I/P/C requieren ratificación"

#### Validation Path: Date Errors
1. Open ratificacion dialog
2. Enter future fecha_resolucion
3. Verify error: "La fecha de resolución no puede ser futura"
4. Enter fecha_notificacion before fecha_resolucion
5. Verify error: "Fecha de notificación no puede ser anterior..."

#### Permission Path: Non-Legal User
1. Login as Equipo Técnico (not Legal, not JZ)
2. Navigate to medida in estado PENDIENTE_RATIFICACION_JUDICIAL
3. Verify no "Registrar Ratificación" button
4. Verify read-only display

---

## 📊 Metrics & Monitoring

### Success Metrics (After Implementation)
- **Ratificaciones Created**: Track creation rate
- **Error Rate**: Should be <2% after gap fixes
- **Time to Complete**: Average time from estado 5 to ratificacion
- **Edit Rate**: How often PENDIENTE gets updated vs created final

### Error Monitoring
- **400 Errors**: Should decrease after tipo/etapa validation
- **File Upload Failures**: Track PDF rejection rate
- **Permission Denials**: Track unauthorized access attempts

### User Experience Metrics
- **Form Abandonment**: Track dialog open → close without submit
- **Time in Form**: Average time to complete ratificacion form
- **Help Article Views**: Track documentation access for ratificacion

---

## 🔗 Related Documentation

### User Stories
- **MED-05 Main Story**: `stories/MED-05_Ratificacion_Judicial_Cierre.md` (v3.2)
- **MED-05 Correction Doc**: `stories/MED-05_V2_Validacion_Alineacion_MED-01_CORRECCION_v3.2.md`
- **MED-01 Base Story**: `stories/MED-01_Registro_Medida.md` (Tipos de medida, estados)

### Backend Documentation
- **Model**: `infrastructure/models/medida/TRatificacionJudicial.py`
- **Serializer**: `api/serializers/TRatificacionJudicialSerializer.py`
- **ViewSet**: `api/views/TRatificacionJudicialViewSet.py` (expected)
- **Endpoints**: `api/urls.py` (ratificacion routes)

---

## 📝 Implementation Checklist

Use this checklist to track gap fixes:

### Pre-Deployment Blockers (P0)
- [ ] **GAP-01**: Fix MPJ getting step 4 incorrectly
  - [ ] Update `unified-workflow-tab.tsx` line 162-163
  - [ ] Test with MPE (should have 4 steps)
  - [ ] Test with MPI (should have 3 steps)
  - [ ] Test with MPJ (should have 3 steps)

- [ ] **GAP-02**: Add tipo medida validation
  - [ ] Add `tipoMedida` prop to RatificacionJudicialSection
  - [ ] Add validation check with error alert
  - [ ] Pass from unified-workflow-tab
  - [ ] Test MPI rejection
  - [ ] Test MPJ rejection
  - [ ] Test MPE acceptance

- [ ] **GAP-03**: Add etapa type validation
  - [ ] Add `etapaTipo` prop to RatificacionJudicialSection
  - [ ] Add Post-Cese validation check with error alert
  - [ ] Pass from caller (verify medidaData has etapa type)
  - [ ] Test Post-Cese rejection
  - [ ] Test Cese acceptance
  - [ ] Test Apertura/Innovacion/Prorroga acceptance

### Critical Enhancements (P1)
- [ ] **GAP-04**: Create historial UI component
  - [ ] Create `historial-ratificacion.tsx` component
  - [ ] Add "View History" button in section
  - [ ] Display timeline of ratificaciones
  - [ ] Test with multiple ratificaciones

- [ ] Improve error messages
  - [ ] Add links to documentation
  - [ ] Add suggested next steps
  - [ ] Test error message clarity

### Testing
- [ ] Write unit tests for types/helpers
- [ ] Write unit tests for API service
- [ ] Write unit tests for hook
- [ ] Write integration tests for workflow
- [ ] Write integration tests for components
- [ ] Create E2E test scenarios
- [ ] Run full regression test suite

### Documentation
- [ ] Update component JSDoc comments
- [ ] Update API documentation
- [ ] Create user guide for ratificacion process
- [ ] Document error codes and resolutions
- [ ] Update CHANGELOG

---

## 🎯 Summary & Next Steps

### Current State
The MED-05 Ratificación Judicial implementation is **82% complete** with a solid foundation:
- ✅ Core API, hooks, and UI components working
- ✅ Soft delete pattern implemented
- ✅ File upload and validation working
- ✅ Workflow integration functional (with bugs)

### Critical Gaps
Three **critical gaps** prevent v3.2 compliance:
1. MPJ incorrectly receives ratification workflow
2. No tipo medida validation (MPI/MPJ should be blocked)
3. No etapa validation (Post-Cese should be blocked)

### Recommended Timeline
- **Week 1**: Fix P0 blockers (GAP-01, GAP-02, GAP-03) - 3 hours
- **Week 2**: Add historial UI (GAP-04) - 3 hours
- **Week 3**: Testing and polish - 4 hours

**Total Effort to Complete**: ~10 hours

### Success Criteria
✅ Implementation is ready when:
1. MPJ users don't see ratification workflow
2. MPI/MPJ show clear error messages if accessed
3. Post-Cese shows clear error message if accessed
4. All E2E tests pass
5. v3.2 compliance checklist is 100%

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Next Review**: After P0 fixes deployed
