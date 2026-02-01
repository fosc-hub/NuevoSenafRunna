/**
 * API Types for Informes de Seguimiento (PLTM-03)
 * Based on RUNNA API endpoints for monthly follow-up reports
 *
 * PLTM-03: Informes Mensuales de Seguimiento
 * - Automatic generation of monthly follow-up reports
 * - Template-based document completion
 * - Status tracking (PENDIENTE, VENCIDO, COMPLETADO, COMPLETADO_TARDIO)
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/**
 * Estado del informe de seguimiento
 * - PENDIENTE: Informe pendiente de completar (dentro del plazo)
 * - VENCIDO: Informe fuera de plazo sin completar
 * - COMPLETADO: Informe completado dentro del plazo
 * - COMPLETADO_TARDIO: Informe completado pero fuera del plazo
 */
export type EstadoInformeSeguimiento = 'PENDIENTE' | 'VENCIDO' | 'COMPLETADO' | 'COMPLETADO_TARDIO'

/**
 * Tipo de plantilla de informe
 */
export type TipoPlantilla = 'INFORME_SEGUIMIENTO' | 'INFORME_CIERRE'

/**
 * Tipo de etapa de la medida
 */
export type TipoEtapa = 'APERTURA' | 'PRORROGA' | 'INNOVACION'

// ============================================================================
// INTERFACES DE DATOS
// ============================================================================

/**
 * Información básica del usuario
 */
export interface UsuarioInfo {
  id: number
  nombre_completo: string
  username?: string
  email?: string
}

/**
 * Informe de Seguimiento - Respuesta completa
 * GET /api/medidas/{medida_id}/informes-seguimiento/{id}/
 */
export interface InformeSeguimiento {
  id: number
  medida: number
  numero_informe: number

  // Fechas
  fecha_vencimiento: string // YYYY-MM-DD
  fecha_completado: string | null // ISO datetime
  fecha_creacion: string // ISO datetime

  // Estado
  estado: EstadoInformeSeguimiento
  estado_display?: string

  // Contenido del informe
  contenido: string | null
  observaciones: string | null

  // Plantilla
  tiene_plantilla: boolean
  plantilla_url?: string | null

  // Entrega
  entrega_tardia: boolean
  dias_para_vencimiento: number // Positivo = días restantes, Negativo = días vencido

  // Usuario que completó
  completado_por: number | null
  completado_por_detalle?: string | UsuarioInfo | null

  // Adjuntos
  adjuntos_count?: number

  // Auditoría
  activo: boolean
}

/**
 * Informe de Seguimiento - Respuesta de listado (campos reducidos)
 * GET /api/medidas/{medida_id}/informes-seguimiento/
 */
export interface InformeSeguimientoListItem {
  id: number
  medida: number
  numero_informe: number
  fecha_vencimiento: string
  fecha_completado: string | null
  estado: EstadoInformeSeguimiento
  estado_display?: string
  entrega_tardia: boolean
  dias_para_vencimiento: number
  tiene_plantilla: boolean
  adjuntos_count?: number
}

/**
 * Plantilla del informe
 */
export interface PlantillaInforme {
  id: number
  medida: number
  tipo: TipoPlantilla
  nombre: string
  url: string
  fecha_subida: string
  subido_por_detalle?: string | UsuarioInfo
}

/**
 * Adjunto del informe de seguimiento
 */
export interface InformeSeguimientoAdjunto {
  id: number
  informe_seguimiento: number
  archivo: string // URL
  nombre_original: string
  tamano_bytes: number
  descripcion?: string | null
  subido_por: number
  subido_por_detalle?: string | UsuarioInfo
  fecha_carga: string // ISO datetime
  activo: boolean
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

/**
 * Payload para completar un informe de seguimiento
 * POST /api/medidas/{medida_id}/informes-seguimiento/{id}/completar/
 */
export interface CompletarInformePayload {
  contenido: string
  observaciones?: string | null
  plantilla?: File // Archivo de plantilla completada (opcional)
}

/**
 * Payload para subir plantilla completada
 * POST /api/medidas/{medida_id}/informes-seguimiento/{id}/subir-plantilla/
 */
export interface SubirPlantillaPayload {
  archivo: File
  descripcion?: string
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Query parameters para filtrar informes de seguimiento
 */
export interface InformesSeguimientoQueryParams {
  estado?: EstadoInformeSeguimiento
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  ordering?: string // ej: '-fecha_vencimiento', 'numero_informe'
  limit?: number
  offset?: number
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

/**
 * Response al completar un informe
 */
export interface CompletarInformeResponse {
  mensaje: string
  informe: InformeSeguimiento
}

/**
 * Response al subir plantilla
 */
export interface SubirPlantillaResponse {
  mensaje: string
  url: string
}

/**
 * Response de info de plantilla
 */
export interface PlantillaInfoResponse {
  disponible: boolean
  nombre?: string
  url?: string
  tipo?: TipoPlantilla
  fecha_subida?: string
}

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

/**
 * Configuración de colores por estado
 */
export const ESTADO_INFORME_CONFIG: Record<
  EstadoInformeSeguimiento,
  {
    label: string
    backgroundColor: string
    textColor: string
    icon: 'Schedule' | 'Error' | 'CheckCircle' | 'Warning'
  }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    backgroundColor: '#FFF3CD',
    textColor: '#856404',
    icon: 'Schedule',
  },
  VENCIDO: {
    label: 'Vencido',
    backgroundColor: '#F8D7DA',
    textColor: '#721C24',
    icon: 'Error',
  },
  COMPLETADO: {
    label: 'Completado',
    backgroundColor: '#D4EDDA',
    textColor: '#155724',
    icon: 'CheckCircle',
  },
  COMPLETADO_TARDIO: {
    label: 'Completado Tardío',
    backgroundColor: '#FFE5D0',
    textColor: '#C35600',
    icon: 'Warning',
  },
} as const

/**
 * Configuración de adjuntos para informes de seguimiento
 */
export const ADJUNTO_INFORME_SEGUIMIENTO_CONFIG = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
} as const

/**
 * Helper para obtener días restantes/vencidos en formato legible
 */
export const formatDiasVencimiento = (dias: number): string => {
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  if (dias > 1) return `${dias} días restantes`
  if (dias === -1) return 'Venció ayer'
  return `Vencido hace ${Math.abs(dias)} días`
}

/**
 * Helper para verificar si un informe puede ser completado
 */
export const canCompletarInforme = (
  informe: InformeSeguimiento | InformeSeguimientoListItem | null | undefined
): boolean => {
  if (!informe) return false
  return informe.estado === 'PENDIENTE' || informe.estado === 'VENCIDO'
}

/**
 * Helper para verificar si un informe está vencido
 */
export const isInformeVencido = (
  informe: InformeSeguimiento | InformeSeguimientoListItem | null | undefined
): boolean => {
  if (!informe) return false
  return informe.estado === 'VENCIDO'
}

/**
 * Helper para verificar si un informe fue entregado tarde
 */
export const isEntregaTardia = (
  informe: InformeSeguimiento | InformeSeguimientoListItem | null | undefined
): boolean => {
  if (!informe) return false
  return informe.entrega_tardia || informe.estado === 'COMPLETADO_TARDIO'
}
