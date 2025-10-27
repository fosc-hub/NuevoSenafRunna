# LEG-01 V2: Vinculación Justificada de Legajos - Implementation Guide

**Date**: 2024-10-26
**Story**: LEG-01 - Reconocimiento de Existencia de Legajo y Vinculación Justificada
**Version**: V2.0 (2024-10-25)
**Status**: V1 Complete ✅ | V2 Not Implemented ❌

---

## 📊 Executive Summary

### What Changed from V1 to V2?

**V1 (Fully Implemented)**: Duplicate Detection Only
- Detect duplicates during REG-01 Paso 3
- Show alerts with scoring (CRITICA, ALTA, MEDIA)
- Allow linking demanda to existing legajo
- Forced creation with justification

**V2 (Not Implemented)**: Vinculación Justificada System
- **NEW**: Explicit Legajo-to-Legajo linking with justification
- **NEW**: Legajo-to-Medida linking (cross-legajo relationships)
- **NEW**: 4 link types: HERMANOS, MISMO_CASO_JUDICIAL, MEDIDAS_RELACIONADAS, TRANSFERENCIA
- **NEW**: Full audit trail (creado_por, desvinculado_por, soft delete)
- **NEW**: PLTM integration for group activity management (permite_gestion_grupal)
- **NEW**: API endpoints for link CRUD operations

### Implementation Status

| Component | V1 Status | V2 Status | Completion |
|-----------|-----------|-----------|------------|
| **Duplicate Detection** | ✅ Complete | N/A | 100% |
| **Types/Interfaces** | ✅ Complete | ❌ Missing | 0% |
| **API Services** | ✅ Complete | ❌ Missing | 0% |
| **UI Components** | ✅ Complete | ❌ Missing | 0% |
| **PLTM Integration** | N/A | ❌ Missing | 0% |
| **Backend Models** | ✅ (Assumed) | ❌ Unknown | ? |

**Critical Gap**: The entire Vinculación Justificada system (V2) is not implemented in the frontend codebase.

---

## ✅ Current Implementation (V1) - Detailed Analysis

### 1. Types & Interfaces (100% Complete)

**File**: `src/app/(runna)/legajo-mesa/types/legajo-duplicado-types.ts` (394 lines)

**Implemented Interfaces**:
```typescript
// Alert System
type AlertLevel = "CRITICA" | "ALTA" | "MEDIA"
type RecommendationType = "VINCULAR" | "REVISAR" | "CONTINUAR"
type MatchType = "exacto" | "similar" | "diferente" | "no_disponible"

// Search Operations
interface DuplicateSearchRequest {
  dni?: number | null
  nombre: string
  apellido: string
  fecha_nacimiento?: string | null
  genero?: string | null
  nombre_autopercibido?: string | null
}

interface DuplicateSearchResponse {
  duplicados_encontrados: boolean
  total_matches: number
  matches: LegajoMatch[]
  recomendacion: RecommendationType
  threshold_usado: number
}

interface LegajoMatch {
  legajo_id: number
  legajo_numero: string
  score: number  // 0.0 - 1.0
  nivel_alerta: AlertLevel
  nnya: NnyaMatchData
  legajo_info: LegajoMatchInfo
  comparacion: DataComparison
  tiene_permisos: boolean
  puede_vincular: boolean
}

// Linking Operations (V1: Demanda → Legajo only)
interface VincularDemandaRequest {
  demanda_id: number
  actualizar_datos_nnya?: boolean
  campos_actualizar?: string[]
}

interface VincularDemandaResponse {
  vinculacion_exitosa: boolean
  legajo_id: number
  demanda_id: number
  nnya_actualizado: boolean
  campos_actualizados: string[]
  notificaciones_enviadas: Array<{...}>
  mensaje: string
}

// Forced Creation with Justification
interface CrearConDuplicadoRequest {
  demanda_id: number
  legajo_duplicado_ignorado: number
  score_duplicado_ignorado: number
  justificacion: string  // min 20 chars
  confirmacion_usuario: boolean
  nnya_data: {...}
}

// Constants
const DUPLICATE_THRESHOLDS = {
  CRITICA: 1.0,
  ALTA: 0.75,
  MEDIA: 0.50,
  SIN_ALERTA: 0.0,
}

const MIN_CARACTERES_JUSTIFICACION = 20
const DUPLICATE_SEARCH_DEBOUNCE_MS = 500
```

**Assessment**: ✅ Complete and production-ready for V1 functionality.

---

### 2. API Services (100% Complete)

**File**: `src/app/(runna)/legajo-mesa/api/legajo-duplicado-api-service.ts` (313 lines)

