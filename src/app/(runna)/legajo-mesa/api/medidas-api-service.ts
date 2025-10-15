/**
 * API Service for Medidas
 * Connects to /api/legajos/{id}/medidas/ and /api/medidas/ endpoints
 */

import { get, create } from "@/app/api/apiService"
import type {
  CreateMedidaRequest,
  MedidaBasicResponse,
  MedidaDetailResponse,
  MedidasQueryParams,
  PaginatedMedidasResponse,
} from "../types/medida-api"

/**
 * Create a new medida for a legajo
 * POST /api/legajos/{legajo_id}/medidas/
 *
 * @param legajoId ID del legajo
 * @param data Datos de la medida a crear
 * @returns Medida creada
 */
export const createMedida = async (
  legajoId: number,
  data: CreateMedidaRequest
): Promise<MedidaDetailResponse> => {
  try {
    console.log(`Creating medida for legajo ${legajoId}:`, data)

    // Make API call - create() already adds trailing slash
    const response = await create<MedidaDetailResponse>(`legajos/${legajoId}/medidas`, data as Partial<MedidaDetailResponse>)

    console.log("Medida created successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error creating medida for legajo ${legajoId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get medidas of a legajo (list)
 * GET /api/legajos/{legajo_id}/medidas/
 *
 * @param legajoId ID del legajo
 * @param params Query parameters para filtrar
 * @returns Array de medidas (el backend retorna array directo, no paginado)
 */
export const getMedidasByLegajo = async (
  legajoId: number,
  params: MedidasQueryParams = {}
): Promise<MedidaBasicResponse[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.tipo_medida) {
      queryParams.tipo_medida = params.tipo_medida
    }

    if (params.estado_vigencia) {
      queryParams.estado_vigencia = params.estado_vigencia
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

    console.log(`Fetching medidas for legajo ${legajoId} with params:`, queryParams)

    // Make API call - Backend returns array directly, not paginated
    const response = await get<MedidaBasicResponse[]>(`legajos/${legajoId}/medidas/`, queryParams)

    console.log("Medidas retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching medidas for legajo ${legajoId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get medida detail (complete info)
 * GET /api/medidas/{id}/
 *
 * @param id ID de la medida
 * @returns Medida con detalle completo (legajo, etapas, historial)
 */
export const getMedidaDetail = async (id: number): Promise<MedidaDetailResponse> => {
  try {
    console.log(`Fetching medida detail for ID ${id}`)

    // Make API call - Django requires trailing slash
    const response = await get<MedidaDetailResponse>(`medidas/${id}/`)

    console.log("Medida detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching medida detail ${id}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get all medidas with filters
 * GET /api/medidas/
 *
 * @param params Query parameters para filtrar
 * @returns Lista paginada de medidas
 */
export const getAllMedidas = async (
  params: MedidasQueryParams = {}
): Promise<PaginatedMedidasResponse> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.tipo_medida) {
      queryParams.tipo_medida = params.tipo_medida
    }

    if (params.estado_vigencia) {
      queryParams.estado_vigencia = params.estado_vigencia
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

    console.log("Fetching all medidas with params:", queryParams)

    // Make API call - Django requires trailing slash
    const response = await get<PaginatedMedidasResponse>("medidas/", queryParams)

    console.log("All medidas retrieved:", response)

    return response
  } catch (error: any) {
    console.error("Error fetching all medidas:", error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}
