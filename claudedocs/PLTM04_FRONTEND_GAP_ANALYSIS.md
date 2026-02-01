# PLTM-04: Frontend Gap Analysis

**Analysis Date**: 2026-02-01
**Backend Status**: Fully Implemented
**Frontend Status**: Requires Full Implementation

---

## Executive Summary

The backend team has delivered a comprehensive **Historial de Seguimiento Unificado** module (PLTM-04) with 9 new API endpoints. The current frontend has **placeholder components with mock data** that do not connect to these new endpoints. This document outlines the complete gap between backend capabilities and frontend implementation.

### Implementation Effort Estimate
| Category | Estimated Components | Priority |
|----------|---------------------|----------|
| API Services | 2 services | P0 |
| TypeScript Types | 5 interfaces | P0 |
| Custom Hooks | 4 hooks | P0 |
| UI Components | 8-10 components | P1 |
| Integration | 3-4 integration points | P1 |

---

## Gap Analysis Matrix

### Legend
- **Backend**: What the API provides
- **Frontend Current**: What exists today
- **Gap**: What needs to be built

---

## 1. API Endpoints Gap

### 1.1 Historial Seguimiento Endpoints (6 endpoints)

| Endpoint | Method | Backend Status | Frontend Status | Gap |
|----------|--------|----------------|-----------------|-----|
| `/api/medidas/{id}/historial-seguimiento/` | GET | Implemented | **NO API Service** | Create service + hook |
| `/api/medidas/{id}/historial-seguimiento/{id}/` | GET | Implemented | **NO API Service** | Create service |
| `/api/medidas/{id}/historial-seguimiento/exportar/` | GET | Implemented | **NO API Service** | Create export function |
| `/api/medidas/{id}/historial-seguimiento/tipos/` | GET | Implemented | **NO API Service** | Create service |
| `/api/medidas/{id}/historial-seguimiento/resumen/` | GET | Implemented | **NO API Service** | Create service |
| `/api/historial-seguimiento-global/` | GET | Implemented (Admin) | **NO API Service** | Create admin service |

### 1.2 Trazabilidad Etapas Endpoints (3 endpoints)

| Endpoint | Method | Backend Status | Frontend Status | Gap |
|----------|--------|----------------|-----------------|-----|
| `/api/medidas/{id}/trazabilidad-etapas/` | GET | Implemented | **NO API Service** | Create service + hook |
| `/api/medidas/{id}/trazabilidad-etapas/compacta/` | GET | Implemented | **NO API Service** | Create service |
| `/api/medidas/{id}/trazabilidad-etapas/exportar/` | GET | Implemented | **NO API Service** | Create export function |

---

## 2. TypeScript Types Gap

### 2.1 Required New Types

