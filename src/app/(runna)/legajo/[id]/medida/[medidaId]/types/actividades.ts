// TypeScript type definitions for PLTM-01 Activity Management System
// Backend API: stories/RUNNA API (9).yaml

// ============================================================================
// TIPO OFICIO (for OFICIO-type activities)
// ============================================================================

export interface TTipoOficio {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  orden: number
}

// ============================================================================
// ACTIVITY TYPES CATALOG (TTipoActividadPlanTrabajo)
// ============================================================================

/**
 * TTipoActividad - Activity type catalog
 *
 * Source: RUNNA API (9).yaml lines 13812-13928
 * Endpoint: GET /api/tipos-actividad-plan-trabajo/
 *
 * V2: Updated with fields for tipo, aplicabilidad, and visado
 * V2.2: tipo_oficio changed from ENUM to ForeignKey
 * LEG-01 V2: Added permite_gestion_grupal for group activity management with linked siblings
 */
export interface TTipoActividad {
  /** Unique identifier (readonly) */
  id: number

  /** Activity type name (e.g., "Visita domiciliaria") */
  nombre: string

  /** Detailed description (nullable) */
  descripcion: string | null

  /** Activity type: MANUAL or OFICIO */
  tipo: 'MANUAL' | 'OFICIO'

  /** Display name for tipo (readonly) */
  tipo_display: string

  /** FK to judicial office type (only if tipo=OFICIO, nullable) */
  tipo_oficio: number | null

  /** Nested judicial office type detail (readonly) */
  tipo_oficio_detalle: TTipoOficio | null

  /** Applicable measure type (nullable) */
  tipo_medida_aplicable: 'MPI' | 'MPE' | 'MPJ' | null

  /** Display name for tipo_medida_aplicable (readonly) */
  tipo_medida_aplicable_display: string

  /** Applicable measure stage (nullable) */
  etapa_medida_aplicable: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | 'PROCESO' | null

  /** Display name for etapa_medida_aplicable (readonly) */
  etapa_medida_aplicable_display: string

  /** If true, completing activity requires mandatory attachments */
  requiere_evidencia: boolean

  /** If true, completing activity requires legal team approval (visado) */
  requiere_visado_legales: boolean

  /** Deadline in days to complete activity (nullable) */
  plazo_dias: number | null

  /**
   * LEG-01 V2: Group Activity Management
   *
   * If true, allows creating a single activity for multiple NNyA (siblings).
   * Used when NNyA are linked as HERMANOS via TVinculoLegajo.
   *
   * Example: "Visita domiciliaria grupal" can be created once for all linked siblings
   * instead of creating individual activities for each sibling.
   */
  permite_gestion_grupal: boolean

  /** Template file for this activity type (nullable) */
  plantilla_adjunta: string | null

  /** Template file URL (readonly) */
  plantilla_adjunta_url: string

  /** Whether this type is available for selection */
  activo: boolean

  /** Display order in lists */
  orden: number

  /** Creation timestamp (readonly) */
  fecha_creacion: string

  /**
   * V3.0: Actor responsible for this activity type
   * Restored from V2.2 to simplify team-based filtering and assignment
   */
  actor: 'EQUIPO_TECNICO' | 'EQUIPO_LEGAL' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION'

  /** V3.0: Display name for actor (readonly) */
  actor_display: string
}

// Attachment
export interface TAdjuntoActividad {
  id: number
  actividad: number
  archivo: string
  nombre_original: string
  tipo_mime: string
  tamanio_bytes: number
  tipo_adjunto: 'ACTA_COMPROMISO' | 'EVIDENCIA' | 'INFORME' | 'FOTO' | 'OTRO'
  tipo_adjunto_display: string
  version: number
  reemplaza_a: number | null
  activo: boolean
  usuario_carga: {
    id: number
    username: string
    nombre_completo: string
  }
  fecha_subida: string
  archivo_url: string
  descripcion?: string
}

// User info interface (for responsible users)
export interface TUsuarioInfo {
  id: number
  username: string
  full_name?: string  // Legacy field name
  nombre_completo?: string  // API field name (actual)
}

