import type { DropdownData, FormData } from "../types/formTypes"
import { create, get, update } from "@/app/api/apiService"

// Track if a submission is in progress to prevent duplicates
let isSubmissionInProgress = false

/**
 * Fetch dropdown data for the form
 */
export const fetchDropdownData = async (): Promise<DropdownData> => {
  try {
    const response = await get<DropdownData>("registro-demanda-form-dropdowns/")
    console.log("Fetched dropdown data:", response)
    return response
  } catch (error: any) {
    console.error("Error al obtener los datos del formulario:", error)
    throw error
  }
}

/**
 * Create or update the Demanda (form data)
 */
export const submitFormData = async (formData: FormData, id?: string): Promise<any> => {
  console.log("Original form data:", JSON.stringify(formData, null, 2))

  // Prevent duplicate submissions
  if (isSubmissionInProgress) {
    console.log("Submission already in progress, preventing duplicate")
    return Promise.reject(new Error("Submission already in progress"))
  }

  isSubmissionInProgress = true

  try {
    // Build the data structure we want to send
    const transformedData = {
      fecha_oficio_documento: formData.fecha_oficio_documento,
      fecha_ingreso_senaf: formData.fecha_ingreso_senaf,
      bloque_datos_remitente: formData.bloque_datos_remitente,
      tipo_institucion: formData.tipo_institucion,
      institucion: {
        nombre: formData.institucion,
        tipo_institucion: formData.tipo_institucion,
      },
      ambito_vulneracion: formData.ambito_vulneracion,
      tipo_demanda: formData.tipo_demanda,
      tipos_presuntos_delitos: formData.tipos_presuntos_delitos || null,
      motivo_ingreso: formData.motivo_ingreso,
      submotivo_ingreso: formData.submotivo_ingreso,
      envio_de_respuesta: formData.envio_de_respuesta,
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
          comentarios: formData.observaciones || "",
        },
      },

      personas: [
        // Niños/niñas/adolescentes
        ...(formData.ninosAdolescentes || []).map((nnya: any, nnyaIndex: number) => ({
          persona_id: nnya.personaId, // Add this line to pass the persona_id
          localizacion: nnya.useDefaultLocalizacion ? null : nnya.localizacion,
          educacion: nnya.educacion
            ? {
                ...(nnya.educacion.id ? { id: nnya.educacion.id } : {}),
                institucion_educativa: {
                  ...(nnya.educacion.institucion_educativa?.id ? { id: nnya.educacion.institucion_educativa.id } : {}),
                  nombre: nnya.educacion.institucion_educativa?.nombre || "",
                },
                nivel_alcanzado: nnya.educacion.nivel_alcanzado || "",
                esta_escolarizado: nnya.educacion.esta_escolarizado || false,
                ultimo_cursado: nnya.educacion.ultimo_cursado || "",
                tipo_escuela: nnya.educacion.tipo_escuela || "",
                comentarios_educativos: nnya.educacion.comentarios_educativos || "",
                deleted: false,
              }
            : null,

          cobertura_medica: nnya.cobertura_medica
            ? {
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
                          : nnya.cobertura_medica.institucion_sanitaria_nombre || "",
                    }
                  : null,
                obra_social: nnya.cobertura_medica.obra_social || null,
                intervencion: nnya.cobertura_medica.intervencion || null,
                medico_cabecera: nnya.cobertura_medica.medico_cabecera || null,
                auh: nnya.cobertura_medica.auh || false,
                observaciones: nnya.cobertura_medica.observaciones || "",
                deleted: false,
              }
            : null,

          persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
            ...(enfermedad.id ? { id: enfermedad.id } : {}),
            situacion_salud: enfermedad.situacion_salud,
            enfermedad: {
              ...(enfermedad.enfermedad?.id ? { id: enfermedad.enfermedad.id } : {}),
              nombre: enfermedad.enfermedad?.nombre || "",
              situacion_salud_categoria: enfermedad.situacion_salud,
            },
            institucion_sanitaria_interviniente: enfermedad.institucion_sanitaria_interviniente
              ? {
                  id:
                    typeof enfermedad.institucion_sanitaria_interviniente === "object"
                      ? enfermedad.institucion_sanitaria_interviniente.id
                      : enfermedad.institucion_sanitaria_interviniente,
                  nombre:
                    typeof enfermedad.institucion_sanitaria_interviniente === "object"
                      ? enfermedad.institucion_sanitaria_interviniente.nombre
                      : enfermedad.institucion_sanitaria_interviniente_nombre || "",
                }
              : null,
            medico_tratamiento: enfermedad.medico_tratamiento || {
              nombre: "",
              mail: "",
              telefono: null,
            },
            certificacion: enfermedad.certificacion || "",
            beneficios_gestionados: enfermedad.beneficios_gestionados || "",
            recibe_tratamiento: enfermedad.recibe_tratamiento || false,
            informacion_tratamiento: enfermedad.informacion_tratamiento || "",
            deleted: false,
          })),

          demanda_persona: {
            ...(nnya.demandaPersonaId ? { id: nnya.demandaPersonaId } : {}),
            deleted: false,
            conviviente: nnya.demanda_persona?.conviviente || false,
            vinculo_demanda: nnya.demanda_persona?.vinculo_demanda || "",
            vinculo_con_nnya_principal: nnya.demanda_persona?.vinculo_con_nnya_principal || "",
          },

          use_demanda_localizacion: nnya.useDefaultLocalizacion || false,

          condiciones_vulnerabilidad: ((nnya.condicionesVulnerabilidad || {}).condicion_vulnerabilidad || []).map(
            (condicion: number) => ({
              si_no: true,
              condicion_vulnerabilidad: condicion,
            }),
          ),

          persona: {
            ...(nnya.personaId ? { id: nnya.personaId } : {}),
            deleted: false,
            nombre: nnya.nombre || "",
            nombre_autopercibido: "",
            apellido: nnya.apellido || "",
            fecha_nacimiento: nnya.fechaNacimiento || null,
            edad_aproximada: nnya.edadAproximada || "",
            nacionalidad: nnya.nacionalidad || null,
            dni: nnya.dni || "",
            situacion_dni: nnya.situacionDni || null,
            genero: nnya.genero || null,
            observaciones: nnya.observaciones || "",
            adulto: false,
            nnya: true,
          },
          vulneraciones: (nnya.vulneraciones || []).map((vulneracion: any) => {
            const vulneracionData: any = {
              id: vulneracion.id || 0,
              principal_demanda: vulneracion.principal_demanda || false,
              transcurre_actualidad: vulneracion.transcurre_actualidad || false,
              nnya: nnyaIndex,
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
          }),
        })),

        // Adultos convivientes
        ...(formData.adultosConvivientes || []).map((adulto: any) => ({
          persona_id: adulto.personaId, // Add this line to pass the persona_id
          localizacion: adulto.useDefaultLocalizacion ? null : adulto.localizacion,
          educacion: null,
          cobertura_medica: null,
          persona_enfermedades: [],

          demanda_persona: {
            ...(adulto.demandaPersonaId ? { id: adulto.demandaPersonaId } : {}),
            deleted: false,
            conviviente: adulto.conviviente || false,
            vinculo_demanda: adulto.vinculacion || "",
            vinculo_con_nnya_principal: adulto.vinculo_con_nnya_principal || "",
          },

          use_demanda_localizacion: adulto.useDefaultLocalizacion || false,

          condiciones_vulnerabilidad: (adulto.condicionesVulnerabilidad || []).map((condicion: number) => ({
            si_no: true,
            condicion_vulnerabilidad: condicion,
          })),

          persona: {
            ...(adulto.personaId ? { id: adulto.personaId } : {}),
            deleted: false,
            nombre: adulto.nombre || "",
            nombre_autopercibido: "",
            apellido: adulto.apellido || "",
            fecha_nacimiento: adulto.fechaNacimiento || null,
            edad_aproximada: adulto.edadAproximada || "",
            nacionalidad: adulto.nacionalidad || null,
            dni: adulto.dni || "",
            situacion_dni: adulto.situacionDni || null,
            genero: adulto.genero || null,
            observaciones: adulto.observaciones || "",
            adulto: true,
            nnya: false,
          },
          vulneraciones: [],
        })),
      ],
    }

    console.log("Transformed data:", JSON.stringify(transformedData, null, 2))

    // Decide whether to PATCH (update) or POST (create)
    let response: any

    if (id) {
      // PATCH (update) existing Demanda
      response = await update(
        "registro-demanda-form",
        Number(id),
        transformedData,
        true,
        "Demanda actualizada con éxito",
      )
    } else {
      // POST (create) new Demanda
      response = await create("registro-demanda-form", transformedData, true, "Demanda creada con éxito")
    }

    console.log("Server response:", response)
    isSubmissionInProgress = false
    return response
  } catch (error: any) {
    console.error("Error al enviar los datos del formulario:", error)
    if (error.response) {
      console.error("Server error response:", error.response.data)
    }
    // If the server responds with 201, treat it as a success
    if (error.response && error.response.status === 201) {
      console.log("Form submitted successfully with status 201")
      isSubmissionInProgress = false
      return error.response.data
    }
    isSubmissionInProgress = false
    throw error
  }
}

