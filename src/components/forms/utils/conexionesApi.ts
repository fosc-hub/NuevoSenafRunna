"use client"

import { create } from "@/app/api/apiService"
import { useCallback, useRef, useEffect } from "react"
import { debounce } from "lodash"

// Types for the API request and response
interface LocalizacionData {
  calle: string
  localidad: number
}

interface BusquedaVinculacionRequest {
  nombre_y_apellido?: string
  dni?: number
  codigo?: string
  localizacion?: LocalizacionData
}

interface BusquedaVinculacionResponse {
  demanda_ids: number[]
  match_descriptions: string[]
}

/**
 * Function to search for matching people in the system
 * @param data Request data for the search
 * @returns Promise with the search results
 */
export const buscarVinculacion = async (data: BusquedaVinculacionRequest): Promise<BusquedaVinculacionResponse> => {
  try {
    const response = await create<BusquedaVinculacionResponse>("demanda-busqueda-vinculacion", data)
    return response
  } catch (error) {
    console.error("Error al buscar vinculación:", error)
    return { demanda_ids: [], match_descriptions: [] }
  }
}

/**
 * Verifica si un valor de búsqueda es válido
 * @param value Valor a verificar
 * @returns Booleano indicando si el valor es válido
 */
const isValidSearchValue = (value: any): boolean => {
  if (value === null || value === undefined) return false

  if (typeof value === "string") return value.trim().length >= 3
  if (typeof value === "number") return !isNaN(value) && value > 0

  return false
}

/**
 * Verifica si una localización es válida para búsqueda
 * @param localizacion Datos de localización
 * @returns Booleano indicando si la localización es válida
 */
const isValidLocalizacion = (localizacion?: LocalizacionData): boolean => {
  if (!localizacion) return false

  const calleValida = localizacion.calle && localizacion.calle.trim().length > 0
  const localidadValida = localizacion.localidad && !isNaN(Number(localizacion.localidad))

  return calleValida && localidadValida
}

/**
 * Custom hook that provides debounced functions for searching vinculaciones
 * @param delay Debounce delay in milliseconds
 * @returns Object with debounced search functions
 */
export const useBusquedaVinculacion = (delay = 500) => {
  // Refs para almacenar los valores previos y evitar búsquedas duplicadas
  const prevNombreRef = useRef<string>("")
  const prevDniRef = useRef<number>(0)
  const prevCodigoRef = useRef<string>("")
  const prevLocalizacionRef = useRef<LocalizacionData | undefined>(undefined)

  // Debounced function for searching by name and surname
  const buscarPorNombreApellido = useCallback(
    debounce(async (nombreYApellido: string, callback: (result: BusquedaVinculacionResponse) => void) => {
      // Solo buscar si el nombre es válido y diferente al anterior
      if (!isValidSearchValue(nombreYApellido) || nombreYApellido === prevNombreRef.current) return

      prevNombreRef.current = nombreYApellido

      try {
        const result = await buscarVinculacion({
          nombre_y_apellido: nombreYApellido,
        })
        callback(result)
      } catch (error) {
        console.error("Error en búsqueda por nombre y apellido:", error)
        callback({ demanda_ids: [], match_descriptions: [] })
      }
    }, delay),
    [delay],
  )

  // Debounced function for searching by DNI
  const buscarPorDni = useCallback(
    debounce(async (dni: number, callback: (result: BusquedaVinculacionResponse) => void) => {
      // Solo buscar si el DNI es válido y diferente al anterior
      if (!isValidSearchValue(dni) || dni === prevDniRef.current) return

      prevDniRef.current = dni

      try {
        const result = await buscarVinculacion({
          dni,
        })
        callback(result)
      } catch (error) {
        console.error("Error en búsqueda por DNI:", error)
        callback({ demanda_ids: [], match_descriptions: [] })
      }
    }, delay),
    [delay],
  )

  // Función para buscar por ambos criterios (nombre/apellido y DNI)
  const buscarCompleto = useCallback(
    debounce(
      async (
        nombreYApellido: string,
        dni: number,
        codigo?: string,
        localizacion?: LocalizacionData,
        callback?: (result: BusquedaVinculacionResponse) => void,
      ) => {
        try {
          const data: BusquedaVinculacionRequest = {}
          let shouldSearch = false

          // Verificar si hay cambios en los valores que justifiquen una nueva búsqueda
          const nombreCambio = isValidSearchValue(nombreYApellido) && nombreYApellido !== prevNombreRef.current
          const dniCambio = isValidSearchValue(dni) && dni !== prevDniRef.current
          const codigoCambio = isValidSearchValue(codigo) && codigo !== prevCodigoRef.current

          // Comparar localización
          const localizacionValida = isValidLocalizacion(localizacion)
          const localizacionCambio =
            localizacionValida && JSON.stringify(localizacion) !== JSON.stringify(prevLocalizacionRef.current)

          // Solo agregar los campos que tengan valores válidos
          if (isValidSearchValue(nombreYApellido)) {
            data.nombre_y_apellido = nombreYApellido
            prevNombreRef.current = nombreYApellido
            shouldSearch = true
          }

          if (isValidSearchValue(dni)) {
            data.dni = dni
            prevDniRef.current = dni
            shouldSearch = true
          }

          if (isValidSearchValue(codigo)) {
            data.codigo = codigo
            prevCodigoRef.current = codigo
            shouldSearch = true
          }

          if (localizacionValida) {
            data.localizacion = localizacion
            prevLocalizacionRef.current = localizacion
            shouldSearch = true
          }

          // Solo realizar la búsqueda si hay al menos un criterio válido Y ha habido cambios
          if (shouldSearch && (nombreCambio || dniCambio || codigoCambio || localizacionCambio)) {
            console.log("Realizando búsqueda con datos:", data)
            const result = await buscarVinculacion(data)
            if (callback) callback(result)
            return result
          } else {
            if (shouldSearch) {
              console.log("Criterios de búsqueda sin cambios, omitiendo búsqueda")
            } else {
              console.log("No hay criterios de búsqueda válidos")
            }
            const emptyResult = { demanda_ids: [], match_descriptions: [] }
            if (callback) callback(emptyResult)
            return emptyResult
          }
        } catch (error) {
          console.error("Error en búsqueda completa:", error)
          const emptyResult = { demanda_ids: [], match_descriptions: [] }
          if (callback) callback(emptyResult)
          return emptyResult
        }
      },
      delay,
    ),
    [delay],
  )

  // Limpiar referencias al desmontar el componente
  useEffect(() => {
    return () => {
      prevNombreRef.current = ""
      prevDniRef.current = 0
      prevCodigoRef.current = ""
      prevLocalizacionRef.current = undefined
    }
  }, [])

  return {
    buscarPorNombreApellido,
    buscarPorDni,
    buscarCompleto,
  }
}
