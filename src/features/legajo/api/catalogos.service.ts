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
    // ⚠️ ADVERTENCIA: No existe un endpoint específico para catálogo de urgencias en API
    // /api/vulneracion/ retorna TVulneracion[] (vulneraciones de demandas), NO catálogos
    //
    // Opciones:
    // 1. Crear endpoint backend: /api/urgencias/ o /api/catalogo/urgencias/
    // 2. Usar datos mock temporales
    // 3. Obtener de /api/registro-demanda-form-dropdowns/

    console.warn('⚠️ Endpoint de urgencias no existe - usando datos mock temporales')

    // MOCK DATA TEMPORAL - Reemplazar cuando exista el endpoint real
    const mockUrgencias: UrgenciaVulneracion[] = [
      { id: 1, nombre: 'Baja', descripcion: 'Urgencia baja' },
      { id: 2, nombre: 'Media', descripcion: 'Urgencia media' },
      { id: 3, nombre: 'Alta', descripcion: 'Urgencia alta' },
      { id: 4, nombre: 'Muy Alta', descripcion: 'Urgencia muy alta' },
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
    // Endpoint: /api/users-zonas/?zona={zonaId}
    // Retorna: { id, user: <user_id>, zona, jefe, director, legal }
    // NOTA: 'user' es solo el ID, NO el objeto completo

    interface UserZonaResponse {
      id: number
      user: number  // ← Solo el ID del usuario
      zona: number
      jefe: boolean
      director: boolean
      legal: boolean
      localidad: number | null
    }

    // 1. Obtener relaciones users-zonas
    const userZonas = await get<UserZonaResponse[]>('users-zonas/', { zona: zonaId })

    console.log(`UserZonas for zona ${zonaId}:`, userZonas)

    if (userZonas.length === 0) {
      return []
    }

    // 2. Extraer IDs de usuarios
    const userIds = userZonas.map(uz => uz.user)

    // 3. Obtener todos los usuarios del sistema
    const allUsers = await get<UserInfo[]>('users/')

    // 4. Filtrar solo los usuarios que están en la zona
    const usersInZona = allUsers.filter(user => userIds.includes(user.id))

    // 5. Asegurar que cada usuario tenga nombre_completo
    const usersWithNombreCompleto = usersInZona.map(user => ({
      ...user,
      nombre_completo: user.nombre_completo ||
                       (user.first_name && user.last_name
                         ? `${user.first_name} ${user.last_name}`.trim()
                         : user.username)
    }))

    console.log(`Users for zona ${zonaId} fetched:`, usersWithNombreCompleto)
    return usersWithNombreCompleto
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
    const response = await get<LocalCentroVida[]>('locales-centro-vida/', { zona: zonaId })

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
