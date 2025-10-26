# MED-01 Implementation Analysis & V2 Plan

**Generated:** 2025-10-26
**Project:** RUNNA - Sistema de Protección Integral
**Module:** Medidas de Protección (MED-01)

---

## Executive Summary

**Status:** ✅ **V1 Implemented** | 🔄 **V2 Planning Phase**

The frontend has **successfully implemented MED-01 V1** with comprehensive type definitions, workflow management, and integration with the activity system (PLTM-01/02). The V2 enhancement focuses on differentiating states by measure type (MPI/MPE/MPJ) and introducing a catalog-based state management system.

---

## 📊 Current Implementation Status (V1)

### ✅ Implemented Components

#### 1. Type System ✅ **COMPLETE**

**Location:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/`

- **`medidas.ts`**: Type-specific interfaces (MPI, MPE, MPJ)
  - ✅ `BaseMedidaData` with common fields
  - ✅ `MPIMedidaData`, `MPEMedidaData`, `MPJMedidaData` with type-specific extensions
  - ✅ Union type `MedidaData` for discriminated unions
  - ✅ Legacy `Etapas` interface for backward compatibility

- **`medida-api.ts`**: API response/request types
  - ✅ `TipoMedida` enum: MPI, MPE, MPJ
  - ✅ `EstadoVigencia` enum: VIGENTE, CERRADA, ARCHIVADA, NO_RATIFICADA
  - ✅ `EstadoEtapa` enum: 5 sequential states (V1 generic)
  - ✅ `MedidaDetailResponse` with nested structures
  - ✅ `CreateMedidaRequest` for manual creation
  - ✅ Integration with Nota de Aval (MED-03)

- **`workflow.ts`**: Unified workflow types (423 lines)
  - ✅ Generic `WorkflowItem` interface
  - ✅ `WorkflowApiService` for CRUD operations
  - ✅ State transition actions (enviar, aprobar, rechazar)
  - ✅ Field configuration system with validation
  - ✅ Modal configuration with custom actions
  - ✅ Display configuration (card, list, table renderers)
  - ✅ Permission system by user role
  - ✅ Stepper progress tracking

#### 2. Workflow Management ✅ **COMPLETE**

**Location:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/`

- ✅ **`workflow-stepper.tsx`**: 5-step progress visualization
- ✅ **`workflow-step-content.tsx`**: Dynamic content rendering per step
- ✅ **`shared/workflow-section.tsx`**: Reusable workflow section component
- ✅ **`shared/unified-workflow-modal.tsx`**: Generic modal for all workflow types
- ✅ **`shared/workflow-state-actions.tsx`**: State transition buttons (enviar, aprobar, rechazar)
- ✅ **`shared/workflow-section-configs.tsx`**: Configuration registry for workflow sections

#### 3. Medida-Specific Components ✅ **COMPLETE**

- ✅ **`medida-header.tsx`**: Medida information display
- ✅ **`mpe-header.tsx`**: MPE-specific header with progreso tracking
- ✅ **`mpe-tabs.tsx`**: Tab navigation for MPE phases
- ✅ **`mpe-tabs/apertura-tab.tsx`**: Apertura workflow
- ✅ **`mpe-tabs/innovacion-tab.tsx`**: Innovación workflow
- ✅ **`mpe-tabs/prorroga-tab.tsx`**: Prórroga workflow
- ✅ **`mpe-tabs/cese-tab.tsx`**: Cese workflow

#### 4. Activity System Integration (PLTM-01/02) ✅ **COMPLETE**

