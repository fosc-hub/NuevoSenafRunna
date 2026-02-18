/**
 * Hook for managing Informe Jurídico state and operations (MED-04)
 * Provides CRUD operations, adjunto management, and send functionality
 */

import { useState, useEffect, useCallback } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  getInformesJuridicosByMedida,
  getInformeJuridicoDetail,
  createInformeJuridico,
  updateInformeJuridico,
  enviarInformeJuridico,
  uploadAdjuntoInformeJuridico,
  getAdjuntosInformeJuridico,
  deleteAdjuntoInformeJuridico,
  getInformeJuridicoByMedida,
  hasInformeJuridico as checkHasInformeJuridico,
  canSendInformeJuridico as checkCanSendInformeJuridico,
  crearYEnviarInformeJuridico,
} from "../api/informe-juridico-api-service"
import { medidaKeys } from './useMedidaDetail'
import type {
  InformeJuridicoResponse,
  InformeJuridicoBasicResponse,
  CreateInformeJuridicoRequest,
  AdjuntoInformeJuridico,
  TipoAdjuntoInformeJuridico,
  EnviarInformeJuridicoResponse,
  CrearYEnviarInformeJuridicoRequest,
  CrearYEnviarInformeJuridicoResponse,
} from "../types/informe-juridico-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface UseInformeJuridicoOptions {
  medidaId: number
  autoLoad?: boolean // Auto-load on mount (default: true)
  loadAdjuntos?: boolean // Auto-load adjuntos with informe (default: true)
  /**
   * Etapa ID for state isolation.
   * When provided, state resets when switching between etapas.
   * Prevents data mixing between Apertura, Prórroga, etc.
   */
  etapaId?: number
  /**
   * Initial data from unified etapa endpoint.
   * When provided, skips the API call and uses this data instead.
   * This optimizes performance by using data already fetched via:
   * GET /api/medidas/{id}/etapa/{tipo_etapa}/
   */
  initialData?: InformeJuridicoBasicResponse[]
}

interface UseInformeJuridicoReturn {
  // Informe Jurídico state
  informeJuridico: InformeJuridicoResponse | null
  informes: InformeJuridicoBasicResponse[]
  isLoadingInforme: boolean
  informeError: string | null

  // Adjuntos state
  adjuntos: AdjuntoInformeJuridico[]
  isLoadingAdjuntos: boolean
  adjuntosError: string | null

  // Derived state
  hasInforme: boolean
  canSend: boolean
  isEnviado: boolean
  tieneInformeOficial: boolean
  cantidadAcuses: number

  // CRUD operations
  createNewInforme: (data: CreateInformeJuridicoRequest) => Promise<InformeJuridicoResponse>
  updateInforme: (data: Partial<CreateInformeJuridicoRequest>) => Promise<InformeJuridicoResponse>
  refetchInforme: () => Promise<void>

  // Unified create + send operation
  createAndSendInforme: (data: CrearYEnviarInformeJuridicoRequest) => Promise<CrearYEnviarInformeJuridicoResponse>

  // Adjunto operations
  uploadAdjunto: (
    file: File,
    tipoAdjunto: TipoAdjuntoInformeJuridico,
    descripcion?: string
  ) => Promise<AdjuntoInformeJuridico>
  deleteAdjunto: (adjuntoId: number) => Promise<void>
  refetchAdjuntos: () => Promise<void>

  // Send operation
  sendInforme: () => Promise<EnviarInformeJuridicoResponse>
}

// ============================================================================
// HOOK
// ============================================================================

