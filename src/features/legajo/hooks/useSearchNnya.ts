/**
 * Custom hook for NNyA search (LEG-01 integration)
 * Manages search state and results
 */

import { useState } from 'react'
import { buscarNnyaPorDni, buscarNnyaPorNombre, buscarNnya } from '../api/legajo-search.service'
import type { BusquedaNnyaResult } from '../types/legajo-creation.types'

/**
 * Hook for searching NNyA by DNI or name
 *
 * Features:
 * - Search by DNI
 * - Search by name/apellido
 * - Loading state management
 * - Results caching
 * - Clear results functionality
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
  const searchByDni = async (dni: string) => {
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
  }

  /**
   * Search by nombre and apellido
   */
  const searchByNombre = async (nombre: string, apellido: string) => {
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
  }

  /**
   * Smart search - auto-detects DNI vs name
   */
  const search = async (searchTerm: string) => {
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
  }

  /**
   * Clear search results
   */
  const clearResults = () => {
    setResults([])
    setLastSearch('')
  }

  /**
   * Check if NNyA already has legajo
   */
  const hasLegajo = (nnyaId: number): boolean => {
    const nnya = results.find(r => r.id === nnyaId)
    return !!nnya?.legajo_existente
  }

  /**
   * Get legajo info for NNyA
   */
  const getLegajoInfo = (nnyaId: number) => {
    const nnya = results.find(r => r.id === nnyaId)
    return nnya?.legajo_existente
  }

  return {
    // State
    searching,
    results,
    lastSearch,
    hasResults: results.length > 0,

    // Functions
    searchByDni,
    searchByNombre,
    search,
    clearResults,
    hasLegajo,
    getLegajoInfo,
  }
}
