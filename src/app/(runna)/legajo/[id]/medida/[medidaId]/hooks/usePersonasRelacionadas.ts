/**
 * React Query hook for Personas Relacionadas (TPersonaVinculo)
 *
 * Provides optimized data fetching and mutations for managing
 * permanent family relationships of NNyA.
 *
 * Based on API documentation: claudedocs/API_PERSONAS_RELACIONADAS_FRONTEND.md
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  fetchPersonasRelacionadas,
  fetchTiposVinculoPersona,
  fetchNNyAData,
  addPersonaRelacionadaExistente,
  addPersonaRelacionadaNueva,
  updatePersonaRelacionada,
  desvincularPersonaRelacionada,
  batchUpdatePersonasRelacionadas,
  searchPersonasForRelacionada,
  type NNyADataResponse,
} from "../api/personas-relacionadas-api-service"
import type {
  PersonaVinculo,
  PersonaRelacionadaCreateExistente,
  PersonaRelacionadaCreateNueva,
  PersonaRelacionadaUpdate,
  PersonaRelacionadaRequest,
  TipoVinculoPersona,
} from "../types/personas-relacionadas-api"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const PERSONAS_RELACIONADAS_KEYS = {
  all: ["personas-relacionadas"] as const,
  byLegajo: (legajoId: number) => [...PERSONAS_RELACIONADAS_KEYS.all, legajoId] as const,
  nnyaData: (legajoId: number) => ["nnya-data", legajoId] as const,
  tiposVinculo: ["tipos-vinculo-persona"] as const,
  searchPersonas: (term: string) => ["search-personas-relacionadas", term] as const,
}

// ============================================================================
// FETCH HOOKS
// ============================================================================

/**
 * Hook to fetch personas relacionadas for a legajo
 * @param legajoId Legajo ID
 * @param options Query options
 * @returns Query result with personas relacionadas
 */
export const usePersonasRelacionadas = (
  legajoId: number | null | undefined,
  options?: Omit<UseQueryOptions<PersonaVinculo[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId!),
    queryFn: () => {
      if (!legajoId) throw new Error("Legajo ID is required")
      return fetchPersonasRelacionadas(legajoId)
    },
    enabled: !!legajoId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch complete NNyA data including personas relacionadas
 * @param legajoId Legajo ID
 * @param options Query options
 * @returns Query result with NNyA data
 */
export const useNNyAData = (
  legajoId: number | null | undefined,
  options?: Omit<UseQueryOptions<NNyADataResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId!),
    queryFn: () => {
      if (!legajoId) throw new Error("Legajo ID is required")
      return fetchNNyAData(legajoId)
    },
    enabled: !!legajoId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch tipos de vinculo for personas
 * @param options Query options
 * @returns Query result with tipos vinculo
 */
export const useTiposVinculoPersona = (
  options?: Omit<UseQueryOptions<TipoVinculoPersona[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: PERSONAS_RELACIONADAS_KEYS.tiposVinculo,
    queryFn: fetchTiposVinculoPersona,
    staleTime: 60 * 60 * 1000, // 1 hour (catalog data changes rarely)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    ...options,
  })
}

/**
 * Hook to search personas for adding as relacionada
 * @param searchTerm Search term
 * @param options Query options
 * @returns Query result with matching personas
 */
export const useSearchPersonasRelacionadas = (
  searchTerm: string,
  options?: Omit<UseQueryOptions<any[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: PERSONAS_RELACIONADAS_KEYS.searchPersonas(searchTerm),
    queryFn: () => searchPersonasForRelacionada(searchTerm),
    enabled: searchTerm.trim().length >= 2 && (options?.enabled ?? true),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to add a persona relacionada with an existing persona
 */
export const useAddPersonaRelacionadaExistente = (legajoId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PersonaRelacionadaCreateExistente) =>
      addPersonaRelacionadaExistente(legajoId, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId),
      })
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId),
      })
      toast.success("Persona relacionada agregada exitosamente")
    },
    onError: (error: any) => {
      console.error("[useAddPersonaRelacionadaExistente] Error:", error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Error al agregar persona relacionada"
      toast.error(message)
    },
  })
}

/**
 * Hook to add a persona relacionada by creating a new persona
 */
export const useAddPersonaRelacionadaNueva = (legajoId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PersonaRelacionadaCreateNueva) =>
      addPersonaRelacionadaNueva(legajoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId),
      })
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId),
      })
      toast.success("Persona relacionada creada y vinculada exitosamente")
    },
    onError: (error: any) => {
      console.error("[useAddPersonaRelacionadaNueva] Error:", error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Error al crear persona relacionada"
      toast.error(message)
    },
  })
}

/**
 * Hook to update an existing persona relacionada
 */
export const useUpdatePersonaRelacionada = (legajoId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PersonaRelacionadaUpdate) =>
      updatePersonaRelacionada(legajoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId),
      })
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId),
      })
      toast.success("Persona relacionada actualizada exitosamente")
    },
    onError: (error: any) => {
      console.error("[useUpdatePersonaRelacionada] Error:", error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Error al actualizar persona relacionada"
      toast.error(message)
    },
  })
}