**Location:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/`

- ✅ **`types/actividades.ts`**: Comprehensive activity types (297 lines)
  - ✅ Activity states including legal approval (PENDIENTE_VISADO, VISADO_APROBADO, VISADO_CON_OBSERVACION)
  - ✅ Comments with @mention support (`TComentarioActividad`)
  - ✅ History tracking (`THistorialActividad`)
  - ✅ Activity transfers (`TTransferenciaActividad`)
  - ✅ Action request types (CambiarEstado, Reabrir, Transferir, Visar)

- ✅ **`services/actividadService.ts`**: Complete API integration
  - ✅ CRUD operations for activities
  - ✅ State change with validation (`cambiarEstado`)
  - ✅ Comment management (`addComentario`)
  - ✅ Attachment handling (`addAttachment`)
  - ✅ History retrieval (`getHistorial`)
  - ✅ Transfer operations (`transferir`)
  - ✅ Legal approval (`visar`)

- ✅ **`components/medida/ActividadDetailModal.tsx`**: Rich detail view
- ✅ **`hooks/useActividadActions.ts`**: Action handlers
- ✅ **`hooks/useActividadPermissions.ts`**: Permission logic

#### 5. Document Management Components ✅ **COMPLETE**

- ✅ **Registro de Intervención** (`registro-intervencion-modal.tsx`)
- ✅ **Nota de Aval** (`nota-aval-dialog.tsx`, `nota-aval-section.tsx`)
- ✅ **Informe Jurídico** (`informe-juridico-dialog.tsx`, `informe-juridico-section.tsx`)
- ✅ **Attachments** (`adjuntar-*-modal.tsx` components)

#### 6. Utility & Support ✅ **COMPLETE**

- ✅ **`utils/permissions.ts`**: Permission validation logic
- ✅ **`hooks/useWorkflowData.ts`**: Data fetching and state management
- ✅ **`api/workflow-api-facade.ts`**: Unified API facade for workflow operations

---

## 🔍 V1 Architecture Analysis

### Strengths ✅

1. **Type Safety**: Comprehensive TypeScript definitions with discriminated unions
2. **Modularity**: Generic workflow system adaptable to any document type
3. **Reusability**: Unified components (`WorkflowSection`, `UnifiedWorkflowModal`) reduce code duplication
4. **Integration**: Seamless connection with PLTM-01/02 activity system
5. **Permissions**: Role-based access control (ET, JZ, DIRECTOR, LEGAL, SUPERUSER)
6. **State Management**: Robust state transition validation

### Current State System (V1)

```typescript
// medida-api.ts (lines 12-18)
export type EstadoEtapa =
  | "PENDIENTE_REGISTRO_INTERVENCION"      // Estado 1
  | "PENDIENTE_APROBACION_REGISTRO"        // Estado 2
  | "PENDIENTE_NOTA_AVAL"                  // Estado 3
  | "PENDIENTE_INFORME_JURIDICO"           // Estado 4
  | "PENDIENTE_RATIFICACION_JUDICIAL"      // Estado 5
```

**Issue:** Generic states applied to ALL measure types (MPI, MPE, MPJ) without differentiation.

---

## 🚨 V1 vs V2 Gap Analysis

### Critical Gaps 🔴

#### Gap 1: Type-Specific State Differentiation

**Problem:** Current `EstadoEtapa` is a flat enum applied uniformly to all measure types.

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:23-48)**:
- **MPI Apertura**: Only states 1-2 (no full legal process)
- **MPI Cese**: No states (only technical closure report)
- **MPE**: Full states 1-5 for all stages (APERTURA, INNOVACION, PRORROGA, CESE)
- **MPE Post-cese**: Activities allowed after `fecha_cese_efectivo`
- **MPJ**: **NO STATES** (`estado_especifico = None`) - only stage transitions via PLTM

**Impact:**
- Users can currently attempt invalid state transitions (e.g., MPI trying to reach state 5)
- No validation preventing MPJ from using states
- No special handling for MPI Cese (should skip states)

#### Gap 2: Catalog-Based State Management

**Problem:** States are hardcoded enums with no metadata (responsible role, next action, applicability).

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:83-159)**:
```python
# New Model: TEstadoEtapaMedida (Catalog)
class TEstadoEtapaMedida(models.Model):
    codigo = CharField(unique=True)  # e.g., "PENDIENTE_REGISTRO_INTERVENCION"
    nombre_display = CharField()     # "(1) Pendiente de registro de intervención"
    orden = IntegerField()           # 1-5
    responsable_tipo = CharField()   # EQUIPO_TECNICO, JEFE_ZONAL, DIRECTOR, EQUIPO_LEGAL
    siguiente_accion = TextField()   # Description of required action
    aplica_a_tipos_medida = JSONField()  # ["MPI", "MPE"] (not MPJ)
    aplica_a_tipos_etapa = JSONField()   # ["APERTURA", "INNOVACION", "PRORROGA", "CESE"]
    activo = BooleanField()
```

**Frontend Gap:** No type definitions or API integration for `TEstadoEtapaMedida` catalog.

#### Gap 3: Stage Type (tipo_etapa) Field Missing

**Problem:** Current `EtapaMedida` interface has no `tipo_etapa` field.

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:172-196)**:
```typescript
// Updated TEtapaMedida model
interface TEtapaMedida {
  tipo_etapa: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | 'PROCESO'
  estado_especifico: TEstadoEtapaMedida | null  // FK to catalog
  estado: string | null  // Deprecated, for backward compatibility
}
```

**Frontend Impact:**
- Cannot differentiate between MPE stages (Apertura vs Innovación)
- Cannot identify MPJ "PROCESO" stage
- Cannot handle MPE POST_CESE stage

#### Gap 4: `fecha_cese_efectivo` Field Missing

**Problem:** No field to track MPE post-cese activities.

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:232-246)**:
```python
class TMedida(models.Model):
    fecha_cese_efectivo = models.DateField(null=True, blank=True)
