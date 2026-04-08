import { useQueries } from "@tanstack/react-query"
import { get } from "@/app/api/apiService"

export interface FilterOption {
  id: number
  nombre?: string
  nombre_completo?: string
  codigo?: string | null
}

export interface FilterOptions {
  zonas: FilterOption[]
  jefesZonales: FilterOption[]
  directores: FilterOption[]
  equiposTrabajo: FilterOption[]
  equiposCentroVida: FilterOption[]
  localidades: FilterOption[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener opciones de filtros dinámicos (LEG-03 FASE 4)
 *
 * Obtiene de la API:
 * - Lista de zonas
 * - Lista de jefes zonales
 * - Lista de directores
 * - Lista de equipos de trabajo
 * - Lista de equipos de centro de vida
 * - Lista de localidades
 *
 * Uso:
 * ```tsx
 * const { zonas, jefesZonales, isLoading } = useFilterOptions()
 * ```
 *
 * Optimizado con TanStack Query para:
 * - Caching automático (10 minutos)
 * - Fetching paralelo
 * - Retry automático
 */
export const useFilterOptions = (): FilterOptions => {
  // Fetch all filter options in parallel using useQueries
  const results = useQueries({
    queries: [
      {
        queryKey: ['filter-options', 'zonas'],
        queryFn: () => get<FilterOption[]>("zonas/"),
        staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
        cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: 1,
        onError: (error: any) => {
          console.error("Error fetching zonas:", error)
        },
      },
      {
        queryKey: ['filter-options', 'localidades'],
        queryFn: () => get<FilterOption[]>("localidad/"),
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: 1,
        onError: (error: any) => {
          console.error("Error fetching localidades:", error)
        },
      },
      // TODO: Add other endpoints when available
      // - jefes zonales
      // - directores
      // - equipos de trabajo
      // - equipos de centro de vida
    ],
  })

  const [zonasQuery, localidadesQuery] = results

  // Determine overall loading state
  const isLoading = results.some(query => query.isLoading)

  // Determine if there are any errors
  const hasError = results.some(query => query.isError)
  const error = hasError ? "Error al cargar opciones de filtros" : null

  return {
    zonas: Array.isArray(zonasQuery.data) ? zonasQuery.data : [],
    jefesZonales: [], // TODO: Fetch from API
    directores: [], // TODO: Fetch from API
    equiposTrabajo: [], // TODO: Fetch from API
    equiposCentroVida: [], // TODO: Fetch from API
    localidades: Array.isArray(localidadesQuery.data) ? localidadesQuery.data : [],
    isLoading,
    error,
  }
}
