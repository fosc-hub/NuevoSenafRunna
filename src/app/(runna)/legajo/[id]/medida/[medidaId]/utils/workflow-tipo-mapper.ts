/**
 * Workflow Phase to TipoEtapa Mapper - MED-01 V2
 *
 * Maps frontend workflow phase strings to backend TipoEtapa enum values.
 *
 * Usage:
 * - Converts lowercase workflow phase ('apertura', 'innovacion', etc.)
 * - To uppercase TipoEtapa enum ('APERTURA', 'INNOVACION', etc.)
 * - Used when fetching estados catalog from API
 */

import type { TipoEtapa } from '../types/estado-etapa'
import type { WorkflowPhase } from '../types/workflow'

/**
 * Convert workflow phase to TipoEtapa enum
 *
 * @param phase - Workflow phase string (lowercase)
 * @returns TipoEtapa enum value (uppercase)
 *
 * @example
 * workflowPhaseToTipoEtapa('apertura') // => 'APERTURA'
 * workflowPhaseToTipoEtapa('innovacion') // => 'INNOVACION'
 */
export function workflowPhaseToTipoEtapa(phase: WorkflowPhase): TipoEtapa {
  const map: Record<WorkflowPhase, TipoEtapa> = {
    apertura: 'APERTURA',
    innovacion: 'INNOVACION',
    prorroga: 'PRORROGA',
    cese: 'CESE',
  }

  return map[phase]
}

/**
 * Convert TipoEtapa enum to workflow phase string
 *
 * @param tipoEtapa - TipoEtapa enum value (uppercase)
 * @returns Workflow phase string (lowercase) or null if not mappable
 *
 * @example
 * tipoEtapaToWorkflowPhase('APERTURA') // => 'apertura'
 * tipoEtapaToWorkflowPhase('POST_CESE') // => null
 */
export function tipoEtapaToWorkflowPhase(tipoEtapa: TipoEtapa): WorkflowPhase | null {
  const reverseMap: Partial<Record<TipoEtapa, WorkflowPhase>> = {
    APERTURA: 'apertura',
    INNOVACION: 'innovacion',
    PRORROGA: 'prorroga',
    CESE: 'cese',
  }

  return reverseMap[tipoEtapa] || null
}
