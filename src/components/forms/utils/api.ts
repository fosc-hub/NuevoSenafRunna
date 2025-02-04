import { get } from "@/app/api/apiService";
import axios from "axios"


export type DropdownData = {
  barrios: any;
  localidades: any;
  cpcs: any;
  estado_demanda_choices: Array<{ key: string; value: string }>
  ambito_vulneracion_choices: Array<{ key: string; value: string }>
  tipo_calle_choices: Array<{ key: string; value: string }>
  situacion_dni_choices: Array<{ key: string; value: string }>
  genero_choices: Array<{ key: string; value: string }>
  // Add other dropdown fields as needed
}

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

