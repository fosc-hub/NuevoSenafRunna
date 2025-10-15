"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { buscarDuplicados, debeEjecutarBusqueda, validarDNI } from "@/app/(runna)/legajo-mesa/api/legajo-duplicado-api-service"
import type {
  DuplicateSearchRequest,
  DuplicateSearchResponse,
  LegajoMatch,
} from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"
import { DUPLICATE_SEARCH_DEBOUNCE_MS, DUPLICATE_THRESHOLDS } from "../constants/duplicate-thresholds"

/**
 * Estado del hook
 */
interface UseDuplicateDetectionState {
  /** Si está buscando duplicados actualmente */
  isSearching: boolean

  /** Duplicados encontrados (solo los que cumplen threshold) */
  duplicatesFound: LegajoMatch[]

  /** Si se encontraron duplicados */
  hasDuplicates: boolean

  /** Error durante búsqueda */
  error: string | null

  /** Última búsqueda realizada */
  lastSearch: DuplicateSearchRequest | null

  /** Respuesta completa de la última búsqueda */
  lastSearchResponse: DuplicateSearchResponse | null
}

/**
 * Opciones del hook
 */
interface UseDuplicateDetectionOptions {
  /** Tiempo de debounce en ms (default: 500ms para nombre/apellido) */
  debounceMs?: number

  /** Si habilitar búsqueda automática (default: true) */
  autoSearch?: boolean

  /** Threshold mínimo para considerar duplicado (default: 0.50) */
  threshold?: number

  /** Callback cuando se encuentran duplicados */
  onDuplicatesFound?: (matches: LegajoMatch[]) => void

  /** Callback cuando falla la búsqueda */
  onError?: (error: string) => void
}

/**
 * Hook personalizado para detección automática de duplicados
 *
 * Características:
 * - Debounce automático para nombre/apellido (500ms)
 * - Búsqueda inmediata para DNI completo (8 dígitos)
 * - Manejo de estados de carga y error
 * - Callback cuando se encuentran duplicados
 * - Cancelación de búsquedas pendientes
 *
 * @param options Opciones del hook
 * @returns Estado y funciones del hook
 *
 * @example
 * ```tsx
 * const { searchDuplicates, isSearching, duplicatesFound, clearDuplicates } = useDuplicateDetection({
 *   debounceMs: 500,
 *   onDuplicatesFound: (matches) => {
 *     console.log(`Encontrados ${matches.length} duplicados`)
 *     setShowModal(true)
 *   }
 * })
 *
 * // En el onChange de un campo:
 * searchDuplicates({
 *   dni: 12345678,
 *   nombre: "Juan",
 *   apellido: "Pérez"
 * })
 * ```
 */
