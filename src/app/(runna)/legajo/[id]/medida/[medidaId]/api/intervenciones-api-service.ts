/**
 * API Service for Intervenciones de Medida
 * Connects to /api/medidas/{medida_pk}/intervenciones/ endpoints
 *
 * MED-02: Registro de Intervención
 * - MED-02a: CRUD básico
 * - MED-02b: Transiciones de estado y aprobación
 * - MED-02c: Adjuntos y validaciones avanzadas
 */

import { get, create, update, remove } from "@/app/api/apiService"
import type {
  CreateIntervencionRequest,
  UpdateIntervencionRequest,
  IntervencionResponse,
  IntervencionesQueryParams,
  EnviarIntervencionResponse,
  AprobarIntervencionResponse,
  RechazarIntervencionRequest,
  RechazarIntervencionResponse,
  AdjuntoIntervencion,
  AdjuntosQueryParams,
} from "../types/intervencion-api"

// ============================================================================
// CRUD OPERATIONS (MED-02a)
// ============================================================================

/**
 * Create a new intervención for a medida
 * POST /api/medidas/{medida_id}/intervenciones/
 *
 * @param medidaId ID de la medida
 * @param data Datos de la intervención a crear
 * @returns Intervención creada con estado BORRADOR
 */
export const createIntervencion = async (
  medidaId: number,
  data: CreateIntervencionRequest
): Promise<IntervencionResponse> => {
  try {
    console.log(`Creating intervención for medida ${medidaId}:`, data)

    // Make API call - create() already adds trailing slash
    const response = await create<IntervencionResponse>(
      `medidas/${medidaId}/intervenciones`,
      data as Partial<IntervencionResponse>
    )

    console.log("Intervención created successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error creating intervención for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get intervenciones of a medida (list)
 * GET /api/medidas/{medida_id}/intervenciones/
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de intervenciones
 */
export const getIntervencionesByMedida = async (
  medidaId: number,
  params: IntervencionesQueryParams = {}
): Promise<IntervencionResponse[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.estado) {
      queryParams.estado = params.estado
    }

    if (params.tipo_dispositivo) {
      queryParams.tipo_dispositivo = String(params.tipo_dispositivo)
    }

    if (params.motivo) {
      queryParams.motivo = String(params.motivo)
    }

    if (params.categoria_intervencion) {
      queryParams.categoria_intervencion = String(params.categoria_intervencion)
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

    console.log(`Fetching intervenciones for medida ${medidaId} with params:`, queryParams)

    // Make API call - Backend returns array directly
    const response = await get<IntervencionResponse[]>(
      `medidas/${medidaId}/intervenciones/`,
      queryParams
    )

    console.log("Intervenciones retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching intervenciones for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get intervención detail (complete info)
 * GET /api/medidas/{medida_id}/intervenciones/{id}/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @returns Intervención con detalle completo
 */
export const getIntervencionDetail = async (
  medidaId: number,
  intervencionId: number
): Promise<IntervencionResponse> => {
  try {
    console.log(`Fetching intervención detail: medida ${medidaId}, intervención ${intervencionId}`)

    // Make API call - Django requires trailing slash
    const response = await get<IntervencionResponse>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/`
    )

    console.log("Intervención detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching intervención detail: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Update an existing intervención
 * PATCH /api/medidas/{medida_id}/intervenciones/{id}/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @param data Datos a actualizar (parcial)
 * @returns Intervención actualizada
 */
export const updateIntervencion = async (
  medidaId: number,
  intervencionId: number,
  data: UpdateIntervencionRequest
): Promise<IntervencionResponse> => {
  try {
    console.log(`Updating intervención: medida ${medidaId}, intervención ${intervencionId}`, data)

    // Make API call - update() uses PATCH and adds trailing slash
    const response = await update<IntervencionResponse>(
      `medidas/${medidaId}/intervenciones/${intervencionId}`,
      data as Partial<IntervencionResponse>
    )

    console.log("Intervención updated successfully:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error updating intervención: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Delete an intervención
 * DELETE /api/medidas/{medida_id}/intervenciones/{id}/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 */
export const deleteIntervencion = async (
  medidaId: number,
  intervencionId: number
): Promise<void> => {
  try {
    console.log(`Deleting intervención: medida ${medidaId}, intervención ${intervencionId}`)

    // Make API call - remove() uses DELETE and adds trailing slash
    await remove(`medidas/${medidaId}/intervenciones/${intervencionId}`)

    console.log("Intervención deleted successfully")
  } catch (error: any) {
    console.error(
      `Error deleting intervención: medida ${medidaId}, intervención ${intervencionId}`,
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
// STATE TRANSITIONS (MED-02b)
// ============================================================================

/**
 * Send intervención to approval (ET action)
 * PATCH /api/medidas/{medida_id}/intervenciones/{id}/enviar/
 * Estado 1 → Estado 2 (BORRADOR → ENVIADO)
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @returns Response con la intervención actualizada
 */
export const enviarIntervencion = async (
  medidaId: number,
  intervencionId: number
): Promise<EnviarIntervencionResponse> => {
  try {
    console.log(`Enviando intervención: medida ${medidaId}, intervención ${intervencionId}`)

    // Import axiosInstance at the top of the file if not already imported
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // Make API call - Uses PATCH with no body
    const response = await axiosInstance.patch<EnviarIntervencionResponse>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/enviar/`
    )

    console.log("Intervención enviada successfully:", response.data)

    return response.data
  } catch (error: any) {
    console.error(
      `Error enviando intervención: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Approve intervención (JZ action)
 * POST /api/medidas/{medida_id}/intervenciones/{id}/aprobar/
 * Estado 2 → Estado 3 (ENVIADO → APROBADO)
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @returns Response con la intervención aprobada
 */
export const aprobarIntervencion = async (
  medidaId: number,
  intervencionId: number
): Promise<AprobarIntervencionResponse> => {
  try {
    console.log(`Aprobando intervención: medida ${medidaId}, intervención ${intervencionId}`)

    // Import axiosInstance
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // Make API call - Uses POST with no body
    const response = await axiosInstance.post<AprobarIntervencionResponse>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/aprobar/`
    )

    console.log("Intervención aprobada successfully:", response.data)

    return response.data
  } catch (error: any) {
    console.error(
      `Error aprobando intervención: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Reject intervención (JZ action)
 * POST /api/medidas/{medida_id}/intervenciones/{id}/rechazar/
 * Estado 2 → Estado 1 (ENVIADO → RECHAZADO → BORRADOR)
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @param data Observaciones del JZ (obligatorias)
 * @returns Response con la intervención rechazada
 */
export const rechazarIntervencion = async (
  medidaId: number,
  intervencionId: number,
  data: RechazarIntervencionRequest
): Promise<RechazarIntervencionResponse> => {
  try {
    console.log(
      `Rechazando intervención: medida ${medidaId}, intervención ${intervencionId}`,
      data
    )

    // Import axiosInstance
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // Make API call - Uses POST with observaciones_jz
    const response = await axiosInstance.post<RechazarIntervencionResponse>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/rechazar/`,
      data
    )

    console.log("Intervención rechazada successfully:", response.data)

    return response.data
  } catch (error: any) {
    console.error(
      `Error rechazando intervención: medida ${medidaId}, intervención ${intervencionId}`,
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
// ADJUNTOS MANAGEMENT (MED-02c)
// ============================================================================

/**
 * Upload adjunto to intervención
 * POST /api/medidas/{medida_id}/intervenciones/{id}/adjuntos/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @param file Archivo a subir
 * @param tipo Tipo de adjunto (MODELO, ACTA, RESPALDO, INFORME)
 * @returns Adjunto creado
 */
export const uploadAdjunto = async (
  medidaId: number,
  intervencionId: number,
  file: File,
  tipo: string
): Promise<AdjuntoIntervencion> => {
  try {
    console.log(
      `Uploading adjunto: medida ${medidaId}, intervención ${intervencionId}, tipo ${tipo}`
    )

    // Create FormData for multipart/form-data
    const formData = new FormData()
    formData.append("archivo", file)
    formData.append("tipo", tipo)

    // Import axiosInstance to use the configured base URL
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // Make API call using axiosInstance which includes the base URL
    const response = await axiosInstance.post<AdjuntoIntervencion>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/adjuntos/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    console.log("Adjunto uploaded successfully:", response.data)

    return response.data
  } catch (error: any) {
    console.error(
      `Error uploading adjunto: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Get adjuntos list of an intervención
 * GET /api/medidas/{medida_id}/intervenciones/{id}/adjuntos-list/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @param params Query parameters para filtrar
 * @returns Array de adjuntos
 */
export const getAdjuntos = async (
  medidaId: number,
  intervencionId: number,
  params: AdjuntosQueryParams = {}
): Promise<AdjuntoIntervencion[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.tipo) {
      queryParams.tipo = params.tipo
    }

    console.log(
      `Fetching adjuntos: medida ${medidaId}, intervención ${intervencionId} with params:`,
      queryParams
    )

    // Make API call
    const response = await get<AdjuntoIntervencion[]>(
      `medidas/${medidaId}/intervenciones/${intervencionId}/adjuntos-list/`,
      queryParams
    )

    console.log("Adjuntos retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching adjuntos: medida ${medidaId}, intervención ${intervencionId}`,
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
 * Delete adjunto from intervención
 * DELETE /api/medidas/{medida_id}/intervenciones/{id}/adjuntos/{adjunto_id}/
 *
 * @param medidaId ID de la medida
 * @param intervencionId ID de la intervención
 * @param adjuntoId ID del adjunto
 */
export const deleteAdjunto = async (
  medidaId: number,
  intervencionId: number,
  adjuntoId: number
): Promise<void> => {
  try {
    console.log(
      `Deleting adjunto: medida ${medidaId}, intervención ${intervencionId}, adjunto ${adjuntoId}`
    )

    // Make API call
    await remove(`medidas/${medidaId}/intervenciones/${intervencionId}/adjuntos/${adjuntoId}`)

    console.log("Adjunto deleted successfully")
  } catch (error: any) {
    console.error(
      `Error deleting adjunto: medida ${medidaId}, intervención ${intervencionId}, adjunto ${adjuntoId}`,
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