```typescript
// ===== REQUIRED: src/app/(runna)/legajo/[id]/medida/[medidaId]/types/historial-seguimiento.ts =====

// Event Types (36 total from API)
export type TipoEvento =
  // Actividades (8)
  | 'ACTIVIDAD_CREADA' | 'ACTIVIDAD_EDITADA' | 'ACTIVIDAD_ESTADO_CAMBIO'
  | 'ACTIVIDAD_REPROGRAMADA' | 'ACTIVIDAD_COMENTARIO' | 'ACTIVIDAD_ADJUNTO'
  | 'ACTIVIDAD_VISADO' | 'ACTIVIDAD_TRANSFERIDA'
  // Intervenciones (4)
  | 'INTERVENCION_REGISTRADA' | 'INTERVENCION_ENVIADA'
  | 'INTERVENCION_APROBADA' | 'INTERVENCION_RECHAZADA'
  // Notas y documentos (4)
  | 'NOTA_AVAL_EMITIDA' | 'NOTA_AVAL_OBSERVADA'
  | 'INFORME_JURIDICO_CREADO' | 'INFORME_JURIDICO_ENVIADO'
  // Ratificacion y cierre (2)
  | 'RATIFICACION_REGISTRADA' | 'INFORME_CIERRE_CREADO'
  // Etapas (3)
  | 'ETAPA_CREADA' | 'ETAPA_CERRADA' | 'ESTADO_TRANSICION'
  // Informes mensuales (3)
  | 'INFORME_MENSUAL_CREADO' | 'INFORME_MENSUAL_COMPLETADO' | 'INFORME_MENSUAL_VENCIDO'
  // Seguimiento dispositivo (4)
  | 'SITUACION_DISPOSITIVO_CAMBIO' | 'TALLER_REGISTRADO'
  | 'CAMBIO_LUGAR_RESGUARDO' | 'NOTA_SEGUIMIENTO_CREADA'
  // Medida (4)
  | 'MEDIDA_CREADA' | 'MEDIDA_CERRADA' | 'MEDIDA_ARCHIVADA' | 'MEDIDA_NO_RATIFICADA'
  // Oficios (2)
  | 'OFICIO_CREADO' | 'OFICIO_CERRADO'
  // Manual (2)
  | 'COMENTARIO_MANUAL' | 'EVIDENCIA_CARGADA';

export type CategoriaEvento =
  | 'ACTIVIDAD' | 'INTERVENCION' | 'ETAPA' | 'INFORME'
  | 'SEGUIMIENTO' | 'MEDIDA' | 'OFICIO' | 'MANUAL';

// Full event detail (for individual event fetch)
export interface THistorialSeguimientoMedida {
  id: number;
  medida: number;
  tipo_evento: TipoEvento;
  tipo_evento_display: string;
  descripcion_automatica: string;
  datos_evento: Record<string, { antes?: unknown; despues?: unknown }> | null;
  fecha_evento: string; // ISO datetime
  usuario: number;
  usuario_info: UsuarioHistorial;
  usuario_nombre: string;
  etapa: number | null;
  etapa_info: string | null;
  // Deep-link IDs
  actividad_id: number | null;
  intervencion_id: number | null;
  nota_aval_id: number | null;
  informe_juridico_id: number | null;
  ratificacion_id: number | null;
  informe_cierre_id: number | null;
  informe_seguimiento_id: number | null;
  deep_link: string;
  ip_address: string | null;
}

// List item (optimized for timeline rendering)
export interface THistorialSeguimientoMedidaList {
  id: number;
  tipo_evento: TipoEvento;
  tipo_evento_display: string;
  descripcion_automatica: string;
  fecha_evento: string;
  usuario: number;
  usuario_nombre: string;
  etapa: number | null;
  etapa_tipo: string | null;
}

export interface UsuarioHistorial {
  id: number;
  username: string;
  nombre_completo: string;
  nivel?: string;
}

// Paginated response
export interface PaginatedHistorialSeguimiento {
  count: number;
  next: string | null;
  previous: string | null;
  results: THistorialSeguimientoMedidaList[];
}

// Query params for filtering
export interface HistorialSeguimientoQueryParams {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_evento?: TipoEvento;
  tipos_evento?: string; // comma-separated
  categoria?: CategoriaEvento;
  etapa?: number;
  etapa_tipo?: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | 'PROCESO';
  usuario?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

// Tipos endpoint response
export interface TiposEventoResponse {
  tipos: Array<{ codigo: TipoEvento; nombre: string }>;
  categorias: Record<CategoriaEvento, Array<{ codigo: TipoEvento; nombre: string }>>;
  total: number;
}

// Resumen endpoint response
export interface ResumenHistorialResponse {
  total_eventos: number;
  por_tipo: Record<TipoEvento, number>;
  por_categoria: Record<CategoriaEvento, number>;
  primer_evento: string | null;
  ultimo_evento: string | null;
}
```

### 2.2 Trazabilidad Etapas Types

