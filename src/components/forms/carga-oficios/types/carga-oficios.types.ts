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
// Dropdown Option Types
// =============================================================================

/** Bloque datos remitente - Tipo de Organismo */
export interface BloqueDatosRemitente {
  id: number
  nombre: string
}

/** Tipo institucion demanda - Organismo */
export interface TipoInstitucionDemanda {
  id: number
  nombre: string
  bloque_datos_remitente: number
}

/** Departamento judicial choices */
export interface DepartamentoJudicialChoice {
  key: string // CAPITAL | INTERIOR
  value: string
}

// =============================================================================
// Form Data Types
// =============================================================================

/** Vinculo form data for linking to legajos/medidas */
export interface VinculoFormData {
  legajo: number | null
  medida: number | null
  tipo_vinculo: number | null
  justificacion: string
  legajo_info?: {
    id: number
    numero: string
    nnya_nombre: string
    medidas_activas: Array<{
      id: number
      numero_medida: string
      tipo_medida: string
      estado_vigencia: string
    }>
  }
}

/** CARGA_OFICIOS specific form data */
export interface CargaOficiosFormData {
  // Objetivo selection (already selected by reaching this form)
  objetivo_de_demanda: 'CARGA_OFICIOS'

  // === Clasificación Section ===
  tipo_medida_evaluado: CircuitoType | null
  fecha_oficio_documento: string | null // YYYY-MM-DD format
  fecha_ingreso_senaf: string | null // YYYY-MM-DD format - Fecha que llega a SENAF (OBLIGATORIO)
  categoria_informacion_judicial: number | null
  tipo_informacion_judicial: number | null
  tipo_oficio: number | null // FK to TTipoOficio - Required for activity creation

  // === Origen del Oficio Section ===
  bloque_datos_remitente: number | null // Tipo de Organismo (OBLIGATORIO)
  institucion: number | null // Organismo - filtered by bloque_datos_remitente (OBLIGATORIO)
  departamento_judicial: string | null // CAPITAL | INTERIOR

  // === Expediente Section ===
  numero_expediente?: string // SAC number (opcional)
  nro_oficio_web?: string // Número de oficio web (opcional)
  caratula: string // Autos caratulados (OBLIGATORIO)
  plazo_dias: number | null
  descripcion: string // (OBLIGATORIO)
  presuntos_delitos: string // Tags separados por coma (OBLIGATORIO)

  // === Localización Section ===
  localizacion: {
    calle: string
    localidad: number | string | null
    tipo_calle?: string
    casa_nro?: string
    piso_depto?: string
    lote?: string
    mza?: string
    referencia_geo?: string
    barrio?: number | string | null
    cpc?: number | string | null
    geolocalizacion?: string
  } | null

  // === Vínculos Section ===
  vinculos: VinculoFormData[]

  // === Adjuntos Section ===
  adjuntos: Array<File | { archivo: string; id?: number; nombre?: string }>

  // === Standard demanda fields needed for submission ===
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
  tipo_oficio?: Array<{ id: number; nombre: string; descripcion?: string; activo?: boolean; orden?: number }>

  // Origen del Oficio dropdowns
  bloques_datos_remitente: Array<{ id: number; nombre: string }> // Tipo de Organismo
  tipo_institucion_demanda: Array<{ id: number; nombre: string; bloque_datos_remitente: number }> // Organismo
  departamento_judicial_choices: Array<{ key: string; value: string }> // CAPITAL | INTERIOR

  // Vínculos dropdown
  tipos_vinculo?: Array<{
    id: number
    codigo: string
    nombre: string
    descripcion: string
    activo: boolean
  }>

  // Standard dropdowns needed for localización
  zonas?: Array<{ id: number; nombre: string }>
  localidad?: Array<{ id: number; nombre: string }>
  barrio?: Array<{ id: number; nombre: string; localidad?: number }>
  cpc?: Array<{ id: number; nombre: string; localidad?: number }>
  tipo_calle_choices?: Array<{ key: string; value: string }>
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
  bloquesRemitente: Array<{ id: number; nombre: string }>
  tipoInstitucionDemanda: Array<{ id: number; nombre: string; bloque_datos_remitente: number }>
  departamentoJudicialChoices: Array<{ key: string; value: string }>
  readOnly?: boolean
}

export interface ExpedienteSectionProps {
  readOnly?: boolean
  errors?: {
    numero_expediente?: string
    nro_oficio_web?: string
    caratula?: string
    plazo_dias?: string
    descripcion?: string
    presuntos_delitos?: string
  }
}

export interface LocalizacionOficioSectionProps {
  dropdownData: {
    localidad?: Array<{ id: number; nombre: string }>
    barrio?: Array<{ id: number; nombre: string; localidad?: number }>
    cpc?: Array<{ id: number; nombre: string; localidad?: number }>
    tipo_calle_choices?: Array<{ key: string; value: string }>
  }
  readOnly?: boolean
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
  fecha_ingreso_senaf?: string
  categoria_informacion_judicial?: string
  tipo_informacion_judicial?: string
  bloque_datos_remitente?: string
  institucion?: string
  departamento_judicial?: string
  numero_expediente?: string
  caratula?: string
  plazo_dias?: string
  descripcion?: string
  presuntos_delitos?: string
  localizacion?: string
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
