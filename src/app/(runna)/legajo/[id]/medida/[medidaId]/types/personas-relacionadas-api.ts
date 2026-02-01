/**
 * TypeScript interfaces for Personas Relacionadas (TPersonaVinculo) API
 *
 * Based on API documentation: claudedocs/API_PERSONAS_RELACIONADAS_FRONTEND.md
 *
 * This implements the permanent family relationship system (TPersonaVinculo)
 * that complements the existing demand-context relationships (TDemandaPersona).
 *
 * Key differences from TDemandaPersona:
 * - Context: Permanent for NNyA (legajo) vs linked to specific demanda
 * - Editing: From legajo (PATCH /api/legajos/{id}/nnya/) vs demanda registration
 * - Traceability: Complete (activo, desvinculado_por, desvinculado_en, justificacion_desvincular)
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum character length for desvincular justification
 * Matches backend validation: minLength: 20
 */
export const MIN_CARACTERES_JUSTIFICACION_DESVINCULAR = 20

/**
 * Occupation options for personas relacionadas
 */
export const OCUPACION_OPTIONS = [
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'TRABAJADOR', label: 'Trabajador' },
  { value: 'DESEMPLEADO', label: 'Desempleado' },
  { value: 'JUBILADO', label: 'Jubilado' },
  { value: 'PENSIONADO', label: 'Pensionado' },
  { value: 'AMA_DE_CASA', label: 'Ama de casa' },
  { value: 'TRABAJADOR_INFORMAL', label: 'Trabajador informal' },
  { value: 'OTRO', label: 'Otro' },
] as const

export type Ocupacion =
  | 'ESTUDIANTE'
  | 'TRABAJADOR'
  | 'DESEMPLEADO'
  | 'JUBILADO'
  | 'PENSIONADO'
  | 'AMA_DE_CASA'
  | 'TRABAJADOR_INFORMAL'
  | 'OTRO'

// ============================================================================
// NESTED TYPES
// ============================================================================

/**
 * Legajo info for persona relacionada
 */
export interface PersonaRelacionadaLegajoInfo {
  id: number
  numero: string
  fecha_apertura: string
}

/**
 * Medida activa info for persona relacionada
 */
export interface PersonaRelacionadaMedidaActiva {
  id: number
  tipo_medida: string
  estado: string
  numero_medida: string | null
}

/**
 * Demanda info for persona relacionada
 */
export interface PersonaRelacionadaDemandaInfo {
  demanda_id: number
  vinculo_demanda: string
  estado: string
}

/**
 * Complete info about the related person (persona_destino)
 */
export interface PersonaDestinoInfo {
  id: number
  nombre: string
  apellido: string
  dni: number | null
  fecha_nacimiento: string | null
  edad_calculada: number | null
  genero: string
  adulto: boolean
  nnya: boolean
  telefono: string | null
  nacionalidad: string
  situacion_dni: string
  legajo: PersonaRelacionadaLegajoInfo | null
  medidas_activas: PersonaRelacionadaMedidaActiva[]
  demandas: PersonaRelacionadaDemandaInfo[]
}

// ============================================================================
// READ TYPES (GET Response)
// ============================================================================

/**
 * PersonaVinculo - Full response from GET /api/legajos/{id}/ or GET /api/legajos/{id}/nnya/
 * Represents a permanent family relationship (TPersonaVinculo)
 */
export interface PersonaVinculo {
  /** Unique ID of the relationship */
  id: number
  /** ID of the origin persona (the NNyA) */
  persona_origen: number
  /** ID of the destination persona (the related person) */
  persona_destino: number
  /** Full info about the destination persona */
  persona_destino_info: PersonaDestinoInfo
  /** FK to tipo_vinculo */
  tipo_vinculo: number
  /** Display name of the relationship type (e.g., "MADRE", "PADRE") */
  tipo_vinculo_nombre: string
  /** Whether they live together */
  conviviente: boolean
  /** Whether they are legally responsible */
  legalmente_responsable: boolean
  /** Occupation of the related person */
  ocupacion: Ocupacion | null
  /** Whether this person is the main referent */
  es_referente_principal: boolean
  /** Additional observations */
  observaciones: string | null
  /** Whether this relationship is active */
  activo: boolean
  /** User ID who created this relationship */
  creado_por: number | null
  /** Name of the user who created this relationship */
  creado_por_nombre: string | null
  /** Creation timestamp */
  creado_en: string
  /** User ID who deactivated this relationship */
  desvinculado_por: number | null
  /** Name of the user who deactivated this relationship */
  desvinculado_por_nombre: string | null
  /** Deactivation timestamp */
  desvinculado_en: string | null
  /** Justification for deactivation */
  justificacion_desvincular: string | null
}