/**
 * TActividadPlanTrabajo - Activity instance in a work plan
 *
 * Source: RUNNA API (9).yaml lines 10307-10514
 * Endpoint: GET /api/actividades/
 *
 * PLTM-01 V2: Updated with 8 states and visado fields
 * PLTM-02: Added legal approval flow and new actions
 */
export interface TActividadPlanTrabajo {
  /** Unique identifier (readonly) */
  id: number

  /** Plan de trabajo this activity belongs to */
  plan_trabajo: number

  // Type & Classification
  /** FK to activity type catalog */
  tipo_actividad: number

  /** Nested activity type detail (readonly) */
  tipo_actividad_info: TTipoActividad

  /** Specific subactivity detail */
  subactividad: string

  // Temporal Planning
  /** Planned date for execution */
  fecha_planificacion: string

  /** Actual start date (readonly, set when → EN_PROGRESO) */
  fecha_inicio_real: string | null

  /** Actual completion date (readonly, set when → COMPLETADA) */
  fecha_finalizacion_real: string | null

  // State (PLTM-02: Updated to include legal approval states)
  /** Current activity state */
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'

  /** Display name for estado (readonly) */
  estado_display: string

  // Description
  /** Detailed description (nullable) */
  descripcion: string | null

  // Responsible Users
  /** Main responsible user FK */
  responsable_principal: number

  /** Main responsible user detail (readonly) */
  responsable_principal_info: TUsuarioInfo

  /** Additional collaborating users FKs */
  responsables_secundarios: number[]

  /** Additional collaborating users details (readonly) */
  responsables_secundarios_info: TUsuarioInfo[]

  // External Referents
  /** External contacts: institution, person, phone (JSON or free text, nullable) */
  referentes_externos: string | null

  // Origin
  /** Activity origin */
  origen: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO'

  /** Display name for origen (readonly) */
  origen_display: string

  // Visado (Legal Approval - PLTM-02)
  /** Legal team user who performs visado (nullable) */
  visador: number | null

  /** Legal team user detail (readonly) */
  visador_info: TUsuarioInfo | null

  /** Visado timestamp (readonly, nullable) */
  fecha_visado: string | null

  /** Legal team observations about the activity (nullable) */
  observaciones_visado: string | null

  // Draft
  /** If true, activity is in draft mode */
  es_borrador: boolean

  // Audit
  /** User who created the activity (readonly) */
  usuario_creacion: number

  /** Creator user detail (readonly) */
  usuario_creacion_info: TUsuarioInfo

  /** Creation timestamp (readonly) */
  fecha_creacion: string

  /** Last user who modified the activity (readonly, nullable) */
  usuario_modificacion: number | null

  /** Last modification timestamp (readonly) */
  fecha_modificacion: string

  // Cancellation
  /** Cancellation reason (nullable) */
  motivo_cancelacion: string | null

  /** Cancellation timestamp (readonly, nullable) */
  fecha_cancelacion: string | null

  /** User who cancelled the activity (readonly, nullable) */
  usuario_cancelacion: number | null

  // Computed (readonly)
  /** Whether the activity is overdue */
  esta_vencida: boolean

  /** Remaining days until deadline */
  dias_restantes: number

  // Attachments
  /** List of attachments (readonly) */
  adjuntos: TAdjuntoActividad[]

  // Comments
  /** List of comments (readonly, optional) */
  comentarios?: TComentarioActividad[]

  /**
   * V3.0: Actor responsible for this activity (readonly)
   * Inherited from tipo_actividad.actor, can change if activity is transferred
   */
  actor: 'EQUIPO_TECNICO' | 'EQUIPO_LEGAL' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION'

