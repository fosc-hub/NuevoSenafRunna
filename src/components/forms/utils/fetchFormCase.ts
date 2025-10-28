import type { DropdownData, FormData } from "../types/formTypes"
import { create, get, update } from "@/app/api/apiService"

export const fetchDropdownData = async (): Promise<DropdownData> => {
    try {
      const response = await get<DropdownData>("registro-demanda-form-dropdowns/")
      console.log("Fetched dropdown data:", response)

      // REG-01: Load tipos de vínculo for vinculation during registration
      let tiposVinculo: any[] = []
      try {
        tiposVinculo = await get<any[]>("tipos-vinculo/")
        console.log("Fetched tipos de vínculo:", tiposVinculo)
      } catch (vinculoError) {
        console.warn("Could not fetch tipos_vinculo, continuing without them:", vinculoError)
      }

      return {
        ...response,
        tipos_vinculo: tiposVinculo || [],
      }
    } catch (error: any) {
      console.error("Error al obtener los datos del formulario:", error)
      throw error
    }
  }

