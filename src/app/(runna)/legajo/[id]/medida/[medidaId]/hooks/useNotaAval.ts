/**
 * Hook useNotaAval
 * Custom hook for managing Nota de Aval business logic (MED-03)
 *
 * Handles:
 * - Fetching notas de aval for a medida
 * - Creating new nota de aval (aprobar/observar decisión)
 * - Permission validation (only Directors)
 * - State validation (medida must be in Estado 3: PENDIENTE_NOTA_AVAL)
 * - Loading/error states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type {
  CreateNotaAvalRequest,
  NotaAvalResponse,
  NotaAvalBasicResponse,
  CreateNotaAvalResponse,
  TNotaAvalDecision,
} from '../types/nota-aval-api'
import {
  getNotasAvalByMedida,
  getNotaAvalDetail,
  createNotaAval,
  getMostRecentNotaAval,
} from '../api/nota-aval-api-service'
import { medidaKeys } from './useMedidaDetail'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notaAvalKeys = {
  all: ['nota-aval'] as const,
  lists: () => [...notaAvalKeys.all, 'list'] as const,
  list: (medidaId: number) => [...notaAvalKeys.lists(), medidaId] as const,
  details: () => [...notaAvalKeys.all, 'detail'] as const,
  detail: (medidaId: number, notaAvalId: number) =>
    [...notaAvalKeys.details(), medidaId, notaAvalId] as const,
  recent: (medidaId: number) => [...notaAvalKeys.all, 'recent', medidaId] as const,
}

// ============================================================================
// HOOK OPTIONS INTERFACES
// ============================================================================

interface UseNotaAvalOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  /**
   * Initial data from unified etapa endpoint.
   * When provided, skips the API call and uses this data instead.
   * This optimizes performance by using data already fetched via:
   * GET /api/medidas/{id}/etapa/{tipo_etapa}/
   */
  initialData?: NotaAvalBasicResponse[]
}

interface UseCreateNotaAvalOptions {
  onSuccess?: (data: CreateNotaAvalResponse) => void
  onError?: (error: Error) => void
}

// ============================================================================
// MAIN HOOK: useNotaAval
// ============================================================================

/**
 * Hook principal para gestión de Notas de Aval
 *
 * @param medidaId ID de la medida
 * @param options Opciones de configuración (includes initialData from unified endpoint)
 * @returns Query data, mutations y utilidades
 */
