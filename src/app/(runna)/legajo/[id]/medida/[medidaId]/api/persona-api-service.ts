/**
 * API Service for Persona-related operations
 * Provides direct access to persona data without fetching entire demanda full-detail
 */

import { get } from "@/app/api/apiService"
import type {
  PersonaCompleta,
  LocalizacionPersona,
  EducacionPersona,
  CoberturaMedica,
  PersonaEnfermedad,
  PersonaCondicionVulnerabilidad,
  PersonaVulneracion,
} from "../types/persona-data"

/**
 * Fetch persona localization data directly
 * @param personaId Persona ID
 * @returns Localization data for the persona
 */
export const fetchPersonaLocalizacion = async (
  personaId: number
): Promise<LocalizacionPersona | null> => {
  try {
    console.log(`🚀 API CALL: Fetching localizacion for persona ${personaId} from /api/localizacion-persona/${personaId}/`)
    const response = await get<any>(`localizacion-persona/${personaId}/`)
    console.log(`✅ API RESPONSE: Localizacion data received:`, response)
    return response?.localizacion || null
  } catch (error: any) {
    console.error(`❌ API ERROR: Failed to fetch persona localizacion ${personaId}:`, error)
    if (error?.response?.status === 404) {
      console.log(`ℹ️ 404 Not Found - Localizacion endpoint not available for persona ${personaId}`)
      return null // No localization data available
    }
    throw error
  }
}

/**
 * Fetch persona education data
 * @param personaId Persona ID
 * @returns Education data for the persona
 */
export const fetchPersonaEducacion = async (
  personaId: number
): Promise<EducacionPersona | null> => {
  try {
    console.log(`Fetching educacion for persona ${personaId}`)
    const response = await get<any>(`persona/${personaId}/educacion/`)
    return response?.educacion || null
  } catch (error: any) {
    console.error(`Error fetching persona educacion ${personaId}:`, error)
    if (error?.response?.status === 404) {
      return null // No education data available
    }
    throw error
  }
}

/**
 * Fetch persona medical coverage data
 * @param personaId Persona ID
 * @returns Medical coverage and health conditions
 */
export const fetchPersonaCoberturaMedica = async (
  personaId: number
): Promise<{ cobertura_medica: CoberturaMedica | null; persona_enfermedades: PersonaEnfermedad[] }> => {
  try {
    console.log(`Fetching cobertura medica for persona ${personaId}`)
    const response = await get<any>(`persona/${personaId}/cobertura-medica/`)
    return {
      cobertura_medica: response?.cobertura_medica || null,
      persona_enfermedades: response?.persona_enfermedades || [],
    }
  } catch (error: any) {
    console.error(`Error fetching persona cobertura medica ${personaId}:`, error)
    if (error?.response?.status === 404) {
      return { cobertura_medica: null, persona_enfermedades: [] }
    }
    throw error
  }
}

/**
 * Fetch persona vulnerability conditions
 * @param personaId Persona ID
 * @returns Vulnerability conditions and vulneraciones
 */
export const fetchPersonaCondicionesVulnerabilidad = async (
  personaId: number
): Promise<{ condiciones_vulnerabilidad: PersonaCondicionVulnerabilidad[]; vulneraciones: PersonaVulneracion[] }> => {
  try {
    console.log(`Fetching condiciones vulnerabilidad for persona ${personaId}`)
    const response = await get<any>(`persona/${personaId}/vulnerabilidad/`)
    return {
      condiciones_vulnerabilidad: response?.condiciones_vulnerabilidad || [],
      vulneraciones: response?.vulneraciones || [],
    }
  } catch (error: any) {
    console.error(`Error fetching persona vulnerabilidad ${personaId}:`, error)
    if (error?.response?.status === 404) {
      return { condiciones_vulnerabilidad: [], vulneraciones: [] }
    }
    throw error
  }
}

/**
 * Fetch complete persona data from demanda full-detail
 * This is a fallback when direct endpoints are not available
 * @param demandaId Demanda ID
 * @param personaId Persona ID to find in the demanda
 * @returns Complete persona data
 */
export const fetchPersonaFromDemanda = async (
  demandaId: number,
  personaId: number
): Promise<PersonaCompleta | null> => {
  try {
    console.log(`Fetching persona ${personaId} from demanda ${demandaId}`)
    const response = await get<any>(`registro-demanda-form/${demandaId}/full-detail/`)

    // Find the persona in the personas array
    const personas = response?.personas || []
    const personaData = personas.find((p: any) => p.persona?.id === personaId)

    if (!personaData) {
      console.warn(`Persona ${personaId} not found in demanda ${demandaId}`)
      return null
    }

    return personaData as PersonaCompleta
  } catch (error: any) {
    console.error(`Error fetching persona from demanda:`, error)
    throw error
  }
}

/**
 * Fetch complete persona data using optimized endpoints
 * Uses direct API calls instead of full-detail when possible
 * @param personaId Persona ID
 * @param demandaId Optional demanda ID for fallback
 * @returns Complete persona data
 */
export const fetchPersonaCompleta = async (
  personaId: number,
  demandaId?: number
): Promise<PersonaCompleta | null> => {
  try {
    // Try to fetch data from direct endpoints in parallel
    const [localizacion, educacion, salud, vulnerabilidad] = await Promise.allSettled([
      fetchPersonaLocalizacion(personaId),
      fetchPersonaEducacion(personaId),
      fetchPersonaCoberturaMedica(personaId),
      fetchPersonaCondicionesVulnerabilidad(personaId),
    ])

    // If all direct endpoints failed and we have a demanda ID, use fallback
    const allFailed = [localizacion, educacion, salud, vulnerabilidad].every(
      (result) => result.status === "rejected"
    )

    if (allFailed && demandaId) {
      console.log("All direct endpoints failed, using demanda fallback")
      return await fetchPersonaFromDemanda(demandaId, personaId)
    }

    // Combine results from direct endpoints
    const personaCompleta: Partial<PersonaCompleta> = {
      localizacion: localizacion.status === "fulfilled" ? localizacion.value : null,
      educacion: educacion.status === "fulfilled" ? educacion.value : null,
      cobertura_medica: salud.status === "fulfilled" ? salud.value.cobertura_medica : null,
      persona_enfermedades: salud.status === "fulfilled" ? salud.value.persona_enfermedades : [],
      condiciones_vulnerabilidad:
        vulnerabilidad.status === "fulfilled" ? vulnerabilidad.value.condiciones_vulnerabilidad : [],
      vulneraciones: vulnerabilidad.status === "fulfilled" ? vulnerabilidad.value.vulneraciones : [],
      demanda_persona: null, // Not available from direct endpoints
    }

    // If we have demanda ID and missing critical data, fetch from demanda as fallback
    if (demandaId && !personaCompleta.localizacion) {
      try {
        const demandaData = await fetchPersonaFromDemanda(demandaId, personaId)
        if (demandaData) {
          // Merge with existing data, preferring direct endpoint data
          return {
            ...demandaData,
            ...personaCompleta,
            persona: demandaData.persona,
          }
        }
      } catch (error) {
        console.warn("Failed to fetch fallback data from demanda:", error)
      }
    }

    return personaCompleta as PersonaCompleta
  } catch (error: any) {
    console.error(`Error fetching persona completa ${personaId}:`, error)
    throw error
  }
}
