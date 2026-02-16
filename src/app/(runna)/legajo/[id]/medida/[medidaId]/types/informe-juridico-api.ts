/**
 * API Types for Informe Jurídico (MED-04)
 * Based on RUNNA API (7).yaml and MED-04_Informe_Juridico_Equipo_Legal.md
 *
 * MED-04: Carga de Informe Jurídico por Equipo Legal
 * - Equipo Legal elabora informe jurídico oficial
 * - Adjunta informe oficial y acuses de recibo de notificaciones
 * - Envía informe completo para transición Estado 4 → Estado 5
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/**
 * Tipo de adjunto de Informe Jurídico
 * - INFORME: Informe jurídico oficial (obligatorio, único)
 * - ACUSE: Acuse de recibo de notificación (múltiples opcionales)
 */
export type TipoAdjuntoInformeJuridico = 'INFORME' | 'ACUSE'

/**
 * Medio de notificación utilizado
 */
export type MedioNotificacion = 'EMAIL' | 'POSTAL' | 'PRESENCIAL' | 'MIXTO'

// ============================================================================
// INTERFACES DE DATOS
// ============================================================================

/**
 * Información del usuario del Equipo Legal
 */
export interface EquipoLegalInfo {
  id: number
  nombre_completo: string
  username?: string
  email?: string
  nivel?: number // 3 o 4 (con flag legal=true en TCustomUserZona)
}

/**
 * Adjunto de Informe Jurídico
 * Documentos PDF: informe oficial + acuses de recibo
 */
export interface AdjuntoInformeJuridico {
  id: number
  informe_juridico: number
  tipo_adjunto: TipoAdjuntoInformeJuridico
  tipo_adjunto_display?: string
  archivo: string // URL del archivo
  nombre_original: string
  tamano_bytes: number
  descripcion?: string | null
  subido_por: number
  subido_por_detalle?: string | EquipoLegalInfo
  fecha_carga: string // ISO datetime
  activo: boolean
}

// ============================================================================
// REQUEST (CREATE) - Solo campos que se pueden escribir
// ============================================================================

/**
 * Request para crear un Informe Jurídico
 * POST /api/medidas/{medida_id}/informe-juridico/
 *
 * Validaciones:
 * - Medida debe estar en Estado 4 (PENDIENTE_INFORME_JURIDICO)
 * - Usuario debe ser Equipo Legal (nivel 3 o 4 con flag legal=true)
 * - Instituciones notificadas obligatorio
 * - Destinatarios obligatorio
 * - Fecha de notificaciones no puede ser futura
 */
export interface CreateInformeJuridicoRequest {
  // Observaciones adicionales del Equipo Legal (opcional)
  observaciones?: string | null

  // Notificaciones institucionales (obligatorio)
  instituciones_notificadas: string
  fecha_notificaciones: string // YYYY-MM-DD
  medio_notificacion: MedioNotificacion
  destinatarios: string
}

/**
 * Request para subir adjunto a Informe Jurídico
 * POST /api/medidas/{medida_id}/informe-juridico/adjuntos/
 *
 * Validaciones:
 * - Solo archivos PDF
 * - Tamaño máximo: 10MB
 * - tipo_adjunto debe ser INFORME o ACUSE
 * - Solo un adjunto INFORME por informe jurídico
 */
export interface UploadAdjuntoInformeJuridicoRequest {
  archivo: File
  tipo_adjunto: TipoAdjuntoInformeJuridico
  descripcion?: string | null
  informe_juridico_id?: number // Opcional, se puede inferir del contexto
}

// ============================================================================
// RESPONSE (READ) - Todos los campos del backend
// ============================================================================

/**
 * Response completo de un Informe Jurídico
 * GET /api/medidas/{medida_id}/informe-juridico/
 * GET /api/medidas/{medida_id}/informe-juridico/{id}/
 */
export interface InformeJuridicoResponse {
  // IDs
  id: number
  medida: number // readOnly

  // Usuario que elaboró el informe
  elaborado_por: number | null // readOnly - ID del Equipo Legal
  elaborado_por_detalle: string | EquipoLegalInfo // readOnly

  // Observaciones
  observaciones: string | null

  // Notificaciones institucionales
  instituciones_notificadas: string
  fecha_notificaciones: string // YYYY-MM-DD
  medio_notificacion: MedioNotificacion
  medio_notificacion_display?: string
  destinatarios: string

