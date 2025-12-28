/**
 * Generic API Query Hook
 *
 * Replaces manual useState + useEffect patterns with TanStack Query.
 * Provides automatic caching, retry logic, and loading state management.
 *
 * @example
 * // Simple usage
 * const { data, isLoading, error } = useApiQuery<User[]>('users/')
 *
 * // With query parameters
 * const { data, isLoading } = useApiQuery<Legajo[]>('legajos/', { estado: 'activo' })
 *
 * // With options
 * const { data } = useApiQuery<Demanda>('demanda/', {}, {
 *   enabled: !!demandaId,
 *   staleTime: 10 * 60 * 1000,
 * })
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query'
import { get } from '@/app/api/apiService'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for useApiQuery hook
 */
export interface UseApiQueryOptions<TData = unknown, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  /**
   * Whether the query should run. Useful for conditional fetching.
   * @default true
   */
  enabled?: boolean

  /**
   * Time in milliseconds before data is considered stale
   * @default 5 * 60 * 1000 (5 minutes)
   */
  staleTime?: number

  /**
   * Interval in milliseconds for automatic refetching
   * @default false (no automatic refetching)
   */
  refetchInterval?: number | false

  /**
   * Number of retry attempts for failed requests
   * @default 2
   */
  retry?: number

  /**
   * Whether to refetch when window regains focus
   * @default false
   */
  refetchOnWindowFocus?: boolean
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Generic hook for API GET requests using TanStack Query
 *
 * @param endpoint - API endpoint (e.g., 'users/', 'demanda/')
 * @param params - Optional query parameters
 * @param options - TanStack Query options
 * @returns UseQueryResult with data, isLoading, error, etc.
 */
export const useApiQuery = <TData = unknown, TError = Error>(
  endpoint: string,
  params?: Record<string, any>,
  options: UseApiQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    refetchInterval = false,
    retry = 2,
    refetchOnWindowFocus = false,
    ...restOptions
  } = options

  // Build query key from endpoint and params
  const queryKey = params
    ? [endpoint, params] as const
    : [endpoint] as const

  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => get<TData>(endpoint, params),
    enabled,
    staleTime,
    refetchInterval,
    retry,
    refetchOnWindowFocus,
    ...restOptions,
  })
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for fetching catalog/dropdown data with longer cache time
 *
 * @example
 * const { data: juzgados } = useCatalogData<Juzgado[]>('juzgados/')
 */
export const useCatalogData = <TData = unknown>(
  endpoint: string,
  options: UseApiQueryOptions<TData> = {}
): UseQueryResult<TData> => {
  return useApiQuery<TData>(endpoint, undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes for catalogs
    ...options,
  })
}

/**
 * Hook for conditional data fetching (e.g., modal/dialog data)
 *
 * @example
 * const { data } = useConditionalData<User[]>('users/', isDialogOpen)
 */
export const useConditionalData = <TData = unknown>(
  endpoint: string,
  enabled: boolean,
  params?: Record<string, any>,
  options: UseApiQueryOptions<TData> = {}
): UseQueryResult<TData> => {
  return useApiQuery<TData>(endpoint, params, {
    enabled,
    ...options,
  })
}
