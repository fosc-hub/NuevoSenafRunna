import { useMemo } from "react"
import { useUser } from "@/utils/auth/userZustand"

/**
 * Hook for managing user permissions in legajos listado
 * Based on BE-05 story requirements
 */
export const useUserPermissions = () => {
  const { user } = useUser()

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canViewAll: false,
        canAssign: false,
        canEdit: false,
        canSendNotification: false,
        canViewJudicialData: false,
        isAdmin: false,
        isJefeZonal: false,
        isDirector: false,
        isLegales: false,
        isEquipoTecnico: false,
        userLevel: 0,
      }
    }

    // Determine user role based on groups
    const groups = user.groups || []
    const groupNames = groups.map((g) => g.name.toLowerCase())

    const isAdmin = user.is_superuser || user.is_staff
    const isJefeZonal = groupNames.includes("jefe zonal") || groupNames.includes("jz")
    const isDirector =
      groupNames.includes("director provincial") ||
      groupNames.includes("director interior") ||
      groupNames.includes("director")
    const isLegales = groupNames.includes("legales") || groupNames.includes("equipo legal")
    const isEquipoTecnico = groupNames.includes("equipo técnico") || groupNames.includes("equipo tecnico")

    // Determine user level (1-4)
    // Level 4: Admin
    // Level 3+: Jefe Zonal, Director
    // Level 2: Equipo Técnico
    let userLevel = 1
    if (isAdmin) userLevel = 4
    else if (isJefeZonal || isDirector) userLevel = 3
    else if (isEquipoTecnico) userLevel = 2

    // CA-2: Restricción Datos Judiciales
    // Solo Legales, JZ, Dirección pueden ver datos judiciales
    const canViewJudicialData = isLegales || isJefeZonal || isDirector || isAdmin

    // CA-3: Permisos de Acciones
    // Nivel 2 (Equipo Técnico) NO puede asignar
    // Nivel 3+ puede asignar
    const canAssign = userLevel >= 3

    // Everyone can edit their own legajos (subject to backend validation)
    const canEdit = true

    // Everyone can send notifications (subject to backend validation)
    const canSendNotification = true

    // Admin can view all legajos
    const canViewAll = isAdmin

    return {
      canViewAll,
      canAssign,
      canEdit,
      canSendNotification,
      canViewJudicialData,
      isAdmin,
      isJefeZonal,
      isDirector,
      isLegales,
      isEquipoTecnico,
      userLevel,
      user,
    }
  }, [user])

  return permissions
}
