/**
 * Hook useEtapaDetail
 * Custom hook for fetching etapa detail with all documents using the unified endpoint
 *
 * Benefits:
 * - Single API call fetches all documents (intervenciones, notas_aval, informes_juridicos, ratificaciones)
 * - Better performance (1 call vs 4 separate calls)
 * - Documents are properly filtered by etapa
 * - No cross-contamination between tabs
 *
 * Replaces separate calls to:
 * - /api/medidas/{id}/nota-aval/?ordering=-fecha_emision&limit=1
 * - /api/medidas/{id}/informe-juridico/?ordering=-fecha_creacion
 * - /api/medidas/{id}/ratificacion/
 * - /api/medidas/{id}/intervenciones/
 *
 * With single call to:
 * - /api/medidas/{id}/etapa/{tipo_etapa}/
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TipoEtapa } from '../types/estado-etapa'
import type { EtapaDetailResponse, EtapaDocumentos } from '../api/etapa-detail-api-service'
import { getEtapaDetail } from '../api/etapa-detail-api-service'
import type { IntervencionResponse } from '../types/intervencion-api'
import type { NotaAvalBasicResponse } from '../types/nota-aval-api'
import type { InformeJuridicoBasicResponse } from '../types/informe-juridico-api'
import type { RatificacionJudicial } from '../types/ratificacion-judicial-api'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const etapaDetailKeys = {
  all: ['etapa-detail'] as const,
  lists: () => [...etapaDetailKeys.all, 'list'] as const,
  byMedida: (medidaId: number) => [...etapaDetailKeys.lists(), medidaId] as const,
  detail: (medidaId: number, tipoEtapa: TipoEtapa) =>
    [...etapaDetailKeys.byMedida(medidaId), tipoEtapa] as const,
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseEtapaDetailOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

interface UseEtapaDetailReturn {
  // Raw data
  etapaDetail: EtapaDetailResponse | null
  documentos: EtapaDocumentos | null

  // Loading states
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null

  // Etapa info
  etapaId: number | null
  tipoEtapa: TipoEtapa | null
  estadoActual: EtapaDetailResponse['etapa']['estado_actual'] | null
  isActiva: boolean
  fechaInicio: string | null
  fechaFin: string | null

  // Documents arrays (typed)
  intervenciones: IntervencionResponse[]
  notasAval: NotaAvalBasicResponse[]
  informesJuridicos: InformeJuridicoBasicResponse[]
  ratificaciones: RatificacionJudicial[]

  // Document helpers
  hasIntervenciones: boolean
  hasNotasAval: boolean
  hasInformesJuridicos: boolean
  hasRatificaciones: boolean
  totalDocuments: number

  // Latest document getters (sorted by fecha)
  latestIntervencion: IntervencionResponse | null
  latestNotaAval: NotaAvalBasicResponse | null
  latestInformeJuridico: InformeJuridicoBasicResponse | null
  latestRatificacion: RatificacionJudicial | null

  // Actions
  refetch: () => Promise<void>
  invalidate: () => Promise<void>
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook principal para obtener detalle de etapa con todos sus documentos
 *
 * Uses unified endpoint: GET /api/medidas/{id}/etapa/{tipo_etapa}/
 *
 * @param medidaId ID de la medida
 * @param tipoEtapa Tipo de etapa (APERTURA, INNOVACION, PRORROGA, CESE, etc.)
 * @param options Opciones de configuración
 * @returns Data, loading states, and document helpers
 */
