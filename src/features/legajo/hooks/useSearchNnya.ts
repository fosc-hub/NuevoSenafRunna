/**
 * Custom hook for NNyA search (LEG-01 integration)
 * Manages search state and results with enhanced data
 *
 * Features:
 * - Search by DNI
 * - Search by name/apellido
 * - Loading state management
 * - Results with enriched data (legajo, demandas, medidas, grupo conviviente)
 */

import { useState, useCallback } from 'react'
import {
  buscarNnyaPorDni,
  buscarNnyaPorNombre,
  buscarNnya,
} from '../api/legajo-search.service'
import type { BusquedaNnyaResult, GrupoConvivienteMiembro } from '../types/legajo-creation.types'

/**
 * Hook for searching NNyA by DNI or name
 *
 * @returns Object with search functions and state
 */
export const useSearchNnya = () => {
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<BusquedaNnyaResult[]>([])
  const [lastSearch, setLastSearch] = useState<string>('')

  /**
   * Search by DNI
   */
  const searchByDni = useCallback(async (dni: string) => {
    if (!dni.trim()) {
      setResults([])
      return []
    }

    setSearching(true)
    setLastSearch(`dni:${dni}`)

    try {
      const data = await buscarNnyaPorDni(dni)
      setResults(data)
      return data
    } catch (error) {
      console.error('Error in searchByDni:', error)
      setResults([])
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  /**
   * Search by nombre and apellido
   */
  const searchByNombre = useCallback(async (nombre: string, apellido: string) => {
    if (!nombre.trim() && !apellido.trim()) {
      setResults([])
      return []
    }

    setSearching(true)
    setLastSearch(`nombre:${nombre} ${apellido}`)

    try {
      const data = await buscarNnyaPorNombre(nombre, apellido)
      setResults(data)
      return data
    } catch (error) {
      console.error('Error in searchByNombre:', error)
      setResults([])
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  /**
   * Smart search - auto-detects DNI vs name
   */
  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return []
    }

    setSearching(true)
    setLastSearch(searchTerm)

    try {
      const data = await buscarNnya(searchTerm)
      setResults(data)
      return data
    } catch (error) {
      console.error('Error in search:', error)
      setResults([])
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([])
    setLastSearch('')
  }, [])

  // ============================================
  // Helper functions for enriched data (LEG-01)
  // ============================================

  /**
   * Check if NNyA already has legajo
   */
  const hasLegajo = useCallback((nnyaId: number): boolean => {
    const nnya = results.find((r) => r.id === nnyaId)
    return !!nnya?.legajo_existente
  }, [results])

  /**
   * Get legajo info for NNyA
   */
  const getLegajoInfo = useCallback((nnyaId: number) => {
    const nnya = results.find((r) => r.id === nnyaId)
    return nnya?.legajo_existente
  }, [results])

  /**
   * Check if NNyA has linked demandas
   */
  const hasDemandas = useCallback((nnyaId: number): boolean => {
    const nnya = results.find((r) => r.id === nnyaId)
    return (nnya?.demandas_ids?.length ?? 0) > 0
  }, [results])

  /**
   * Get demandas IDs for NNyA
   */
  const getDemandasIds = useCallback((nnyaId: number): number[] => {
    const nnya = results.find((r) => r.id === nnyaId)
    return nnya?.demandas_ids ?? []
  }, [results])

  /**
   * Check if NNyA has active medidas
   */
  const hasMedidas = useCallback((nnyaId: number): boolean => {
    const nnya = results.find((r) => r.id === nnyaId)
    return (nnya?.medidas_ids?.length ?? 0) > 0
  }, [results])

  /**
   * Get medidas IDs for NNyA
   */
  const getMedidasIds = useCallback((nnyaId: number): number[] => {
    const nnya = results.find((r) => r.id === nnyaId)
    return nnya?.medidas_ids ?? []
  }, [results])

  /**
   * Check if NNyA has grupo conviviente members
   */
  const hasGrupoConviviente = useCallback((nnyaId: number): boolean => {
    const nnya = results.find((r) => r.id === nnyaId)
    return (nnya?.grupo_conviviente?.length ?? 0) > 0
  }, [results])

  /**
   * Get grupo conviviente for NNyA
   */
  const getGrupoConviviente = useCallback((nnyaId: number): GrupoConvivienteMiembro[] => {
    const nnya = results.find((r) => r.id === nnyaId)
    return nnya?.grupo_conviviente ?? []
  }, [results])

  /**
   * Get a summary of NNyA's existing records
   * Useful for displaying warnings or info badges
   */
  const getResumenRegistros = useCallback((nnyaId: number) => {
    const nnya = results.find((r) => r.id === nnyaId)
    if (!nnya) return null

    return {
      tieneLeagajo: !!nnya.legajo_existente,
      legajo: nnya.legajo_existente,
      cantidadDemandas: nnya.demandas_ids?.length ?? 0,
      cantidadMedidas: nnya.medidas_ids?.length ?? 0,
      cantidadGrupoConviviente: nnya.grupo_conviviente?.length ?? 0,
      esNnya: nnya.nnya,
    }
  }, [results])

  return {
    // State
    searching,
    results,
    lastSearch,
    hasResults: results.length > 0,

    // Search functions
    searchByDni,
    searchByNombre,
    search,
    clearResults,

    // Legajo helpers
    hasLegajo,
    getLegajoInfo,

    // Demandas helpers (LEG-01)
    hasDemandas,
    getDemandasIds,

    // Medidas helpers (LEG-01)
    hasMedidas,
    getMedidasIds,

    // Grupo conviviente helpers (LEG-01)
    hasGrupoConviviente,
    getGrupoConviviente,

    // Summary helper (LEG-01)
    getResumenRegistros,
  }
}
