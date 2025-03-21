import type { DropdownData, FormData } from "../types/formTypes"
import { create, get, update } from "@/app/api/apiService"

// Track if a submission is in progress to prevent duplicates
let isSubmissionInProgress = false

/**
 * Fetch dropdown data for the form
 */


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
      objetivo_de_demanda: formData.objetivo_de_demanda,
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
          comentarios: formData.observaciones || null,
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
                  nombre: nnya.educacion.institucion_educativa?.nombre || null,
                },
                nivel_alcanzado: nnya.educacion.nivel_alcanzado || null,
                esta_escolarizado: nnya.educacion.esta_escolarizado || false,
                ultimo_cursado: nnya.educacion.ultimo_cursado || null,
                tipo_escuela: nnya.educacion.tipo_escuela || null,
                comentarios_educativos: nnya.educacion.comentarios_educativos || null,
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
            : null,

          persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
            ...(enfermedad.id ? { id: enfermedad.id } : {}),
            situacion_salud: enfermedad.situacion_salud,
            enfermedad: {
              ...(enfermedad.enfermedad?.id ? { id: enfermedad.enfermedad.id } : {}),
              nombre: enfermedad.enfermedad?.nombre || null,
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
          })),

          demanda_persona: {
            ...(nnya.demandaPersonaId ? { id: nnya.demandaPersonaId } : {}),
            deleted: false,
            conviviente: nnya.demanda_persona?.conviviente || false,
            vinculo_demanda: nnya.demanda_persona?.vinculo_demanda || null,
            vinculo_con_nnya_principal: nnya.demanda_persona?.vinculo_con_nnya_principal || null,
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
            nombre: nnya.nombre || null,
            nombre_autopercibido: null,
            apellido: nnya.apellido || null,
            fecha_nacimiento: nnya.fechaNacimiento || null,
            edad_aproximada: nnya.edadAproximada || null,
            nacionalidad: nnya.nacionalidad || null,
            dni: nnya.dni || null,
            situacion_dni: nnya.situacionDni || null,
            genero: nnya.genero || null,
            observaciones: nnya.observaciones || null,
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
            vinculo_demanda: adulto.vinculacion || null,
            vinculo_con_nnya_principal: adulto.vinculo_con_nnya_principal || null,
          },

          use_demanda_localizacion: adulto.useDefaultLocalizacion || false,

          condiciones_vulnerabilidad: (adulto.condicionesVulnerabilidad || []).map((condicion: number) => ({
            si_no: true,
            condicion_vulnerabilidad: condicion,
          })),

          persona: {
            ...(adulto.personaId ? { id: adulto.personaId } : {}),
            deleted: false,
            nombre: adulto.nombre || null,
            nombre_autopercibido: null,
            apellido: adulto.apellido || null,
            fecha_nacimiento: adulto.fechaNacimiento || null,
            edad_aproximada: adulto.edadAproximada || null,
            nacionalidad: adulto.nacionalidad || null,
            dni: adulto.dni || null,
            situacion_dni: adulto.situacionDni || null,
            genero: adulto.genero || null,
            observaciones: adulto.observaciones || null,
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