export function useDuplicateDetection(
  options: UseDuplicateDetectionOptions = {}
): {
  searchDuplicates: (data: Partial<DuplicateSearchRequest>) => void
  isSearching: boolean
  duplicatesFound: LegajoMatch[]
  hasDuplicates: boolean
  error: string | null
  clearDuplicates: () => void
  lastSearch: DuplicateSearchRequest | null
  lastSearchResponse: DuplicateSearchResponse | null
  cancelSearch: () => void
} {
  const {
    debounceMs = DUPLICATE_SEARCH_DEBOUNCE_MS,
    autoSearch = true,
    threshold = DUPLICATE_THRESHOLDS.MEDIA,
    onDuplicatesFound,
    onError,
  } = options

  // State
  const [state, setState] = useState<UseDuplicateDetectionState>({
    isSearching: false,
    duplicatesFound: [],
    hasDuplicates: false,
    error: null,
    lastSearch: null,
    lastSearchResponse: null,
  })

  // Refs para debounce y cancelación
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchDataRef = useRef<string>("")
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Limpia el timer de debounce
   */
  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  /**
   * Cancela la búsqueda en curso
   */
  const cancelSearch = useCallback(() => {
    clearDebounceTimer()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState((prev) => ({ ...prev, isSearching: false }))
  }, [clearDebounceTimer])

  /**
   * Ejecuta la búsqueda de duplicados (sin debounce)
   */
  const executeSearch = useCallback(
    async (searchData: DuplicateSearchRequest) => {
      try {
        // Crear nuevo AbortController para esta búsqueda
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        setState((prev) => ({
          ...prev,
          isSearching: true,
          error: null,
        }))

        console.log("Ejecutando búsqueda de duplicados:", searchData)

        // Llamar al servicio API
        const response = await buscarDuplicados(searchData)

        // Verificar si la búsqueda fue cancelada
        if (abortController.signal.aborted) {
          console.log("Búsqueda cancelada")
          return
        }

        console.log("Respuesta de búsqueda:", response)

        // Filtrar matches por threshold
        const duplicates = response.matches.filter(
          (match) => match.score >= threshold
        )

        setState((prev) => ({
          ...prev,
          isSearching: false,
          duplicatesFound: duplicates,
          hasDuplicates: duplicates.length > 0,
          lastSearch: searchData,
          lastSearchResponse: response,
          error: null,
        }))

        // Callback si se encontraron duplicados
        if (duplicates.length > 0 && onDuplicatesFound) {
          onDuplicatesFound(duplicates)
        }
      } catch (error: any) {
        console.error("Error en búsqueda de duplicados:", error)

        // No mostrar error si fue cancelada
        if (error.name === "CanceledError" || error.message === "canceled") {
          return
        }

        const errorMessage = error.message || "Error al buscar duplicados"

        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: errorMessage,
        }))

        if (onError) {
          onError(errorMessage)
        }
      } finally {
        abortControllerRef.current = null
      }
    },
    [threshold, onDuplicatesFound, onError]
  )

  /**
   * Busca duplicados con debounce inteligente
   * - DNI completo: Sin debounce (búsqueda inmediata)
   * - Nombre/Apellido: Con debounce configurado
   */
  const searchDuplicates = useCallback(
    (data: Partial<DuplicateSearchRequest>) => {
      if (!autoSearch) {
        return
      }

      // Validar que los datos sean suficientes
      if (!debeEjecutarBusqueda(data)) {
        console.log("Datos insuficientes para búsqueda")
        return
      }

      // Crear string hash de los datos para evitar búsquedas duplicadas
      const dataHash = JSON.stringify({
        dni: data.dni,
        nombre: data.nombre?.trim(),
        apellido: data.apellido?.trim(),
        fecha_nacimiento: data.fecha_nacimiento,
      })

      // Si los datos son idénticos a la última búsqueda, no buscar de nuevo
      if (dataHash === lastSearchDataRef.current) {
        console.log("Datos idénticos a última búsqueda, saltando...")
        return
      }

      lastSearchDataRef.current = dataHash

      // Cancelar búsqueda anterior si existe
      cancelSearch()

      // Preparar datos de búsqueda
      const searchData: DuplicateSearchRequest = {
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        dni: data.dni || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        genero: data.genero || null,
        nombre_autopercibido: data.nombre_autopercibido || null,
      }

      // Si hay DNI válido (8 dígitos), búsqueda inmediata sin debounce
      if (validarDNI(data.dni)) {
        console.log("DNI completo detectado - búsqueda inmediata")
        executeSearch(searchData)
        return
      }

      // Para nombre/apellido, aplicar debounce
      console.log(`Búsqueda con debounce de ${debounceMs}ms`)
      debounceTimerRef.current = setTimeout(() => {
        executeSearch(searchData)
      }, debounceMs)
    },
    [autoSearch, debounceMs, cancelSearch, executeSearch]
  )

  /**
   * Limpia los duplicados encontrados
   */
  const clearDuplicates = useCallback(() => {
    cancelSearch()
    lastSearchDataRef.current = ""
    setState({
      isSearching: false,
      duplicatesFound: [],
      hasDuplicates: false,
      error: null,
      lastSearch: null,
      lastSearchResponse: null,
    })
  }, [cancelSearch])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearDebounceTimer()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [clearDebounceTimer])

  return {
    searchDuplicates,
    isSearching: state.isSearching,
    duplicatesFound: state.duplicatesFound,
    hasDuplicates: state.hasDuplicates,
    error: state.error,
    clearDuplicates,
    lastSearch: state.lastSearch,
    lastSearchResponse: state.lastSearchResponse,
    cancelSearch,
  }
}
