/**
 * Type definitions for SEGUIMIENTO EN DISPOSITIVO module
 * Used by both MPE and MPJ with unified structure (API v2.0)
 *
 * @version 2.0.0
 * @since 2026-03-30 - Breaking changes: Unified SituacionNNyA structure
 */

// Type constants for tipo_situacion
export const TIPO_SITUACION_CHOICES = {
  AUTORIZACION: 'AUTORIZACION',
  PERMISO: 'PERMISO',
  PERMISO_PROLONGADO: 'PERMISO_PROLONGADO'
} as const

export const TIPO_SITUACION_LABELS = {
  AUTORIZACION: 'Autorización',
  PERMISO: 'Permiso',
  PERMISO_PROLONGADO: 'Permiso Prolongado'
} as const

export type TipoSituacion = keyof typeof TIPO_SITUACION_CHOICES

// Common interface - Unified structure for API v2.0
export interface SituacionNNyA {
  id?: number
  tipo_situacion: TipoSituacion
  tipo_situacion_display?: string // Read-only from backend
  fecha: string // YYYY-MM-DD, cannot be future date
  observaciones?: string // Optional
  fecha_registro?: string // Read-only, datetime from backend
}

// MPE specific - Situación en Residencia (now inherits unified structure)
export interface SituacionResidenciaMPE extends SituacionNNyA {
  medida: number // FK to Medida
}

// MPJ specific - Situación en Instituto (now inherits unified structure)
export interface SituacionInstitutoMPJ extends SituacionNNyA {
  medida: number // FK to Medida
}

// Información Educativa (editable fields from origen_demanda)
export interface InformacionEducativa {
  id?: number
  nivel_educativo?: string
  establecimiento?: string
  grado_curso?: string
  turno?: string
  rendimiento?: string
  asistencia?: string
  observaciones?: string
  fecha_actualizacion?: string
}

// Información de Salud (editable fields from origen_demanda)
export interface InformacionSalud {
  id?: number
  obra_social?: string
  centro_salud?: string
  medico_cabecera?: string
  medicacion_actual?: string
  alergias?: string
  condiciones_preexistentes?: string
  discapacidad?: string
  cud?: boolean
  observaciones?: string
  fecha_actualizacion?: string
}

// Talleres Recreativos y Sociolaborales
export interface TallerRecreativo {
  id?: number
  orden: number
  nombre_taller: string
  institucion?: string
  dias_horarios?: string
  referente?: string
  fecha_inicio?: string
  fecha_fin?: string
  observaciones?: string
}

// Cambio de Lugar de Resguardo (shared structure)
export interface CambioLugarResguardo {
  id: number
  lugar_anterior: string
  lugar_nuevo: string
  fecha_cambio: string
  motivo?: string
  adjunto_url?: string
  nota?: string
}

// Notas de Seguimiento (shared structure)
export interface NotaSeguimiento {
  id: number
  fecha: string
  detalle: string
  autor?: string
  adjunto_url?: string
}

// Situaciones Críticas (MPE specific - from existing ResidenciasTab)
export interface SituacionCritica {
  id: number
  tipo: 'RSA' | 'BP' | 'DCS' | 'SCP'
  fecha: string
  residencia: string
  denuncia_adjunta?: string
}

// Instituto/Sector options for MPJ
export interface InstitutoOption {
  id: string
  nombre: string
  sectores: string[]
}

// Complete seguimiento data for MPE
export interface SeguimientoDispositivoMPE {
  medida_id: number
  situaciones_residencia: SituacionResidenciaMPE[]
  situaciones_criticas: SituacionCritica[]
  informacion_educativa: InformacionEducativa
  informacion_salud: InformacionSalud
  talleres: TallerRecreativo[]
  cambios_resguardo: CambioLugarResguardo[]
  notas_seguimiento: NotaSeguimiento[]
}

// Complete seguimiento data for MPJ
export interface SeguimientoDispositivoMPJ {
  medida_id: number
  situaciones_instituto: SituacionInstitutoMPJ[]
  informacion_educativa: InformacionEducativa
  informacion_salud: InformacionSalud
  talleres: TallerRecreativo[]
  cambios_resguardo: CambioLugarResguardo[]
  notas_seguimiento: NotaSeguimiento[]
}

// API Request/Response types
export interface CreateSeguimientoRequest {
  medida_id: number
  tipo_medida: 'MPE' | 'MPJ'
  data: Partial<SeguimientoDispositivoMPE | SeguimientoDispositivoMPJ>
}

export interface UpdateSeguimientoRequest {
  id: number
  data: Partial<SeguimientoDispositivoMPE | SeguimientoDispositivoMPJ>
}

export interface SeguimientoResponse<T = SeguimientoDispositivoMPE | SeguimientoDispositivoMPJ> {
  id: number
  medida_id: number
  tipo_medida: 'MPE' | 'MPJ'
  data: T
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string
  usuario_actualizacion?: string
}