**Implemented Functions**:
```typescript
// Main API Operations
export const buscarDuplicados = async (
  data: DuplicateSearchRequest
): Promise<DuplicateSearchResponse>
// POST /api/legajos/buscar-duplicados/

export const vincularDemandaALegajo = async (
  legajoId: number,
  data: VincularDemandaRequest
): Promise<VincularDemandaResponse>
// POST /api/legajos/{legajo_id}/vincular-demanda/

export const crearLegajoConDuplicado = async (
  data: CrearConDuplicadoRequest
): Promise<CrearConDuplicadoResponse>
// POST /api/legajos/crear-con-duplicado-confirmado/

// Validation Helpers
export const validarDatosParaBusqueda = (data: Partial<DuplicateSearchRequest>): boolean
export const validarDNI = (dni: number | null | undefined): boolean
export const debeEjecutarBusqueda = (data: Partial<DuplicateSearchRequest>): boolean

// Alert Helpers
export const getAlertColor = (score: number): string
export const getAlertLevel = (score: number): "CRITICA" | "ALTA" | "MEDIA" | "NINGUNA"
```

**Error Handling**:
- ✅ 400 Bad Request: Insufficient data
- ✅ 403 Forbidden: Permission errors
- ✅ 404 Not Found: Legajo not found
- ✅ 500 Server Error: Generic server errors

**Assessment**: ✅ Production-ready with comprehensive error handling.

---

### 3. UI Components (100% Complete)

#### 3.1 Main Duplicate Detection Modal
**File**: `src/components/forms/components/nnya/duplicate-detection-modal.tsx` (520 lines)

**Features**:
- ✅ Shows up to 5 matches sorted by score
- ✅ Color-coded alerts (red=CRITICA, orange=ALTA, yellow=MEDIA)
- ✅ Expandable comparison view for each match
- ✅ 4 Actions: Ver Detalle, Vincular, Crear Nuevo, Cancelar
- ✅ Permission handling (tiene_permisos, puede_vincular)
- ✅ Integrated scoring progress bars
- ✅ Field-by-field comparison visualization
- ✅ Sub-modals: Justification, Permisos Solicitud

**Props**:
```typescript
interface DuplicateDetectionModalProps {
  open: boolean
  onClose: () => void
  matches: LegajoMatch[]
  maxAlertLevel: AlertLevel
  onVincular: (legajoId: number, data: VincularDemandaRequest) => Promise<void>
  onCrearNuevo: (data: CrearConDuplicadoRequest) => Promise<void>
  onSolicitarPermisos?: (legajoId: number, data: {...}) => Promise<void>
  isProcessing?: boolean
  demandaData?: {...}
}
```

#### 3.2 Supporting Components
```
src/components/forms/components/nnya/
├── duplicate-justification-modal.tsx      ✅ Justification input (min 20 chars)
├── legajo-comparison-view.tsx             ✅ Field-by-field comparison table
├── scoring-progress-bar.tsx               ✅ Visual score representation
├── duplicate-alert-badge.tsx              ✅ Badge indicators
└── permisos-solicitud-modal.tsx           ✅ Permission request form
```

**Assessment**: ✅ Complete, polished, production-ready UI system.

---

### 4. Hooks & Utilities (100% Complete)

**Files**:
- `src/components/forms/hooks/useDuplicateDetection.ts` - Detection logic hook
- `src/components/forms/utils/duplicate-detection-validator.ts` - Validation utilities
- `src/components/forms/constants/duplicate-thresholds.ts` - Constants definition
- `src/components/forms/hooks/useVinculacionSearch.ts` - Search integration

**Assessment**: ✅ Well-structured, reusable logic.

---

## ❌ V2 Requirements - Missing Components

### 1. New Types & Interfaces (0% Implemented)

**Required Files to Create**:

