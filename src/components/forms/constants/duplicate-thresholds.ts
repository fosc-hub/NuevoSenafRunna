/**
 * Constants for Duplicate Detection
 * Based on LEG-01 User Story requirements
 */

/**
 * Thresholds de scoring según LEG-01
 * - CRITICA (1.0): DNI exacto → Alerta roja
 * - ALTA (0.75): Nombre+Apellido+Fecha exactos o muy similares → Alerta naranja
 * - MEDIA (0.50): Similaridad moderada → Alerta amarilla
 * - SIN_ALERTA (< 0.50): No mostrar alerta
 */
export const DUPLICATE_THRESHOLDS = {
  CRITICA: 1.0,
  ALTA: 0.75,
  MEDIA: 0.50,
  SIN_ALERTA: 0.0,
} as const

/**
 * Pesos para cálculo de scoring de coincidencia (suma = 1.0)
 */
export const SCORING_WEIGHTS = {
  // Match perfecto por DNI
  DNI_EXACT: 1.0,

  // Match por campos exactos
  NOMBRE_EXACT: 0.30,
  APELLIDO_EXACT: 0.30,
  FECHA_NAC_EXACT: 0.20,
  GENERO_MATCH: 0.10,

  // Match por similaridad (Levenshtein)
  NOMBRE_SIMILAR: 0.20,
  APELLIDO_SIMILAR: 0.20,

  // Match por fecha cercana
  FECHA_NAC_CLOSE: 0.10,

  // Match por nombre autopercibido
  NOMBRE_AUTOPERCIBIDO: 0.05,
} as const

/**
 * Thresholds de Levenshtein distance para considerar strings similares
 */
export const LEVENSHTEIN_THRESHOLDS = {
  /** Distancia máxima para considerar nombres similares */
  NOMBRE_MAX_DISTANCE: 3,

  /** Distancia máxima para considerar apellidos similares */
  APELLIDO_MAX_DISTANCE: 3,

  /** Distancia máxima para match de alta calidad */
  HIGH_QUALITY_MATCH: 2,

  /** Distancia máxima para match de calidad media */
  MEDIUM_QUALITY_MATCH: 3,
} as const

/**
 * Diferencia máxima de días para considerar fechas de nacimiento cercanas
 */
export const FECHA_NACIMIENTO_MAX_DIAS_DIFF = 365

/**
 * Nivel mínimo de usuario requerido para forzar creación de legajo
 * (a pesar de encontrar duplicado)
 */
export const NIVEL_MINIMO_CREACION_FORZADA = 3

/**
 * Caracteres mínimos requeridos en justificación para creación forzada
 */
export const MIN_CARACTERES_JUSTIFICACION = 20

/**
 * Debounce time para búsqueda de duplicados en ms
 * - DNI: No debounce (búsqueda inmediata al completar 8 dígitos)
 * - Nombre/Apellido: 500ms de debounce
 */
export const DUPLICATE_SEARCH_DEBOUNCE_MS = 500

/**
 * DNI mínimo válido (8 dígitos)
 */
export const DNI_MIN_LENGTH = 8

/**
 * Colores según nivel de alerta (Material-UI colors)
 */
export const ALERT_COLORS = {
  CRITICA: "#f44336", // red[500]
  ALTA: "#ff9800",    // orange[500]
  MEDIA: "#ffc107",   // yellow[700]
} as const

/**
 * Iconos según nivel de alerta
 */
export const ALERT_ICONS = {
  CRITICA: "error",
  ALTA: "warning",
  MEDIA: "info",
} as const

/**
 * Mensajes de alerta según nivel
 */
export const ALERT_MESSAGES = {
  CRITICA: {
    title: "⚠️ LEGAJO EXISTENTE DETECTADO",
    subtitle: "DNI coincide exactamente con un legajo activo",
    recommendation: "Se recomienda vincular la demanda al legajo existente",
  },
  ALTA: {
    title: "⚠️ POSIBLE LEGAJO EXISTENTE",
    subtitle: "Alta coincidencia en datos del NNyA",
    recommendation: "Revise cuidadosamente antes de crear nuevo legajo",
  },
  MEDIA: {
    title: "ℹ️ SIMILITUD DETECTADA",
    subtitle: "Datos similares encontrados en el sistema",
    recommendation: "Verifique los datos antes de continuar",
  },
} as const

/**
 * Límite máximo de matches a mostrar en el modal
 */
export const MAX_MATCHES_TO_SHOW = 5

/**
 * Timeout para búsqueda de duplicados (ms)
 */
export const DUPLICATE_SEARCH_TIMEOUT_MS = 10000

/**
 * Mensajes de error estándar
 */
export const ERROR_MESSAGES = {
  DATOS_INSUFICIENTES: "Se requiere al menos nombre y apellido para buscar duplicados",
  TIMEOUT: "La búsqueda está tardando más de lo normal. ¿Reintentar?",
  NETWORK_ERROR: "Error de conexión. Verifique su conexión a internet.",
  SERVER_ERROR: "Error en el servidor. Contacte a soporte técnico.",
  SIN_PERMISOS: "No tiene permisos para acceder a este legajo",
  JUSTIFICACION_INVALIDA: "La justificación debe tener al menos 20 caracteres",
  NIVEL_INSUFICIENTE: "Se requiere nivel de usuario 3 o superior para forzar creación",
} as const
