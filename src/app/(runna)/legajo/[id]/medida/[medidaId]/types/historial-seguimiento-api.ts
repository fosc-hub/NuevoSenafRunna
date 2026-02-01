/**
 * API Types for Historial de Seguimiento Unificado (PLTM-04)
 * Based on RUNNA API endpoints for unified timeline and stage traceability
 *
 * PLTM-04: Historial de Seguimiento Unificado
 * - Unified timeline of all medida events
 * - Stage and vigencia traceability
 * - CSV export functionality
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/**
 * Tipos de evento disponibles (36 tipos en 8 categorías)
 */
export type TipoEvento =
  // Actividades (PLTM)
  | 'ACTIVIDAD_CREADA'
  | 'ACTIVIDAD_EDITADA'
  | 'ACTIVIDAD_ESTADO_CAMBIO'
  | 'ACTIVIDAD_REPROGRAMADA'
  | 'ACTIVIDAD_COMENTARIO'
  | 'ACTIVIDAD_ADJUNTO'
  | 'ACTIVIDAD_VISADO'
  | 'ACTIVIDAD_TRANSFERIDA'
  // Intervenciones y Documentos (MED)
  | 'INTERVENCION_REGISTRADA'
  | 'INTERVENCION_ENVIADA'
  | 'INTERVENCION_APROBADA'
  | 'INTERVENCION_RECHAZADA'
  | 'NOTA_AVAL_EMITIDA'
  | 'NOTA_AVAL_OBSERVADA'
  | 'INFORME_JURIDICO_CREADO'
  | 'INFORME_JURIDICO_ENVIADO'
  | 'RATIFICACION_REGISTRADA'
  | 'INFORME_CIERRE_CREADO'
  // Etapas y Estados
  | 'ETAPA_CREADA'
  | 'ETAPA_CERRADA'
  | 'ESTADO_TRANSICION'
  // Informes Mensuales (PLTM-03)
  | 'INFORME_MENSUAL_CREADO'
  | 'INFORME_MENSUAL_COMPLETADO'
  | 'INFORME_MENSUAL_VENCIDO'
  // Seguimiento en Dispositivo (SEG)
  | 'SITUACION_DISPOSITIVO_CAMBIO'
  | 'TALLER_REGISTRADO'
  | 'CAMBIO_LUGAR_RESGUARDO'
  | 'NOTA_SEGUIMIENTO_CREADA'
  // Medida
  | 'MEDIDA_CREADA'
  | 'MEDIDA_CERRADA'
  | 'MEDIDA_ARCHIVADA'
  | 'MEDIDA_NO_RATIFICADA'
  // Oficios
  | 'OFICIO_CREADO'
  | 'OFICIO_CERRADO'
  // Eventos Manuales
  | 'COMENTARIO_MANUAL'
  | 'EVIDENCIA_CARGADA'

/**
 * Categorías de eventos
 */
export type CategoriaEvento =
  | 'ACTIVIDAD'
  | 'INTERVENCION'
  | 'ETAPA'
  | 'INFORME'
  | 'SEGUIMIENTO'
  | 'MEDIDA'
  | 'OFICIO'
  | 'MANUAL'

/**
 * Tipo de etapa de la medida
 */
export type TipoEtapa =
  | 'APERTURA'
  | 'INNOVACION'
  | 'PRORROGA'
  | 'CESE'
  | 'POST_CESE'
  | 'PROCESO'

// ============================================================================
// INTERFACES DE DATOS
// ============================================================================

/**
 * Información básica del usuario en eventos
 */
export interface UsuarioEvento {
  id: number
  username: string
  nombre_completo: string
}

/**
 * Información de etapa en eventos
 */
export interface EtapaEvento {
  id: number
  tipo_etapa: TipoEtapa
  tipo_etapa_display: string
  estado: string
  estado_display: string
}

/**
 * Deep link para navegación a recursos relacionados
 */
export interface DeepLink {
  tipo: TipoEvento
  medida_id: number
  actividad_id?: number
  etapa_id?: number
  url: string
}

/**
 * Item del historial de seguimiento
 * GET /api/medidas/{medida_id}/historial-seguimiento/
 */
export interface HistorialEventoItem {
  id: number
  tipo_evento: TipoEvento
  tipo_evento_display: string
  descripcion_automatica: string
  fecha_evento: string // ISO datetime
  usuario: UsuarioEvento | null
  etapa: EtapaEvento | null
  actividad_id?: number
  intervencion_id?: number
  informe_id?: number
  deep_link: DeepLink | null
}

