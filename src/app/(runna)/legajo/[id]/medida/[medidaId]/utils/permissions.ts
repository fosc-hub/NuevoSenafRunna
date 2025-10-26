/**
 * Permission Utilities for Workflow Components
 *
 * Provides centralized permission checking for workflow operations
 * based on user roles and medida workflow rules.
 */

import { useMemo } from "react"
import { useUser } from "@/utils/auth/userZustand"
import type { UserRole, PermissionConfig } from "../types/workflow"

// ============================================================================
// ROLE MAPPING
// ============================================================================

/**
 * Map user groups to workflow roles
 */
export function getUserWorkflowRole(user: any): UserRole {
  if (!user) return 'ET' // Default role

  // Superuser has all permissions
  if (user.is_superuser || user.is_staff) {
    return 'SUPERUSER'
  }

  // Check groups
  const groups = user.groups || []
  const groupNames = groups.map((g: any) => g.name.toLowerCase())

  // Check specific roles (order matters - most specific first)
  if (groupNames.includes("legales") || groupNames.includes("equipo legal")) {
    return 'LEGAL'
  }

  if (
    groupNames.includes("director provincial") ||
    groupNames.includes("director interior") ||
    groupNames.includes("director")
  ) {
    return 'DIRECTOR'
  }

  if (groupNames.includes("jefe zonal") || groupNames.includes("jz")) {
    return 'JZ'
  }

  if (groupNames.includes("equipo técnico") || groupNames.includes("equipo tecnico")) {
    return 'ET'
  }

  // Default to ET if no specific role found
  return 'ET'
}

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

/**
 * Check if user has permission for a specific action
 */
export function checkPermission(
  user: any,
  action: keyof PermissionConfig,
  config: PermissionConfig
): boolean {
  if (!user) return false

  // Get user's workflow role
  const userRole = getUserWorkflowRole(user)

  // SUPERUSER always has permission
  if (userRole === 'SUPERUSER') return true

  // Get allowed roles for this action
  const allowedRoles = config[action]

  if (!allowedRoles || allowedRoles.length === 0) {
    return false
  }

  // Check if user's role is in allowed roles
  return allowedRoles.includes(userRole)
}

/**
 * Check multiple permissions at once
 */
export function checkPermissions(
  user: any,
  actions: Array<keyof PermissionConfig>,
  config: PermissionConfig
): Record<keyof PermissionConfig, boolean> {
  const results: any = {}

  actions.forEach((action) => {
    results[action] = checkPermission(user, action, config)
  })

  return results
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for checking workflow permissions
 */
export function usePermissions(config: PermissionConfig) {
  const { user } = useUser()

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canSend: false,
        userRole: 'ET' as UserRole,
        isAuthorized: false,
      }
    }

    const userRole = getUserWorkflowRole(user)

    return {
      canView: checkPermission(user, 'canView', config),
      canCreate: checkPermission(user, 'canCreate', config),
      canEdit: checkPermission(user, 'canEdit', config),
      canDelete: checkPermission(user, 'canDelete', config),
      canApprove: checkPermission(user, 'canApprove', config),
      canSend: checkPermission(user, 'canSend', config),
      userRole,
      isAuthorized: checkPermission(user, 'canView', config),
    }
  }, [user, config])

  return permissions
}

/**
 * Hook for getting user's workflow role
 */
export function useUserRole(): UserRole {
  const { user } = useUser()
  return useMemo(() => getUserWorkflowRole(user), [user])
}

/**
 * Hook for checking if user is in specific role
 */
export function useHasRole(role: UserRole): boolean {
  const userRole = useUserRole()
  return userRole === role || userRole === 'SUPERUSER'
}

/**
 * Hook for checking if user is in any of the specified roles
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const userRole = useUserRole()

  if (userRole === 'SUPERUSER') return true

  return roles.includes(userRole)
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if item can be edited based on state and permissions
 */
export function canEditItem(
  user: any,
  item: any,
  config: PermissionConfig
): boolean {
  // Must have edit permission
  if (!checkPermission(user, 'canEdit', config)) {
    return false
  }

  // Check if editing is restricted to specific states
  const modalConfig = (config as any).modalConfig
  if (modalConfig?.editableStates && item.estado) {
    return modalConfig.editableStates.includes(item.estado)
  }

  // Default: allow edit if user has permission
  return true
}

/**
 * Check if item can be deleted
 */
export function canDeleteItem(
  user: any,
  item: any,
  config: PermissionConfig
): boolean {
  // Must have delete permission
  if (!checkPermission(user, 'canDelete', config)) {
    return false
  }

  // Additional business rules can be added here
  // For example: only delete items in BORRADOR state
  if (item.estado && item.estado !== 'BORRADOR') {
    return false
  }

  return true
}

/**
 * Check if state action can be performed
 */
