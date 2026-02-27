/**
 * RUNNA Notification & Highlight Utils
 * Centralized logic for row highlighting and notification bell alerts.
 */

/**
 * Normalizes a string for robust keyword matching (removes accents, uppercase, trim)
 */
export const normalizeState = (str: any): string =>
    String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim()

/**
 * Checks if any state in the list contains the given keyword
 */
export const hasKeyword = (states: string[], keyword: string): boolean => {
    const normalizedKeyword = normalizeState(keyword)
    return states.some((s) => normalizeState(s).includes(normalizedKeyword))
}

/**
 * Checks if a Legajo should be highlighted in the table
 */
export interface UserPermissions {
    isDirector: boolean
    isLegales: boolean
    isEquipoTecnico: boolean
    isJefeZonal: boolean
    isAdmin: boolean
    userId?: number
}

export const shouldHighlightLegajo = (
    allStates: string[],
    permissions: UserPermissions
): boolean => {
    // Director rules
    if (permissions.isDirector || permissions.isAdmin) {
        if (hasKeyword(allStates, "NOTA_AVAL") || hasKeyword(allStates, "PENDIENTE_NOTA_AVAL")) {
            return true
        }
    }

    // Legal rules
    if (permissions.isLegales || permissions.isAdmin) {
        if (
            hasKeyword(allStates, "JURIDICO") ||
            hasKeyword(allStates, "LEGAL") ||
            hasKeyword(allStates, "RATIFICACION") ||
            hasKeyword(allStates, "PENDIENTE_VISADO")
        ) {
            return true
        }
    }

    return false
}

/**
 * Determines if an activity should trigger a notification in the Navbar
 */
export const shouldNotifyActivity = (
    actividad: any,
    permissions: UserPermissions
): boolean => {
    const estado = actividad.estado
    const isAssigned =
        actividad.responsable_principal === permissions.userId ||
        actividad.responsables_secundarios?.includes(permissions.userId as number)

    // 1. Técnico: Assigned and pending
    if (isAssigned && (estado === "PENDIENTE" || estado === "EN_PROGRESO")) {
        return true
    }

    // 2. Jefe Zonal: Pending JZ approval
    if (permissions.isJefeZonal && estado === "PENDIENTE_VISADO_JZ") {
        return true
    }

    // 3. Director: Also sees JZ pending tasks (as requested: "Actividades en PENDIENTE_VISADO_JZ")
    if (permissions.isDirector && estado === "PENDIENTE_VISADO_JZ") {
        return true
    }

    // 4. Legal: Pending Legal approval (visado)
    if (permissions.isLegales && estado === "PENDIENTE_VISADO") {
        return true
    }

    return false
}

/**
 * Determines if a Measure (medida) should trigger a notification in the Navbar
 * (These are "Virtual Activities" because they aren't in the activity list from backend)
 */
export const shouldNotifyMedida = (
    medida: any,
    permissions: UserPermissions
): boolean => {
    const estadoEtapa = medida.etapa_actual?.estado || ""

    // For measures, we usually check the etapa_actual state
    if (permissions.isLegales || permissions.isAdmin) {
        if (estadoEtapa === "PENDIENTE_INFORME_JURIDICO" || estadoEtapa === "PENDIENTE_RATIFICACION_JUDICIAL") {
            return true
        }
    }

    if (permissions.isDirector || permissions.isAdmin) {
        if (estadoEtapa === "PENDIENTE_NOTA_AVAL") {
            return true
        }
    }

    return false
}