```typescript
// ===== REQUIRED: src/app/(runna)/legajo/[id]/medida/[medidaId]/types/trazabilidad-etapas.ts =====

export interface TransicionEstado {
  fecha: string;
  tipo_cambio: '+' | '~' | '-'; // created, modified, closed
  estado: string;
  estado_display: string;
  tipo_etapa: string;
  tipo_etapa_display: string;
  cambios: Record<string, { anterior: string; nuevo: string; anterior_display: string; nuevo_display: string }> | null;
  usuario: string;
}

export interface EtapaTimeline {
  id: number;
  nombre: string;
  tipo_etapa: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | 'PROCESO';
  tipo_etapa_display: string;
  estado: string;
  estado_display: string;
  estado_especifico: {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
  } | null;
  fecha_inicio_estado: string;
  fecha_fin_estado: string | null;
  esta_activa: boolean;
  observaciones: string | null;
  transiciones_estado: TransicionEstado[];
}

export interface VigenciaTimeline {
  fecha: string;
  tipo_cambio: '+' | '~';
  estado_vigencia: 'VIGENTE' | 'CERRADA' | 'ARCHIVADA' | 'NO_RATIFICADA';
  estado_vigencia_display: string;
  estado_anterior: string | null;
  estado_anterior_display: string | null;
  usuario: string;
  etapa_actual_id: number | null;
}

export interface TrazabilidadEtapasResponse {
  medida: {
    id: number;
    numero_medida: string;
    tipo_medida: 'MPI' | 'MPE' | 'MPJ';
    tipo_medida_display: string;
    estado_vigencia: string;
    estado_vigencia_display: string;
    fecha_apertura: string;
    fecha_cierre: string | null;
    duracion_dias: number;
  };
  etapas_timeline: EtapaTimeline[];
  vigencia_timeline: VigenciaTimeline[];
  etapa_actual: EtapaTimeline | null;
  resumen: {
    total_etapas: number;
    etapas_activas: number;
    etapas_cerradas: number;
    etapas_por_tipo: Record<string, { nombre: string; cantidad: number }>;
    primera_etapa_fecha: string | null;
    ultima_etapa_fecha: string | null;
    duracion_total_dias: number;
    tipo_medida: string;
    flujo_esperado: string[];
  };
}

export interface TrazabilidadCompactaResponse {
  medida: {
    id: number;
    numero_medida: string;
    tipo_medida: 'MPI' | 'MPE' | 'MPJ';
    tipo_medida_display: string;
    estado_vigencia: string;
    estado_vigencia_display: string;
    fecha_apertura: string;
    fecha_cierre: string | null;
  };
  etapas: Array<{
    orden: number;
    id: number;
    tipo_etapa: string;
    tipo_etapa_display: string;
    estado: string;
    estado_display: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    esta_activa: boolean;
    duracion_dias: number | null;
  }>;
  total_etapas: number;
  flujo: {
    esperado: string[];
    real: string[];
    proximas_posibles: string[];
    completado: boolean;
  };
}
```

---

## 3. API Services Gap

### 3.1 Required New API Service

**Location**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/historial-seguimiento-api-service.ts`

```typescript
// REQUIRED IMPLEMENTATION:

import { get } from '@/app/api/apiService';
import type {
  PaginatedHistorialSeguimiento,
  THistorialSeguimientoMedida,
  HistorialSeguimientoQueryParams,
  TiposEventoResponse,
  ResumenHistorialResponse
} from '../types/historial-seguimiento';

// List timeline events with filtering and pagination
export const getHistorialSeguimiento = async (
  medidaId: number,
  params?: HistorialSeguimientoQueryParams
): Promise<PaginatedHistorialSeguimiento> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return get<PaginatedHistorialSeguimiento>(`medidas/${medidaId}/historial-seguimiento/${queryString}`);
};

// Get single event detail with deep-links
export const getHistorialSeguimientoDetail = async (
  medidaId: number,
  eventoId: number
): Promise<THistorialSeguimientoMedida> => {
  return get<THistorialSeguimientoMedida>(`medidas/${medidaId}/historial-seguimiento/${eventoId}/`);
};

// Get available event types for filtering
export const getTiposEvento = async (medidaId: number): Promise<TiposEventoResponse> => {
  return get<TiposEventoResponse>(`medidas/${medidaId}/historial-seguimiento/tipos/`);
};

// Get summary statistics
export const getResumenHistorial = async (medidaId: number): Promise<ResumenHistorialResponse> => {
  return get<ResumenHistorialResponse>(`medidas/${medidaId}/historial-seguimiento/resumen/`);
};

