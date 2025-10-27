/**
 * vinculo-types.ts
 *
 * TypeScript interfaces for LEG-01 V2 - Vinculación Justificada de Legajos
 * Based on RUNNA API (9).yaml OpenAPI specification
 *
 * API Endpoints:
 * - GET  /api/tipos-vinculo/           - List all link types
 * - GET  /api/vinculos-legajo/         - List vinculos with filters
 * - POST /api/vinculos-legajo/         - Create new vinculo
 * - GET  /api/vinculos-legajo/{id}/    - Get vinculo detail
 * - PUT  /api/vinculos-legajo/{id}/    - Update vinculo
 * - POST /api/vinculos-legajo/{id}/desvincular/ - Soft delete with justification
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum character length for vinculo justification
 * Matches backend validation: minLength: 20
 */
export const MIN_CARACTERES_JUSTIFICACION_VINCULO = 20

/**
 * Tipo Vinculo codes from backend catalog
 */
export const TIPOS_VINCULO_CODIGOS = {
  HERMANOS: 'HERMANOS',
  MISMO_CASO_JUDICIAL: 'MISMO_CASO_JUDICIAL',
  MEDIDAS_RELACIONADAS: 'MEDIDAS_RELACIONADAS',
  TRANSFERENCIA: 'TRANSFERENCIA',
} as const

export type TipoVinculoCodigo = typeof TIPOS_VINCULO_CODIGOS[keyof typeof TIPOS_VINCULO_CODIGOS]

/**
 * Possible destination entity types
 */
export type TipoDestino = 'legajo' | 'medida' | 'demanda'

// ============================================================================
// TIPO VINCULO (CATALOG)
// ============================================================================

/**
 * TTipoVinculo - Link type catalog
 *
 * Source: RUNNA API (9).yaml lines 13966-13991
 * Endpoint: GET /api/tipos-vinculo/
 *
 * Available link types:
 * - HERMANOS: Hermanos (NNyA que son hermanos)
 * - MISMO_CASO_JUDICIAL: Mismo Caso Judicial
 * - MEDIDAS_RELACIONADAS: Medidas Relacionadas
 * - TRANSFERENCIA: Transferencia
 */
export interface TTipoVinculo {
  /** Unique identifier (readonly) */
  id: number

  /** Unique code (readonly) */
  codigo: TipoVinculoCodigo

  /** Display name (readonly) */
  nombre: string

  /** Description of the link type (readonly) */
  descripcion: string

  /** Whether this link type is active (readonly) */
  activo: boolean
}

// ============================================================================
// VINCULO CREATION
// ============================================================================

/**
 * TVinculoLegajoCreate - Request schema for creating a new vinculo
 *
 * Source: RUNNA API (9).yaml lines 14101-14131
 * Endpoint: POST /api/vinculos-legajo/
 *
 * Business Rules:
 * 1. Must specify ONE destination entity (legajo_destino, medida_destino, or demanda_destino)
 * 2. justificacion is REQUIRED with minimum 20 characters
 * 3. legajo_origen and tipo_vinculo are REQUIRED
 * 4. Cannot link a legajo to itself
 */
export interface TVinculoLegajoCreate {
  /** Origin legajo ID (required) */
  legajo_origen: number

  /** Destination legajo ID (nullable, one of three required) */
  legajo_destino?: number | null

  /** Destination medida ID (nullable, one of three required) */
  medida_destino?: number | null

  /** Destination demanda ID (nullable, one of three required) */
  demanda_destino?: number | null

  /** Link type FK (required) */
  tipo_vinculo: number

  /** Justification for creating this link (required, min 20 chars) */
  justificacion: string
}

// ============================================================================
// VINCULO DETAIL
// ============================================================================

/**
 * TVinculoLegajoDetail - Response schema for detailed vinculo view
 *
 * Source: RUNNA API (9).yaml lines 14132-14215
 * Endpoint: GET /api/vinculos-legajo/{id}/
 *
 * Includes full audit trail and denormalized display fields
 */
export interface TVinculoLegajoDetail {
  /** Unique vinculo ID (readonly) */
  id: number

  /** Origin legajo ID */
  legajo_origen: number

  /** Origin legajo display info - e.g., "Legajo #12345 - Juan Pérez" (readonly) */
  legajo_origen_info: string

  /** Destination legajo ID (nullable) */
  legajo_destino: number | null

  /** Destination legajo display info (readonly) */
  legajo_destino_info: string | null

  /** Destination medida ID (nullable) */
  medida_destino: number | null

  /** Destination medida display info (readonly) */
  medida_destino_info: string | null

  /** Destination demanda ID (nullable) */
  demanda_destino: number | null

  /** Destination demanda display info (readonly) */
  demanda_destino_info: string | null

  /** Nested link type object (readonly) */
  tipo_vinculo: TTipoVinculo

  /** Computed destination entity type (readonly) */
  tipo_destino: TipoDestino

  /** Complete destination display string (readonly) */
  destino_completo: string

  /** Justification for creating this link */
  justificacion: string

  /** Whether this link is active (false = soft deleted) */
  activo: boolean

  // Audit trail - Creation
  /** User who created this vinculo */
  creado_por: number

  /** Creator user display info (readonly) */
  creado_por_info: string