/**
 * Hook to desvincular (soft delete) a persona relacionada
 */
export const useDesvincularPersonaRelacionada = (legajoId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ vinculoId, justificacion }: { vinculoId: number; justificacion: string }) =>
      desvincularPersonaRelacionada(legajoId, vinculoId, justificacion),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId),
      })
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId),
      })
      toast.success("Persona desvinculada exitosamente")
    },
    onError: (error: any) => {
      console.error("[useDesvincularPersonaRelacionada] Error:", error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Error al desvincular persona"
      toast.error(message)
    },
  })
}

/**
 * Hook to perform batch operations on personas relacionadas
 */
export const useBatchUpdatePersonasRelacionadas = (legajoId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (operations: PersonaRelacionadaRequest[]) =>
      batchUpdatePersonasRelacionadas(legajoId, operations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.byLegajo(legajoId),
      })
      queryClient.invalidateQueries({
        queryKey: PERSONAS_RELACIONADAS_KEYS.nnyaData(legajoId),
      })
      toast.success("Personas relacionadas actualizadas exitosamente")
    },
    onError: (error: any) => {
      console.error("[useBatchUpdatePersonasRelacionadas] Error:", error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Error al actualizar personas relacionadas"
      toast.error(message)
    },
  })
}

// ============================================================================
// COMBINED HOOK
// ============================================================================

/**
 * Combined hook for complete personas relacionadas management
 * Provides all data and mutations in a single hook
 *
 * @param legajoId Legajo ID
 * @param options Optional configuration
 * @returns Data, mutations, and loading states
 *
 * @example
 * ```tsx
 * const {
 *   personasRelacionadas,
 *   tiposVinculo,
 *   isLoading,
 *   addExistente,
 *   addNueva,
 *   update,
 *   desvincular,
 * } = usePersonasRelacionadasManager(legajoId)
 * ```
 */
export const usePersonasRelacionadasManager = (
  legajoId: number | null | undefined,
  options?: {
    enabled?: boolean
    onSuccess?: () => void
    onError?: (error: any) => void
  }
) => {
  const enabled = !!legajoId && (options?.enabled ?? true)

  // Queries
  const personasRelacionadasQuery = usePersonasRelacionadas(legajoId, { enabled })
  const tiposVinculoQuery = useTiposVinculoPersona({ enabled })

  // Mutations (only create if we have a valid legajoId)
  const addExistenteMutation = useAddPersonaRelacionadaExistente(legajoId || 0)
  const addNuevaMutation = useAddPersonaRelacionadaNueva(legajoId || 0)
  const updateMutation = useUpdatePersonaRelacionada(legajoId || 0)
  const desvincularMutation = useDesvincularPersonaRelacionada(legajoId || 0)
  const batchMutation = useBatchUpdatePersonasRelacionadas(legajoId || 0)

  // Computed states
  const isLoading = personasRelacionadasQuery.isLoading || tiposVinculoQuery.isLoading
  const isMutating =
    addExistenteMutation.isPending ||
    addNuevaMutation.isPending ||
    updateMutation.isPending ||
    desvincularMutation.isPending ||
    batchMutation.isPending

  // Filter only active relationships
  const personasRelacionadasActivas = (personasRelacionadasQuery.data || []).filter(
    (p) => p.activo
  )

  // Find referente principal
  const referentePrincipal = personasRelacionadasActivas.find((p) => p.es_referente_principal)

  return {
    // Data
    personasRelacionadas: personasRelacionadasQuery.data || [],
    personasRelacionadasActivas,
    referentePrincipal,
    tiposVinculo: tiposVinculoQuery.data || [],

    // Loading states
    isLoading,
    isMutating,
    isLoadingPersonas: personasRelacionadasQuery.isLoading,
    isLoadingTiposVinculo: tiposVinculoQuery.isLoading,

    // Error states
    error: personasRelacionadasQuery.error,
    errorTiposVinculo: tiposVinculoQuery.error,

    // Mutations
    addExistente: addExistenteMutation.mutateAsync,
    addNueva: addNuevaMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    desvincular: desvincularMutation.mutateAsync,
    batchUpdate: batchMutation.mutateAsync,

    // Mutation states
    isAddingExistente: addExistenteMutation.isPending,
    isAddingNueva: addNuevaMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDesvincular: desvincularMutation.isPending,
    isBatchUpdating: batchMutation.isPending,

    // Refetch
    refetch: personasRelacionadasQuery.refetch,
  }
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get tipo vinculo name by ID
 */
export const useTipoVinculoNombre = (tipoVinculoId: number | null | undefined) => {
  const { data: tiposVinculo } = useTiposVinculoPersona()

  if (!tipoVinculoId || !tiposVinculo) {
    return null
  }

  const tipo = tiposVinculo.find((t) => t.id === tipoVinculoId)
  return tipo?.nombre || null
}