#### 1.1 `src/app/(runna)/legajo-mesa/types/vinculo-types.ts` (NEW)
```typescript
// ============================================
// Link Type Catalog
// ============================================

/**
 * Tipos de vínculo entre legajos/medidas/demandas
 * Backend: TTipoVinculo model
 */
export type TipoVinculoCodigo =
  | "HERMANOS"                  // Siblings relationship
  | "MISMO_CASO_JUDICIAL"       // Same legal case
  | "MEDIDAS_RELACIONADAS"      // Related protection measures
  | "TRANSFERENCIA"             // Transfer between zones

export interface TTipoVinculo {
  id: number
  codigo: TipoVinculoCodigo
  nombre: string
  descripcion: string
  activo: boolean
}

// ============================================
// Link Entity (Central Model)
// ============================================

/**
 * Vínculo between legajo and another entity (legajo/medida/demanda)
 * Backend: TVinculoLegajo model
 */
export interface TVinculoLegajo {
  id: number

  // Origin (always a Legajo)
  legajo_origen: number
  legajo_origen_info: {
    id: number
    numero: string
    nnya_nombre_completo: string
  }

  // Destination (exactly ONE of these must be populated)
  legajo_destino: number | null
  legajo_destino_info?: {
    id: number
    numero: string
    nnya_nombre_completo: string
  }

  medida_destino: number | null
  medida_destino_info?: {
    id: number
    numero: string
    tipo_medida: string
  }

  demanda_destino: number | null
  demanda_destino_info?: {
    id: number
    numero: string
    tipo_demanda: string
  }

  // Link Metadata
  tipo_vinculo: number
  tipo_vinculo_info: TTipoVinculo

  // Justification (REQUIRED, min 20 chars)
  justificacion: string

  // Audit Trail
  creado_por: number
  creado_por_info: {
    id: number
    nombre_completo: string
  }
  creado_en: string  // ISO datetime

  // Soft Delete
  activo: boolean
  desvinculado_por: number | null
  desvinculado_por_info?: {
    id: number
    nombre_completo: string
  }
  desvinculado_en: string | null  // ISO datetime
  justificacion_desvincular: string | null
}

// ============================================
// API Request/Response Types
// ============================================

/**
 * Request to create a new link
 * POST /api/vinculos/
 */
export interface CrearVinculoRequest {
  legajo_origen_id: number

  // Destination (exactly ONE required)
  legajo_destino_id?: number
  medida_destino_id?: number
  demanda_destino_id?: number

  tipo_vinculo_codigo: TipoVinculoCodigo
  justificacion: string  // min 20 chars
}

export interface CrearVinculoResponse {
  vinculo_creado: boolean
  vinculo_id: number
  vinculo: TVinculoLegajo
  mensaje: string
}

/**
 * Request to deactivate a link (soft delete)
 * DELETE /api/vinculos/{id}/
 */
export interface DesvincularRequest {
  justificacion: string  // min 20 chars, required
}

export interface DesvincularResponse {
  desvinculacion_exitosa: boolean
  vinculo_id: number
  mensaje: string
}

/**
 * Get all links for a legajo
 * GET /api/vinculos/legajo/{legajo_id}/
 */
export interface VinculosLegajoResponse {
  legajo_id: number
  vinculos_activos: TVinculoLegajo[]
  vinculos_inactivos: TVinculoLegajo[]  // Historical
  total_activos: number
  total_inactivos: number
}

/**
 * Get group structure (hermanos + medidas vinculadas)
 * GET /api/vinculos/grupo/{legajo_id}/
 */
export interface GrupoVinculadoResponse {
  legajo_raiz: number
  hermanos: Array<{
    legajo_id: number
    nombre_completo: string
    medidas: number[]  // IDs of related medidas
  }>
  medidas_vinculadas: Array<{
    medida_id: number
    tipo_medida: string
  }>
  total_vinculos: number
}

// ============================================
// Constants
// ============================================

export const MIN_CARACTERES_JUSTIFICACION_VINCULO = 20

export const TIPO_VINCULO_LABELS: Record<TipoVinculoCodigo, string> = {
  HERMANOS: "Hermanos",
  MISMO_CASO_JUDICIAL: "Mismo Caso Judicial",
  MEDIDAS_RELACIONADAS: "Medidas Relacionadas",
  TRANSFERENCIA: "Transferencia",
}

export const TIPO_VINCULO_DESCRIPTIONS: Record<TipoVinculoCodigo, string> = {
  HERMANOS: "Vínculo entre legajos de hermanos",
  MISMO_CASO_JUDICIAL: "Legajos relacionados al mismo expediente judicial",
  MEDIDAS_RELACIONADAS: "Medidas vinculadas entre diferentes legajos",
  TRANSFERENCIA: "Transferencia de legajo entre zonas",
}
```

#### 1.2 Update `src/app/(runna)/legajo\[id]\medida\[medidaId]\types\actividades.ts`
```typescript
// ADD to TActividadPlanTrabajo interface:

export interface TActividadPlanTrabajo {
  // ... existing fields ...

  // ============================================
  // V2: Group Management (PLTM Integration)
  // ============================================

  /**
   * If true, this activity applies to all linked siblings/group
   * Enables batch creation across hermanos
   */
  permite_gestion_grupal: boolean

  /**
   * Reference to original activity if this was replicated
   * Tracks group activity relationships
   */
  actividad_origen_grupal: number | null
  actividad_origen_grupal_info?: {
    id: number
    descripcion: string
    legajo_origen: number
  }

  // ... rest of existing fields ...
}
```

**Assessment**: ❌ 0% complete - These files need to be created from scratch.

---

### 2. New API Services (0% Implemented)

**Required File to Create**:

