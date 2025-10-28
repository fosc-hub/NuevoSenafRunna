/**
 * TypeScript interfaces for Informe de Cierre API
 *
 * MED-MPI-CIERRE: Informe de Cierre for MPI measures
 * Backend endpoints: /api/medidas/{medida_id}/informe-cierre/
 *
 * Workflow:
 * - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE): ET creates informe
 * - Estado 4 (INFORME_DE_CIERRE_REDACTADO): JZ approves/rejects
 * - Approved: medida estado_vigencia = 'CERRADA'
 * - Rejected: back to Estado 3
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
