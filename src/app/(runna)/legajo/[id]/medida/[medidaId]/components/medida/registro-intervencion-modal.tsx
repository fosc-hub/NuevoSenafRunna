"use client"

/**
 * RegistroIntervencionModal - Backward Compatibility Wrapper
 *
 * @deprecated This file is maintained for backward compatibility only.
 * Please use IntervencionModal from './shared/intervencion-modal' directly.
 *
 * This wrapper ensures that existing imports continue to work without breaking changes.
 * The actual implementation has been moved to './shared/intervencion-modal.tsx'
 * as part of the MPI Component Unification project (Phase 2).
 *
 * Migration Guide:
 * OLD: import { RegistroIntervencionModal } from './registro-intervencion-modal'
 * NEW: import { IntervencionModal } from './shared/intervencion-modal'
 *
 * @see ./shared/intervencion-modal.tsx - New unified implementation
 * @see claudedocs/MPI_Component_Unification_Progress.md - Project documentation
 */

// Re-export from new location
export { IntervencionModal as RegistroIntervencionModal } from "./shared/intervencion-modal"
export type { IntervencionModalProps as RegistroIntervencionModalProps } from "./shared/intervencion-modal"
