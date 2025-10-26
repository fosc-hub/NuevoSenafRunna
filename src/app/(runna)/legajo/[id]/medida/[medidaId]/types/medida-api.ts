/**
 * Medida API Type Definitions - MED-01 V2
 *
 * API request/response types for medida endpoints with V2 enhancements.
 * Includes tipo_etapa, estado_especifico (catalog FK), and fecha_cese_efectivo.
 *
 * Backend Models:
 * - infrastructure/models/medida/TMedida.py
 * - infrastructure/models/medida/TEtapaMedida.py
 */

import type { TEstadoEtapaMedida, TipoEtapa, TipoMedidaCodigo } from './estado-etapa'

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Measure type enum (aliased from estado-etapa for consistency)
 */
export type TipoMedida = TipoMedidaCodigo

/**
 * Vigencia (validity) state of a medida
 */
export type EstadoVigencia =
  | 'VIGENTE'      // Active measure
  | 'CERRADA'      // Closed measure
  | 'ARCHIVADA'    // Archived measure
  | 'NO_RATIFICADA' // Not ratified by court

/**
 * V1 Legacy Estado Etapa (deprecated - use estado_especifico in V2)
 * Kept for backward compatibility during migration
 */
export type EstadoEtapa =
  | 'PENDIENTE_REGISTRO_INTERVENCION'   // Estado 1
  | 'PENDIENTE_APROBACION_REGISTRO'     // Estado 2
  | 'PENDIENTE_NOTA_AVAL'               // Estado 3
  | 'PENDIENTE_INFORME_JURIDICO'        // Estado 4
  | 'PENDIENTE_RATIFICACION_JUDICIAL'   // Estado 5

// ============================================================================
// ETAPA MEDIDA (STAGE) TYPES
// ============================================================================

/**
 * Etapa Medida - Individual stage of a measure
 *
 * V2 Changes:
 * - Added tipo_etapa (APERTURA, INNOVACION, PRORROGA, CESE, POST_CESE, PROCESO)
 * - Added estado_especifico (FK to TEstadoEtapaMedida catalog)
 * - Deprecated estado (kept for backward compatibility)
 */
export interface EtapaMedida {
  /** Primary key */
  id: number

  /** Stage name (e.g., "Apertura", "Innovación") */
  nombre: string

  /** V2: Stage type enum */
  tipo_etapa: TipoEtapa

  /**
   * V2: Catalog-based estado (preferred)
   * FK to TEstadoEtapaMedida
   * null for MPJ (no estados) and MPI Cese
   */
  estado_especifico: TEstadoEtapaMedida | null

  /**
   * V1: Legacy estado field (deprecated)
   * String-based estado code
   * Use estado_especifico instead in new code
   */
  estado: EstadoEtapa | null

  /** Display label for current estado */
  estado_display: string

  /** Start date/time of current estado */
  fecha_inicio_estado: string

  /** End date/time of current estado (null if still active) */
  fecha_fin_estado: string | null

  /** Additional notes or observations */
  observaciones: string | null

  /** Audit timestamps */
  fecha_creacion: string
  fecha_modificacion: string
}

// ============================================================================
// MEDIDA (MEASURE) TYPES
// ============================================================================

/**
 * Medida Detail Response - Full medida data
 *
 * V2 Enhancements:
 * - fecha_cese_efectivo for MPE POST_CESE stage
 * - etapa_actual with V2 fields (tipo_etapa, estado_especifico)
 * - historial_etapas with full stage history
 */
export interface MedidaDetailResponse {
  // Basic Information
  id: number
  numero: string
  tipo_medida: TipoMedida
  estado_vigencia: EstadoVigencia

  // Legajo Reference
  legajo: number
  legajo_numero: string
  legajo_persona_nombre: string
  legajo_persona_apellido: string

  // Dates
  fecha_apertura: string
  fecha_cierre: string | null

  /**
   * V2: Fecha de cese efectivo (MPE only)
   * Enables POST_CESE stage for MPE
   */
  fecha_cese_efectivo: string | null

  // Location
  zona: number
  zona_nombre: string

  // Judicial Information
  juzgado: string | null
  numero_sac: string | null

  // Current Stage (V2 Enhanced)
  /**
   * Current active stage with V2 fields:
   * - tipo_etapa: Stage type enum
   * - estado_especifico: Catalog-based estado (null for MPJ and MPI Cese)
   */
  etapa_actual: EtapaMedida | null

  /**
   * Historical stages (all previous stages)
   * Ordered by fecha_creacion descending
   */
  historial_etapas?: EtapaMedida[]

  // Related Entities
  plan_trabajo_id: number | null
  oficios_count?: number
  intervenciones_count?: number

  // Metadata
  creado_por: number
  creado_por_nombre: string
  fecha_creacion: string
  fecha_modificacion: string
}

/**
 * Medida List Item - Summary for list views
 */
