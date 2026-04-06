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
  nivel_educativo?: string // nivel_alcanzado (string key from choices)
  institucion_educativa_id?: number // FK to TInstitucionEducativa
  establecimiento?: string // Display name (read-only from backend: institucion_educativa_nombre)
  grado_curso?: string // ultimo_cursado (string key from choices)
  turno?: string
  rendimiento?: string
  asistencia?: string
  observaciones?: string
  fecha_actualizacion?: string
}

// Información de Salud (editable fields for seguimiento en dispositivo)
// Matches /api/medidas/{id}/info-salud/ response (cobertura_medica model)
export interface InformacionSalud {
  id?: number
  obra_social?: string // String key from obra_social_choices
  intervencion?: string // String key from intervencion_choices
  auh?: boolean
  institucion_sanitaria_id?: number // FK to TInstitucionSanitaria
  centro_salud?: string  // Display name (read-only from backend: institucion_sanitaria_nombre)
  observaciones?: string
}

// Local Centro de Vida (for Cambio de Lugar de Resguardo)
export interface TLocalCentroVida {
  id: number
  nombre: string
  direccion?: string
  zona?: any // You can expand this type if needed
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
// Backend expects lugar_origen and lugar_destino as FKs to TLocalCentroVida
export interface CambioLugarResguardo {
  id?: number
  lugar_origen?: number // FK to TLocalCentroVida (optional for display)
  lugar_destino?: number // FK to TLocalCentroVida (optional for display)
  lugar_origen_nombre?: string // Display name from backend
  lugar_destino_nombre?: string // Display name from backend
  fecha_cambio: string
  motivo?: string
  autorizado_por?: string
  adjunto_url?: string
  fecha_registro?: string // Read-only from backend
}

// Notas de Seguimiento (shared structure)
// Backend expects titulo and nota
export interface NotaSeguimiento {
  id?: number
  titulo: string
  nota: string
  fecha: string
  autor?: number // User ID from backend
  autor_nombre?: string // Display name from backend (read-only)
  adjunto_url?: string
  fecha_registro?: string // Read-only from backend
  fecha_creacion?: string // Read-only from backend
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
