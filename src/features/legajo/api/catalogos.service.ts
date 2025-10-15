/**
 * API Service for Catalog Data (Dropdowns)
 * Endpoints: Various catalog endpoints for urgencias, zonas, users, locales
 */

import { get } from '@/app/api/apiService'
import type {
  UrgenciaVulneracion,
  ZonaInfo,
  UserInfo,
  LocalCentroVida,
} from '../types/legajo-creation.types'

/**
 * Get all urgencias vulneracion for dropdown
 * Endpoint TBD - adjust according to actual backend
 *
 * @returns Array of urgencias
 */
export const getUrgencias = async (): Promise<UrgenciaVulneracion[]> => {
  try {
    // Adjust endpoint according to actual API
    // Possible endpoints: urgencia-vulneracion, urgencias, catalogo/urgencias
    const response = await get<UrgenciaVulneracion[]>('urgencia-vulneracion/')

    console.log('Urgencias fetched:', response)
    return response
  } catch (error) {
    console.error('Error fetching urgencias:', error)
    // Return empty array on error
    return []
  }
}

/**
 * Get zonas available for current user (according to permissions)
 *
 * @returns Array of zonas
 */
export const getZonasDisponibles = async (): Promise<ZonaInfo[]> => {
  try {
    // This should return only zones where user has permissions
    // Backend should filter based on user permissions
    const response = await get<ZonaInfo[]>('zonas/')

    console.log('Zonas fetched:', response)
    return response
  } catch (error) {
    console.error('Error fetching zonas:', error)
    return []
  }
}

/**
 * Get users by zona
 *
 * @param zonaId - ID of zona to filter users
 * @returns Array of users in that zona
 */
export const getUsuariosPorZona = async (zonaId: number): Promise<UserInfo[]> => {
  try {
    // Adjust endpoint and query params according to actual API
    // Possible approaches:
    // 1. GET /api/usuarios/?zona={zonaId}
    // 2. GET /api/zonas/{zonaId}/usuarios/
    const response = await get<UserInfo[]>('usuarios/', { zona: zonaId })

    console.log(`Users for zona ${zonaId} fetched:`, response)
    return response
  } catch (error) {
    console.error(`Error fetching users for zona ${zonaId}:`, error)
    return []
  }
}

/**
 * Get locales centro de vida by zona
 *
 * @param zonaId - ID of zona to filter locales
 * @returns Array of locales in that zona
 */
export const getLocalesCentroVida = async (zonaId: number): Promise<LocalCentroVida[]> => {
  try {
    // Adjust endpoint according to actual API
    const response = await get<LocalCentroVida[]>('local-centro-vida/', { zona: zonaId })

    console.log(`Locales for zona ${zonaId} fetched:`, response)
    return response
  } catch (error) {
    console.error(`Error fetching locales for zona ${zonaId}:`, error)
    return []
  }
}

/**
 * Get all catalogos in a single call (optimization)
 * This is optional - use if backend provides a combined endpoint
 *
 * @returns Object with all catalogs
 */
export const getAllCatalogos = async () => {
  try {
    const [urgencias, zonas] = await Promise.all([
      getUrgencias(),
      getZonasDisponibles(),
    ])

    return {
      urgencias,
      zonas,
    }
  } catch (error) {
    console.error('Error fetching all catalogos:', error)
    return {
      urgencias: [],
      zonas: [],
    }
  }
}
