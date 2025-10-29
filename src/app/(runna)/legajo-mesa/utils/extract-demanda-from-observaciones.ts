/**
 * Utility to extract demanda ID from observaciones text
 * Handles various text formats like:
 * - "Medida creada automáticamente desde demanda 6"
 * - "Creada desde demanda 123"
 * - "Demanda 456"
 */

/**
 * Extract demanda ID from observaciones text
 * @param observaciones Text from etapa_actual.observaciones or similar
 * @returns Demanda ID or null if not found
 */
export const extractDemandaIdFromObservaciones = (observaciones: string | null | undefined): number | null => {
  if (!observaciones || typeof observaciones !== "string") {
    return null
  }

  // Regular expression to match "demanda" followed by a number
  // Matches: "demanda 6", "demanda 123", "DEMANDA 456", etc.
  const demandaPattern = /demanda\s+(\d+)/i
  const match = observaciones.match(demandaPattern)

  if (match && match[1]) {
    const demandaId = parseInt(match[1], 10)
    if (!isNaN(demandaId) && demandaId > 0) {
      return demandaId
    }
  }

  return null
}

/**
 * Extract demanda ID from multiple possible sources in medida data
 * @param medidaApiData Medida detail response
 * @returns Demanda ID or null if not found
 */
export const extractDemandaIdFromMedida = (medidaApiData: any): number | null => {
  // Try etapa_actual.observaciones first
  if (medidaApiData?.etapa_actual?.observaciones) {
    const demandaId = extractDemandaIdFromObservaciones(medidaApiData.etapa_actual.observaciones)
    if (demandaId) {
      return demandaId
    }
  }

  // Try historial_etapas if available
  if (medidaApiData?.historial_etapas && Array.isArray(medidaApiData.historial_etapas)) {
    for (const etapa of medidaApiData.historial_etapas) {
      if (etapa?.observaciones) {
        const demandaId = extractDemandaIdFromObservaciones(etapa.observaciones)
        if (demandaId) {
          return demandaId
        }
      }
    }
  }

  // Try top-level observaciones if available
  if (medidaApiData?.observaciones) {
    const demandaId = extractDemandaIdFromObservaciones(medidaApiData.observaciones)
    if (demandaId) {
      return demandaId
    }
  }

  return null
}
