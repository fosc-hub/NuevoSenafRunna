import type { DropdownData, FormData } from "../types/formTypes"
import { create, get, update } from "@/app/api/apiService"

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

export const submitFormData = async (formData: FormData, id?: string): Promise<any> => {
  console.log("Original form data:", JSON.stringify(formData, null, 2))
  try {
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
      presuntos_delitos: formData.presuntos_delitos,
      motivo_ingreso: formData.motivo_ingreso,
      submotivo_ingreso: formData.submotivo_ingreso,
      localizacion: formData.localizacion,
      relacion_demanda: {
        codigos_demanda: formData.codigosDemanda.map((codigo) => ({
          codigo: codigo.codigo,
          tipo_codigo: codigo.tipo,
        })),
        demanda_zona: {
          zona: formData.zona,
          fecha_recibido: new Date().toISOString(),
          esta_activo: true,
          recibido: false,
          comentarios: formData.observaciones || "",
        },
      },
      personas: [
        ...formData.ninosAdolescentes.map((nnya: any, index: number) => ({
          localizacion: nnya.useDefaultLocalizacion ? null : nnya.localizacion,
          educacion: nnya.educacion,
          cobertura_medica: nnya.cobertura_medica,
          persona_enfermedades: nnya.persona_enfermedades.map((enfermedad: any) => ({
            situacion_salud: enfermedad.situacion_salud,
            enfermedad: {
              id: enfermedad.enfermedad.id,
              nombre: enfermedad.enfermedad.nombre,
              situacion_salud_categoria: enfermedad.situacion_salud,
              institucion_sanitaria_interviniente: {
                id: enfermedad.institucion_sanitaria_interviniente.id,
                nombre: enfermedad.institucion_sanitaria_interviniente.nombre,
              },
            },
            certificacion: enfermedad.certificacion,
            beneficios_gestionados: enfermedad.beneficios_gestionados,
            recibe_tratamiento: enfermedad.recibe_tratamiento,
            informacion_tratamiento: enfermedad.informacion_tratamiento,
            medico_tratamiento: enfermedad.medico_tratamiento,
          })),
          demanda_persona: {
            deleted: false,
            conviviente: nnya.demanda_persona.conviviente,
            vinculo_demanda: nnya.demanda_persona.vinculo_demanda,
            vinculo_con_nnya_principal: index === 0 ? null : nnya.demanda_persona.vinculo_con_nnya_principal,
          },
          use_demanda_localizacion: nnya.useDefaultLocalizacion,
          condiciones_vulnerabilidad: nnya.condicionesVulnerabilidad.condicion_vulnerabilidad.map(
            (condicion: number) => ({
              si_no: true,
              condicion_vulnerabilidad: condicion,
            }),
          ),
          persona: {
            deleted: false,
            nombre: nnya.nombre,
            nombre_autopercibido: "",
            apellido: nnya.apellido,
            fecha_nacimiento: nnya.fechaNacimiento,
            edad_aproximada: nnya.edadAproximada,
            nacionalidad: nnya.nacionalidad,
            dni: nnya.dni,
            situacion_dni: nnya.situacionDni,
            genero: nnya.genero,
            observaciones: nnya.observaciones,
            adulto: false,
            nnya: true,
          },
          vulneraciones: nnya.vulneraciones,
        })),
        ...formData.adultosConvivientes.map((adulto: any) => ({
          localizacion: adulto.useDefaultLocalizacion ? null : adulto.localizacion,
          educacion: null,
          cobertura_medica: null,
          persona_enfermedades: [],
          demanda_persona: {
            deleted: false,
            conviviente: adulto.conviviente,
            vinculo_demanda: adulto.vinculacion,
            vinculo_con_nnya_principal: adulto.vinculo_con_nnya_principal,
          },
          use_demanda_localizacion: adulto.useDefaultLocalizacion,
          condiciones_vulnerabilidad: adulto.condicionesVulnerabilidad.map((condicion: number) => ({
            si_no: true,
            condicion_vulnerabilidad: condicion,
          })),
          persona: {
            deleted: false,
            nombre: adulto.nombre,
            nombre_autopercibido: "",
            apellido: adulto.apellido,
            fecha_nacimiento: adulto.fechaNacimiento,
            edad_aproximada: adulto.edadAproximada,
            nacionalidad: adulto.nacionalidad,
            dni: adulto.dni,
            situacion_dni: adulto.situacionDni,
            genero: adulto.genero,
            observaciones: adulto.observaciones,
            adulto: true,
            nnya: false,
          },
          vulneraciones: [],
        })),
      ],
    }

    console.log("Transformed data:", JSON.stringify(transformedData, null, 2))

    let response: any

    if (id) {
      // Use update function for updating existing form (constatacion)
      response = await update(
        "registro-demanda-form",
        Number(id),
        transformedData,
        true,
        "Demanda actualizada con éxito",
      )
    } else {
      // Use create function for creating new form
      response = await create("registro-demanda-form", transformedData, true, "Demanda creada con éxito")
    }

    console.log("Server response:", response)
    return response
  } catch (error: any) {
    console.error("Error al enviar los datos del formulario:", error)
    if (error.response) {
      console.error("Server error response:", error.response.data)
    }
    // Check if the error is due to a 201 status code
    if (error.response && error.response.status === 201) {
      // If it's a 201, treat it as a success
      console.log("Form submitted successfully with status 201")
      return error.response.data
    }
    throw error
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

const transformApiDataToFormData = (apiData: any): FormData => {
  // Transform the API data to match the FormData structure
  return {
    fecha_oficio_documento: apiData.fecha_oficio_documento || null,
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || null,
    bloque_datos_remitente: apiData.bloque_datos_remitente || null,
    tipo_institucion: apiData.institucion.tipo_institucion || null,
    tipo_demanda: apiData.tipo_demanda || null,
    presuntos_delitos: apiData.tipos_presuntos_delitos || [],
    envio_de_respuesta: apiData.envio_de_respuesta || null,
    motivo_ingreso: apiData.motivo_ingreso || null,
    submotivo_ingreso: apiData.submotivo_ingreso || null,
    institucion: apiData.institucion.nombre || "",
    nro_notificacion_102: apiData.nro_notificacion_102 || null,
    nro_sac: apiData.nro_sac || null,
    nro_suac: apiData.nro_suac || null,
    nro_historia_clinica: apiData.nro_historia_clinica || null,
    nro_oficio_web: apiData.nro_oficio_web || null,
    autos_caratulados: apiData.autos_caratulados || "",
    ambito_vulneracion: apiData.ambito_vulneracion || "",
    descripcion: apiData.descripcion || "",
    presuntaVulneracion: {
      motivos: apiData.motivo_ingreso || null,
    },
    localizacion: apiData.localizacion || null,
    createNewUsuarioExterno: false,
    usuarioExterno: apiData.informante || null,
    relacion_demanda: {
      codigos_demanda: apiData.relacion_demanda?.codigos_demanda || [],
      demanda_zona: apiData.relacion_demanda?.demanda_zona || null,
    },
    zona: apiData.relacion_demanda?.demanda_zona?.zona || null,
    adultosConvivientes: (apiData.adultos || []).map(transformAdulto),
    ninosAdolescentes: [
      ...(apiData.nnya_principal ? [transformNNYA(apiData.nnya_principal, true)] : []),
      ...(apiData.nnyas_secundarios || []).map((nnya: any) => transformNNYA(nnya, false)),
    ],
  }
}

const transformAdulto = (adulto: any) => ({
  nombre: adulto.persona?.nombre || "",
  apellido: adulto.persona?.apellido || "",
  fechaNacimiento: adulto.persona?.fecha_nacimiento || null,
  edadAproximada: adulto.persona?.edad_aproximada || "",
  dni: adulto.persona?.dni || "",
  situacionDni: adulto.persona?.situacion_dni || "",
  genero: adulto.persona?.genero || "",
  conviviente: adulto.demanda_persona?.conviviente || false,
  supuesto_autordv: adulto.demanda_persona?.supuesto_autordv || "",
  garantiza_proteccion: adulto.vinculo_nnya_principal?.garantiza_proteccion || false,
  observaciones: adulto.persona?.observaciones || "",
  useDefaultLocalizacion: adulto.use_demanda_localizacion || false,
  localizacion: adulto.localizacion || null,
  vinculo_con_nnya_principal: adulto.demanda_persona?.vinculo_con_nnya_principal || null,
  condicionesVulnerabilidad: adulto.condiciones_vulnerabilidad || [],
})

const transformNNYA = (nnya: any, isPrincipal: boolean) => ({
  nombre: nnya.persona?.nombre || "",
  apellido: nnya.persona?.apellido || "",
  fechaNacimiento: nnya.persona?.fecha_nacimiento || null,
  edadAproximada: nnya.persona?.edad_aproximada || "",
  dni: nnya.persona?.dni || "",
  situacionDni: nnya.persona?.situacion_dni || "",
  genero: nnya.persona?.genero || "",
  observaciones: nnya.persona?.observaciones || "",
  useDefaultLocalizacion: nnya.use_demanda_localizacion || false,
  localizacion: nnya.localizacion || null,
  educacion: nnya.nnya_educacion || null,
  salud: nnya.nnya_salud || null,
  vulneraciones: nnya.vulneraciones || [],
  condicionesVulnerabilidad: { condicion_vulnerabilidad: nnya.condiciones_vulnerabilidad || [] },
  vinculacion: isPrincipal ? undefined : { vinculo: nnya.vinculo_nnya_principal?.vinculo || "" },
})

