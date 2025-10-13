/**
 * API Service for Legajos
 * Uses Next.js API proxy to avoid CORS issues
 */

import axiosInstance from "@/app/api/utils/axiosInstance"
import Cookies from "js-cookie"
import type {
  LegajosQueryParams,
  PaginatedLegajosResponse,
  LegajoApiResponse,
} from "../types/legajo-api"

// Use local proxy to avoid CORS issues
const USE_PROXY = true

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

    console.log("Fetching legajos with params:", queryParams)

    let response: any

    if (USE_PROXY) {
      // Use Next.js API proxy route (no baseURL)
      const queryString = new URLSearchParams(queryParams).toString()
      const url = `/api/proxy/legajos${queryString ? `?${queryString}` : ""}`

      console.log("Using proxy:", url)

      // Get token from cookies
      const token = Cookies.get("accessToken")

      // Use fetch directly to avoid baseURL
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Proxy error:", res.status, errorText)
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`)
      }

      response = { data: await res.json() }
    } else {
      // Use axiosInstance directly with external API
      const queryString = new URLSearchParams(queryParams).toString()
      const endpoint = `/legajos${queryString ? `?${queryString}` : ""}`
      response = await axiosInstance.get<PaginatedLegajosResponse>(endpoint)
    }

    console.log("Legajos response:", response.data)

    return response.data
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
 * Fetch a single legajo by ID
 * @param id Legajo ID
 * @returns Single legajo
 */
export const fetchLegajoById = async (id: number): Promise<LegajoApiResponse> => {
  try {
    const response = await get<LegajoApiResponse>(`/legajos/${id}`)
    return response
  } catch (error) {
    console.error(`Error fetching legajo ${id}:`, error)
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
