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

// Main Legajo interface matching actual API response
// Note: Most fields are returned as strings (serialized representations)
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
  medidas_activas: string // Serialized list
  actividades_activas: string // Serialized list
  oficios: string // Serialized list
  indicadores: string // Serialized object
  acciones_disponibles: string // Serialized list
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