  /** Creation timestamp (readonly) */
  creado_en: string // ISO 8601 datetime

  // Audit trail - Deactivation
  /** User who deactivated this vinculo (nullable) */
  desvinculado_por: number | null

  /** Deactivator user display info (readonly) */
  desvinculado_por_info: string | null

  /** Deactivation timestamp (nullable, readonly) */
  desvinculado_en: string | null // ISO 8601 datetime

  /** Justification for deactivating this link (nullable) */
  justificacion_desvincular: string | null
}

// ============================================================================
// VINCULO LIST
// ============================================================================

/**
 * TVinculoLegajoList - Response schema for list view
 *
 * Source: RUNNA API (9).yaml lines 14216-14256
 * Endpoint: GET /api/vinculos-legajo/
 *
 * Simplified version for table/list display
 */
export interface TVinculoLegajoList {
  /** Unique vinculo ID (readonly) */
  id: number

  /** Origin legajo ID */
  legajo_origen: number

  /** Origin legajo display info (readonly) */
  legajo_origen_info: string

  /** Nested link type object (readonly) */
  tipo_vinculo: TTipoVinculo

  /** Computed destination entity type (readonly) */
  tipo_destino: TipoDestino

  /** Complete destination display string (readonly) */
  destino_completo: string

  /** Justification for creating this link */
  justificacion: string

  /** Whether this link is active */
  activo: boolean

  /** Creator user display info (readonly) */
  creado_por_info: string

  /** Creation timestamp (readonly) */
  creado_en: string // ISO 8601 datetime

  /** Deactivator user display info (readonly, nullable) */
  desvinculado_por_info: string | null

  /** Deactivation timestamp (nullable, readonly) */
  desvinculado_en: string | null // ISO 8601 datetime
}

// ============================================================================
// DESVINCULAR (SOFT DELETE)
// ============================================================================

/**
 * DesvincularVinculoRequest - Request schema for soft delete
 *
 * Source: RUNNA API (9).yaml lines 8330-8336
 * Endpoint: POST /api/vinculos-legajo/{id}/desvincular/
 *
 * Business Rule: justificacion_desvincular is REQUIRED with minimum 20 characters
 */
export interface DesvincularVinculoRequest {
  /** Justification for deactivating this link (required, min 20 chars) */
  justificacion_desvincular: string
}

/**
 * DesvincularVinculoResponse - Response from successful deactivation
 */
export interface DesvincularVinculoResponse {
  /** Success message */
  message: string

  /** Updated vinculo detail */
  vinculo: TVinculoLegajoDetail
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

/**
 * VinculosLegajoQueryParams - Filters for GET /api/vinculos-legajo/
 *
 * Source: RUNNA API (9).yaml lines 7397-7424
 */
export interface VinculosLegajoQueryParams {
  /** Filter by origin legajo ID */
  legajo_origen?: number

  /** Filter by link type code */
  tipo_vinculo?: TipoVinculoCodigo

  /** Filter by destination entity type */
  tipo_destino?: TipoDestino

  /** Filter by active status (default: true) */
  activo?: boolean

  /** Pagination - page number */
  page?: number

  /** Pagination - page size */
  page_size?: number
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

/**
 * Paginated response wrapper for list endpoints
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  detail?: string
  [field: string]: string | string[] | undefined
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

/**
 * Form data for crear vinculo dialog
 */
export interface CrearVinculoFormData {
  tipo_vinculo: number | null
  tipo_destino: TipoDestino | null
  destino_id: number | null
  justificacion: string
}

/**
 * Validation errors for crear vinculo form
 */
export interface CrearVinculoValidationErrors {
  tipo_vinculo?: string
  tipo_destino?: string
  destino_id?: string
  justificacion?: string
  general?: string
}

/**
 * Props for vinculo selection/search components
 */
export interface VinculoDestinationSearchResult {
  id: number
  tipo: TipoDestino
  display: string
  subtitle?: string
}

// ============================================================================
// LABELS AND DISPLAY
// ============================================================================

/**
 * Display labels for tipo destino
 */
export const TIPO_DESTINO_LABELS: Record<TipoDestino, string> = {
  legajo: 'Legajo',
  medida: 'Medida',
  demanda: 'Demanda',
}

/**
 * Display labels for tipo vinculo (will be loaded from API, but here for fallback)
 */
export const TIPO_VINCULO_LABELS: Record<TipoVinculoCodigo, string> = {
  HERMANOS: 'Hermanos',
  MISMO_CASO_JUDICIAL: 'Mismo Caso Judicial',
  MEDIDAS_RELACIONADAS: 'Medidas Relacionadas',
  TRANSFERENCIA: 'Transferencia',
}

/**
 * Helper descriptions for tipo vinculo (for UI tooltips/help text)
 */
export const TIPO_VINCULO_DESCRIPTIONS: Record<TipoVinculoCodigo, string> = {
  HERMANOS: 'NNyA que son hermanos entre sí',
  MISMO_CASO_JUDICIAL: 'Legajos relacionados al mismo caso judicial',
  MEDIDAS_RELACIONADAS: 'Medidas de protección relacionadas',
  TRANSFERENCIA: 'Legajo transferido desde/hacia otra institución',
}
