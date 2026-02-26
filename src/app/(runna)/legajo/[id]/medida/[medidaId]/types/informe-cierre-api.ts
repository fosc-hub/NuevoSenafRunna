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
// TIPO DE CESE
// ============================================================================

/**
 * Tipos de cese para MPI (Medida de Protección Integral)
 */
export type TipoCeseMPI =
  | "INICIO_MPJ"                // I. ARCHIVO DE MPI - INICIO MEDIDA PENAL JUVENIL (MPJ)
  | "DERIVADA_OLP"             // II. ARCHIVO MPI DERIVADA AL ORGANISMO LOCAL DE PROTECCIÓN
  | "CESADA_VALORA_MPE"        // III. ARCHIVO DE MPI CESADA - VALORA MPE
  | "CESADA"                   // IV. ARCHIVO DE MPI CESADA
  | "NO_PERTINENTE"            // V. ARCHIVO NO PERTINENTE

/**
 * Tipos de cese para MPE (Medida de Protección Excepcional)
 */
export type TipoCeseMPE =
  | "PROYECTO_AUTONOMIA"       // 1. MPE CESADA POR PROYECTO DE AUTONOMIA - CONTINUIDAD EN DISPOSITIVO
  | "ESTADO_ADOPTABILIDAD"     // 2. MPE CESADA - SOLICITUD ESTADO DE ADOPTABILIDAD
  | "RESTITUCION_FAMILIAR"     // 3. MPE CESADA POR RESTITUCIÓN FAMILIAR
  | "MAYORIA_EDAD"             // 4. MPE CESADA POR MAYORÍA DE EDAD
  | "FALLECIMIENTO"            // 5. MPE CESADA POR FALLECIMIENTO
  | "RESTITUCION_DERECHOS_RD"  // 6. MPE CESADA - RESTITUCIÓN DE DERECHOS CON CONTINUIDAD DE RESGUARDO POR RD

/**
 * Union type for all tipo cese
 */
export type TipoCese = TipoCeseMPI | TipoCeseMPE

/**
 * Display labels for MPI tipo cese
 */
export const TipoCeseMPILabels: Record<TipoCeseMPI, string> = {
  INICIO_MPJ: "I. ARCHIVO DE MPI - INICIO MEDIDA PENAL JUVENIL (MPJ)",
  DERIVADA_OLP: "II. ARCHIVO MPI DERIVADA AL ORGANISMO LOCAL DE PROTECCIÓN",
  CESADA_VALORA_MPE: "III. ARCHIVO DE MPI CESADA - VALORA MPE",
  CESADA: "IV. ARCHIVO DE MPI CESADA",
  NO_PERTINENTE: "V. ARCHIVO NO PERTINENTE"
}

/**
 * Display labels for MPE tipo cese
 */
export const TipoCeseMPELabels: Record<TipoCeseMPE, string> = {
  PROYECTO_AUTONOMIA: "1. MPE CESADA POR PROYECTO DE AUTONOMIA - CONTINUIDAD EN DISPOSITIVO",
  ESTADO_ADOPTABILIDAD: "2. MPE CESADA - SOLICITUD ESTADO DE ADOPTABILIDAD",
  RESTITUCION_FAMILIAR: "3. MPE CESADA POR RESTITUCIÓN FAMILIAR",
  MAYORIA_EDAD: "4. MPE CESADA POR MAYORÍA DE EDAD",
  FALLECIMIENTO: "5. MPE CESADA POR FALLECIMIENTO",
  RESTITUCION_DERECHOS_RD: "6. MPE CESADA - RESTITUCIÓN DE DERECHOS CON CONTINUIDAD DE RESGUARDO POR RD"
}

// ============================================================================
// ADJUNTO TYPES
// ============================================================================

export type TipoInformeCierreAdjunto =
  | "INFORME_CIERRE"
  | "EVALUACION"
  | "OTRO"

export interface InformeCierreAdjunto {
  id: number
  tipo_adjunto: TipoInformeCierreAdjunto
  tipo_adjunto_display: string
  archivo_nombre: string
  archivo_url: string
  descripcion?: string
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

  /** Tipo de cese (MPI o MPE) */
  tipo_cese: TipoCese
  tipo_cese_display: string

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
  /** Tipo de cese (requerido) */
  tipo_cese: TipoCese

  /** Observaciones del informe (min 20 caracteres) */
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
  tipo_adjunto: TipoInformeCierreAdjunto
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
  tipo_adjunto?: TipoInformeCierreAdjunto
}