```

**Use Case:** MPE can have PLTM activities after `fecha_cese_efectivo` in POST_CESE stage.

#### Gap 5: MPJ Auto-Transition Logic Not Implemented

**Problem:** No frontend logic to handle MPJ stage transitions triggered by PLTM activities.

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:70-78)**:
- MPJ does NOT use states
- Stage transitions (APERTURA → PROCESO → CESE) triggered by PLTM activity creation
- Backend signal `detectar_oficio_completado_mpj` auto-creates new stage
- Frontend must handle:
  - Displaying current stage without states
  - Disabling state transition UI for MPJ
  - Reflecting auto-transitions from backend

---

### Important Gaps 🟡

#### Gap 6: Validation Functions Missing

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:250-263)**:
Backend provides 6 validation functions:
1. `obtener_estados_permitidos(tipo_medida, tipo_etapa)` - Get valid states
2. `validar_transicion_estado(etapa, nuevo_estado, usuario)` - Validate transitions
3. `validar_responsable_estado(usuario, estado)` - Validate permissions
4. `auto_transicionar_etapa_mpj(medida)` - MPJ auto-transition
5. `crear_etapa_post_cese_mpe(medida, fecha_cese)` - MPE post-cese
6. Signal `detectar_oficio_completado_mpj` - PLTM integration

**Frontend Needs:**
- API service layer to call these validation endpoints
- Permission checks before showing state transition buttons
- MPJ-specific UI that hides state controls
- POST_CESE stage detection and rendering

#### Gap 7: Fixture Data Not Loaded

**V2 Requirement (MED-01_V2_Estados_Diferenciados.md:336-416)**:
5 `TEstadoEtapaMedida` catalog entries with metadata:
- State 1: EQUIPO_TECNICO responsible
- State 2: JEFE_ZONAL responsible
- State 3: DIRECTOR responsible (MPE only)
- State 4: EQUIPO_LEGAL responsible (MPE only)
- State 5: EQUIPO_LEGAL responsible (MPE only)

**Frontend Gap:** No API endpoint or type definition for fetching state catalog.

---

## 🎯 MED-01 V2 Implementation Plan

### Phase 1: Type Definitions & API Integration (4-6 hours)

#### Task 1.1: Create `TEstadoEtapaMedida` Type Definition

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/estado-etapa.ts` (NEW)

```typescript
/**
 * State catalog type definition for MED-01 V2
 * Backend Model: infrastructure/models/medida/TEstadoEtapaMedida.py
 */

export type ResponsableTipo =
  | 'EQUIPO_TECNICO'
  | 'JEFE_ZONAL'
  | 'DIRECTOR'
  | 'EQUIPO_LEGAL'

export type TipoEtapa =
  | 'APERTURA'
  | 'INNOVACION'
  | 'PRORROGA'
  | 'CESE'
  | 'POST_CESE'
  | 'PROCESO'

export interface TEstadoEtapaMedida {
  id: number
  codigo: string  // e.g., "PENDIENTE_REGISTRO_INTERVENCION"
  nombre_display: string  // e.g., "(1) Pendiente de registro de intervención"
  orden: number  // 1-5
  responsable_tipo: ResponsableTipo
  siguiente_accion: string
  aplica_a_tipos_medida: ('MPI' | 'MPE' | 'MPJ')[]
  aplica_a_tipos_etapa: TipoEtapa[]
  activo: boolean
  fecha_creacion: string
  fecha_modificacion: string
}

export interface TEstadoEtapaResponse {
  count: number
  results: TEstadoEtapaMedida[]
}
```

**Backend Endpoint:** `GET /api/estados-etapa-medida/`

#### Task 1.2: Update `EtapaMedida` Interface

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/medida-api.ts` (UPDATE)

```typescript
// Current (V1)
export interface EtapaMedida {
  id: number
  nombre: string
  estado: EstadoEtapa
  estado_display: string
  fecha_inicio_estado: string
  fecha_fin_estado: string | null
  observaciones: string | null
}

// V2 Enhancement
export interface EtapaMedida {
  id: number
  nombre: string
  tipo_etapa: TipoEtapa  // NEW: Stage type

  // V2: Catalog-based state (preferred)
  estado_especifico: TEstadoEtapaMedida | null  // NEW: FK to catalog

  // V1: Legacy state field (deprecated, for backward compatibility)
  estado: EstadoEtapa | null  // DEPRECATED
  estado_display: string

