import type { FormData, NnyaData, AdultoData } from "../types/formTypes"

/**
 * Utility to create clean form data for API submission following the nested-fields-prompt.md guidelines
 * Only includes nested objects if they have meaningful data
 * Handles deletion of existing nested field data when needed
 */

/**
 * Checks if a nested object has meaningful data (not just empty/default values)
 */
function hasNonEmptyData(obj: any, requiredFields: string[] = []): boolean {
  if (!obj || typeof obj !== 'object') return false

  // Check if any required field has a value
  for (const field of requiredFields) {
    if (obj[field] !== null && obj[field] !== undefined && obj[field] !== '') {
      return true
    }
  }

  // Check if any non-required field has meaningful data
  return Object.values(obj).some(value => {
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'boolean') return value === true
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) return hasNonEmptyData(value)
    return false
  })
}

/**
 * Creates localizacion data only if not using default and has meaningful data
 */
function createLocalizacionData(localizacion: any, useDefaultLocalizacion: boolean) {
  if (useDefaultLocalizacion || !localizacion) return null

  const requiredFields = ['calle', 'casa_nro', 'localidad', 'referencia_geo']

  // Check if required fields are present
  const hasRequiredFields = requiredFields.every(field =>
    localizacion[field] !== null &&
    localizacion[field] !== undefined &&
    localizacion[field] !== ''
  )

  if (!hasRequiredFields) return null

  const cleanLocalizacion: any = {
    calle: localizacion.calle,
    casa_nro: Number(localizacion.casa_nro),
    localidad: Number(localizacion.localidad),
    referencia_geo: localizacion.referencia_geo,
  }

  // Only include optional fields if they have values
  if (localizacion.tipo_calle) cleanLocalizacion.tipo_calle = localizacion.tipo_calle
  if (localizacion.piso_depto) cleanLocalizacion.piso_depto = Number(localizacion.piso_depto)
  if (localizacion.lote) cleanLocalizacion.lote = Number(localizacion.lote)
  if (localizacion.mza) cleanLocalizacion.mza = Number(localizacion.mza)
  if (localizacion.geolocalizacion) cleanLocalizacion.geolocalizacion = localizacion.geolocalizacion
  if (localizacion.barrio) cleanLocalizacion.barrio = Number(localizacion.barrio)
  if (localizacion.cpc) cleanLocalizacion.cpc = Number(localizacion.cpc)

  return cleanLocalizacion
}

/**
 * Creates educacion data only if it has meaningful educational information
 */
function createEducacionData(educacion: any, existingEducacionId?: number): any {
  if (!educacion) return null

  const meaningfulFields = [
    'institucion_educativa', 'nivel_alcanzado', 'esta_escolarizado',
    'ultimo_cursado', 'tipo_escuela', 'comentarios_educativos'
  ]

  const hasMeaningfulData = meaningfulFields.some(field => {
    const value = educacion[field]
    if (field === 'esta_escolarizado') return value === true
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'object' && value !== null) return value.nombre?.trim() !== ''
    return false
  })

  // If no meaningful data, return deletion marker for existing records
  if (!hasMeaningfulData) {
    return existingEducacionId ? { id: existingEducacionId, deleted: true } : null
  }

  const cleanEducacion: any = {
    deleted: false,
  }

  // Include ID if updating existing record OR if educacion object has an ID
  if (existingEducacionId) {
    cleanEducacion.id = existingEducacionId
  } else if (educacion.id) {
    cleanEducacion.id = educacion.id
  }

  // Only include fields with meaningful data
  if (educacion.institucion_educativa) {
    if (typeof educacion.institucion_educativa === 'object' && educacion.institucion_educativa.nombre) {
      cleanEducacion.institucion_educativa = {
        ...(educacion.institucion_educativa.id ? { id: educacion.institucion_educativa.id } : {}),
        nombre: educacion.institucion_educativa.nombre
      }
    }
  }

  if (educacion.nivel_alcanzado) cleanEducacion.nivel_alcanzado = educacion.nivel_alcanzado
  // Always include esta_escolarizado as boolean (required by database)
  cleanEducacion.esta_escolarizado = educacion.esta_escolarizado === true
  if (educacion.ultimo_cursado) cleanEducacion.ultimo_cursado = educacion.ultimo_cursado
  if (educacion.tipo_escuela) cleanEducacion.tipo_escuela = educacion.tipo_escuela
  if (educacion.comentarios_educativos) cleanEducacion.comentarios_educativos = educacion.comentarios_educativos

  return cleanEducacion
}

