/**
 * Enhanced Legajo Service
 * Fetches legajo details with demanda adjuntos processing
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
 * Fetch legajo detail with demanda adjuntos processing
 * This function:
 * 1. Fetches the base legajo detail
 * 2. Extracts demanda IDs from demandas_relacionadas
 * 3. Fetches full details for each demanda
 * 4. Processes adjuntos and routes them to oficios/documentos
 * 5. Merges with existing oficios/documentos
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
    const legajoDetail = await fetchLegajoDetail(id, params)

    // Step 2: Extract demanda IDs from demandas_relacionadas
    const demandaIds: number[] = []

    if (legajoDetail.demandas_relacionadas?.resultados) {
      legajoDetail.demandas_relacionadas.resultados.forEach((demandaRelacion: any) => {
        // Support multiple formats:
        // Format 1: { id: 4, demanda: { demanda_id: 6, ... } }
        // Format 2: { id: 1, demanda: { demanda_id: 9, ... } }
        // Format 3: { id: 9, ... } (direct ID)

        let demandaId: number | null = null

        // Try nested demanda.demanda_id first
        if (demandaRelacion?.demanda?.demanda_id) {
          demandaId = demandaRelacion.demanda.demanda_id
        }
        // Try top-level demanda_id
        else if (demandaRelacion?.demanda_id) {
          demandaId = demandaRelacion.demanda_id
        }
        // Fallback to top-level id (if it's not just a relation ID)
        else if (demandaRelacion?.id && !demandaRelacion?.demanda) {
          demandaId = demandaRelacion.id
        }

        if (demandaId && !demandaIds.includes(demandaId)) {
          demandaIds.push(demandaId)
        }
      })
    }

    console.log(`Found ${demandaIds.length} demandas to process:`, demandaIds)

    // If no demandas, return base legajo detail as-is
    if (demandaIds.length === 0) {
      console.log("No demandas to process, returning base legajo detail")
      return legajoDetail
    }

    // Step 3: Fetch full details for each demanda
    let demandasDetails
    try {
      demandasDetails = await fetchMultipleDemandaDetails(demandaIds)
      console.log(`Fetched ${demandasDetails.length} demanda details`)
    } catch (error) {
      console.error("Error fetching demanda details, continuing without them:", error)
      // Continue without demanda adjuntos if fetch fails
      return legajoDetail
    }

    // Step 4: Process adjuntos from demandas
    const { oficios: demandaOficios, documentos: demandaDocumentos } =
      processDemandaAdjuntos(demandasDetails)

    console.log(`Processed ${demandaOficios.length} oficios from demandas`)
    console.log(`Processed ${demandaDocumentos.length} documentos from demandas`)

    // Step 5: Merge with existing oficios and documentos
    const enhancedLegajo: EnhancedLegajoDetailResponse = {
      ...legajoDetail,
      oficios: [...(legajoDetail.oficios || []), ...demandaOficios],
      documentos: [...(legajoDetail.documentos || []), ...demandaDocumentos],
    }

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
