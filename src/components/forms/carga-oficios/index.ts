// Main form component
export { default as CargaOficiosForm } from "./CargaOficiosForm"

// Individual components
export {
  CircuitoSelector,
  CategoriaInfoSection,
  OrganoJudicialSection,
  ExpedienteSection,
  LocalizacionOficioSection,
  AdjuntosSection,
  PlaceholderField,
  PlaceholderAutocomplete,
  PlaceholderMultiSelect,
} from "./components"

// Hooks
export { useCargaOficiosDropdowns, useAdjuntosManager } from "./hooks"

// Types
export type {
  FormVariant,
  ObjetivoDemanda,
  CircuitoType,
  CircuitoOption,
  CategoriaInformacionJudicial,
  TipoInformacionJudicial,
  VinculoFormData,
  CargaOficiosFormData,
  CargaOficiosDropdownData,
  CargaOficiosFormProps,
  CargaOficiosValidationErrors,
} from "./types/carga-oficios.types"

export { CIRCUITO_OPTIONS } from "./types/carga-oficios.types"
