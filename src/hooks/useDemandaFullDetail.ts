/**
 * Shared hook for fetching demanda full-detail data
 * Centralizes query key and caching strategy to eliminate duplicate requests
 */

import { useApiQuery } from '@/hooks/useApiQuery'

export interface UseDemandaFullDetailOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

/**
 * Fetch complete demanda data from full-detail endpoint
 * Uses consistent query key across all components to enable cache sharing
 *
 * @param demandaId - The demanda ID to fetch
 * @param options - Query configuration options
 * @returns TanStack Query result with demanda data
 *
 * @example
 * const { data: demandaDetail, isLoading } = useDemandaFullDetail(demandaId)
 */
export const useDemandaFullDetail = (
  demandaId: number | undefined | null,
  options: UseDemandaFullDetailOptions = {}
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes - consider data fresh
    cacheTime = 10 * 60 * 1000, // 10 minutes - keep in cache
  } = options

  return useApiQuery<any>(
    `registro-demanda-form/${demandaId}/full-detail/`,
    undefined,
    {
      enabled: !!demandaId && enabled,
      staleTime,
      cacheTime,
      // Prevent refetch on window focus for this heavy endpoint
      refetchOnWindowFocus: false,
    }
  )
}
