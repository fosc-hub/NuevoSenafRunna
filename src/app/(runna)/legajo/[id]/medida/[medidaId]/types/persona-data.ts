/**
 * TypeScript interfaces for Persona data from demanda full-detail response
 * Represents comprehensive persona information including education, health, and vulnerability
 */

// Core persona information
export interface PersonaInfo {
  id: number
  deleted: boolean
  nombre: string
  nombre_autopercibido: string | null
  apellido: string
  fecha_nacimiento: string | null
  fecha_defuncion: string | null
  edad_aproximada: number | null
  nacionalidad: string
  dni: number | null
  situacion_dni: string
  genero: string
  observaciones: string | null
  adulto: boolean
  nnya: boolean
  telefono: number | null
}

// Localization data
export interface LocalizacionPersona {
  id: number
  deleted: boolean
  calle: string
  tipo_calle: string | null
  piso_depto: string | null
  lote: string | null
  mza: number | null
  casa_nro: number
  referencia_geo: string
  geolocalizacion: string | null
  barrio: string | null
  localidad: {
    id: number
    nombre: string
  }
  cpc: string | null
}

// Educational institution
export interface InstitucionEducativa {
  id: number
  nombre: string
}

// Education data
export interface EducacionPersona {
  id: number
  deleted: boolean
  nivel_alcanzado: string
  esta_escolarizado: boolean
  ultimo_cursado: string
  tipo_escuela: string
  comentarios_educativos: string
  institucion_educativa: InstitucionEducativa | null
  persona: PersonaInfo
}

// Health institution
export interface InstitucionSanitaria {
  id: number
  nombre: string
}

// Medical professional
export interface MedicoCabecera {
  id: number
  nombre: string
  mail: string
  telefono: number
}

// Medical coverage
export interface CoberturaMedica {
  id: number
  deleted: boolean
  obra_social: string
  intervencion: string
  auh: boolean
  observaciones: string
  institucion_sanitaria: InstitucionSanitaria | null
  persona: PersonaInfo
  medico_cabecera: MedicoCabecera | null
}

// Health condition
export interface SituacionSalud {
  id: number
  nombre: string
}

export interface Enfermedad {
  id: number
  nombre: string
  situacion_salud_categoria: number
}

export interface PersonaEnfermedad {
  id: number
  oficio_adjunto: any[]
  certificado_adjunto: any[]
  deleted: boolean
  certificacion: string
  beneficios_gestionados: string | null
  recibe_tratamiento: boolean
  informacion_tratamiento: string
  persona: PersonaInfo
  situacion_salud: SituacionSalud
  enfermedad: Enfermedad
  institucion_sanitaria_interviniente: InstitucionSanitaria | null
  medico_tratamiento: MedicoCabecera | null
}

// Vulnerability condition
export interface CondicionVulnerabilidad {
  id: number
  nombre: string
  descripcion?: string
  peso?: number
}

export interface PersonaCondicionVulnerabilidad {
  id: number
  condicion_vulnerabilidad: CondicionVulnerabilidad
  persona: PersonaInfo
}

// Vulneracion
export interface Vulneracion {
  id: number
  nombre: string
  descripcion?: string
}

export interface PersonaVulneracion {
  id: number
  vulneracion: Vulneracion
  persona: PersonaInfo
}

// Demanda relationship
export interface DemandaPersonaRelacion {
  id: number
  deleted: boolean
  conviviente: boolean
  legalmente_responsable: boolean
  ocupacion: string | null
  vinculo_demanda: string
  vinculo_con_nnya_principal: string | null
  demanda: {
    id: number
    fecha_creacion: string
    ultima_actualizacion: string
    estado_demanda: string
    tipo_medida_evaluado: string
    medida_creada: boolean
  }
  persona: PersonaInfo
}

// Complete persona data from demanda full-detail
export interface PersonaCompleta {
  localizacion: LocalizacionPersona | null
  educacion: EducacionPersona | null
  cobertura_medica: CoberturaMedica | null
  persona_enfermedades: PersonaEnfermedad[]
  demanda_persona: DemandaPersonaRelacion | null
  condiciones_vulnerabilidad: PersonaCondicionVulnerabilidad[]
  persona: PersonaInfo
  vulneraciones: PersonaVulneracion[]
}

// API Response for persona localizacion
export interface LocalizacionPersonaResponse {
  id: number
  localizacion: LocalizacionPersona
  principal: boolean
}

// API Response for persona educacion
export interface EducacionPersonaResponse {
  educacion: EducacionPersona | null
}

// API Response for persona cobertura medica
export interface CoberturaMedicaPersonaResponse {
  cobertura_medica: CoberturaMedica | null
  persona_enfermedades: PersonaEnfermedad[]
}

// API Response for persona condiciones vulnerabilidad
export interface CondicionesVulnerabilidadResponse {
  condiciones_vulnerabilidad: PersonaCondicionVulnerabilidad[]
  vulneraciones: PersonaVulneracion[]
}
