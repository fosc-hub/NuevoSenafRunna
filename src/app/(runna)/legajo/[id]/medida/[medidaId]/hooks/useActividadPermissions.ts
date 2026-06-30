import { useMemo } from 'react'
import { useUser } from '@/utils/auth/userZustand'
import type { TActividadPlanTrabajo } from '../types/actividades'

/**
 * Hook for managing user permissions on a specific activity
 * Based on PLTM-02 story requirements
 *
 * Permission Rules:
 * - canEdit: Todos los usuarios mientras la actividad no esté bloqueada
 * - canAddActivity: Any user can add comments/files (unless activity is locked)
 * - canReopen: JZ OR Director OR Admin (only for locked activities)
 * - canTransfer: JZ OR Director (nivel 3-4)
 * - canVisarJZ: JZ OR Director OR Admin (estado must be PENDIENTE_VISADO_JZ)
 * - canVisar: Legal team members OR Admin (estado must be PENDIENTE_VISADO)
 * - isLocked: Activity in COMPLETADA, CANCELADA, or VISADO_APROBADO state
 * - isResponsable: User is the responsable_principal of the activity
 */
export const useActividadPermissions = (actividad: TActividadPlanTrabajo | null) => {
  const { user } = useUser()

  const permissions = useMemo(() => {
    if (!user || !actividad) {
      return {
        canEdit: false,
        canChangeEstado: false,
        canAddActivity: false,
        canReopen: false,
        canTransfer: false,
        canVisarJZ: false,
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
    const isLegal = groupNames.includes('legal') || groupNames.includes('legales') || groupNames.includes('equipo legal') || user.legal === true

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
    // canEdit: solo se puede editar (campos: descripción, fechas, responsables, etc.)
    // mientras la actividad está EN_PROGRESO. En cualquier otro estado
    // (PENDIENTE_VISADO_JZ, PENDIENTE_VISADO, etc.) la edición queda bloqueada.
    const canEdit = actividad.estado === 'EN_PROGRESO'

    // canChangeEstado: cambiar el estado de la actividad (transiciones de TRANSICIONES_PERMITIDAS,
    // ej: PENDIENTE → EN_PROGRESO) está permitido mientras la actividad no esté bloqueada.
    // OJO: es distinto de canEdit — un técnico debe poder pasar una actividad PENDIENTE a EN_PROGRESO.
    const canChangeEstado = !isLocked

    // canAddActivity: Any user can add comments/files (unless activity is locked)
    const canAddActivity = !isLocked

    // canReopen: JZ OR Director OR Admin (only for locked activities)
    const canReopen = isLocked && (isJZ || isDirector || isAdmin)

    // canTransfer: JZ OR Director (nivel 3+)
    const canTransfer = !isLocked && (isJZ || isDirector)

    // canVisarJZ: JZ OR Director OR Admin, and activity must be in PENDIENTE_VISADO_JZ state
    const canVisarJZ = (isJZ || isDirector || isAdmin) && actividad.estado === 'PENDIENTE_VISADO_JZ'

    // canVisar: Legal team OR Admin, and activity must be in PENDIENTE_VISADO state
    const canVisar = (isLegal || isAdmin) && actividad.estado === 'PENDIENTE_VISADO'

    // GAP-17: canDerivar - JZ OR Director, only when actividad permite derivación interna
    const canDerivar = !isLocked
      && actividad.permite_derivacion_interna === true
      && (isJZ || isDirector)

    return {
      canEdit,
      canChangeEstado,
      canAddActivity,
      canReopen,
      canTransfer,
      canVisarJZ,
      canVisar,
      canDerivar,
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