export const useEtapaDetail = (
  medidaId: number,
  tipoEtapa: TipoEtapa,
  options: UseEtapaDetailOptions = {}
): UseEtapaDetailReturn => {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    staleTime = 2 * 60 * 1000, // 2 minutes
  } = options

  const queryClient = useQueryClient()

  // ============================================================================
  // QUERY
  // ============================================================================

  const {
    data: etapaDetail,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery<EtapaDetailResponse | null, Error>({
    queryKey: etapaDetailKeys.detail(medidaId, tipoEtapa),
    queryFn: () => getEtapaDetail(medidaId, tipoEtapa),
    enabled: enabled && !!medidaId && !!tipoEtapa,
    refetchOnMount,
    refetchOnWindowFocus,
    staleTime,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (etapa doesn't exist)
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
  })

  // ============================================================================
  // EXTRACTED DATA
  // ============================================================================

  const documentos = etapaDetail?.etapa.documentos ?? null
  const etapaInfo = etapaDetail?.etapa ?? null

  // Document arrays with null safety
  const intervenciones = documentos?.intervenciones ?? []
  const notasAval = documentos?.notas_aval ?? []
  const informesJuridicos = documentos?.informes_juridicos ?? []
  const ratificaciones = documentos?.ratificaciones ?? []

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Document presence checks
  const hasIntervenciones = intervenciones.length > 0
  const hasNotasAval = notasAval.length > 0
  const hasInformesJuridicos = informesJuridicos.length > 0
  const hasRatificaciones = ratificaciones.length > 0
  const totalDocuments =
    intervenciones.length +
    notasAval.length +
    informesJuridicos.length +
    ratificaciones.length

  // Latest documents (sorted by date descending)
  const latestIntervencion = hasIntervenciones
    ? [...intervenciones].sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
      )[0]
    : null

  const latestNotaAval = hasNotasAval
    ? [...notasAval].sort(
        (a, b) =>
          new Date(b.fecha_emision).getTime() -
          new Date(a.fecha_emision).getTime()
      )[0]
    : null

  const latestInformeJuridico = hasInformesJuridicos
    ? [...informesJuridicos].sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
      )[0]
    : null

  const latestRatificacion = hasRatificaciones
    ? [...ratificaciones].sort(
        (a, b) =>
          new Date(b.fecha_registro).getTime() -
          new Date(a.fecha_registro).getTime()
      )[0]
    : null

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refetch = async () => {
    await queryRefetch()
  }

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: etapaDetailKeys.detail(medidaId, tipoEtapa),
      refetchType: 'active',
    })
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Raw data
    etapaDetail: etapaDetail ?? null,
    documentos,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error: error ?? null,

    // Etapa info
    etapaId: etapaInfo?.id ?? null,
    tipoEtapa: etapaInfo?.tipo_etapa ?? null,
    estadoActual: etapaInfo?.estado_actual ?? null,
    isActiva: etapaInfo?.activa ?? false,
    fechaInicio: etapaInfo?.fecha_inicio ?? null,
    fechaFin: etapaInfo?.fecha_fin ?? null,

    // Documents arrays (typed)
    intervenciones,
    notasAval,
    informesJuridicos,
    ratificaciones,

    // Document helpers
    hasIntervenciones,
    hasNotasAval,
    hasInformesJuridicos,
    hasRatificaciones,
    totalDocuments,

    // Latest document getters
    latestIntervencion,
    latestNotaAval,
    latestInformeJuridico,
    latestRatificacion,

    // Actions
    refetch,
    invalidate,
  }
}

// ============================================================================
// CONVENIENCE HOOKS FOR SPECIFIC ETAPA TYPES
// ============================================================================

/**
 * Hook for Apertura etapa detail
 */
export const useAperturaDetail = (
  medidaId: number,
  options: UseEtapaDetailOptions = {}
) => {
  return useEtapaDetail(medidaId, 'APERTURA', options)
}

/**
 * Hook for Innovación etapa detail
 */
export const useInnovacionDetail = (
  medidaId: number,
  options: UseEtapaDetailOptions = {}
) => {
  return useEtapaDetail(medidaId, 'INNOVACION', options)
}

/**
 * Hook for Prórroga etapa detail
 */
export const useProrrogaDetail = (
  medidaId: number,
  options: UseEtapaDetailOptions = {}
) => {
  return useEtapaDetail(medidaId, 'PRORROGA', options)
}

/**
 * Hook for Cese etapa detail
 */
export const useCeseDetail = (
  medidaId: number,
  options: UseEtapaDetailOptions = {}
) => {
  return useEtapaDetail(medidaId, 'CESE', options)
}

// ============================================================================
// HOOK FOR INVALIDATING ALL ETAPA QUERIES
// ============================================================================

/**
 * Hook to invalidate all etapa detail queries for a medida
 * Useful after mutations that affect multiple document types
 */
export const useInvalidateEtapaQueries = () => {
  const queryClient = useQueryClient()

  return async (medidaId: number, tipoEtapa?: TipoEtapa) => {
    if (tipoEtapa) {
      // Invalidate specific etapa
      await queryClient.invalidateQueries({
        queryKey: etapaDetailKeys.detail(medidaId, tipoEtapa),
        refetchType: 'active',
      })
    } else {
      // Invalidate all etapas for this medida
      await queryClient.invalidateQueries({
        queryKey: etapaDetailKeys.byMedida(medidaId),
        refetchType: 'active',
      })
    }
  }
}

export default useEtapaDetail