export const useNotaAval = (medidaId: number, options: UseNotaAvalOptions = {}) => {
  const queryClient = useQueryClient()

  // Check if we have initial data from unified endpoint
  const hasInitialData = options.initialData !== undefined

  // Query: Get list of notas de aval
  // OPTIMIZATION: Skip API call if initialData is provided
  const {
    data: notasAval,
    isLoading: isLoadingNotasAval,
    error: notasAvalError,
    refetch: refetchNotasAval,
  } = useQuery<NotaAvalBasicResponse[], Error>({
    queryKey: notaAvalKeys.list(medidaId),
    queryFn: () => getNotasAvalByMedida(medidaId, { ordering: '-fecha_emision' }),
    // Disable query if initialData provided - we already have the data
    enabled: options.enabled !== false && !hasInitialData,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Use initialData when provided
    initialData: options.initialData,
  })

  // Query: Get most recent nota de aval
  // OPTIMIZATION: Skip API call if initialData is provided - derive from initialData
  const mostRecentFromInitial = hasInitialData && options.initialData && options.initialData.length > 0
    ? options.initialData[0] // Already sorted by -fecha_emision
    : null

  const {
    data: mostRecentNotaAval,
    isLoading: isLoadingRecentNotaAval,
    error: recentNotaAvalError,
  } = useQuery<NotaAvalBasicResponse | null, Error>({
    queryKey: notaAvalKeys.recent(medidaId),
    queryFn: () => getMostRecentNotaAval(medidaId),
    // Disable query if initialData provided
    enabled: options.enabled !== false && !hasInitialData,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: mostRecentFromInitial,
  })

  // Mutation: Create nota de aval
  const createMutation = useMutation<
    CreateNotaAvalResponse,
    Error,
    CreateNotaAvalRequest
  >({
    mutationFn: (data: CreateNotaAvalRequest) => createNotaAval(medidaId, data),
    onSuccess: async (data) => {
      // Invalidate queries to refetch updated data
      await queryClient.invalidateQueries({
        queryKey: notaAvalKeys.list(medidaId),
        refetchType: 'active'
      })
      await queryClient.invalidateQueries({
        queryKey: notaAvalKeys.recent(medidaId),
        refetchType: 'active'
      })
      // Also invalidate medida detail to update estado immediately
      await queryClient.invalidateQueries({
        queryKey: medidaKeys.detail(medidaId),
        refetchType: 'active'
      })

      // Show success toast
      const message =
        data.decision === 'APROBADO'
          ? 'Aprobación emitida exitosamente. Medida avanzó a Informe Jurídico.'
          : 'Intervención observada exitosamente. Equipo Técnico ha sido notificado.'

      toast.success(message, {
        position: 'top-center',
        autoClose: 5000,
      })
    },
    onError: (error: any) => {
      // Extract error message
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Error al emitir Aprobación'

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 7000,
      })

      console.error('Error creating nota de aval:', error)
    },
  })

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Check if medida has any notas de aval
   */
  const hasNotasAval = notasAval && notasAval.length > 0

  /**
   * Get count of notas de aval (for observaciones múltiples tracking)
   */
  const notasAvalCount = notasAval?.length || 0

  /**
   * Check if the most recent nota de aval was aprobada
   */
  const wasAprobado = mostRecentNotaAval?.fue_aprobado || false

  /**
   * Check if the most recent nota de aval was observada
   */
  const wasObservado = mostRecentNotaAval?.fue_observado || false

  /**
   * Create nota de aval with decision APROBADO
   */
  const aprobar = (comentarios?: string) => {
    return createMutation.mutateAsync({
      medida_id: medidaId,
      decision: 'APROBADO',
      comentarios: comentarios || null,
    })
  }

  /**
   * Create nota de aval with decision OBSERVADO
   */
  const observar = (comentarios: string) => {
    if (!comentarios || comentarios.trim().length < 10) {
      toast.error('Los comentarios son obligatorios al observar (mínimo 10 caracteres)', {
        position: 'top-center',
      })
      return Promise.reject(
        new Error('Los comentarios son obligatorios al observar (mínimo 10 caracteres)')
      )
    }

    return createMutation.mutateAsync({
      medida_id: medidaId,
      decision: 'OBSERVADO',
      comentarios,
    })
  }

  /**
   * Create nota de aval with generic decision
   */
  const emitirDecision = (decision: TNotaAvalDecision, comentarios?: string) => {
    if (decision === 'OBSERVADO') {
      return observar(comentarios || '')
    } else {
      return aprobar(comentarios)
    }
  }

  // ============================================================================
  // RETURN HOOK DATA
  // ============================================================================

  return {
    // Query data
    notasAval,
    mostRecentNotaAval,

    // Loading states
    isLoadingNotasAval,
    isLoadingRecentNotaAval,
    isLoading: isLoadingNotasAval || isLoadingRecentNotaAval,

    // Error states
    notasAvalError,
    recentNotaAvalError,
    error: notasAvalError || recentNotaAvalError,

    // Refetch functions
    refetchNotasAval,

    // Mutation
    createMutation,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Utility values
    hasNotasAval,
    notasAvalCount,
    wasAprobado,
    wasObservado,

    // Actions
    aprobar,
    observar,
    emitirDecision,
  }
}

// ============================================================================
// HOOK: useNotaAvalDetail
// ============================================================================

/**
 * Hook para obtener detalle de una nota de aval específica
 *
 * @param medidaId ID de la medida
 * @param notaAvalId ID de la nota de aval
 * @param options Opciones de configuración
 * @returns Query data de la nota de aval
 */
export const useNotaAvalDetail = (
  medidaId: number,
  notaAvalId: number,
  options: UseNotaAvalOptions = {}
) => {
  const {
    data: notaAval,
    isLoading,
    error,
    refetch,
  } = useQuery<NotaAvalResponse, Error>({
    queryKey: notaAvalKeys.detail(medidaId, notaAvalId),
    queryFn: () => getNotaAvalDetail(medidaId, notaAvalId),
    enabled: options.enabled !== false && !!notaAvalId,
    refetchOnMount: options.refetchOnMount ?? false,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    notaAval,
    isLoading,
    error,
    refetch,
  }
}

// ============================================================================
// HOOK: useCreateNotaAval
// ============================================================================

/**
 * Hook standalone para crear nota de aval (si solo se necesita la mutation)
 *
 * @param medidaId ID de la medida
 * @param options Opciones de callbacks
 * @returns Mutation para crear nota de aval
 */
export const useCreateNotaAval = (
  medidaId: number,
  options: UseCreateNotaAvalOptions = {}
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<CreateNotaAvalResponse, Error, CreateNotaAvalRequest>({
    mutationFn: (data: CreateNotaAvalRequest) => createNotaAval(medidaId, data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notaAvalKeys.list(medidaId) })
      queryClient.invalidateQueries({ queryKey: notaAvalKeys.recent(medidaId) })
      queryClient.invalidateQueries({ queryKey: ['medidas', 'detail', medidaId] })

      // Call custom onSuccess if provided
      options.onSuccess?.(data)

      // Show toast
      const message =
        data.decision === 'APROBADO'
          ? 'Aprobación emitida exitosamente'
          : 'Intervención observada exitosamente'

      toast.success(message, {
        position: 'top-center',
        autoClose: 5000,
      })
    },
    onError: (error: any) => {
      // Call custom onError if provided
      options.onError?.(error)

      // Show toast
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Error al emitir Aprobación'

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 7000,
      })

      console.error('Error creating nota de aval:', error)
    },
  })

  return mutation
}