// Export to CSV (returns blob)
export const exportHistorialCSV = async (
  medidaId: number,
  params?: HistorialSeguimientoQueryParams
): Promise<Blob> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/medidas/${medidaId}/historial-seguimiento/exportar/${queryString}`,
    { credentials: 'include' }
  );
  return response.blob();
};

// Global admin endpoint
export const getHistorialGlobal = async (params?: HistorialSeguimientoQueryParams): Promise<PaginatedHistorialSeguimiento> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return get<PaginatedHistorialSeguimiento>(`historial-seguimiento-global/${queryString}`);
};
```

### 3.2 Trazabilidad Etapas API Service

**Location**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/trazabilidad-etapas-api-service.ts`

```typescript
// REQUIRED IMPLEMENTATION:

import { get } from '@/app/api/apiService';
import type {
  TrazabilidadEtapasResponse,
  TrazabilidadCompactaResponse
} from '../types/trazabilidad-etapas';

export interface TrazabilidadQueryParams {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: 'etapas' | 'vigencia' | 'all';
}

// Get full trazabilidad
export const getTrazabilidadEtapas = async (
  medidaId: number,
  params?: TrazabilidadQueryParams
): Promise<TrazabilidadEtapasResponse> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return get<TrazabilidadEtapasResponse>(`medidas/${medidaId}/trazabilidad-etapas/${queryString}`);
};

// Get compact view for UI
export const getTrazabilidadCompacta = async (medidaId: number): Promise<TrazabilidadCompactaResponse> => {
  return get<TrazabilidadCompactaResponse>(`medidas/${medidaId}/trazabilidad-etapas/compacta/`);
};

// Export to CSV
export const exportTrazabilidadCSV = async (medidaId: number): Promise<Blob> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/medidas/${medidaId}/trazabilidad-etapas/exportar/`,
    { credentials: 'include' }
  );
  return response.blob();
};
```

---

## 4. Custom Hooks Gap

### 4.1 Required Hooks

**Location**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/`

```typescript
// ===== useHistorialSeguimiento.ts =====
import { useQuery } from '@tanstack/react-query';
import { getHistorialSeguimiento, getResumenHistorial, getTiposEvento } from '../api/historial-seguimiento-api-service';
import type { HistorialSeguimientoQueryParams } from '../types/historial-seguimiento';

export const useHistorialSeguimiento = (medidaId: number, params?: HistorialSeguimientoQueryParams) => {
  return useQuery({
    queryKey: ['historial-seguimiento', medidaId, params],
    queryFn: () => getHistorialSeguimiento(medidaId, params),
    enabled: !!medidaId,
  });
};

export const useResumenHistorial = (medidaId: number) => {
  return useQuery({
    queryKey: ['historial-resumen', medidaId],
    queryFn: () => getResumenHistorial(medidaId),
    enabled: !!medidaId,
  });
};

export const useTiposEvento = (medidaId: number) => {
  return useQuery({
    queryKey: ['tipos-evento', medidaId],
    queryFn: () => getTiposEvento(medidaId),
    enabled: !!medidaId,
  });
};

// ===== useTrazabilidadEtapas.ts =====
import { useQuery } from '@tanstack/react-query';
import { getTrazabilidadEtapas, getTrazabilidadCompacta } from '../api/trazabilidad-etapas-api-service';

export const useTrazabilidadEtapas = (medidaId: number, params?: TrazabilidadQueryParams) => {
  return useQuery({
    queryKey: ['trazabilidad-etapas', medidaId, params],
    queryFn: () => getTrazabilidadEtapas(medidaId, params),
    enabled: !!medidaId,
  });
};

