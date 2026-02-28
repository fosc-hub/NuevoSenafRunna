// Keeping this module untyped for flexibility with transient shapes

/**
 * Deep compares two objects and returns an object containing only the changed values
 * @param original The original object
 * @param updated The updated object
 * @returns An object containing only the changed values
 */
export function getChangedValues(original: any, updated: any, path = ""): any {
  // If types don't match, consider it changed
  if (typeof original !== typeof updated) {
    return updated
  }

  // Handle null values
  if (original === null || updated === null) {
    return original === updated ? undefined : updated
  }

  // Handle arrays
  if (Array.isArray(original) && Array.isArray(updated)) {
    // Special handling for arrays of objects with IDs
    if (
      original.length > 0 &&
      updated.length > 0 &&
      typeof original[0] === "object" &&
      typeof updated[0] === "object"
    ) {
      // Check if objects have IDs for matching
      const hasIds =
        original.some((item: any) => item.id !== undefined) && updated.some((item: any) => item.id !== undefined)

      if (hasIds) {
        // Map of original items by ID
        const originalMap = new Map(
          original.filter((item: any) => item.id !== undefined).map((item: any) => [item.id, item]),
        )

        // Process each updated item
        const result = updated
          .map((updatedItem: any) => {
            // New item (no ID) or item not in original - include completely
            if (updatedItem.id === undefined || !originalMap.has(updatedItem.id)) {
              return updatedItem
            }

            // Compare with original and only include changes
            const originalItem = originalMap.get(updatedItem.id)
            const changes = getChangedValues(originalItem, updatedItem, `${path}[${updatedItem.id}]`)

            // Always include ID with changes
            return changes ? { id: updatedItem.id, ...changes } : undefined
          })
          .filter(Boolean)

        // If there are changes, return the array, otherwise undefined
        return result.length > 0 ? result : undefined
      }
    }

    // Check if arrays have different lengths - this could indicate new items
    if (original.length !== updated.length) {
      return updated
    }

    // For simple arrays or arrays without IDs, compare directly
    if (JSON.stringify(original) !== JSON.stringify(updated)) {
      return updated
    }
    return undefined
  }

  // Handle objects
  if (typeof original === "object" && typeof updated === "object") {
    const changes: any = {}
    let hasChanges = false

    // Check all keys in updated object
    for (const key in updated) {
      // Skip if property doesn't exist in updated
      if (!Object.prototype.hasOwnProperty.call(updated, key)) continue

      const newPath = path ? `${path}.${key}` : key

      // If key doesn't exist in original, it's a new property
      if (!Object.prototype.hasOwnProperty.call(original, key)) {
        changes[key] = updated[key]
        hasChanges = true
        continue
      }

      // Recursively check for changes
      const valueChanges = getChangedValues(original[key], updated[key], newPath)
      if (valueChanges !== undefined) {
        changes[key] = valueChanges
        hasChanges = true
      }
    }

    return hasChanges ? changes : undefined
  }

  // For primitive values, compare directly
  return original === updated ? undefined : updated
}

/**
 * Creates a patch object from the original and updated form data
 */
