/**
 * TypeScript interfaces for Legajo Duplicate Detection
 * Based on LEG-01 User Story requirements
 */

import {
  DUPLICATE_THRESHOLDS,
  NIVEL_MINIMO_CREACION_FORZADA,
  MIN_CARACTERES_JUSTIFICACION,
  DUPLICATE_SEARCH_DEBOUNCE_MS,
  ALERT_COLORS,
} from "@/utils/constants/duplicateDetection"

// Re-export for backward compatibility
export {
  DUPLICATE_THRESHOLDS,
  NIVEL_MINIMO_CREACION_FORZADA,
  MIN_CARACTERES_JUSTIFICACION,
  DUPLICATE_SEARCH_DEBOUNCE_MS,
  ALERT_COLORS,
}

// ============================================
// Alert Levels
// ============================================

/**
 * Nivel de alerta según score de coincidencia
 * - CRITICA: Score = 1.0 (DNI exacto)
 * - ALTA: Score >= 0.75 (nombre+apellido+fecha exactos o muy similares)
 * - MEDIA: Score >= 0.50 y < 0.75 (similaridad moderada)
 */
export type AlertLevel = "CRITICA" | "ALTA" | "MEDIA"

/**
 * Tipo de recomendación al usuario
 */
export type RecommendationType = "VINCULAR" | "REVISAR" | "CONTINUAR"

/**
 * Tipo de match en comparación de campos
 */
export type MatchType = "exacto" | "similar" | "diferente" | "no_disponible"

// ============================================
// Search Request
// ============================================

/**
 * Request para búsqueda de duplicados
 * POST /api/legajos/buscar-duplicados/
 */
export interface DuplicateSearchRequest {
  /** DNI del NNyA (opcional, pero preferido) */
  dni?: number | null

  /** Nombre del NNyA (requerido) */
  nombre: string

  /** Apellido del NNyA (requerido) */
  apellido: string

  /** Fecha de nacimiento (opcional, formato ISO) */
  fecha_nacimiento?: string | null

  /** Género del NNyA (opcional) */
  genero?: string | null

  /** Nombre autopercibido (opcional) */
  nombre_autopercibido?: string | null
}

// ============================================
// NNyA Data in Match
// ============================================

/**
 * Datos del NNyA en el legajo encontrado
 */
export interface NnyaMatchData {
  id: number
  nombre: string
  apellido: string
  dni: number | null
  fecha_nacimiento: string | null
  genero: string | null
  edad_calculada?: number | null
}

// ============================================
// Legajo Info in Match
// ============================================

/**
 * Información del legajo encontrado
 */
export interface LegajoMatchInfo {
  fecha_apertura: string
  zona: {
    id: number
    nombre: string
  }
  estado: string
  responsable: {
    id: number
    nombre_completo: string
    equipo: string
  } | null
  urgencia: string | null
}

// ============================================
// Field Comparison
// ============================================

/**
 * Comparación de un campo individual
 */
export interface FieldComparison {
  match: MatchType
  input: any
  existente: any
  levenshtein_distance?: number // Solo para campos de texto
}

/**
 * Comparación completa de todos los campos
 */
export interface DataComparison {
  dni: FieldComparison
  nombre: FieldComparison
  apellido: FieldComparison
  fecha_nacimiento: FieldComparison
  genero?: FieldComparison
  nombre_autopercibido?: FieldComparison
}

// ============================================
// Single Match Result
// ============================================

/**
 * Resultado de un match individual con legajo existente
 */
export interface LegajoMatch {
  /** ID del legajo encontrado */
  legajo_id: number

  /** Número del legajo (formato: YYYY-XXXX) */
  legajo_numero: string

  /** Score de coincidencia (0.0 - 1.0) */
  score: number

  /** Nivel de alerta según score */
  nivel_alerta: AlertLevel

  /** Datos del NNyA en el legajo */
  nnya: NnyaMatchData

  /** Información del legajo */
  legajo_info: LegajoMatchInfo

  /** Comparación detallada de campos */
  comparacion: DataComparison

  /** Si el usuario actual tiene permisos para ver este legajo */
  tiene_permisos: boolean

  /** Si el usuario puede vincular la demanda a este legajo */
  puede_vincular: boolean
}

// ============================================
// Search Response
// ============================================

/**
 * Respuesta de búsqueda de duplicados
 * Response 200 OK de POST /api/legajos/buscar-duplicados/
 */
export interface DuplicateSearchResponse {
  /** Si se encontraron duplicados (score >= threshold) */
  duplicados_encontrados: boolean

