import { get } from "@/app/api/apiService"

interface DropdownOption {
    key: string
    value: string
  }
  
  interface DropdownData {
    estado_demanda_choices: DropdownOption[]
    ambito_vulneracion_choices: DropdownOption[]
    tipo_calle_choices: DropdownOption[]
    situacion_dni_choices: DropdownOption[]
    genero_choices: DropdownOption[]
    origenes: { id: number; nombre: string }[]
    subOrigenes: { id: number; nombre: string; origen: number }[]
    motivosIntervencion: { id: number; nombre: string }[]
    informantes: { id: number; nombre: string; apellido: string }[]
  }

  const fetchDropdowns = async () => {
    try {
      const response = await get<DropdownData>(`registro-caso-form-dropdowns/`)
      console.log("Fetched dropdown data:", response)
      return response
    } catch (error) {
      console.error("Error al obtener los datos del formulario:", error)
      throw error
    }
  }
  