/**
 * API Service for Personas Relacionadas (TPersonaVinculo)
 *
 * Provides functions to manage permanent family relationships for NNyA
 * through the unified endpoint PATCH /api/legajos/{id}/nnya/
 *
 * Based on API documentation: claudedocs/API_PERSONAS_RELACIONADAS_FRONTEND.md
 */

import { get } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import type {
  PersonaVinculo,
  PersonaRelacionadaRequest,
  PersonaRelacionadaCreateExistente,
  PersonaRelacionadaCreateNueva,
  PersonaRelacionadaUpdate,
  PersonaRelacionadaDesvincular,
  TipoVinculoPersona,
} from "../types/personas-relacionadas-api"

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * NNyA data response from GET /api/legajos/{id}/nnya/
 * This includes personas_relacionadas among other fields
 */
export interface NNyADataResponse {
  id: number
  nombre: string
  nombre_autopercibido: string | null
  apellido: string
  fecha_nacimiento: string | null
  edad_aproximada: number | null
  nacionalidad: string | null
  dni: number | null
  situacion_dni: string | null
  genero: string | null
  telefono: string | null
  observaciones: string | null
  fecha_defuncion: string | null
  adulto: boolean
  nnya: boolean
  localizacion: any | null
  educacion: any | null
  cobertura_medica: any | null
  persona_enfermedades: any[]
  condiciones_vulnerabilidad: any[]
  personas_relacionadas: PersonaVinculo[]
}

/**
 * Fetch NNyA data including personas relacionadas
 * @param legajoId Legajo ID
 * @returns NNyA data with personas_relacionadas
 */
export const fetchNNyAData = async (legajoId: number): Promise<NNyADataResponse> => {
  try {
    console.log(`[PersonasRelacionadas] Fetching NNyA data for legajo ${legajoId}`)
    const response = await get<NNyADataResponse>(`legajos/${legajoId}/nnya/`)
    console.log(`[PersonasRelacionadas] Fetched NNyA data:`, response)
    return response
  } catch (error: any) {
    console.error(`[PersonasRelacionadas] Error fetching NNyA data for legajo ${legajoId}:`, error)
    throw error
  }
}

/**
 * Fetch personas relacionadas for a legajo
 * @param legajoId Legajo ID
 * @returns Array of personas relacionadas
 */
export const fetchPersonasRelacionadas = async (legajoId: number): Promise<PersonaVinculo[]> => {
  try {
    const nnyaData = await fetchNNyAData(legajoId)
    return nnyaData.personas_relacionadas || []
  } catch (error: any) {
    console.error(`[PersonasRelacionadas] Error fetching personas relacionadas for legajo ${legajoId}:`, error)
    if (error?.response?.status === 404) {
      return []
    }
    throw error
  }
}

/**
 * Fetch tipos de vinculo for personas (family relationship types)
 * @returns Array of tipo vinculo options
 */
export const fetchTiposVinculoPersona = async (): Promise<TipoVinculoPersona[]> => {
  try {
    console.log(`[PersonasRelacionadas] Fetching tipos vinculo persona`)
    const response = await get<any>(`vinculo-de-personas/`)
    // Handle paginated response
    const results = response?.results || response || []
    console.log(`[PersonasRelacionadas] Fetched tipos vinculo:`, results)
    return results
  } catch (error: any) {
    console.error(`[PersonasRelacionadas] Error fetching tipos vinculo:`, error)
    throw error
  }
}

// ============================================================================
// MUTATION OPERATIONS
// ============================================================================

/**
 * Update personas relacionadas for a legajo
 * Uses PATCH /api/legajos/{id}/nnya/ endpoint with personas_relacionadas field
 *
 * @param legajoId Legajo ID
 * @param personasRelacionadas Array of persona relacionada operations
 * @returns Updated NNyA data
 */
export const updatePersonasRelacionadas = async (
  legajoId: number,
  personasRelacionadas: PersonaRelacionadaRequest[]
): Promise<NNyADataResponse> => {
  try {
    console.log(`[PersonasRelacionadas] Updating personas relacionadas for legajo ${legajoId}:`, personasRelacionadas)
    const response = await axiosInstance.patch<NNyADataResponse>(`legajos/${legajoId}/nnya/`, {
      personas_relacionadas: personasRelacionadas,
    })
    console.log(`[PersonasRelacionadas] Updated NNyA data:`, response.data)
    return response.data
  } catch (error: any) {
    console.error(`[PersonasRelacionadas] Error updating personas relacionadas:`, error)
    throw error
  }
}

