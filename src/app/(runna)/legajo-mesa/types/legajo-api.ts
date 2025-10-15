/**
 * TypeScript interfaces for Legajo API responses
 * Based on GET /api/legajos/ endpoint
 */

// Nested interface for NNyA data
export interface NnyaData {
  id: number
  nombre: string
  apellido: string
  nombre_completo: string
  dni: number
  fecha_nacimiento: string
}

// Semáforo de vencimiento para oficios
export type SemaforoEstado = "verde" | "amarillo" | "rojo"

// Oficio con semáforo de vencimiento
export interface OficioConSemaforo {
  id: number
  tipo: "Ratificación" | "Pedido" | "Orden" | "Otros"
  vencimiento: string // ISO date string
  semaforo: SemaforoEstado
  estado: string
  numero?: string
}

// Indicadores de actividades del Plan de Trabajo
export interface ActividadesPTIndicadores {
  pendientes: number
  en_progreso: number
  vencidas: number
  realizadas: number
}

// Estado del andarivel de medidas
export type AndarielEstado = "Intervención" | "Aval" | "Informe Jurídico" | "Ratificación"

// Medida andarivel object structure
export interface MedidaAndarivel {
  estado?: string // Estado general
  etapa_id?: number // ID de la etapa
  etapa_nombre: AndarielEstado // Nombre de la etapa
  etapa_estado: string // Estado de la etapa
  tipo_medida?: string // Tipo de medida (MPI, MPE, etc.)
  tipo_medida_display?: string // Display del tipo de medida
  numero_medida?: string // Número de medida
}

// Indicadores consolidados del legajo
export interface IndicadoresLegajo {
  demanda_pi_count: number
  oficios_por_tipo: {
    [key: string]: number // e.g., "Ratificación": 2, "Pedido": 1
  }
  medida_andarivel: MedidaAndarivel | AndarielEstado | null
  pt_actividades: ActividadesPTIndicadores
  alertas: string[] // Lista de mensajes de alerta
}

// Medida activa básica
export interface MedidaActivaBasica {
  id: number
  tipo: string
  estado: string
  etapa: string
  fecha_apertura: string
}

// Actividad activa básica
export interface ActividadActivaBasica {
  id: number
  descripcion: string
  estado: string
  fecha_vencimiento: string | null
}

// Main Legajo interface matching actual API response
// Updated to parse serialized fields
export interface LegajoApiResponse {
  id: number
  numero: string
  fecha_apertura: string
  fecha_ultima_actualizacion: string
  nnya: NnyaData
  prioridad: string | null // "ALTA", "MEDIA", "BAJA"
  zona: string // Serialized zona name
  jefe_zonal: string | null // Serialized user name
  director: string | null // Serialized director name
  equipo_trabajo: string | null // Serialized team name
  user_responsable: string | null // Serialized user name
  medidas_activas: MedidaActivaBasica[] // Parsed from serialized list
  actividades_activas: ActividadActivaBasica[] // Parsed from serialized list
  oficios: OficioConSemaforo[] // Parsed from serialized list
  indicadores: IndicadoresLegajo // Parsed from serialized object
  acciones_disponibles: string[] // Parsed from serialized list
}

// Paginated response structure
export interface PaginatedLegajosResponse {
  count: number
  next: string | null
  previous: string | null
  results: LegajoApiResponse[]
}

// Query parameters for GET /api/legajos/
export interface LegajosQueryParams {
  page?: number
  page_size?: number
  search?: string
  zona?: number
  urgencia?: string // "ALTA", "MEDIA", "BAJA"
  urgencia__icontains?: string
  fecha_apertura?: string
  fecha_apertura__gt?: string
  fecha_apertura__gte?: string
  fecha_apertura__lt?: string
  fecha_apertura__lte?: string
  fecha_apertura__ultimos_dias?: number
  ordering?: string
  id?: number
  id__gt?: number
  id__lt?: number
  id__gte?: number
  id__lte?: number
  numero_legajo?: string
  numero_legajo__icontains?: string
  nnya_nombre__icontains?: string
  nnya_apellido__icontains?: string
  nnya_dni?: string
  nnya_dni__icontains?: string
  jefe_zonal?: number
  user_responsable?: number
  director?: number
  equipo_trabajo?: number
  equipo_centro_vida?: number
  tiene_medidas_activas?: boolean
  tiene_demanda_pi?: boolean
  tiene_oficios?: boolean
  tiene_plan_trabajo?: boolean
  tiene_alertas?: boolean
  zona__nombre__icontains?: string
}

// ============================================
// Types for GET /api/legajos/{id}/ - Legajo Detail
// ============================================

