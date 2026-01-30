import type { DropdownData } from "../types/formTypes"
import { get } from "@/app/api/apiService"

const normalizeTiposVinculo = (data: unknown): DropdownData["tipos_vinculo"] => {
  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === "object") {
    const potentialKeys = ["results", "data", "items"]
    for (const key of potentialKeys) {
      const value = (data as Record<string, unknown>)[key]
      if (Array.isArray(value)) {
        return value as DropdownData["tipos_vinculo"]
      }
    }
  }

  return [] as DropdownData["tipos_vinculo"]
}

export const fetchDropdownData = async (): Promise<DropdownData> => {
    try {
      const response = await get<DropdownData>("registro-demanda-form-dropdowns/")
      console.log("Fetched dropdown data:", response)

      // REG-01: Load tipos de vínculo for vinculation during registration
      let tiposVinculo: DropdownData["tipos_vinculo"] = []
      try {
        const tiposVinculoResponse = await get<unknown>("tipos-vinculo/")
        tiposVinculo = normalizeTiposVinculo(tiposVinculoResponse)
        console.log("Fetched tipos de vínculo:", tiposVinculoResponse)

        if (!Array.isArray(tiposVinculoResponse)) {
          console.warn("Tipos de vínculo response was not an array. Normalized payload:", tiposVinculo)
        }
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