  /** V3.0: Display name for actor (readonly) */
  actor_display: string
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
  responsable_principal?: number
  fecha_desde?: string
  fecha_hasta?: string
  origen?: string
  es_borrador?: boolean
  ordering?: string
  search?: string
  /** V3.0: Filter by actor (team responsible) */
  actor?: string
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
 * Unified timeline item combining comentarios and adjuntos
 * Used for chronological display in UnifiedActivityTab
 */
export interface UnifiedTimelineItem {
  id: string // Prefixed with 'c-' for comentario or 'a-' for adjunto
  type: 'COMENTARIO' | 'ADJUNTO'
  timestamp: string // fecha_creacion for both types
  user: {
    id: number
    username: string
    nombre_completo: string
  }
  data: TComentarioActividad | TAdjuntoActividad
}

/**
 * Type guard to check if timeline item is a comentario
 */
export function isComentario(item: UnifiedTimelineItem): item is UnifiedTimelineItem & { data: TComentarioActividad } {
  return item.type === 'COMENTARIO'
}

/**
 * Type guard to check if timeline item is an adjunto
 */
export function isAdjunto(item: UnifiedTimelineItem): item is UnifiedTimelineItem & { data: TAdjuntoActividad } {
  return item.type === 'ADJUNTO'
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
  actividad: number
  equipo_origen: number
  equipo_origen_info: {
    id: number
    zona: number
  }
  equipo_destino: number
  equipo_destino_info: {
    id: number
    zona: number
  }
  responsable_anterior: number | null
  responsable_anterior_info: {
    id: number
    username: string
    nombre_completo: string
  } | null
  responsable_nuevo: number | null
  responsable_nuevo_info: {
    id: number
    username: string
    nombre_completo: string
  } | null
  transferido_por: number
  transferido_por_info: {
    id: number
    username: string
    nombre_completo: string
  }
  fecha_transferencia: string
  motivo: string
  estado_transferencia: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'COMPLETADA'
  estado_transferencia_display: string
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
  equipo_destino: number
  responsable_nuevo_id?: number // Optional: new responsible user
  motivo: string // Required, min 15 characters
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

// ============================================================================
// V3.0: Actor Types and Utilities
// ============================================================================

/**
 * Actor enum - Team responsible for activities
 * V3.0: Restored from V2.2 for team-based filtering and organization
 */
export type ActorEnum =
  | 'EQUIPO_TECNICO'
  | 'EQUIPO_LEGAL'
  | 'EQUIPOS_RESIDENCIALES'
  | 'ADULTOS_INSTITUCION'

/**
 * Actor display labels
 * Maps actor enum values to human-readable Spanish labels
 */
export const ACTOR_LABELS: Record<ActorEnum, string> = {
  EQUIPO_TECNICO: 'Equipo técnico',
  EQUIPO_LEGAL: 'Equipo de Legales',
  EQUIPOS_RESIDENCIALES: 'Equipos residenciales',
  ADULTOS_INSTITUCION: 'Adultos responsables/Institución'
}

/**
 * Actor color mapping for consistent UI representation
 * Returns Material-UI compatible color hex codes
 *
 * @param actor - The actor enum value
 * @returns Hex color code for the actor
 */
export const getActorColor = (actor: ActorEnum): string => {
  const colors: Record<ActorEnum, string> = {
    'EQUIPO_TECNICO': '#1976d2',      // blue - technical team
    'EQUIPO_LEGAL': '#7b1fa2',        // purple - legal team
    'EQUIPOS_RESIDENCIALES': '#388e3c', // green - residential teams
    'ADULTOS_INSTITUCION': '#f57c00'  // orange - adults/institutions
  }
  return colors[actor] || '#757575' // gray fallback
}

/**
 * Actor icon mapping for UI elements
 * Returns Material-UI icon names
 *
 * @param actor - The actor enum value
 * @returns Icon name string
 */
export const getActorIcon = (actor: ActorEnum): string => {
  const icons: Record<ActorEnum, string> = {
    'EQUIPO_TECNICO': 'GroupWork',
    'EQUIPO_LEGAL': 'Gavel',
    'EQUIPOS_RESIDENCIALES': 'Home',
    'ADULTOS_INSTITUCION': 'Business'
  }
  return icons[actor] || 'Group'
}
