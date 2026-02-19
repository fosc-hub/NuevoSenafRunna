/**
 * Cese de Medidas API Types
 *
 * Types for the measure closure (cese) functionality.
 * Supports both MPI (direct closure) and MPE (two-phase closure) flows.
 *
 * MPI Flow: POST /medidas/{id}/cesar-medida/ → Direct closure
 * MPE Flow: POST /medidas/{id}/solicitar-cese/ → Two-phase (initiate/confirm)
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to close an MPI measure directly
 * POST /api/medidas/{id}/cesar-medida/
 */
export interface CesarMedidaMPIRequest {
  /** Motivo del cese (opcional pero recomendado) */
  observaciones?: string
  /** true = cancela actividades pendientes automáticamente */
  cancelar_actividades?: boolean
}

/**
 * Request to initiate/confirm MPE measure closure
 * POST /api/medidas/{id}/solicitar-cese/
 */
export interface SolicitarCeseMPERequest {
  /** Motivo del cese (opcional) */
  observaciones?: string
  /** Solo aplica en FLUJO A (cuando no está en etapa CESE) */
  cancelar_actividades?: boolean
}

// ============================================================================
// RESPONSE TYPES - MPI
// ============================================================================

/**
 * Response when MPI measure is closed successfully
 */
export interface CesarMedidaMPIResponse {
  status: 'cerrada'
  mensaje: string
  medida: {
    id: number
    numero_medida: string
    tipo_medida: 'MPI'
    estado_vigencia: 'CERRADA'
    fecha_cierre: string // formato: "2026-02-18"
  }
  etapa_cese: {
    id: number
    tipo_etapa: 'CESE'
    fecha_inicio: string
    fecha_fin: string
  }
  actividades_canceladas: number
}

// ============================================================================
// RESPONSE TYPES - MPE
// ============================================================================

/**
 * Response when MPE cese is initiated (FLUJO A)
 * Status: 'cese_iniciado'
 */
export interface SolicitarCeseFlujoAResponse {
  status: 'cese_iniciado'
  mensaje: string
  medida: {
    id: number
    numero_medida: string
    tipo_medida: 'MPE'
    estado_vigencia: 'VIGENTE' // Aún vigente hasta completar MED-05
  }
  etapa_cese: {
    id: number
    tipo_etapa: 'CESE'
    estado: string // 'PENDIENTE_REGISTRO_INTERVENCION'
    estado_display: string
    fecha_inicio: string
  }
  advertencias: string[]
  siguiente_paso: string
}

/**
 * Response when MPE cese is confirmed (FLUJO B)
 * Status: 'cese_confirmado'
 */
export interface SolicitarCeseFlujoBResponse {
  status: 'cese_confirmado'
  mensaje: string
  medida: {
    id: number
    numero_medida: string
    tipo_medida: 'MPE'
    estado_vigencia: 'CERRADA'
    fecha_cierre: string
    fecha_cese_efectivo: string
  }
  etapa_post_cese: {
    id: number
    tipo_etapa: 'POST_CESE'
    fecha_inicio: string
  }
}

/**
 * Union type for MPE solicitar-cese response
 * Can be either Flow A (initiate) or Flow B (confirm)
 */
export type SolicitarCeseMPEResponse = SolicitarCeseFlujoAResponse | SolicitarCeseFlujoBResponse

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if MPE cese response is Flow A (cese iniciado)
 */
export function isCeseIniciado(
  response: SolicitarCeseMPEResponse
): response is SolicitarCeseFlujoAResponse {
  return response.status === 'cese_iniciado'
}

/**
 * Check if MPE cese response is Flow B (cese confirmado)
 */
export function isCeseConfirmado(
  response: SolicitarCeseMPEResponse
): response is SolicitarCeseFlujoBResponse {
  return response.status === 'cese_confirmado'
}

// ============================================================================
// RATIFICACIÓN CESE RESPONSE (MED-05 Enhancement)
// ============================================================================

/**
 * Extended response when ratification triggers automatic cese
 * This happens when ratifying an MPE measure in CESE etapa
 */
export interface RatificacionCeseResponse {
  /** Existing ratificacion fields... */
  id: number
  decision: string
  fecha_resolucion: string
  observaciones?: string

  /** New fields when cese is completed via ratification */
  cese_completado: boolean
  etapa_post_cese?: {
    id: number
    tipo_etapa: 'POST_CESE'
    fecha_inicio: string
  }
  medida_estado?: 'CERRADA'
  mensaje: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Possible error codes from cese endpoints
 */
export type CeseErrorCode =
  | 'PERMISO_DENEGADO'
  | 'TIPO_MEDIDA_INVALIDO'
  | 'ESTADO_INVALIDO'

/**
 * Error response structure
 */
export interface CeseErrorResponse {
  error: CeseErrorCode
  detalle: string
}
