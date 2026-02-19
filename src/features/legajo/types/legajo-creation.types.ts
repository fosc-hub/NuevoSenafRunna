/**
 * TypeScript Types for Legajo Creation (LEG-02)
 * Based on RUNNA API endpoints
 */

// ============================================
// Request Types
// ============================================

/**
 * Request body for POST /api/legajos/ (Manual Creation)
 */
export interface CreateLegajoManualRequest {
  // Option 1: Use existing NNyA
  nnya?: number

  // Option 2: Create new NNyA
  nnya_data?: NnyaCreateData

  // Required legajo fields
  urgencia: number  // ID of TUrgenciaVulneracion

  // Trabajo assignment (required)
  zona_trabajo_id: number
  user_responsable_trabajo_id: number

  // Centro de vida assignment (optional)
  local_centro_vida_id?: number
  zona_centro_vida_id?: number
  user_responsable_centro_vida_id?: number

  origen?: string
}

/**
 * NNyA data for creating new person
 */
export interface NnyaCreateData {
  nombre: string
  apellido: string
  dni?: number
  situacion_dni: 'EN_TRAMITE' | 'VENCIDO' | 'EXTRAVIADO' | 'INEXISTENTE' | 'VALIDO' | 'OTRO'
  fecha_nacimiento?: string  // YYYY-MM-DD
  edad_aproximada?: number
  nacionalidad: 'ARGENTINA' | 'EXTRANJERA'
  genero: 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO'
  domicilio_calle?: string
  domicilio_numero?: string
  domicilio_localidad?: string
  domicilio_provincia?: string
}

/**
 * Request for autorizar admision (Automatic Creation)
 * PUT /api/evaluaciones/{demanda_pk}/autorizar/
 */
export interface AutorizarAdmisionRequest {
  decision?: string
  justificacion_director?: string
}

// ============================================
// Response Types
// ============================================

/**
 * Response from POST /api/legajos/
 */
export interface CreateLegajoResponse {
  id: number
  numero: string
  fecha_apertura: string
  nnya: {
    id: number
    nombre: string
    apellido: string
    nombre_completo: string
    dni: number
  }
  urgencia: {
    id: number
    nombre: string
  }
  zona_trabajo: {
    id: number
    nombre: string
  }
  user_responsable_trabajo: {
    id: number
    nombre_completo: string
    username: string
  }
  centro_vida?: {
    local: {
      id: number
      nombre: string
    }
    zona: {
      id: number
      nombre: string
    }
    user_responsable: {
      id: number
      nombre_completo: string
    }
  }
  origen: string
}

/**
 * Response from PUT /api/evaluaciones/{demanda_pk}/autorizar/
 * Can be either the expected structure with legajos or just an evaluation object
 */
export interface AutorizarAdmisionResponse {
  // Expected structure (when endpoint creates legajos)
  legajos_creados?: Array<{
    id: number
    numero: string
    nnya: {
      id: number
      nombre: string
      apellido: string
    }
  }>
  legajos_existentes?: Array<{
    nnya_id: number
    legajo_numero: string
    message: string
  }>
  total_creados?: number
  total_existentes?: number
  message?: string

  // Actual structure (evaluation object)
  id?: number
  evaluacion_personas?: Array<{
    persona: {
      id: number
      nombre: string
      apellido: string
      dni: string | null
    }
  }>
  decision_director?: string
  justificacion_director?: string
  solicitud_tecnico?: string
  demanda?: number
}

// ============================================
// Search & Validation Types
// ============================================

/**
 * Miembro del grupo conviviente (LEG-01 enhanced response)
 */
export interface GrupoConvivienteMiembro {
  persona_id: number
  nombre: string  // "Nombre Apellido"
  dni: number | null
  vinculo: string | null  // "Madre", "Padre", "Hermano", etc.
}

/**
 * Legajo info in persona encontrada (LEG-01 enhanced response)
 */
export interface LegajoBasicInfo {
  id: number
  numero: string
}

/**
 * Persona encontrada from enhanced API response (LEG-01)
 * POST /api/demanda-busqueda-vinculacion/ - personas_encontradas field
 */
export interface PersonaEncontrada {
  id: number
  nombre: string
  apellido: string
  dni: number | null
  fecha_nacimiento: string | null  // ISO format: "YYYY-MM-DD"
  nnya: boolean
  demandas_ids: number[]           // IDs de demandas vinculadas (puede estar vacío)
  medidas_ids: number[]            // IDs de medidas del legajo (puede estar vacío)
  legajo: LegajoBasicInfo | null   // null si no tiene legajo
  grupo_conviviente: GrupoConvivienteMiembro[]
}

/**
 * API Response from POST /api/demanda-busqueda-vinculacion/ (LEG-01 enhanced)
 */
export interface BusquedaVinculacionResponse {
  demanda_ids: number[]
  nnya_ids: number[]
  match_descriptions: string[]
  legajos: Array<{
    id: number
    numero: string
    fecha_apertura: string
    nnya: number | { id: number }
  }>
  personas_relacionadas: any[]
  personas_encontradas: PersonaEncontrada[]  // New field from LEG-01
}

/**
 * NNyA search result (for duplicate detection)
 * Updated to include enhanced information from LEG-01
 */
export interface BusquedaNnyaResult {
  id: number
  nombre: string
  apellido: string
  dni: number | null
  fecha_nacimiento: string | null
  nnya: boolean
  legajo_existente?: {
    id: number
    numero: string
    fecha_apertura?: string
  }
  // Enhanced fields from LEG-01
  demandas_ids: number[]
  medidas_ids: number[]
  grupo_conviviente: GrupoConvivienteMiembro[]
}

// ============================================
// Catalog Types
// ============================================

export interface UrgenciaVulneracion {
  id: number
  nombre: string
  descripcion?: string
}

export interface ZonaInfo {
  id: number
  nombre: string
  codigo?: string
}

export interface UserInfo {
  id: number
  username: string
  first_name?: string
  last_name?: string
  nombre_completo?: string  // Campo calculado (puede venir del backend o generarse en frontend)
  nivel?: string
  email?: string
  is_active?: boolean
  is_staff?: boolean
  zonas?: any[]
}

export interface LocalCentroVida {
  id: number
  nombre: string
  zona: number
}

// ============================================
// Form State Types
// ============================================

/**
 * Form data during creation flow (stepper)
 */
export interface CrearLegajoFormState {
  step: number
  modoCreacion: 'existente' | 'nuevo'
  nnyaSeleccionado: BusquedaNnyaResult | null
  datosNnya: Partial<NnyaCreateData>
  asignacion: {
    urgencia: number | null
    zona_trabajo_id: number | null
    user_responsable_trabajo_id: number | null
    local_centro_vida_id?: number | null
    zona_centro_vida_id?: number | null
    user_responsable_centro_vida_id?: number | null
  }
}

/**
 * Asignacion data structure
 */
export interface AsignacionData {
  tipo: 'trabajo' | 'centro_vida'
  zona_id: number | null
  user_responsable_id: number | null
  local_centro_vida_id?: number | null
}
