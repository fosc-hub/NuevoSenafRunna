/**
 * TypeScript types for PersonaCompleta API response
 * Based on GET /api/legajos/{id}/ endpoint v6.0
 *
 * Re-exports types from legajo-api.ts for consistency.
 * Also defines component-specific props types.
 */

// Re-export embedded types from legajo-api.ts for consistency
export type {
  LocalizacionEmbedded,
  EducacionEmbedded,
  CoberturaMedicaEmbedded,
  PersonaEnfermedadEmbedded,
  DemandaPersonaEmbedded,
  CondicionVulnerabilidadEmbedded,
  VulneracionEmbedded,
  InstitucionEducativaInfo,
  InstitucionSanitariaInfo,
  MedicoCabeceraInfo,
  EnfermedadInfo,
  SituacionSaludInfo,
  ArchivoAdjuntoInfo,
  DemandaInfoEmbedded,
  VinculoNnyaPrincipalInfoEmbedded,
  CondicionVulnerabilidadInfoEmbedded,
  CategoriaInfo,
  GravedadVulneracionInfo,
  UrgenciaVulneracionInfo,
  AutorDvInfoEmbedded,
} from "@/app/(runna)/legajo-mesa/types/legajo-api"

// Import types for use in PersonaCompletaData
import type {
  LocalizacionEmbedded,
  EducacionEmbedded,
  CoberturaMedicaEmbedded,
  PersonaEnfermedadEmbedded,
  DemandaPersonaEmbedded,
  CondicionVulnerabilidadEmbedded,
  VulneracionEmbedded,
} from "@/app/(runna)/legajo-mesa/types/legajo-api"

// ============================================
// Main PersonaCompleta Type
// ============================================

export interface PersonaCompletaData {
  // Basic persona info
  id: number
  nombre: string
  nombre_autopercibido: string | null
  apellido: string
  fecha_nacimiento: string | null
  edad_aproximada: number | null
  edad_calculada: number | null
  nacionalidad: string
  dni: number | null
  situacion_dni: string | null
  genero: string
  telefono: number | null
  observaciones: string | null
  fecha_defuncion: string | null
  adulto: boolean
  nnya: boolean
  deleted: boolean

  // Embedded related data
  localizacion: LocalizacionEmbedded | null
  educacion: EducacionEmbedded | null
  cobertura_medica: CoberturaMedicaEmbedded | null
  persona_enfermedades: PersonaEnfermedadEmbedded[]
  demanda_persona: DemandaPersonaEmbedded | null
  use_demanda_localizacion: boolean
  condiciones_vulnerabilidad: CondicionVulnerabilidadEmbedded[]
  vulneraciones: VulneracionEmbedded[]
}

// ============================================
// Component Props Types
// ============================================

export interface PersonaCompletaSectionProps {
  persona: PersonaCompletaData
  defaultExpanded?: boolean
  showEditButton?: boolean
  onEdit?: () => void
}

export interface DisplayTabProps {
  persona: PersonaCompletaData
}

// ============================================
// Utility Types
// ============================================

export type TabId = 'personal' | 'educacion' | 'salud' | 'vulnerabilidad'

export interface TabConfig {
  id: TabId
  label: string
  icon: React.ReactNode
}
