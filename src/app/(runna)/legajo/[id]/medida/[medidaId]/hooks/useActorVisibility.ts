import { useMemo } from 'react'
import { useUser } from '@/utils/auth/userZustand'
import type { ActorEnum } from '../types/actividades'

/**
 * User group to actor mapping
 *
 * Maps user group names (case-insensitive) to their corresponding actor types.
 * Users can only see/create activities for their assigned actor.
 *
 * Group → Actor mapping:
 * - "Legal", "Legales", "Equipo Legal" → EQUIPO_LEGAL
 * - "Técnico", "Tecnico", "Equipo Técnico", "Equipo Tecnico" → EQUIPO_TECNICO
 * - "Residenciales", "Equipos Residenciales" → EQUIPOS_RESIDENCIALES
 * - "Adultos", "Institución", "Institucion" → ADULTOS_INSTITUCION
 *
 * Special cases:
 * - Superusers, Staff, JZ, Directors → Can see ALL actors
 */

/**
 * Normalized group name to actor mapping
 */
const GROUP_TO_ACTOR_MAP: Record<string, ActorEnum> = {
  // Legal team variations
  'legal': 'EQUIPO_LEGAL',
  'legales': 'EQUIPO_LEGAL',
  'equipo legal': 'EQUIPO_LEGAL',
  'equipo de legales': 'EQUIPO_LEGAL',

  // Technical team variations
  'técnico': 'EQUIPO_TECNICO',
  'tecnico': 'EQUIPO_TECNICO',
  'equipo técnico': 'EQUIPO_TECNICO',
  'equipo tecnico': 'EQUIPO_TECNICO',

  // Residential teams variations
  'residenciales': 'EQUIPOS_RESIDENCIALES',
  'equipos residenciales': 'EQUIPOS_RESIDENCIALES',
  'equipo residencial': 'EQUIPOS_RESIDENCIALES',

  // Adults/Institution variations
  'adultos': 'ADULTOS_INSTITUCION',
  'institución': 'ADULTOS_INSTITUCION',
  'institucion': 'ADULTOS_INSTITUCION',
  'adultos responsables': 'ADULTOS_INSTITUCION',
  'adultos institucion': 'ADULTOS_INSTITUCION',
}

/**
 * Groups that have visibility to ALL actors
 */
const SUPERVISOR_GROUPS = [
  'jefe zonal',
  'jz',
  'director provincial',
  'director interior',
  'director',
  'admin',
  'administrador',
]

/**
 * All available actors in the system
 */
const ALL_ACTORS: ActorEnum[] = [
  'EQUIPO_TECNICO',
  'EQUIPO_LEGAL',
  'EQUIPOS_RESIDENCIALES',
  'ADULTOS_INSTITUCION',
]

export interface ActorVisibilityResult {
  /** Actors the user is allowed to see */
  allowedActors: ActorEnum[]
  /** Whether user can see all actors (supervisor/admin) */
  canSeeAllActors: boolean
  /** The user's primary actor based on their group */
  primaryActor: ActorEnum | null
  /** Actor filter to apply to API calls (null means no filter) */
  actorFilter: ActorEnum | null
  /** Check if a specific actor is allowed for this user */
  isActorAllowed: (actor: ActorEnum) => boolean
  /** User info for debugging */
  userGroups: string[]
}

/**
 * Hook to determine which actors a user can see based on their groups
 *
 * Usage:
 * ```tsx
 * const { allowedActors, actorFilter, isActorAllowed } = useActorVisibility()
 *
 * // Filter activities by actor
 * const { data } = useApiQuery(
 *   `actividades-plan/${planTrabajoId}`,
 *   { actor: actorFilter, ...otherFilters },
 *   { queryFn: () => actividadService.list(planTrabajoId, { actor: actorFilter }) }
 * )
 *
 * // Filter tabs in modal
 * const visibleActors = actors.filter(a => isActorAllowed(a.value))
 * ```
 */
export const useActorVisibility = (): ActorVisibilityResult => {
  const { user } = useUser()

  return useMemo(() => {
    // Default state for unauthenticated users
    if (!user) {
      return {
        allowedActors: [],
        canSeeAllActors: false,
        primaryActor: null,
        actorFilter: null,
        isActorAllowed: () => false,
        userGroups: [],
      }
    }

    // Get user groups (normalized to lowercase)
    const groups = user.groups || []
    const groupNames = groups.map((g) => g.name.toLowerCase())

    // Check if user is superuser/staff
    const isAdmin = user.is_superuser || user.is_staff

    // Check if user is in a supervisor group (JZ, Director)
    const isSupervisor = groupNames.some((name) =>
      SUPERVISOR_GROUPS.includes(name)
    )

    // Supervisors and admins can see all actors
    if (isAdmin || isSupervisor) {
      return {
        allowedActors: ALL_ACTORS,
        canSeeAllActors: true,
        primaryActor: null,
        actorFilter: null, // No filter = see all
        isActorAllowed: () => true,
        userGroups: groupNames,
      }
    }

    // Map user groups to actors
    const userActors = new Set<ActorEnum>()
    let primaryActor: ActorEnum | null = null

    for (const groupName of groupNames) {
      const actor = GROUP_TO_ACTOR_MAP[groupName]
      if (actor) {
        userActors.add(actor)
        // First matched actor becomes primary
        if (!primaryActor) {
          primaryActor = actor
        }
      }
    }

    // Convert to array
    const allowedActors = Array.from(userActors)

    // If user has no mapped groups, default to empty (they'll see nothing)
    // This is a safety measure - in practice, users should always have a group
    if (allowedActors.length === 0) {
      console.warn(
        `[useActorVisibility] User ${user.username} has no actor-mapped groups:`,
        groupNames
      )
      return {
        allowedActors: [],
        canSeeAllActors: false,
        primaryActor: null,
        actorFilter: null,
        isActorAllowed: () => false,
        userGroups: groupNames,
      }
    }

    // If user has exactly one actor, use it as filter
    // If user has multiple actors, don't filter (they can see all their actors)
    const actorFilter = allowedActors.length === 1 ? allowedActors[0] : null

    return {
      allowedActors,
      canSeeAllActors: false,
      primaryActor,
      actorFilter,
      isActorAllowed: (actor: ActorEnum) => allowedActors.includes(actor),
      userGroups: groupNames,
    }
  }, [user])
}

/**
 * Get allowed actors for a user without hooks (for server-side or non-React contexts)
 *
 * @param groups - User groups from session
 * @param isSuperuser - Whether user is superuser
 * @param isStaff - Whether user is staff
 * @returns Array of allowed actors
 */
export const getAllowedActorsForUser = (
  groups: Array<{ id: number; name: string }>,
  isSuperuser: boolean = false,
  isStaff: boolean = false
): ActorEnum[] => {
  const groupNames = groups.map((g) => g.name.toLowerCase())

  // Check if user is admin or supervisor
  const isAdmin = isSuperuser || isStaff
  const isSupervisor = groupNames.some((name) =>
    SUPERVISOR_GROUPS.includes(name)
  )

  if (isAdmin || isSupervisor) {
    return ALL_ACTORS
  }

  // Map groups to actors
  const userActors = new Set<ActorEnum>()
  for (const groupName of groupNames) {
    const actor = GROUP_TO_ACTOR_MAP[groupName]
    if (actor) {
      userActors.add(actor)
    }
  }

  return Array.from(userActors)
}