  /** Cantidad total de matches encontrados */
  total_matches: number

  /** Lista de matches ordenados por score (mayor a menor) */
  matches: LegajoMatch[]

  /** Recomendación automática según el match más alto */
  recomendacion: RecommendationType

  /** Threshold usado para la búsqueda (default: 0.50) */
  threshold_usado: number
}

// ============================================
// Vincular Demanda Request
// ============================================

/**
 * Request para vincular demanda a legajo existente
 * POST /api/legajos/{legajo_id}/vincular-demanda/
 */
export interface VincularDemandaRequest {
  /** ID de la demanda en registro */
  demanda_id: number

  /** Si se deben actualizar los datos del NNyA con nueva info */
  actualizar_datos_nnya?: boolean

  /** Lista de campos a actualizar (solo si actualizar_datos_nnya = true) */
  campos_actualizar?: string[]
}

/**
 * Respuesta de vinculación exitosa
 */
export interface VincularDemandaResponse {
  vinculacion_exitosa: boolean
  legajo_id: number
  demanda_id: number
  nnya_actualizado: boolean
  campos_actualizados: string[]
  notificaciones_enviadas: Array<{
    usuario_id: number
    tipo: string
    enviado: boolean
  }>
  mensaje: string
}

// ============================================
// Crear con Duplicado Confirmado Request
// ============================================

/**
 * Request para crear legajo con confirmación de duplicado ignorado
 * POST /api/legajos/crear-con-duplicado-confirmado/
 */
export interface CrearConDuplicadoRequest {
  /** ID de la demanda */
  demanda_id: number

  /** ID del legajo duplicado que se está ignorando */
  legajo_duplicado_ignorado: number

  /** Score del duplicado ignorado */
  score_duplicado_ignorado: number

  /** Justificación obligatoria (mínimo 20 caracteres) */
  justificacion: string

  /** Confirmación explícita del usuario */
  confirmacion_usuario: boolean

  /** Datos del NNyA para el nuevo legajo */
  nnya_data: {
    nombre: string
    apellido: string
    dni?: number | null
    fecha_nacimiento?: string | null
    genero?: string | null
    [key: string]: any // Otros campos opcionales
  }
}

/**
 * Respuesta de creación forzada
 */
export interface CrearConDuplicadoResponse {
  legajo_creado: boolean
  legajo_id: number
  legajo_numero: string
  skip_duplicate_check: boolean
  auditoria: {
    usuario_id: number
    timestamp: string
    legajo_ignorado: number
    score_ignorado: number
    justificacion: string
  }
  notificaciones: {
    supervisor_notificado: boolean
    supervisor_id: number
  }
  mensaje: string
}

// ============================================
// Error Responses
// ============================================

/**
 * Error de datos insuficientes
 */
export interface DuplicateSearchError {
  error: string
  detalles: string
}

/**
 * Error de permisos
 */
export interface PermisosError {
  error: string
  legajo_zona: string
  tu_zona: string
  accion_sugerida: string
}

/**
 * Error de justificación insuficiente
 */
export interface JustificacionError {
  error: string
  minimo_caracteres: number
  actual: number
}

/**
 * Error de nivel de permisos
 */
export interface NivelPermisosError {
  error: string
  nivel_requerido: number
  tu_nivel: number
}

// ============================================
// UI State Types
// ============================================

/**
 * Estado del modal de detección de duplicados
 */
export interface DuplicateModalState {
  open: boolean
  matches: LegajoMatch[]
  currentData: DuplicateSearchRequest
  isLoading: boolean
}

/**
 * Opciones de acción del usuario en el modal
 */
export type DuplicateModalAction =
  | { type: "VER_DETALLE"; legajoId: number }
  | { type: "VINCULAR"; legajoId: number }
  | { type: "CREAR_NUEVO"; legajoIgnorado: number }
  | { type: "CANCELAR" }
  | { type: "SOLICITAR_PERMISOS"; legajoId: number }

// ============================================
// Local Storage / Form Data
// ============================================

/**
 * Datos adicionales para el formulario de NNyA (campos nuevos para LEG-01)
 */
export interface NnyaDuplicateFormData {
  /** ID del legajo existente al que se vinculó (si se eligió vincular) */
  legajo_existente_vinculado?: number | null

  /** Si se decidió crear nuevo legajo a pesar de encontrar duplicado */
  skip_duplicate_check?: boolean

  /** Justificación para crear nuevo legajo (si skip_duplicate_check = true) */
  duplicate_check_justification?: string | null
}

// ============================================
// Constants - Imported from centralized location
// ============================================
// See top of file for imports and re-exports
