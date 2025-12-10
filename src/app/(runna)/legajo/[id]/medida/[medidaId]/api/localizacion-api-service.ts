/**
 * API Service for Localizacion operations
 * Provides direct access to localization data
 */

import { get } from "@/app/api/apiService"
import type { LocalizacionPersona } from "../types/persona-data"

/**
 * Fetch localizacion by ID
 * @param localizacionId Localizacion ID
 * @returns Localization data
 */
export const fetchLocalizacionById = async (
  localizacionId: number
): Promise<LocalizacionPersona> => {
  try {
    console.log(`Fetching localizacion ${localizacionId}`)
    const response = await get<LocalizacionPersona>(`localizacion/${localizacionId}/`)
    return response
  } catch (error: any) {
    console.error(`Error fetching localizacion ${localizacionId}:`, error)
    throw error
  }
}

/**
 * Fetch persona localizacion (primary localization for a persona)
 * @param personaId Persona ID
 * @returns Primary localization data for the persona
 */
export const fetchPersonaLocalizacion = async (
  personaId: number
): Promise<{ localizacion: LocalizacionPersona; principal: boolean } | null> => {
  try {
    console.log(`Fetching primary localizacion for persona ${personaId}`)
    const response = await get<any>(`localizacion-persona/${personaId}/`)

    if (!response?.localizacion) {
      return null
    }

    return {
      localizacion: response.localizacion,
      principal: response.principal ?? true,
    }
  } catch (error: any) {
    console.error(`Error fetching persona localizacion ${personaId}:`, error)
    if (error?.response?.status === 404) {
      return null // No localization data available
    }
    throw error
  }
}

/**
 * Fetch all localizations for a persona
 * @param personaId Persona ID
 * @returns All localization data for the persona
 */
export const fetchPersonaLocalizaciones = async (
  personaId: number
): Promise<Array<{ localizacion: LocalizacionPersona; principal: boolean }>> => {
  try {
    console.log(`Fetching all localizations for persona ${personaId}`)
    const response = await get<any[]>(`persona/${personaId}/localizaciones/`)
    return response || []
  } catch (error: any) {
    console.error(`Error fetching persona localizaciones ${personaId}:`, error)
    if (error?.response?.status === 404) {
      return [] // No localization data available
    }
    throw error
  }
}

/**
 * Build full address string from localizacion data
 * @param localizacion Localization data
 * @returns Formatted address string
 */
export const buildFullAddress = (localizacion: LocalizacionPersona | null): string => {
  if (!localizacion) return "N/A"

  const parts: string[] = []

  if (localizacion.tipo_calle && localizacion.calle) {
    parts.push(`${localizacion.tipo_calle} ${localizacion.calle}`)
  } else if (localizacion.calle) {
    parts.push(localizacion.calle)
  }

  if (localizacion.casa_nro) {
    parts.push(`N° ${localizacion.casa_nro}`)
  }

  if (localizacion.piso_depto) {
    parts.push(`Piso ${localizacion.piso_depto}`)
  }

  if (localizacion.lote) {
    parts.push(`Lote ${localizacion.lote}`)
  }

  if (localizacion.mza) {
    parts.push(`Mza ${localizacion.mza}`)
  }

  return parts.length > 0 ? parts.join(", ") : "N/A"
}

/**
 * Get locality name from localizacion
 * @param localizacion Localization data
 * @returns Locality name
 */
export const getLocalidadNombre = (localizacion: LocalizacionPersona | null): string => {
  return localizacion?.localidad?.nombre || "N/A"
}
