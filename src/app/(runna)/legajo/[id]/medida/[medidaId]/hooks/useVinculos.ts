/**
 * useVinculos Hook
 *
 * React hook for managing LEG-01 V2 Vinculación Justificada de Legajos
 * Provides state management and actions for vinculo operations
 *
 * Features:
 * - CRUD operations for vínculos
 * - Loading and error state management
 * - Success notifications
 * - Type catalog management
 */

import { useState, useCallback } from 'react'
import {
  getTiposVinculo,
  getTipoVinculoByCodigo,
  getVinculos,
  getVinculoDetail,
  createVinculo,
  desvincularVinculo,
  getVinculosActivosByLegajo,
  getHermanosByLegajo,
  countVinculosActivos,
  validateVinculoData,
} from '../../../../../legajo-mesa/api/vinculo-api-service'
import type {
  TTipoVinculo,
  TVinculoLegajoCreate,
  TVinculoLegajoDetail,
  TVinculoLegajoList,
  DesvincularVinculoRequest,
  VinculosLegajoQueryParams,
  TipoVinculoCodigo,
} from '../../../../../legajo-mesa/types/vinculo-types'

/**
 * Hook for vinculo operations with loading/error states
 * Wraps all vinculo service methods with state management
 *
 * @example
 * ```tsx
 * const {
 *   loading,
 *   error,
 *   tiposVinculo,
 *   loadTiposVinculo,
 *   crearVinculo,
 *   desvincular
 * } = useVinculos()
 *
 * useEffect(() => {
 *   loadTiposVinculo()
 * }, [])
 * ```
 */
