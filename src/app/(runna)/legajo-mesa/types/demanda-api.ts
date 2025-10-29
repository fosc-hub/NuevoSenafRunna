/**
 * TypeScript interfaces for Demanda API responses
 * Based on GET /api/registro-demanda-form/{id}/full-detail/ endpoint
 */

// Adjunto (attachment) structure
export interface DemandaAdjunto {
  archivo: string // URL to the file
}

// Person structure
export interface DemandaPersona {
  id: number
  deleted: boolean
  nombre: string
  nombre_autopercibido: string | null
  apellido: string
  fecha_nacimiento: string | null
  fecha_defuncion: string | null
  edad_aproximada: number | null
  nacionalidad: string
  dni: string | null
  situacion_dni: string
  genero: string
  observaciones: string | null
  adulto: boolean
  nnya: boolean
  telefono: string | null
}

// User info for evaluacion
export interface DemandaUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  fecha_nacimiento: string | null
  genero: string
  telefono: string | null
  is_staff: boolean
  is_active: boolean
  is_superuser: boolean
  groups: Array<{ id: number; name: string }>
  user_permissions: any[]
  zonas: any[]
  zonas_ids: number[]
  all_permissions: string[]
}

// Evaluacion structure
export interface DemandaEvaluacion {
  id: number
  adjuntos: DemandaAdjunto[] // Adjuntos nested in evaluacion
  tecnico_solicitante: DemandaUser
  director_decisor: DemandaUser
  evaluacion_personas: Array<{
    persona: DemandaPersona
  }>
  localidad_usuario: string
  nombre_usuario: string
  rol_usuario: string
  fecha_y_hora: string
  descripcion_de_la_situacion: string
  valoracion_profesional_final: string
  justificacion_tecnico: string
  justificacion_director: string
  solicitud_tecnico: string
  decision_director: string
  is_lastest: boolean
  demanda_log?: {
    id: number
    fecha_y_hora: string
    log: any
    demanda: number
  }
  demanda?: number
}

// Localidad info
export interface DemandaLocalidad {
  id: number
  nombre: string
}

// Localizacion structure
export interface DemandaLocalizacion {
  id: number
  deleted: boolean
  calle: string
  tipo_calle: string | null
  piso_depto: string | null
  lote: string | null
  mza: string | null
  casa_nro: number
  referencia_geo: string
  geolocalizacion: string | null
  barrio: string | null
  localidad: DemandaLocalidad
  cpc: string | null
}

// Ambito vulneracion
export interface AmbitoVulneracion {
  id: number
  nombre: string
}

// Bloque datos remitente
export interface BloqueDatosRemitente {
  id: number
  nombre: string
}

// Tipo institucion
export interface TipoInstitucion {
  id: number
  nombre: string
  bloque_datos_remitente: BloqueDatosRemitente
}

// Institucion
export interface Institucion {
  id: number
  nombre: string
  tipo_institucion: number
}

// Motivo/Submotivo ingreso
export interface MotivoIngreso {
  id: number
  nombre: string
  peso: number
}

export interface SubmotivoIngreso {
  id: number
  nombre: string
  peso: number
  motivo: MotivoIngreso
}

// Tipo oficio
export interface TipoOficio {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
  orden: number
}

// Score structure
export interface DemandaScore {
  id: number
  ultima_actualizacion: string
  score: number
  score_condiciones_vulnerabilidad: number
  score_vulneracion: number
  score_valoracion: number
  nnya: DemandaPersona
  nnya_id: number
  decision: string
  reason: string
}

// Indicadores valoracion
export interface IndicadorValoracion {
  id: number
  nombre: string
  descripcion: string | null
  peso: number
}

// Main demanda full detail response
export interface DemandaFullDetailResponse {
  id: number
  latest_evaluacion: DemandaEvaluacion | null
  indicadores_valoracion: IndicadorValoracion[]
  valoraciones_seleccionadas: any[]
  scores: DemandaScore[]
  evaluaciones: DemandaEvaluacion[] // Array of evaluaciones with nested adjuntos
  demandas_vinculadas: any[]
  actividades: any[]
  respuestas: any[]
  adjuntos: DemandaAdjunto[] // Root level adjuntos for oficios
  codigos_demanda: any[]
  localidad_usuario: string | null
  rol_usuario: string
  nombre_usuario: string
  apellido_usuario: string
  fecha_creacion: string
  ultima_actualizacion: string
  fecha_ingreso_senaf: string
  fecha_oficio_documento: string
  descripcion: string | null
  objetivo_de_demanda: string
  estado_demanda: string
  observaciones: string | null
  envio_de_respuesta: string
  tipo_medida_evaluado: string
  medida_creada: boolean
  etiqueta: string | null
  localizacion: DemandaLocalizacion
  ambito_vulneracion: AmbitoVulneracion
  bloque_datos_remitente: BloqueDatosRemitente
  tipo_institucion: TipoInstitucion
  institucion: Institucion
  motivo_ingreso: MotivoIngreso
  tipo_oficio: TipoOficio
  submotivo_ingreso: SubmotivoIngreso
  registrado_por_user: any
  registrado_por_user_zona: any
  relacion_demanda: any
  personas: any[]
}
