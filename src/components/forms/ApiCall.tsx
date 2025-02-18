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

