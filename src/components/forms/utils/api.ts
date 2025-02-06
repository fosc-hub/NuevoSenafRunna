import type { DropdownData, FormData } from "../types/formTypes"
import { create, get } from "@/app/api/apiService"

export const fetchDropdownData = async (): Promise<DropdownData> => {
  try {
    const response = await get<DropdownData>("registro-caso-form-dropdowns/")
    console.log("Fetched dropdown data:", response)
    return response
  } catch (error) {
    console.error("Error al obtener los datos del formulario:", error)
    throw error
  }
}

export const submitFormData = async (formData: FormData): Promise<any> => {
  console.log("Original form data:", JSON.stringify(formData, null, 2))
  try {
    // Transform the data to match the expected server format
    const transformedData = {
      ...formData,
      adultos: formData.adultosConvivientes.map((adulto) => ({
        persona: {
          nombre: adulto.nombre,
          apellido: adulto.apellido,
          fecha_nacimiento: adulto.fechaNacimiento,
          edad_aproximada: adulto.edadAproximada,
          dni: adulto.dni,
          situacion_dni: adulto.situacionDni,
          genero: adulto.genero,
          observaciones: adulto.observaciones,
          adulto: true,
          nnya: false,
        },
        demanda_persona: {
          conviviente: adulto.conviviente,
          supuesto_autordv: adulto.supuesto_autordv,
          garantiza_proteccion: adulto.garantiza_proteccion,
          supuesto_autordv_principal: true, // REVISAR ESTO
          nnya_principal: false,
        },
        localizacion: adulto.useDefaultLocalizacion ? null : adulto.localizacion,
        use_demanda_localizacion: adulto.useDefaultLocalizacion,
        vinculo_nnya_principal: {
          vinculo: adulto.vinculacion.vinculo,
          conviven: adulto.conviviente,
          autordv: true, //REVISAR ESTO
          garantiza_proteccion: adulto.garantiza_proteccion,
        },
        condiciones_vulnerabilidad: adulto.condicionesVulnerabilidad,
      })),
      nnya_principal: formData.ninosAdolescentes[0]
        ? {
            persona: {
              nombre: formData.ninosAdolescentes[0].nombre,
              apellido: formData.ninosAdolescentes[0].apellido,
              fecha_nacimiento: formData.ninosAdolescentes[0].fechaNacimiento,
              edad_aproximada: formData.ninosAdolescentes[0].edadAproximada,
              dni: formData.ninosAdolescentes[0].dni,
              situacion_dni: formData.ninosAdolescentes[0].situacionDni,
              genero: formData.ninosAdolescentes[0].genero,
              observaciones: formData.ninosAdolescentes[0].observaciones,
              adulto: false,
              nnya: true,
            },
            demanda_persona: {
              conviviente: true, // Assuming NNYA principal is always conviviente
              supuesto_autordv: "NO_CORRESPONDE",
              garantiza_proteccion: false,
              supuesto_autordv_principal: false,
              nnya_principal: true,
            },
            localizacion: formData.ninosAdolescentes[0].useDefaultLocalizacion
              ? null
              : formData.ninosAdolescentes[0].localizacion,
            use_demanda_localizacion: formData.ninosAdolescentes[0].useDefaultLocalizacion,
            condiciones_vulnerabilidad:
              formData.ninosAdolescentes[0].condicionesVulnerabilidad.condicion_vulnerabilidad,
            nnya_educacion: formData.ninosAdolescentes[0].educacion,
            nnya_salud: formData.ninosAdolescentes[0].salud,
            vulneraciones: formData.ninosAdolescentes[0].vulneraciones.map((vulneracion, index) => ({
              ...vulneracion,
              autordv_index: 0, // Assuming the first adult is the autordv for all vulneraciones
            })),
          }
        : null,
      nnyas_secundarios: formData.ninosAdolescentes.slice(1).map((nnya) => ({
        persona: {
          nombre: nnya.nombre,
          apellido: nnya.apellido,
          fecha_nacimiento: nnya.fechaNacimiento,
          edad_aproximada: nnya.edadAproximada,
          dni: nnya.dni,
          situacion_dni: nnya.situacionDni,
          genero: nnya.genero,
          observaciones: nnya.observaciones,
          adulto: false,
          nnya: true,
        },
        demanda_persona: {
          conviviente: true, // Assuming all NNYAs are conviviente
          supuesto_autordv: "NO_CORRESPONDE",
          garantiza_proteccion: false,
          supuesto_autordv_principal: false,
          nnya_principal: false,
        },
        localizacion: nnya.useDefaultLocalizacion ? null : nnya.localizacion,
        use_demanda_localizacion: nnya.useDefaultLocalizacion,
        condiciones_vulnerabilidad: nnya.condicionesVulnerabilidad.condicion_vulnerabilidad,
        nnya_educacion: nnya.educacion,
        nnya_salud: nnya.salud,
        vulneraciones: nnya.vulneraciones.map((vulneracion, index) => ({
          ...vulneracion,
          autordv_index: 0, // Assuming the first adult is the autordv for all vulneraciones
        })),
      })),
    }

    delete transformedData.adultosConvivientes
    delete transformedData.ninosAdolescentes

    console.log("Transformed data:", JSON.stringify(transformedData, null, 2))

    const response = await create("registro-caso-form", transformedData)
    console.log("Server response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error al enviar los datos del formulario:", error)
    if (error.response) {
      console.error("Server error response:", error.response.data)
    }
    throw error
  }
}

export const fetchCaseData = async (id: string): Promise<FormData> => {
  try {
    const response = await get<FormData>(`registro-caso-form/${id}/`)
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
    origen: apiData.origen || null,
    sub_origen: apiData.sub_origen || null,
    institucion: apiData.institucion || "",
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
  vinculacion: { vinculo: adulto.vinculo_nnya_principal?.vinculo || "" },
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

