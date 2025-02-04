import axios from "axios"
import type { DropdownData } from "../types/formTypes"
import { get, create } from "@/app/api/apiService"


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

export const submitFormData = async (formData: any): Promise<any> => {
  try {
    const response = await create("registro-caso-form", formData)
    return response.data
  } catch (error) {
    console.error("Error al enviar los datos del formulario:", error)
    throw error
  }
}

