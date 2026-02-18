/**
 * Type definitions for the CARGA_OFICIOS judicial document form
 *
 * This form handles judicial documents (oficios) that require specialized
 * processing with fields for categorization, judicial organs, and case details.
 */

// =============================================================================
// Form Variant Types
// =============================================================================

/** Possible form variants based on objetivo_de_demanda selection */
export type FormVariant = 'STANDARD' | 'CARGA_OFICIOS'

/** Possible objetivo de demanda values */
export type ObjetivoDemanda = 'PROTECCION' | 'PETICION_DE_INFORME' | 'CARGA_OFICIOS'

// =============================================================================
// Circuito (Circuit) Types
// =============================================================================

/** Circuit type for medida classification - MPI, MPE, or MPJ */
export type CircuitoType = 'MPI' | 'MPE' | 'MPJ'

export interface CircuitoOption {
  key: CircuitoType
  label: string
  description: string
}

export const CIRCUITO_OPTIONS: CircuitoOption[] = [
  {
    key: 'MPI',
    label: 'MPI',
    description: 'Medida de Protección Integral',
  },
  {
    key: 'MPE',
    label: 'MPE',
    description: 'Medida de Protección Excepcional',
  },
  {
    key: 'MPJ',
    label: 'MPJ',
    description: 'Medida Penal Juvenil',
  },
]

// =============================================================================
// Categoria/Tipo Information Types
// =============================================================================

/** Categoria de información judicial from API */
export interface CategoriaInformacionJudicial {
  id: number
  nombre: string
  descripcion?: string
  esta_activo: boolean
  orden?: number
}

/** Tipo de información judicial from API - filtered by categoria */
export interface TipoInformacionJudicial {
  id: number
  nombre: string
  descripcion?: string
  categoria: number // FK to CategoriaInformacionJudicial
  esta_activo: boolean
  orden?: number
}

// =============================================================================
// Órgano Judicial Types (Placeholders - Backend Gap)
// =============================================================================

/** Tipo de órgano judicial - placeholder until backend implements */
export interface TipoOrganoJudicial {
  id: number
  nombre: string
  descripcion?: string
}

/** Departamento judicial - placeholder until backend implements */
export interface DepartamentoJudicial {
  id: number
  nombre: string
  circunscripcion?: string
}

/** Órgano judicial - placeholder until backend implements */
export interface OrganoJudicial {
  id: number
  nombre: string
  tipo_organo?: number
  departamento?: number
}

/** Delito for multi-select - placeholder until backend implements */
export interface Delito {
  id: number
  nombre: string
  codigo?: string
}

// =============================================================================
// Form Data Types
// =============================================================================

/** CARGA_OFICIOS specific form data */
export interface CargaOficiosFormData {
  // Objetivo selection (already selected by reaching this form)
  objetivo_de_demanda: 'CARGA_OFICIOS'

  // === Clasificación Section ===
  tipo_medida_evaluado: CircuitoType | null
  fecha_oficio_documento: string | null // YYYY-MM-DD format
  categoria_informacion_judicial: number | null
  tipo_informacion_judicial: number | null

  // === Órgano Judicial Section (Placeholders) ===
  tipo_organo_judicial?: number | null // Backend gap - placeholder
  departamento_judicial?: number | null // Backend gap - placeholder
  organo_judicial?: number | null // Backend gap - placeholder
  delitos?: number[] // Backend gap - placeholder (multi-select)

  // === Expediente Section ===
  numero_expediente: string // SAC number
  caratula: string // Autos caratulados
  plazo_dias: number | null
  descripcion: string

  // === Adjuntos Section ===
  adjuntos: Array<File | { archivo: string; id?: number; nombre?: string }>
  nro_oficio_web?: string // Backend gap - placeholder
  sticker_suac?: string // Backend gap - placeholder

  // === Standard demanda fields needed for submission ===
  fecha_ingreso_senaf?: string | null
  localizacion?: {
    calle: string
    localidad: string
    tipo_calle?: string
    casa_nro?: string
    piso_depto?: string
    lote?: string
    mza?: string
    referencia_geo?: string
    barrio?: string
    cpc?: string
    geolocalizacion?: string
  } | null
  zona?: number | null
  observaciones?: string
}

// =============================================================================
// Dropdown Data Types
// =============================================================================

/** Extended dropdown data including CARGA_OFICIOS specific fields */
export interface CargaOficiosDropdownData {
  // Existing dropdown data
  objetivo_de_demanda_choices: Array<{ key: string; value: string }>
  tipo_medida_choices?: Array<{ key: CircuitoType; value: string }>

  // CARGA_OFICIOS specific
  categoria_informacion_judicial: CategoriaInformacionJudicial[]
  tipo_informacion_judicial: TipoInformacionJudicial[]
  tipo_oficio?: Array<{ id: number; nombre: string }>

  // Placeholders (will be empty until backend implements)
  tipo_organo_judicial?: TipoOrganoJudicial[]
  departamento_judicial?: DepartamentoJudicial[]
  organo_judicial?: OrganoJudicial[]
  delitos?: Delito[]

  // Standard dropdowns needed
  zonas?: Array<{ id: number; nombre: string }>
  localidad?: Array<{ id: number; nombre: string }>
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface CircuitoSelectorProps {
  value: CircuitoType | null
  onChange: (value: CircuitoType) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
}

export interface CategoriaInfoSectionProps {
  categorias: CategoriaInformacionJudicial[]
  tipos: TipoInformacionJudicial[]
  selectedCategoria: number | null
  selectedTipo: number | null
  onCategoriaChange: (categoriaId: number | null) => void
  onTipoChange: (tipoId: number | null) => void
  readOnly?: boolean
  errors?: {
    categoria?: string
    tipo?: string
  }
}

export interface PlaceholderFieldProps {
  label: string
  tooltip?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
}

export interface OrganoJudicialSectionProps {
  readOnly?: boolean
}

export interface ExpedienteSectionProps {
  readOnly?: boolean
  errors?: {
    numero_expediente?: string
    caratula?: string
    plazo_dias?: string
    descripcion?: string
  }
}

export interface AdjuntosSectionProps {
  files: Array<File | { archivo: string; id?: number; nombre?: string }>
  onFilesChange: (files: Array<File | { archivo: string }>) => void
  onFileUpload?: (file: File) => Promise<void>
  onFileDelete?: (fileId: number | string) => Promise<void>
  readOnly?: boolean
  isUploading?: boolean
}

export interface CargaOficiosFormProps {
  dropdownData: CargaOficiosDropdownData
  readOnly?: boolean
  onSubmit?: (data: CargaOficiosFormData) => void
}

// =============================================================================
// Validation Schema Types
// =============================================================================

export interface CargaOficiosValidationErrors {
  tipo_medida_evaluado?: string
  fecha_oficio_documento?: string
  categoria_informacion_judicial?: string
  tipo_informacion_judicial?: string
  numero_expediente?: string
  caratula?: string
  plazo_dias?: string
  descripcion?: string
}

// =============================================================================
// API Response Types
// =============================================================================

/** API response for CARGA_OFICIOS form submission */
export interface CargaOficiosSubmitResponse {
  id: number
  numero_demanda?: string
  estado_demanda: string
  created_at: string
}
