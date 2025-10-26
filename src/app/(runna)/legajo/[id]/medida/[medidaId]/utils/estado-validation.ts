/**
 * Estado Validation Utilities - MED-01 V2
 *
 * Business logic for estado transitions, applicability checks,
 * and permission validation.
 *
 * Key Functions:
 * - Type-specific estado filtering (MPI, MPE, MPJ)
 * - Sequential progression validation
 * - Role-based permission checks
 * - Special case handling (MPI Cese, MPE POST_CESE, MPJ)
 */

import type {
  TEstadoEtapaMedida,
  TipoEtapa,
  ResponsableTipo,
} from '../types/estado-etapa'
import type { TipoMedida } from '../types/medida-api'
import type { User, UserRole } from '../types/workflow'

// ============================================================================
// APPLICABILITY VALIDATION
// ============================================================================

/**
 * Check if estado is applicable to measure type and stage
 *
 * @param estado - Estado to validate
 * @param tipoMedida - Measure type (MPI, MPE, MPJ)
 * @param tipoEtapa - Stage type (APERTURA, etc.)
 * @returns True if estado can be used for this medida/stage
 */
export function isEstadoApplicable(
  estado: TEstadoEtapaMedida,
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): boolean {
  return (
    estado.aplica_a_tipos_medida.includes(tipoMedida) &&
    estado.aplica_a_tipos_etapa.includes(tipoEtapa)
  )
}

/**
 * Filter estados by applicability to measure and stage
 *
 * @param estados - Array of all estados
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @returns Filtered and sorted array of applicable estados
 */
export function getApplicableEstados(
  estados: TEstadoEtapaMedida[],
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): TEstadoEtapaMedida[] {
  return estados
    .filter((estado) => isEstadoApplicable(estado, tipoMedida, tipoEtapa))
    .sort((a, b) => a.orden - b.orden)
}

// ============================================================================
// PERMISSION VALIDATION
// ============================================================================

/**
 * Map user role to responsable tipo
 *
 * @param userRole - User role from workflow.ts
 * @returns Responsable tipo or null if no mapping
 */
export function userRoleToResponsableTipo(
  userRole: UserRole
): ResponsableTipo | null {
  const roleMap: Record<UserRole, ResponsableTipo | null> = {
    ET: 'EQUIPO_TECNICO',
    JZ: 'JEFE_ZONAL',
    DIRECTOR: 'DIRECTOR',
    LEGAL: 'EQUIPO_LEGAL',
    SUPERUSER: null, // Superuser can act as any role
  }

  return roleMap[userRole]
}

/**
 * Check if user has permission to transition to estado
 *
 * @param user - User object with role
 * @param estado - Target estado
 * @returns True if user can transition to this estado
 */
export function canUserTransitionToEstado(
  user: User,
  estado: TEstadoEtapaMedida
): boolean {
  // SUPERUSER can do anything
  if (user.role === 'SUPERUSER') {
    return true
  }

  // Map user role to responsable tipo
  const userResponsable = userRoleToResponsableTipo(user.role)

  if (!userResponsable) {
    return false
  }

  // Check if user's responsable type matches estado's required type
  return estado.responsable_tipo === userResponsable
}

// ============================================================================
// TRANSITION VALIDATION
// ============================================================================

/**
 * Get available estado transitions from current state
 *
 * Sequential progression: Can only advance to orden + 1
 * Permission filtering: Only show estados user can transition to
 *
 * @param currentEstado - Current estado (null if no estado yet)
 * @param availableEstados - All applicable estados for this medida/stage
 * @param user - User attempting transition
 * @returns Array of estados user can transition to
 */
export function getAvailableTransitions(
  currentEstado: TEstadoEtapaMedida | null,
  availableEstados: TEstadoEtapaMedida[],
  user: User
): TEstadoEtapaMedida[] {
  // If no current estado, return first estado (orden = 1) if user has permission
  if (!currentEstado) {
    const firstEstado = availableEstados.filter((e) => e.orden === 1)
    return firstEstado.filter((e) => canUserTransitionToEstado(user, e))
  }

  // Get next sequential estado (orden + 1)
  const nextOrden = currentEstado.orden + 1
  const nextEstados = availableEstados.filter((e) => e.orden === nextOrden)

  // Filter by user permission
  return nextEstados.filter((e) => canUserTransitionToEstado(user, e))
}

/**
 * Validate if transition from current estado to target estado is allowed
 *
 * @param currentEstado - Current estado (null if no estado)
 * @param targetEstado - Target estado to transition to
 * @param user - User attempting transition
 * @returns Object with isValid flag and reason if invalid
 */
export function validateEstadoTransition(
  currentEstado: TEstadoEtapaMedida | null,
  targetEstado: TEstadoEtapaMedida,
  user: User
): { isValid: boolean; reason?: string } {
  // Check user permission
  if (!canUserTransitionToEstado(user, targetEstado)) {
    return {
      isValid: false,
      reason: `No tiene permisos para avanzar a este estado. Requiere rol: ${targetEstado.responsable_tipo}`,
    }
  }

  // If no current estado, can only transition to orden 1
  if (!currentEstado) {
    if (targetEstado.orden !== 1) {
      return {
        isValid: false,
        reason: 'Debe comenzar con el primer estado',
      }
    }
    return { isValid: true }
  }

  // Check sequential progression (orden + 1 only)
  if (targetEstado.orden !== currentEstado.orden + 1) {
    return {
      isValid: false,
      reason: 'Los estados deben avanzar secuencialmente (no se puede saltar estados)',
    }
  }

  // Valid transition
  return { isValid: true }
}

