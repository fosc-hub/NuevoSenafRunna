/**
 * Enhanced Legajo Service
 * Fetches legajo details with demanda adjuntos processing
 * Supports progressive loading for better UX
 */

import type { LegajoDetailResponse, LegajoDetailQueryParams } from "../types/legajo-api"
import { fetchLegajoDetail } from "./legajos-api-service"
import { fetchMultipleDemandaDetails } from "./demanda-api-service"
import { processDemandaAdjuntos } from "../utils/demanda-adjuntos-processor"

/**
 * Enhanced legajo detail response with processed demanda adjuntos
 */
export interface EnhancedLegajoDetailResponse extends LegajoDetailResponse {
  // oficios and documentos arrays are already part of LegajoDetailResponse
  // but we'll enrich them with demanda adjuntos
}

/**
 * Demanda enhancement data (oficios and documentos from demandas)
 */
export interface DemandaEnhancementData {
  oficios: any[]
  documentos: any[]
}

/**
 * Extract demanda IDs from legajo detail
 */
export const extractDemandaIds = (legajoDetail: LegajoDetailResponse): number[] => {
  const demandaIds: number[] = []

  if (legajoDetail.demandas_relacionadas?.resultados) {
    legajoDetail.demandas_relacionadas.resultados.forEach((demandaRelacion: any) => {
      let demandaId: number | null = null

      if (demandaRelacion?.demanda?.demanda_id) {
        demandaId = demandaRelacion.demanda.demanda_id
      } else if (demandaRelacion?.demanda_id) {
        demandaId = demandaRelacion.demanda_id
      } else if (demandaRelacion?.id && !demandaRelacion?.demanda) {
        demandaId = demandaRelacion.id
      }

      if (demandaId && !demandaIds.includes(demandaId)) {
        demandaIds.push(demandaId)
      }
    })
  }

  return demandaIds
}

/**
 * Fetch base legajo detail (fast, no demanda processing)
 * Use this for immediate page render
 */
export const fetchBaseLegajoDetail = async (
  id: number,
  params: LegajoDetailQueryParams = {}
): Promise<LegajoDetailResponse> => {
  return fetchLegajoDetail(id, params)
}

/**
 * Fetch demanda enhancements (oficios and documentos from demandas)
 * Use this for background loading after initial render
 */
export const fetchDemandaEnhancements = async (
  legajoDetail: LegajoDetailResponse
): Promise<DemandaEnhancementData> => {
  const demandaIds = extractDemandaIds(legajoDetail)

  if (demandaIds.length === 0) {
    return { oficios: [], documentos: [] }
  }

  console.log(`Fetching demanda enhancements for ${demandaIds.length} demandas:`, demandaIds)

  try {
    const demandasDetails = await fetchMultipleDemandaDetails(demandaIds)
    console.log(`Fetched ${demandasDetails.length} demanda details`)

    const { oficios, documentos } = processDemandaAdjuntos(demandasDetails)

    console.log(`Processed ${oficios.length} oficios and ${documentos.length} documentos from demandas`)

    return { oficios, documentos }
  } catch (error) {
    console.error("Error fetching demanda enhancements:", error)
    return { oficios: [], documentos: [] }
  }
}

/**
 * Merge demanda enhancements into legajo detail
 */
export const mergeDemandaEnhancements = (
  legajoDetail: LegajoDetailResponse,
  enhancements: DemandaEnhancementData
): EnhancedLegajoDetailResponse => {
  return {
    ...legajoDetail,
    oficios: [...(legajoDetail.oficios || []), ...enhancements.oficios],
    documentos: [...(legajoDetail.documentos || []), ...enhancements.documentos],
  }
}

/**
 * Fetch legajo detail with demanda adjuntos processing (blocking version)
 * For backwards compatibility - waits for all data before returning.
 *
 * Consider using fetchBaseLegajoDetail + fetchDemandaEnhancements for progressive loading.
 *
 * @param id Legajo ID
 * @param params Query parameters
 * @returns Enhanced legajo detail with demanda adjuntos
 */
export const fetchEnhancedLegajoDetail = async (
  id: number,
  params: LegajoDetailQueryParams = {}
): Promise<EnhancedLegajoDetailResponse> => {
  try {
    console.log(`Fetching enhanced legajo detail for ID ${id}`)

    // Step 1: Fetch base legajo detail
    const legajoDetail = await fetchBaseLegajoDetail(id, params)

    // Step 2: Fetch demanda enhancements
    const enhancements = await fetchDemandaEnhancements(legajoDetail)

    // Step 3: Merge and return
    const enhancedLegajo = mergeDemandaEnhancements(legajoDetail, enhancements)

    console.log(`Enhanced legajo detail:`, {
      total_oficios: enhancedLegajo.oficios.length,
      total_documentos: enhancedLegajo.documentos.length,
    })

    return enhancedLegajo
  } catch (error: any) {
    console.error(`Error fetching enhanced legajo detail ${id}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}
