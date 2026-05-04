/**
 * GAP-09: Hook para acceder y actualizar preferencias UI del usuario.
 *
 * Uso típico:
 *   const { prefs, isLoading, setPref } = useUserPreferences()
 *   const visible = prefs?.bandeja_legajos?.columnas_visibles ?? []
 *   setPref('bandeja_legajos', { ...prefs?.bandeja_legajos, orden: '-fecha' })
 *
 * El backend hace deep-merge, así que pasar sólo la sub-clave a actualizar
 * es suficiente.
 */

"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getUserPreferences,
  patchUserPreferences,
  type UserPreferencesPayload,
} from "./userPreferences.service"

const QUERY_KEY = ["user", "preferences"] as const

export interface UseUserPreferencesResult {
  /** Configuración cargada del backend (puede ser undefined mientras carga). */
  prefs: Record<string, any> | undefined
  /** Última fecha de modificación reportada por el backend. */
  fechaModificacion: string | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  /** Refetch manual de preferencias. */
  refetch: () => Promise<unknown>
  /** Actualizar (PATCH con deep-merge) una o varias claves de configuración. */
  setPrefs: (partial: Record<string, unknown>) => Promise<UserPreferencesPayload>
  /** Helper: actualizar una única clave top-level. */
  setPref: (key: string, value: unknown) => Promise<UserPreferencesPayload>
  isUpdating: boolean
}

export function useUserPreferences(): UseUserPreferencesResult {
  const queryClient = useQueryClient()

  const query = useQuery<UserPreferencesPayload>({
    queryKey: QUERY_KEY,
    queryFn: getUserPreferences,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
  })

  const mutation = useMutation({
    mutationFn: patchUserPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data)
    },
  })

  const setPrefs = useCallback(
    (partial: Record<string, unknown>) => mutation.mutateAsync(partial),
    [mutation]
  )

  const setPref = useCallback(
    (key: string, value: unknown) => mutation.mutateAsync({ [key]: value }),
    [mutation]
  )

  return {
    prefs: query.data?.configuracion as Record<string, any> | undefined,
    fechaModificacion: query.data?.fecha_modificacion,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setPrefs,
    setPref,
    isUpdating: mutation.isPending,
  }
}