  fecha_inicio_estado: string
  fecha_fin_estado: string | null
  observaciones: string | null
}
```

**Backward Compatibility:** Keep `estado` field for gradual migration.

#### Task 1.3: Update `MedidaDetailResponse` Interface

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/medida-api.ts` (UPDATE)

```typescript
export interface MedidaDetailResponse {
  // ... existing fields ...

  // V2 Enhancements
  fecha_cese_efectivo: string | null  // NEW: For MPE POST_CESE
  etapa_actual: EtapaMedida | null    // Now uses updated EtapaMedida with tipo_etapa
  historial_etapas?: EtapaMedida[]    // Updated structure
}
```

#### Task 1.4: Create Estado Catalog API Service

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/estado-etapa-api-service.ts` (NEW)

```typescript
import { get } from '@/app/api/apiService'
import type {
  TEstadoEtapaMedida,
  TEstadoEtapaResponse,
  TipoMedida,
  TipoEtapa
} from '../types/estado-etapa'

export const estadoEtapaService = {
  /**
   * Get all active states from catalog
   * Endpoint: GET /api/estados-etapa-medida/
   */
  async getAll(): Promise<TEstadoEtapaMedida[]> {
    const response = await get<TEstadoEtapaResponse>('estados-etapa-medida/?activo=true')
    return response.results
  },

  /**
   * Get states applicable to specific measure type and stage
   * Endpoint: GET /api/estados-etapa-medida/?tipo_medida=MPE&tipo_etapa=APERTURA
   */
  async getForMedida(
    tipoMedida: TipoMedida,
    tipoEtapa: TipoEtapa
  ): Promise<TEstadoEtapaMedida[]> {
    const response = await get<TEstadoEtapaResponse>(
      `estados-etapa-medida/?tipo_medida=${tipoMedida}&tipo_etapa=${tipoEtapa}&activo=true`
    )
    return response.results
  },

  /**
   * Get single state by ID
   * Endpoint: GET /api/estados-etapa-medida/{id}/
   */
  async getById(id: number): Promise<TEstadoEtapaMedida> {
    return get<TEstadoEtapaMedida>(`estados-etapa-medida/${id}/`)
  },

  /**
   * Get next available state for a measure stage
   * Endpoint: GET /api/estados-etapa-medida/{id}/siguiente/
   */
  async getNextState(
    currentStateId: number
  ): Promise<TEstadoEtapaMedida | null> {
    return get<TEstadoEtapaMedida | null>(
      `estados-etapa-medida/${currentStateId}/siguiente/`
    )
  }
}
```

**Backend Integration:** Assumes backend implements estado catalog endpoints (per MED-01 V2 spec).

---

### Phase 2: Validation & Permission Logic (3-4 hours)

#### Task 2.1: Create State Validation Utility

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/estado-validation.ts` (NEW)

```typescript
import type {
  TEstadoEtapaMedida,
  TipoMedida,
  TipoEtapa,
  ResponsableTipo
} from '../types/estado-etapa'
import type { User } from '../types/workflow'

/**
 * Check if a state is applicable to a measure type and stage
 */
export function isEstadoApplicable(
  estado: TEstadoEtapaMedida,
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): boolean {
  return (
    estado.aplica_a_tipos_medida.includes(tipoMedida) &&
    estado.aplica_a_tipos_etapa.includes(tipoEtapa)
  )
}

/**
 * Check if user has permission to transition to a state
 */
export function canUserTransitionToEstado(
  user: User,
  estado: TEstadoEtapaMedida
): boolean {
  // Map user roles to responsable types
  const roleToResponsable: Record<string, ResponsableTipo> = {
    'ET': 'EQUIPO_TECNICO',
    'JZ': 'JEFE_ZONAL',
    'DIRECTOR': 'DIRECTOR',
    'LEGAL': 'EQUIPO_LEGAL',
    'SUPERUSER': 'EQUIPO_TECNICO'  // Superuser can do anything
  }

  const userResponsable = roleToResponsable[user.role]

  // Superuser bypass
  if (user.role === 'SUPERUSER') return true

  return estado.responsable_tipo === userResponsable
}

/**
 * Get available state transitions for current context
 */
export function getAvailableTransitions(
  currentEstado: TEstadoEtapaMedida | null,
  availableEstados: TEstadoEtapaMedida[],
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa,
  user: User
): TEstadoEtapaMedida[] {
  // MPJ has no states
  if (tipoMedida === 'MPJ') return []

  // Filter states by applicability
  const applicableEstados = availableEstados.filter(estado =>
    isEstadoApplicable(estado, tipoMedida, tipoEtapa)
  )

  // If no current state, return first applicable state
  if (!currentEstado) {
    return applicableEstados
      .filter(estado => estado.orden === 1)
      .filter(estado => canUserTransitionToEstado(user, estado))
  }

  // Get next sequential state (orden + 1)
  const nextEstados = applicableEstados.filter(
    estado => estado.orden === currentEstado.orden + 1
  )

  // Filter by user permission
  return nextEstados.filter(estado =>
    canUserTransitionToEstado(user, estado)
  )
}

/**
 * Check if MPI Cese should skip states
 */
export function shouldSkipStatesForCese(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): boolean {
  return tipoMedida === 'MPI' && tipoEtapa === 'CESE'
}

/**
 * Check if MPE is in POST_CESE stage
 */
export function isMPEPostCese(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa,
  fechaCeseEfectivo: string | null
): boolean {
  return (
    tipoMedida === 'MPE' &&
    tipoEtapa === 'POST_CESE' &&
    fechaCeseEfectivo !== null
  )
}
```