#### 2.1 `src/app/(runna)/legajo-mesa/api/vinculo-api-service.ts` (NEW)
```typescript
/**
 * API Service for Vinculación Justificada de Legajos (LEG-01 V2)
 * Connects to /api/vinculos/ endpoints
 */

import { get, create, del } from "@/app/api/apiService"
import type {
  TTipoVinculo,
  TVinculoLegajo,
  CrearVinculoRequest,
  CrearVinculoResponse,
  DesvincularRequest,
  DesvincularResponse,
  VinculosLegajoResponse,
  GrupoVinculadoResponse,
} from "../types/vinculo-types"

/**
 * Get all available link types (catalog)
 * GET /api/vinculos/tipos/
 */
export const getTiposVinculo = async (): Promise<TTipoVinculo[]> => {
  try {
    const response = await get<TTipoVinculo[]>("vinculos/tipos")
    return response
  } catch (error) {
    console.error("Error fetching tipo vinculo catalog:", error)
    throw error
  }
}

/**
 * Create a new link between legajo and another entity
 * POST /api/vinculos/
 */
export const crearVinculo = async (
  data: CrearVinculoRequest
): Promise<CrearVinculoResponse> => {
  try {
    // Validation: exactly ONE destination
    const destinationCount = [
      data.legajo_destino_id,
      data.medida_destino_id,
      data.demanda_destino_id
    ].filter(Boolean).length

    if (destinationCount === 0) {
      throw new Error("Se requiere al menos una entidad destino")
    }

    if (destinationCount > 1) {
      throw new Error("Solo puede vincular a UNA entidad destino")
    }

    // Validation: justification length
    if (!data.justificacion || data.justificacion.trim().length < 20) {
      throw new Error("La justificación debe tener al menos 20 caracteres")
    }

    const response = await create<CrearVinculoResponse>("vinculos", data)
    return response
  } catch (error: any) {
    console.error("Error creating vinculo:", error)

    if (error?.response?.status === 400) {
      throw new Error(error.response.data?.error || "Datos inválidos para vinculación")
    }

    if (error?.response?.status === 403) {
      throw new Error("Sin permisos para crear este vínculo")
    }

    throw error
  }
}

/**
 * Deactivate a link (soft delete)
 * DELETE /api/vinculos/{id}/
 */
export const desvincular = async (
  vinculoId: number,
  data: DesvincularRequest
): Promise<DesvincularResponse> => {
  try {
    if (!data.justificacion || data.justificacion.trim().length < 20) {
      throw new Error("La justificación debe tener al menos 20 caracteres")
    }

    const response = await del<DesvincularResponse>(`vinculos/${vinculoId}`, data)
    return response
  } catch (error: any) {
    console.error("Error deactivating vinculo:", error)
    throw error
  }
}

/**
 * Get all links for a specific legajo
 * GET /api/vinculos/legajo/{legajo_id}/
 */
export const getVinculosLegajo = async (
  legajoId: number,
  includeInactive: boolean = false
): Promise<VinculosLegajoResponse> => {
  try {
    const params = includeInactive ? { include_inactive: "true" } : {}
    const response = await get<VinculosLegajoResponse>(
      `vinculos/legajo/${legajoId}`,
      params
    )
    return response
  } catch (error) {
    console.error("Error fetching vinculos for legajo:", error)
    throw error
  }
}

/**
 * Get complete group structure (hermanos + medidas)
 * GET /api/vinculos/grupo/{legajo_id}/
 */
export const getGrupoVinculado = async (
  legajoId: number
): Promise<GrupoVinculadoResponse> => {
  try {
    const response = await get<GrupoVinculadoResponse>(
      `vinculos/grupo/${legajoId}`
    )
    return response
  } catch (error) {
    console.error("Error fetching grupo vinculado:", error)
    throw error
  }
}
```

**Assessment**: ❌ 0% complete - This file needs to be created.

---

### 3. New UI Components (0% Implemented)

**Required Components to Create**:

#### 3.1 `src/components/forms/components/vinculo/crear-vinculo-dialog.tsx` (NEW)
```typescript
/**
 * Dialog for creating new link between entities
 *
 * Features:
 * - Select link type (HERMANOS, MISMO_CASO_JUDICIAL, etc.)
 * - Select destination entity (Legajo/Medida/Demanda)
 * - Mandatory justification input (min 20 chars)
 * - Validation and error handling
 */

interface CrearVinculoDialogProps {
  open: boolean
  onClose: () => void
  legajoOrigenId: number
  legajoOrigenNumero: string
  onVinculoCreado: (vinculo: TVinculoLegajo) => void
}
```

#### 3.2 `src/components/forms/components/vinculo/vinculos-list-section.tsx` (NEW)
```typescript
/**
 * Section to display all links for a legajo
 * Shows in Legajo Detail view (LEG-04)
 *
 * Features:
 * - Grouped by link type
 * - Active vs inactive links
 * - Desvincular action with justification
 * - Expandable details for each link
 */

interface VinculosListSectionProps {
  legajoId: number
  vinculos: TVinculoLegajo[]
  onDesvincular: (vinculoId: number) => void
  onRefresh: () => void
}
```

#### 3.3 `src/components/forms/components/vinculo/desvincular-justification-modal.tsx` (NEW)
```typescript
/**
 * Modal for deactivating a link (soft delete)
 *
 * Features:
 * - Shows link details
 * - Mandatory justification input (min 20 chars)
 * - Confirmation step
 */

interface DesvincularModalProps {
  open: boolean
  onClose: () => void
  vinculo: TVinculoLegajo
  onConfirm: (justificacion: string) => Promise<void>
}
```

#### 3.4 `src/components/forms/components/vinculo/grupo-management-panel.tsx` (NEW)
```typescript
/**
 * Panel for group activity management (PLTM integration)
 * Shows in Plan de Trabajo section
 *
 * Features:
 * - Visual representation of group structure
 * - Toggle "permite_gestion_grupal" on activities
 * - Apply activity to all hermanos action
 */

interface GrupoManagementPanelProps {
  legajoId: number
  grupo: GrupoVinculadoResponse
  onAplicarGrupo: (actividadId: number) => Promise<void>
}
```

**Assessment**: ❌ 0% complete - These components don't exist.

---

### 4. PLTM Integration (0% Implemented)

**Required Changes**:

#### 4.1 Update Activity Service
**File**: `src/app/(runna)/legajo\[id]\medida\[medidaId]\services\actividadService.ts`