/**
 * Creates cobertura_medica data only if it has meaningful medical coverage information
 */
function createCoberturaMedicaData(cobertura: any, existingCoberturaId?: number): any {
  if (!cobertura) return null

  const meaningfulFields = [
    'obra_social', 'intervencion', 'auh', 'observaciones',
    'institucion_sanitaria', 'medico_cabecera'
  ]

  const hasMeaningfulData = meaningfulFields.some(field => {
    const value = cobertura[field]
    if (field === 'auh') return value === true
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'object' && value !== null) {
      if (field === 'medico_cabecera') return value.nombre?.trim() !== ''
      if (field === 'institucion_sanitaria') return value.nombre?.trim() !== ''
      return hasNonEmptyData(value)
    }
    return false
  })

  // If no meaningful data, return deletion marker for existing records
  if (!hasMeaningfulData) {
    return existingCoberturaId ? { id: existingCoberturaId, deleted: true } : null
  }

  const cleanCobertura: any = {
    deleted: false,
  }

  // Include ID if updating existing record OR if cobertura object has an ID
  if (existingCoberturaId) {
    cleanCobertura.id = existingCoberturaId
  } else if (cobertura.id) {
    cleanCobertura.id = cobertura.id
  }

  // Only include fields with meaningful data
  if (cobertura.obra_social) cleanCobertura.obra_social = cobertura.obra_social
  if (cobertura.intervencion) cleanCobertura.intervencion = cobertura.intervencion
  // Always include auh as boolean (required by database)
  cleanCobertura.auh = cobertura.auh === true
  if (cobertura.observaciones) cleanCobertura.observaciones = cobertura.observaciones

  if (cobertura.institucion_sanitaria) {
    console.log('🏥 Processing institucion_sanitaria:', cobertura.institucion_sanitaria)

    if (typeof cobertura.institucion_sanitaria === 'object' && cobertura.institucion_sanitaria.nombre) {
      const sanitariaData: any = {
        nombre: cobertura.institucion_sanitaria.nombre
      }

      // Include ID if it exists
      if (cobertura.institucion_sanitaria.id) {
        sanitariaData.id = cobertura.institucion_sanitaria.id
        console.log('🏥 Using institucion_sanitaria ID:', cobertura.institucion_sanitaria.id)
      } else {
        console.log('⚠️ No ID found for institucion_sanitaria, only using name')
      }

      cleanCobertura.institucion_sanitaria = sanitariaData
    } else if (typeof cobertura.institucion_sanitaria === 'string') {
      // Handle case where it's just a string name
      cleanCobertura.institucion_sanitaria = {
        nombre: cobertura.institucion_sanitaria
      }
    }
  }

  if (cobertura.medico_cabecera && cobertura.medico_cabecera.nombre) {
    cleanCobertura.medico_cabecera = {
      nombre: cobertura.medico_cabecera.nombre,
      ...(cobertura.medico_cabecera.mail ? { mail: cobertura.medico_cabecera.mail } : {}),
      ...(cobertura.medico_cabecera.telefono ? { telefono: cobertura.medico_cabecera.telefono } : {})
    }
  }

  return cleanCobertura
}

/**
 * Creates persona_enfermedades array only if it has meaningful health conditions
 */
