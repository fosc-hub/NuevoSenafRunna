/**
 * MED-05: Ratificación Judicial - API Types
 *
 * Types and interfaces for Ratificación Judicial API communication.
 * Based on backend schema: TRatificacionJudicial + TRatificacionAdjunto
 *
 * Backend Endpoints:
 * - GET  /api/medidas/{medida_pk}/ratificacion/          → Obtener ratificación activa
 * - POST /api/medidas/{medida_pk}/ratificacion/          → Crear ratificación (multipart)
 * - GET  /api/medidas/{medida_pk}/ratificacion/historial/ → Historial completo
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Decisión Judicial
 * Resultado de la resolución judicial sobre la medida
 */
export enum DecisionJudicial {
  RATIFICADA = "RATIFICADA",
  NO_RATIFICADA = "NO_RATIFICADA",
  PENDIENTE = "PENDIENTE",
}

/**
 * Tipo de Adjunto para Ratificación Judicial
 */
export enum TipoAdjuntoRatificacion {
  RESOLUCION_JUDICIAL = "RESOLUCION_JUDICIAL",
  CEDULA_NOTIFICACION = "CEDULA_NOTIFICACION",
  ACUSE_RECIBO = "ACUSE_RECIBO",
  OTRO = "OTRO",
}

// ============================================================================
// LABELS
// ============================================================================

export const DECISION_JUDICIAL_LABELS: Record<DecisionJudicial, string> = {
  [DecisionJudicial.RATIFICADA]: "Ratificada",
  [DecisionJudicial.NO_RATIFICADA]: "No Ratificada",
  [DecisionJudicial.PENDIENTE]: "Pendiente",
}

export const TIPO_ADJUNTO_LABELS: Record<TipoAdjuntoRatificacion, string> = {
  [TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL]: "Resolución Judicial",
  [TipoAdjuntoRatificacion.CEDULA_NOTIFICACION]: "Cédula de Notificación",
  [TipoAdjuntoRatificacion.ACUSE_RECIBO]: "Acuse de Recibo",
  [TipoAdjuntoRatificacion.OTRO]: "Otro",
}

// ============================================================================
// ADJUNTO INTERFACES
// ============================================================================

/**
 * Adjunto de Ratificación Judicial (Read - from API)
 */
export interface RatificacionAdjunto {
  id: number
  tipo_adjunto: TipoAdjuntoRatificacion
  archivo: string // URI
  archivo_url: string // Full URL (readOnly from backend)
  descripcion: string | null
  fecha_carga: string // ISO datetime
  usuario_carga: number
  usuario_carga_nombre: string // readOnly from backend
}

/**
 * Upload Adjunto Request (Write - to API)
 */
export interface UploadAdjuntoRatificacionRequest {
  tipo_adjunto: TipoAdjuntoRatificacion
  archivo: File
  descripcion?: string
}

// ============================================================================
// RATIFICACION JUDICIAL INTERFACES
// ============================================================================

/**
 * Ratificación Judicial (Read - from API)
 */
export interface RatificacionJudicial {
  id: number
  medida: number
  activo: boolean // readOnly - solo una activa por medida
  decision: DecisionJudicial
  fecha_resolucion: string // ISO date (YYYY-MM-DD)
  fecha_notificacion: string | null // ISO date (YYYY-MM-DD)
  observaciones: string | null
  usuario_registro: number
  usuario_registro_nombre: string // readOnly from backend
  fecha_registro: string // ISO datetime
  fecha_modificacion: string // ISO datetime
  adjuntos: RatificacionAdjunto[] // readOnly - populated separately

  // Cese-related fields (populated when ratification triggers automatic cese)
  /** True if ratification caused automatic medida closure (MPE in CESE etapa) */
  cese_completado?: boolean
  /** POST_CESE etapa info when cese was completed via ratification */
  etapa_post_cese?: {
    id: number
    tipo_etapa: 'POST_CESE'
    fecha_inicio: string
  }
  /** Medida estado after cese (CERRADA) */
  medida_estado?: 'CERRADA'
}

/**
 * Create Ratificación Judicial Request (Write - to API)
 *
 * IMPORTANTE: Este request se envía como multipart/form-data
 * Los archivos se agregan al FormData, no al JSON
 */
export interface CreateRatificacionJudicialRequest {
  // Campos de datos (JSON)
  etapa_id: number // ID de la etapa específica (Apertura, Innovación, Prórroga, Cese)
  decision: DecisionJudicial
  fecha_resolucion: string // ISO date (YYYY-MM-DD)
  fecha_notificacion?: string // ISO date (YYYY-MM-DD) - opcional
  observaciones?: string // opcional

  // Archivos (multipart files - writeOnly)
  archivo_resolucion_judicial: File // OBLIGATORIO
  archivo_cedula_notificacion?: File // opcional
  archivo_acuse_recibo?: File // opcional
}

/**
 * Update Ratificación Judicial Request (Write - to API)
 *
 * PATCH solo permitido cuando decision === "PENDIENTE"
 * Todos los campos son opcionales (solo actualizar lo que cambió)
 * Los archivos son opcionales (solo se actualizan si se proveen nuevos)
 */
export interface UpdateRatificacionJudicialRequest {
  // Campos de datos (JSON) - todos opcionales
  decision?: DecisionJudicial
  fecha_resolucion?: string // ISO date (YYYY-MM-DD)
  fecha_notificacion?: string // ISO date (YYYY-MM-DD)
  observaciones?: string

