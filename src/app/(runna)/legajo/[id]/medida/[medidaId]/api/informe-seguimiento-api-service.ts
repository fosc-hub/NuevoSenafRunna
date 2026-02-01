/**
 * API Service for Informes de Seguimiento (PLTM-03)
 * Connects to /api/medidas/{medida_pk}/informes-seguimiento/ endpoints
 *
 * PLTM-03: Informes Mensuales de Seguimiento
 * - List monthly follow-up reports for a medida
 * - Complete reports with content and optional file upload
 * - Download/upload templates
 * - Manage report attachments
 */

import { get, create, remove } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import type {
  InformeSeguimiento,
  InformeSeguimientoListItem,
  InformesSeguimientoQueryParams,
  CompletarInformePayload,
  CompletarInformeResponse,
  SubirPlantillaResponse,
  PlantillaInfoResponse,
  InformeSeguimientoAdjunto,
} from "../types/informe-seguimiento-api"

// ============================================================================
// CRUD OPERATIONS - INFORMES DE SEGUIMIENTO
// ============================================================================

/**
 * Get informes de seguimiento of a medida (list)
 * GET /api/medidas/{medida_id}/informes-seguimiento/
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de informes de seguimiento
 */
export const getInformesSeguimiento = async (
  medidaId: number,
  params: InformesSeguimientoQueryParams = {}
): Promise<InformeSeguimientoListItem[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.estado) {
      queryParams.estado = params.estado
    }

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.ordering) {
      queryParams.ordering = params.ordering
    }

    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit)
    }

    if (params.offset !== undefined) {
      queryParams.offset = String(params.offset)
    }

    console.log(`Fetching informes de seguimiento for medida ${medidaId} with params:`, queryParams)

    // Make API call - Backend returns array directly
    const response = await get<InformeSeguimientoListItem[]>(
      `medidas/${medidaId}/informes-seguimiento/`,
      queryParams
    )

    console.log("Informes de seguimiento retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching informes de seguimiento for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get informe de seguimiento detail (complete info)
 * GET /api/medidas/{medida_id}/informes-seguimiento/{id}/
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @returns Informe de seguimiento con detalle completo
 */
export const getInformeSeguimientoDetail = async (
  medidaId: number,
  informeId: number
): Promise<InformeSeguimiento> => {
  try {
    console.log(
      `Fetching informe de seguimiento detail: medida ${medidaId}, informe ${informeId}`
    )

    const response = await get<InformeSeguimiento>(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/`
    )

    console.log("Informe de seguimiento detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching informe de seguimiento detail: medida ${medidaId}, informe ${informeId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// COMPLETAR INFORME
// ============================================================================

/**
 * Completar informe de seguimiento
 * POST /api/medidas/{medida_id}/informes-seguimiento/{id}/completar/
 *
 * Validaciones:
 * - Informe debe estar en estado PENDIENTE o VENCIDO
 * - Usuario debe tener permisos para completar
 * - Contenido es obligatorio
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @param payload Datos del informe (contenido, observaciones, plantilla opcional)
 * @returns Response con informe completado
 */
export const completarInforme = async (
  medidaId: number,
  informeId: number,
  payload: CompletarInformePayload
): Promise<CompletarInformeResponse> => {
  try {
    console.log(`Completando informe de seguimiento: medida ${medidaId}, informe ${informeId}`)

    // Create FormData if there's a file, otherwise send JSON
    let body: FormData | Record<string, any>

    if (payload.plantilla) {
      const formData = new FormData()
      formData.append("contenido", payload.contenido)
      if (payload.observaciones) {
        formData.append("observaciones", payload.observaciones)
      }
      formData.append("plantilla", payload.plantilla)
      body = formData
    } else {
      body = {
        contenido: payload.contenido,
        observaciones: payload.observaciones || null,
      }
    }

    const response = await create<CompletarInformeResponse>(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/completar/`,
      body as Partial<CompletarInformeResponse>,
      true,
      'Informe completado exitosamente'
    )

    console.log("Informe de seguimiento completado:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error completando informe de seguimiento: medida ${medidaId}, informe ${informeId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// PLANTILLA OPERATIONS
// ============================================================================

/**
 * Subir plantilla completada
 * POST /api/medidas/{medida_id}/informes-seguimiento/{id}/subir-plantilla/
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @param file Archivo de plantilla completada
 * @returns Response con URL de la plantilla
 */
export const subirPlantilla = async (
  medidaId: number,
  informeId: number,
  file: File
): Promise<SubirPlantillaResponse> => {
  try {
    console.log(
      `Subiendo plantilla para informe de seguimiento: medida ${medidaId}, informe ${informeId}`
    )

    const formData = new FormData()
    formData.append("archivo", file)

    const response = await create<SubirPlantillaResponse>(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/subir-plantilla/`,
      formData as unknown as Partial<SubirPlantillaResponse>,
      true,
      'Plantilla subida exitosamente'
    )

    console.log("Plantilla subida:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error subiendo plantilla: medida ${medidaId}, informe ${informeId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get plantilla info for medida
 * GET /api/medidas/{medida_id}/informes-seguimiento/plantilla/
 *
 * @param medidaId ID de la medida
 * @returns Info de la plantilla disponible
 */
export const getPlantillaInfo = async (
  medidaId: number
): Promise<PlantillaInfoResponse> => {
  try {
    console.log(`Fetching plantilla info for medida ${medidaId}`)

    const response = await get<PlantillaInfoResponse>(
      `medidas/${medidaId}/informes-seguimiento/plantilla/`
    )

    console.log("Plantilla info retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching plantilla info for medida ${medidaId}:`, error)
    // Return default response if endpoint returns 404 (no template available)
    if (error?.response?.status === 404) {
      return { disponible: false }
    }
    throw error
  }
}

/**
 * Descargar plantilla de informe de seguimiento
 * GET /api/medidas/{medida_id}/informes-seguimiento/plantilla/descargar/
 *
 * @param medidaId ID de la medida
 * @returns Blob del archivo de plantilla
 */
export const descargarPlantilla = async (medidaId: number): Promise<Blob> => {
  try {
    console.log(`Descargando plantilla for medida ${medidaId}`)

    const response = await axiosInstance.get(
      `medidas/${medidaId}/informes-seguimiento/plantilla/descargar/`,
      {
        responseType: 'blob',
      }
    )

    console.log("Plantilla downloaded")

    return response.data
  } catch (error: any) {
    console.error(`Error downloading plantilla for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// ADJUNTOS MANAGEMENT
// ============================================================================

/**
 * Get adjuntos list of informe de seguimiento
 * GET /api/medidas/{medida_id}/informes-seguimiento/{informe_id}/adjuntos/
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @returns Array de adjuntos
 */
export const getAdjuntos = async (
  medidaId: number,
  informeId: number
): Promise<InformeSeguimientoAdjunto[]> => {
  try {
    console.log(
      `Fetching adjuntos for informe de seguimiento: medida ${medidaId}, informe ${informeId}`
    )

    const response = await get<InformeSeguimientoAdjunto[]>(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/adjuntos/`
    )

    console.log("Adjuntos retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching adjuntos: medida ${medidaId}, informe ${informeId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Upload adjunto to informe de seguimiento
 * POST /api/medidas/{medida_id}/informes-seguimiento/{informe_id}/adjuntos/
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @param file Archivo a subir
 * @param descripcion Descripción opcional
 * @returns Adjunto creado
 */
export const uploadAdjunto = async (
  medidaId: number,
  informeId: number,
  file: File,
  descripcion?: string
): Promise<InformeSeguimientoAdjunto> => {
  try {
    console.log(
      `Uploading adjunto to informe de seguimiento: medida ${medidaId}, informe ${informeId}`
    )

    const formData = new FormData()
    formData.append("archivo", file)
    if (descripcion) {
      formData.append("descripcion", descripcion)
    }

    const response = await create<InformeSeguimientoAdjunto>(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/adjuntos/`,
      formData as unknown as Partial<InformeSeguimientoAdjunto>,
      true,
      'Adjunto subido exitosamente'
    )

    console.log("Adjunto uploaded:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error uploading adjunto: medida ${medidaId}, informe ${informeId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Delete adjunto from informe de seguimiento
 * DELETE /api/medidas/{medida_id}/informes-seguimiento/{informe_id}/adjuntos/{adjunto_id}/
 *
 * @param medidaId ID de la medida
 * @param informeId ID del informe de seguimiento
 * @param adjuntoId ID del adjunto
 */
export const deleteAdjunto = async (
  medidaId: number,
  informeId: number,
  adjuntoId: number
): Promise<void> => {
  try {
    console.log(
      `Deleting adjunto: medida ${medidaId}, informe ${informeId}, adjunto ${adjuntoId}`
    )

    await remove(
      `medidas/${medidaId}/informes-seguimiento/${informeId}/adjuntos`,
      adjuntoId
    )

    console.log("Adjunto deleted successfully")
  } catch (error: any) {
    console.error(
      `Error deleting adjunto: medida ${medidaId}, informe ${informeId}, adjunto ${adjuntoId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get informes pending completion (PENDIENTE or VENCIDO)
 */
export const getInformesPendientes = async (
  medidaId: number
): Promise<InformeSeguimientoListItem[]> => {
  try {
    const informes = await getInformesSeguimiento(medidaId, {
      ordering: 'fecha_vencimiento',
    })

    return informes.filter(
      (informe) => informe.estado === 'PENDIENTE' || informe.estado === 'VENCIDO'
    )
  } catch (error) {
    console.error(`Error getting informes pendientes for medida ${medidaId}:`, error)
    return []
  }
}

/**
 * Count informes by estado
 */
export const getInformesCountByEstado = async (
  medidaId: number
): Promise<Record<string, number>> => {
  try {
    const informes = await getInformesSeguimiento(medidaId)

    const counts: Record<string, number> = {
      PENDIENTE: 0,
      VENCIDO: 0,
      COMPLETADO: 0,
      COMPLETADO_TARDIO: 0,
      total: informes.length,
    }

    informes.forEach((informe) => {
      if (counts[informe.estado] !== undefined) {
        counts[informe.estado]++
      }
    })

    return counts
  } catch (error) {
    console.error(`Error getting informes count for medida ${medidaId}:`, error)
    return {
      PENDIENTE: 0,
      VENCIDO: 0,
      COMPLETADO: 0,
      COMPLETADO_TARDIO: 0,
      total: 0,
    }
  }
}
