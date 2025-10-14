/**
 * API Service for Legajos
 * Connects to GET /api/legajos/ endpoint
 */

import { get } from "@/app/api/apiService"
import type {
  LegajosQueryParams,
  PaginatedLegajosResponse,
  LegajoApiResponse,
  LegajoDetailResponse,
  LegajoDetailQueryParams,
} from "../types/legajo-api"

/**
 * Helper function to safely parse JSON from serialized fields
 * @param value Serialized string or already parsed object
 * @param defaultValue Default value if parsing fails
 * @returns Parsed object or default value
 */
const safeParse = <T>(value: any, defaultValue: T): T => {
  if (!value) return defaultValue
  if (typeof value !== "string") return value as T

  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.warn("Failed to parse JSON:", value, error)
    return defaultValue
  }
}

/**
 * Parse legajo response to deserialize string fields
 * @param legajo Raw legajo from API
 * @returns Legajo with parsed fields
 */
const parseLegajoResponse = (legajo: any): LegajoApiResponse => {
  return {
    ...legajo,
    medidas_activas: safeParse(legajo.medidas_activas, []),
    actividades_activas: safeParse(legajo.actividades_activas, []),
    oficios: safeParse(legajo.oficios, []),
    indicadores: safeParse(legajo.indicadores, {
      demanda_pi_count: 0,
      oficios_por_tipo: {},
      medida_andarivel: null,
      pt_actividades: {
        pendientes: 0,
        en_progreso: 0,
        vencidas: 0,
        realizadas: 0,
      },
      alertas: [],
    }),
    acciones_disponibles: safeParse(legajo.acciones_disponibles, []),
  }
}

/**
 * Fetch legajos with pagination and filters
 * @param params Query parameters for filtering and pagination
 * @returns Paginated legajos response
 */
export const fetchLegajos = async (
  params: LegajosQueryParams = {}
): Promise<PaginatedLegajosResponse> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.page !== undefined) {
      queryParams.page = String(params.page)
    }

    if (params.page_size !== undefined) {
      queryParams.page_size = String(params.page_size)
    }

    if (params.search) {
      queryParams.search = params.search
    }

    if (params.zona !== undefined) {
      queryParams.zona = String(params.zona)
    }

    if (params.urgencia !== undefined) {
      queryParams.urgencia = String(params.urgencia)
    }

    if (params.fecha_apertura_desde) {
      queryParams.fecha_apertura_desde = params.fecha_apertura_desde
    }

    if (params.fecha_apertura_hasta) {
      queryParams.fecha_apertura_hasta = params.fecha_apertura_hasta
    }

    if (params.ordering) {
      queryParams.ordering = params.ordering
    }

    // Add boolean filters
    if (params.tiene_medidas_activas !== undefined) {
      queryParams.tiene_medidas_activas = String(params.tiene_medidas_activas)
    }

    if (params.tiene_oficios !== undefined) {
      queryParams.tiene_oficios = String(params.tiene_oficios)
    }

    if (params.tiene_plan_trabajo !== undefined) {
      queryParams.tiene_plan_trabajo = String(params.tiene_plan_trabajo)
    }

    if (params.tiene_alertas !== undefined) {
      queryParams.tiene_alertas = String(params.tiene_alertas)
    }

    if (params.tiene_demanda_pi !== undefined) {
      queryParams.tiene_demanda_pi = String(params.tiene_demanda_pi)
    }

    console.log("Fetching legajos with params:", queryParams)

    // Make API call - Django requires trailing slash
    const response = await get<any>("legajos/", queryParams)

    console.log("Legajos response (raw):", response)

    // Parse serialized fields in each legajo
    const parsedResponse: PaginatedLegajosResponse = {
      ...response,
      results: response.results.map(parseLegajoResponse),
    }

    console.log("Legajos response (parsed):", parsedResponse)

    return parsedResponse
  } catch (error: any) {
    console.error("Error fetching legajos:", error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Fetch a single legajo by ID (simple version, from list endpoint)
 * @param id Legajo ID
 * @returns Single legajo
 */
export const fetchLegajoById = async (id: number): Promise<LegajoApiResponse> => {
  try {
    const response = await get<LegajoApiResponse>(`legajos/${id}/`)
    return response
  } catch (error) {
    console.error(`Error fetching legajo ${id}:`, error)
    throw error
  }
}

/**
 * Fetch legajo detail with nested data (consolidated view)
 * @param id Legajo ID
 * @param params Query parameters (e.g., include_history)
 * @returns Detailed legajo with all nested information
 */
export const fetchLegajoDetail = async (
  id: number,
  params: LegajoDetailQueryParams = {}
): Promise<LegajoDetailResponse> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.include_history !== undefined) {
      queryParams.include_history = String(params.include_history)
    }

    console.log(`Fetching legajo detail for ID ${id} with params:`, queryParams)

    // Make API call - Django requires trailing slash
    const response = await get<LegajoDetailResponse>(`legajos/${id}/`, queryParams)

    console.log("Legajo detail response:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching legajo detail ${id}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Update legajo prioridad
 * @param id Legajo ID
 * @param prioridad New prioridad value
 * @returns Updated legajo
 */
export const updateLegajoPrioridad = async (
  id: number,
  prioridad: "ALTA" | "MEDIA" | "BAJA"
): Promise<LegajoApiResponse> => {
  try {
    // Import patch from apiService
    const { patch } = await import("@/app/api/apiService")
    const response = await patch<LegajoApiResponse>("/legajos", id, { prioridad })
    return response
  } catch (error) {
    console.error(`Error updating legajo ${id} prioridad:`, error)
    throw error
  }
}
