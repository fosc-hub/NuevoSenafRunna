// Global Activities Service - List activities without plan_trabajo requirement
// Endpoint: GET /api/actividades/ with optional filters
// API v12: Response now includes legajo_info and medida_info nested objects

import { get } from '@/app/api/apiService'
import { extractArray } from '@/hooks/useApiQuery'
import type {
  TActividadPlanTrabajo,
  ActividadListResponse
} from '../../[id]/medida/[medidaId]/types/actividades'

/**
 * Extended filters for global activities listing
 * Matches GET /api/actividades/ query parameters
 *
 * Note: String filter fields accept empty string '' to represent "no filter"
 * API v13: Enhanced with legajo, NNyA, medida, zone, and date range filters
 */
export interface GlobalActividadFilters {
  // ===== Basic Filters =====
  /** Filter by actor team */
  actor?: 'EQUIPO_TECNICO' | 'EQUIPO_LEGAL' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION' | ''
  /** Filter draft activities */
  es_borrador?: boolean
  /** Filter by estado (supports comma-separated for multiple: "PENDIENTE,EN_PROGRESO") */
  estado?: string
  /** Order results */
  ordering?: string
  /** Filter by origen */
  origen?: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO' | ''
  /** Filter by plan_trabajo (optional) */
  plan_trabajo?: number
  /** Multi-field search (description, type, NNyA, legajo, responsable) */
  search?: string

  // ===== Legajo (Case File) Filters =====
  /** Filter by legajo ID */
  legajo?: number
  /** Search by legajo number (contains) */
  numero_legajo?: string

  // ===== NNyA (Child) Filters =====
  /** Search by NNyA name (nombre/apellido) */
  nnya_nombre?: string
  /** Search by NNyA DNI (contains) */
  nnya_dni?: string
  /** Filter by NNyA (TPersona) ID */
  nnya_id?: number

  // ===== Medida (Protection Measure) Filters =====
  /** Filter by medida ID */
  medida?: number
  /** Filter by medida type (MPI, MPE, MPJ) */
  tipo_medida?: 'MPI' | 'MPE' | 'MPJ' | ''

  // ===== Responsable Filters =====
  /** User is principal OR secondary responsible */
  responsable?: number
  /** Filter by responsable_principal only */
  responsable_principal?: number
  /** Filter by responsable_secundario only */
  responsable_secundario?: number
  /** Filter by visador */
  visador?: number

  // ===== Zone Filter =====
  /** Filter by zone ID (via legajo) */
  zona?: number

  // ===== Activity Type Filters =====
  /** Filter by activity type ID */
  tipo_actividad?: number
  /** Search by activity type name (contains) */
  tipo_actividad_nombre?: string

  // ===== State Filters =====
  /** Filter for overdue activities */
  vencida?: boolean | string
  /** Filter for pending legal approval */
  pendiente_visado?: boolean | string
  /** Filter activities with days remaining <= this value */
  dias_restantes_max?: string
  /** Legacy: Filter for overdue activities (deprecated, use vencida) */
  vencidas?: string

  // ===== Date Range Filters =====
  /** Activity planned date from */
  fecha_desde?: string
  /** Activity planned date to */
  fecha_hasta?: string
  /** Creation date from */
  fecha_creacion_desde?: string
  /** Creation date to */
  fecha_creacion_hasta?: string

  // ===== Pagination =====
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

    const actividades = extractArray<TActividadPlanTrabajo>(response as any)

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
