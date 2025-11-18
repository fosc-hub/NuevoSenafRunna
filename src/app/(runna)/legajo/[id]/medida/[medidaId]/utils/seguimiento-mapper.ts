/**
 * Mapper functions to transform full-detail demanda data to seguimiento dispositivo types
 */

import type { InformacionEducativa, InformacionSalud } from '../types/seguimiento-dispositivo'

/**
 * Full detail demanda response type (partial, only what we need)
 * Based on actual API structure from registro-demanda-form full-detail endpoint
 */
interface DemandaFullDetail {
  personas?: Array<{
    persona: {
      id: number
      nombre: string
      apellido: string
    }
    educacion?: {
      id: number
      nivel_alcanzado?: string // PRIMARIO, SECUNDARIO, etc.
      esta_escolarizado?: boolean
      ultimo_cursado?: string // TERCERO_SECUNDARIO, etc.
      tipo_escuela?: string // PRIVADA, PUBLICA, etc.
      comentarios_educativos?: string
      institucion_educativa?: {
        id: number
        nombre: string
      }
    } | null
    cobertura_medica?: {
      id: number
      obra_social?: string
      intervencion?: string // OBRA_SOCIAL, etc.
      auh?: boolean
      observaciones?: string
      institucion_sanitaria?: {
        id: number
        nombre: string
      }
      medico_cabecera?: {
        id: number
        nombre: string
        mail?: string
        telefono?: number
      }
    } | null
    persona_enfermedades?: Array<{
      enfermedad?: {
        id: number
        nombre: string
      }
      situacion_salud?: {
        id: number
        nombre: string
      }
      recibe_tratamiento?: boolean
      informacion_tratamiento?: string
      certificacion?: string // NO_TIENE, CUD, etc.
    }>
    condiciones_vulnerabilidad?: Array<{
      id: number
      nombre: string
    }>
  }>
}

/**
 * Map demanda full-detail educacion data to InformacionEducativa
 */
export function mapEducacionFromDemanda(demandaData: DemandaFullDetail, personaId?: number): InformacionEducativa {
  // Find the main NNyA or use the first persona
  const persona = demandaData.personas?.find(p =>
    personaId ? p.persona.id === personaId : true
  ) || demandaData.personas?.[0]

  if (!persona?.educacion) {
    return {}
  }

  const educacion = persona.educacion

  // Format nivel_educativo (PRIMARIO → Primario, SECUNDARIO → Secundario)
  const formatNivel = (nivel?: string) => {
    if (!nivel) return ''
    return nivel.charAt(0) + nivel.slice(1).toLowerCase()
  }

  // Format ultimo_cursado (TERCERO_SECUNDARIO → 3° Secundario)
  const formatCursado = (cursado?: string) => {
    if (!cursado) return ''
    const match = cursado.match(/^(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SEPTIMO)_(PRIMARIO|SECUNDARIO)$/)
    if (!match) return cursado

    const grados: Record<string, string> = {
      PRIMERO: '1°', SEGUNDO: '2°', TERCERO: '3°',
      CUARTO: '4°', QUINTO: '5°', SEXTO: '6°', SEPTIMO: '7°'
    }
    return `${grados[match[1]]} ${formatNivel(match[2])}`
  }

  return {
    id: educacion.id,
    nivel_educativo: formatNivel(educacion.nivel_alcanzado),
    establecimiento: educacion.institucion_educativa?.nombre || '',
    grado_curso: formatCursado(educacion.ultimo_cursado),
    turno: '', // Not available in API
    rendimiento: educacion.esta_escolarizado ? 'Escolarizado' : 'No escolarizado',
    asistencia: educacion.tipo_escuela || '', // Using tipo_escuela as asistencia
    observaciones: educacion.comentarios_educativos || '',
    fecha_actualizacion: new Date().toISOString().split('T')[0]
  }
}

/**
 * Map demanda full-detail cobertura_medica data to InformacionSalud
 */
export function mapSaludFromDemanda(demandaData: DemandaFullDetail, personaId?: number): InformacionSalud {
  // Find the main NNyA or use the first persona
  const persona = demandaData.personas?.find(p =>
    personaId ? p.persona.id === personaId : true
  ) || demandaData.personas?.[0]

  if (!persona?.cobertura_medica) {
    return {}
  }

  const cobertura = persona.cobertura_medica
  const enfermedades = persona.persona_enfermedades || []

  // Concatenate all tratamientos (informacion_tratamiento)
  const medicacionActual = enfermedades
    .map(e => e.informacion_tratamiento)
    .filter(Boolean)
    .join('; ')

  // Concatenate all enfermedades as condiciones preexistentes
  const condicionesPreexistentes = enfermedades
    .map(e => e.enfermedad?.nombre)
    .filter(Boolean)
    .join('; ')

  return {
    id: cobertura.id,
    obra_social: cobertura.obra_social || '',
    centro_salud: cobertura.institucion_sanitaria?.nombre || '',
    medico_cabecera: cobertura.medico_cabecera?.nombre || '',
    medicacion_actual: medicacionActual || '',
    alergias: '', // Not available in demanda data
    condiciones_preexistentes: condicionesPreexistentes || '',
    discapacidad: '', // Will be filled by enhanced version
    cud: false, // Will be filled by enhanced version
    observaciones: cobertura.observaciones || '',
    fecha_actualizacion: new Date().toISOString().split('T')[0]
  }
}

/**
 * Check if persona has CUD based on certificaciones
 * In the API: certificacion can be "NO_TIENE", "CUD", etc.
 */
function checkCUD(persona: any): boolean {
  if (!persona?.persona_enfermedades) return false

  return persona.persona_enfermedades.some((e: any) => {
    const cert = e.certificacion?.toUpperCase() || ''
    return cert === 'CUD' ||
           cert.includes('CERTIFICADO') ||
           cert.includes('DISCAPACIDAD')
  })
}

/**
 * Extract discapacidad from condiciones_vulnerabilidad or situacion_salud
 */
function extractDiscapacidad(persona: any): string {
  // Check condiciones_vulnerabilidad
  if (persona?.condiciones_vulnerabilidad && persona.condiciones_vulnerabilidad.length > 0) {
    const discapacidades = persona.condiciones_vulnerabilidad
      .filter((c: any) => c.nombre?.toUpperCase().includes('DISCAPACIDAD'))
      .map((c: any) => c.nombre)

    if (discapacidades.length > 0) {
      return discapacidades.join(', ')
    }
  }

  // Check enfermedades for disability-related situacion_salud
  if (persona?.persona_enfermedades && persona.persona_enfermedades.length > 0) {
    const discapacidades = persona.persona_enfermedades
      .filter((e: any) =>
        e.situacion_salud?.nombre?.toUpperCase().includes('DISCAPACIDAD') ||
        e.enfermedad?.nombre?.toUpperCase().includes('DISCAPACIDAD')
      )
      .map((e: any) => e.enfermedad?.nombre || e.situacion_salud?.nombre)
      .filter(Boolean)

    if (discapacidades.length > 0) {
      return discapacidades.join(', ')
    }
  }

  return ''
}

/**
 * Enhanced version with discapacidad and CUD detection
 */
export function mapSaludFromDemandaEnhanced(demandaData: DemandaFullDetail, personaId?: number): InformacionSalud {
  const baseData = mapSaludFromDemanda(demandaData, personaId)

  const persona = demandaData.personas?.find(p =>
    personaId ? p.persona.id === personaId : true
  ) || demandaData.personas?.[0]

  if (!persona) return baseData

  return {
    ...baseData,
    discapacidad: extractDiscapacidad(persona),
    cud: checkCUD(persona)
  }
}