export function createPatchFromChanges(originalData: any, updatedData: any): any {
  const changes = getChangedValues(originalData, updatedData)
  console.log("Detected changes:", JSON.stringify(changes, null, 2))

  // HOTFIX: Check if there's education data that should be preserved
  const hasEducationInUpdatedData = updatedData.personas?.some((persona: any) =>
    persona.educacion && (
      persona.educacion.institucion_educativa?.nombre ||
      persona.educacion.nivel_alcanzado ||
      persona.educacion.esta_escolarizado ||
      persona.educacion.ultimo_cursado ||
      persona.educacion.tipo_escuela ||
      persona.educacion.comentarios_educativos
    )
  )

  if (hasEducationInUpdatedData) {
    console.log("🎓 Education data detected in updated data, ensuring personas are preserved")
    if (!changes.personas) {
      console.log("🚨 HOTFIX: Force including personas because education data detected but not in changes")
      changes.personas = updatedData.personas
    } else {
      console.log("✅ Personas already in changes, preserving education data")
    }
  }

  // Transform the changes into the API expected format
  const transformedChanges: any = {}

  // Copy top-level simple fields
  const simpleFields = [
    "fecha_oficio_documento",
    "fecha_ingreso_senaf",
    "bloque_datos_remitente",
    "tipo_institucion",
    "ambito_vulneracion",
    "etiqueta",
    "envio_de_respuesta",
    "motivo_ingreso",
    "submotivo_ingreso",
    "objetivo_de_demanda",
    "observaciones",
    // CARGA_OFICIOS specific fields
    "tipo_medida_evaluado",
    "categoria_informacion_judicial",
    "tipo_oficio",
    "numero_expediente",
    "nro_oficio_web",
    "autocaratulado",
    "presuntos_delitos",
    "descripcion",
    "plazo_dias",
    "fecha_vencimiento_oficio",
    "departamento_judicial",
  ]

  simpleFields.forEach((field) => {
    if (changes && changes[field] !== undefined) {
      transformedChanges[field] = changes[field]
    }
  })

  // For CARGA_OFICIOS, also check if we need to map caratula to autocaratulado
  if (changes && changes.caratula !== undefined) {
    transformedChanges.autocaratulado = changes.caratula
  }

  // Handle institution - ensure we always create correct structure
  // For CARGA_OFICIOS, institucion is an ID (number), not an object with nombre
  const isCargaOficios = updatedData.objetivo_de_demanda === 'CARGA_OFICIOS'

  if (changes && changes.institucion !== undefined) {
    if (isCargaOficios) {
      // For CARGA_OFICIOS, institucion is just an ID
      transformedChanges.institucion = typeof changes.institucion === 'number'
        ? changes.institucion
        : changes.institucion
    } else {
      // For standard demandas, institucion is an object with nombre
      let institucionNombre: string = ''

      if (typeof changes.institucion === 'string') {
        institucionNombre = changes.institucion
      } else if (typeof changes.institucion === 'object' && changes.institucion !== null) {
        // Handle case where institucion is already an object
        if (typeof changes.institucion.nombre === 'string') {
          institucionNombre = changes.institucion.nombre
        } else if (typeof changes.institucion.nombre === 'object' && changes.institucion.nombre?.nombre) {
          // Handle double nesting case
          institucionNombre = changes.institucion.nombre.nombre
          console.warn('⚠️ Double nesting detected in institucion, fixing automatically')
        }
      }

      transformedChanges.institucion = {
        nombre: institucionNombre,
        tipo_institucion: updatedData.tipo_institucion,
      }
    }
  }

  // Handle localization
  if (changes && changes.localizacion !== undefined) {
    transformedChanges.localizacion = changes.localizacion
  }

  // Handle relacion_demanda - FIXED to include required fields
  if (changes && (changes.codigosDemanda || changes.zona)) {
    transformedChanges.relacion_demanda = {}

    if (changes.codigosDemanda) {
      transformedChanges.relacion_demanda.codigos_demanda = changes.codigosDemanda.map((codigo: any) => ({
        codigo: codigo.codigo,
        tipo_codigo: codigo.tipo,
      }))
    }

    // If any field in demanda_zona changes, include the entire structure with required fields
    if (changes.zona !== undefined) {
      transformedChanges.relacion_demanda.demanda_zona = {
        // Always include these required fields
        zona: changes.zona !== undefined ? changes.zona : originalData.zona,
        esta_activo: true,
        recibido: false,
      }
    }
  }

  // Handle personas (ninosAdolescentes and adultosConvivientes)
  const hasPersonaChanges = shouldIncludePersonas(originalData, updatedData, changes)

  if (hasPersonaChanges) {
    transformedChanges.personas = []

    // Process ninosAdolescentes
    if (updatedData.ninosAdolescentes && updatedData.ninosAdolescentes.length > 0) {
      updatedData.ninosAdolescentes.forEach((nnya: any, index: number) => {
        const originalNnya = originalData.ninosAdolescentes?.[index]

        // Check if this is a new persona or if there are changes
        const isNew = !originalNnya || !nnya.personaId

        // Direct comparison for edited fields
        let hasChanges = false
        if (!isNew) {
          // Compare key fields to detect changes
          hasChanges = hasPersonaFieldChanges(originalNnya, nnya)
        }

        // Also check if there are changes detected by getChangedValues
        const detectedChanges = changes?.ninosAdolescentes?.[index]

        // FORCE INCLUSION: For now, always include education data if it exists to fix the missing data issue
        const hasEducationData = nnya.educacion && (
          nnya.educacion.institucion_educativa?.nombre ||
          nnya.educacion.nivel_alcanzado ||
          nnya.educacion.esta_escolarizado ||
          nnya.educacion.ultimo_cursado ||
          nnya.educacion.tipo_escuela ||
          nnya.educacion.comentarios_educativos
        )

        // Temporary fix: Include if there's education data that wasn't in original
        const originalHadEducation = originalNnya?.educacion && originalNnya.educacion !== null
        const shouldIncludeEducation = hasEducationData && !originalHadEducation

        console.log(`🔍 NNYA ${index} Education Debug:`)
        console.log(`   hasEducationData: ${hasEducationData}`)
        console.log(`   originalHadEducation: ${originalHadEducation}`)
        console.log(`   originalNnya.educacion: ${JSON.stringify(originalNnya?.educacion)}`)
        console.log(`   shouldIncludeEducation: ${shouldIncludeEducation}`)

        if (isNew || hasChanges || detectedChanges || shouldIncludeEducation) {
          if (shouldIncludeEducation) {
            console.log(`🎓 Including NNYA ${index} due to new education data`)
          }
          console.log(
            `Processing nnya ${index}: isNew=${isNew}, hasChanges=${hasChanges}, detectedChanges=${!!detectedChanges}, shouldIncludeEducation=${shouldIncludeEducation}`,
          )

          const personaData: any = {
            // Only include persona_id if it exists (for existing personas)
            ...(nnya.personaId ? { persona_id: nnya.personaId } : {}),
            use_demanda_localizacion: nnya.useDefaultLocalizacion || false,
          }

          // For new personas, include all data
          if (isNew) {
            // Include all data for new personas
            addFullNnyaData(personaData, nnya, index)
          } else {
            // For existing personas with changes, include all data to ensure nothing is missed
            addFullNnyaData(personaData, nnya, index)
          }

          transformedChanges.personas.push(personaData)
        }
      })
    }

    // Process adultosConvivientes
    if (updatedData.adultosConvivientes && updatedData.adultosConvivientes.length > 0) {
      updatedData.adultosConvivientes.forEach((adulto: any, index: number) => {
        const originalAdulto = originalData.adultosConvivientes?.[index]

        // Check if this is a new persona or if there are changes
        const isNew = !originalAdulto || !adulto.personaId

        // Direct comparison for edited fields
        let hasChanges = false
        if (!isNew) {
          // Compare key fields to detect changes
          hasChanges = hasPersonaFieldChanges(originalAdulto, adulto)
        }

        // Also check if there are changes detected by getChangedValues
        const detectedChanges = changes?.adultosConvivientes?.[index]

        if (isNew || hasChanges || detectedChanges) {
          console.log(
            `Processing adulto ${index}: isNew=${isNew}, hasChanges=${hasChanges}, detectedChanges=${!!detectedChanges}`,
          )

          const personaData: any = {
            // Only include persona_id if it exists (for existing personas)
            ...(adulto.personaId ? { persona_id: adulto.personaId } : {}),
            use_demanda_localizacion: adulto.useDefaultLocalizacion || false,
          }

          // For new personas, include all data
          if (isNew) {
            // Include all data for new personas
            addFullAdultoData(personaData, adulto)
          } else {
            // For existing personas with changes, include all data to ensure nothing is missed
            addFullAdultoData(personaData, adulto)
          }

          transformedChanges.personas.push(personaData)
        }
      })
    }
  }

  // CRITICAL FIX: If changes.personas exists but transformedChanges.personas doesn't, copy it over
  if (changes.personas && !transformedChanges.personas) {
    console.log("🚨 CRITICAL FIX: Copying personas from changes to transformedChanges")
    transformedChanges.personas = changes.personas
  }

  console.log("🔥 FINAL TRANSFORMED CHANGES:", JSON.stringify(transformedChanges, null, 2))
  return transformedChanges
}

