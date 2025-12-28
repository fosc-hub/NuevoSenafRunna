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

import { get, create } from "@/app/api/apiService"
import type {
  RatificacionJudicial,
  CreateRatificacionJudicialRequest,
  UpdateRatificacionJudicialRequest,
  RatificacionJudicialHistorial,
  RatificacionAdjunto,
} from "../types/ratificacion-judicial-api"
import {
  buildRatificacionFormData,
  buildUpdateRatificacionFormData,
} from "../types/ratificacion-judicial-api"

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
  try {
    console.log(`Fetching ratificación for medida ${medidaId}`)

    // Make API call using apiService
    const response = await get<RatificacionJudicial[]>(
      `medidas/${medidaId}/ratificacion/`
    )

    console.log("Ratificación retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching ratificación for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
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
  try {
    console.log(`Creating ratificación for medida ${medidaId}:`, data)

    // Build FormData (multipart/form-data)
    const formData = buildRatificacionFormData(data)

    // REFACTORED: Use apiService.create() instead of axiosInstance
    // apiService.create() automatically handles FormData and multipart/form-data
    const response = await create<RatificacionJudicial>(
      `medidas/${medidaId}/ratificacion/`,
      formData,
      true,
      'Ratificación judicial registrada exitosamente'
    )

    console.log("Ratificación created successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error creating ratificación for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * PATCH /api/medidas/{medida_id}/ratificacion/
 *
 * Actualizar ratificación judicial existente.
 * Solo permitido cuando decision === "PENDIENTE"
 *
 * Validaciones backend:
 * - Ratificación debe existir y estar activa
 * - Decisión debe ser "PENDIENTE" (no se puede modificar si es RATIFICADA/NO_RATIFICADA)
 * - Usuario debe ser Equipo Legal o JZ
 * - Validaciones de fechas (no futuras, notificación >= resolución)
 *
 * @param medidaId - ID de la medida
 * @param data - Datos de ratificación a actualizar (campos opcionales)
 * @returns Ratificación actualizada
 * @throws Error si falla validación o request
 */
export async function updateRatificacion(
  medidaId: number,
  data: UpdateRatificacionJudicialRequest
): Promise<RatificacionJudicial> {
  try {
    console.log(`Updating ratificación for medida ${medidaId}:`, data)

    // Build FormData (multipart/form-data)
    const formData = buildUpdateRatificacionFormData(data)

    // NOTE: Uses axiosInstance directly - Non-standard REST pattern exception
    // Endpoint: PATCH /api/medidas/{medida_id}/ratificacion/ (no additional ID)
    // Backend operates on the singleton "active" ratificacion per medida (only one activo=true)
    // apiService.update() would append /{id}/ creating /medidas/{id}/ratificacion/{id}/ which is incorrect
    // This is similar to actividadService.cancel() - non-standard pattern requiring direct axios call
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    const response = await axiosInstance.patch<RatificacionJudicial>(
      `medidas/${medidaId}/ratificacion/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    console.log("Ratificación updated successfully:", response.data)

    return response.data
  } catch (error: any) {
    console.error(`Error updating ratificación for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
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
  try {
    console.log(`Fetching ratificación historial for medida ${medidaId}`)

    // Make API call using apiService
    const response = await get<RatificacionJudicialHistorial>(
      `medidas/${medidaId}/ratificacion/historial/`
    )

    console.log("Ratificación historial retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching ratificación historial for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
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
  try {
    const response = await getRatificacion(medidaId)

    // Backend can return either an array or a single object
    // Handle both cases
    if (Array.isArray(response)) {
      // If it's an array, find the active one
      const activa = response.find((r) => r.activo)
      return activa || null
    } else if (response && typeof response === 'object') {
      // If it's a single object, return it if it's active
      return (response as RatificacionJudicial).activo ? response as RatificacionJudicial : null
    }

    return null
  } catch (error) {
    console.error("Error getting ratificación activa:", error)
    return null
  }
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
  updateRatificacion,
  getHistorial: getRatificacionHistorial,

  // Helper functions
  getActiva: getRatificacionActiva,
  hasActiva: hasRatificacionActiva,

  // Future adjuntos (placeholders)
  uploadAdjunto: uploadAdjuntoRatificacion,
  deleteAdjunto: deleteAdjuntoRatificacion,
} as const

export default RatificacionJudicialAPI
