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

    // Add numeric filters
    if (params.id__gt !== undefined && params.id__gt !== null) {
      queryParams.id__gt = String(params.id__gt)
    }
    if (params.id__lt !== undefined && params.id__lt !== null) {
      queryParams.id__lt = String(params.id__lt)
    }
    if (params.id__gte !== undefined && params.id__gte !== null) {
      queryParams.id__gte = String(params.id__gte)
    }
    if (params.id__lte !== undefined && params.id__lte !== null) {
      queryParams.id__lte = String(params.id__lte)
    }

    // Add date filters
    if (params.fecha_apertura__gte) {
      queryParams.fecha_apertura__gte = params.fecha_apertura__gte
    }
    if (params.fecha_apertura__lte) {
      queryParams.fecha_apertura__lte = params.fecha_apertura__lte
    }
    if (params.fecha_apertura__ultimos_dias !== undefined && params.fecha_apertura__ultimos_dias !== null) {
      queryParams.fecha_apertura__ultimos_dias = String(params.fecha_apertura__ultimos_dias)
    }

    // Add responsable filters
    if (params.jefe_zonal !== undefined && params.jefe_zonal !== null) {
      queryParams.jefe_zonal = String(params.jefe_zonal)
    }
    if (params.director !== undefined && params.director !== null) {
      queryParams.director = String(params.director)
    }
    if (params.equipo_trabajo !== undefined && params.equipo_trabajo !== null) {
      queryParams.equipo_trabajo = String(params.equipo_trabajo)
    }
    if (params.equipo_centro_vida !== undefined && params.equipo_centro_vida !== null) {
      queryParams.equipo_centro_vida = String(params.equipo_centro_vida)
    }

    // Advanced filters (LEG-03 CA-3)
    if (params.demanda_estado) {
      queryParams.demanda_estado = params.demanda_estado
    }

    // Array parameters for multi-select filters
    if (params.medida_tipo && params.medida_tipo.length > 0) {
      queryParams.medida_tipo = params.medida_tipo.join(",")
    }

    if (params.oficio_tipo && params.oficio_tipo.length > 0) {
      queryParams.oficio_tipo = params.oficio_tipo.join(",")
    }

    if (params.oficios_proximos_vencer !== undefined && params.oficios_proximos_vencer !== null) {
      queryParams.oficios_proximos_vencer = String(params.oficios_proximos_vencer)
    }

    if (params.oficios_vencidos !== undefined) {
      queryParams.oficios_vencidos = String(params.oficios_vencidos)
    }

    if (params.pt_pendientes !== undefined) {
      queryParams.pt_pendientes = String(params.pt_pendientes)
    }

    if (params.pt_en_progreso !== undefined) {
      queryParams.pt_en_progreso = String(params.pt_en_progreso)
    }

    if (params.pt_vencidas !== undefined) {
      queryParams.pt_vencidas = String(params.pt_vencidas)
    }

    if (params.etapa_medida) {
      queryParams.etapa_medida = params.etapa_medida
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
    // Map prioridad string to urgencia numeric value
    // ALTA = 1, MEDIA = 2, BAJA = 3
    const urgenciaMap: Record<string, number> = {
      ALTA: 1,
      MEDIA: 2,
      BAJA: 3,
    }

    const urgencia = urgenciaMap[prioridad]

    // Import patch from apiService
    const { patch } = await import("@/app/api/apiService")
    const response = await patch<LegajoApiResponse>("/legajos", id, { urgencia })
    return response
  } catch (error) {
    console.error(`Error updating legajo ${id} prioridad:`, error)
    throw error
  }
}

/**
 * Update legajo datos personales (PATCH persona data via legajo endpoint)
 * @param id Legajo ID
 * @param datosPersonales Partial PersonaDetailData to update
 * @returns Updated legajo detail
 */
export const updateLegajoDatosPersonales = async (
  id: number,
  datosPersonales: Record<string, any>
): Promise<LegajoDetailResponse> => {
  try {
    // Import patch from apiService
    const { patch } = await import("@/app/api/apiService")

    // The backend expects persona data wrapped in "persona" key
    const payload = {
      persona: datosPersonales,
    }

    console.log(`Updating legajo ${id} datos personales:`, payload)

    const response = await patch<LegajoDetailResponse>("/legajos", id, payload)

    console.log("Update response:", response)

    return response
  } catch (error: any) {
    console.error(`Error updating legajo ${id} datos personales:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}