function createPersonaEnfermedadesData(enfermedades: any[]): any[] {
  if (!Array.isArray(enfermedades) || enfermedades.length === 0) return []

  return enfermedades
    .filter(enfermedad => enfermedad.situacion_salud || enfermedad.enfermedad?.nombre)
    .map(enfermedad => {
      const cleanEnfermedad: any = {
        ...(enfermedad.id ? { id: enfermedad.id } : {}),
        deleted: false,
        situacion_salud: enfermedad.situacion_salud,
      }

      if (enfermedad.enfermedad?.nombre) {
        cleanEnfermedad.enfermedad = {
          ...(enfermedad.enfermedad.id ? { id: enfermedad.enfermedad.id } : {}),
          nombre: enfermedad.enfermedad.nombre,
          situacion_salud_categoria: enfermedad.situacion_salud,
        }
      }

      if (enfermedad.institucion_sanitaria_interviniente) {
        cleanEnfermedad.institucion_sanitaria_interviniente = {
          id: typeof enfermedad.institucion_sanitaria_interviniente === 'object'
            ? enfermedad.institucion_sanitaria_interviniente.id
            : enfermedad.institucion_sanitaria_interviniente,
          nombre: typeof enfermedad.institucion_sanitaria_interviniente === 'object'
            ? enfermedad.institucion_sanitaria_interviniente.nombre
            : enfermedad.institucion_sanitaria_interviniente_nombre || null,
        }
      }

      if (enfermedad.medico_tratamiento?.nombre) {
        cleanEnfermedad.medico_tratamiento = enfermedad.medico_tratamiento
      }

      if (enfermedad.certificacion) cleanEnfermedad.certificacion = enfermedad.certificacion
      if (enfermedad.beneficios_gestionados) cleanEnfermedad.beneficios_gestionados = enfermedad.beneficios_gestionados
      // Always include recibe_tratamiento as it's required by the API
      cleanEnfermedad.recibe_tratamiento = enfermedad.recibe_tratamiento === true
      if (enfermedad.informacion_tratamiento) cleanEnfermedad.informacion_tratamiento = enfermedad.informacion_tratamiento

      return cleanEnfermedad
    })
}

/**
 * Creates clean NNYA persona data with conditional nested fields
 */
function createCleanNnyaData(nnya: NnyaData, index: number, existingIds?: any): any {
  const cleanPersona: any = {
    ...(nnya.personaId ? { persona_id: nnya.personaId } : {}),
    use_demanda_localizacion: nnya.useDefaultLocalizacion || false,

    // Required fields
    demanda_persona: {
      ...(nnya.demandaPersonaId ? { id: nnya.demandaPersonaId } : {}),
      deleted: false,
      conviviente: nnya.demanda_persona?.conviviente || false,
      vinculo_demanda: nnya.demanda_persona?.vinculo_demanda || null,
      vinculo_con_nnya_principal: nnya.demanda_persona?.vinculo_con_nnya_principal || null,
    },

    persona: {
      ...(nnya.personaId ? { id: nnya.personaId } : {}),
      deleted: false,
      nombre: nnya.nombre || null,
      apellido: nnya.apellido || null,
      nacionalidad: nnya.nacionalidad || null,
      situacion_dni: nnya.situacionDni || null,
      genero: nnya.genero || null,
      adulto: false,
      nnya: true,
      // Optional fields
      ...(nnya.fechaNacimiento ? { fecha_nacimiento: nnya.fechaNacimiento } : {}),
      ...(nnya.fechaDefuncion ? { fecha_defuncion: nnya.fechaDefuncion } : {}),
      ...(nnya.edadAproximada ? { edad_aproximada: Number(nnya.edadAproximada) } : {}),
      ...(nnya.dni ? { dni: Number(nnya.dni) } : {}),
      ...(nnya.observaciones ? { observaciones: nnya.observaciones } : {}),
    },

    condiciones_vulnerabilidad: ((nnya.condicionesVulnerabilidad || {}).condicion_vulnerabilidad || []).map(
      (condicion: number) => ({
        si_no: true,
        condicion_vulnerabilidad: condicion,
      }),
    ),

    vulneraciones: (nnya.vulneraciones || []).map((vulneracion: any) => {
      const vulneracionData: any = {
        ...(vulneracion.id && vulneracion.id !== 0 ? { id: vulneracion.id } : {}),
        principal_demanda: vulneracion.principal_demanda || false,
        transcurre_actualidad: vulneracion.transcurre_actualidad || false,
        nnya: index,
        categoria_motivo: vulneracion.categoria_motivo || 0,
        categoria_submotivo: vulneracion.categoria_submotivo || 0,
        gravedad_vulneracion: vulneracion.gravedad_vulneracion || 0,
        urgencia_vulneracion: vulneracion.urgencia_vulneracion || 0,
      }

      if (vulneracion.autor_dv && vulneracion.autor_dv !== 0) {
        vulneracionData.autor_dv = vulneracion.autor_dv
      }

      return vulneracionData
    }),
  }

  // Conditional nested fields - only include if they have meaningful data
  const localizacionData = createLocalizacionData(nnya.localizacion, nnya.useDefaultLocalizacion)
  if (localizacionData !== null) {
    cleanPersona.localizacion = localizacionData
  }

  // Pass existing education ID from multiple possible sources
  const existingEducacionId = existingIds?.educacion?.id || nnya.educacion?.id
  if (nnya.educacion && existingEducacionId) {
    console.log(`🎓 Using existing education ID ${existingEducacionId} for persona ${nnya.personaId}`)
  }
  const educacionData = createEducacionData(nnya.educacion, existingEducacionId)
  if (educacionData !== null) {
    cleanPersona.educacion = educacionData
  }

  // Pass existing medical coverage ID from multiple possible sources
  const existingCoberturaId = existingIds?.cobertura_medica?.id || nnya.cobertura_medica?.id
  const coberturaMedicaData = createCoberturaMedicaData(nnya.cobertura_medica, existingCoberturaId)
  if (coberturaMedicaData !== null) {
    cleanPersona.cobertura_medica = coberturaMedicaData
  }

  const enfermedadesData = createPersonaEnfermedadesData(nnya.persona_enfermedades)
  if (enfermedadesData.length > 0) {
    cleanPersona.persona_enfermedades = enfermedadesData
  }

  return cleanPersona
}

