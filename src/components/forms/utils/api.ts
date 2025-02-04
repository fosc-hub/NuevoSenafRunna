import axios from "axios"
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

