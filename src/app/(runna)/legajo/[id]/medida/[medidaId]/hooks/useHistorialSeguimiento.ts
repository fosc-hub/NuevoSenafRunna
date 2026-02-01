/**
 * Custom Hooks for Historial de Seguimiento (PLTM-04)
 * Uses React Query to manage historial state with automatic caching and revalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHistorialSeguimiento,
  getHistorialEventoDetail,
  getHistorialTipos,
  getHistorialResumen,
  getTrazabilidadEtapas,
  getTrazabilidadCompacta,
  exportarHistorialSeguimiento,
  exportarTrazabilidad,
  downloadCsvBlob,
} from '../api/historial-seguimiento-api-service'
import type {
  HistorialSeguimientoResponse,
  HistorialEventoItem,
  HistorialTiposResponse,
  HistorialResumenResponse,
  HistorialSeguimientoQueryParams,
  TrazabilidadEtapasResponse,
  TrazabilidadCompactaResponse,
  TrazabilidadQueryParams,
} from '../types/historial-seguimiento-api'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const historialKeys = {
  all: ['historial-seguimiento'] as const,

  // Historial lists
  lists: () => [...historialKeys.all, 'list'] as const,
  list: (medidaId: number, filters?: HistorialSeguimientoQueryParams) =>
    [...historialKeys.lists(), medidaId, filters] as const,

  // Historial detail
  details: () => [...historialKeys.all, 'detail'] as const,
  detail: (medidaId: number, eventoId: number) =>
    [...historialKeys.details(), medidaId, eventoId] as const,

  // Tipos catalog
  tipos: (medidaId: number) =>
    [...historialKeys.all, 'tipos', medidaId] as const,

  // Resumen
  resumen: (medidaId: number) =>
    [...historialKeys.all, 'resumen', medidaId] as const,

  // Trazabilidad
  trazabilidad: (medidaId: number, params?: TrazabilidadQueryParams) =>
    [...historialKeys.all, 'trazabilidad', medidaId, params] as const,
  trazabilidadCompacta: (medidaId: number) =>
    [...historialKeys.all, 'trazabilidad-compacta', medidaId] as const,
}

// ============================================================================
// HISTORIAL HOOKS
// ============================================================================

interface UseHistorialSeguimientoOptions {
  medidaId: number
  params?: HistorialSeguimientoQueryParams
  enabled?: boolean
}

/**
 * Hook to fetch paginated historial de seguimiento
 */
