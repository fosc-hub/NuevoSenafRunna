export interface DropdownOption {
    key: string
    value: string
  }
  
  export interface DropdownData {
    situacion_dni_choices: DropdownOption[]
    genero_choices: DropdownOption[]
    vinculos: { id: string; nombre: string }[]
    condiciones_vulnerabilidad: { id: string; nombre: string; descripcion: string; adulto: boolean }[]
    origenes: { id: string; nombre: string }[]
    // Add other dropdown fields as needed
  }
  
  