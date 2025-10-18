/**
 * MED-05: Ratificación Judicial - API Service
 *
 * Service layer for Ratificación Judicial API communication.
 * Handles HTTP requests, error handling, and data transformation.
 *
 * Backend Endpoints:
 * - GET  /api/medidas/{medida_pk}/ratificacion/          → Obtener ratificación activa
 * - POST /api/medidas/{medida_pk}/ratificacion/          → Crear ratificación (multipart)
 * - GET  /api/medidas/{medida_pk}/ratificacion/historial/ → Historial completo
 */

import type {
  RatificacionJudicial,
  CreateRatificacionJudicialRequest,
  RatificacionJudicialHistorial,
  RatificacionAdjunto,
} from "../types/ratificacion-judicial-api"
import { buildRatificacionFormData } from "../types/ratificacion-judicial-api"

// ============================================================================
// BASE URL CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

/**
 * Build auth headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    Authorization: token ? `Bearer ${token}` : "",
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `Error ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  return response.json()
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * GET /api/medidas/{medida_id}/ratificacion/
 *
 * Consultar ratificación activa de una medida.
 * Retorna array de ratificaciones (solo la activa si existe).
 *
 * @param medidaId - ID de la medida
 * @returns Array de ratificaciones (usualmente 1 o 0 elementos)
 * @throws Error si falla el request
 */
export async function getRatificacion(
  medidaId: number
): Promise<RatificacionJudicial[]> {
  const url = `${API_BASE_URL}/api/medidas/${medidaId}/ratificacion/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })

  return handleResponse<RatificacionJudicial[]>(response)
}

/**
 * POST /api/medidas/{medida_id}/ratificacion/
 *
 * Registrar ratificación judicial (cierra el ciclo MED-01 → MED-05).
 *
 * Validaciones backend:
 * - Medida debe estar en Estado 5 (PENDIENTE_RATIFICACION_JUDICIAL)
 * - Usuario debe ser Equipo Legal o JZ
 * - No puede haber otra ratificación activa
 * - Archivo de resolución judicial obligatorio
 *
 * @param medidaId - ID de la medida
 * @param data - Datos de ratificación (con archivos)
 * @returns Ratificación creada
 * @throws Error si falla validación o request
 */
export async function createRatificacion(
  medidaId: number,
  data: CreateRatificacionJudicialRequest
): Promise<RatificacionJudicial> {
  const url = `${API_BASE_URL}/api/medidas/${medidaId}/ratificacion/`

  // Build FormData (multipart/form-data)
  const formData = buildRatificacionFormData(data)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      // NO incluir Content-Type - fetch lo establece automáticamente con boundary
      ...getAuthHeaders(),
    },
    body: formData,
  })

  return handleResponse<RatificacionJudicial>(response)
}

/**
 * GET /api/medidas/{medida_id}/ratificacion/historial/
 *
 * Consultar historial completo de ratificaciones (activas + inactivas) de una medida.
 * Útil para auditoría y trazabilidad de correcciones administrativas.
 *
 * @param medidaId - ID de la medida
 * @returns Historial de ratificaciones
 * @throws Error si falla el request
 */
export async function getRatificacionHistorial(
  medidaId: number
): Promise<RatificacionJudicialHistorial> {
  const url = `${API_BASE_URL}/api/medidas/${medidaId}/ratificacion/historial/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })

  return handleResponse<RatificacionJudicialHistorial>(response)
}

// ============================================================================
// HELPER API FUNCTIONS
// ============================================================================

/**
 * Get ratificación activa for a medida
 *
 * Helper function que retorna directamente la ratificación activa (si existe)
 * en lugar del array completo.
 *
 * @param medidaId - ID de la medida
 * @returns Ratificación activa o null
 */
export async function getRatificacionActiva(
  medidaId: number
): Promise<RatificacionJudicial | null> {
  const ratificaciones = await getRatificacion(medidaId)

  // Filtrar solo activas (debería haber máximo 1)
  const activa = ratificaciones.find((r) => r.activo)

  return activa || null
}

/**
 * Check if medida has ratificación activa
 *
 * @param medidaId - ID de la medida
 * @returns true si existe ratificación activa
 */
export async function hasRatificacionActiva(
  medidaId: number
): Promise<boolean> {
  try {
    const activa = await getRatificacionActiva(medidaId)
    return activa !== null
  } catch (error) {
    console.error("Error checking ratificación:", error)
    return false
  }
}

// ============================================================================
// ADJUNTOS HELPERS (para extensión futura)
// ============================================================================

/**
 * NOTE: El backend actualmente maneja adjuntos automáticamente en el POST
 * de ratificación. Si en el futuro se necesita subir adjuntos adicionales
 * de forma independiente, se pueden agregar estos endpoints:
 *
 * - POST /api/medidas/{medida_id}/ratificacion/adjuntos/
 * - DELETE /api/medidas/{medida_id}/ratificacion/adjuntos/{adjunto_id}/
 *
 * Por ahora, todos los adjuntos se suben con el createRatificacion.
 */

/**
 * Placeholder for future adjunto upload functionality
 */
export async function uploadAdjuntoRatificacion(
  medidaId: number,
  file: File,
  tipoAdjunto: string,
  descripcion?: string
): Promise<RatificacionAdjunto> {
  // TODO: Implementar cuando backend exponga endpoint de adjuntos independiente
  throw new Error(
    "Upload de adjuntos independientes no soportado aún. Use createRatificacion con archivos."
  )
}

/**
 * Placeholder for future adjunto deletion functionality
 */
export async function deleteAdjuntoRatificacion(
  medidaId: number,
  adjuntoId: number
): Promise<void> {
  // TODO: Implementar cuando backend exponga endpoint de eliminación
  throw new Error(
    "Eliminación de adjuntos no soportada aún. Contacte al administrador."
  )
}

// ============================================================================
// EXPORT DEFAULT API
// ============================================================================

/**
 * Ratificación Judicial API Service
 * Expone todas las funciones API organizadas
 */
export const RatificacionJudicialAPI = {
  // Main endpoints
  getRatificacion,
  createRatificacion,
  getHistorial: getRatificacionHistorial,

  // Helper functions
  getActiva: getRatificacionActiva,
  hasActiva: hasRatificacionActiva,

  // Future adjuntos (placeholders)
  uploadAdjunto: uploadAdjuntoRatificacion,
  deleteAdjunto: deleteAdjuntoRatificacion,
} as const

export default RatificacionJudicialAPI
