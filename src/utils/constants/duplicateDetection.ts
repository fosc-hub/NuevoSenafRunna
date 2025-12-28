/**
 * Duplicate Detection Constants
 *
 * Centralized constants for duplicate detection functionality.
 * Consolidates exact duplicates from:
 * - src/components/forms/constants/duplicate-thresholds.ts
 * - src/app/(runna)/legajo-mesa/types/legajo-duplicado-types.ts
 */

/**
 * Threshold values for duplicate detection severity levels
 *
 * These values determine the alert level based on similarity score:
 * - CRITICA: 100% match (1.0) - Exact duplicate
 * - ALTA: 75%+ match (0.75) - Very likely duplicate
 * - MEDIA: 50%+ match (0.50) - Possible duplicate
 * - SIN_ALERTA: Below 50% (0.0) - No concern
 */
export const DUPLICATE_THRESHOLDS = {
  CRITICA: 1.0,
  ALTA: 0.75,
  MEDIA: 0.50,
  SIN_ALERTA: 0.0,
} as const

/**
 * Minimum duplicate alert level required to force justification for creation
 *
 * Alert levels:
 * 0 = SIN_ALERTA
 * 1 = BAJA
 * 2 = MEDIA
 * 3 = ALTA
 * 4 = CRITICA
 */
export const NIVEL_MINIMO_CREACION_FORZADA = 3

/**
 * Minimum characters required in justification text
 */
export const MIN_CARACTERES_JUSTIFICACION = 20

/**
 * Debounce time in milliseconds for duplicate search
 * Prevents excessive API calls while user is typing
 */
export const DUPLICATE_SEARCH_DEBOUNCE_MS = 500

/**
 * Alert severity color mapping for UI display
 */
export const ALERT_COLORS = {
  CRITICA: "#d32f2f", // Red
  ALTA: "#f57c00", // Orange
  MEDIA: "#fbc02d", // Yellow
  BAJA: "#388e3c", // Green
  SIN_ALERTA: "#757575", // Gray
} as const

/**
 * User-friendly alert level labels
 */
export const ALERT_LABELS = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
  SIN_ALERTA: "Sin alerta",
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
 * Error messages for duplicate detection
 */
export const ERROR_MESSAGES = {
  INVALID_SEARCH: "Debe proporcionar al menos un criterio de búsqueda válido",
  SEARCH_FAILED: "Error al buscar duplicados. Por favor, intente nuevamente.",
  JUSTIFICATION_TOO_SHORT: `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION} caracteres`,
  CRITICAL_DUPLICATE:
    "Se detectó un posible duplicado crítico. Debe proporcionar una justificación sólida.",
} as const