// ============================================================================
// SPECIAL CASES
// ============================================================================

/**
 * Check if measure type/stage should skip estados entirely
 *
 * Cases that skip estados:
 * - MPJ (all stages) - no estados, only stage transitions
 * - MPI Cese - no estados, direct closure with technical report
 * - MPE POST_CESE - no estados, only PLTM activities
 *
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @returns True if estados should be skipped
 */
export function shouldSkipEstados(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa | null
): boolean {
  // MPJ never uses estados
  if (tipoMedida === 'MPJ') {
    return true
  }

  // MPI Cese doesn't use estados
  if (tipoMedida === 'MPI' && tipoEtapa === 'CESE') {
    return true
  }

  // MPE POST_CESE doesn't use estados (only PLTM activities)
  if (tipoMedida === 'MPE' && tipoEtapa === 'POST_CESE') {
    return true
  }

  return false
}

/**
 * Check if MPI Cese should skip estados workflow
 *
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @returns True if MPI Cese case
 */
export function shouldSkipStatesForCese(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa | null
): boolean {
  return tipoMedida === 'MPI' && tipoEtapa === 'CESE'
}

/**
 * Check if MPE is in POST_CESE stage
 *
 * POST_CESE requirements:
 * - tipo_medida = MPE
 * - tipo_etapa = POST_CESE
 * - fecha_cese_efectivo is set
 *
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @param fechaCeseEfectivo - Effective closure date
 * @returns True if MPE POST_CESE case
 */
export function isMPEPostCese(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa | null,
  fechaCeseEfectivo: string | null
): boolean {
  return (
    tipoMedida === 'MPE' &&
    tipoEtapa === 'POST_CESE' &&
    fechaCeseEfectivo !== null
  )
}

/**
 * Check if measure type is MPJ (no estados, only stage transitions)
 *
 * @param tipoMedida - Measure type
 * @returns True if MPJ
 */
export function isMPJ(tipoMedida: TipoMedida): boolean {
  return tipoMedida === 'MPJ'
}

// ============================================================================
// ESTADO PROGRESS CALCULATION
// ============================================================================

/**
 * Calculate progress percentage for current estado
 *
 * Simple calculation based on orden:
 * - Estado 1/5 = 20%
 * - Estado 2/5 = 40%
 * - Estado 5/5 = 100%
 *
 * @param currentEstado - Current estado
 * @param totalEstados - Total number of estados for this medida/stage
 * @returns Progress percentage (0-100)
 */
export function calculateEstadoProgress(
  currentEstado: TEstadoEtapaMedida | null,
  totalEstados: number
): number {
  if (!currentEstado || totalEstados === 0) {
    return 0
  }

  return Math.round((currentEstado.orden / totalEstados) * 100)
}

/**
 * Get overall workflow progress summary
 *
 * @param currentEstado - Current estado
 * @param availableEstados - All applicable estados
 * @returns Object with progress metrics
 */
export function getWorkflowProgress(
  currentEstado: TEstadoEtapaMedida | null,
  availableEstados: TEstadoEtapaMedida[]
): {
  currentOrden: number
  totalEstados: number
  percentage: number
  isComplete: boolean
} {
  const totalEstados = availableEstados.length
  const currentOrden = currentEstado?.orden || 0

  return {
    currentOrden,
    totalEstados,
    percentage: calculateEstadoProgress(currentEstado, totalEstados),
    isComplete: currentOrden === totalEstados && totalEstados > 0,
  }
}

// ============================================================================
// ESTADO DISPLAY HELPERS
// ============================================================================

/**
 * Get user-friendly display message for estado requirement
 *
 * @param estado - Estado
 * @returns Display message
 */
export function getEstadoActionMessage(estado: TEstadoEtapaMedida): string {
  return estado.siguiente_accion
}

/**
 * Get user-friendly display name for responsable tipo
 *
 * @param responsable - Responsable tipo
 * @returns Display name
 */
export function getResponsableDisplayName(responsable: ResponsableTipo): string {
  const displayNames: Record<ResponsableTipo, string> = {
    EQUIPO_TECNICO: 'Equipo Técnico',
    JEFE_ZONAL: 'Jefe Zonal',
    DIRECTOR: 'Director',
    EQUIPO_LEGAL: 'Equipo Legal',
  }

  return displayNames[responsable]
}

/**
 * Get tooltip/helper text for estado
 *
 * @param estado - Estado
 * @returns Helper text
 */
export function getEstadoHelperText(estado: TEstadoEtapaMedida): string {
  return `Responsable: ${getResponsableDisplayName(estado.responsable_tipo)}\nAcción requerida: ${estado.siguiente_accion}`
}

// ============================================================================
// EXPORTS
// ============================================================================

export const estadoValidation = {
  // Applicability
  isApplicable: isEstadoApplicable,
  getApplicable: getApplicableEstados,

  // Permissions
  canUserTransition: canUserTransitionToEstado,

  // Transitions
  getAvailableTransitions,
  validateTransition: validateEstadoTransition,

  // Special Cases
  shouldSkipEstados,
  shouldSkipStatesForCese,
  isMPEPostCese,
  isMPJ,

  // Progress
  calculateProgress: calculateEstadoProgress,
  getWorkflowProgress,

  // Display
  getActionMessage: getEstadoActionMessage,
  getResponsableName: getResponsableDisplayName,
  getHelperText: getEstadoHelperText,
}

export default estadoValidation
