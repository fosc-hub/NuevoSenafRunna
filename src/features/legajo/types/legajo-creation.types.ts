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

  // ⚠️ WORKAROUND TEMPORAL: Backend incorrectamente requiere numero
  // Según LEG-02, numero debería ser auto-generado, pero el serializer está mal configurado
  // TODO: Remover cuando backend marque numero como read_only
  numero?: string
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
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_ESPECIFICA'
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
 */
export interface AutorizarAdmisionResponse {
  legajos_creados: Array<{
    id: number
    numero: string
    nnya: {
      id: number
      nombre: string
      apellido: string
    }
  }>
  legajos_existentes: Array<{
    nnya_id: number
    legajo_numero: string
    message: string
  }>
  total_creados: number
  total_existentes: number
  message: string
}

// ============================================
// Search & Validation Types
// ============================================

/**
 * NNyA search result (for duplicate detection)
 */
export interface BusquedaNnyaResult {
  id: number
  nombre: string
  apellido: string
  dni: number
  fecha_nacimiento: string
  legajo_existente?: {
    id: number
    numero: string
    fecha_apertura: string
  }
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
  nombre_completo: string  // Campo calculado read-only en backend
  nivel?: string
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
