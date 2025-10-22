/**
 * MED-05: Ratificación Judicial - Custom Hook
 *
 * React hook for managing Ratificación Judicial state and API interactions.
 * Handles loading, error states, and provides helper functions for business logic.
 *
 * Usage:
 * ```tsx
 * const {
 *   ratificacion,
 *   isLoading,
 *   error,
 *   hasRatificacion,
 *   isRatificada,
 *   canModify,
 *   createRatificacion,
 *   refetch,
 * } = useRatificacionJudicial({ medidaId })
 * ```
 */

import { useState, useEffect, useCallback } from "react"
import type {
  RatificacionJudicial,
  CreateRatificacionJudicialRequest,
  UpdateRatificacionJudicialRequest,
  RatificacionAdjunto,
  RatificacionJudicialHistorial,
} from "../types/ratificacion-judicial-api"
import {
  DecisionJudicial,
  canModificarRatificacion,
  isFinalState,
} from "../types/ratificacion-judicial-api"
import RatificacionJudicialAPI from "../api/ratificacion-judicial-api-service"

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseRatificacionJudicialParams {
  medidaId: number
  autoFetch?: boolean // Auto-fetch on mount (default: true)
}

interface UseRatificacionJudicialReturn {
  // Estado
  ratificacion: RatificacionJudicial | null
  isLoading: boolean
  error: string | null
  adjuntos: RatificacionAdjunto[]
  historial: RatificacionJudicialHistorial | null
  isLoadingHistorial: boolean
  historialError: string | null

  // Computed properties
  hasRatificacion: boolean
  isRatificada: boolean
  isNoRatificada: boolean
  isPendiente: boolean
  isFinal: boolean // RATIFICADA or NO_RATIFICADA
  canModify: boolean
  tieneResolucionJudicial: boolean
  tieneCedulaNotificacion: boolean
  tieneAcuseRecibo: boolean

