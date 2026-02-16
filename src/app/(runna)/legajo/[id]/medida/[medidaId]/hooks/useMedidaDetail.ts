/**
 * Custom Hook for Medida Detail
 * Uses React Query to manage medida state with automatic caching and revalidation
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedidaDetail } from '@/app/(runna)/legajo-mesa/api/medidas-api-service'
import type { MedidaDetailResponse } from '@/app/(runna)/legajo-mesa/types/medida-api'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const medidaKeys = {
    all: ['medidas'] as const,
    lists: () => [...medidaKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...medidaKeys.lists(), filters] as const,
    details: () => [...medidaKeys.all, 'detail'] as const,
    detail: (id: number) => [...medidaKeys.details(), id] as const,
}

// ============================================================================
// HOOK
// ============================================================================

interface UseMedidaDetailOptions {
    enabled?: boolean
    refetchInterval?: number | false
    staleTime?: number
}

export const useMedidaDetail = (
    medidaId: number,
    options: UseMedidaDetailOptions = {}
) => {
    const {
        enabled = true,
        refetchInterval = false,
        staleTime = 0, // Always refetch on invalidation to ensure UI reflects latest state
    } = options

    const queryResult = useQuery<MedidaDetailResponse, Error>({
        queryKey: medidaKeys.detail(medidaId),
        queryFn: () => getMedidaDetail(medidaId),
        enabled: enabled && !!medidaId,
        staleTime,
        refetchInterval,
        refetchOnWindowFocus: false, // Disable to avoid unexpected refetches
        retry: 2,
        // Ensure immediate refetch when invalidated
        refetchOnMount: 'always',
    })

    return {
        ...queryResult,
        // Expose refetch for manual triggering after state changes
        refetch: queryResult.refetch,
    }
}

/**
 * Hook to imperatively refetch medida detail
 */
export const useRefetchMedidaDetail = () => {
    const queryClient = useQueryClient()

    return (medidaId: number) => {
        queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
    }
}

/**
 * Hook to get query client for manual cache updates
 */
export const useMedidaQueryClient = () => {
    return useQueryClient()
}

