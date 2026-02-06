/**
 * Custom hook for fetching documents from the unified repository
 *
 * Uses TanStack Query for data fetching and caching
 */

import { useQuery } from '@tanstack/react-query'
import { get } from '@/app/api/apiService'
import type {
  RepositorioDocumentosResponse,
  RepositorioDocumentosParams,
} from '../types/repositorio-documentos'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches documents from the repositorio-documentos endpoint
 *
 * @param params - Query parameters (legajo_id, demanda_id, medida_id, etc.)
 * @returns Query result with documents data
 *
 * @example
 * const { data, isLoading, error } = useRepositorioDocumentos({ legajo_id: 123 })
 */
export const useRepositorioDocumentos = (params: RepositorioDocumentosParams) => {
  // Only enable the query if at least one ID is provided
  const hasValidParams = Boolean(
    params.legajo_id || params.demanda_id || params.medida_id
  )

  // Build query params, filtering out undefined values
  const queryParams: Record<string, string> = {}

  if (params.legajo_id) {
    queryParams.legajo_id = String(params.legajo_id)
  }
  if (params.demanda_id) {
    queryParams.demanda_id = String(params.demanda_id)
  }
  if (params.medida_id) {
    queryParams.medida_id = String(params.medida_id)
  }
  if (params.tipo_modelo) {
    queryParams.tipo_modelo = params.tipo_modelo
  }
  if (params.categoria) {
    queryParams.categoria = params.categoria
  }

  return useQuery({
    queryKey: ['repositorio-documentos', params],
    queryFn: () =>
      get<RepositorioDocumentosResponse>(
        'repositorio-documentos/',
        queryParams
      ),
    enabled: hasValidParams,
    staleTime: STALE_TIME,
  })
}

export default useRepositorioDocumentos