/**
 * Respuesta paginada del historial de seguimiento
 */
export interface HistorialSeguimientoResponse {
  count: number
  next: string | null
  previous: string | null
  results: HistorialEventoItem[]
}

/**
 * Tipo de evento con nombre para catálogo
 */
export interface TipoEventoCatalogo {
  codigo: TipoEvento
  nombre: string
}

/**
 * Respuesta de tipos de evento disponibles
 * GET /api/medidas/{medida_id}/historial-seguimiento/tipos/
 */
export interface HistorialTiposResponse {
  tipos: TipoEventoCatalogo[]
  categorias: Record<CategoriaEvento, TipoEventoCatalogo[]>
  total: number
}

/**
 * Respuesta de resumen estadístico
 * GET /api/medidas/{medida_id}/historial-seguimiento/resumen/
 */
export interface HistorialResumenResponse {
  total_eventos: number
  por_tipo: Record<string, number>
  por_categoria: Record<CategoriaEvento, number>
  primer_evento: string | null // ISO datetime
  ultimo_evento: string | null // ISO datetime
}

// ============================================================================
// TRAZABILIDAD DE ETAPAS
// ============================================================================

/**
 * Estado específico de etapa
 */
export interface EstadoEspecifico {
  id: number
  codigo: string
  nombre: string
  orden: number
}

/**
 * Cambio en una transición de estado
 */
export interface CambioTransicion {
  estado?: {
    anterior: string
    nuevo: string
    anterior_display: string
    nuevo_display: string
  }
}

/**
 * Transición de estado en una etapa
 */
export interface TransicionEstado {
  fecha: string // ISO datetime
  tipo_cambio: '+' | '~' | '-' // + creación, ~ modificación, - eliminación
  estado: string
  estado_display: string
  tipo_etapa: TipoEtapa
  tipo_etapa_display: string
  cambios: CambioTransicion | null
  usuario: string
}

/**
 * Etapa en el timeline de trazabilidad
 */
export interface EtapaTimeline {
  id: number
  nombre: string
  tipo_etapa: TipoEtapa
  tipo_etapa_display: string
  estado: string
  estado_display: string
  estado_especifico: EstadoEspecifico | null
  fecha_inicio_estado: string // ISO datetime
  fecha_fin_estado: string | null
  esta_activa: boolean
  observaciones: string | null
  transiciones_estado: TransicionEstado[]
}

/**
 * Transición de vigencia
 */
export interface VigenciaTimeline {
  fecha: string // ISO datetime
  tipo_cambio: '+' | '~' | '-'
  estado_vigencia: string
  estado_vigencia_display: string
  estado_anterior: string | null
  estado_anterior_display: string | null
  usuario: string
  etapa_actual_id: number | null
}

/**
 * Resumen de trazabilidad
 */
export interface ResumenTrazabilidad {
  total_etapas: number
  etapas_activas: number
  etapas_cerradas: number
  etapas_por_tipo: Record<string, { nombre: string; cantidad: number }>
  primera_etapa_fecha: string | null
  ultima_etapa_fecha: string | null
  duracion_total_dias: number
  tipo_medida: string
  flujo_esperado: TipoEtapa[]
}

/**
 * Información de medida en trazabilidad
 */
export interface MedidaTrazabilidad {
  id: number
  numero_medida: string
  tipo_medida: string
  tipo_medida_display: string
  estado_vigencia: string
  estado_vigencia_display: string
  fecha_apertura: string | null
  fecha_cierre: string | null
  duracion_dias?: number
}

/**
 * Respuesta completa de trazabilidad de etapas
 * GET /api/medidas/{medida_id}/trazabilidad-etapas/
 */
export interface TrazabilidadEtapasResponse {
  medida: MedidaTrazabilidad
  etapas_timeline: EtapaTimeline[]
  vigencia_timeline: VigenciaTimeline[]
  etapa_actual: EtapaTimeline | null
  resumen: ResumenTrazabilidad
}

/**
 * Etapa en formato compacto para UI
 */
export interface EtapaCompacta {
  orden: number
  id: number
  tipo_etapa: TipoEtapa
  tipo_etapa_display: string
  estado: string
  estado_display: string
  fecha_inicio: string // ISO datetime
  fecha_fin: string | null
  esta_activa: boolean
  duracion_dias: number | null
}

/**
 * Flujo de etapas
 */
