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
 * TTipoActividad - Derecho Principal (Parent category in hierarchical system)
 *
 * PLTM Restructuring V4.0 (2026-03-23):
 * - Changed from 36 flat activity types to 7 Derechos Principales (Primary Rights)
 * - These are now parent categories for specific activities (TSubtipoActividadPlanTrabajo)
 *
 * Endpoint: GET /api/tipos-actividad-plan-trabajo/
 * Returns: 7 primary rights categories
 */
export interface TTipoActividad {
  /** Unique identifier (readonly) */
  id: number

  /** Derecho Principal name (e.g., "Derecho a la familia") */
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

  /**
   * Sprint 3: Actividades Recursivas
   * If true, activities of this type are created automatically at regular intervals
   * by the crear_actividades_recursivas management command
   */
  es_recursiva: boolean

  /**
   * Sprint 3: Actividades Recursivas
   * Period in days for creating the next activity of this type
   * Required and must be > 0 when es_recursiva=True
   * Must be null when es_recursiva=False
   */
  periodo_recursion_dias: number | null
}

/**
 * TSubtipoActividadPlanTrabajo - Specific activity (Child in hierarchical system)
 *
 * PLTM Restructuring V4.0 (2026-03-23):
 * - 36 specific activities, each belonging to one of the 7 Derechos Principales
 * - These are the actual activities that users select for creation
 *
 * Endpoint: GET /api/subtipos-actividad-plan-trabajo/
 * Cascading: GET /api/subtipos-actividad-plan-trabajo/?derecho=2
 */
export interface TSubtipoActividadPlanTrabajo {
  /** Unique identifier (readonly) */
  id: number

  /** FK to Derecho Principal (parent category) */
  tipo_actividad: number

  /** Derecho Principal name (readonly, from relationship) */
  derecho_principal_nombre: string

  /** Specific activity name (e.g., "Entrevista con familia / referentes socioafectivos") */
  nombre: string

  /** Detailed description (nullable) */
  descripcion: string

  /** Activity type: MANUAL or OFICIO */
  tipo: 'MANUAL' | 'OFICIO'

  /** Display name for tipo (readonly) */
  tipo_display: string

  /** FK to judicial office type (only if tipo=OFICIO, nullable) */
  tipo_oficio: number | null

  /** Actor responsible for this activity */
  actor: 'EQUIPO_TECNICO' | 'EQUIPO_LEGAL' | 'EQUIPOS_RESIDENCIALES' | 'ADULTOS_INSTITUCION'

  /** Display name for actor (readonly) */
  actor_display: string

  /** Applicable measure type (nullable) */
  tipo_medida_aplicable: 'MPI' | 'MPE' | 'MPJ' | null

  /** Applicable measure stage (nullable) */
  etapa_medida_aplicable: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | 'PROCESO' | null

  /** If true, completing activity requires mandatory attachments */
  requiere_evidencia: boolean

  /** If true, completing activity requires legal team approval (visado) */
  requiere_visado_legales: boolean

  /** Deadline in days to complete activity (nullable) */
  plazo_dias: number | null

  /** If true, allows group activity management */
  permite_gestion_grupal: boolean

  /** If true, activities are created automatically at regular intervals */
  es_recursiva: boolean

  /** Period in days for recurring activities (nullable) */
  periodo_recursion_dias: number | null

  /** Whether this subtipo is available for selection */
  activo: boolean

  /** Display order in lists */
  orden: number
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
 * Legajo info nested in activity response
 * Added in API v12 for global activities listing
 */
export interface TLegajoInfo {
  id: number
  numero: string
  nnya_nombre: string
  nnya_apellido: string
  nnya_dni: string
}

/**
 * Medida info nested in activity response
 * Added in API v12 for global activities listing
 */
export interface TMedidaInfo {
  id: number
  numero_medida: string
  tipo_medida: 'MPI' | 'MPE' | 'MPJ'
  tipo_medida_display: string
  estado_vigencia: 'VIGENTE' | 'CERRADA' | 'ARCHIVADA' | 'NO_RATIFICADA'
  estado_vigencia_display: string
}

/**
 * User responsible for a zone
 * Added in API v13 for zonas_info nested field
 */
export interface UserResponsableZona {
  id: number
  username: string
  nombre_completo: string
}

/**
 * Zone info nested in activity response
 * Added in API v13 - PLTM Zonas Anidadas
 */
export interface ZonaInfo {
  id: number
  nombre: string
  tipo_responsabilidad: 'TRABAJO' | 'CENTRO_VIDA' | 'JUDICIAL'
  user_responsable: UserResponsableZona | null
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

