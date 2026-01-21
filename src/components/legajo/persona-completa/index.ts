// Main component
export { default as PersonaCompletaSection } from "./PersonaCompletaSection"

// Display components
export {
  PersonalInfoDisplay,
  EducationDisplay,
  HealthDisplay,
  VulnerabilityDisplay,
} from "./display"

// Types
export type {
  PersonaCompletaData,
  PersonaCompletaSectionProps,
  DisplayTabProps,
  LocalizacionEmbedded,
  EducacionEmbedded,
  CoberturaMedicaEmbedded,
  PersonaEnfermedadEmbedded,
  DemandaPersonaEmbedded,
  CondicionVulnerabilidadEmbedded,
  VulneracionEmbedded,
  TabId,
  TabConfig,
} from "./types/persona-completa.types"
