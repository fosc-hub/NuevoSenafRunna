import { useState, useCallback } from "react"

/**
 * Results from vinculacion search
 */
export interface VinculacionResults {
  demanda_ids: number[]
  match_descriptions: string[]
  legajos?: any[]
}

/**
 * Hook for managing vinculacion search state and notifications
 * Consolidates duplicate logic from Step2Form and Step3Form
 */
export const useVinculacionSearch = () => {
  const [vinculacionResults, setVinculacionResults] = useState<VinculacionResults | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  /**
   * Handler for vinculacion search results
   * Shows notification if matches are found
   */
  const handleVinculacionResults = useCallback((results: VinculacionResults) => {
    // Check if there are results in demanda_ids OR in legajos
    const hasDemandas = results.demanda_ids && results.demanda_ids.length > 0
    const hasLegajos = results.legajos && results.legajos.length > 0

    if (hasDemandas || hasLegajos) {
      console.log("Vinculación detectada:", results)
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }, [])

  /**
   * Close the vinculacion notification snackbar
   */
  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false)
  }, [])

  /**
   * Clear vinculacion results
   */
  const clearResults = useCallback(() => {
    setVinculacionResults(null)
    setOpenSnackbar(false)
  }, [])

  return {
    vinculacionResults,
    openSnackbar,
    handleVinculacionResults,
    handleCloseSnackbar,
    clearResults,
  }
}