#### Task 2.2: Update Permission Utility

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/permissions.ts` (UPDATE)

```typescript
// Add V2 permission checks

import type { TEstadoEtapaMedida } from '../types/estado-etapa'
import { canUserTransitionToEstado } from './estado-validation'

/**
 * Check if user can advance to a specific state (V2)
 */
export function canAdvanceToEstado(
  user: User,
  estado: TEstadoEtapaMedida,
  currentEstado: TEstadoEtapaMedida | null
): boolean {
  // Must be next sequential state
  if (currentEstado && estado.orden !== currentEstado.orden + 1) {
    return false
  }

  // Must have role permission
  return canUserTransitionToEstado(user, estado)
}

/**
 * Check if medida workflow actions should be shown (V2)
 * MPJ hides state transition UI
 */
export function shouldShowWorkflowActions(tipoMedida: TipoMedida): boolean {
  return tipoMedida !== 'MPJ'
}
```

---

### Phase 3: UI Component Updates (5-7 hours)

#### Task 3.1: Update Workflow Stepper Component

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/workflow-stepper.tsx` (UPDATE)

```typescript
// Add support for type-specific state display

interface WorkflowStepperProps {
  tipoMedida: TipoMedida
  tipoEtapa: TipoEtapa
  etapaActual: EtapaMedida | null
  availableEstados: TEstadoEtapaMedida[]  // NEW: From catalog
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  tipoMedida,
  tipoEtapa,
  etapaActual,
  availableEstados
}) => {
  // MPJ: Show stage-only stepper (no states)
  if (tipoMedida === 'MPJ') {
    return <MPJStageStepper etapaActual={etapaActual} />
  }

  // MPI Cese: Skip states, show completion message
  if (shouldSkipStatesForCese(tipoMedida, tipoEtapa)) {
    return <MPICeseCompletionMessage />
  }

  // Filter states by applicability
  const applicableStates = availableEstados.filter(estado =>
    isEstadoApplicable(estado, tipoMedida, tipoEtapa)
  )

  // Render state steps
  return (
    <Stepper activeStep={getActiveStepIndex(etapaActual, applicableStates)}>
      {applicableStates.map((estado, index) => (
        <Step key={estado.id}>
          <StepLabel>
            {estado.nombre_display}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}
```

#### Task 3.2: Create MPJ Stage Stepper Component

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpj-stage-stepper.tsx` (NEW)

```typescript
/**
 * MPJ-specific stepper showing only stage transitions (no states)
 */

interface MPJStageStepperProps {
  etapaActual: EtapaMedida | null
}

const MPJ_STAGES: TipoEtapa[] = ['APERTURA', 'PROCESO', 'CESE']

