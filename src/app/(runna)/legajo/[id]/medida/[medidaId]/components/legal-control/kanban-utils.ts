// Utility functions for Legal Control Kanban component
// Categorizes EQUIPO_LEGAL activities based on deadline status

import type { TActividadPlanTrabajo } from '../../types/actividades'

// Column types for the Kanban
export type KanbanColumnType = 'PENDIENTE_REVISION' | 'PROXIMO_VENCER' | 'VENCIDO'

// Column configuration
export interface KanbanColumnConfig {
  id: KanbanColumnType
  label: string
  color: string
  bgColor: string
  borderColor: string
  iconName: 'PendingActions' | 'WarningAmber' | 'ErrorOutline'
  emptyMessage: string
}

// Column configurations
export const KANBAN_COLUMNS: Record<KanbanColumnType, KanbanColumnConfig> = {
  PENDIENTE_REVISION: {
    id: 'PENDIENTE_REVISION',
    label: 'Pendiente de Revisión',
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.08)',
    borderColor: 'rgba(33, 150, 243, 0.3)',
    iconName: 'PendingActions',
    emptyMessage: 'No hay informes pendientes de revisión'
  },
  PROXIMO_VENCER: {
    id: 'PROXIMO_VENCER',
    label: 'Próximo a Vencer',
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.08)',
    borderColor: 'rgba(255, 152, 0, 0.3)',
    iconName: 'WarningAmber',
    emptyMessage: 'No hay informes próximos a vencer'
  },
  VENCIDO: {
    id: 'VENCIDO',
    label: 'Vencido',
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.08)',
    borderColor: 'rgba(244, 67, 54, 0.3)',
    iconName: 'ErrorOutline',
    emptyMessage: 'No hay informes vencidos'
  }
}

// States to exclude (completed or cancelled)
const EXCLUDED_STATES = ['VISADO_APROBADO', 'CANCELADA']

export interface CategorizedActividades {
  pendienteRevision: TActividadPlanTrabajo[]
  proximoVencer: TActividadPlanTrabajo[]
  vencido: TActividadPlanTrabajo[]
}

/**
 * Filter activities to only include EQUIPO_LEGAL activities
 * Excludes completed (VISADO_APROBADO) or cancelled activities
 */
export function filterLegalReviewActivities(
  actividades: TActividadPlanTrabajo[]
): TActividadPlanTrabajo[] {
  return actividades.filter(
    (actividad) =>
      actividad.actor === 'EQUIPO_LEGAL' &&
      !EXCLUDED_STATES.includes(actividad.estado)
  )
}

/**
 * Categorize EQUIPO_LEGAL activities into Kanban columns based on deadline status
 *
 * Columns (Mutually Exclusive):
 * - Pendiente de Revisión: !esta_vencida && dias_restantes > 7
 * - Próximo a Vencer: !esta_vencida && dias_restantes <= 7
 * - Vencido: esta_vencida === true
 */
export function categorizeActividades(
  actividades: TActividadPlanTrabajo[]
): CategorizedActividades {
  // First filter to only EQUIPO_LEGAL activities awaiting review
  const legalActividades = filterLegalReviewActivities(actividades)

  const result: CategorizedActividades = {
    pendienteRevision: [],
    proximoVencer: [],
    vencido: []
  }

  for (const actividad of legalActividades) {
    if (actividad.esta_vencida) {
      // Vencido: already overdue
      result.vencido.push(actividad)
    } else if (actividad.dias_restantes <= 7) {
      // Próximo a Vencer: 7 days or less remaining
      result.proximoVencer.push(actividad)
    } else {
      // Pendiente de Revisión: more than 7 days remaining
      result.pendienteRevision.push(actividad)
    }
  }

  // Sort each category by dias_restantes (most urgent first)
  result.pendienteRevision.sort((a, b) => a.dias_restantes - b.dias_restantes)
  result.proximoVencer.sort((a, b) => a.dias_restantes - b.dias_restantes)
  result.vencido.sort((a, b) => a.dias_restantes - b.dias_restantes)

  return result
}

/**
 * Get statistics for the Kanban board
 */
export function getKanbanStats(categorized: CategorizedActividades) {
  return {
    total:
      categorized.pendienteRevision.length +
      categorized.proximoVencer.length +
      categorized.vencido.length,
    pendienteRevision: categorized.pendienteRevision.length,
    proximoVencer: categorized.proximoVencer.length,
    vencido: categorized.vencido.length
  }
}