export const useInformeJuridico = (
  options: UseInformeJuridicoOptions
): UseInformeJuridicoReturn => {
  const { medidaId, autoLoad = true, loadAdjuntos = true, etapaId, initialData } = options

  // Query client for cache invalidation
  const queryClient = useQueryClient()

  // Check if we have initial data from unified endpoint
  const hasInitialData = initialData !== undefined && initialData.length > 0
  // Check if initialData was provided (even if empty) - used to skip auto-fetch
  const initialDataProvided = initialData !== undefined

  // ============================================================================
  // STATE
  // ============================================================================

  // Informe Jurídico state
  // When initialData provided, use first informe as initial state
  const initialInforme = hasInitialData ? (initialData[0] as unknown as InformeJuridicoResponse) : null
  const [informeJuridico, setInformeJuridico] = useState<InformeJuridicoResponse | null>(initialInforme)
  const [informes, setInformes] = useState<InformeJuridicoBasicResponse[]>(initialData ?? [])
  const [isLoadingInforme, setIsLoadingInforme] = useState(false)
  const [informeError, setInformeError] = useState<string | null>(null)

  // Adjuntos state - extract from initialData if available
  // Note: InformeJuridicoBasicResponse from unified endpoint may have adjuntos embedded
  const initialAdjuntos = hasInitialData && (initialData[0] as any)?.adjuntos ? (initialData[0] as any).adjuntos : []
  const [adjuntos, setAdjuntos] = useState<AdjuntoInformeJuridico[]>(initialAdjuntos)
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)
  const [adjuntosError, setAdjuntosError] = useState<string | null>(null)

  // Derived state
  const hasInforme = informeJuridico !== null
  const isEnviado = informeJuridico?.enviado ?? false
  const tieneInformeOficial = informeJuridico?.tiene_informe_oficial ?? false
  const cantidadAcuses = informeJuridico?.cantidad_acuses ?? 0
  const canSend = hasInforme && !isEnviado && tieneInformeOficial

  // ============================================================================
  // FETCH OPERATIONS
  // ============================================================================

  /**
   * Fetch informe jurídico detail
   */
  const fetchInformeDetail = useCallback(
    async (informeId: number) => {
      try {
        setIsLoadingInforme(true)
        setInformeError(null)

        const data = await getInformeJuridicoDetail(medidaId, informeId)
        setInformeJuridico(data)

        // Load adjuntos if enabled
        if (loadAdjuntos) {
          await fetchAdjuntos(informeId)
        }
      } catch (error: any) {
        console.error("Error fetching informe jurídico detail:", error)
        setInformeError(error.message || "Error al cargar informe jurídico")
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, loadAdjuntos]
  )

  /**
   * Fetch informe jurídico (basic info)
   */
  const fetchInforme = useCallback(async () => {
    try {
      setIsLoadingInforme(true)
      setInformeError(null)

      // Get list of informes (should be only one)
      const informesList = await getInformesJuridicosByMedida(medidaId, {
        ordering: '-fecha_creacion',
      })
      setInformes(informesList)

      // If there's an informe, fetch its detail
      if (informesList.length > 0) {
        await fetchInformeDetail(informesList[0].id)
      } else {
        setInformeJuridico(null)
        setAdjuntos([])
      }
    } catch (error: any) {
      console.error("Error fetching informe jurídico:", error)
      setInformeError(error.message || "Error al cargar informe jurídico")
      setInformeJuridico(null)
    } finally {
      setIsLoadingInforme(false)
    }
  }, [medidaId, fetchInformeDetail])

  /**
   * Fetch adjuntos
   */
  const fetchAdjuntos = useCallback(
    async (informeId?: number) => {
      const targetInformeId = informeId || informeJuridico?.id

      if (!targetInformeId) {
        setAdjuntos([])
        return
      }

      try {
        setIsLoadingAdjuntos(true)
        setAdjuntosError(null)

        const adjuntosData = await getAdjuntosInformeJuridico(medidaId, {
          informe_juridico: targetInformeId,
        })
        setAdjuntos(adjuntosData)
      } catch (error: any) {
        console.error("Error fetching adjuntos:", error)
        setAdjuntosError(error.message || "Error al cargar adjuntos")
      } finally {
        setIsLoadingAdjuntos(false)
      }
    },
    [medidaId, informeJuridico?.id]
  )

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Create new informe jurídico
   */
  const createNewInforme = useCallback(
    async (data: CreateInformeJuridicoRequest): Promise<InformeJuridicoResponse> => {
      try {
        setIsLoadingInforme(true)
        setInformeError(null)

        const newInforme = await createInformeJuridico(medidaId, data)

        // Invalidate and refetch medida detail to refresh estado immediately
        await queryClient.invalidateQueries({
          queryKey: medidaKeys.detail(medidaId),
          refetchType: 'active'
        })

        // Refetch to get complete data
        await fetchInforme()

        toast.success('Informe Jurídico creado exitosamente', {
          position: 'top-center',
          autoClose: 3000,
        })

        return newInforme
      } catch (error: any) {
        console.error("Error creating informe jurídico:", error)
        const errorMsg = error.message || "Error al crear informe jurídico"
        setInformeError(errorMsg)
        toast.error(errorMsg, {
          position: 'top-center',
          autoClose: 5000,
        })
        throw new Error(errorMsg)
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, fetchInforme, queryClient]
  )

  /**
   * Update existing informe jurídico
   */
  const updateInforme = useCallback(
    async (data: Partial<CreateInformeJuridicoRequest>): Promise<InformeJuridicoResponse> => {
      if (!informeJuridico) {
        throw new Error("No hay informe jurídico para actualizar")
      }

      if (informeJuridico.enviado) {
        throw new Error("No se puede modificar un informe ya enviado")
      }

      try {
        setIsLoadingInforme(true)
        setInformeError(null)

        const updatedInforme = await updateInformeJuridico(medidaId, informeJuridico.id, data)

        // Invalidate and refetch medida detail to refresh estado immediately
        await queryClient.invalidateQueries({
          queryKey: medidaKeys.detail(medidaId),
          refetchType: 'active'
        })

        // Refetch to get complete data
        await fetchInforme()

        toast.success('Informe Jurídico actualizado exitosamente', {
          position: 'top-center',
          autoClose: 3000,
        })

        return updatedInforme
      } catch (error: any) {
        console.error("Error updating informe jurídico:", error)
        const errorMsg = error.message || "Error al actualizar informe jurídico"
        setInformeError(errorMsg)
        toast.error(errorMsg, {
          position: 'top-center',
          autoClose: 5000,
        })
        throw new Error(errorMsg)
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, informeJuridico, fetchInforme, queryClient]
  )

  /**
   * Refetch informe jurídico
   */
  const refetchInforme = useCallback(async () => {
    await fetchInforme()
  }, [fetchInforme])

  /**
   * Create and send informe jurídico in one atomic operation (unified flow)
   * Creates informe + uploads files + sends + transitions state
   */
  const createAndSendInforme = useCallback(
    async (data: CrearYEnviarInformeJuridicoRequest): Promise<CrearYEnviarInformeJuridicoResponse> => {
      try {
        setIsLoadingInforme(true)
        setInformeError(null)

        console.log('[useInformeJuridico] Creating and sending informe with unified endpoint')

        const response = await crearYEnviarInformeJuridico(medidaId, data)

        console.log('[useInformeJuridico] Unified create+send success:', response)

        // Update cache with new medida state from response
        if (response.medida?.etapa_actual) {
          console.log('[useInformeJuridico] Updating cache with new etapa_actual:', response.medida.etapa_actual)
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                etapa_actual: response.medida.etapa_actual,
                etapa_actual_detalle: response.medida.etapa_actual,
              }
            }
          )
        }

        // Also invalidate to ensure fresh data
        try {
          await queryClient.invalidateQueries({
            queryKey: medidaKeys.detail(medidaId),
            refetchType: 'active'
          })
        } catch (invalidateErr) {
          console.warn('[useInformeJuridico] Cache invalidation failed:', invalidateErr)
        }

        // Refetch to update local state
        await fetchInforme()

        toast.success('Informe Jurídico creado y enviado exitosamente', {
          position: 'top-center',
          autoClose: 3000,
        })

        return response
      } catch (error: any) {
        console.error('[useInformeJuridico] Error in createAndSendInforme:', error)
        const errorMsg = error.response?.data?.detail || error.message || 'Error al crear y enviar informe jurídico'
        setInformeError(errorMsg)
        toast.error(errorMsg, {
          position: 'top-center',
          autoClose: 5000,
        })
        throw new Error(errorMsg)
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, queryClient, fetchInforme]
  )

  // ============================================================================
  // ADJUNTO OPERATIONS
  // ============================================================================

  /**
   * Upload adjunto
   */
  const uploadAdjunto = useCallback(
    async (
      file: File,
      tipoAdjunto: TipoAdjuntoInformeJuridico,
      descripcion?: string
    ): Promise<AdjuntoInformeJuridico> => {
      try {
        setIsLoadingAdjuntos(true)
        setAdjuntosError(null)

        const newAdjunto = await uploadAdjuntoInformeJuridico(
          medidaId,
          file,
          tipoAdjunto,
          descripcion
        )

        // Refetch adjuntos and informe to update counts
        await fetchInforme()

        return newAdjunto
      } catch (error: any) {
        console.error("Error uploading adjunto:", error)
        const errorMsg = error.message || "Error al subir adjunto"
        setAdjuntosError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoadingAdjuntos(false)
      }
    },
    [medidaId, fetchInforme]
  )

  /**
   * Delete adjunto
   */
  const deleteAdjunto = useCallback(
    async (adjuntoId: number): Promise<void> => {
      try {
        setIsLoadingAdjuntos(true)
        setAdjuntosError(null)

        await deleteAdjuntoInformeJuridico(medidaId, adjuntoId)

        // Refetch adjuntos and informe to update counts
        await fetchInforme()
      } catch (error: any) {
        console.error("Error deleting adjunto:", error)
        const errorMsg = error.message || "Error al eliminar adjunto"
        setAdjuntosError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoadingAdjuntos(false)
      }
    },
    [medidaId, fetchInforme]
  )

  /**
   * Refetch adjuntos
   */
  const refetchAdjuntos = useCallback(async () => {
    await fetchAdjuntos()
  }, [fetchAdjuntos])

  // ============================================================================
  // SEND OPERATION
  // ============================================================================

  /**
   * Send informe jurídico (transición Estado 4 → 5)
   */
  const sendInforme = useCallback(async (): Promise<EnviarInformeJuridicoResponse> => {
    if (!canSend) {
      throw new Error(
        "No se puede enviar el informe. Verifique que exista un informe oficial adjunto."
      )
    }

    try {
      setIsLoadingInforme(true)
      setInformeError(null)

      const response = await enviarInformeJuridico(medidaId)

      // Invalidate and refetch medida detail to refresh estado immediately
      await queryClient.invalidateQueries({
        queryKey: medidaKeys.detail(medidaId),
        refetchType: 'active'
      })

      // Refetch to update estado
      await fetchInforme()

      toast.success('Informe Jurídico enviado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      return response
    } catch (error: any) {
      console.error("Error enviando informe jurídico:", error)
      const errorMsg = error.message || "Error al enviar informe jurídico"
      setInformeError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      throw new Error(errorMsg)
    } finally {
      setIsLoadingInforme(false)
    }
  }, [medidaId, canSend, fetchInforme, queryClient])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Reset state when etapaId or initialData changes
   * This ensures data isolation between different etapas (Apertura, Prórroga, etc.)
   */
  useEffect(() => {
    if (initialData !== undefined) {
      const newInforme = initialData.length > 0 ? (initialData[0] as unknown as InformeJuridicoResponse) : null
      const newAdjuntos = initialData.length > 0 && (initialData[0] as any)?.adjuntos ? (initialData[0] as any).adjuntos : []

      setInformeJuridico(newInforme)
      setInformes(initialData)
      setAdjuntos(newAdjuntos)
      setInformeError(null)
      setAdjuntosError(null)

      console.log('[useInformeJuridico] State reset for etapa:', etapaId, 'with', initialData.length, 'informes')
    }
  }, [etapaId, initialData])

  /**
   * Auto-load on mount if enabled
   * OPTIMIZATION: Skip API call if initialData is provided from unified endpoint
   * Note: We skip even if initialData is empty array - this means the etapa has no informes
   */
  useEffect(() => {
    // Skip fetch if initialData was provided (even if empty array)
    // This prevents fetching informes from other etapas
    if (initialDataProvided) {
      console.log('[useInformeJuridico] Using initialData from unified endpoint, skipping fetch. Has data:', hasInitialData)
      return
    }

    if (autoLoad && medidaId) {
      fetchInforme()
    }
  }, [medidaId, autoLoad, fetchInforme, initialDataProvided, hasInitialData])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Informe Jurídico state
    informeJuridico,
    informes,
    isLoadingInforme,
    informeError,

    // Adjuntos state
    adjuntos,
    isLoadingAdjuntos,
    adjuntosError,

    // Derived state
    hasInforme,
    canSend,
    isEnviado,
    tieneInformeOficial,
    cantidadAcuses,

    // CRUD operations
    createNewInforme,
    updateInforme,
    refetchInforme,

    // Unified create + send operation
    createAndSendInforme,

    // Adjunto operations
    uploadAdjunto,
    deleteAdjunto,
    refetchAdjuntos,

    // Send operation
    sendInforme,
  }
}