export const MPJStageStepper: React.FC<MPJStageStepperProps> = ({
  etapaActual
}) => {
  const activeStageIndex = MPJ_STAGES.indexOf(
    etapaActual?.tipo_etapa || 'APERTURA'
  )

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>MPJ - Transiciones Automáticas</AlertTitle>
        Las etapas de MPJ avanzan automáticamente al crear actividades
        en el Plan de Trabajo. No hay estados intermedios.
      </Alert>

      <Stepper activeStep={activeStageIndex} alternativeLabel>
        {MPJ_STAGES.map((stage, index) => (
          <Step key={stage}>
            <StepLabel>
              {stage === 'APERTURA' && 'Apertura de la Medida'}
              {stage === 'PROCESO' && 'Proceso Judicial'}
              {stage === 'CESE' && 'Cese de la Medida'}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Explanation */}
      <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
        <strong>Etapa actual:</strong> {etapaActual?.nombre || 'No definida'}
      </Typography>
    </Box>
  )
}
```

#### Task 3.3: Update Workflow State Actions Component

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/workflow-state-actions.tsx` (UPDATE)

```typescript
// Add V2 state transition logic with catalog validation

import { useState, useEffect } from 'react'
import { estadoEtapaService } from '../../../api/estado-etapa-api-service'
import { getAvailableTransitions } from '../../../utils/estado-validation'

interface WorkflowStateActionsProps {
  medidaId: number
  tipoMedida: TipoMedida
  tipoEtapa: TipoEtapa
  etapaActual: EtapaMedida | null
  user: User
  onTransition: () => void
}

export const WorkflowStateActions: React.FC<WorkflowStateActionsProps> = ({
  medidaId,
  tipoMedida,
  tipoEtapa,
  etapaActual,
  user,
  onTransition
}) => {
  const [availableEstados, setAvailableEstados] = useState<TEstadoEtapaMedida[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch available states from catalog
  useEffect(() => {
    async function loadEstados() {
      try {
        const estados = await estadoEtapaService.getForMedida(tipoMedida, tipoEtapa)
        setAvailableEstados(estados)
      } catch (error) {
        console.error('Error loading estados:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEstados()
  }, [tipoMedida, tipoEtapa])

  // MPJ: No state transition UI
  if (tipoMedida === 'MPJ') {
    return null
  }

  // MPI Cese: No state transition UI
  if (shouldSkipStatesForCese(tipoMedida, tipoEtapa)) {
    return null
  }

  // Get available transitions for current context
  const transitions = getAvailableTransitions(
    etapaActual?.estado_especifico || null,
    availableEstados,
    tipoMedida,
    tipoEtapa,
    user
  )

  if (transitions.length === 0) {
    return null  // No available transitions
  }

  return (
    <Box>
      {transitions.map(estado => (
        <Button
          key={estado.id}
          variant="contained"
          color="primary"
          onClick={() => handleTransition(estado)}
        >
          Avanzar a: {estado.nombre_display}
        </Button>
      ))}
    </Box>
  )

  async function handleTransition(newEstado: TEstadoEtapaMedida) {
    // Call backend transition API
    // await etapaService.transitionToEstado(medidaId, newEstado.id)
    onTransition()
  }
}
```

#### Task 3.4: Create MPE Post-Cese Section

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-post-cese-section.tsx` (NEW)

```typescript
/**
 * MPE POST_CESE stage: Activities after effective closure date
 */

interface MPEPostCeseSectionProps {
  medidaId: number
  fechaCeseEfectivo: string
  planTrabajoId: number
}

export const MPEPostCeseSection: React.FC<MPEPostCeseSectionProps> = ({
  medidaId,
  fechaCeseEfectivo,
  planTrabajoId
}) => {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Medida en POST-CESE</AlertTitle>
        Fecha de cese efectivo: {formatDate(fechaCeseEfectivo)}
        <br />
        Puedes registrar actividades de seguimiento posteriores al cese.
      </Alert>

      {/* Show PLTM activities for POST_CESE stage */}
      <PlanTrabajoSection
        planTrabajoId={planTrabajoId}
        medidaId={medidaId}
        etapa="POST_CESE"
        readOnly={false}
      />
    </Box>
  )
}
```

---

### Phase 4: Integration & Data Flow (3-4 hours)

#### Task 4.1: Update `useWorkflowData` Hook

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useWorkflowData.ts` (UPDATE)

```typescript
// Add estado catalog loading

import { estadoEtapaService } from '../api/estado-etapa-api-service'

export function useWorkflowData(medidaId: number) {
  const [medida, setMedida] = useState<MedidaDetailResponse | null>(null)
  const [estadosCatalog, setEstadosCatalog] = useState<TEstadoEtapaMedida[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Load medida details
        const medidaData = await medidaService.getDetail(medidaId)
        setMedida(medidaData)

        // Load estado catalog for this medida type
        if (medidaData.etapa_actual?.tipo_etapa) {
          const estados = await estadoEtapaService.getForMedida(
            medidaData.tipo_medida,
            medidaData.etapa_actual.tipo_etapa
          )
          setEstadosCatalog(estados)
        }
      } catch (error) {
        console.error('Error loading workflow data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [medidaId])

  return { medida, estadosCatalog, loading }
}
```

#### Task 4.2: Update Medida Detail Page

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/page.tsx` (UPDATE)

```typescript
// Add V2 state management to main page

