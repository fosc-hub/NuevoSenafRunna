"use client"

import { create } from "@/app/api/apiService"
import { useCallback } from "react"
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
 * Custom hook that provides debounced functions for searching vinculaciones
 * @param delay Debounce delay in milliseconds
 * @returns Object with debounced search functions
 */
export const useBusquedaVinculacion = (delay = 500) => {
  // Debounced function for searching by name and surname
  const buscarPorNombreApellido = useCallback(
    debounce(async (nombreYApellido: string, callback: (result: BusquedaVinculacionResponse) => void) => {
      if (!nombreYApellido || nombreYApellido.trim().length < 3) return

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
      if (!dni || isNaN(dni)) return

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

  // Function for searching by both name/surname and DNI
  const buscarCompleto = useCallback(
    async (
      nombreYApellido: string,
      dni: number,
      codigo?: string,
      localizacion?: LocalizacionData,
      callback?: (result: BusquedaVinculacionResponse) => void,
    ) => {
      try {
        const data: BusquedaVinculacionRequest = {};

        // Solo agregar los campos que tengan valores válidos
        if (nombreYApellido && nombreYApellido.trim().length > 0) {
          data.nombre_y_apellido = nombreYApellido;
        }

        if (dni && !isNaN(dni)) {
          data.dni = dni;
        }

        if (codigo) {
          data.codigo = codigo;
        }

        if (localizacion) {
          data.localizacion = localizacion;
        }

        // Solo realizar la búsqueda si hay al menos un criterio válido
        if (Object.keys(data).length > 0) {
          console.log("Realizando búsqueda con datos:", data);
          const result = await buscarVinculacion(data);
          if (callback) callback(result);
          return result;
        } else {
          console.log("No hay criterios de búsqueda válidos");
          const emptyResult = { demanda_ids: [], match_descriptions: [] };
          if (callback) callback(emptyResult);
          return emptyResult;
        }
      } catch (error) {
        console.error("Error en búsqueda completa:", error);
        const emptyResult = { demanda_ids: [], match_descriptions: [] };
        if (callback) callback(emptyResult);
        return emptyResult;
      }
    },
    [],
  );

  return {
    buscarPorNombreApellido,
    buscarPorDni,
    buscarCompleto,
  }
}