/**
 * Creates clean adulto persona data with conditional nested fields
 */
function createCleanAdultoData(adulto: AdultoData, existingIds?: any): any {
  const cleanPersona: any = {
    ...(adulto.personaId ? { persona_id: adulto.personaId } : {}),
    use_demanda_localizacion: adulto.useDefaultLocalizacion || false,

    // Required fields
    demanda_persona: {
      ...(adulto.demandaPersonaId ? { id: adulto.demandaPersonaId } : {}),
      deleted: false,
      conviviente: adulto.conviviente || false,
      ocupacion: adulto.ocupacion || null,
      legalmente_responsable: adulto.legalmenteResponsable || false,
      vinculo_demanda: adulto.vinculacion || null,
      vinculo_con_nnya_principal: adulto.vinculo_con_nnya_principal || null,
    },

    persona: {
      ...(adulto.personaId ? { id: adulto.personaId } : {}),
      deleted: false,
      nombre: adulto.nombre || null,
      apellido: adulto.apellido || null,
      nacionalidad: adulto.nacionalidad || null,
      situacion_dni: adulto.situacionDni || null,
      genero: adulto.genero || null,
      adulto: true,
      nnya: false,
      // Optional fields
      ...(adulto.fechaNacimiento ? { fecha_nacimiento: adulto.fechaNacimiento } : {}),
      ...(adulto.fechaDefuncion ? { fecha_defuncion: adulto.fechaDefuncion } : {}),
      ...(adulto.edadAproximada ? { edad_aproximada: Number(adulto.edadAproximada) } : {}),
      ...(adulto.dni ? { dni: Number(adulto.dni) } : {}),
      ...(adulto.observaciones ? { observaciones: adulto.observaciones } : {}),
      ...(adulto.telefono ? { telefono: Number(adulto.telefono) } : {}),
    },

    condiciones_vulnerabilidad: (adulto.condicionesVulnerabilidad || []).map((condicion: number) => ({
      si_no: true,
      condicion_vulnerabilidad: condicion,
    })),

    vulneraciones: [],
  }

  // Conditional nested fields - only include if they have meaningful data
  const localizacionData = createLocalizacionData(adulto.localizacion, adulto.useDefaultLocalizacion)
  if (localizacionData !== null) {
    cleanPersona.localizacion = localizacionData
  }

  // Adults don't typically have educacion, cobertura_medica, or persona_enfermedades
  // But if they did in the future, the logic would be similar to NNYA

  return cleanPersona
}

