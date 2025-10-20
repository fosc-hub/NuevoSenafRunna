/**
 * Hook for managing Informe Jurídico state and operations (MED-04)
 * Provides CRUD operations, adjunto management, and send functionality
 */

import { useState, useEffect, useCallback } from "react"
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
} from "../api/informe-juridico-api-service"
import type {
  InformeJuridicoResponse,
  InformeJuridicoBasicResponse,
  CreateInformeJuridicoRequest,
  AdjuntoInformeJuridico,
  TipoAdjuntoInformeJuridico,
  EnviarInformeJuridicoResponse,
} from "../types/informe-juridico-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface UseInformeJuridicoOptions {
  medidaId: number
  autoLoad?: boolean // Auto-load on mount (default: true)
  loadAdjuntos?: boolean // Auto-load adjuntos with informe (default: true)
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
  const { medidaId, autoLoad = true, loadAdjuntos = true } = options

  // ============================================================================
  // STATE
  // ============================================================================

  // Informe Jurídico state
  const [informeJuridico, setInformeJuridico] = useState<InformeJuridicoResponse | null>(null)
  const [informes, setInformes] = useState<InformeJuridicoBasicResponse[]>([])
  const [isLoadingInforme, setIsLoadingInforme] = useState(false)
  const [informeError, setInformeError] = useState<string | null>(null)

  // Adjuntos state
  const [adjuntos, setAdjuntos] = useState<AdjuntoInformeJuridico[]>([])
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

        // Refetch to get complete data
        await fetchInforme()

        return newInforme
      } catch (error: any) {
        console.error("Error creating informe jurídico:", error)
        const errorMsg = error.message || "Error al crear informe jurídico"
        setInformeError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, fetchInforme]
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

        // Refetch to get complete data
        await fetchInforme()

        return updatedInforme
      } catch (error: any) {
        console.error("Error updating informe jurídico:", error)
        const errorMsg = error.message || "Error al actualizar informe jurídico"
        setInformeError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoadingInforme(false)
      }
    },
    [medidaId, informeJuridico, fetchInforme]
  )

  /**
   * Refetch informe jurídico
   */
  const refetchInforme = useCallback(async () => {
    await fetchInforme()
  }, [fetchInforme])

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

      // Refetch to update estado
      await fetchInforme()

      return response
    } catch (error: any) {
      console.error("Error enviando informe jurídico:", error)
      const errorMsg = error.message || "Error al enviar informe jurídico"
      setInformeError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoadingInforme(false)
    }
  }, [medidaId, canSend, fetchInforme])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Auto-load on mount if enabled
   */
  useEffect(() => {
    if (autoLoad && medidaId) {
      fetchInforme()
    }
  }, [medidaId, autoLoad, fetchInforme])

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

    // Adjunto operations
    uploadAdjunto,
    deleteAdjunto,
    refetchAdjuntos,

    // Send operation
    sendInforme,
  }
}
