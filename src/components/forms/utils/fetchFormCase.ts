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

