/**
 * TypeScript interfaces for Medidas API responses
 * Based on /api/legajos/{id}/medidas/ and /api/medidas/ endpoints
 */

// Tipos de medida
export type TipoMedida = "MPI" | "MPE" | "MPJ"

// Estados de vigencia
export type EstadoVigencia = "VIGENTE" | "CERRADA" | "ARCHIVADA" | "NO_RATIFICADA"

// Estados de etapas del andarivel
export type EstadoEtapa =
  | "PENDIENTE_REGISTRO_INTERVENCION" // Estado 1
  | "PENDIENTE_APROBACION_REGISTRO" // Estado 2
  | "PENDIENTE_NOTA_AVAL" // Estado 3
  | "PENDIENTE_INFORME_JURIDICO" // Estado 4
  | "PENDIENTE_RATIFICACION_JUDICIAL" // Estado 5

// Juzgado info
export interface JuzgadoInfo {
  id: number
  nombre: string
  tipo: string
  tipo_display: string
  jurisdiccion: string
  jurisdiccion_display: string
}

// Urgencia info
export interface UrgenciaInfo {
  id: number
  nombre: string
  peso?: number
}

// Creado por (usuario)
export interface CreadoPorInfo {
  id: number
  nombre_completo: string
  nivel: number
}

// Etapa de medida
export interface EtapaMedida {
  id: number
  nombre: string
  estado: EstadoEtapa
  estado_display: string
  fecha_inicio_estado: string // ISO date string
  fecha_fin_estado: string | null // ISO date string
  observaciones: string | null
}

// Response de medida completa (GET /api/medidas/{id}/)
export interface MedidaDetailResponse {
  id: number
  numero_medida: string
  tipo_medida: TipoMedida
  tipo_medida_display: string
  estado_vigencia: EstadoVigencia
  estado_vigencia_display: string
  fecha_apertura: string // ISO date string
  fecha_cierre: string | null // ISO date string
  duracion_dias: number
  juzgado: JuzgadoInfo | null
  nro_sac: string | null
  urgencia: UrgenciaInfo | null
  etapa_actual: EtapaMedida | null
  historial_etapas?: EtapaMedida[] // Solo en detalle
  creado_por: CreadoPorInfo | null
  fecha_creacion: string // ISO date string
  fecha_modificacion: string // ISO date string
  legajo?: {
    // Solo en detalle
    id: number
    numero: string
    nnya: {
      id: number
      nombre: string
      apellido: string
      edad_calculada: number | null
    }
  }
}

// Response de medida básica (en listados)
export interface MedidaBasicResponse {
  id: number
  numero_medida: string
  tipo_medida: TipoMedida
  tipo_medida_display: string
  estado_vigencia: EstadoVigencia
  fecha_apertura: string
  fecha_cierre: string | null
  duracion_dias: number
  juzgado: JuzgadoInfo | null
  nro_sac: string | null
  urgencia: UrgenciaInfo | null
  etapa_actual: {
    estado: EstadoEtapa
    estado_display: string
  } | null
}

// Paginated medidas response
export interface PaginatedMedidasResponse {
  count: number
  next: string | null
  previous: string | null
  results: MedidaBasicResponse[]
}

// Request para crear medida (POST /api/legajos/{id}/medidas/)
export interface CreateMedidaRequest {
  tipo_medida: TipoMedida
  juzgado?: number | null // ID del juzgado
  nro_sac?: string | null
  urgencia?: number | null // ID de urgencia
}

// Query parameters para filtrar medidas
export interface MedidasQueryParams {
  tipo_medida?: TipoMedida
  estado_vigencia?: EstadoVigencia
  ordering?: string
  limit?: number
  offset?: number
}