/**
 * Fetch data for a specific case/demanda by ID,
 * then transform it to our front-end FormData structure.
 */
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

/**
 * Transform the API's data shape into our FormData shape,
 * including personaId and demandaPersonaId if they exist.
 */
const transformApiDataToFormData = (apiData: any): FormData => {
  return {
    fecha_oficio_documento: apiData.fecha_oficio_documento || null,
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || null,
    bloque_datos_remitente: apiData.bloque_datos_remitente || null,
    tipo_institucion: apiData.tipo_institucion || null,
    institucion: apiData.institucion?.nombre || "",
    ambito_vulneracion: apiData.ambito_vulneracion || null,
    tipo_demanda: apiData.tipo_demanda || null,
    // Ensure presuntos_delitos is properly initialized as an array
    tipos_presuntos_delitos: apiData.tipos_presuntos_delitos || [],
    envio_de_respuesta: apiData.envio_de_respuesta || null,
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
    observaciones: apiData.relacion_demanda?.demanda_zona?.comentarios || "",

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
              institucion_sanitaria: nnya.cobertura_medica?.institucion_sanitaria?.id || null,
              institucion_sanitaria_nombre: nnya.cobertura_medica?.institucion_sanitaria?.nombre || "",
              obra_social: nnya.cobertura_medica.obra_social || null,
              intervencion: nnya.cobertura_medica.intervencion || null,
              medico_cabecera: nnya.cobertura_medica.medico_cabecera || null,
              auh: nnya.cobertura_medica.auh || false,
              observaciones: nnya.cobertura_medica.observaciones || "",
              deleted: nnya.cobertura_medica.deleted || false,
            }
          : null,

        persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
          id: enfermedad.id,
          ...enfermedad,
          enfermedad: enfermedad.enfermedad || null,
          institucion_sanitaria_interviniente: enfermedad.institucion_sanitaria_interviniente?.id || null,
          institucion_sanitaria_interviniente_nombre: enfermedad.institucion_sanitaria_interviniente?.nombre || "",
          medico_tratamiento: enfermedad.medico_tratamiento || null,
          recibe_tratamiento: enfermedad.recibe_tratamiento || false,
          informacion_tratamiento: enfermedad.informacion_tratamiento || "",
          deleted: enfermedad.deleted || false,
        })),

        demanda_persona: {
          id: nnya.demanda_persona.id,
          conviviente: nnya.demanda_persona.conviviente,
          vinculo_demanda: nnya.demanda_persona.vinculo_demanda,
          vinculo_con_nnya_principal: index === 0 ? null : nnya.demanda_persona.vinculo_con_nnya_principal,
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

