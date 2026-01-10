// API Service Layer for PLTM-01 Activity Management & PLTM-02 Actions
// Backend API: stories/RUNNA API (9).yaml

import { get, create, patch, remove } from '@/app/api/apiService'
import axiosInstance from '@/app/api/utils/axiosInstance' // Only for cancel() - non-standard DELETE with payload
import type {
  TActividadPlanTrabajo,
  TTipoActividad,
  TAdjuntoActividad,
  CreateActividadRequest,
  UpdateActividadRequest,
  ActividadFilters,
  ActividadListResponse,
  // PLTM-02: Action types
  TComentarioActividad,
  THistorialActividad,
  TTransferenciaActividad,
  CambiarEstadoRequest,
  ReabrirRequest,
  TransferirRequest,
  VisarRequest,
  HistorialFilters
} from '../types/actividades'

export const actividadService = {
  // List activities with filters
  async list(planTrabajoId: number, filters?: ActividadFilters): Promise<ActividadListResponse | TActividadPlanTrabajo[]> {
    const params = new URLSearchParams({
      plan_trabajo: planTrabajoId.toString(),
      ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    })

    return get<ActividadListResponse | TActividadPlanTrabajo[]>(`actividades/?${params.toString()}`)
  },

  // Get single activity
  async get(id: number): Promise<TActividadPlanTrabajo> {
    return get<TActividadPlanTrabajo>(`actividades/${id}/`)
  },

  // Create activity
  async create(data: CreateActividadRequest): Promise<TActividadPlanTrabajo> {
    const formData = new FormData()

    // Append scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'adjuntos_archivos' || key === 'adjuntos_tipos' || key === 'adjuntos_descripciones') {
        return // Handle separately
      }
      if (key === 'responsables_secundarios' && Array.isArray(value)) {
        value.forEach(id => formData.append('responsables_secundarios', id.toString()))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    // Handle file attachments
    if (data.adjuntos_archivos) {
      data.adjuntos_archivos.forEach((file, index) => {
        formData.append('adjuntos_archivos', file)
        if (data.adjuntos_tipos?.[index]) {
          formData.append('adjuntos_tipos', data.adjuntos_tipos[index])
        }
        if (data.adjuntos_descripciones?.[index]) {
          formData.append('adjuntos_descripciones', data.adjuntos_descripciones[index])
        }
      })
    }

    return create<TActividadPlanTrabajo>('actividades/', formData, true, 'Actividad creada exitosamente')
  },

  // Update activity
  async update(id: number, data: UpdateActividadRequest): Promise<TActividadPlanTrabajo> {
    return patch<TActividadPlanTrabajo>(`actividades`, id, data)
  },

  // Cancel activity (soft delete)
  // NOTE: Uses axiosInstance because DELETE with data payload is non-standard REST
  // apiService.remove() doesn't support data payloads - backend pattern requires it
  async cancel(id: number, motivo: string): Promise<void> {
    await axiosInstance.delete(`actividades/${id}/`, { data: { motivo_cancelacion: motivo } })
  },

  // Add attachment to existing activity
  async addAttachment(actividadId: number, data: {
    tipo_adjunto: string
    archivo: File
    descripcion?: string
  }): Promise<TAdjuntoActividad> {
    const formData = new FormData()
    formData.append('tipo_adjunto', data.tipo_adjunto)
    formData.append('archivo', data.archivo)
    if (data.descripcion) {
      formData.append('descripcion', data.descripcion)
    }

    return create<TAdjuntoActividad>(`actividades/${actividadId}/adjuntos/`, formData, true, 'Adjunto agregado exitosamente')
  },

  // Get activity types catalog
  async getTipos(actor?: string): Promise<TTipoActividad[]> {
    const params = actor ? `?actor=${actor}&activo=true` : '?activo=true'
    const response = await get<TTipoActividad[] | { results: TTipoActividad[] }>(`tipos-actividad-plan-trabajo/${params}`)
    // Handle both direct array and paginated response
    return Array.isArray(response) ? response : (response as any)?.results ?? []
  },

  // Get single activity type
  async getTipo(id: number): Promise<TTipoActividad> {
    return get<TTipoActividad>(`tipos-actividad-plan-trabajo/${id}/`)
  },

  // Auto-mark overdue activities (admin only)
  async marcarVencidas(): Promise<{ count: number }> {
    return create<{ count: number }>('actividades/marcar-vencidas/', {}, true, 'Actividades vencidas marcadas')
  },

  // ============================================================================
  // PLTM-02: Acción sobre Actividad
  // Backend API: stories/RUNNA API (9).yaml (lines 462-817)
  // ============================================================================

  /**
   * Change activity state with optional reason
   * Endpoint: POST /api/actividades/{id}/cambiar-estado/
   *
   * Valid state transitions (validated by backend):
   * - PENDIENTE → EN_PROGRESO, CANCELADA
   * - EN_PROGRESO → COMPLETADA, CANCELADA, PENDIENTE
   * - COMPLETADA → PENDIENTE_VISADO (auto if requiere_visado_legales=true)
   * - PENDIENTE_VISADO → VISADO_APROBADO, VISADO_CON_OBSERVACION
   * - VISADO_CON_OBSERVACION → EN_PROGRESO
   * - VENCIDA → EN_PROGRESO, CANCELADA
   *
   * @param id - Activity ID
   * @param data - State change request (nuevo_estado required, motivo required for CANCELADA)
   * @returns Updated activity
   */
  async cambiarEstado(id: number, data: CambiarEstadoRequest): Promise<TActividadPlanTrabajo> {
    return create<TActividadPlanTrabajo>(`actividades/${id}/cambiar-estado/`, data, true, 'Estado de actividad actualizado')
  },

  /**
   * Add comment to activity with @mention support
   * Endpoint: POST /api/actividades/{id}/comentarios/
   *
   * Supports @username mentions which create notifications for mentioned users.
   * Comments are immutable after creation.
   *
   * @param id - Activity ID
   * @param texto - Comment text (supports @username mentions)
   * @returns Created comment with mention and notification info
   */
  async agregarComentario(id: number, texto: string): Promise<TComentarioActividad> {
    return create<TComentarioActividad>(`actividades/${id}/comentarios/`, { texto }, true, 'Comentario agregado')
  },

  /**
   * Get activity history (audit trail)
   * Endpoint: GET /api/actividades/{id}/historial/
   *
   * Returns immutable audit trail of all changes to the activity.
   * Includes: state changes, field edits, transfers, approvals, etc.
   *
   * @param id - Activity ID
   * @param filters - Optional filters (tipo_accion, fecha_desde, fecha_hasta, usuario, ordering)
   * @returns Array of history entries sorted by date (newest first by default)
   */
  async getHistorial(id: number, filters?: HistorialFilters): Promise<THistorialActividad[]> {
    const params = filters ? new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''

    const endpoint = params ? `actividades/${id}/historial/?${params}` : `actividades/${id}/historial/`
    return get<THistorialActividad[]>(endpoint)
  },

  /**
   * Reopen a closed activity (COMPLETADA, CANCELADA, or VISADO_APROBADO)
   * Endpoint: POST /api/actividades/{id}/reabrir/
   *
   * Permission: JZ (nivel 3+), Director (nivel 4+), Admin only
   * Changes state to EN_PROGRESO and records reason in history.
   *
   * @param id - Activity ID
   * @param data - Reopen request (motivo required, min 10 characters)
   * @returns Updated activity in EN_PROGRESO state
   */
  async reabrir(id: number, data: ReabrirRequest): Promise<TActividadPlanTrabajo> {
    return create<TActividadPlanTrabajo>(`actividades/${id}/reabrir/`, data, true, 'Actividad reabierta')
  },

  /**
   * Get transfer history for an activity
   * Endpoint: GET /api/actividades/{id}/transferencias/
   *
   * Returns all transfers (completed and pending) for the activity.
   * Includes source/destination teams, responsible users, and status.
   *
   * @param id - Activity ID
   * @returns Array of transfer records sorted by date (newest first)
   */
  async getTransferencias(id: number): Promise<TTransferenciaActividad[]> {
    return get<TTransferenciaActividad[]>(`actividades/${id}/transferencias/`)
  },

  /**
   * Transfer activity to another team
   * Endpoint: POST /api/actividades/{id}/transferir/
   *
   * Permission: JZ (nivel 3), Director (nivel 4) only
   * Changes activity's team and optionally assigns new responsible user.
   * Creates immutable transfer record in history.
   *
   * @param id - Activity ID
   * @param data - Transfer request (equipo_destino_id, optional responsable_nuevo_id, motivo min 10 chars)
   * @returns Created transfer record
   */
  async transferir(id: number, data: TransferirRequest): Promise<TTransferenciaActividad> {
    return create<TTransferenciaActividad>(`actividades/${id}/transferir/`, data, true, 'Actividad transferida')
  },

  /**
   * Legal approval or rejection (visado)
   * Endpoint: POST /api/actividades/{id}/visar/
   *
   * Permission: Legal team members (legal=true) only
   * Activity must be in PENDIENTE_VISADO state.
   * - aprobado=true → VISADO_APROBADO (activity completed)
   * - aprobado=false → VISADO_CON_OBSERVACION (returns to EN_PROGRESO for corrections)
   *
   * @param id - Activity ID
   * @param data - Approval request (aprobado boolean, observaciones required if rejected, min 10 chars)
   * @returns Updated activity with new visado state
   */
  async visar(id: number, data: VisarRequest): Promise<TActividadPlanTrabajo> {
    return create<TActividadPlanTrabajo>(`actividades/${id}/visar/`, data, true, data.aprobado ? 'Visado aprobado' : 'Visado con observaciones')
  }
}