export interface FlujoEtapas {
  esperado: TipoEtapa[]
  real: TipoEtapa[]
  proximas_posibles: TipoEtapa[]
  completado: boolean
}

/**
 * Respuesta compacta de trazabilidad para UI
 * GET /api/medidas/{medida_id}/trazabilidad-etapas/compacta/
 */
export interface TrazabilidadCompactaResponse {
  medida: MedidaTrazabilidad
  etapas: EtapaCompacta[]
  total_etapas: number
  flujo: FlujoEtapas
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Query parameters para filtrar historial de seguimiento
 */
export interface HistorialSeguimientoQueryParams {
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  tipo_evento?: TipoEvento
  tipos_evento?: string // Multiple types comma-separated
  categoria?: CategoriaEvento
  etapa?: number
  etapa_tipo?: TipoEtapa
  usuario?: number
  search?: string
  page?: number
  page_size?: number
}

/**
 * Query parameters para trazabilidad
 */
export interface TrazabilidadQueryParams {
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  tipo?: 'etapas' | 'vigencia' | 'all'
}

// ============================================================================
// CONFIGURACIÓN UI
// ============================================================================

/**
 * Configuración de categorías para la UI
 */
export interface CategoriaConfig {
  icon: string
  color: string
  backgroundColor: string
  label: string
}

export const CATEGORIA_CONFIGS: Record<CategoriaEvento, CategoriaConfig> = {
  ACTIVIDAD: {
    icon: 'Assignment',
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    label: 'Actividades',
  },
  INTERVENCION: {
    icon: 'Description',
    color: '#388E3C',
    backgroundColor: '#E8F5E9',
    label: 'Intervenciones',
  },
  ETAPA: {
    icon: 'Timeline',
    color: '#7B1FA2',
    backgroundColor: '#F3E5F5',
    label: 'Etapas',
  },
  INFORME: {
    icon: 'Assessment',
    color: '#F57C00',
    backgroundColor: '#FFF3E0',
    label: 'Informes',
  },
  SEGUIMIENTO: {
    icon: 'Visibility',
    color: '#0097A7',
    backgroundColor: '#E0F7FA',
    label: 'Seguimiento',
  },
  MEDIDA: {
    icon: 'Gavel',
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    label: 'Medida',
  },
  OFICIO: {
    icon: 'Mail',
    color: '#5D4037',
    backgroundColor: '#EFEBE9',
    label: 'Oficios',
  },
  MANUAL: {
    icon: 'Edit',
    color: '#616161',
    backgroundColor: '#F5F5F5',
    label: 'Manual',
  },
} as const

/**
 * Flujos de etapas por tipo de medida
 */
export const FLUJO_ETAPAS_POR_TIPO: Record<string, TipoEtapa[]> = {
  MPI: ['APERTURA', 'CESE'],
  MPE: ['APERTURA', 'INNOVACION', 'PRORROGA', 'CESE', 'POST_CESE'],
  MPJ: ['APERTURA', 'PROCESO', 'CESE'],
} as const

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get category for a given event type
 */
export const getCategoriaFromTipoEvento = (tipo: TipoEvento): CategoriaEvento => {
  if (tipo.startsWith('ACTIVIDAD_')) return 'ACTIVIDAD'
  if (tipo.startsWith('INTERVENCION_') || tipo.startsWith('NOTA_AVAL_') ||
      tipo.startsWith('INFORME_JURIDICO_') || tipo === 'RATIFICACION_REGISTRADA' ||
      tipo === 'INFORME_CIERRE_CREADO') return 'INTERVENCION'
  if (tipo.startsWith('ETAPA_') || tipo === 'ESTADO_TRANSICION') return 'ETAPA'
  if (tipo.startsWith('INFORME_MENSUAL_')) return 'INFORME'
  if (tipo.startsWith('SITUACION_') || tipo === 'TALLER_REGISTRADO' ||
      tipo === 'CAMBIO_LUGAR_RESGUARDO' || tipo === 'NOTA_SEGUIMIENTO_CREADA') return 'SEGUIMIENTO'
  if (tipo.startsWith('MEDIDA_')) return 'MEDIDA'
  if (tipo.startsWith('OFICIO_')) return 'OFICIO'
  return 'MANUAL'
}

/**
 * Format date for display
 */
export const formatFechaEvento = (fecha: string): string => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date only (without time)
 */
export const formatFechaSolo = (fecha: string): string => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Get relative time from date
 */
export const getRelativeTime = (fecha: string): string => {
  const date = new Date(fecha)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return formatFechaSolo(fecha)
}
