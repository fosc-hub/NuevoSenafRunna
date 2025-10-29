/**
 * API Service for Demandas
 * Fetches full demanda details and processes adjuntos
 */

import { get } from "@/app/api/apiService"
import type { DemandaFullDetailResponse } from "../types/demanda-api"

/**
 * Fetch full demanda detail including all adjuntos
 * @param demandaId Demanda ID
 * @returns Full demanda detail with adjuntos
 */
export const fetchDemandaFullDetail = async (
  demandaId: number
): Promise<DemandaFullDetailResponse> => {
  try {
    console.log(`Fetching demanda full detail for ID ${demandaId}`)

    // Make API call to the registro-demanda-form endpoint
    const response = await get<DemandaFullDetailResponse>(
      `registro-demanda-form/${demandaId}/full-detail/`
    )

    console.log("Demanda full detail response:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching demanda full detail ${demandaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Fetch full details for multiple demandas
 * @param demandaIds Array of demanda IDs
 * @returns Array of full demanda details
 */
export const fetchMultipleDemandaDetails = async (
  demandaIds: number[]
): Promise<DemandaFullDetailResponse[]> => {
  try {
    console.log(`Fetching ${demandaIds.length} demanda full details`)

    // Fetch all demandas in parallel
    const promises = demandaIds.map((id) => fetchDemandaFullDetail(id))
    const results = await Promise.all(promises)

    return results
  } catch (error) {
    console.error("Error fetching multiple demanda details:", error)
    throw error
  }
}
