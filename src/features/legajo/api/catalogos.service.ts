/**
 * API Service for Catalog Data (Dropdowns)
 * Endpoints: Various catalog endpoints for urgencias, zonas, users, locales
 */

import { get } from '@/app/api/apiService'
import { extractArray } from '@/hooks/useApiQuery'
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
    // ⚠️ ADVERTENCIA: No existe un endpoint específico para catálogo de urgencias en API
    // /api/vulneracion/ retorna TVulneracion[] (vulneraciones de demandas), NO catálogos
    //
    // Opciones:
    // 1. Crear endpoint backend: /api/urgencias/ o /api/catalogo/urgencias/
    // 2. Usar datos mock temporales
    // 3. Obtener de /api/registro-demanda-form-dropdowns/

    console.warn('⚠️ Endpoint de urgencias no existe - usando datos mock temporales')

    // MOCK DATA TEMPORAL - Reemplazar cuando exista el endpoint real
    // Orden correcto: Alta (1) = más urgente, Baja (3) = menos urgente
    const mockUrgencias: UrgenciaVulneracion[] = [
      { id: 1, nombre: 'Alta', descripcion: 'Urgencia alta' },
      { id: 2, nombre: 'Media', descripcion: 'Urgencia media' },
      { id: 3, nombre: 'Baja', descripcion: 'Urgencia baja' },
    ]

    return mockUrgencias

    // Descomentar cuando exista el endpoint real:
    // const response = await get<UrgenciaVulneracion[]>('urgencias/')
    // console.log('Urgencias fetched:', response)
    // return response
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
    const response = await get<ZonaInfo[] | { results: ZonaInfo[] }>('zonas/')
    const zonas = extractArray(response)

    console.log('Zonas fetched:', zonas)
    return zonas
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
    // Endpoint: /api/users-zonas/?zona={zonaId}
    // Response includes expanded user data (user_detail) with the user information

    interface UserZonaResponse {
      id: number
      user: number
      zona: number
      jefe: boolean
      director: boolean
      legal: boolean
      localidad: number | null
      // Expanded user details from backend
      user_detail?: {
        id: number
        username: string
        first_name: string
        last_name: string
        email: string
      }
    }

    // Obtener relaciones users-zonas con datos de usuario expandidos
    const userZonasResponse = await get<UserZonaResponse[] | { results: UserZonaResponse[] }>(
      'users-zonas/',
      { zona: zonaId, page_size: 500 }
    )
    const userZonas = extractArray(userZonasResponse)

    console.log(`UserZonas for zona ${zonaId}:`, userZonas)

    if (userZonas.length === 0) {
      return []
    }

    // Map user details from expanded response
    const users: UserInfo[] = userZonas
      .filter((uz: UserZonaResponse) => uz.user_detail)
      .map((uz: UserZonaResponse) => {
        const detail = uz.user_detail!
        return {
          id: detail.id,
          username: detail.username,
          first_name: detail.first_name,
          last_name: detail.last_name,
          email: detail.email,
          nombre_completo: detail.first_name && detail.last_name
            ? `${detail.first_name} ${detail.last_name}`.trim()
            : detail.username
        }
      })

    console.log(`Users for zona ${zonaId} fetched:`, users)
    return users
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
    // Endpoint correcto: /api/locales-centro-vida/?zona={zonaId}
    const response = await get<LocalCentroVida[] | { results: LocalCentroVida[] }>('locales-centro-vida/', { zona: zonaId })
    const locales = extractArray(response)

    console.log(`Locales for zona ${zonaId} fetched:`, locales)
    return locales
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