/**
 * Summary version for mesa de entrada
 */
export interface PersonaRelacionadaResumen {
  id: number
  nombre: string
  apellido: string
  tipo_relacion: string
  conviviente: boolean
  legalmente_responsable: boolean
}

/**
 * Busqueda vinculacion response
 */
export interface PersonaRelacionadaBusqueda {
  persona_buscada_id: number
  persona_relacionada_id: number
  persona_relacionada_nombre: string
  persona_relacionada_dni: number | null
  tipo_relacion: string
  legajo_id: number | null
  legajo_numero: string | null
}

// ============================================================================
// WRITE TYPES (PATCH Request)
// ============================================================================

/**
 * Data for creating a new persona when adding a relationship
 */
export interface PersonaDatosNueva {
  nombre: string
  apellido: string
  dni?: number
  fecha_nacimiento?: string
  genero?: string
  adulto?: boolean
  nnya?: boolean
  telefono?: string
}

/**
 * Create relationship with EXISTING persona
 */
export interface PersonaRelacionadaCreateExistente {
  /** ID of the existing persona to link */
  persona_existente_id: number
  /** FK to tipo_vinculo (required) */
  tipo_vinculo: number
  /** Whether they live together */
  conviviente?: boolean
  /** Whether they are legally responsible */
  legalmente_responsable?: boolean
  /** Occupation */
  ocupacion?: Ocupacion
  /** Whether this is the main referent */
  es_referente_principal?: boolean
  /** Additional observations */
  observaciones?: string
}

/**
 * Create relationship with NEW persona
 * Backend will search for existing persona matching the data, or create new
 */
export interface PersonaRelacionadaCreateNueva {
  /** Data for the new persona */
  persona_datos: PersonaDatosNueva
  /** FK to tipo_vinculo (required) */
  tipo_vinculo: number
  /** Whether they live together */
  conviviente?: boolean
  /** Whether they are legally responsible */
  legalmente_responsable?: boolean
  /** Occupation */
  ocupacion?: Ocupacion
  /** Whether this is the main referent */
  es_referente_principal?: boolean
  /** Additional observations */
  observaciones?: string
}

/**
 * Update existing relationship
 */
export interface PersonaRelacionadaUpdate {
  /** ID of the relationship to update (required) */
  id: number
  /** Whether they live together */
  conviviente?: boolean
  /** Whether they are legally responsible */
  legalmente_responsable?: boolean
  /** Occupation */
  ocupacion?: Ocupacion
  /** Whether this is the main referent */
  es_referente_principal?: boolean
  /** Additional observations */
  observaciones?: string
  /** FK to tipo_vinculo (can be changed) */
  tipo_vinculo?: number
}

/**
 * Desvincular (soft delete) relationship with traceability
 */
export interface PersonaRelacionadaDesvincular {
  /** ID of the relationship to deactivate (required) */
  id: number
  /** Must be true to deactivate */
  desvincular: true
  /** Justification for deactivation (required, min 20 chars) */
  justificacion_desvincular: string
}

/**
 * Union type for all persona relacionada request operations
 */
export type PersonaRelacionadaRequest =
  | PersonaRelacionadaCreateExistente
  | PersonaRelacionadaCreateNueva
  | PersonaRelacionadaUpdate
  | PersonaRelacionadaDesvincular

// ============================================================================
// NNyA UPDATE REQUEST (for personas_relacionadas field)
// ============================================================================

/**
 * Request body for PATCH /api/legajos/{id}/nnya/ personas_relacionadas field
 */
export interface NNyAPersonasRelacionadasUpdateRequest {
  personas_relacionadas: PersonaRelacionadaRequest[]
}

// ============================================================================
// TIPO VINCULO (CATALOG)
// ============================================================================

/**
 * Tipo de vínculo familiar from /api/vinculo-de-personas/ endpoint
 */
