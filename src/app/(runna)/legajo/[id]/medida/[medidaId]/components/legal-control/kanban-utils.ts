// Utility functions for Legal Control Kanban component
// Categorizes EQUIPO_LEGAL activities based on deadline status

import type { TActividadPlanTrabajo } from '../../types/actividades'

// Column types for the Kanban
export type KanbanColumnType = 'PENDIENTE_REVISION' | 'PROXIMO_VENCER' | 'VENCIDO' | 'FINALIZADO'

// Column configuration
export interface KanbanColumnConfig {
  id: KanbanColumnType
  label: string
  color: string
  bgColor: string
  borderColor: string
  iconName: 'PendingActions' | 'WarningAmber' | 'ErrorOutline' | 'CheckCircleOutline'
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
  },
  FINALIZADO: {
    id: 'FINALIZADO',
    label: 'Finalizados',
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.08)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    iconName: 'CheckCircleOutline',
    emptyMessage: 'No hay informes finalizados'
  }
}

// Estados terminales que se muestran en la columna "Finalizados"
const FINALIZED_STATES = ['VISADO_APROBADO', 'COMPLETADA']

// Estados que se ocultan del kanban (canceladas no son "finalizadas")
const EXCLUDED_STATES = ['CANCELADA']

export interface CategorizedActividades {
  pendienteRevision: TActividadPlanTrabajo[]
  proximoVencer: TActividadPlanTrabajo[]
  vencido: TActividadPlanTrabajo[]
  finalizado: TActividadPlanTrabajo[]
}

/**
 * Filter activities to only include EQUIPO_LEGAL activities.
 * Excludes only cancelled activities; las finalizadas (VISADO_APROBADO /
 * COMPLETADA) se conservan para mostrarse en la columna "Finalizados".
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
 * Categorize EQUIPO_LEGAL activities into Kanban columns.
 *
 * Columns (Mutually Exclusive):
 * - Finalizados: estado VISADO_APROBADO o COMPLETADA
 * - Pendiente de Revisión: activa, !esta_vencida && dias_restantes > 7
 * - Próximo a Vencer: activa, !esta_vencida && dias_restantes <= 7
 * - Vencido: activa, esta_vencida === true
 */
export function categorizeActividades(
  actividades: TActividadPlanTrabajo[]
): CategorizedActividades {
  // First filter to only EQUIPO_LEGAL activities (active + finalized)
  const legalActividades = filterLegalReviewActivities(actividades)

  const result: CategorizedActividades = {
    pendienteRevision: [],
    proximoVencer: [],
    vencido: [],
    finalizado: []
  }

  for (const actividad of legalActividades) {
    if (FINALIZED_STATES.includes(actividad.estado)) {
      // Finalizados: terminal aprobado/completado
      result.finalizado.push(actividad)
    } else if (actividad.esta_vencida) {
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
  // Finalizados: más recientes primero (fecha de finalización/visado)
  result.finalizado.sort(
    (a, b) =>
      new Date(b.fecha_finalizacion_real || b.fecha_visado || b.fecha_modificacion).getTime() -
      new Date(a.fecha_finalizacion_real || a.fecha_visado || a.fecha_modificacion).getTime()
  )

  return result
}

/**
 * Get statistics for the Kanban board.
 * `total` cuenta sólo las activas (pendientes de gestión); `finalizado` se
 * reporta por separado para no inflar el contador de "pendientes" del header.
 */
export function getKanbanStats(categorized: CategorizedActividades) {
  return {
    total:
      categorized.pendienteRevision.length +
      categorized.proximoVencer.length +
      categorized.vencido.length,
    pendienteRevision: categorized.pendienteRevision.length,
    proximoVencer: categorized.proximoVencer.length,
    vencido: categorized.vencido.length,
    finalizado: categorized.finalizado.length
  }
}