/**
 * Determines if personas should be included in the patch
 */
function shouldIncludePersonas(originalData: any, updatedData: any, changes: any): boolean {
  // Check if there are changes detected by getChangedValues
  const hasDetectedChanges = !!(changes?.ninosAdolescentes || changes?.adultosConvivientes)

  // Check if there are new personas
  const hasNewNnya = updatedData.ninosAdolescentes?.length > (originalData.ninosAdolescentes?.length || 0)
  const hasNewAdulto = updatedData.adultosConvivientes?.length > (originalData.adultosConvivientes?.length || 0)

  // Check for direct field changes in existing personas
  let hasDirectChanges = false

  // Check ninosAdolescentes
  if (updatedData.ninosAdolescentes && originalData.ninosAdolescentes) {
    for (let i = 0; i < Math.min(updatedData.ninosAdolescentes.length, originalData.ninosAdolescentes.length); i++) {
      if (hasPersonaFieldChanges(originalData.ninosAdolescentes[i], updatedData.ninosAdolescentes[i])) {
        hasDirectChanges = true
        break
      }
    }
  }

  // Check adultosConvivientes
  if (!hasDirectChanges && updatedData.adultosConvivientes && originalData.adultosConvivientes) {
    for (
      let i = 0;
      i < Math.min(updatedData.adultosConvivientes.length, originalData.adultosConvivientes.length);
      i++
    ) {
      if (hasPersonaFieldChanges(originalData.adultosConvivientes[i], updatedData.adultosConvivientes[i])) {
        hasDirectChanges = true
        break
      }
    }
  }

  return hasDetectedChanges || hasNewNnya || hasNewAdulto || hasDirectChanges
}