export interface TipoVinculoPersona {
  id: number
  nombre: string
  codigo?: string
  descripcion?: string
}

/**
 * Common tipo vinculo values
 */
export const TIPO_VINCULO_FAMILIA = {
  MADRE: 1,
  PADRE: 2,
  HERMANO_A: 3,
  ABUELO_A: 4,
  TIO_A: 5,
  PRIMO_A: 6,
  PADRASTRO: 7,
  MADRASTRA: 8,
  TUTOR_LEGAL: 9,
  OTRO_FAMILIAR: 10,
  REFERENTE_COMUNITARIO: 11,
  VECINO: 12,
} as const

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if request is for creating with existing persona
 */
export function isCreateExistente(
  request: PersonaRelacionadaRequest
): request is PersonaRelacionadaCreateExistente {
  return 'persona_existente_id' in request && !('id' in request)
}

/**
 * Check if request is for creating with new persona
 */
export function isCreateNueva(
  request: PersonaRelacionadaRequest
): request is PersonaRelacionadaCreateNueva {
  return 'persona_datos' in request && !('id' in request)
}

/**
 * Check if request is for updating existing relationship
 */
export function isUpdate(
  request: PersonaRelacionadaRequest
): request is PersonaRelacionadaUpdate {
  return 'id' in request && !('desvincular' in request)
}

/**
 * Check if request is for desvincular
 */
export function isDesvincular(
  request: PersonaRelacionadaRequest
): request is PersonaRelacionadaDesvincular {
  return 'id' in request && 'desvincular' in request && request.desvincular === true
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate desvincular justification
 */
export function validateJustificacionDesvincular(justificacion: string): string | null {
  if (!justificacion || justificacion.trim().length === 0) {
    return 'La justificación es obligatoria'
  }
  if (justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_DESVINCULAR) {
    return `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_DESVINCULAR} caracteres`
  }
  return null
}

/**
 * Validate persona relacionada create request
 */
export function validatePersonaRelacionadaCreate(
  request: PersonaRelacionadaCreateExistente | PersonaRelacionadaCreateNueva
): string[] {
  const errors: string[] = []

  if (!request.tipo_vinculo) {
    errors.push('El tipo de vínculo es obligatorio')
  }

  if (isCreateExistente(request)) {
    if (!request.persona_existente_id) {
      errors.push('Debe seleccionar una persona existente')
    }
  } else if (isCreateNueva(request)) {
    if (!request.persona_datos.nombre?.trim()) {
      errors.push('El nombre es obligatorio')
    }
    if (!request.persona_datos.apellido?.trim()) {
      errors.push('El apellido es obligatorio')
    }
  }

  return errors
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

/**
 * Form state for agregar persona relacionada modal
 */
export interface AgregarPersonaRelacionadaFormState {
  mode: 'existente' | 'nueva'
  // For existing persona
  persona_existente_id: number | null
  // For new persona
  persona_nombre: string
  persona_apellido: string
  persona_dni: string
  persona_fecha_nacimiento: string
  persona_genero: string
  persona_telefono: string
  persona_adulto: boolean
  // Common fields
  tipo_vinculo: number | null
  conviviente: boolean
  legalmente_responsable: boolean
  ocupacion: Ocupacion | null
  es_referente_principal: boolean
  observaciones: string
}

/**
 * Initial state for agregar persona relacionada form
 */
export const INITIAL_AGREGAR_PERSONA_FORM: AgregarPersonaRelacionadaFormState = {
  mode: 'existente',
  persona_existente_id: null,
  persona_nombre: '',
  persona_apellido: '',
  persona_dni: '',
  persona_fecha_nacimiento: '',
  persona_genero: '',
  persona_telefono: '',
  persona_adulto: true,
  tipo_vinculo: null,
  conviviente: false,
  legalmente_responsable: false,
  ocupacion: null,
  es_referente_principal: false,
  observaciones: '',
}

/**
 * Form state for desvincular modal
 */
export interface DesvincularPersonaFormState {
  justificacion: string
}

/**
 * Props for persona relacionada card/row
 */
export interface PersonaRelacionadaDisplayProps {
  persona: PersonaVinculo
  onEdit?: (persona: PersonaVinculo) => void
  onDesvincular?: (persona: PersonaVinculo) => void
  readOnly?: boolean
}
