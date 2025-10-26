/**
 * Estado Etapa Medida Type Definitions - MED-01 V2
 *
 * Type-specific state catalog for differentiated workflows by measure type.
 * Backend Model: infrastructure/models/medida/TEstadoEtapaMedida.py
 *
 * Key Features:
 * - Catalog-based state management with metadata
 * - Type-specific applicability (MPI, MPE, MPJ)
 * - Stage-specific applicability (APERTURA, INNOVACION, etc.)
 * - Role-based responsibility tracking
 */

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

/**
 * Responsible role types for estado transitions
 */
export type ResponsableTipo =
  | 'EQUIPO_TECNICO'
  | 'JEFE_ZONAL'
  | 'DIRECTOR'
  | 'EQUIPO_LEGAL'

/**
 * Stage types for medida workflow
 *
 * - APERTURA: Initial opening stage
 * - INNOVACION: MPE innovation/modification stage
 * - PRORROGA: MPE extension stage
 * - CESE: Closure stage
 * - POST_CESE: MPE post-closure activities (after fecha_cese_efectivo)
 * - PROCESO: MPJ judicial process stage
 */
export type TipoEtapa =
  | 'APERTURA'
  | 'INNOVACION'
  | 'PRORROGA'
  | 'CESE'
  | 'POST_CESE'
  | 'PROCESO'

/**
 * Measure type codes
 */
export type TipoMedidaCodigo = 'MPI' | 'MPE' | 'MPJ'

// ============================================================================
// CATALOG TYPES
// ============================================================================

/**
 * Estado Etapa Medida Catalog Entry
 *
 * Defines a reusable state with metadata for validation and workflow control.
 *
 * Example from fixtures (Estado 1):
 * {
 *   id: 1,
 *   codigo: "PENDIENTE_REGISTRO_INTERVENCION",
 *   nombre_display: "(1) Pendiente de registro de intervención",
 *   orden: 1,
 *   responsable_tipo: "EQUIPO_TECNICO",
 *   siguiente_accion: "Registrar intervención (MED-02)",
 *   aplica_a_tipos_medida: ["MPI", "MPE"],
 *   aplica_a_tipos_etapa: ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
 *   activo: true
 * }
 */
export interface TEstadoEtapaMedida {
  /** Primary key */
  id: number

  /** Unique state code (e.g., "PENDIENTE_REGISTRO_INTERVENCION") */
  codigo: string

  /** Display name with order prefix (e.g., "(1) Pendiente de registro de intervención") */
  nombre_display: string

  /** Sequential order (1-5 for current implementation) */
  orden: number

  /** Responsible role type for this state */
  responsable_tipo: ResponsableTipo

  /** Description of the action required to advance from this state */
  siguiente_accion: string

  /**
   * Measure types this state applies to
   * - ["MPI", "MPE"]: States 1-2 apply to both
   * - ["MPE"]: States 3-5 apply only to MPE
   * - []: MPJ uses NO estados (empty array)
   */
  aplica_a_tipos_medida: TipoMedidaCodigo[]

  /**
   * Stage types this state applies to
   * - ["APERTURA", "INNOVACION", "PRORROGA", "CESE"]: Most estados
   * - ["POST_CESE"]: Special MPE post-cese stage (no estados)
   * - ["PROCESO"]: MPJ process stage (no estados)
   */
  aplica_a_tipos_etapa: TipoEtapa[]

  /** Active flag (for soft deletion) */
  activo: boolean

  /** Audit timestamps */
  fecha_creacion: string
  fecha_modificacion: string
}

/**
 * API Response for Estado Catalog List
 */
export interface TEstadoEtapaResponse {
  count: number
  results: TEstadoEtapaMedida[]
}

/**
 * Query parameters for filtering estado catalog
 */
export interface EstadoCatalogQueryParams {
  /** Filter by measure type */
  tipo_medida?: TipoMedidaCodigo

  /** Filter by stage type */
  tipo_etapa?: TipoEtapa

  /** Filter by active status */
  activo?: boolean

  /** Filter by orden (for sequential validation) */
  orden?: number

  /** Pagination */
  limit?: number
  offset?: number
}

// ============================================================================
// DISPLAY & UI TYPES
// ============================================================================

/**
 * Estado display configuration for UI components
 */
export interface EstadoDisplayConfig {
  /** Estado catalog entry */
  estado: TEstadoEtapaMedida

  /** Whether this is the current active estado */
  isActive: boolean

  /** Whether this estado is completed */
  isCompleted: boolean

  /** Whether this estado is accessible (not locked by previous incomplete estados) */
  isAccessible: boolean

  /** Completion percentage (0-100) */
  completionPercentage: number
}

/**
 * Estado transition validation result
 */
export interface EstadoTransitionValidation {
  /** Whether transition is allowed */
  isValid: boolean

  /** Human-readable reason if invalid */
  reason?: string

  /** Next available estados if valid */
  nextEstados?: TEstadoEtapaMedida[]
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Map responsable tipo to user roles
 */
export const ResponsableToRole: Record<ResponsableTipo, string[]> = {
  EQUIPO_TECNICO: ['ET', 'SUPERUSER'],
  JEFE_ZONAL: ['JZ', 'SUPERUSER'],
  DIRECTOR: ['DIRECTOR', 'SUPERUSER'],
  EQUIPO_LEGAL: ['LEGAL', 'SUPERUSER'],
}

/**
 * Estado codes enum for type safety
 */
export enum EstadoCodigo {
  PENDIENTE_REGISTRO_INTERVENCION = 'PENDIENTE_REGISTRO_INTERVENCION',
  PENDIENTE_APROBACION_REGISTRO = 'PENDIENTE_APROBACION_REGISTRO',
  PENDIENTE_NOTA_AVAL = 'PENDIENTE_NOTA_AVAL',
  PENDIENTE_INFORME_JURIDICO = 'PENDIENTE_INFORME_JURIDICO',
  PENDIENTE_RATIFICACION_JUDICIAL = 'PENDIENTE_RATIFICACION_JUDICIAL',
}

/**
 * Display labels for stage types
 */
export const TipoEtapaLabels: Record<TipoEtapa, string> = {
  APERTURA: 'Apertura de la Medida',
  INNOVACION: 'Innovación',
  PRORROGA: 'Prórroga',
  CESE: 'Cese de la Medida',
  POST_CESE: 'Post-Cese',
  PROCESO: 'Proceso Judicial',
}

/**
 * Display labels for measure types
 */
export const TipoMedidaLabels: Record<TipoMedidaCodigo, string> = {
  MPI: 'Medida de Protección Integral',
  MPE: 'Medida de Protección Excepcional',
  MPJ: 'Medida Penal Juvenil',
}
