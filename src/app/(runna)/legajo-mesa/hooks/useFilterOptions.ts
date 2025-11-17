import { useState, useEffect } from "react"
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
 */
export const useFilterOptions = (): FilterOptions => {
  const [options, setOptions] = useState<FilterOptions>({
    zonas: [],
    jefesZonales: [],
    directores: [],
    equiposTrabajo: [],
    equiposCentroVida: [],
    localidades: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptions((prev) => ({ ...prev, isLoading: true, error: null }))

        // Fetch all options in parallel
        const [zonasRes, locRes] = await Promise.all([
          get<FilterOption[]>("zonas/").catch(() => []),
          get<FilterOption[]>("localidad/").catch(() => []),
        ])

        // TODO: Add other endpoints when available
        // - jefes zonales
        // - directores
        // - equipos de trabajo
        // - equipos de centro de vida

        setOptions({
          zonas: Array.isArray(zonasRes) ? zonasRes : [],
          jefesZonales: [], // TODO: Fetch from API
          directores: [], // TODO: Fetch from API
          equiposTrabajo: [], // TODO: Fetch from API
          equiposCentroVida: [], // TODO: Fetch from API
          localidades: Array.isArray(locRes) ? locRes : [],
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching filter options:", error)
        setOptions((prev) => ({
          ...prev,
          isLoading: false,
          error: "Error al cargar opciones de filtros",
        }))
      }
    }

    fetchOptions()
  }, [])

  return options
}
