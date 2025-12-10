/**
 * React Query hooks for persona data fetching
 * Provides optimized data fetching with caching and error handling
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import {
  fetchPersonaLocalizacion,
  fetchPersonaEducacion,
  fetchPersonaCoberturaMedica,
  fetchPersonaCondicionesVulnerabilidad,
  fetchPersonaCompleta,
} from "../api/persona-api-service"
import type {
  LocalizacionPersona,
  EducacionPersona,
  CoberturaMedica,
  PersonaEnfermedad,
  PersonaCondicionVulnerabilidad,
  PersonaVulneracion,
  PersonaCompleta,
} from "../types/persona-data"

/**
 * Hook to fetch persona localization data
 * @param personaId Persona ID
 * @param options Query options
 * @returns Query result with localization data
 */
export const usePersonaLocalizacion = (
  personaId: number | null | undefined,
  options?: Omit<UseQueryOptions<LocalizacionPersona | null>, "queryKey" | "queryFn">
) => {
  // DEBUG: Log hook invocation
  console.log("🔍 usePersonaLocalizacion called with personaId:", personaId, "enabled:", !!personaId && (options?.enabled ?? true))

  return useQuery({
    queryKey: ["persona", personaId, "localizacion"],
    queryFn: () => {
      console.log("🔍 usePersonaLocalizacion queryFn executing for personaId:", personaId)
      if (!personaId) throw new Error("Persona ID is required")
      return fetchPersonaLocalizacion(personaId)
    },
    enabled: !!personaId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch persona education data
 * @param personaId Persona ID
 * @param options Query options
 * @returns Query result with education data
 */
export const usePersonaEducacion = (
  personaId: number | null | undefined,
  options?: Omit<UseQueryOptions<EducacionPersona | null>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["persona", personaId, "educacion"],
    queryFn: () => {
      if (!personaId) throw new Error("Persona ID is required")
      return fetchPersonaEducacion(personaId)
    },
    enabled: !!personaId && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000, // 10 minutes (education data changes less frequently)
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch persona medical coverage data
 * @param personaId Persona ID
 * @param options Query options
 * @returns Query result with medical coverage and health conditions
 */
export const usePersonaCoberturaMedica = (
  personaId: number | null | undefined,
  options?: Omit<
    UseQueryOptions<{ cobertura_medica: CoberturaMedica | null; persona_enfermedades: PersonaEnfermedad[] }>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["persona", personaId, "cobertura-medica"],
    queryFn: () => {
      if (!personaId) throw new Error("Persona ID is required")
      return fetchPersonaCoberturaMedica(personaId)
    },
    enabled: !!personaId && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch persona vulnerability conditions
 * @param personaId Persona ID
 * @param options Query options
 * @returns Query result with vulnerability conditions
 */
export const usePersonaCondicionesVulnerabilidad = (
  personaId: number | null | undefined,
  options?: Omit<
    UseQueryOptions<{ condiciones_vulnerabilidad: PersonaCondicionVulnerabilidad[]; vulneraciones: PersonaVulneracion[] }>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["persona", personaId, "vulnerabilidad"],
    queryFn: () => {
      if (!personaId) throw new Error("Persona ID is required")
      return fetchPersonaCondicionesVulnerabilidad(personaId)
    },
    enabled: !!personaId && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to fetch complete persona data using optimized endpoints
 * @param personaId Persona ID
 * @param demandaId Optional demanda ID for fallback
 * @param options Query options
 * @returns Query result with complete persona data
 */
export const usePersonaCompleta = (
  personaId: number | null | undefined,
  demandaId?: number | null,
  options?: Omit<UseQueryOptions<PersonaCompleta | null>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["persona", personaId, "completa", demandaId],
    queryFn: () => {
      if (!personaId) throw new Error("Persona ID is required")
      return fetchPersonaCompleta(personaId, demandaId ?? undefined)
    },
    enabled: !!personaId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Hook to prefetch persona data for better UX
 * Useful when you know a modal or tab will be opened soon
 * @param personaId Persona ID
 * @param demandaId Optional demanda ID for fallback
 */
export const usePrefetchPersonaData = (personaId: number | null | undefined, demandaId?: number | null) => {
  const queryClient = useQueryClient()

  const prefetchAll = React.useCallback(() => {
    if (!personaId) return

    // Prefetch all persona data in parallel
    queryClient.prefetchQuery({
      queryKey: ["persona", personaId, "localizacion"],
      queryFn: () => fetchPersonaLocalizacion(personaId),
      staleTime: 5 * 60 * 1000,
    })

    queryClient.prefetchQuery({
      queryKey: ["persona", personaId, "educacion"],
      queryFn: () => fetchPersonaEducacion(personaId),
      staleTime: 10 * 60 * 1000,
    })

    queryClient.prefetchQuery({
      queryKey: ["persona", personaId, "cobertura-medica"],
      queryFn: () => fetchPersonaCoberturaMedica(personaId),
      staleTime: 10 * 60 * 1000,
    })

    queryClient.prefetchQuery({
      queryKey: ["persona", personaId, "vulnerabilidad"],
      queryFn: () => fetchPersonaCondicionesVulnerabilidad(personaId),
      staleTime: 10 * 60 * 1000,
    })
  }, [personaId, queryClient])

  return { prefetchAll }
}

// Re-export React for the callback
import React from "react"
import { useQueryClient } from "@tanstack/react-query"
