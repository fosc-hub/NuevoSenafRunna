/**
 * Servicio API para gestión de asignación de legajos (BE-06)
 * Integración con endpoints /api/legajo/{id}/* del backend
 */

import { get, create, patch } from "@/app/api/apiService"
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
  return patch<AsignacionResponse>(`legajo/${legajoId}/reasignar`, legajoId, data, true, 'Responsable reasignado exitosamente')
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

/**
 * Obtener lista de usuarios
 * GET /api/users/
 * Opcionalmente filtrados por zona
 */
export const fetchUsuarios = async (zonaId?: number): Promise<Usuario[]> => {
  const users = await get<Usuario[]>("users/")

  // Si se proporciona zonaId, filtrar usuarios que pertenezcan a esa zona
  if (zonaId) {
    // El filtrado se hace en el backend idealmente, pero si no:
    // Usar endpoint /api/users-zonas/ para obtener relación users-zonas
    const userZonas = await get<Array<{ user: number; zona: number }>>("users-zonas/")
    const userIdsEnZona = userZonas
      .filter((uz) => uz.zona === zonaId)
      .map((uz) => uz.user)

    return users.filter((user) => userIdsEnZona.includes(user.id))
  }

  return users
}

/**
 * Obtener relación usuarios-zonas
 * GET /api/users-zonas/
 */
export const fetchUsersZonas = async (): Promise<Array<{ id: number; user: number; zona: number }>> => {
  return await get<Array<{ id: number; user: number; zona: number }>>("users-zonas/")
}