  /**
   * Legajo info (readonly, nested from plan_trabajo relationship)
   * Added in API v12 for global activities listing
   */
  legajo_info?: TLegajoInfo

  /**
   * Medida info (readonly, nested from plan_trabajo relationship)
   * Added in API v12 for global activities listing
   */
  medida_info?: TMedidaInfo

  /**
   * Zonas info (readonly, nested from legajo relationship)
   * Added in API v13 - PLTM Zonas Anidadas
   * Contains active zones assigned to the legajo
   */
  zonas_info?: ZonaInfo[]

  // Type & Classification (PLTM V4.0: Hierarchical Structure)
  /**
   * FK to Derecho Principal (parent category)
   * Same as tipo_actividad for backwards compatibility
   */
  derecho_principal: number

  /** Nested Derecho Principal detail (readonly) */
  derecho_principal_info: TTipoActividad

  /**
   * FK to activity type catalog (Derecho Principal)
   * Alias for derecho_principal
   */
  tipo_actividad: number

  /** Nested activity type detail (readonly) - Derecho Principal */
  tipo_actividad_info: TTipoActividad

  /**
   * FK to specific activity (REQUIRED in V4.0)
   * This is the actual activity selected from the 36 available
   */
  subtipo_actividad: number

  /** Nested specific activity detail (readonly) */
  subtipo_actividad_info: TSubtipoActividadPlanTrabajo

  /**
   * @deprecated Legacy field - Use subtipo_actividad instead
   * Specific subactivity detail (free text)
   */
  subactividad?: string

  // Temporal Planning
  /** Planned date for execution */
  fecha_planificacion: string

  /** Actual start date (readonly, set when → EN_PROGRESO) */
  fecha_inicio_real: string | null

  /** Actual completion date (readonly, set when → COMPLETADA) */
  fecha_finalizacion_real: string | null

  // State (PLTM-02: Updated to include JZ and legal approval states)
  /** Current activity state */
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO_JZ' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'

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
  /**
   * Activity origin
   * AUTO_RECURSIVA: Created automatically by crear_actividades_recursivas command (Sprint 3)
   */
  origen: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO' | 'AUTO_RECURSIVA'

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

  // Sprint 2: Multi-user read tracking (computed per-user, readonly)
  /** Whether the current user has read this activity */
  leida_por_mi?: boolean

