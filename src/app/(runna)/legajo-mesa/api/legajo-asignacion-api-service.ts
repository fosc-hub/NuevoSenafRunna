/**
 * Servicio API para gestión de asignación de legajos (BE-06)
 * Integración con endpoints /api/legajo/{id}/* del backend
 */

import { get, create, patch } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import { toast } from "react-toastify"
import type {
  DerivacionLegajoRequest,
  AsignacionLegajoRequest,
  ReasignacionLegajoRequest,
  RederivacionLegajoRequest,
  HistorialAsignacion,
  Zona,
  Usuario,
  LocalCentroVida,
  AsignacionResponse,
} from "../types/asignacion-types"

/**
 * Derivar legajo a zona
 * POST /api/legajo/{id}/derivar/
 */
export const derivarLegajo = async (
  legajoId: number,
  data: DerivacionLegajoRequest
): Promise<AsignacionResponse> => {
  return create<AsignacionResponse>(`legajo/${legajoId}/derivar/`, data, true, 'Legajo derivado exitosamente')
}

/**
 * Asignar responsable específico en zona
 * POST /api/legajo/{id}/asignar/
 */
export const asignarLegajo = async (
  legajoId: number,
  data: AsignacionLegajoRequest
): Promise<AsignacionResponse> => {
  return create<AsignacionResponse>(`legajo/${legajoId}/asignar/`, data, true, 'Responsable asignado exitosamente')
}

/**
 * Modificar responsable existente
 * PATCH /api/legajo/{id}/reasignar/
 */
export const reasignarLegajo = async (
  legajoId: number,
  data: ReasignacionLegajoRequest
): Promise<AsignacionResponse> => {
  const response = await axiosInstance.patch<AsignacionResponse>(
    `legajo/${legajoId}/reasignar/`,
    data
  )

  toast.success('Responsable reasignado exitosamente')

  return response.data
}

/**
 * Re-derivar a otra zona (desactiva asignación actual)
 * POST /api/legajo/{id}/rederivar/
 */
export const rederivarLegajo = async (
  legajoId: number,
  data: RederivacionLegajoRequest
): Promise<AsignacionResponse> => {
  return create<AsignacionResponse>(`legajo/${legajoId}/rederivar/`, data, true, 'Legajo re-derivado exitosamente')
}

/**
 * Obtener historial completo de derivaciones y asignaciones
 * GET /api/legajo/{id}/historial-asignaciones/
 */
export const fetchHistorialAsignaciones = async (legajoId: number): Promise<HistorialAsignacion[]> => {
  return await get<HistorialAsignacion[]>(`legajo/${legajoId}/historial-asignaciones/`)
}

/**
 * Obtener información básica del legajo para asignación
 * GET /api/legajo/{id}/
 */
export const fetchLegajoParaAsignacion = async (legajoId: number): Promise<any> => {
  return await get(`legajo/${legajoId}/`)
}

// ============================================
// ENDPOINTS DE SOPORTE (Dropdowns y filtros)
// ============================================

/**
 * Obtener lista de zonas
 * GET /api/zonas/
 */
export const fetchZonas = async (): Promise<Zona[]> => {
  return await get<Zona[]>("zonas/")
}

/**
 * Obtener lista de locales de centro de vida
 * GET /api/locales-centro-vida/
 */
export const fetchLocalesCentroVida = async (): Promise<LocalCentroVida[]> => {
  return await get<LocalCentroVida[]>("locales-centro-vida/")
}

interface UserZonaWithInfo {
  id: number
  user: number
  zona: number
  jefe: boolean
  director: boolean
  legal: boolean
  localidad: number | null
  user_info: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    is_active: boolean
  }
}

/**
 * Obtener lista de usuarios por zona usando users-zonas con user_info
 * GET /api/users-zonas/?zona={zonaId}
 */
export const fetchUsuariosPorZona = async (zonaId: number): Promise<Usuario[]> => {
  const response = await get<{ results: UserZonaWithInfo[] } | UserZonaWithInfo[]>(
    `users-zonas/?zona=${zonaId}&page_size=500`
  )

  const results = Array.isArray(response) ? response : response.results || []

  return results
    .filter((uz) => uz.user_info)
    .map((uz) => ({
      id: uz.user_info.id,
      username: uz.user_info.username,
      first_name: uz.user_info.first_name,
      last_name: uz.user_info.last_name,
      email: uz.user_info.email,
      is_active: uz.user_info.is_active,
    }))
}

/**
 * Obtener relación usuarios-zonas con user_info
 * GET /api/users-zonas/
 */
export const fetchUsersZonas = async (): Promise<UserZonaWithInfo[]> => {
  const response = await get<{ results: UserZonaWithInfo[] } | UserZonaWithInfo[]>("users-zonas/?page_size=500")
  return Array.isArray(response) ? response : response.results || []
}

interface UsuarioCompleto {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  is_superuser?: boolean
  is_staff?: boolean
  nombre_completo?: string
  groups?: { id: number; name: string }[]
  zonas?: { zona: number; jefe: boolean; director: boolean; legal: boolean }[]
}

/**
 * Obtener lista completa de usuarios
 * GET /api/users/
 */
export const fetchUsuarios = async (): Promise<UsuarioCompleto[]> => {
  const response = await get<{ results: UsuarioCompleto[] } | UsuarioCompleto[]>("users/?page_size=500")
  return Array.isArray(response) ? response : response.results || []
}