/**
 * Checks if there are changes between two persona objects
 */
function hasPersonaFieldChanges(originalPersona: any, updatedPersona: any): boolean {
  if (!originalPersona || !updatedPersona) return true

  // Compare basic fields
  const basicFields = [
    "nombre",
    "apellido",
    "fechaNacimiento",
    "fechaDefuncion",
    "edadAproximada",
    "nacionalidad",
    "dni",
    "situacionDni",
    "genero",
    "observaciones",
  ]

  for (const field of basicFields) {
    if (originalPersona[field] !== updatedPersona[field]) {
      console.log(`Field ${field} changed: ${originalPersona[field]} -> ${updatedPersona[field]}`)
      return true
    }
  }

  // Compare localization
  if (originalPersona.useDefaultLocalizacion !== updatedPersona.useDefaultLocalizacion) {
    return true
  }

  if (!originalPersona.useDefaultLocalizacion && !updatedPersona.useDefaultLocalizacion) {
    if (JSON.stringify(originalPersona.localizacion) !== JSON.stringify(updatedPersona.localizacion)) {
      return true
    }
  }

  // For ninosAdolescentes, check additional fields
  if ("educacion" in originalPersona || "educacion" in updatedPersona) {
    // Check education
    const originalEducacion = JSON.stringify(originalPersona.educacion)
    const updatedEducacion = JSON.stringify(updatedPersona.educacion)

    if (originalEducacion !== updatedEducacion) {
      console.log(`🎓 Education changed:`)
      console.log(`   Original: ${originalEducacion}`)
      console.log(`   Updated: ${updatedEducacion}`)
      return true
    }

    // Check medical coverage
    if (JSON.stringify(originalPersona.cobertura_medica) !== JSON.stringify(updatedPersona.cobertura_medica)) {
      return true
    }

    // Check diseases
    if (JSON.stringify(originalPersona.persona_enfermedades) !== JSON.stringify(updatedPersona.persona_enfermedades)) {
      return true
    }

    // Check vulnerabilities
    if (JSON.stringify(originalPersona.vulneraciones) !== JSON.stringify(updatedPersona.vulneraciones)) {
      return true
    }
  }

  // Check demanda_persona
  if (JSON.stringify(originalPersona.demanda_persona) !== JSON.stringify(updatedPersona.demanda_persona)) {
    return true
  }

  // Check vulnerability conditions
  if (
    JSON.stringify(originalPersona.condicionesVulnerabilidad) !==
    JSON.stringify(updatedPersona.condicionesVulnerabilidad)
  ) {
    return true
  }

  return false
}