Add new function:
```typescript
/**
 * Replicate activity to all linked siblings
 * Creates copy of activity in each hermano's plan de trabajo
 */
export const aplicarActividadAGrupo = async (
  actividadId: number,
  legajoOrigenId: number
): Promise<{
  actividades_creadas: number[]
  total_creadas: number
  errores: string[]
}> => {
  // 1. Get grupo structure
  const grupo = await getGrupoVinculado(legajoOrigenId)

  // 2. Get original activity
  const actividadOriginal = await getActividad(actividadId)

  // 3. Create activity for each hermano
  const results = await Promise.allSettled(
    grupo.hermanos.map(hermano =>
      crearActividadReplicada(hermano.legajo_id, actividadOriginal)
    )
  )

  // 4. Return summary
  return procesarResultados(results)
}
```

#### 4.2 Update Activity Detail Component
**File**: `src/app/(runna)/legajo\[id]\medida\[medidaId]\components\medida\ActividadDetailModal.tsx`

Add UI section:
```typescript
{/* Group Management Section - NEW V2 */}
{actividad.permite_gestion_grupal && (
  <Box>
    <Alert severity="info" icon={<GroupIcon />}>
      Esta actividad está configurada para gestión grupal
    </Alert>

    <Button
      variant="outlined"
      startIcon={<GroupAddIcon />}
      onClick={() => handleAplicarAGrupo(actividad.id)}
      disabled={isProcessing}
    >
      Aplicar a Hermanos Vinculados
    </Button>
  </Box>
)}
```

**Assessment**: ❌ 0% complete - No integration with group management.

---

## 📁 File-by-File Implementation Checklist

### Files to CREATE (V2)

#### Types & Interfaces
- [ ] `src/app/(runna)/legajo-mesa/types/vinculo-types.ts` (NEW)
  - TVinculoLegajo interface
  - TTipoVinculo interface
  - All request/response types
  - Constants

#### API Services
- [ ] `src/app/(runna)/legajo-mesa/api/vinculo-api-service.ts` (NEW)
  - crearVinculo()
  - desvincular()
  - getVinculosLegajo()
  - getGrupoVinculado()
  - getTiposVinculo()

#### UI Components
- [ ] `src/components/forms/components/vinculo/crear-vinculo-dialog.tsx` (NEW)
- [ ] `src/components/forms/components/vinculo/vinculos-list-section.tsx` (NEW)
- [ ] `src/components/forms/components/vinculo/desvincular-justification-modal.tsx` (NEW)
- [ ] `src/components/forms/components/vinculo/grupo-management-panel.tsx` (NEW)

#### Hooks & Utilities
- [ ] `src/components/forms/hooks/useVinculos.ts` (NEW)
  - Hook for vinculo CRUD operations
- [ ] `src/components/forms/utils/vinculo-validator.ts` (NEW)
  - Validation logic for vinculo operations

### Files to MODIFY (V2)

#### Type Updates
- [ ] `src/app/(runna)/legajo\[id]\medida\[medidaId]\types\actividades.ts`
  - ADD permite_gestion_grupal: boolean
  - ADD actividad_origen_grupal: number | null

#### Component Updates
- [ ] `src/app/(runna)/legajo\[id]\medida\[medidaId]\components\legajo\legajo-detail.tsx`
  - ADD VinculosListSection component integration

- [ ] `src/app/(runna)/legajo\[id]\medida\[medidaId]\components\medida\ActividadDetailModal.tsx`
  - ADD grupo management section
  - ADD "Aplicar a Grupo" button

#### Service Updates
- [ ] `src/app/(runna)/legajo\[id]\medida\[medidaId]\services\actividadService.ts`
  - ADD aplicarActividadAGrupo() function

---

## 🚀 Implementation Roadmap

### Phase 1: Types & Interfaces (Priority: CRITICAL)
**Estimated Time**: 2-4 hours

1. Create `vinculo-types.ts` with all interfaces
2. Update `actividades.ts` with PLTM fields
3. Validate type compatibility with existing code

**Deliverables**:
- [ ] All V2 types defined
- [ ] Type validation passes
- [ ] No breaking changes to V1

---

### Phase 2: API Services (Priority: HIGH)
**Estimated Time**: 4-6 hours

1. Create `vinculo-api-service.ts`
2. Implement all CRUD operations
3. Add comprehensive error handling
4. Write API integration tests

**Deliverables**:
- [ ] All vinculo API functions implemented
- [ ] Error handling for 400, 403, 404, 500
- [ ] API service tests pass

**Dependencies**:
- ✅ Backend API endpoints must exist
- ✅ Backend fixture for TTipoVinculo must be loaded

---

### Phase 3: Core UI Components (Priority: HIGH)
**Estimated Time**: 8-12 hours

1. Create `crear-vinculo-dialog.tsx`
   - Link type selection
   - Destination entity selection
   - Justification input with validation

2. Create `vinculos-list-section.tsx`
   - Display active/inactive links
   - Group by link type
   - Desvincular action

3. Create `desvincular-justification-modal.tsx`
   - Justification input
   - Confirmation step