  // Archivos (multipart files - writeOnly) - opcionales
  // Si se proveen, reemplazan los existentes
  archivo_resolucion_judicial?: File
  archivo_cedula_notificacion?: File
  archivo_acuse_recibo?: File
}

/**
 * Historial de Ratificaciones (activas + inactivas)
 */
export interface RatificacionJudicialHistorial {
  count: number
  activa: RatificacionJudicial | null
  historial: RatificacionJudicial[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user name from usuario_registro_nombre
 * Similar pattern to other MED-XX helpers
 */
export function extractUserName(
  userName: string | undefined
): string {
  if (!userName) return "Usuario desconocido"
  return userName
}

/**
 * Check if ratificación can be modified
 * Solo se puede modificar si está en estado PENDIENTE
 */
export function canModificarRatificacion(
  ratificacion: RatificacionJudicial | null
): boolean {
  if (!ratificacion) return false
  if (!ratificacion.activo) return false // Solo la activa se puede modificar
  return ratificacion.decision === DecisionJudicial.PENDIENTE
}

/**
 * Check if ratificación is in final state (RATIFICADA or NO_RATIFICADA)
 */
export function isFinalState(decision: DecisionJudicial): boolean {
  return (
    decision === DecisionJudicial.RATIFICADA ||
    decision === DecisionJudicial.NO_RATIFICADA
  )
}

/**
 * Get decision color for UI
 */
export function getDecisionColor(
  decision: DecisionJudicial
): "success" | "error" | "warning" {
  switch (decision) {
    case DecisionJudicial.RATIFICADA:
      return "success"
    case DecisionJudicial.NO_RATIFICADA:
      return "error"
    case DecisionJudicial.PENDIENTE:
      return "warning"
  }
}

/**
 * Validate dates before submission
 */
export function validateRatificacionDates(
  fecha_resolucion: string,
  fecha_notificacion?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Validar fecha_resolucion no futura
  const resolucion = new Date(fecha_resolucion)
  if (resolucion > today) {
    errors.push("La fecha de resolución no puede ser futura")
  }

  // Validar fecha_notificacion si existe
  if (fecha_notificacion) {
    const notificacion = new Date(fecha_notificacion)

    if (notificacion > today) {
      errors.push("La fecha de notificación no puede ser futura")
    }

    if (notificacion < resolucion) {
      errors.push(
        "La fecha de notificación no puede ser anterior a la fecha de resolución"
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Build FormData for ratificacion creation
 * Maneja correctamente multipart/form-data con archivos y datos JSON
 */
export function buildRatificacionFormData(
  request: CreateRatificacionJudicialRequest
): FormData {
  const formData = new FormData()

  // Datos básicos
  formData.append("etapa_id", request.etapa_id.toString())
  formData.append("decision", request.decision)
  formData.append("fecha_resolucion", request.fecha_resolucion)

  // Datos opcionales
  if (request.fecha_notificacion) {
    formData.append("fecha_notificacion", request.fecha_notificacion)
  }

  if (request.observaciones) {
    formData.append("observaciones", request.observaciones)
  }

  // Archivos (multipart)
  formData.append(
    "archivo_resolucion_judicial",
    request.archivo_resolucion_judicial
  )

  if (request.archivo_cedula_notificacion) {
    formData.append(
      "archivo_cedula_notificacion",
      request.archivo_cedula_notificacion
    )
  }

  if (request.archivo_acuse_recibo) {
    formData.append("archivo_acuse_recibo", request.archivo_acuse_recibo)
  }

  return formData
}

/**
 * Build FormData for ratificacion update (PATCH)
 * Solo incluye campos que se están actualizando
 * Archivos son opcionales (solo se incluyen si se proveen nuevos)
 */
export function buildUpdateRatificacionFormData(
  request: UpdateRatificacionJudicialRequest
): FormData {
  const formData = new FormData()

  // Datos básicos - solo agregar si están presentes
  if (request.decision !== undefined) {
    formData.append("decision", request.decision)
  }

  if (request.fecha_resolucion !== undefined) {
    formData.append("fecha_resolucion", request.fecha_resolucion)
  }

  // Datos opcionales
  if (request.fecha_notificacion !== undefined) {
    formData.append("fecha_notificacion", request.fecha_notificacion)
  }

  if (request.observaciones !== undefined) {
    formData.append("observaciones", request.observaciones)
  }

  // Archivos (multipart) - solo si se proveen nuevos
  if (request.archivo_resolucion_judicial) {
    formData.append(
      "archivo_resolucion_judicial",
      request.archivo_resolucion_judicial
    )
  }

  if (request.archivo_cedula_notificacion) {
    formData.append(
      "archivo_cedula_notificacion",
      request.archivo_cedula_notificacion
    )
  }

  if (request.archivo_acuse_recibo) {
    formData.append("archivo_acuse_recibo", request.archivo_acuse_recibo)
  }

  return formData
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid DecisionJudicial
 */
export function isValidDecision(value: string): value is DecisionJudicial {
  return Object.values(DecisionJudicial).includes(value as DecisionJudicial)
}

/**
 * Check if value is a valid TipoAdjuntoRatificacion
 */
export function isValidTipoAdjunto(
  value: string
): value is TipoAdjuntoRatificacion {
  return Object.values(TipoAdjuntoRatificacion).includes(
    value as TipoAdjuntoRatificacion
  )
}