/**
 * Adds all nnya data to the persona object
 */
function addFullNnyaData(personaData: any, nnya: any, index: number): void {
  personaData.localizacion = nnya.useDefaultLocalizacion ? null : nnya.localizacion

  if (nnya.educacion) {
    personaData.educacion = {
      ...(nnya.educacion.id ? { id: nnya.educacion.id } : {}),
      institucion_educativa: nnya.educacion.institucion_educativa
        ? {
          ...(nnya.educacion.institucion_educativa.id ? { id: nnya.educacion.institucion_educativa.id } : {}),
          nombre: nnya.educacion.institucion_educativa.nombre || null,
        }
        : null,
      nivel_alcanzado: nnya.educacion.nivel_alcanzado || null,
      esta_escolarizado: nnya.educacion.esta_escolarizado || false,
      ultimo_cursado: nnya.educacion.ultimo_cursado || null,
      tipo_escuela: nnya.educacion.tipo_escuela || null,
      comentarios_educativos: nnya.educacion.comentarios_educativos || null,
      deleted: false,
    }
  }

  if (nnya.cobertura_medica) {
    personaData.cobertura_medica = {
      ...(nnya.cobertura_medica.id ? { id: nnya.cobertura_medica.id } : {}),
      institucion_sanitaria: nnya.cobertura_medica.institucion_sanitaria
        ? {
          id:
            typeof nnya.cobertura_medica.institucion_sanitaria === "object"
              ? nnya.cobertura_medica.institucion_sanitaria.id
              : nnya.cobertura_medica.institucion_sanitaria,
          nombre:
            typeof nnya.cobertura_medica.institucion_sanitaria === "object"
              ? nnya.cobertura_medica.institucion_sanitaria.nombre
              : nnya.cobertura_medica.institucion_sanitaria_nombre || null,
        }
        : null,
      obra_social: nnya.cobertura_medica.obra_social || null,
      intervencion: nnya.cobertura_medica.intervencion || null,
      medico_cabecera: nnya.cobertura_medica.medico_cabecera || null,
      auh: nnya.cobertura_medica.auh || false,
      observaciones: nnya.cobertura_medica.observaciones || null,
      deleted: false,
    }
  }

  if (nnya.persona_enfermedades && nnya.persona_enfermedades.length > 0) {
    personaData.persona_enfermedades = nnya.persona_enfermedades.map((enfermedad: any) => ({
      ...(enfermedad.id ? { id: enfermedad.id } : {}),
      situacion_salud: enfermedad.situacion_salud,
      enfermedad: enfermedad.enfermedad
        ? {
          ...(enfermedad.enfermedad.id ? { id: enfermedad.enfermedad.id } : {}),
          nombre: enfermedad.enfermedad.nombre || null,
          situacion_salud_categoria: enfermedad.situacion_salud,
        }
        : null,
      institucion_sanitaria_interviniente: enfermedad.institucion_sanitaria_interviniente
        ? {
          id:
            typeof enfermedad.institucion_sanitaria_interviniente === "object"
              ? enfermedad.institucion_sanitaria_interviniente.id
              : enfermedad.institucion_sanitaria_interviniente,
          nombre:
            typeof enfermedad.institucion_sanitaria_interviniente === "object"
              ? enfermedad.institucion_sanitaria_interviniente.nombre
              : enfermedad.institucion_sanitaria_interviniente_nombre || null,
        }
        : null,
      medico_tratamiento: enfermedad.medico_tratamiento || {
        nombre: null,
        mail: null,
        telefono: null,
      },
      certificacion: enfermedad.certificacion || null,
      beneficios_gestionados: enfermedad.beneficios_gestionados || null,
      recibe_tratamiento: enfermedad.recibe_tratamiento || false,
      informacion_tratamiento: enfermedad.informacion_tratamiento || null,
      deleted: false,
    }))
  }

  personaData.demanda_persona = {
    ...(nnya.demandaPersonaId ? { id: nnya.demandaPersonaId } : {}),
    deleted: false,
    conviviente: nnya.demanda_persona?.conviviente || false,
    vinculo_demanda: nnya.demanda_persona?.vinculo_demanda || null,
    vinculo_con_nnya_principal: nnya.demanda_persona?.vinculo_con_nnya_principal || null,
  }

  if (nnya.condicionesVulnerabilidad && Array.isArray(nnya.condicionesVulnerabilidad)) {
    personaData.condiciones_vulnerabilidad = nnya.condicionesVulnerabilidad.map(
      (condicion: number) => ({
        si_no: true,
        condicion_vulnerabilidad: condicion,
      }),
    )
  }

  personaData.persona = {
    ...(nnya.personaId ? { id: nnya.personaId } : {}),
    deleted: false,
    nombre: nnya.nombre || null,
    nombre_autopercibido: null,
    apellido: nnya.apellido || null,
    fecha_nacimiento: nnya.fechaNacimiento || null,
    edad_aproximada: nnya.edadAproximada || null,
    fecha_defuncion: nnya.fechaDefuncion || null,
    nacionalidad: nnya.nacionalidad || null,
    dni: nnya.dni || null,
    situacion_dni: nnya.situacionDni || null,
    genero: nnya.genero || null,
    observaciones: nnya.observaciones || null,
    adulto: false,
    nnya: true,
  }

  if (nnya.vulneraciones && nnya.vulneraciones.length > 0) {
    personaData.vulneraciones = nnya.vulneraciones.map((vulneracion: any) => {
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

      // Si autor_dv existe y es válido, lo incluimos
      if (vulneracion.autor_dv && vulneracion.autor_dv !== 0) {
        vulneracionData.autor_dv = vulneracion.autor_dv
      } else {
        // Si no tenemos autor_dv válido, usamos autordv_index
        vulneracionData.autordv_index = vulneracion.autordv_index || 0
      }

      return vulneracionData
    })
  }
}