**Deliverables**:
- [ ] All core UI components functional
- [ ] Material-UI consistent styling
- [ ] Responsive design
- [ ] Accessibility compliance

---

### Phase 4: PLTM Integration (Priority: MEDIUM)
**Estimated Time**: 6-8 hours

1. Update activity types with PLTM fields
2. Implement `aplicarActividadAGrupo()` service function
3. Add grupo management panel UI
4. Update activity detail modal

**Deliverables**:
- [ ] Group activity creation working
- [ ] UI shows group management options
- [ ] Activity replication tested

**Dependencies**:
- ✅ Vinculo API operational
- ✅ getGrupoVinculado() endpoint working

---

### Phase 5: Integration & Testing (Priority: HIGH)
**Estimated Time**: 4-6 hours

1. Integrate vinculos section into Legajo Detail (LEG-04)
2. Add vinculo creation from various entry points
3. Write component tests
4. E2E testing with real data

**Deliverables**:
- [ ] Full integration working
- [ ] All tests passing
- [ ] User acceptance testing complete

---

## 🏗️ Technical Architecture

### Data Flow: Creating a Vinculo

```
User Action (UI)
    ↓
crear-vinculo-dialog.tsx
    ↓
useVinculos hook
    ↓
vinculo-api-service.ts
    ↓
POST /api/vinculos/
    ↓
Backend (Django)
    ↓
TVinculoLegajo.save()
    ↓
Response: CrearVinculoResponse
    ↓
UI Update (optimistic update)
    ↓
Refresh vinculos list
```

### Data Flow: Group Activity Application

```
User clicks "Aplicar a Grupo"
    ↓
ActividadDetailModal
    ↓
aplicarActividadAGrupo(actividadId, legajoId)
    ↓
getGrupoVinculado(legajoId)  // Get hermanos
    ↓
For each hermano:
  - Get/Create Plan de Trabajo
  - Clone activity
  - Set actividad_origen_grupal = original_id
    ↓
Return summary: {created, errors}
    ↓
UI shows success message
```

### Database Relationships (V2)

```
TLegajo (1) ←→ (N) TVinculoLegajo
                    ↓
                    → tipo_vinculo (FK → TTipoVinculo)
                    → creado_por (FK → User)
                    → desvinculado_por (FK → User)
                    → legajo_destino (FK → TLegajo)
                    → medida_destino (FK → TMedida)
                    → demanda_destino (FK → TDemanda)

TActividadPlanTrabajo
  → permite_gestion_grupal (Boolean)
  → actividad_origen_grupal (FK → TActividadPlanTrabajo)
```

---

## 🧪 Testing Strategy

### Unit Tests

#### vinculo-api-service.test.ts
```typescript
describe("vinculo-api-service", () => {
  describe("crearVinculo", () => {
    it("should throw error if no destination entity", async () => {
      await expect(crearVinculo({
        legajo_origen_id: 1,
        tipo_vinculo_codigo: "HERMANOS",
        justificacion: "Test justification text"
      })).rejects.toThrow("Se requiere al menos una entidad destino")
    })

    it("should throw error if justification < 20 chars", async () => {
      await expect(crearVinculo({
        legajo_origen_id: 1,
        legajo_destino_id: 2,
        tipo_vinculo_codigo: "HERMANOS",
        justificacion: "Short"
      })).rejects.toThrow("debe tener al menos 20 caracteres")
    })

    it("should create vinculo successfully", async () => {
      const result = await crearVinculo({
        legajo_origen_id: 1,
        legajo_destino_id: 2,
        tipo_vinculo_codigo: "HERMANOS",
        justificacion: "Son hermanos del mismo núcleo familiar"
      })

      expect(result.vinculo_creado).toBe(true)
      expect(result.vinculo_id).toBeGreaterThan(0)
    })
  })

  describe("desvincular", () => {
    it("should require justification", async () => {
      await expect(desvincular(1, {
        justificacion: ""
      })).rejects.toThrow()
    })
  })
})
```

#### crear-vinculo-dialog.test.tsx
```typescript
describe("CrearVinculoDialog", () => {
  it("should render all link type options", () => {
    render(<CrearVinculoDialog open={true} {...props} />)

    expect(screen.getByText("Hermanos")).toBeInTheDocument()
    expect(screen.getByText("Mismo Caso Judicial")).toBeInTheDocument()
    expect(screen.getByText("Medidas Relacionadas")).toBeInTheDocument()
  })

  it("should show error if justification < 20 chars", async () => {
    render(<CrearVinculoDialog open={true} {...props} />)

    const justificationInput = screen.getByLabelText("Justificación")
    fireEvent.change(justificationInput, { target: { value: "Short" } })

    const submitButton = screen.getByText("Crear Vínculo")
    fireEvent.click(submitButton)

    expect(await screen.findByText(/al menos 20 caracteres/)).toBeInTheDocument()
  })
})
```

### Integration Tests