  /** Timestamp when current user read this activity (null if not read) */
  fecha_lectura?: string | null

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
/**
 * PLTM V4.0: Create activity with hierarchical structure
 * REQUIRED: Both tipo_actividad (Derecho Principal) and subtipo_actividad (Specific Activity)
 */
export interface CreateActividadRequest {
  plan_trabajo: number
  /**
   * Derecho Principal ID (parent category)
   * In V4.0, tipo_actividad represents the Derecho Principal (7 categories)
   */
  tipo_actividad: number
  /**
   * Specific Activity ID (REQUIRED in V4.0)
   * Must belong to the selected tipo_actividad
   */
  subtipo_actividad: number
  /**
   * @deprecated Legacy field - Use subtipo_actividad instead
   * Kept for backwards compatibility
   */
  subactividad?: string
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

/**
 * PLTM V4.0: Update activity with hierarchical structure
 */
export interface UpdateActividadRequest {
  /**
   * Derecho Principal ID (parent category)
   * In V4.0, tipo_actividad represents the Derecho Principal
   */
  tipo_actividad?: number
  /**
   * Specific Activity ID
   * Must belong to the selected tipo_actividad if both are provided
   */
  subtipo_actividad?: number
  /**
   * @deprecated Legacy field - Use subtipo_actividad instead
   * Kept for backwards compatibility
   */
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
  /** Filter for overdue activities */
  vencidas?: string
  /** Filter activities with days remaining less than or equal to this value */
  dias_restantes_max?: string
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
  nuevo_estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO_JZ' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'
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
 * Request to transfer activity to another team/zone
 * Endpoint: POST /api/actividades/{id}/transferir/
 * API v13: Use zona_destino (simpler, recommended) instead of equipo_destino
 */
export interface TransferirRequest {
  zona_destino: number // Zone ID to transfer to
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
 * Request for JZ approval/rejection (visado JZ)
 * Endpoint: POST /api/actividades/{id}/visar-jz/
 * Paso previo al visado Legal
 */
export interface VisarJzRequest {
  aprobado: boolean // true = goes to PENDIENTE_VISADO (Legal), false = returns to EN_PROGRESO
  observaciones?: string // Optional, recommended if rejecting
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

// ============================================================================
// Sprint 3: Origin Types and Utilities (Actividades Recursivas)
// ============================================================================

/**
 * Origin enum - Source of activity creation
 * Sprint 3: Added AUTO_RECURSIVA for recurring activities
 */
export type OrigenEnum =
  | 'MANUAL'
  | 'DEMANDA_PI'
  | 'DEMANDA_OFICIO'
  | 'OFICIO'
  | 'AUTO_RECURSIVA'

/**
 * Origin display labels
 * Maps origin enum values to human-readable Spanish labels
 */
export const ORIGEN_LABELS: Record<OrigenEnum, string> = {
  MANUAL: 'Creación Manual',
  DEMANDA_PI: 'Demanda - Petición de Informe',
  DEMANDA_OFICIO: 'Demanda - Carga de Oficios',
  OFICIO: 'Oficio Judicial',
  AUTO_RECURSIVA: 'Automática Recursiva'
}

/**
 * Origin color mapping for consistent UI representation
 * Returns Material-UI compatible color hex codes
 *
 * @param origen - The origin enum value
 * @returns Hex color code for the origin
 */
export const getOrigenColor = (origen: OrigenEnum | string): string => {
  const colors: Record<string, string> = {
    'MANUAL': '#757575',         // gray - manual creation
    'DEMANDA_PI': '#1976d2',     // blue - demand petition
    'DEMANDA_OFICIO': '#0288d1', // light blue - demand office
    'OFICIO': '#7b1fa2',         // purple - judicial office
    'AUTO_RECURSIVA': '#9c27b0'  // deep purple - automatic recursive
  }
  return colors[origen] || '#757575' // gray fallback
}

// ============================================================================
// V13: Zone Types and Utilities (PLTM Zonas Anidadas)
// ============================================================================

/**
 * Zone type enum - Type of zone responsibility
 */
export type ZonaTipoResponsabilidad = 'TRABAJO' | 'CENTRO_VIDA' | 'JUDICIAL'

/**
 * Zone type display labels
 * Maps zone tipo_responsabilidad values to human-readable Spanish labels
 */
export const ZONA_TIPO_LABELS: Record<ZonaTipoResponsabilidad, string> = {
  TRABAJO: 'Zona de Trabajo',
  CENTRO_VIDA: 'Centro de Vida',
  JUDICIAL: 'Zona Judicial'
}

/**
 * Zone type color mapping for consistent UI representation
 * Returns Material-UI compatible color hex codes
 *
 * @param tipo - The zone tipo_responsabilidad value
 * @returns Hex color code for the zone type
 */
export const getZonaTipoColor = (tipo: ZonaTipoResponsabilidad | string): string => {
  const colors: Record<string, string> = {
    'TRABAJO': '#1565c0',       // blue - work zone
    'CENTRO_VIDA': '#2e7d32',   // green - center of life
    'JUDICIAL': '#6a1b9a'       // purple - judicial
  }
  return colors[tipo] || '#757575' // gray fallback
}

// ============================================================================
// BULK OPERATIONS - API V13
// Endpoints: PATCH /api/actividades/bulk-update/
//            POST /api/actividades/bulk-transferir/
// ============================================================================

/**
 * Request body for bulk update of multiple activities
 * Endpoint: PATCH /api/actividades/bulk-update/
 *
 * Allowed fields: responsable_principal, responsables_secundarios, estado,
 * descripcion, fecha_planificacion, es_borrador, actor
 *
 * Permissions: JZ, Director, Admin can bulk update any. Técnicos only their own.
 */
export interface BulkUpdateActividadesRequest {
  /** Array of activity IDs to update */
  actividad_ids: number[]
  /** Fields to update (partial) */
  updates: {
    responsable_principal?: number
    responsables_secundarios?: number[]
    estado?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'PENDIENTE_VISADO_JZ' | 'PENDIENTE_VISADO' | 'VISADO_CON_OBSERVACION' | 'VISADO_APROBADO' | 'CANCELADA' | 'VENCIDA'
    descripcion?: string
    fecha_planificacion?: string
    es_borrador?: boolean
    actor?: ActorEnum
  }
}

/**
 * Request body for bulk transfer of multiple activities
 * Endpoint: POST /api/actividades/bulk-transferir/
 *
 * Permissions: JZ, Director, Legal, Admin
 *
 * Two modes supported:
 * 1. Transfer to user: responsable_nuevo required
 * 2. Transfer to zone: zona_destino required, responsable_nuevo optional
 *
 * API v13: Use zona_destino (simpler, recommended) instead of equipo_destino
 */
export interface BulkTransferActividadesRequest {
  /** Array of activity IDs to transfer */
  actividad_ids: number[]
  /** ID of the new responsible user (required for user transfer, optional for zone transfer) */
  responsable_nuevo?: number
  /** ID of the destination zone (for zone transfer) */
  zona_destino?: number
  /** Reason for the transfer (required, min 15 characters) */
  motivo: string
}

/**
 * Response for bulk operations
 * HTTP Codes:
 * - 200: All successful
 * - 207: Partial success (some errors)
 * - 400: Validation errors
 * - 403: Permission denied
 * - 404: Activities/user not found
 */
export interface BulkOperationResponse {
  /** Number of successfully updated/transferred activities */
  updated_count?: number
  transferred_count?: number
  /** Updated activities */
  actividades: TActividadPlanTrabajo[]
  /** Errors (only if partial success - HTTP 207) */
  errors: Array<{
    actividad_id: number
    error: string
  }>
}

// ============================================================================
// SPRINT 2: Sistema de Lectura Multi-Usuario
// Modelo: TLecturaActividad
// Endpoints:
//   POST /api/actividades/{id}/marcar-leida/
//   GET  /api/actividades/{id}/lecturas/
//   GET  /api/actividades/{id}/leida-por-mi/
//   GET  /api/actividades/?sin_leer=true
// ============================================================================

/**
 * Reader info for activity readings list
 * Endpoint: GET /api/actividades/{id}/lecturas/
 */
export interface TLecturaLector {
  usuario_id: number
  username: string
  nombre_completo: string
  fecha_lectura: string
}

/**
 * Response for activity readings list
 * Endpoint: GET /api/actividades/{id}/lecturas/
 */
export interface LecturasResponse {
  lectores: TLecturaLector[]
  total: number
}

/**
 * Response for checking if current user read activity
 * Endpoint: GET /api/actividades/{id}/leida-por-mi/
 */
export interface LeidaPorMiResponse {
  leida: boolean
  fecha_lectura: string | null
}

/**
 * Response for marking activity as read
 * Endpoint: POST /api/actividades/{id}/marcar-leida/
 */
export interface MarcarLeidaResponse {
  id: number
  actividad: number
  usuario: number
  fecha_lectura: string
  created: boolean
  message: string
}
