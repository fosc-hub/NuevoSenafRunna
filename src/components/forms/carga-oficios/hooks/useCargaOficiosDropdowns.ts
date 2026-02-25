"use client"

/**
 * useCargaOficiosDropdowns - Hook for managing CARGA_OFICIOS dropdown data
 *
 * Uses categoria_informacion_judicial from the main dropdowns endpoint.
 *
 * @deprecated tipo_informacion_judicial is deprecated - use tipo_oficio filtered by categoria instead.
 * The tipos-related functionality in this hook is kept for backward compatibility but should not be used.
 */

import { useMemo } from "react"
import type {
  CategoriaInformacionJudicial,
  TipoInformacionJudicial,
} from "../types/carga-oficios.types"

interface UseCargaOficiosDropdownsOptions {
  /** Array of categorias from main dropdowns endpoint */
  categorias?: CategoriaInformacionJudicial[]
  /** @deprecated Use tipo_oficio from dropdownData instead, filtered by categoria */
  tipos?: TipoInformacionJudicial[]
}

interface UseCargaOficiosDropdownsResult {
  categorias: CategoriaInformacionJudicial[]
  /** @deprecated Use tipo_oficio from dropdownData instead */
  tipos: TipoInformacionJudicial[]
  isLoading: boolean
  isError: boolean

  /** @deprecated Use filteredTipoOficio from CargaOficiosForm instead */
  getTiposByCategoria: (categoriaId: number | null) => TipoInformacionJudicial[]

  /** Get a specific categoria by ID */
  getCategoriaById: (id: number | null) => CategoriaInformacionJudicial | undefined

  /** @deprecated Use tipo_oficio from dropdownData instead */
  getTipoById: (id: number | null) => TipoInformacionJudicial | undefined
}

/**
 * Hook to manage CARGA_OFICIOS dropdown data
 *
 * @param options - Dropdown data from main dropdowns endpoint
 * @returns Dropdown data with helper functions
 */
export const useCargaOficiosDropdowns = (
  options: UseCargaOficiosDropdownsOptions = {}
): UseCargaOficiosDropdownsResult => {
  const { categorias: rawCategorias = [], tipos: rawTipos = [] } = options

  // Filter only active categorias
  const categorias = useMemo(() => {
    return rawCategorias.filter((c) => c.esta_activo !== false)
  }, [rawCategorias])

  // Filter only active tipos
  const tipos = useMemo(() => {
    return rawTipos.filter((t) => t.esta_activo !== false)
  }, [rawTipos])

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

  // isLoading/isError are determined by whether data was provided
  const isLoading = rawCategorias.length === 0 && rawTipos.length === 0
  const isError = false

  return {
    categorias,
    tipos,
    isLoading: false, // Data comes from parent, loading is handled there
    isError,
    getTiposByCategoria,
    getCategoriaById,
    getTipoById,
  }
}

export default useCargaOficiosDropdowns