export function canPerformStateAction(
  user: any,
  item: any,
  action: 'enviar' | 'aprobar' | 'rechazar',
  config: PermissionConfig
): boolean {
  const userRole = getUserWorkflowRole(user)

  // SUPERUSER can do anything
  if (userRole === 'SUPERUSER') return true

  // Check specific action permissions
  switch (action) {
    case 'enviar':
      // Usually ET can send
      return checkPermission(user, 'canSend', config) && item.estado === 'BORRADOR'

    case 'aprobar':
      // Usually JZ can approve
      return checkPermission(user, 'canApprove', config) && item.estado === 'ENVIADO'

    case 'rechazar':
      // Usually JZ can reject
      return checkPermission(user, 'canApprove', config) && item.estado === 'ENVIADO'

    default:
      return false
  }
}

// ============================================================================
// DEBUG HELPERS
// ============================================================================

/**
 * Get human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ET: 'Equipo Técnico',
    JZ: 'Jefe Zonal',
    DIRECTOR: 'Director',
    LEGAL: 'Equipo Legal',
    SUPERUSER: 'Administrador',
  }

  return roleNames[role] || role
}

/**
 * Debug: Log user permissions
 */
export function logUserPermissions(user: any, config: PermissionConfig): void {
  if (!user) {
    console.log('[Permissions] No user logged in')
    return
  }

  const role = getUserWorkflowRole(user)

  console.log('[Permissions] User:', user.username || user.email)
  console.log('[Permissions] Role:', getRoleDisplayName(role))
  console.log('[Permissions] Permissions:', {
    canView: checkPermission(user, 'canView', config),
    canCreate: checkPermission(user, 'canCreate', config),
    canEdit: checkPermission(user, 'canEdit', config),
    canDelete: checkPermission(user, 'canDelete', config),
    canApprove: checkPermission(user, 'canApprove', config),
    canSend: checkPermission(user, 'canSend', config),
  })
}

// ============================================================================
// V2: ESTADO-BASED PERMISSIONS (MED-01 V2)
// ============================================================================

import type { TEstadoEtapaMedida } from '../types/estado-etapa'
import { canUserTransitionToEstado as canTransitionToEstado } from './estado-validation'

/**
 * V2: Check if user can advance to a specific estado
 *
 * Requirements:
 * - Must be next sequential estado (orden + 1)
 * - User must have matching responsable_tipo role
 *
 * @param user - User object
 * @param targetEstado - Target estado from catalog
 * @param currentEstado - Current estado (null if no estado yet)
 * @returns True if user can advance to target estado
 */
export function canAdvanceToEstado(
  user: any,
  targetEstado: TEstadoEtapaMedida,
  currentEstado: TEstadoEtapaMedida | null
): boolean {
  if (!user) return false

  // SUPERUSER always has permission
  const userRole = getUserWorkflowRole(user)
  if (userRole === 'SUPERUSER') return true

  // Check sequential progression
  if (currentEstado) {
    // Can only advance to next estado (orden + 1)
    if (targetEstado.orden !== currentEstado.orden + 1) {
      return false
    }
  } else {
    // If no current estado, can only start with orden 1
    if (targetEstado.orden !== 1) {
      return false
    }
  }

  // Check role permission using estado validation
  return canTransitionToEstado({ id: user.id, nombre_completo: user.username, role: userRole }, targetEstado)
}

/**
 * V2: Check if workflow actions should be shown
 *
 * MPJ hides state transition UI (only stage transitions)
 * MPI Cese hides state UI (direct closure)
 * MPE POST_CESE hides state UI (only PLTM activities)
 *
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @returns True if workflow action buttons should be displayed
 */
export function shouldShowWorkflowActions(
  tipoMedida: 'MPI' | 'MPE' | 'MPJ',
  tipoEtapa: string | null
): boolean {
  // MPJ never shows estado workflow actions
  if (tipoMedida === 'MPJ') {
    return false
  }

  // MPI Cese doesn't show estado workflow actions
  if (tipoMedida === 'MPI' && tipoEtapa === 'CESE') {
    return false
  }

  // MPE POST_CESE doesn't show estado workflow actions
  if (tipoMedida === 'MPE' && tipoEtapa === 'POST_CESE') {
    return false
  }

  // All other cases show workflow actions
  return true
}

/**
 * V2: Get allowed estados for user based on current context
 *
 * Filters estados by:
 * - Applicability to measure type and stage
 * - Sequential progression (next estado only)
 * - User role permission
 *
 * @param user - User object
 * @param availableEstados - All applicable estados for this medida/stage
 * @param currentEstado - Current estado (null if no estado)
 * @returns Array of estados user can transition to
 */
export function getAllowedEstadosForUser(
  user: any,
  availableEstados: TEstadoEtapaMedida[],
  currentEstado: TEstadoEtapaMedida | null
): TEstadoEtapaMedida[] {
  if (!user) return []

  const userRole = getUserWorkflowRole(user)

  // SUPERUSER sees all next estados
  if (userRole === 'SUPERUSER') {
    if (!currentEstado) {
      return availableEstados.filter(e => e.orden === 1)
    }
    const nextOrden = currentEstado.orden + 1
    return availableEstados.filter(e => e.orden === nextOrden)
  }

  // Filter by permission
  return availableEstados.filter(estado =>
    canAdvanceToEstado(user, estado, currentEstado)
  )
}