// Persona nested data
export interface PersonaDetailData {
  id: number
  nombre: string
  nombre_autopercibido: string | null
  apellido: string
  fecha_nacimiento: string | null // ISO date string
  edad_aproximada: number | null
  edad_calculada: string | number | null
  nacionalidad: string // e.g., "ARGENTINA"
  dni: number | null
  situacion_dni: string | null // e.g., "EN_TRAMITE", etc.
  genero: string // e.g., "MASCULINO", "FEMENINO", etc.
  telefono: number | null
  observaciones: string | null
  fecha_defuncion: string | null // ISO date string
  adulto: boolean
  nnya: boolean
  deleted: boolean
}

// Estado object structure returned by API
export interface LegajoEstadoInfo {
  estado: string // "VIGENTE", "CERRADO", etc.
  etapa_id: number
  etapa_nombre: string // "Apertura de la Medida", etc.
  etapa_estado: string // "PENDIENTE_REGISTRO_INTERVENCION", etc.
  tipo_medida: string // "MPI", "MPE", "MPJ"
  tipo_medida_display: string // "Medida de Protección Integral", etc.
}

// Legajo basic info (nested in detail response)
export interface LegajoBasicInfo {
  id: number
  numero: string
  fecha_apertura: string
  urgencia: string | null
  estado: LegajoEstadoInfo | string // Can be object or string depending on API response
  ultima_actualizacion: string
}

// Localidad info
export interface LocalidadInfo {
  id: number
  calle: string
  tipo_calle: string
  casa_nro: number | null
  piso_depto: number | null
  lote: number | null
  mza: number | null
  referencia_geo: string | null
  geolocalizacion: string | null
  localidad: number
  localidad_nombre: string
  barrio: number | null
  barrio_nombre: string | null
  cpc: number | null
  cpc_nombre: string | null
}

// Localizacion actual
export interface LocalizacionActual {
  id: number
  localizacion: LocalidadInfo
  principal: boolean
}

// Zona info
export interface ZonaInfo {
  id: number
  nombre: string
  codigo: string | null
}

// User info
export interface UserInfo {
  id: number
  username?: string
  nombre_completo: string
  nivel?: string | null
}

// Asignacion
export interface AsignacionActiva {
  id: number
  tipo_responsabilidad: string
  zona: ZonaInfo
  user_responsable: UserInfo
  local_centro_vida: any | null
  esta_activo: boolean
  recibido: boolean
  fecha_asignacion: string
  enviado_por: UserInfo
  recibido_por: UserInfo
  comentarios: string | null
}

// Medida
export interface MedidaInfo {
  id: number
  numero: string
  fecha_apertura: string
  urgencia: string | null
  estado: string
  ultima_actualizacion: string
  tipo_medida?: string
}

// Demandas relacionadas
export interface DemandasRelacionadas {
  resultados: any[]
  resumen: {
    total_demandas: number
    activas: number
    cerradas: number
  }
}

// Historial cambios
export interface HistorialCambio {
  tabla: string
  registro_id: number
  fecha_cambio: string | null
  usuario: UserInfo
  accion: string | null
  campos_modificados: any[]
}

// Responsables
export interface Responsables {
  equipo_tecnico_centro_vida?: {
    user_id: number
    nombre_completo: string
    tipo_responsabilidad: string
    local: any | null
  }
  [key: string]: any
}

// Permisos
export interface PermisosUsuario {
  puede_editar: boolean
  puede_agregar_documentos: boolean
  puede_tomar_medidas: boolean
  puede_asignar_zonas: boolean
  puede_ver_notas_aval: boolean
  puede_ver_historial: boolean
  puede_reasignar: boolean
}

// Metadata
export interface MetadataInfo {
  ultima_actualizacion: string
  consultado_por: UserInfo
  timestamp_consulta: string
}

// Main legajo detail response (updated to match actual API)
export interface LegajoDetailResponse {
  legajo: LegajoBasicInfo
  persona: PersonaDetailData
  localizacion_actual: LocalizacionActual | null
  asignaciones_activas: AsignacionActiva[]
  medidas_activas: MedidaInfo[]
  historial_medidas: MedidaInfo[]
  plan_trabajo: any | null
  oficios: any[]
  demandas_relacionadas: DemandasRelacionadas
  documentos: any[]
  historial_asignaciones: any[]
  historial_cambios: HistorialCambio[]
  responsables: Responsables
  permisos_usuario: PermisosUsuario
  metadata: MetadataInfo
}

// Query parameters for GET /api/legajos/{id}/
export interface LegajoDetailQueryParams {
  include_history?: boolean // Incluir historial de cambios (simple_history)
}