#### vinculo-workflow.integration.test.ts
```typescript
describe("Vinculo Workflow Integration", () => {
  it("should create link between hermanos", async () => {
    // Setup: Create 2 legajos
    const legajo1 = await createTestLegajo({nombre: "Juan", apellido: "Pérez"})
    const legajo2 = await createTestLegajo({nombre: "María", apellido: "Pérez"})

    // Action: Create vinculo
    const vinculo = await crearVinculo({
      legajo_origen_id: legajo1.id,
      legajo_destino_id: legajo2.id,
      tipo_vinculo_codigo: "HERMANOS",
      justificacion: "Son hermanos confirmados por equipo social"
    })

    // Assert
    expect(vinculo.vinculo_creado).toBe(true)

    // Verify both directions
    const vinculos1 = await getVinculosLegajo(legajo1.id)
    const vinculos2 = await getVinculosLegajo(legajo2.id)

    expect(vinculos1.total_activos).toBe(1)
    expect(vinculos2.total_activos).toBe(1)
  })

  it("should apply activity to grupo", async () => {
    // Setup: Create hermanos with vinculos
    const grupo = await createTestGrupoHermanos(3)  // 3 hermanos

    // Create activity for first hermano
    const actividad = await createTestActividad({
      legajo_id: grupo.hermanos[0].legajo_id,
      permite_gestion_grupal: true
    })

    // Action: Apply to grupo
    const result = await aplicarActividadAGrupo(actividad.id, grupo.legajo_raiz)

    // Assert
    expect(result.total_creadas).toBe(2)  // Created for 2 other hermanos
    expect(result.errores).toHaveLength(0)
  })
})
```

---

## 📋 Backend Checklist (Django)

**Note**: This is a frontend implementation guide, but these backend requirements must be met:

### Django Models (Backend Team)
- [ ] `infrastructure/models/vinculo_models.py` created
  - [ ] TTipoVinculo model
  - [ ] TVinculoLegajo model
  - [ ] Constraints implemented
  - [ ] Validation in clean() method

- [ ] `infrastructure/models/medida/TActividadPlanTrabajo.py` updated
  - [ ] permite_gestion_grupal field added
  - [ ] actividad_origen_grupal field added

### Django API Endpoints (Backend Team)
- [ ] GET `/api/vinculos/tipos/` (TTipoVinculo catalog)
- [ ] POST `/api/vinculos/` (Create vinculo)
- [ ] GET `/api/vinculos/{id}/` (Get vinculo detail)
- [ ] DELETE `/api/vinculos/{id}/` (Soft delete with justification)
- [ ] GET `/api/vinculos/legajo/{legajo_id}/` (List all vinculos)
- [ ] GET `/api/vinculos/grupo/{legajo_id}/` (Get grupo structure)

### Django Fixtures (Backend Team)
- [ ] `infrastructure/management/fixtures/ttipo_vinculo.json`
  - [ ] HERMANOS
  - [ ] MISMO_CASO_JUDICIAL
  - [ ] MEDIDAS_RELACIONADAS
  - [ ] TRANSFERENCIA

### Django Tests (Backend Team)
- [ ] test_vinculo_legajo.py (14 tests from US)
- [ ] Validation tests (justification, circular links, duplicates)
- [ ] Permission tests
- [ ] Soft delete tests

---

## ⚠️ Critical Integration Points

### 1. LEG-04 (Detalle de Legajo)
**Current**: Shows legajo details without vinculos
**Required**: Add VinculosListSection component

**Location**: `src/app/(runna)/legajo\[id]\medida\[medidaId]\components\legajo\legajo-detail.tsx`

**Integration**:
```typescript
// Add new tab or section
<TabPanel value="vinculos">
  <VinculosListSection
    legajoId={legajoId}
    vinculos={vinculosData}
    onDesvincular={handleDesvincular}
    onRefresh={refetchVinculos}
  />
</TabPanel>
```

### 2. REG-01 (Registro de Demanda)
**Current**: Links demanda to legajo during duplicate detection
**Required**: No changes needed (already uses VincularDemandaRequest)

### 3. PLTM-01 (Plan de Trabajo)
**Current**: Creates activities without group management
**Required**: Add grupo management UI

**Location**: `src/app/(runna)/legajo\[id]\medida\[medidaId]\components\medida\ActividadDetailModal.tsx`

### 4. BE-06 (Gestión de Legajo)
**Current**: Transfers legajos without preserving vinculos
**Required**: Backend must preserve vinculos on transfer

**Note**: Frontend doesn't need changes if backend handles this correctly.

---

## 📊 Success Metrics

### Functional Metrics
- [ ] User can create vinculo between 2 legajos (hermanos)
- [ ] User can create vinculo between legajo and medida
- [ ] User can desvincular with justification
- [ ] User can see all vinculos in legajo detail
- [ ] User can apply activity to grupo hermanos
- [ ] Audit trail is complete and visible

### Technical Metrics
- [ ] 0 TypeScript errors
- [ ] All tests passing (>90% coverage)
- [ ] No console errors in production
- [ ] API response time < 500ms
- [ ] UI renders without layout shift

### Business Metrics
- [ ] Reduction in duplicate legajos created
- [ ] Hermanos properly linked in 100% of cases
- [ ] Group activity creation saves 60% time vs manual

---

## 🔗 Dependencies & References

