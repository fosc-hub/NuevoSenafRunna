import type { UserPermissions } from "./userZustand"

const VINCULACION_PERMISSIONS = new Set([
  "view_tdemandavinculada",
  "add_tdemandavinculada",
  "change_tdemandavinculada",
])

const LEGAL_GROUP_NAMES = ["legal", "legales", "equipo legal"]

/**
 * Determines whether a user can access Vinculaciones features (tab + modal).
 * Falls back to role heuristics when detailed Django permissions are missing.
 */
export const hasVinculacionAccess = (user?: UserPermissions | null): boolean => {
  if (!user) {
    return false
  }

  if (user.is_superuser || user.is_staff) {
    return true
  }

  const permissions = user.all_permissions || []
  if (permissions.some((perm) => VINCULACION_PERMISSIONS.has(perm))) {
    return true
  }

  const userPerms = user.user_permissions || []
  if (userPerms.some((perm) => VINCULACION_PERMISSIONS.has(perm))) {
    return true
  }

  const groupNames = (user.groups || []).map((group) => group.name?.toLowerCase().trim())
  if (groupNames.some((name) => name && LEGAL_GROUP_NAMES.includes(name))) {
    return true
  }

  if (user.zonas?.some((zona) => zona?.legal)) {
    return true
  }

  return false
}