export const useTrazabilidadCompacta = (medidaId: number) => {
  return useQuery({
    queryKey: ['trazabilidad-compacta', medidaId],
    queryFn: () => getTrazabilidadCompacta(medidaId),
    enabled: !!medidaId,
  });
};
```

---

## 5. UI Components Gap

### 5.1 Current Components (OBSOLETE - Must Replace)

| Component | Status | Issue |
|-----------|--------|-------|
| `historial-seguimiento-section.tsx` | Uses Mock Data | Simple list, not connected to API, wrong data structure |
| `historial-seguimiento-table.tsx` | Uses Mock Data | Hardcoded mock data, not connected to API |

### 5.2 Required New/Refactored Components

#### High Priority (P0)

| Component | Description | Complexity |
|-----------|-------------|------------|
| `UnifiedTimelineSection.tsx` | Main timeline component with filtering | High |
| `TimelineEventCard.tsx` | Individual event display with icons | Medium |
| `TimelineFilters.tsx` | Filter controls (date, type, category, user) | Medium |
| `EtapasStepper.tsx` | Visual stepper for stage flow | Medium |

#### Medium Priority (P1)

| Component | Description | Complexity |
|-----------|-------------|------------|
| `TimelineEventDetail.tsx` | Modal/panel for event details | Medium |
| `HistorialResumenCard.tsx` | Statistics summary card | Low |
| `ExportHistorialButton.tsx` | CSV export with current filters | Low |
| `TrazabilidadEtapasPanel.tsx` | Full trazabilidad view | High |

#### Low Priority (P2)

| Component | Description | Complexity |
|-----------|-------------|------------|
| `AdminHistorialGlobal.tsx` | Admin-only global view | High |
| `TimelinePagination.tsx` | Infinite scroll or pagination | Medium |

---

## 6. Visual Design Specifications

### 6.1 Event Type Icons (As per Backend Documentation)

| Category | Icon | Color (MUI) |
|----------|------|-------------|
| ACTIVIDAD | Assignment / EventNote | `primary.main` (blue) |
| INTERVENCION | Edit / Description | `success.main` (green) |
| ETAPA | SwapHoriz / Timeline | `secondary.main` (purple) |
| INFORME | Assessment / BarChart | `warning.main` (orange) |
| SEGUIMIENTO | Visibility / RemoveRedEye | `info.main` (cyan) |
| MEDIDA | Gavel / Balance | `error.main` (red) |
| OFICIO | Mail / Send | `grey.700` |
| MANUAL | Create / Edit | `grey.500` |

### 6.2 Stepper Design for Trazabilidad

```
MPI Flow:  [APERTURA] ─────────────────────────────── [CESE]
           ▓▓▓▓▓▓▓▓▓                                  ░░░░░░

MPE Flow:  [APERTURA] ── [INNOVACION] ── [PRORROGA] ── [CESE] ── [POST_CESE]
           ▓▓▓▓▓▓▓▓▓     ▓▓▓▓▓▓▓▓▓▓▓     ░░░░░░░░░     ░░░░░     ░░░░░░░░░

MPJ Flow:  [APERTURA] ── [PROCESO] ── [CESE]
           ▓▓▓▓▓▓▓▓▓     ░░░░░░░░░     ░░░░░

Legend:    ▓ = Completed/Active    ░ = Pending/Future
```

---

## 7. Integration Points

### 7.1 Where to Add the Components

| Location | Component to Add | Integration Type |
|----------|------------------|------------------|
| Medida Detail Page | `<EtapasStepper />` | Add as new section or header element |
| Medida Detail Page | New "Historial" Tab | Add tab with `<UnifiedTimelineSection />` |
| Existing mpe-tabs.tsx / mpj-tabs.tsx | Import timeline tab | Tab configuration |

### 7.2 Suggested Tab Structure

```tsx
// Medida Detail Tabs (updated)
const tabs = [
  { label: 'Plan de Trabajo', component: <PlanTrabajoTab /> },
  { label: 'Seguimiento', component: <SeguimientoDispositivoTab /> },
  { label: 'Informes', component: <InformesMensualesTab /> },
  { label: 'Historial', component: <UnifiedTimelineSection /> },  // NEW - PLTM-04
  { label: 'Trazabilidad', component: <TrazabilidadEtapasPanel /> },  // NEW - PLTM-04
];
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create TypeScript types (`historial-seguimiento.ts`, `trazabilidad-etapas.ts`)
- [ ] Create API services (`historial-seguimiento-api-service.ts`, `trazabilidad-etapas-api-service.ts`)
- [ ] Create custom hooks (`useHistorialSeguimiento.ts`, `useTrazabilidadEtapas.ts`)
- [ ] Basic `UnifiedTimelineSection.tsx` component without filtering