export const useHistorialSeguimiento = ({
  medidaId,
  params = {},
  enabled = true,
}: UseHistorialSeguimientoOptions) => {
  return useQuery<HistorialSeguimientoResponse, Error>({
    queryKey: historialKeys.list(medidaId, params),
    queryFn: () => getHistorialSeguimiento(medidaId, params),
    enabled: enabled && !!medidaId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

/**
 * Hook to fetch historial evento detail
 */
export const useHistorialEventoDetail = (
  medidaId: number,
  eventoId: number,
  enabled = true
) => {
  return useQuery<HistorialEventoItem, Error>({
    queryKey: historialKeys.detail(medidaId, eventoId),
    queryFn: () => getHistorialEventoDetail(medidaId, eventoId),
    enabled: enabled && !!medidaId && !!eventoId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch historial tipos (catalog)
 * Long stale time since types rarely change
 */
export const useHistorialTipos = (medidaId: number, enabled = true) => {
  return useQuery<HistorialTiposResponse, Error>({
    queryKey: historialKeys.tipos(medidaId),
    queryFn: () => getHistorialTipos(medidaId),
    enabled: enabled && !!medidaId,
    staleTime: 1000 * 60 * 30, // 30 minutes - catalog data rarely changes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch historial resumen
 */
export const useHistorialResumen = (medidaId: number, enabled = true) => {
  return useQuery<HistorialResumenResponse, Error>({
    queryKey: historialKeys.resumen(medidaId),
    queryFn: () => getHistorialResumen(medidaId),
    enabled: enabled && !!medidaId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// TRAZABILIDAD HOOKS
// ============================================================================

interface UseTrazabilidadEtapasOptions {
  medidaId: number
  params?: TrazabilidadQueryParams
  enabled?: boolean
}

/**
 * Hook to fetch full trazabilidad de etapas
 */
export const useTrazabilidadEtapas = ({
  medidaId,
  params = {},
  enabled = true,
}: UseTrazabilidadEtapasOptions) => {
  return useQuery<TrazabilidadEtapasResponse, Error>({
    queryKey: historialKeys.trazabilidad(medidaId, params),
    queryFn: () => getTrazabilidadEtapas(medidaId, params),
    enabled: enabled && !!medidaId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

/**
 * Hook to fetch compact trazabilidad for UI stepper
 */
export const useTrazabilidadCompacta = (medidaId: number, enabled = true) => {
  return useQuery<TrazabilidadCompactaResponse, Error>({
    queryKey: historialKeys.trazabilidadCompacta(medidaId),
    queryFn: () => getTrazabilidadCompacta(medidaId),
    enabled: enabled && !!medidaId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// ============================================================================
// EXPORT MUTATIONS
// ============================================================================

interface ExportHistorialParams {
  medidaId: number
  numeroMedida: string
  params?: HistorialSeguimientoQueryParams
}

/**
 * Hook to export historial to CSV
 */
export const useExportHistorial = () => {
  return useMutation<void, Error, ExportHistorialParams>({
    mutationFn: async ({ medidaId, numeroMedida, params = {} }) => {
      const blob = await exportarHistorialSeguimiento(medidaId, params)
      const filename = `historial_seguimiento_${numeroMedida.replace(/[/\\]/g, '_')}.csv`
      downloadCsvBlob(blob, filename)
    },
  })
}

interface ExportTrazabilidadParams {
  medidaId: number
  numeroMedida: string
}

/**
 * Hook to export trazabilidad to CSV
 */
export const useExportTrazabilidad = () => {
  return useMutation<void, Error, ExportTrazabilidadParams>({
    mutationFn: async ({ medidaId, numeroMedida }) => {
      const blob = await exportarTrazabilidad(medidaId)
      const filename = `trazabilidad_etapas_${numeroMedida.replace(/[/\\]/g, '_')}.csv`
      downloadCsvBlob(blob, filename)
    },
  })
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Hook to invalidate historial cache
 */
export const useInvalidateHistorial = () => {
  const queryClient = useQueryClient()

  const invalidateMedida = (medidaId: number) => {
    queryClient.invalidateQueries({
      queryKey: historialKeys.list(medidaId),
    })
    queryClient.invalidateQueries({
      queryKey: historialKeys.resumen(medidaId),
    })
    queryClient.invalidateQueries({
      queryKey: historialKeys.trazabilidad(medidaId),
    })
    queryClient.invalidateQueries({
      queryKey: historialKeys.trazabilidadCompacta(medidaId),
    })
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: historialKeys.all,
    })
  }

  return {
    invalidateMedida,
    invalidateAll,
  }
}

/**
 * Hook to prefetch historial data
 */
export const usePrefetchHistorial = () => {
  const queryClient = useQueryClient()

  const prefetchHistorial = async (
    medidaId: number,
    params?: HistorialSeguimientoQueryParams
  ) => {
    await queryClient.prefetchQuery({
      queryKey: historialKeys.list(medidaId, params),
      queryFn: () => getHistorialSeguimiento(medidaId, params),
      staleTime: 1000 * 60 * 2,
    })
  }

  const prefetchTrazabilidad = async (medidaId: number) => {
    await queryClient.prefetchQuery({
      queryKey: historialKeys.trazabilidadCompacta(medidaId),
      queryFn: () => getTrazabilidadCompacta(medidaId),
      staleTime: 1000 * 60 * 2,
    })
  }

  return {
    prefetchHistorial,
    prefetchTrazabilidad,
  }
}
