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

  // State
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'REALIZADA' | 'CANCELADA' | 'VENCIDA'
  estado_display: string

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