### Phase 2: Core UI (Week 2)
- [ ] `TimelineEventCard.tsx` with icons and categories
- [ ] `TimelineFilters.tsx` component
- [ ] `EtapasStepper.tsx` for visual stage flow
- [ ] Integrate into medida detail page

### Phase 3: Enhanced Features (Week 3)
- [ ] `TimelineEventDetail.tsx` modal with deep-links
- [ ] `HistorialResumenCard.tsx` statistics
- [ ] `ExportHistorialButton.tsx` CSV export
- [ ] Infinite scroll / pagination

### Phase 4: Polish & Admin (Week 4)
- [ ] `TrazabilidadEtapasPanel.tsx` full view
- [ ] `AdminHistorialGlobal.tsx` for admin users
- [ ] Performance optimization
- [ ] Testing

---

## 9. File Structure (Final)

```
src/app/(runna)/legajo/[id]/medida/[medidaId]/
├── types/
│   ├── historial-seguimiento.ts        # NEW
│   └── trazabilidad-etapas.ts          # NEW
├── api/
│   ├── historial-seguimiento-api-service.ts  # NEW
│   └── trazabilidad-etapas-api-service.ts    # NEW
├── hooks/
│   ├── useHistorialSeguimiento.ts      # NEW
│   └── useTrazabilidadEtapas.ts        # NEW
├── components/
│   └── medida/
│       ├── historial-seguimiento-section.tsx    # REPLACE (currently mock data)
│       ├── historial-seguimiento-table.tsx      # REPLACE (currently mock data)
│       ├── unified-timeline/                    # NEW FOLDER
│       │   ├── UnifiedTimelineSection.tsx
│       │   ├── TimelineEventCard.tsx
│       │   ├── TimelineFilters.tsx
│       │   ├── TimelineEventDetail.tsx
│       │   ├── HistorialResumenCard.tsx
│       │   └── ExportHistorialButton.tsx
│       └── trazabilidad/                        # NEW FOLDER
│           ├── EtapasStepper.tsx
│           ├── TrazabilidadEtapasPanel.tsx
│           └── VigenciaTimeline.tsx
```

---

## 10. Summary of Gaps

### Critical Gaps (Must Implement)
1. **No API Service**: Backend endpoints exist but frontend has no service to call them
2. **No TypeScript Types**: 0/36 event types defined, 0/5 response interfaces defined
3. **No Custom Hooks**: Data fetching logic completely missing
4. **Mock Data Components**: Existing components use hardcoded fake data

### Feature Gaps
1. **No Unified Timeline**: The main PLTM-04 feature (unified event timeline) does not exist
2. **No Trazabilidad Stepper**: Visual stage flow visualization missing
3. **No Filtering UI**: No ability to filter by date, type, category, user
4. **No CSV Export**: Export functionality not implemented
5. **No Deep-Links**: Event-to-resource navigation not implemented
6. **No Statistics View**: Summary/metrics display missing
7. **No Admin Global View**: Admin-only global historial not implemented

---

## Appendix: Backend API Quick Reference

### Historial Seguimiento Query Params
```
fecha_desde: date       # Filter from date
fecha_hasta: date       # Filter to date
tipo_evento: string     # Exact event type (e.g., ACTIVIDAD_CREADA)
tipos_evento: string    # Comma-separated types
categoria: string       # ACTIVIDAD, INTERVENCION, ETAPA, etc.
etapa: int              # Stage ID
etapa_tipo: string      # APERTURA, INNOVACION, etc.
usuario: int            # User ID
search: string          # Search in description
page: int               # Page number (default 1)
page_size: int          # Items per page (default 50, max 200)
```

### Trazabilidad Query Params
```
fecha_desde: date       # Filter from date
fecha_hasta: date       # Filter to date
tipo: string            # 'etapas', 'vigencia', 'all' (default: 'all')
```