/**
 * Adds all adulto data to the persona object
 */
function addFullAdultoData(personaData: any, adulto: any): void {
  personaData.localizacion = adulto.useDefaultLocalizacion ? null : adulto.localizacion
  personaData.educacion = null
  personaData.cobertura_medica = null
  personaData.persona_enfermedades = []

  personaData.demanda_persona = {
    ...(adulto.demandaPersonaId ? { id: adulto.demandaPersonaId } : {}),
    deleted: false,
    conviviente: adulto.conviviente || false,
    ocupacion: adulto.ocupacion || null,
    legalmente_responsable: adulto.legalmenteResponsable || false,
    vinculo_demanda: adulto.vinculacion || null,
    vinculo_con_nnya_principal: adulto.vinculo_con_nnya_principal || null,
  }

  if (adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0) {
    personaData.condiciones_vulnerabilidad = adulto.condicionesVulnerabilidad.map((condicion: number) => ({
      si_no: true,
      condicion_vulnerabilidad: condicion,
    }))
  }

  personaData.persona = {
    ...(adulto.personaId ? { id: adulto.personaId } : {}),
    deleted: false,
    nombre: adulto.nombre || null,
    nombre_autopercibido: null,
    apellido: adulto.apellido || null,
    fecha_nacimiento: adulto.fechaNacimiento || null,
    fecha_defuncion: adulto.fechaDefuncion || null,
    edad_aproximada: adulto.edadAproximada || null,
    nacionalidad: adulto.nacionalidad || null,
    dni: adulto.dni || null,
    situacion_dni: adulto.situacionDni || null,
    genero: adulto.genero || null,
    observaciones: adulto.observaciones || null,
    adulto: true,
    nnya: false,
  }

  personaData.vulneraciones = []
}