  // Envío y estado
  fecha_envio: string | null // readOnly - ISO datetime
  enviado: boolean // readOnly

  // Adjuntos
  adjuntos?: AdjuntoInformeJuridico[] // readOnly - Lista de adjuntos

  // Flags de validación
  tiene_informe_oficial?: boolean // readOnly - true si existe adjunto tipo INFORME
  cantidad_acuses?: number // readOnly - cantidad de adjuntos tipo ACUSE

  // Fechas de auditoría
  fecha_creacion: string // readOnly - ISO datetime
  fecha_modificacion: string // readOnly - ISO datetime
  activo: boolean // readOnly
}

/**
 * Response básico de Informe Jurídico (en listados)
 */
export interface InformeJuridicoBasicResponse {
  id: number
  medida: number
  elaborado_por_detalle: string | EquipoLegalInfo
  fecha_notificaciones: string
  medio_notificacion: MedioNotificacion
  fecha_envio: string | null
  enviado: boolean
  tiene_informe_oficial: boolean
  cantidad_acuses: number
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Query parameters para filtrar Informes Jurídicos
 * GET /api/medidas/{medida_id}/informe-juridico/?ordering=-fecha_creacion
 */
export interface InformeJuridicoQueryParams {
  enviado?: boolean
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  ordering?: string // ej: '-fecha_envio', 'fecha_notificaciones'
  limit?: number
  offset?: number
}

/**
 * Query parameters para filtrar adjuntos de Informe Jurídico
 * GET /api/medidas/{medida_id}/informe-juridico/adjuntos-list/
 */
export interface AdjuntosInformeJuridicoQueryParams {
  informe_juridico?: number
  tipo_adjunto?: TipoAdjuntoInformeJuridico
}

// ============================================================================
// RESPONSES ESPECÍFICOS DE ACCIONES
// ============================================================================

/**
 * Response al crear un Informe Jurídico
 */
export interface CreateInformeJuridicoResponse extends InformeJuridicoResponse {
  message?: string
}

/**
 * Response al enviar informe jurídico (transición Estado 4 → 5)
 * POST /api/medidas/{medida_id}/informe-juridico/enviar/
 */
export interface EnviarInformeJuridicoResponse {
  mensaje: string
  informe_juridico: {
    id: number
    fecha_envio: string
    enviado: boolean
  }
  medida: {
    id: number
    numero_medida: string
    etapa_actual: {
      id: number
      nombre: string
      estado: string
      estado_display: string
      fecha_inicio_estado: string
    }
  }
}

/**
 * Response al subir adjunto
 */
export interface UploadAdjuntoInformeJuridicoResponse {
  message: string
  adjunto: AdjuntoInformeJuridico
}

/**
 * Request para crear y enviar informe jurídico en una operación unificada
 * POST /api/medidas/{medida_id}/informe-juridico/crear-y-enviar/
 *
 * Combina: crear informe + subir archivos + enviar (transición Estado 4 → 5)
 */
export interface CrearYEnviarInformeJuridicoRequest {
  // Text fields (same as CreateInformeJuridicoRequest)
  observaciones?: string | null
  instituciones_notificadas: string
  fecha_notificaciones: string // YYYY-MM-DD
  medio_notificacion: MedioNotificacion
  destinatarios: string

