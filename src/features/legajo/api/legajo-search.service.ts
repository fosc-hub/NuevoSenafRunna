/**
 * API Service for NNyA Search (LEG-01 Integration)
 * Endpoint: POST /api/demanda-busqueda-vinculacion/
 */

import { create } from '@/app/api/apiService'
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
    // Adjust this based on actual API response format
    const personas = response.personas || response.results || []

    // Map to BusquedaNnyaResult format
    const mappedResults: BusquedaNnyaResult[] = personas.map((persona: any) => ({
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
      fecha_nacimiento: persona.fecha_nacimiento,
      legajo_existente: persona.legajo ? {
        id: persona.legajo.id,
        numero: persona.legajo.numero,
        fecha_apertura: persona.legajo.fecha_apertura,
      } : undefined,
    }))

    console.log(`Found ${mappedResults.length} matching NNyA(s)`)

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
    const personas = response.personas || response.results || []

    const mappedResults: BusquedaNnyaResult[] = personas.map((persona: any) => ({
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
      fecha_nacimiento: persona.fecha_nacimiento,
      legajo_existente: persona.legajo ? {
        id: persona.legajo.id,
        numero: persona.legajo.numero,
        fecha_apertura: persona.legajo.fecha_apertura,
      } : undefined,
    }))

    console.log(`Found ${mappedResults.length} matching NNyA(s)`)

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
