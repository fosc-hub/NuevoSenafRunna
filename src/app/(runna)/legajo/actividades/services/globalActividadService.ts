// Global Activities Service - List activities without plan_trabajo requirement
// Endpoint: GET /api/actividades/ with optional filters
// API v12: Response now includes legajo_info and medida_info nested objects

import { get } from '@/app/api/apiService'
import type {
  TActividadPlanTrabajo,
  ActividadListResponse
} from '../../[id]/medida/[medidaId]/types/actividades'

/**
 * Extended filters for global activities listing
 * Matches GET /api/actividades/ query parameters
 *
 * Note: String filter fields accept empty string '' to represent "no filter"
 */
export interface GlobalActividadFilters {
  /** Filter by actor team */
  actor?: 'EQUIPO_TECNICO' | 'EQUIPO_LEGAL' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION' | ''
  /** Filter draft activities */
  es_borrador?: boolean
  /** Filter by estado */
  estado?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA' | ''
  /** Order results */
  ordering?: string
  /** Filter by origen */
  origen?: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO' | ''
  /** Filter by plan_trabajo (optional) */
  plan_trabajo?: number
  /** Filter by responsable_principal */
  responsable_principal?: number
  /** Search term */
  search?: string
  /** Filter by visador */
  visador?: number
  /** Filter for overdue activities */
  vencidas?: string
  /** Filter activities with days remaining <= this value */
  dias_restantes_max?: string
  /** Page number for pagination */
  page?: number
  /** Page size */
  page_size?: number
}

/**
 * Global Activities Service
 *
 * Unlike actividadService.list() which requires plan_trabajo,
 * this service lists activities globally for the current user.
 */
export const globalActividadService = {
  /**
   * List activities with optional filters
   * Endpoint: GET /api/actividades/
   *
   * @param filters - Optional filters to apply
   * @returns Paginated list of activities or array
   */
  async list(filters?: GlobalActividadFilters): Promise<ActividadListResponse | TActividadPlanTrabajo[]> {
    const params = new URLSearchParams(
      Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    )

    const queryString = params.toString()
    const endpoint = queryString ? `actividades/?${queryString}` : 'actividades/'

    return get<ActividadListResponse | TActividadPlanTrabajo[]>(endpoint)
  },

  /**
   * Get activity counts by estado for statistics
   * Uses the list endpoint with no pagination to get totals
   */
  async getStatistics(baseFilters?: Omit<GlobalActividadFilters, 'page' | 'page_size'>): Promise<{
    total: number
    pendientes: number
    enProgreso: number
    completadas: number
    pendienteVisado: number
    visadoAprobado: number
    canceladas: number
    vencidas: number
  }> {
    // Fetch all activities for statistics (no pagination)
    const response = await this.list({
      ...baseFilters,
      page_size: 1000 // Large page size to get all for stats
    })

    const actividades = Array.isArray(response) ? response : response.results

    return {
      total: actividades.length,
      pendientes: actividades.filter(a => a.estado === 'PENDIENTE').length,
      enProgreso: actividades.filter(a => a.estado === 'EN_PROGRESO').length,
      completadas: actividades.filter(a => a.estado === 'COMPLETADA').length,
      pendienteVisado: actividades.filter(a => a.estado === 'PENDIENTE_VISADO').length,
      visadoAprobado: actividades.filter(a => a.estado === 'VISADO_APROBADO').length,
      canceladas: actividades.filter(a => a.estado === 'CANCELADA').length,
      vencidas: actividades.filter(a => a.esta_vencida && a.estado !== 'CANCELADA').length
    }
  }
}