export const useVinculos = () => {
  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catalog data
  const [tiposVinculo, setTiposVinculo] = useState<TTipoVinculo[]>([])

  // List data
  const [vinculos, setVinculos] = useState<TVinculoLegajoList[]>([])
  const [totalVinculos, setTotalVinculos] = useState(0)

  // Detail data
  const [vinculoDetail, setVinculoDetail] = useState<TVinculoLegajoDetail | null>(null)

  /**
   * Generic action handler with loading/error management
   */
  const handleAction = async <T,>(
    action: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await action()
      if (successMessage) {
        console.log(successMessage)
        // TODO: Integrate with toast notifications
      }
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error desconocido'
      setError(errorMessage)
      console.error('Vinculo action error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // CATALOG OPERATIONS
  // ============================================================================

  /**
   * Load all link types from catalog
   * Sets tiposVinculo state
   */
  const loadTiposVinculo = useCallback(async () => {
    const result = await handleAction(getTiposVinculo)
    if (result) {
      setTiposVinculo(result)
    }
    return result
  }, [])

  /**
   * Get a specific link type by code
   */
  const getTipoVinculo = useCallback(
    async (codigo: TipoVinculoCodigo) => {
      return handleAction(() => getTipoVinculoByCodigo(codigo))
    },
    []
  )

  // ============================================================================
  // LIST OPERATIONS
  // ============================================================================

  /**
   * Load vínculos with filters
   * Sets vinculos and totalVinculos state
   */
  const loadVinculos = useCallback(async (params?: VinculosLegajoQueryParams) => {
    const result = await handleAction(() => getVinculos(params))
    if (result) {
      setVinculos(result.results || [])
      setTotalVinculos(result.count || 0)
    }
    return result
  }, [])

  /**
   * Load active vínculos for a specific legajo
   * Sets vinculos state
   */
  const loadVinculosByLegajo = useCallback(async (legajoId: number) => {
    const result = await handleAction(
      () => getVinculosActivosByLegajo(legajoId),
      undefined
    )
    if (result) {
      setVinculos(result || [])
      setTotalVinculos(result?.length || 0)
    }
    return result
  }, [])

  /**
   * Load hermanos vínculos for a specific legajo
   */
  const loadHermanos = useCallback(async (legajoId: number) => {
    return handleAction(() => getHermanosByLegajo(legajoId))
  }, [])

  /**
   * Count active vínculos for a legajo
   */
  const countVinculos = useCallback(async (legajoId: number) => {
    return handleAction(() => countVinculosActivos(legajoId))
  }, [])

  // ============================================================================
  // DETAIL OPERATIONS
  // ============================================================================

  /**
   * Load detailed vinculo information
   * Sets vinculoDetail state
   */
  const loadVinculoDetail = useCallback(async (vinculoId: number) => {
    const result = await handleAction(() => getVinculoDetail(vinculoId))
    if (result) {
      setVinculoDetail(result)
    }
    return result
  }, [])

  // ============================================================================
  // CREATE OPERATION
  // ============================================================================

  /**
   * Create a new vínculo
   *
   * @param data Vinculo creation data
   * @returns Created vinculo detail or null on error
   *
   * @example
   * ```tsx
   * const newVinculo = await crearVinculo({
   *   legajo_origen: 1234,
   *   legajo_destino: 5678,
   *   tipo_vinculo: tipoHermanos.id,
   *   justificacion: "Son hermanos confirmados por documentación judicial..."
   * })
   * ```
   */
  const crearVinculo = useCallback(
    async (data: TVinculoLegajoCreate): Promise<TVinculoLegajoDetail | null> => {
      // Client-side validation
      const validationErrors = validateVinculoData(data)
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '))
        return null
      }

      const result = await handleAction(
        () => createVinculo(data),
        '¡Vínculo creado exitosamente!'
      )

      // Refresh the vinculo list if successful
      if (result && data.legajo_origen) {
        await loadVinculosByLegajo(data.legajo_origen)
      }

      return result
    },
    [loadVinculosByLegajo]
  )

  // ============================================================================
  // DEACTIVATE OPERATION
  // ============================================================================

  /**
   * Deactivate (soft delete) a vínculo
   *
   * @param vinculoId ID of the vínculo to deactivate
   * @param data Justification for deactivation
   * @returns Updated vinculo or null on error
   *
   * @example
   * ```tsx
   * const result = await desvincular(123, {
   *   justificacion_desvincular: "Error en vinculación. Revisión de expediente..."
   * })
   * ```
   */
  const desvincular = useCallback(
    async (
      vinculoId: number,
      data: DesvincularVinculoRequest
    ): Promise<TVinculoLegajoDetail | null> => {
      const result = await handleAction(
        () => desvincularVinculo(vinculoId, data),
        '¡Vínculo desvinculado exitosamente!'
      )

      // Refresh the vinculo detail if we have it loaded
      if (result && vinculoDetail?.id === vinculoId) {
        setVinculoDetail(result.vinculo)
      }

      // Refresh the list if we have one loaded
      if (result && vinculos.length > 0) {
        const legajoOrigenId = result.vinculo.legajo_origen
        await loadVinculosByLegajo(legajoOrigenId)
      }

      return result ? result.vinculo : null
    },
    [vinculoDetail, vinculos, loadVinculosByLegajo]
  )

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setError(null)
    setTiposVinculo([])
    setVinculos([])
    setTotalVinculos(0)
    setVinculoDetail(null)
  }, [])

  /**
   * Check if a legajo has vínculos activos
   */
  const hasVinculosActivos = useCallback(
    async (legajoId: number): Promise<boolean> => {
      const count = await countVinculos(legajoId)
      return (count ?? 0) > 0
    },
    [countVinculos]
  )

  /**
   * Check if a legajo has hermanos vínculos
   */
  const hasHermanos = useCallback(
    async (legajoId: number): Promise<boolean> => {
      const hermanos = await loadHermanos(legajoId)
      return (hermanos?.length ?? 0) > 0
    },
    [loadHermanos]
  )

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // State
    loading,
    error,
    tiposVinculo,
    vinculos,
    totalVinculos,
    vinculoDetail,

    // Catalog operations
    loadTiposVinculo,
    getTipoVinculo,

    // List operations
    loadVinculos,
    loadVinculosByLegajo,
    loadHermanos,
    countVinculos,

    // Detail operations
    loadVinculoDetail,

    // Create/Update operations
    crearVinculo,
    desvincular,

    // Utility methods
    clearError,
    reset,
    hasVinculosActivos,
    hasHermanos,
  }
}

/**
 * Type for the hook return value
 */
export type UseVinculosReturn = ReturnType<typeof useVinculos>
