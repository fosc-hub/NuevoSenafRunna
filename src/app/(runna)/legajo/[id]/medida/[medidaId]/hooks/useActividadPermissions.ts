import { useMemo } from 'react'
import { useUser } from '@/utils/auth/userZustand'
import type { TActividadPlanTrabajo } from '../types/actividades'

/**
 * Hook for managing user permissions on a specific activity
 * Based on PLTM-02 story requirements
 *
 * Permission Rules:
 * - canEdit: Responsable OR JZ OR Director OR Admin
 * - canReopen: JZ OR Director OR Admin (only for locked activities)
 * - canTransfer: JZ OR Director (nivel 3-4)
 * - canVisar: Legal team members only (legal=true)
 * - isLocked: Activity in COMPLETADA, CANCELADA, or VISADO_APROBADO state
 * - isResponsable: User is the responsable_principal of the activity
 */
export const useActividadPermissions = (actividad: TActividadPlanTrabajo | null) => {
  const { user } = useUser()

  const permissions = useMemo(() => {
    if (!user || !actividad) {
      return {
        canEdit: false,
        canReopen: false,
        canTransfer: false,
        canVisar: false,
        isLocked: false,
        isResponsable: false,
        isJZ: false,
        isDirector: false,
        isAdmin: false,
        isLegal: false,
        userLevel: 0,
      }
    }

    // Determine user role based on groups
    const groups = user.groups || []
    const groupNames = groups.map((g) => g.name.toLowerCase())

    const isAdmin = user.is_superuser || user.is_staff
    const isJZ = groupNames.includes('jefe zonal') || groupNames.includes('jz')
    const isDirector =
      groupNames.includes('director provincial') ||
      groupNames.includes('director interior') ||
      groupNames.includes('director')
    const isLegal = groupNames.includes('legales') || groupNames.includes('equipo legal') || user.legal === true

    // Determine user level (1-4)
    let userLevel = 1
    if (isAdmin) userLevel = 4
    else if (isJZ || isDirector) userLevel = 3
    else if (groupNames.includes('equipo técnico') || groupNames.includes('equipo tecnico')) userLevel = 2

    // Check if user is the responsable principal
    const isResponsable = user.id === actividad.responsable_principal

    // Check if activity is locked (read-only states)
    const lockedStates = ['COMPLETADA', 'CANCELADA', 'VISADO_APROBADO']
    const isLocked = lockedStates.includes(actividad.estado)

    // Permission calculations
    // canEdit: responsable OR JZ OR Director OR Admin
    const canEdit = !isLocked && (isResponsable || isJZ || isDirector || isAdmin)

    // canReopen: JZ OR Director OR Admin (only for locked activities)
    const canReopen = isLocked && (isJZ || isDirector || isAdmin)

    // canTransfer: JZ OR Director (nivel 3+)
    const canTransfer = !isLocked && (isJZ || isDirector)

    // canVisar: Legal team only, and activity must be in PENDIENTE_VISADO state
    const canVisar = isLegal && actividad.estado === 'PENDIENTE_VISADO'

    return {
      canEdit,
      canReopen,
      canTransfer,
      canVisar,
      isLocked,
      isResponsable,
      isJZ,
      isDirector,
      isAdmin,
      isLegal,
      userLevel,
      user,
    }
  }, [user, actividad])

  return permissions
}
