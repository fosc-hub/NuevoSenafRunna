/**
 * API Service for NNyA Search (LEG-01 Integration)
 * Endpoint: POST /api/demanda-busqueda-vinculacion/
 *
 * Updated: Uses personas_encontradas field for enriched data
 * - No longer requires separate API calls for persona details
 * - Includes demandas, medidas, legajo, and grupo conviviente info
 */

import { create } from '@/app/api/apiService'
import type {
  BusquedaNnyaResult,
  BusquedaVinculacionResponse,
  PersonaEncontrada,
} from '../types/legajo-creation.types'

/**
 * Transform PersonaEncontrada to BusquedaNnyaResult
 * Maps the enhanced API response to our internal type
 */
const mapPersonaToResult = (persona: PersonaEncontrada): BusquedaNnyaResult => ({
  id: persona.id,
  nombre: persona.nombre,
  apellido: persona.apellido,
  dni: persona.dni,
  fecha_nacimiento: persona.fecha_nacimiento,
  nnya: persona.nnya,
  legajo_existente: persona.legajo
    ? {
        id: persona.legajo.id,
        numero: persona.legajo.numero,
      }
    : undefined,
  demandas_ids: persona.demandas_ids || [],
  medidas_ids: persona.medidas_ids || [],
  grupo_conviviente: persona.grupo_conviviente || [],
})

/**
 * Search NNyA by DNI to detect duplicates (LEG-01)
 * POST /api/demanda-busqueda-vinculacion/
 *
 * Uses personas_encontradas field for enriched data including:
 * - Existing legajo info
 * - Linked demandas IDs
 * - Active medidas IDs
 * - Grupo conviviente members
 *
 * @param dni - DNI to search for
 * @returns Array of matching NNyA with enriched information
 */
export const buscarNnyaPorDni = async (dni: string): Promise<BusquedaNnyaResult[]> => {
  try {
    console.log(`[LEG-01] Searching NNyA by DNI: ${dni}`)

    const response = await create<BusquedaVinculacionResponse>('demanda-busqueda-vinculacion', {
      dni: dni,
    })

    console.log('[LEG-01] Search response:', response)

    // Use personas_encontradas as the primary data source (LEG-01 enhancement)
    const personasEncontradas = response.personas_encontradas || []

    if (personasEncontradas.length === 0) {
      console.log('[LEG-01] No personas found for this DNI')
      return []
    }

    // Map personas_encontradas to our internal type
    const results = personasEncontradas.map(mapPersonaToResult)

    console.log(`[LEG-01] Found ${results.length} matching NNyA(s)`)
    results.forEach((r) => {
      console.log(
        `  - ${r.nombre} ${r.apellido}: ` +
          `legajo=${r.legajo_existente?.numero || 'ninguno'}, ` +
          `demandas=${r.demandas_ids.length}, ` +
          `medidas=${r.medidas_ids.length}, ` +
          `grupo=${r.grupo_conviviente.length}`
      )
    })

    return results
  } catch (error: any) {
    console.error('[LEG-01] Error searching NNyA by DNI:', error)
    console.error('[LEG-01] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    // Return empty array on error - allows UI to show "no results"
    return []
  }
}

/**
 * Search NNyA by name and surname
 * POST /api/demanda-busqueda-vinculacion/
 *
 * Uses nombre_y_apellido field for flexible name matching
 *
 * @param nombre - First name to search
 * @param apellido - Last name to search
 * @returns Array of matching NNyA with enriched information
 */
export const buscarNnyaPorNombre = async (
  nombre: string,
  apellido: string
): Promise<BusquedaNnyaResult[]> => {
  // Combine nombre and apellido for nombre_y_apellido field
  const nombreCompleto = [nombre, apellido].filter(Boolean).join(' ').trim()

  if (!nombreCompleto) {
    return []
  }

  try {
    console.log(`[LEG-01] Searching NNyA by name: ${nombreCompleto}`)

    // Use nombre_y_apellido for flexible matching (LEG-01 backend format)
    const response = await create<BusquedaVinculacionResponse>('demanda-busqueda-vinculacion', {
      nombre_y_apellido: nombreCompleto,
    })

    console.log('[LEG-01] Search response:', response)

    // Use personas_encontradas as the primary data source
    const personasEncontradas = response.personas_encontradas || []

    if (personasEncontradas.length === 0) {
      console.log('[LEG-01] No personas found for this name')
      return []
    }

    // Map personas_encontradas to our internal type
    const results = personasEncontradas.map(mapPersonaToResult)

    console.log(`[LEG-01] Found ${results.length} matching NNyA(s)`)

    return results
  } catch (error: any) {
    console.error('[LEG-01] Error searching NNyA by name:', error)
    console.error('[LEG-01] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    return []
  }
}

/**
 * Search NNyA by nombre_y_apellido (combined field)
 * POST /api/demanda-busqueda-vinculacion/
 *
 * Uses the nombre_y_apellido field for flexible name matching
 *
 * @param nombreCompleto - Full name to search
 * @returns Array of matching NNyA with enriched information
 */
export const buscarNnyaPorNombreCompleto = async (
  nombreCompleto: string
): Promise<BusquedaNnyaResult[]> => {
  try {
    console.log(`[LEG-01] Searching NNyA by full name: ${nombreCompleto}`)

    const response = await create<BusquedaVinculacionResponse>('demanda-busqueda-vinculacion', {
      nombre_y_apellido: nombreCompleto,
    })

    console.log('[LEG-01] Search response:', response)

    const personasEncontradas = response.personas_encontradas || []

    if (personasEncontradas.length === 0) {
      console.log('[LEG-01] No personas found for this full name')
      return []
    }

    return personasEncontradas.map(mapPersonaToResult)
  } catch (error: any) {
    console.error('[LEG-01] Error searching NNyA by full name:', error)
    return []
  }
}

/**
 * Combined search - auto-detects search type
 *
 * @param searchTerm - Term to search (can be DNI or name)
 * @returns Array of matching NNyA with enriched information
 */
export const buscarNnya = async (searchTerm: string): Promise<BusquedaNnyaResult[]> => {
  const trimmed = searchTerm.trim()

  // If search term is all numbers, search by DNI
  if (/^\d+$/.test(trimmed)) {
    return buscarNnyaPorDni(trimmed)
  }

  // Use nombre_y_apellido for flexible name matching
  return buscarNnyaPorNombreCompleto(trimmed)
}