### Related User Stories
- **LEG-01 V1**: Duplicate Detection (✅ Implemented)
- **LEG-02**: Registro de Legajo (✅ Implemented)
- **LEG-04**: Detalle de Legajo (⚠️ Needs vinculos section)
- **REG-01**: Registro de Demanda (✅ Implemented, V2-compatible)
- **MED-01**: Registro de Medida (✅ Implemented)
- **PLTM-01**: Plan de Trabajo (⚠️ Needs group management)
- **PLTM-02**: Acción sobre Actividad (⚠️ Needs group actions)
- **BE-06**: Gestión de Legajo (❌ Backend must preserve vinculos)

### Documentation
- User Story: `stories/LEG-01_Reconocimiento_Existencia_Legajo.md` (lines 76-2000)
- Django Models: Story lines 1586-1932
- API Spec: Story lines 568-695
- Tests: Story lines 786-1091

### External Resources
- Material-UI Components: https://mui.com/material-ui/
- Django Models Documentation: (Backend team reference)
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

## 👥 Team Coordination

### Frontend Team Tasks
1. Create all TypeScript interfaces (Phase 1)
2. Implement API services (Phase 2)
3. Build UI components (Phase 3)
4. PLTM integration (Phase 4)
5. Testing and QA (Phase 5)

### Backend Team Requirements
1. Create Django models (TVinculoLegajo, TTipoVinculo)
2. Implement API endpoints
3. Load fixtures
4. Write backend tests
5. Preserve vinculos on transfers

### Coordination Points
- **Week 1**: Backend creates models and endpoints
- **Week 2**: Frontend creates types and API services
- **Week 3**: Frontend builds UI components
- **Week 4**: Integration testing and refinement

---

## ✅ Implementation Completion Checklist

### Phase 1: Types ✅/❌
- [ ] vinculo-types.ts created with all interfaces
- [ ] actividades.ts updated with PLTM fields
- [ ] No TypeScript compilation errors
- [ ] Types validated against backend schema

### Phase 2: API Services ✅/❌
- [ ] vinculo-api-service.ts created
- [ ] All CRUD operations implemented
- [ ] Error handling comprehensive
- [ ] API tests passing

### Phase 3: UI Components ✅/❌
- [ ] crear-vinculo-dialog.tsx functional
- [ ] vinculos-list-section.tsx displays correctly
- [ ] desvincular-justification-modal.tsx working
- [ ] grupo-management-panel.tsx integrated
- [ ] All components styled consistently

### Phase 4: PLTM Integration ✅/❌
- [ ] aplicarActividadAGrupo() implemented
- [ ] Activity detail modal updated
- [ ] Group management UI functional
- [ ] Activity replication tested

### Phase 5: Integration ✅/❌
- [ ] LEG-04 shows vinculos section
- [ ] All entry points working
- [ ] E2E tests passing
- [ ] User acceptance complete

---

## 🎯 Next Steps

1. **IMMEDIATE**: Review this implementation guide with team
2. **IMMEDIATE**: Confirm backend API availability
3. **Week 1**: Start Phase 1 (Types & Interfaces)
4. **Week 2**: Start Phase 2 (API Services) + Phase 3 (UI Components)
5. **Week 3**: Complete Phase 4 (PLTM Integration)
6. **Week 4**: Phase 5 (Integration & Testing)

---

**Document Version**: 1.0
**Last Updated**: 2024-10-26
**Author**: LEG-01 V2 Analysis
**Status**: Ready for Implementation

---

## Appendix A: Quick Reference

### V1 vs V2 Feature Matrix

| Feature | V1 | V2 |
|---------|----|----|
| Duplicate Detection | ✅ | ✅ (Maintained) |
| Demanda → Legajo Link | ✅ | ✅ (Maintained) |
| Legajo → Legajo Link | ❌ | ✅ (NEW) |
| Legajo → Medida Link | ❌ | ✅ (NEW) |
| Legajo → Demanda Link | Implicit | ✅ Explicit (NEW) |
| Link Justification | ❌ | ✅ (NEW) |
| Link Types (4) | ❌ | ✅ (NEW) |
| Audit Trail | Partial | ✅ Complete (NEW) |
| Soft Delete | ❌ | ✅ (NEW) |
| Group Management | ❌ | ✅ (NEW) |

### API Endpoint Summary

| Endpoint | Method | V1 | V2 |
|----------|--------|----|----|
| `/api/legajos/buscar-duplicados/` | POST | ✅ | ✅ |
| `/api/legajos/{id}/vincular-demanda/` | POST | ✅ | ✅ |
| `/api/legajos/crear-con-duplicado-confirmado/` | POST | ✅ | ✅ |
| `/api/vinculos/tipos/` | GET | ❌ | ✅ |
| `/api/vinculos/` | POST | ❌ | ✅ |
| `/api/vinculos/{id}/` | GET | ❌ | ✅ |
| `/api/vinculos/{id}/` | DELETE | ❌ | ✅ |
| `/api/vinculos/legajo/{id}/` | GET | ❌ | ✅ |
| `/api/vinculos/grupo/{id}/` | GET | ❌ | ✅ |

---

**END OF DOCUMENT**