export default function MedidaDetailPage({ params }: { params: { id: string; medidaId: string } }) {
  const { medida, estadosCatalog, loading } = useWorkflowData(Number(params.medidaId))

  if (loading) return <Loading />
  if (!medida) return <NotFound />

  // MPJ: Show stage-based UI (no states)
  if (medida.tipo_medida === 'MPJ') {
    return <MPJMedidaView medida={medida} />
  }

  // MPE POST_CESE: Show post-cese activities
  if (isMPEPostCese(
    medida.tipo_medida,
    medida.etapa_actual?.tipo_etapa || 'APERTURA',
    medida.fecha_cese_efectivo
  )) {
    return (
      <MPEPostCeseSection
        medidaId={medida.id}
        fechaCeseEfectivo={medida.fecha_cese_efectivo!}
        planTrabajoId={medida.plan_trabajo_id!}
      />
    )
  }

  // Standard medida view with V2 estado management
  return (
    <MedidaDetailView
      medida={medida}
      estadosCatalog={estadosCatalog}
    />
  )
}
```

---

### Phase 5: Testing & Validation (2-3 hours)

#### Task 5.1: Unit Tests for Estado Validation

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/__tests__/estado-validation.test.ts` (NEW)

```typescript
import { describe, it, expect } from '@jest/globals'
import {
  isEstadoApplicable,
  canUserTransitionToEstado,
  getAvailableTransitions,
  shouldSkipStatesForCese
} from '../estado-validation'

describe('Estado Validation', () => {
  it('should allow MPI to use states 1-2 only', () => {
    const estado3 = createMockEstado(3, ['MPE'], ['APERTURA'])
    expect(isEstadoApplicable(estado3, 'MPI', 'APERTURA')).toBe(false)
  })

  it('should prevent MPJ from using any states', () => {
    const estado1 = createMockEstado(1, ['MPI', 'MPE'], ['APERTURA'])
    expect(isEstadoApplicable(estado1, 'MPJ', 'APERTURA')).toBe(false)
  })

  it('should skip states for MPI Cese', () => {
    expect(shouldSkipStatesForCese('MPI', 'CESE')).toBe(true)
    expect(shouldSkipStatesForCese('MPE', 'CESE')).toBe(false)
  })

  it('should enforce sequential state progression', () => {
    const currentEstado = createMockEstado(2, ['MPE'], ['APERTURA'])
    const estado4 = createMockEstado(4, ['MPE'], ['APERTURA'])

    const transitions = getAvailableTransitions(
      currentEstado,
      [estado4],
      'MPE',
      'APERTURA',
      mockUser
    )

    expect(transitions).toHaveLength(0)  // Can't jump from 2 to 4
  })

  it('should respect user role permissions', () => {
    const estado3 = createMockEstado(3, ['MPE'], ['APERTURA'], 'DIRECTOR')
    const jefeZonalUser = { ...mockUser, role: 'JZ' }

    expect(canUserTransitionToEstado(jefeZonalUser, estado3)).toBe(false)
  })
})
```

#### Task 5.2: Integration Tests for Workflow Components

```typescript
// Test MPJ stage-only display
it('should hide state stepper for MPJ', () => {
  render(<WorkflowStepper tipoMedida="MPJ" {...props} />)
  expect(screen.queryByText('(1) Pendiente')).not.toBeInTheDocument()
})

// Test MPI Cese skip states
it('should show completion message for MPI Cese', () => {
  render(<WorkflowStepper tipoMedida="MPI" tipoEtapa="CESE" {...props} />)
  expect(screen.getByText(/informe de cierre/i)).toBeInTheDocument()
})

// Test MPE POST_CESE activities
it('should allow activities after fecha_cese_efectivo', () => {
  render(<MPEPostCeseSection fechaCeseEfectivo="2024-01-01" {...props} />)
  expect(screen.getByText(/actividades de seguimiento/i)).toBeInTheDocument()
})
```

---

## 📋 Backend API Requirements (for Backend Team)

### New Endpoints Required

#### 1. Estado Etapa Catalog

```yaml
GET /api/estados-etapa-medida/
  Description: List all estado catalog entries
  Query Params:
    - activo: boolean (default: true)
    - tipo_medida: MPI|MPE|MPJ
    - tipo_etapa: APERTURA|INNOVACION|PRORROGA|CESE|POST_CESE|PROCESO
  Response: {
    count: number
    results: TEstadoEtapaMedida[]
  }

GET /api/estados-etapa-medida/{id}/
  Description: Get single estado
  Response: TEstadoEtapaMedida

GET /api/estados-etapa-medida/{id}/siguiente/
  Description: Get next sequential estado
  Response: TEstadoEtapaMedida | null
```

#### 2. Etapa Transition Endpoint