/**
 * Add a new persona relacionada with an existing persona
 * @param legajoId Legajo ID
 * @param data Create data with persona_existente_id
 * @returns Updated NNyA data
 */
export const addPersonaRelacionadaExistente = async (
  legajoId: number,
  data: PersonaRelacionadaCreateExistente
): Promise<NNyADataResponse> => {
  return updatePersonasRelacionadas(legajoId, [data])
}

/**
 * Add a new persona relacionada by creating a new persona
 * Backend will search for existing persona or create new
 * @param legajoId Legajo ID
 * @param data Create data with persona_datos
 * @returns Updated NNyA data
 */
export const addPersonaRelacionadaNueva = async (
  legajoId: number,
  data: PersonaRelacionadaCreateNueva
): Promise<NNyADataResponse> => {
  return updatePersonasRelacionadas(legajoId, [data])
}

/**
 * Update an existing persona relacionada
 * @param legajoId Legajo ID
 * @param data Update data with id
 * @returns Updated NNyA data
 */
export const updatePersonaRelacionada = async (
  legajoId: number,
  data: PersonaRelacionadaUpdate
): Promise<NNyADataResponse> => {
  return updatePersonasRelacionadas(legajoId, [data])
}

/**
 * Desvincular (soft delete) a persona relacionada with traceability
 * @param legajoId Legajo ID
 * @param vinculoId ID of the relationship to deactivate
 * @param justificacion Justification for deactivation (min 20 chars)
 * @returns Updated NNyA data
 */
export const desvincularPersonaRelacionada = async (
  legajoId: number,
  vinculoId: number,
  justificacion: string
): Promise<NNyADataResponse> => {
  const desvincularData: PersonaRelacionadaDesvincular = {
    id: vinculoId,
    desvincular: true,
    justificacion_desvincular: justificacion,
  }
  return updatePersonasRelacionadas(legajoId, [desvincularData])
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Perform multiple persona relacionada operations in a single request
 * Useful for combined create/update/desvincular operations
 *
 * @param legajoId Legajo ID
 * @param operations Array of different operations
 * @returns Updated NNyA data
 *
 * @example
 * ```typescript
 * await batchUpdatePersonasRelacionadas(legajoId, [
 *   { persona_existente_id: 123, tipo_vinculo: 1, conviviente: true },
 *   { id: 5, conviviente: false },
 *   { id: 8, desvincular: true, justificacion_desvincular: "..." }
 * ])
 * ```
 */
export const batchUpdatePersonasRelacionadas = async (
  legajoId: number,
  operations: PersonaRelacionadaRequest[]
): Promise<NNyADataResponse> => {
  return updatePersonasRelacionadas(legajoId, operations)
}

// ============================================================================
// SEARCH PERSONAS (for autocomplete when adding relacionada)
// ============================================================================

/**
 * Search for personas to add as relacionada
 * @param searchTerm Search term (DNI or name)
 * @returns Array of matching personas
 */
export const searchPersonasForRelacionada = async (searchTerm: string): Promise<any[]> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return []
    }

    console.log(`[PersonasRelacionadas] Searching personas with term: ${searchTerm}`)

    // Try searching by DNI first if it looks like a number
    const isNumeric = /^\d+$/.test(searchTerm.trim())

    let response: any
    if (isNumeric) {
      response = await get<any>(`persona/`, { dni: searchTerm.trim() })
    } else {
      // Search by name
      response = await get<any>(`persona/`, { search: searchTerm.trim() })
    }

    const results = response?.results || response || []
    console.log(`[PersonasRelacionadas] Search results:`, results)
    return results
  } catch (error: any) {
    console.error(`[PersonasRelacionadas] Error searching personas:`, error)
    return []
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a persona can be added as relacionada
 * Validates that persona is not already related and is not the same as the NNyA
 *
 * @param personaId Persona ID to check
 * @param existingRelaciones Current personas relacionadas
 * @param nnyaId ID of the NNyA (to prevent self-reference)
 * @returns Error message or null if valid
 */
export const validateCanAddPersonaRelacionada = (
  personaId: number,
  existingRelaciones: PersonaVinculo[],
  nnyaId: number
): string | null => {
  if (personaId === nnyaId) {
    return 'No se puede vincular una persona consigo misma'
  }

  const existingActive = existingRelaciones.find(
    (r) => r.persona_destino === personaId && r.activo
  )

  if (existingActive) {
    return 'Esta persona ya está vinculada como persona relacionada'
  }

  return null
}
