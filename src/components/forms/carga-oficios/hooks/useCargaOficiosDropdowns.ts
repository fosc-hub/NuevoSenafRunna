"use client"

/**
 * useCargaOficiosDropdowns - Hook for fetching and filtering CARGA_OFICIOS dropdown data
 *
 * Fetches categoria_informacion_judicial and tipo_informacion_judicial from the API
 * and provides filtered tipos based on selected categoria.
 */

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/app/api/apiService"
import type {
  CategoriaInformacionJudicial,
  TipoInformacionJudicial,
} from "../types/carga-oficios.types"

interface UseCargaOficiosDropdownsResult {
  categorias: CategoriaInformacionJudicial[]
  tipos: TipoInformacionJudicial[]
  isLoading: boolean
  isError: boolean
  error: Error | null

  /** Get tipos filtered by categoria ID */
  getTiposByCategoria: (categoriaId: number | null) => TipoInformacionJudicial[]

  /** Get a specific categoria by ID */
  getCategoriaById: (id: number | null) => CategoriaInformacionJudicial | undefined

  /** Get a specific tipo by ID */
  getTipoById: (id: number | null) => TipoInformacionJudicial | undefined
}

/**
 * Hook to fetch and manage CARGA_OFICIOS dropdown data
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns Dropdown data with helper functions
 */
export const useCargaOficiosDropdowns = (enabled = true): UseCargaOficiosDropdownsResult => {
  // Fetch categoria_informacion_judicial
  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    isError: isErrorCategorias,
    error: errorCategorias,
  } = useQuery<CategoriaInformacionJudicial[]>({
    queryKey: ["categoria-informacion-judicial"],
    queryFn: async () => {
      try {
        const response = await get<CategoriaInformacionJudicial[] | { results: CategoriaInformacionJudicial[] }>(
          "categoria-informacion-judicial/"
        )
        // Handle paginated response
        if (response && "results" in response) {
          return response.results
        }
        return response || []
      } catch (error) {
        console.warn("Could not fetch categoria_informacion_judicial:", error)
        return []
      }
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Fetch tipo_informacion_judicial
  const {
    data: tiposData,
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
    error: errorTipos,
  } = useQuery<TipoInformacionJudicial[]>({
    queryKey: ["tipo-informacion-judicial"],
    queryFn: async () => {
      try {
        const response = await get<TipoInformacionJudicial[] | { results: TipoInformacionJudicial[] }>(
          "tipo-informacion-judicial/"
        )
        // Handle paginated response
        if (response && "results" in response) {
          return response.results
        }
        return response || []
      } catch (error) {
        console.warn("Could not fetch tipo_informacion_judicial:", error)
        return []
      }
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Filter only active categorias
  const categorias = useMemo(() => {
    return (categoriasData || []).filter((c) => c.esta_activo)
  }, [categoriasData])

  // Filter only active tipos
  const tipos = useMemo(() => {
    return (tiposData || []).filter((t) => t.esta_activo)
  }, [tiposData])

  // Get tipos filtered by categoria
  const getTiposByCategoria = useMemo(() => {
    return (categoriaId: number | null): TipoInformacionJudicial[] => {
      if (!categoriaId) return []
      return tipos.filter((t) => t.categoria === categoriaId)
    }
  }, [tipos])

  // Get categoria by ID
  const getCategoriaById = useMemo(() => {
    return (id: number | null): CategoriaInformacionJudicial | undefined => {
      if (!id) return undefined
      return categorias.find((c) => c.id === id)
    }
  }, [categorias])

  // Get tipo by ID
  const getTipoById = useMemo(() => {
    return (id: number | null): TipoInformacionJudicial | undefined => {
      if (!id) return undefined
      return tipos.find((t) => t.id === id)
    }
  }, [tipos])

  return {
    categorias,
    tipos,
    isLoading: isLoadingCategorias || isLoadingTipos,
    isError: isErrorCategorias || isErrorTipos,
    error: errorCategorias || errorTipos || null,
    getTiposByCategoria,
    getCategoriaById,
    getTipoById,
  }
}

export default useCargaOficiosDropdowns