```yaml
POST /api/medidas/{id}/etapas/transition/
  Description: Transition to new estado with validation
  Request Body: {
    nuevo_estado_id: number
    motivo?: string
  }
  Response: MedidaDetailResponse (with updated etapa_actual)
  Validations:
    - Sequential progression (orden + 1 only)
    - User role matches responsable_tipo
    - Estado applicable to tipo_medida and tipo_etapa
```

#### 3. MPJ Auto-Transition Signal

```yaml
Signal: post_save on TActividadPlanTrabajo
Trigger: When activity.etapa_medida_aplicable > medida.etapa_actual.tipo_etapa
Action:
  - Create new TEtapaMedida with tipo_etapa = activity.etapa_medida_aplicable
  - Set estado_especifico = null (MPJ has no states)
  - Update medida.etapa_actual
  - Register in THistorialActividad with tipo_accion = 'AUTO_TRANSICION_ETAPA_MPJ'
```

#### 4. MPE Post-Cese Endpoint

```yaml
POST /api/medidas/{id}/registrar-cese-efectivo/
  Description: Register fecha_cese_efectivo and create POST_CESE etapa
  Request Body: {
    fecha_cese_efectivo: date
  }
  Response: MedidaDetailResponse
  Action:
    - Set medida.fecha_cese_efectivo
    - Create new TEtapaMedida with tipo_etapa = 'POST_CESE'
    - Allow PLTM activities with etapa_medida_aplicable = 'POST_CESE'
```

---

## 🚀 Migration Strategy

### Backward Compatibility Approach

1. **Dual Field Support**: Keep `EtapaMedida.estado` (V1) alongside `estado_especifico` (V2)
2. **Progressive Enhancement**: New UI components check for `estado_especifico` first, fallback to `estado`
3. **Gradual Rollout**: V2 features enabled per measure type:
   - Phase 1: MPJ (most distinct, no states)
   - Phase 2: MPI (simplified, states 1-2 only)
   - Phase 3: MPE (complete, all states)

### Data Migration

```sql
-- Backend migration: Populate estado_especifico from estado
UPDATE t_etapa_medida
SET estado_especifico_id = (
  SELECT id FROM t_estado_etapa_medida
  WHERE codigo = t_etapa_medida.estado
)
WHERE estado IS NOT NULL;
```

### Frontend Migration Checklist

- [ ] **Week 1**: Implement Phase 1 (Type definitions & API)
- [ ] **Week 2**: Implement Phase 2 (Validation logic)
- [ ] **Week 3**: Implement Phase 3 (UI components)
- [ ] **Week 4**: Implement Phase 4 (Integration)
- [ ] **Week 5**: Implement Phase 5 (Testing)
- [ ] **Week 6**: Backend coordination & testing
- [ ] **Week 7**: Staging deployment & QA
- [ ] **Week 8**: Production release

---

## 📊 Success Metrics

### Functional Validation

- ✅ MPI Apertura: Only states 1-2 accessible
- ✅ MPI Cese: No state stepper shown, direct completion
- ✅ MPE: Full states 1-5 for all stages
- ✅ MPE POST_CESE: Activities allowed after fecha_cese_efectivo
- ✅ MPJ: No state UI shown, only stage transitions
- ✅ MPJ: Automatic stage transitions on PLTM activity creation

### User Experience

- Clear visual distinction between measure types
- Appropriate error messages for invalid transitions
- Responsive UI updates on state changes
- Intuitive stage progression indicators

### Performance

- Estado catalog loaded <500ms
- State transition API <1s
- No blocking UI operations
- Efficient re-renders on state changes

---

## 🔧 Technical Debt Mitigation

### Deprecated Code Removal Plan

After 3 months of V2 stable operation:
1. Remove `estado` field references in UI
2. Update backend to make `estado` nullable
3. Remove V1 state enum types
4. Consolidate validation logic

### Documentation Updates

- Update API docs with V2 endpoints
- Create user guide for tipo_etapa vs estado_especifico
- Document MPJ auto-transition behavior
- Add troubleshooting guide for state issues

---

## 📝 Conclusion

**Current Status:** MED-01 V1 is **production-ready** with comprehensive workflow, activity integration, and document management.

**V2 Enhancement:** Focuses on **type-specific state differentiation** using a **catalog-based system** to accurately model MPI/MPE/MPJ workflows as specified in RUNNA V2 documentation.

**Effort Estimate:** **25-30 hours** frontend development + backend coordination

**Risk Level:** 🟡 **Medium** - Complex state logic, requires careful testing, backward compatibility critical

**Recommendation:** Proceed with **Phase 1 (Type Definitions)** immediately to align with backend MED-01 V2 implementation.
