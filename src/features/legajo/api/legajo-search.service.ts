/**
 * API Service for NNyA Search (LEG-01 Integration)
 * Endpoint: POST /api/demanda-busqueda-vinculacion/
 */

import { create, get } from '@/app/api/apiService'
import type { BusquedaNnyaResult } from '../types/legajo-creation.types'

/**
 * Search NNyA by DNI to detect duplicates (LEG-01)
 * POST /api/demanda-busqueda-vinculacion/
 *
 * @param dni - DNI to search for
 * @returns Array of matching NNyA with legajo information
 */
export const buscarNnyaPorDni = async (dni: string): Promise<BusquedaNnyaResult[]> => {
  try {
    console.log(`Searching NNyA by DNI: ${dni}`)

    // According to API, this endpoint searches for matches
    const response = await create<any>('demanda-busqueda-vinculacion', {
      dni: dni,
    })

    console.log('Search response:', response)

    // Parse response according to backend structure
    // Response format: { demanda_ids: [], match_descriptions: [], legajos: [] }
    const legajos = response.legajos || []

    if (legajos.length === 0) {
      console.log('No existing legajos found for this DNI')
      return []
    }

    // Fetch full persona details for each nnya ID found in legajos
    const personaPromises = legajos.map(async (legajo: any) => {
      const nnyaId = typeof legajo.nnya === 'number' ? legajo.nnya : legajo.nnya?.id

      try {
        // Fetch full persona details from /api/persona/{id}/
        const persona = await get<any>(`persona/${nnyaId}/`)

        return {
          id: persona.id,
          nombre: persona.nombre,
          apellido: persona.apellido,
          dni: persona.dni,
          fecha_nacimiento: persona.fecha_nacimiento,
          legajo_existente: {
            id: legajo.id,
            numero: legajo.numero,
            fecha_apertura: legajo.fecha_apertura,
          },
        } as BusquedaNnyaResult
      } catch (error) {
        console.error(`Error fetching persona ${nnyaId}:`, error)
        // Fallback to minimal data if persona fetch fails
        return {
          id: nnyaId,
          nombre: 'Desconocido',
          apellido: 'Desconocido',
          dni: 0,
          fecha_nacimiento: '',
          legajo_existente: {
            id: legajo.id,
            numero: legajo.numero,
            fecha_apertura: legajo.fecha_apertura,
          },
        } as BusquedaNnyaResult
      }
    })

    const mappedResults = await Promise.all(personaPromises)

    console.log(`Found ${mappedResults.length} matching NNyA(s) with existing legajos`)

    return mappedResults
  } catch (error: any) {
    console.error('Error searching NNyA by DNI:', error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    // Don't show error toast for search - return empty array
    // This allows the UI to show "no results" message
    return []
  }
}

/**
 * Search NNyA by name and surname
 * POST /api/demanda-busqueda-vinculacion/
 *
 * @param nombre - First name to search
 * @param apellido - Last name to search
 * @returns Array of matching NNyA with legajo information
 */
export const buscarNnyaPorNombre = async (
  nombre: string,
  apellido: string
): Promise<BusquedaNnyaResult[]> => {
  try {
    console.log(`Searching NNyA by name: ${nombre} ${apellido}`)

    const response = await create<any>('demanda-busqueda-vinculacion', {
      nombre: nombre,
      apellido: apellido,
    })

    console.log('Search response:', response)

    // Parse response (same structure as DNI search)
    // Response format: { demanda_ids: [], match_descriptions: [], legajos: [] }
    const legajos = response.legajos || []

    if (legajos.length === 0) {
      console.log('No existing legajos found for this name')
      return []
    }

    // Fetch full persona details for each nnya ID found in legajos
    const personaPromises = legajos.map(async (legajo: any) => {
      const nnyaId = typeof legajo.nnya === 'number' ? legajo.nnya : legajo.nnya?.id

      try {
        // Fetch full persona details from /api/persona/{id}/
        const persona = await get<any>(`persona/${nnyaId}/`)

        return {
          id: persona.id,
          nombre: persona.nombre,
          apellido: persona.apellido,
          dni: persona.dni,
          fecha_nacimiento: persona.fecha_nacimiento,
          legajo_existente: {
            id: legajo.id,
            numero: legajo.numero,
            fecha_apertura: legajo.fecha_apertura,
          },
        } as BusquedaNnyaResult
      } catch (error) {
        console.error(`Error fetching persona ${nnyaId}:`, error)
        // Fallback to minimal data if persona fetch fails
        return {
          id: nnyaId,
          nombre: 'Desconocido',
          apellido: 'Desconocido',
          dni: 0,
          fecha_nacimiento: '',
          legajo_existente: {
            id: legajo.id,
            numero: legajo.numero,
            fecha_apertura: legajo.fecha_apertura,
          },
        } as BusquedaNnyaResult
      }
    })

    const mappedResults = await Promise.all(personaPromises)

    console.log(`Found ${mappedResults.length} matching NNyA(s) with existing legajos`)

    return mappedResults
  } catch (error: any) {
    console.error('Error searching NNyA by name:', error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    // Return empty array on error
    return []
  }
}

/**
 * Combined search - tries both DNI and name search
 *
 * @param searchTerm - Term to search (can be DNI or name)
 * @returns Array of matching NNyA
 */
export const buscarNnya = async (searchTerm: string): Promise<BusquedaNnyaResult[]> => {
  const trimmed = searchTerm.trim()

  // If search term is all numbers, search by DNI
  if (/^\d+$/.test(trimmed)) {
    return buscarNnyaPorDni(trimmed)
  }

  // Otherwise, try to split name and search
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    const nombre = parts.slice(0, -1).join(' ')
    const apellido = parts[parts.length - 1]
    return buscarNnyaPorNombre(nombre, apellido)
  }

  // If single word, search as apellido
  return buscarNnyaPorNombre('', trimmed)
}