/**
 * Main function to create clean form data for API submission
 * Follows the guidelines from nested-fields-prompt.md
 */
export function submitCleanFormData(formData: FormData, existingData?: any): any {
  const transformedData = {
    fecha_oficio_documento: formData.fecha_oficio_documento,
    fecha_ingreso_senaf: formData.fecha_ingreso_senaf,
    bloque_datos_remitente: formData.bloque_datos_remitente,
    tipo_institucion: formData.tipo_institucion,
    institucion: {
      nombre: (() => {
        // Handle various possible structures for institucion field
        if (typeof formData.institucion === 'string') {
          return formData.institucion
        } else if (typeof formData.institucion === 'object' && formData.institucion !== null) {
          // Check for double nesting first
          if (typeof formData.institucion.nombre === 'object' && formData.institucion.nombre?.nombre) {
            console.warn('⚠️ Double nesting detected in formData.institucion.nombre.nombre, fixing automatically')
            return formData.institucion.nombre.nombre
          }
          // Normal object structure
          if (typeof formData.institucion.nombre === 'string') {
            return formData.institucion.nombre
          }
        }
        return ''
      })(),
      tipo_institucion: formData.tipo_institucion,
    },
    ambito_vulneracion: formData.ambito_vulneracion,
    etiqueta: formData.etiqueta,
    envio_de_respuesta: formData.envio_de_respuesta,
    motivo_ingreso: formData.motivo_ingreso,
    submotivo_ingreso: formData.submotivo_ingreso,
    objetivo_de_demanda: formData.objetivo_de_demanda,
    observaciones: formData.observaciones || null,
    localizacion: formData.localizacion,

    relacion_demanda: {
      codigos_demanda: (formData.codigosDemanda || []).map((codigo) => ({
        codigo: codigo.codigo,
        tipo_codigo: codigo.tipo,
      })),
      demanda_zona: {
        zona: formData.zona,
        esta_activo: true,
        recibido: false,
      },
    },

    personas: [
      // Clean NNYA data with conditional nested fields
      ...(formData.ninosAdolescentes || []).map((nnya: any, index: number) => {
        const existingNnyaIds = existingData?.personas?.[index]
        return createCleanNnyaData(nnya, index, existingNnyaIds)
      }),

      // Clean adulto data with conditional nested fields
      ...(formData.adultosConvivientes || []).map((adulto: any) => {
        const existingAdultoIds = existingData?.personas?.find((p: any) => p.persona?.id === adulto.personaId)
        return createCleanAdultoData(adulto, existingAdultoIds)
      }),
    ],
  }

  return transformedData
}

/**
 * Utility to mark nested field for deletion
 * Use this when you want to delete existing nested field data
 */
export function markNestedFieldForDeletion(fieldType: 'educacion' | 'cobertura_medica' | 'persona_enfermedades', existingId: number) {
  if (fieldType === 'persona_enfermedades') {
    return { id: existingId, deleted: true }
  }

  return {
    id: existingId,
    deleted: true
  }
}

/**
 * Helper function to check if a form field should be considered "loaded"
 * A field is considered loaded if it has been interacted with or has meaningful data
 */
export function isFieldLoaded(fieldValue: any, fieldType: 'educacion' | 'cobertura_medica' | 'localizacion'): boolean {
  if (!fieldValue || typeof fieldValue !== 'object') return false

  switch (fieldType) {
    case 'educacion':
      return !!(
        fieldValue.institucion_educativa?.nombre ||
        fieldValue.nivel_alcanzado ||
        fieldValue.esta_escolarizado === true ||
        fieldValue.ultimo_cursado ||
        fieldValue.tipo_escuela ||
        fieldValue.comentarios_educativos
      )

    case 'cobertura_medica':
      return !!(
        fieldValue.obra_social ||
        fieldValue.intervencion ||
        fieldValue.auh === true ||
        fieldValue.observaciones ||
        fieldValue.institucion_sanitaria?.nombre ||
        fieldValue.medico_cabecera?.nombre
      )

    case 'localizacion':
      return !!(
        fieldValue.calle ||
        fieldValue.casa_nro ||
        fieldValue.localidad ||
        fieldValue.referencia_geo
      )

    default:
      return false
  }
}