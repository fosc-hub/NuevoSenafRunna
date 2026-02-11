/**
 * API Types for Nota de Aval (MED-03)
 * Based on RUNNA API (6).yaml - TNotaAval schema
 *
 * MED-03: Redacción de Nota de Aval por Director
 * - Director revisa intervención cargada
 * - Emite Nota de Aval, aprobándola u observándola
 * - Autoriza continuidad de la Medida o devuelve para corrección
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/**
 * Decisión del Director sobre la intervención
 * - APROBADO: Director aprueba → medida avanza a Estado 4 (PENDIENTE_INFORME_JURIDICO)
 * - OBSERVADO: Director observa → medida retrocede a Estado 2 (PENDIENTE_APROBACION_REGISTRO)
 */
export type TNotaAvalDecision = 'APROBADO' | 'OBSERVADO'

// ============================================================================
// INTERFACES DE DATOS
// ============================================================================

/**
 * Información del Director que emitió la Nota de Aval
 */
export interface DirectorInfo {
  id: number
  nombre_completo: string
  username?: string
  email?: string
  nivel?: number // 3 o 4 (Director Capital o Interior)
}

/**
 * Adjunto de Nota de Aval
 * Documentos firmados por el Director (PDF)
 */
export interface AdjuntoNotaAval {
  id: number
  nota_aval: number
  nombre_archivo: string
  archivo: string // URL del archivo
  tipo_archivo: string // application/pdf
  tamano_bytes: number
  fecha_carga: string // ISO datetime
  subido_por?: number
  subido_por_detalle?: string | DirectorInfo // Can be string or object
}

// ============================================================================
// REQUEST (CREATE) - Solo campos que se pueden escribir
// ============================================================================

/**
 * Request para crear una Nota de Aval
 * POST /api/medidas/{medida_id}/nota-aval/
 *
 * Validaciones:
 * - Comentarios obligatorios si decision = OBSERVADO (mínimo 10 caracteres)
 * - Decisión debe ser APROBADO u OBSERVADO
 * - Usuario debe ser Director (nivel 3 o 4)
 * - Medida debe estar en Estado 3 (PENDIENTE_NOTA_AVAL)
 */
export interface CreateNotaAvalRequest {
  // Campo writeOnly para especificar la medida
  medida_id: number

  // Decisión del Director
  decision: TNotaAvalDecision

  // Comentarios (obligatorio si OBSERVADO, mínimo 10 caracteres)
  comentarios?: string | null
}

/**
 * Request para subir adjunto a Nota de Aval
 * POST /api/medidas/{medida_id}/nota-aval/adjuntos/
 *
 * Validaciones:
 * - Solo archivos PDF
 * - Tamaño máximo: 10MB
 */
export interface UploadAdjuntoNotaAvalRequest {
  archivo: File
  nota_aval_id?: number // Opcional, se puede inferir del contexto
}

// ============================================================================
// RESPONSE (READ) - Todos los campos del backend
// ============================================================================

/**
 * Response completo de una Nota de Aval
 * GET /api/medidas/{medida_id}/nota-aval/{id}/
 * También usado en arrays para GET /api/medidas/{medida_id}/nota-aval/
 */
export interface NotaAvalResponse {
  // IDs
  id: number
  medida: number // readOnly

  // Decisión
  decision: TNotaAvalDecision
  decision_display: string // readOnly - "Aprobado" o "Observado"

  // Comentarios del Director
  comentarios: string | null

  // Usuario que emitió la nota
  emitido_por: number | null // readOnly - ID del Director
  emitido_por_detalle: string | DirectorInfo // readOnly - Nombre completo del Director o objeto con info completa

  // Fechas
  fecha_emision: string // readOnly - ISO datetime
  fecha_creacion: string // readOnly - ISO datetime
  fecha_modificacion: string // readOnly - ISO datetime

  // Adjuntos
  adjuntos: string // readOnly - URL o referencia a lista de adjuntos

  // Flags de estado
  fue_aprobado: boolean // readOnly - true si decision = APROBADO
  fue_observado: boolean // readOnly - true si decision = OBSERVADO
}

/**
 * Response básico de Nota de Aval (en listados)
 */
