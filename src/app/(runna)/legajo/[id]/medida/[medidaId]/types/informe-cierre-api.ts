/**
 * TypeScript interfaces for Informe de Cierre API - V2
 *
 * MED-MPI-CIERRE: Informe de Cierre for MPI measures
 * Backend endpoints: /api/medidas/{medida_id}/informe-cierre/
 *
 * Simplified Workflow (V2):
 * - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE): ET creates informe → auto-transition to Estado 4
 * - Estado 4 (INFORME_DE_CIERRE_REDACTADO): Terminal state, 100% completion
 *
 * V2 Changes:
 * - Removed JZ approval/rejection workflow
 * - Estado 4 is now terminal state (100% progress)
 * - Deprecated: AprobarCierreResponse, RechazarCierreResponse, RechazarCierreRequest
 */

// ============================================================================
// ADJUNTO TYPES
// ============================================================================

export type TipoInformeCierreAdjunto =
  | "INFORME_TECNICO"
  | "EVALUACION"
  | "ACTA"
  | "OTRO"

export interface InformeCierreAdjunto {
  id: number
  tipo: TipoInformeCierreAdjunto
  tipo_display: string
  nombre_original: string
  tamaño_bytes: number
  extension: string
  descripcion?: string
  url: string
  subido_por: {
    id: number
    nombre_completo: string
    username: string
  }
  fecha_subida: string
}

// ============================================================================
// INFORME DE CIERRE
// ============================================================================

export interface InformeCierre {
  id: number
  medida: number
  medida_detalle: {
    id: number
    numero_medida: string
    tipo_medida: string
    tipo_medida_display: string
    estado_vigencia: string
  }
  etapa: number | null
  elaborado_por: number
  elaborado_por_detalle: {
    id: number
    nombre_completo: string
    username: string
  }
  observaciones: string
  fecha_registro: string
  fecha_modificacion: string

  // Aprobación
  aprobado_por_jz: boolean
  fecha_aprobacion_jz: string | null
  jefe_zonal_aprobador: {
    id: number
    nombre_completo: string
    username: string
  } | null

  // Rechazo
  rechazado: boolean
  observaciones_rechazo: string | null
  fecha_rechazo: string | null
  jefe_zonal_rechazo: {
    id: number
    nombre_completo: string
    username: string
  } | null

  // Control
  activo: boolean
  adjuntos: InformeCierreAdjunto[]
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateInformeCierreRequest {
  observaciones: string
}

/**
 * @deprecated V2: MPI Cese no longer uses rejection workflow
 * Estado 4 (INFORME_DE_CIERRE_REDACTADO) is terminal state
 */
export interface RechazarCierreRequest {
  observaciones: string
}

export interface UploadAdjuntoRequest {
  informe_cierre_id: number
  tipo: TipoInformeCierreAdjunto
  archivo: File
  descripcion?: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface InformeCierreResponse extends InformeCierre {
  mensaje?: string
}

/**
 * @deprecated V2: MPI Cese no longer uses approval workflow
 * Estado 4 (INFORME_DE_CIERRE_REDACTADO) is terminal state
 */
export interface AprobarCierreResponse {
  id: number
  numero_medida: string
  tipo_medida: string
  estado_vigencia: string
  fecha_apertura: string
  fecha_cierre: string
  duracion_dias: number
  informe_cierre: {
    id: number
    aprobado_por_jz: boolean
    fecha_aprobacion_jz: string
    jefe_zonal_aprobador: {
      id: number
      nombre_completo: string
      username: string
    }
  }
  etapa_actual: null
  mensaje: string
}

/**
 * @deprecated V2: MPI Cese no longer uses rejection workflow
 * Estado 4 (INFORME_DE_CIERRE_REDACTADO) is terminal state
 */
export interface RechazarCierreResponse {
  id: number
  numero_medida: string
  tipo_medida: string
  estado_vigencia: string
  etapa_actual: {
    id: number
    nombre: string
    estado: string
    estado_display: string
    fecha_inicio_estado: string
    observaciones: string
  }
  informe_cierre: {
    id: number
    rechazado: boolean
    observaciones_rechazo: string
    fecha_rechazo: string
    jefe_zonal_rechazo: {
      id: number
      nombre_completo: string
    }
    activo: boolean
  }
  mensaje: string
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

export interface InformeCierreQueryParams {
  informe_cierre_id?: number
  tipo?: TipoInformeCierreAdjunto
}
