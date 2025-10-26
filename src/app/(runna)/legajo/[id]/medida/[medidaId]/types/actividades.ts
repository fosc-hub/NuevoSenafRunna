// TypeScript type definitions for PLTM-01 Activity Management System
// Backend API: stories/RUNNA API (8).yaml

// Activity Types Catalog
export interface TTipoActividad {
  id: number
  actor: 'EQUIPO_TECNICO' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION' | 'EQUIPO_LEGAL'
  actor_display: string
  nombre: string
  descripcion?: string
  requiere_evidencia: boolean
  activo: boolean
  orden: number
  fecha_creacion: string
}

// Attachment
export interface TAdjuntoActividad {
  id: number
  tipo_adjunto: 'ACTA_COMPROMISO' | 'EVIDENCIA' | 'INFORME' | 'FOTO' | 'OTRO'
  tipo_adjunto_display: string
  archivo: string
  archivo_url: string
  descripcion?: string
  fecha_carga: string
  usuario_carga: number
  usuario_carga_info: {
    id: number
    username: string
    full_name: string
  }
}

// User info interface (for responsible users)
export interface TUsuarioInfo {
  id: number
  username: string
  full_name: string
}

// Activity
export interface TActividadPlanTrabajo {
  id: number
  plan_trabajo: number

  // Type & Classification
  tipo_actividad: number
  tipo_actividad_info: TTipoActividad
  subactividad: string
  actor: 'EQUIPO_TECNICO' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION' | 'EQUIPO_LEGAL'
  actor_display: string

  // Temporal Planning
  fecha_planificacion: string
  fecha_inicio_real?: string
  fecha_finalizacion_real?: string

  // State (PLTM-02: Updated to include legal approval states)
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'
  estado_display: string

  // Legal Approval (PLTM-02)
  requiere_visado_legales?: boolean

  // Description
  descripcion?: string

  // Responsible Users
  responsable_principal: number
  responsable_principal_info: TUsuarioInfo
  responsables_secundarios: number[]
  responsables_secundarios_info: TUsuarioInfo[]

  // External Referents
  referentes_externos?: string

  // Origin
  origen: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO'
  origen_display: string
  origen_demanda?: number
  origen_oficio?: number

  // Draft
  es_borrador: boolean

  // Audit
  usuario_creacion: number
  usuario_creacion_info: TUsuarioInfo
  fecha_creacion: string
  usuario_modificacion?: number
  fecha_modificacion: string

  // Cancellation
  motivo_cancelacion?: string
  fecha_cancelacion?: string
  usuario_cancelacion?: number

  // Computed
  esta_vencida: boolean
  dias_restantes: number

  // Attachments
  adjuntos: TAdjuntoActividad[]
}

// API Request/Response types
export interface CreateActividadRequest {
  plan_trabajo: number
  tipo_actividad: number
  subactividad: string
  fecha_planificacion: string
  descripcion?: string
  responsable_principal: number
  responsables_secundarios?: number[]
  referentes_externos?: string
  origen?: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO'
  origen_demanda?: number
  origen_oficio?: number
  es_borrador?: boolean
  adjuntos_archivos?: File[]
  adjuntos_tipos?: string[]
  adjuntos_descripciones?: string[]
}

export interface UpdateActividadRequest {
  tipo_actividad?: number
  subactividad?: string
  fecha_planificacion?: string
  descripcion?: string
  responsable_principal?: number
  responsables_secundarios?: number[]
  referentes_externos?: string
  estado?: 'PENDIENTE' | 'EN_PROGRESO' | 'REALIZADA' | 'CANCELADA' | 'VENCIDA'
  es_borrador?: boolean
  motivo_cancelacion?: string
}

export interface ActividadFilters {
  estado?: string
  actor?: string
  responsable_principal?: number
  fecha_desde?: string
  fecha_hasta?: string
  origen?: string
  es_borrador?: boolean
  ordering?: string
  search?: string
}

export interface ActividadListResponse {
  count: number
  next?: string
  previous?: string
  results: TActividadPlanTrabajo[]
}

// ============================================================================
// PLTM-02: Acción sobre Actividad - New Types
// Backend API: stories/RUNNA API (9).yaml (lines 462-817)
// ============================================================================

/**
 * Comment on activity with @mention support
 * Endpoint: POST /api/actividades/{id}/comentarios/
 */
export interface TComentarioActividad {
  id: number
  actividad_id: number
  autor: {
    id: number
    username: string
    nombre_completo: string
  }
  texto: string
  menciones: Array<{
    id: number
    username: string
    nombre_completo: string
  }>
  fecha_creacion: string
  editado: boolean
  fecha_edicion?: string
  notificaciones_enviadas: number
}

/**
 * Activity history entry (immutable audit trail)
 * Endpoint: GET /api/actividades/{id}/historial/
 */
export interface THistorialActividad {
  id: number
  actividad_id: number
  usuario: {
    id: number
    username: string
    nombre_completo: string
  }
  fecha_accion: string
  tipo_accion: 'CREACION' | 'CAMBIO_ESTADO' | 'EDICION_CAMPOS' | 'REAPERTURA' | 'ASIGNACION' | 'ADJUNTO_AGREGADO' | 'COMENTARIO' | 'VISADO_APROBADO' | 'VISADO_RECHAZADO' | 'TRANSFERENCIA'
  estado_anterior?: string
  estado_nuevo?: string
  campos_modificados?: Record<string, { antes: any; despues: any }>
  motivo?: string
  observaciones?: string
}

/**
 * Activity transfer between teams
 * Endpoints: GET /api/actividades/{id}/transferencias/, POST /api/actividades/{id}/transferir/
 */
export interface TTransferenciaActividad {
  id: number
  actividad_id: number
  equipo_origen: {
    id: number
    nombre: string
    zona: string
  }
  equipo_destino: {
    id: number
    nombre: string
    zona: string
  }
  responsable_anterior?: {
    id: number
    username: string
    nombre_completo: string
  }
  responsable_nuevo?: {
    id: number
    username: string
    nombre_completo: string
  }
  transferido_por: {
    id: number
    username: string
    nombre_completo: string
    nivel: number
  }
  fecha_transferencia: string
  motivo: string
  estado_transferencia: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'COMPLETADA'
  observaciones?: string
}

// ============================================================================
// PLTM-02: Request Types for Actions
// ============================================================================

/**
 * Request to change activity state
 * Endpoint: POST /api/actividades/{id}/cambiar-estado/
 */
export interface CambiarEstadoRequest {
  nuevo_estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'
  motivo?: string // Required for CANCELADA
}

/**
 * Request to reopen a closed activity
 * Endpoint: POST /api/actividades/{id}/reabrir/
 */
export interface ReabrirRequest {
  motivo: string // Required, min 10 characters
}

/**
 * Request to transfer activity to another team
 * Endpoint: POST /api/actividades/{id}/transferir/
 */
export interface TransferirRequest {
  equipo_destino_id: number
  responsable_nuevo_id?: number // Optional: new responsible user
  motivo: string // Required, min 10 characters
}

/**
 * Request for legal approval/rejection (visado)
 * Endpoint: POST /api/actividades/{id}/visar/
 */
export interface VisarRequest {
  aprobado: boolean // true = VISADO_APROBADO, false = VISADO_CON_OBSERVACION
  observaciones?: string // Required if aprobado=false, min 10 characters
}

/**
 * Filters for activity history
 * Endpoint: GET /api/actividades/{id}/historial/
 */
export interface HistorialFilters {
  tipo_accion?: string
  fecha_desde?: string
  fecha_hasta?: string
  usuario?: number
  ordering?: string
}