export interface NotaAvalBasicResponse {
  id: number
  medida: number
  decision: TNotaAvalDecision
  decision_display: string
  emitido_por_detalle: string | DirectorInfo // Can be string or object
  fecha_emision: string
  fue_aprobado: boolean
  fue_observado: boolean
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Query parameters para filtrar Notas de Aval
 * GET /api/medidas/{medida_id}/nota-aval/?decision=APROBADO&ordering=-fecha_emision
 */
export interface NotaAvalQueryParams {
  decision?: TNotaAvalDecision
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  ordering?: string // ej: '-fecha_emision', 'decision'
  limit?: number
  offset?: number
}

/**
 * Query parameters para filtrar adjuntos de Nota de Aval
 * GET /api/medidas/{medida_id}/nota-aval/adjuntos-list/
 */
export interface AdjuntosNotaAvalQueryParams {
  nota_aval?: number
}

// ============================================================================
// RESPONSES ESPECÍFICOS DE ACCIONES
// ============================================================================

/**
 * Response al crear una Nota de Aval
 * Incluye información adicional sobre la transición de estado
 */
export interface CreateNotaAvalResponse extends NotaAvalResponse {
  message?: string // Mensaje de éxito
  estado_medida_anterior?: string
  estado_medida_nuevo?: string
}

/**
 * Response al subir adjunto
 */
export interface UploadAdjuntoResponse {
  message: string
  adjunto: AdjuntoNotaAval
}

// ============================================================================
// ERRORES Y VALIDACIONES
// ============================================================================

/**
 * Errores de validación del backend
 */
export interface NotaAvalValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Response de error del API de Nota de Aval
 */
export interface NotaAvalApiErrorResponse {
  error?: string
  detail?: string
  errors?: NotaAvalValidationError[]
  message?: string
  status?: number
}

/**
 * Errores comunes de Nota de Aval
 */
export enum NotaAvalErrorCode {
  INVALID_STATE = 'INVALID_STATE', // Medida no está en Estado 3
  PERMISSION_DENIED = 'PERMISSION_DENIED', // Usuario no es Director
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Errores de validación
  NOT_FOUND = 'NOT_FOUND', // Nota de Aval no encontrada
  FILE_TOO_LARGE = 'FILE_TOO_LARGE', // Archivo excede 10MB
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE', // Archivo no es PDF
  COMENTARIOS_REQUERIDOS = 'COMENTARIOS_REQUERIDOS', // Comentarios obligatorios al observar
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Tipo para estado de la medida relacionado con Nota de Aval
 */
export type EstadoMedidaNotaAval =
  | 'PENDIENTE_APROBACION_REGISTRO' // Estado 2 (después de observar)
  | 'PENDIENTE_NOTA_AVAL' // Estado 3 (estado actual para emitir nota)
  | 'PENDIENTE_INFORME_JURIDICO' // Estado 4 (después de aprobar)

/**
 * Helper type para validación de comentarios
 */
export interface ComentariosValidation {
  required: boolean
  minLength: number
  maxLength?: number
}

/**
 * Configuración de validación según decisión
 */
export const NOTA_AVAL_VALIDATIONS: Record<TNotaAvalDecision, ComentariosValidation> = {
  APROBADO: {
    required: false,
    minLength: 0,
  },
  OBSERVADO: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
}

/**
 * Configuración de adjuntos
 */
export const ADJUNTO_CONFIG = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
} as const

/**
 * Labels de decisión
 */
export const DECISION_LABELS: Record<TNotaAvalDecision, string> = {
  APROBADO: 'Aprobar',
  OBSERVADO: 'Observar',
} as const

/**
 * Descripciones de decisión
 */
export const DECISION_DESCRIPTIONS: Record<TNotaAvalDecision, string> = {
  APROBADO: 'La intervención es correcta y puede continuar al siguiente estado',
  OBSERVADO: 'La intervención requiere correcciones y será devuelta al Equipo Técnico',
} as const

/**
 * Helper para extraer nombre de usuario de string o DirectorInfo
 * Falls back to username if nombre_completo is empty
 */
export const extractUserName = (value: string | DirectorInfo | undefined | null): string => {
  if (!value) return 'Usuario desconocido'
  if (typeof value === 'string') return value || 'Usuario desconocido'
  // Try nombre_completo first, then username, then fallback
  if (value.nombre_completo && value.nombre_completo.trim()) {
    return value.nombre_completo
  }
  if (value.username && value.username.trim()) {
    return value.username
  }
  return 'Usuario desconocido'
}
