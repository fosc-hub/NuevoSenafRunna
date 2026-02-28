import { get } from "@/app/api/apiService"
import type { FormData } from "../types/formTypes"

export const transformApiDataToFormData = (apiData: any): FormData => {
  return {
    // Include estado_demanda in the transformed data
    estado_demanda: apiData.estado_demanda || null,
    objetivo_de_demanda: apiData.objetivo_de_demanda || null,
    fecha_oficio_documento: apiData.fecha_oficio_documento || null,
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || null,
    bloque_datos_remitente: apiData.bloque_datos_remitente || null,
    tipo_institucion: apiData.tipo_institucion || null,
    // For standard demandas, institucion is a string (name)
    // For CARGA_OFICIOS, institucion is a number (ID from tipo_institucion_demanda)
    institucion: apiData.objetivo_de_demanda === 'CARGA_OFICIOS'
      ? (apiData.institucion?.id || apiData.institucion || null)
      : (apiData.institucion?.nombre || null),
    ambito_vulneracion: apiData.ambito_vulneracion || null,
    envio_de_respuesta: apiData.envio_de_respuesta || null,
    etiqueta: apiData.etiqueta || null,
    motivo_ingreso: apiData.motivo_ingreso || null,
    submotivo_ingreso: apiData.submotivo_ingreso || null,
    localizacion: apiData.localizacion || null,

    // CARGA_OFICIOS specific fields (REG-01 GAP-06)
    // Backend uses tipo_medida_evaluado, map to frontend's tipo_medida_evaluado
    tipo_oficio: apiData.tipo_oficio || null,
    tipo_medida: apiData.tipo_medida_evaluado || null,
    tipo_medida_evaluado: apiData.tipo_medida_evaluado || null,
    numero_expediente: apiData.numero_expediente || null,
    // Backend uses 'autocaratulado', frontend uses 'caratula'
    caratula: apiData.autocaratulado || apiData.caratula || null,
    plazo_dias: apiData.plazo_dias || null,
    fecha_vencimiento_oficio: apiData.fecha_vencimiento_oficio || null,
    // Additional CARGA_OFICIOS fields
    categoria_informacion_judicial: apiData.categoria_informacion_judicial || null,
    departamento_judicial: apiData.departamento_judicial || null,
    nro_oficio_web: apiData.nro_oficio_web || null,
    presuntos_delitos: apiData.presuntos_delitos || null,
    id: apiData.id,
    nombre: apiData.nombre || "",
    tipo_demanda: apiData.tipo_demanda || null,
    nro_notificacion_102: apiData.nro_notificacion_102 || null,
    nro_sac: apiData.nro_sac || null,
    nro_suac: apiData.nro_suac || null,
    nro_historia_clinica: apiData.nro_historia_clinica || null,
    nro_oficio_web: apiData.nro_oficio_web || null,
    autos_caratulados: apiData.autos_caratulados || "",
    descripcion: apiData.descripcion || "",
    presuntaVulneracion: {
      motivos: apiData.presunta_vulneracion?.motivos || null,
    },
    createNewUsuarioExterno: false,

    // codigosDemanda
    codigosDemanda:
      apiData.relacion_demanda?.codigos_demanda?.map((codigo: any) => ({
        codigo: codigo.codigo,
        tipo: codigo.tipo_codigo,
      })) || [],

    // zona & observaciones
    zona: apiData.relacion_demanda?.demanda_zona?.zona || null,
    observaciones: apiData.observaciones || null,

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

        condicionesVulnerabilidad: (nnya.condiciones_vulnerabilidad || []).map((cv: any) => cv.condicion_vulnerabilidad),

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

        condicionesVulnerabilidad: (adulto.condiciones_vulnerabilidad || []).map((cv: any) => cv.condicion_vulnerabilidad),
      })),

    // Adjuntos (attachments)
    adjuntos: apiData.adjuntos || [],

    // Vinculos mapping from API response
    // Vinculos can point to different destino types: medida, legajo, demanda
    vinculos: (apiData.vinculos || []).map((vinculo: any) => ({
      legajo: vinculo.legajo_origen || null,
      medida: vinculo.tipo_destino === "medida" ? vinculo.destino_info?.id : null,
      tipo_vinculo: vinculo.tipo_vinculo?.id || null,
      justificacion: vinculo.justificacion || "",
      // UI helper fields for display
      legajo_info: {
        id: vinculo.legajo_origen,
        numero: vinculo.legajo_origen_numero || "",
        nnya_nombre: vinculo.legajo_origen_numero || "",
        medidas_activas: vinculo.tipo_destino === "medida" && vinculo.destino_info ? [{
          id: vinculo.destino_info.id,
          numero_medida: vinculo.destino_info.numero || "",
          tipo_medida: vinculo.destino_info.tipo_medida || "",
          estado_vigencia: "VIGENTE",
        }] : [],
      },
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