  // File fields
  informe_oficial: File // Required PDF
  acuses?: File[] // Optional array of PDFs
}

/**
 * Response de crear y enviar informe jurídico (unificado)
 * Similar to EnviarInformeJuridicoResponse but includes full informe data
 */
export interface CrearYEnviarInformeJuridicoResponse extends Omit<InformeJuridicoResponse, 'medida'> {
  medida: {
    id: number
    numero_medida: string
    etapa_actual: {
      id: number
      nombre: string
      estado: string
      estado_display: string
      fecha_inicio_estado: string
    }
  }
  mensaje: string
}

// ============================================================================
// ERRORES Y VALIDACIONES
// ============================================================================

/**
 * Errores de validación del backend
 */
export interface InformeJuridicoValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Response de error del API de Informe Jurídico
 */
export interface InformeJuridicoApiErrorResponse {
  error?: string
  detail?: string
  errors?: InformeJuridicoValidationError[]
  message?: string
  status?: number
}

/**
 * Errores comunes de Informe Jurídico
 */
export enum InformeJuridicoErrorCode {
  INVALID_STATE = 'INVALID_STATE', // Medida no está en Estado 4
  PERMISSION_DENIED = 'PERMISSION_DENIED', // Usuario no es Equipo Legal
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Errores de validación
  NOT_FOUND = 'NOT_FOUND', // Informe Jurídico no encontrado
  FILE_TOO_LARGE = 'FILE_TOO_LARGE', // Archivo excede 10MB
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE', // Archivo no es PDF
  INFORME_OFICIAL_REQUERIDO = 'INFORME_OFICIAL_REQUERIDO', // Falta informe oficial para enviar
  MULTIPLE_INFORMES_OFICIALES = 'MULTIPLE_INFORMES_OFICIALES', // Solo se permite un informe oficial
  INFORME_ALREADY_SENT = 'INFORME_ALREADY_SENT', // Informe ya fue enviado (inmutable)
  FECHA_NOTIFICACIONES_FUTURA = 'FECHA_NOTIFICACIONES_FUTURA', // Fecha no puede ser futura
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Tipo para estado de la medida relacionado con Informe Jurídico
 */
export type EstadoMedidaInformeJuridico =
  | 'PENDIENTE_NOTA_AVAL' // Estado 3 (antes de informe jurídico)
  | 'PENDIENTE_INFORME_JURIDICO' // Estado 4 (estado actual para cargar informe)
  | 'PENDIENTE_RATIFICACION_JUDICIAL' // Estado 5 (después de enviar informe)

/**
 * Configuración de adjuntos
 */
export const ADJUNTO_INFORME_JURIDICO_CONFIG = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
} as const

/**
 * Labels de tipo de adjunto
 */
export const TIPO_ADJUNTO_LABELS: Record<TipoAdjuntoInformeJuridico, string> = {
  INFORME: 'Informe Jurídico Oficial',
  ACUSE: 'Acuse de Recibo',
} as const

/**
 * Descripciones de tipo de adjunto
 */
export const TIPO_ADJUNTO_DESCRIPTIONS: Record<TipoAdjuntoInformeJuridico, string> = {
  INFORME: 'Documento oficial del informe jurídico elaborado por el Equipo Legal (obligatorio)',
  ACUSE: 'Acuse de recibo de notificación enviada a instituciones (opcional)',
} as const

/**
 * Labels de medio de notificación
 */
export const MEDIO_NOTIFICACION_LABELS: Record<MedioNotificacion, string> = {
  EMAIL: 'Correo Electrónico',
  POSTAL: 'Correo Postal',
  PRESENCIAL: 'Presencial',
  MIXTO: 'Mixto',
} as const

/**
 * Helper para extraer nombre de usuario de string o EquipoLegalInfo
 */
export const extractUserName = (value: string | EquipoLegalInfo | undefined | null): string => {
  if (!value) return 'Usuario desconocido'
  if (typeof value === 'string') return value
  return value.nombre_completo || 'Usuario desconocido'
}

/**
 * Validar fecha de notificaciones (no puede ser futura)
 */
export const validateFechaNotificaciones = (fecha: string): boolean => {
  const fechaNotificaciones = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Reset time to compare only dates
  return fechaNotificaciones <= hoy
}

/**
 * Helper para verificar si un informe puede ser enviado
 */
export const canEnviarInforme = (informe: InformeJuridicoResponse | null | undefined): boolean => {
  if (!informe) return false
  if (informe.enviado) return false
  if (!informe.tiene_informe_oficial) return false
  return true
}

/**
 * Helper para verificar si un informe puede ser modificado
 */
export const canModificarInforme = (informe: InformeJuridicoResponse | null | undefined): boolean => {
  if (!informe) return false
  return !informe.enviado
}

/**
 * Helper para verificar si se pueden agregar adjuntos
 */
export const canAgregarAdjuntos = (informe: InformeJuridicoResponse | null | undefined): boolean => {
  return canModificarInforme(informe)
}

/**
 * Helper para verificar si se puede agregar un informe oficial
 */
export const canAgregarInformeOficial = (
  informe: InformeJuridicoResponse | null | undefined
): boolean => {
  if (!canAgregarAdjuntos(informe)) return false
  return !informe?.tiene_informe_oficial
}
