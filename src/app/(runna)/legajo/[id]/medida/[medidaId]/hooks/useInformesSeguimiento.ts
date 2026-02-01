/**
 * Hook for managing Informes de Seguimiento state and operations (PLTM-03)
 * Provides CRUD operations, template download, and completion functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  getInformesSeguimiento,
  getInformeSeguimientoDetail,
  completarInforme,
  subirPlantilla,
  getPlantillaInfo,
  descargarPlantilla,
  getAdjuntos,
  uploadAdjunto,
  deleteAdjunto,
} from "../api/informe-seguimiento-api-service"
import { medidaKeys } from './useMedidaDetail'
import type {
  InformeSeguimiento,
  InformeSeguimientoListItem,
  InformesSeguimientoQueryParams,
  CompletarInformePayload,
  CompletarInformeResponse,
  PlantillaInfoResponse,
  InformeSeguimientoAdjunto,
} from "../types/informe-seguimiento-api"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const informeSeguimientoKeys = {
  all: ['informes-seguimiento'] as const,
  lists: () => [...informeSeguimientoKeys.all, 'list'] as const,
  list: (medidaId: number, params?: InformesSeguimientoQueryParams) =>
    [...informeSeguimientoKeys.lists(), medidaId, params] as const,
  details: () => [...informeSeguimientoKeys.all, 'detail'] as const,
  detail: (medidaId: number, informeId: number) =>
    [...informeSeguimientoKeys.details(), medidaId, informeId] as const,
  plantilla: (medidaId: number) =>
    [...informeSeguimientoKeys.all, 'plantilla', medidaId] as const,
  adjuntos: (medidaId: number, informeId: number) =>
    [...informeSeguimientoKeys.all, 'adjuntos', medidaId, informeId] as const,
}

// ============================================================================
// LIST HOOK
// ============================================================================

interface UseInformesSeguimientoOptions {
  medidaId: number
  params?: InformesSeguimientoQueryParams
  enabled?: boolean
}

/**
 * Hook to fetch list of informes de seguimiento for a medida
 */
export const useInformesSeguimiento = ({
  medidaId,
  params = {},
  enabled = true,
}: UseInformesSeguimientoOptions) => {
  return useQuery({
    queryKey: informeSeguimientoKeys.list(medidaId, params),
    queryFn: () => getInformesSeguimiento(medidaId, params),
    enabled: enabled && medidaId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// DETAIL HOOK
// ============================================================================

interface UseInformeSeguimientoDetailOptions {
  medidaId: number
  informeId: number
  enabled?: boolean
}

/**
 * Hook to fetch detail of a single informe de seguimiento
 */
export const useInformeSeguimientoDetail = ({
  medidaId,
  informeId,
  enabled = true,
}: UseInformeSeguimientoDetailOptions) => {
  return useQuery({
    queryKey: informeSeguimientoKeys.detail(medidaId, informeId),
    queryFn: () => getInformeSeguimientoDetail(medidaId, informeId),
    enabled: enabled && medidaId > 0 && informeId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// COMPLETAR INFORME MUTATION
// ============================================================================

interface UseCompletarInformeOptions {
  onSuccess?: (data: CompletarInformeResponse) => void
  onError?: (error: Error) => void
}

/**
 * Hook to complete an informe de seguimiento
 */
export const useCompletarInforme = (options?: UseCompletarInformeOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      medidaId,
      informeId,
      payload,
    }: {
      medidaId: number
      informeId: number
      payload: CompletarInformePayload
    }) => completarInforme(medidaId, informeId, payload),
    onSuccess: (data, variables) => {
      // Invalidate the list cache
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.lists(),
      })
      // Invalidate the detail cache
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.detail(variables.medidaId, variables.informeId),
      })
      // Invalidate medida detail to update estado
      queryClient.invalidateQueries({
        queryKey: medidaKeys.detail(variables.medidaId),
      })

      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al completar el informe', {
        position: 'top-center',
        autoClose: 5000,
      })
      options?.onError?.(error)
    },
  })
}

// ============================================================================
// PLANTILLA HOOKS
// ============================================================================

interface UsePlantillaInfoOptions {
  medidaId: number
  enabled?: boolean
}

/**
 * Hook to get plantilla info for a medida
 */
export const usePlantillaInfo = ({ medidaId, enabled = true }: UsePlantillaInfoOptions) => {
  return useQuery({
    queryKey: informeSeguimientoKeys.plantilla(medidaId),
    queryFn: () => getPlantillaInfo(medidaId),
    enabled: enabled && medidaId > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

interface UseSubirPlantillaOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook to upload a completed template
 */
export const useSubirPlantilla = (options?: UseSubirPlantillaOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      medidaId,
      informeId,
      file,
    }: {
      medidaId: number
      informeId: number
      file: File
    }) => subirPlantilla(medidaId, informeId, file),
    onSuccess: (_, variables) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.detail(variables.medidaId, variables.informeId),
      })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir la plantilla', {
        position: 'top-center',
        autoClose: 5000,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Helper to download plantilla and trigger browser download
 */
export const useDescargarPlantilla = () => {
  return useMutation({
    mutationFn: async ({
      medidaId,
      filename = 'plantilla_informe_seguimiento.docx',
    }: {
      medidaId: number
      filename?: string
    }) => {
      const blob = await descargarPlantilla(medidaId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return blob
    },
    onSuccess: () => {
      toast.success('Plantilla descargada exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al descargar la plantilla', {
        position: 'top-center',
        autoClose: 5000,
      })
    },
  })
}

// ============================================================================
// ADJUNTOS HOOKS
// ============================================================================

interface UseAdjuntosOptions {
  medidaId: number
  informeId: number
  enabled?: boolean
}

/**
 * Hook to fetch adjuntos of an informe de seguimiento
 */
export const useAdjuntos = ({ medidaId, informeId, enabled = true }: UseAdjuntosOptions) => {
  return useQuery({
    queryKey: informeSeguimientoKeys.adjuntos(medidaId, informeId),
    queryFn: () => getAdjuntos(medidaId, informeId),
    enabled: enabled && medidaId > 0 && informeId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

interface UseUploadAdjuntoOptions {
  onSuccess?: (adjunto: InformeSeguimientoAdjunto) => void
  onError?: (error: Error) => void
}

/**
 * Hook to upload an adjunto
 */
export const useUploadAdjunto = (options?: UseUploadAdjuntoOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      medidaId,
      informeId,
      file,
      descripcion,
    }: {
      medidaId: number
      informeId: number
      file: File
      descripcion?: string
    }) => uploadAdjunto(medidaId, informeId, file, descripcion),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.adjuntos(variables.medidaId, variables.informeId),
      })
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.lists(),
      })

      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir el adjunto', {
        position: 'top-center',
        autoClose: 5000,
      })
      options?.onError?.(error)
    },
  })
}

interface UseDeleteAdjuntoOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook to delete an adjunto
 */
export const useDeleteAdjunto = (options?: UseDeleteAdjuntoOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      medidaId,
      informeId,
      adjuntoId,
    }: {
      medidaId: number
      informeId: number
      adjuntoId: number
    }) => deleteAdjunto(medidaId, informeId, adjuntoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.adjuntos(variables.medidaId, variables.informeId),
      })
      queryClient.invalidateQueries({
        queryKey: informeSeguimientoKeys.lists(),
      })

      toast.success('Adjunto eliminado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el adjunto', {
        position: 'top-center',
        autoClose: 5000,
      })
      options?.onError?.(error)
    },
  })
}