  // Actions
  createRatificacion: (
    data: CreateRatificacionJudicialRequest
  ) => Promise<void>
  updateRatificacion: (
    data: UpdateRatificacionJudicialRequest
  ) => Promise<void>
  refetch: () => Promise<void>
  fetchHistorial: () => Promise<void>
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useRatificacionJudicial({
  medidaId,
  autoFetch = true,
}: UseRatificacionJudicialParams): UseRatificacionJudicialReturn {
  // ============================================================================
  // STATE
  // ============================================================================

  const [ratificacion, setRatificacion] = useState<RatificacionJudicial | null>(
    null
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [historial, setHistorial] = useState<RatificacionJudicialHistorial | null>(
    null
  )
  const [isLoadingHistorial, setIsLoadingHistorial] = useState<boolean>(false)
  const [historialError, setHistorialError] = useState<string | null>(null)

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  /**
   * Fetch ratificación activa from API
   */
  const fetchRatificacion = useCallback(async () => {
    if (!medidaId) return

    setIsLoading(true)
    setError(null)

    try {
      const ratificacionActiva = await RatificacionJudicialAPI.getActiva(
        medidaId
      )
      setRatificacion(ratificacionActiva)
    } catch (err: any) {
      // 404 is not an error - it just means no ratificación exists yet
      const is404 = err?.response?.status === 404 || err?.message?.includes('404')

      if (is404) {
        // No ratificación exists yet - this is a valid state, not an error
        setRatificacion(null)
        setError(null)
        console.log("No ratificación found for medida", medidaId, "- user can create one")
      } else {
        // Actual error
        const errorMessage = err.message || "Error al cargar ratificación judicial"
        setError(errorMessage)
        console.error("Error fetching ratificación:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [medidaId])

  /**
   * Fetch historial de ratificaciones (activas + inactivas)
   */
  const fetchHistorial = useCallback(async () => {
    if (!medidaId) return

    setIsLoadingHistorial(true)
    setHistorialError(null)

    try {
      const historialData = await RatificacionJudicialAPI.getHistorial(medidaId)
      setHistorial(historialData)
    } catch (err: any) {
      const errorMessage =
        err.message || "Error al cargar historial de ratificaciones"
      setHistorialError(errorMessage)
      console.error("Error fetching historial:", err)
    } finally {
      setIsLoadingHistorial(false)
    }
  }, [medidaId])

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch && medidaId) {
      fetchRatificacion()
    }
  }, [medidaId, autoFetch, fetchRatificacion])

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const hasRatificacion = ratificacion !== null
  const adjuntos = ratificacion?.adjuntos || []

  const isRatificada =
    ratificacion?.decision === DecisionJudicial.RATIFICADA ?? false
  const isNoRatificada =
    ratificacion?.decision === DecisionJudicial.NO_RATIFICADA ?? false
  const isPendiente =
    ratificacion?.decision === DecisionJudicial.PENDIENTE ?? false
  const isFinal = ratificacion ? isFinalState(ratificacion.decision) : false

  const canModify = canModificarRatificacion(ratificacion)

  // Adjuntos helpers
  const tieneResolucionJudicial = adjuntos.some(
    (adj) => adj.tipo_adjunto === "RESOLUCION_JUDICIAL"
  )
  const tieneCedulaNotificacion = adjuntos.some(
    (adj) => adj.tipo_adjunto === "CEDULA_NOTIFICACION"
  )
  const tieneAcuseRecibo = adjuntos.some(
    (adj) => adj.tipo_adjunto === "ACUSE_RECIBO"
  )

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Create new ratificación judicial
   *
   * @param data - Ratificación data with files
   * @throws Error if creation fails
   */
  const createRatificacion = useCallback(
    async (data: CreateRatificacionJudicialRequest) => {
      if (!medidaId) {
        throw new Error("medidaId is required")
      }

      setIsLoading(true)
      setError(null)

      try {
        const newRatificacion = await RatificacionJudicialAPI.createRatificacion(
          medidaId,
          data
        )

        setRatificacion(newRatificacion)

        // Re-fetch para asegurar datos actualizados
        await fetchRatificacion()
      } catch (err: any) {
        const errorMessage =
          err.message || "Error al crear ratificación judicial"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [medidaId, fetchRatificacion]
  )

  /**
   * Update existing ratificación judicial
   * Solo permitido cuando decision === "PENDIENTE"
   *
   * @param data - Ratificación data to update (partial)
   * @throws Error if update fails or validation fails
   */
  const updateRatificacion = useCallback(
    async (data: UpdateRatificacionJudicialRequest) => {
      if (!medidaId) {
        throw new Error("medidaId is required")
      }

      if (!ratificacion) {
        throw new Error("No existe ratificación para actualizar")
      }

      if (!canModificarRatificacion(ratificacion)) {
        throw new Error(
          "No se puede modificar una ratificación con decisión final (RATIFICADA/NO_RATIFICADA)"
        )
      }

      setIsLoading(true)
      setError(null)

      try {
        const updatedRatificacion = await RatificacionJudicialAPI.updateRatificacion(
          medidaId,
          data
        )

        setRatificacion(updatedRatificacion)

        // Re-fetch para asegurar datos actualizados
        await fetchRatificacion()
      } catch (err: any) {
        const errorMessage =
          err.message || "Error al actualizar ratificación judicial"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [medidaId, ratificacion, fetchRatificacion]
  )

  /**
   * Refetch ratificación (útil después de operaciones externas)
   */
  const refetch = useCallback(async () => {
    await fetchRatificacion()
  }, [fetchRatificacion])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    ratificacion,
    isLoading,
    error,
    adjuntos,
    historial,
    isLoadingHistorial,
    historialError,

    // Computed properties
    hasRatificacion,
    isRatificada,
    isNoRatificada,
    isPendiente,
    isFinal,
    canModify,
    tieneResolucionJudicial,
    tieneCedulaNotificacion,
    tieneAcuseRecibo,

    // Actions
    createRatificacion,
    updateRatificacion,
    refetch,
    fetchHistorial,
  }
}

export default useRatificacionJudicial