export interface MedidaListItem {
  id: number
  numero: string
  tipo_medida: TipoMedida
  estado_vigencia: EstadoVigencia
  legajo_numero: string
  legajo_persona_nombre: string
  fecha_apertura: string
  zona_nombre: string

  // Current stage summary
  etapa_actual_nombre: string | null
  etapa_actual_estado: string | null

  // V2: Stage type for routing logic
  etapa_actual_tipo: TipoEtapa | null

  fecha_creacion: string
}

// ============================================================================
// CREATE/UPDATE REQUEST TYPES
// ============================================================================

/**
 * Request to create a new medida (manual creation - MED-01)
 */
export interface CreateMedidaRequest {
  /** Legajo ID this medida belongs to */
  legajo: number

  /** Measure type */
  tipo_medida: TipoMedida

  /** Initial vigencia state (defaults to VIGENTE) */
  estado_vigencia?: EstadoVigencia

  /** Juzgado (tribunal) handling the case */
  juzgado?: string

  /** SAC number */
  numero_sac?: string

  /** Initial notes/observations */
  observaciones?: string
}

/**
 * Request to update medida details
 */
export interface UpdateMedidaRequest {
  /** Update vigencia state */
  estado_vigencia?: EstadoVigencia

  /** Update judicial information */
  juzgado?: string
  numero_sac?: string

  /** Update closure date */
  fecha_cierre?: string | null

  /** V2: Update fecha_cese_efectivo (MPE only) */
  fecha_cese_efectivo?: string | null

  /** Update observations */
  observaciones?: string
}

/**
 * Request to transition estado (state change)
 *
 * V2: Uses estado_especifico_id instead of estado string
 */
export interface TransitionEstadoRequest {
  /**
   * Target estado ID from catalog
   * Must be next sequential estado (orden + 1)
   */
  nuevo_estado_id: number

  /** Optional reason/justification for transition */
  motivo?: string
}

/**
 * Request to create POST_CESE stage for MPE
 */
export interface CreatePostCeseRequest {
  /** Effective closure date */
  fecha_cese_efectivo: string

  /** Optional observations */
  observaciones?: string
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

/**
 * Query parameters for listing medidas
 */
export interface MedidaQueryParams {
  /** Filter by legajo ID */
  legajo?: number

  /** Filter by measure type */
  tipo_medida?: TipoMedida

  /** Filter by vigencia state */
  estado_vigencia?: EstadoVigencia

  /** Filter by zone */
  zona?: number

  /** V2: Filter by stage type */
  tipo_etapa?: TipoEtapa

  /** Search by legajo number or person name */
  search?: string

  /** Date range filters */
  fecha_apertura_desde?: string
  fecha_apertura_hasta?: string

  /** Ordering */
  ordering?: string

  /** Pagination */
  limit?: number
  offset?: number
}

// ============================================================================
// VALIDATION & BUSINESS LOGIC TYPES
// ============================================================================

/**
 * Validation result for estado transition
 */
export interface EstadoTransitionValidationResponse {
  /** Whether transition is valid */
  es_valida: boolean

  /** Human-readable reason if invalid */
  razon?: string

  /** Next allowed estados if valid */
  estados_permitidos?: TEstadoEtapaMedida[]
}

/**
 * Available estados for current context
 */
export interface EstadosPermitidosResponse {
  /** Estados applicable to current measure type and stage */
  estados: TEstadoEtapaMedida[]

  /** Current estado if any */
  estado_actual: TEstadoEtapaMedida | null

  /** Whether measure type uses estados */
  usa_estados: boolean
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Map estado vigencia to display labels
 */
export const EstadoVigenciaLabels: Record<EstadoVigencia, string> = {
  VIGENTE: 'Vigente',
  CERRADA: 'Cerrada',
  ARCHIVADA: 'Archivada',
  NO_RATIFICADA: 'No Ratificada',
}

/**
 * Map estado vigencia to color codes for UI
 */
export const EstadoVigenciaColors: Record<EstadoVigencia, 'success' | 'error' | 'default' | 'warning'> = {
  VIGENTE: 'success',
  CERRADA: 'default',
  ARCHIVADA: 'default',
  NO_RATIFICADA: 'warning',
}

/**
 * Type guard: Check if measure type uses estados
 */
export function usesEstados(tipo: TipoMedida, tipoEtapa: TipoEtapa | null): boolean {
  // MPJ never uses estados
  if (tipo === 'MPJ') return false

  // MPI Cese doesn't use estados
  if (tipo === 'MPI' && tipoEtapa === 'CESE') return false

  // MPE POST_CESE doesn't use estados (only PLTM activities)
  if (tipo === 'MPE' && tipoEtapa === 'POST_CESE') return false

  // All other cases use estados
  return true
}

/**
 * Type guard: Check if stage allows PLTM activities
 */
export function allowsPLTMActivities(tipoEtapa: TipoEtapa | null): boolean {
  // POST_CESE and PROCESO stages allow PLTM activities
  return tipoEtapa === 'POST_CESE' || tipoEtapa === 'PROCESO'
}
