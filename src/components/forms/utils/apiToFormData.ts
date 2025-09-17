import { get } from "@/app/api/apiService"

export const transformApiDataToFormData = (apiData: any): FormData => {
  return {
    // Include estado_demanda in the transformed data
    estado_demanda: apiData.estado_demanda || null,
    objetivo_de_demanda: apiData.objetivo_de_demanda || null,
    fecha_oficio_documento: apiData.fecha_oficio_documento || null,
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || null,
    bloque_datos_remitente: apiData.bloque_datos_remitente || null,
    tipo_institucion: apiData.tipo_institucion || null,
    institucion: apiData.institucion?.nombre || null,
    ambito_vulneracion: apiData.ambito_vulneracion || null,
    envio_de_respuesta: apiData.envio_de_respuesta || null,
    etiqueta: apiData.etiqueta || null,
    motivo_ingreso: apiData.motivo_ingreso || null,
    submotivo_ingreso: apiData.submotivo_ingreso || null,
    localizacion: apiData.localizacion || null,

    // codigosDemanda
    codigosDemanda:
      apiData.relacion_demanda?.codigos_demanda?.map((codigo: any) => ({
        codigo: codigo.codigo,
        tipo: codigo.tipo_codigo,
      })) || [],

    // zona & observaciones
    zona: apiData.relacion_demanda?.demanda_zona?.zona || null,
    observaciones: apiData.relacion_demanda?.demanda_zona?.comentarios || null,

    // Niños/niñas/adolescentes
    ninosAdolescentes: apiData.personas
      .filter((p: any) => p.persona.nnya)
      .map((nnya: any, index: number) => ({
        // If persona already exists, store personaId
        personaId: nnya.persona.id || undefined,
        // If demanda_persona already exists, store demandaPersonaId
        demandaPersonaId: nnya.demanda_persona?.id || undefined,

        nombre: nnya.persona.nombre,
        apellido: nnya.persona.apellido,
        fechaNacimiento: nnya.persona.fecha_nacimiento,
        fechaDefuncion: nnya.persona.fecha_defuncion || null,
        edadAproximada: nnya.persona.edad_aproximada,
        nacionalidad: nnya.persona.nacionalidad,
        dni: nnya.persona.dni,
        situacionDni: nnya.persona.situacion_dni,
        genero: nnya.persona.genero,
        observaciones: nnya.persona.observaciones,

        useDefaultLocalizacion:
          nnya.use_demanda_localizacion ||
          (nnya.localizacion?.id === apiData.localizacion?.id && nnya.localizacion?.id !== undefined),
        localizacion: nnya.localizacion,
        educacion: nnya.educacion
          ? {
            ...nnya.educacion,
            institucion_educativa: nnya.educacion.institucion_educativa || null,
          }
          : null,

        cobertura_medica: nnya.cobertura_medica
          ? {
            id: nnya.cobertura_medica.id,
            institucion_sanitaria: nnya.cobertura_medica?.institucion_sanitaria || null,
            obra_social: nnya.cobertura_medica.obra_social || null,
            intervencion: nnya.cobertura_medica.intervencion || null,
            medico_cabecera: nnya.cobertura_medica.medico_cabecera || null,
            auh: nnya.cobertura_medica.auh || false,
            observaciones: nnya.cobertura_medica.observaciones || null,
            deleted: nnya.cobertura_medica.deleted || false,
          }
          : null,

        persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
          id: enfermedad.id,
          ...enfermedad,
          enfermedad: enfermedad.enfermedad || null,
          institucion_sanitaria_interviniente: enfermedad.institucion_sanitaria_interviniente?.id || null,
          institucion_sanitaria_interviniente_nombre: enfermedad.institucion_sanitaria_interviniente?.nombre || null,
          medico_tratamiento: enfermedad.medico_tratamiento || null,
          recibe_tratamiento: enfermedad.recibe_tratamiento || false,
          informacion_tratamiento: enfermedad.informacion_tratamiento || null,
          deleted: enfermedad.deleted || false,
        })),

        demanda_persona: {
          id: nnya.demanda_persona.id,
          conviviente: nnya.demanda_persona.conviviente,
          vinculo_demanda: nnya.demanda_persona.vinculo_demanda,
          vinculo_con_nnya_principal: nnya.demanda_persona.vinculo_con_nnya_principal,
        },

        condicionesVulnerabilidad: {
          condicion_vulnerabilidad: nnya.condiciones_vulnerabilidad.map((cv: any) => cv.condicion_vulnerabilidad),
        },

        vulneraciones: (nnya.vulneraciones || []).map((vulneracion: any) => ({
          id: vulneracion.id || 0,
          principal_demanda: vulneracion.principal_demanda || false,
          transcurre_actualidad: vulneracion.transcurre_actualidad || false,
          nnya: index,
          autor_dv: vulneracion.autor_dv || 0,
          autordv_index: vulneracion.autordv_index || 0,
          categoria_motivo: vulneracion.categoria_motivo || 0,
          categoria_submotivo: vulneracion.categoria_submotivo || 0,
          gravedad_vulneracion: vulneracion.gravedad_vulneracion || 0,
          urgencia_vulneracion: vulneracion.urgencia_vulneracion || 0,
        })),
      })),

    // Adultos convivientes
    adultosConvivientes: apiData.personas
      .filter((p: any) => p.persona.adulto)
      .map((adulto: any) => ({
        // If persona already exists, store personaId
        personaId: adulto.persona.id || undefined,
        // If demanda_persona already exists, store demandaPersonaId
        demandaPersonaId: adulto.demanda_persona?.id || undefined,

        nombre: adulto.persona.nombre,
        apellido: adulto.persona.apellido,
        fechaNacimiento: adulto.persona.fecha_nacimiento,
        fechaDefuncion: adulto.persona.fecha_defuncion || null,
        legalmenteResponsable: adulto.demanda_persona.legalmente_responsable,
        ocupacion: adulto.demanda_persona.ocupacion,
        edadAproximada: adulto.persona.edad_aproximada,
        nacionalidad: adulto.persona.nacionalidad,
        dni: adulto.persona.dni,
        situacionDni: adulto.persona.situacion_dni,
        genero: adulto.persona.genero,
        observaciones: adulto.persona.observaciones,

        useDefaultLocalizacion:
          adulto.use_demanda_localizacion ||
          (adulto.localizacion?.id === apiData.localizacion?.id && adulto.localizacion?.id !== undefined),
        localizacion: adulto.localizacion,
        conviviente: adulto.demanda_persona.conviviente,
        vinculacion: adulto.demanda_persona.vinculo_demanda,
        vinculo_con_nnya_principal: adulto.demanda_persona.vinculo_con_nnya_principal,

        condicionesVulnerabilidad: adulto.condiciones_vulnerabilidad.map((cv: any) => cv.condicion_vulnerabilidad),
      })),
  }
}

export const fetchCaseData = async (id: string): Promise<FormData> => {
  try {
    const response = await get<FormData>(`registro-demanda-form/${id}/`)
    console.log("Fetched case data:", response)
    return transformApiDataToFormData(response)
  } catch (error) {
    console.error("Error fetching case data:", error)
    throw error
  }
}
