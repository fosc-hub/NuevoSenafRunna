/**
 * Unified Workflow API Facade
 *
 * Provides standardized interface for all document types using adapter pattern.
 * Wraps existing API services without modifying them.
 *
 * Supported document types:
 * - Intervenciones
 * - Nota de Aval
 * - Informe Jurídico
 * - Ratificación Judicial
 */

import type { WorkflowApiService, WorkflowItem } from "../types/workflow"

// Import existing API services
import {
  createIntervencion,
  getIntervencionesByMedida,
  getIntervencionDetail,
  updateIntervencion,
  deleteIntervencion,
  enviarIntervencion,
  aprobarIntervencion,
  rechazarIntervencion,
  uploadAdjunto as uploadIntervencionAdjunto,
  getAdjuntos as getIntervencionAdjuntos,
  deleteAdjunto as deleteIntervencionAdjunto,
} from "./intervenciones-api-service"

import {
  createNotaAval,
  getNotasAvalByMedida,
  getNotaAvalDetail,
} from "./nota-aval-api-service"

import {
  createInformeJuridico,
  getInformesJuridicosByMedida,
  getInformeJuridicoDetail,
  updateInformeJuridico,
  enviarInformeJuridico,
} from "./informe-juridico-api-service"

import {
  createRatificacionJudicial,
  getRatificacionJudicial,
  getHistorialRatificaciones,
} from "./ratificacion-judicial-api-service"

// ============================================================================
// INTERVENCION API ADAPTER
// ============================================================================

export const intervencionApiAdapter: WorkflowApiService = {
  // Read Operations
  getList: async (medidaId, params = {}) => {
    const intervenciones = await getIntervencionesByMedida(medidaId, params)
    return intervenciones as WorkflowItem[]
  },

  getDetail: async (medidaId, itemId) => {
    const intervencion = await getIntervencionDetail(medidaId, itemId)
    return intervencion as WorkflowItem
  },

  // Write Operations
  create: async (medidaId, data) => {
    const intervencion = await createIntervencion(medidaId, data)
    return intervencion as WorkflowItem
  },

  update: async (medidaId, itemId, data) => {
    const intervencion = await updateIntervencion(medidaId, itemId, data)
    return intervencion as WorkflowItem
  },

  delete: async (medidaId, itemId) => {
    await deleteIntervencion(medidaId, itemId)
  },

  // State Transitions
  stateActions: {
    enviar: async (medidaId, itemId) => {
      const result = await enviarIntervencion(medidaId, itemId)
      return result.intervencion as WorkflowItem
    },

    aprobar: async (medidaId, itemId) => {
      const result = await aprobarIntervencion(medidaId, itemId)
      return result.intervencion as WorkflowItem
    },

    rechazar: async (medidaId, itemId, reason) => {
      const observaciones = typeof reason === 'string' ? { observaciones_jz: reason } : reason
      const result = await rechazarIntervencion(medidaId, itemId, observaciones)
      return result.intervencion as WorkflowItem
    },
  },

  // File Management
  uploadFile: async (medidaId, itemId, file, type = 'MODELO') => {
    return await uploadIntervencionAdjunto(medidaId, itemId, file, type)
  },

  getFiles: async (medidaId, itemId) => {
    return await getIntervencionAdjuntos(medidaId, itemId)
  },

  deleteFile: async (medidaId, itemId, fileId) => {
    await deleteIntervencionAdjunto(medidaId, itemId, fileId)
  },

  // Helpers
  getLatest: async (medidaId) => {
    const items = await getIntervencionesByMedida(medidaId, {
      ordering: '-fecha_creacion',
      limit: 1,
    })
    return items.length > 0 ? (items[0] as WorkflowItem) : null
  },

  hasItems: async (medidaId) => {
    const items = await getIntervencionesByMedida(medidaId, { limit: 1 })
    return items.length > 0
  },
}

// ============================================================================
// NOTA AVAL API ADAPTER
// ============================================================================

export const notaAvalApiAdapter: WorkflowApiService = {
  // Read Operations
  getList: async (medidaId, params = {}) => {
    const notas = await getNotasAvalByMedida(medidaId, params)
    return notas as WorkflowItem[]
  },

  getDetail: async (medidaId, itemId) => {
    const nota = await getNotaAvalDetail(medidaId, itemId)
    return nota as WorkflowItem
  },

  // Write Operations
  create: async (medidaId, data) => {
    const nota = await createNotaAval(medidaId, data)
    return nota as WorkflowItem
  },

  // Note: Nota Aval is immutable after creation - no update or delete

  // Helpers
  getLatest: async (medidaId) => {
    const items = await getNotasAvalByMedida(medidaId, {
      ordering: '-fecha_emision',
      limit: 1,
    })
    return items.length > 0 ? (items[0] as WorkflowItem) : null
  },

  hasItems: async (medidaId) => {
    const items = await getNotasAvalByMedida(medidaId, { limit: 1 })
    return items.length > 0
  },
}

// ============================================================================
// INFORME JURIDICO API ADAPTER
// ============================================================================

export const informeJuridicoApiAdapter: WorkflowApiService = {
  // Read Operations
  getList: async (medidaId, params = {}) => {
    const informes = await getInformesJuridicosByMedida(medidaId, params)
    return informes as WorkflowItem[]
  },

  getDetail: async (medidaId, itemId) => {
    const informe = await getInformeJuridicoDetail(medidaId, itemId)
    return informe as WorkflowItem
  },

  // Write Operations
  create: async (medidaId, data) => {
    const informe = await createInformeJuridico(medidaId, data)
    return informe as WorkflowItem
  },

  update: async (medidaId, itemId, data) => {
    const informe = await updateInformeJuridico(medidaId, itemId, data)
    return informe as WorkflowItem
  },

  // Note: Informe Jurídico cannot be deleted

  // State Transitions
  stateActions: {
    enviar: async (medidaId, itemId) => {
      const informe = await enviarInformeJuridico(medidaId, itemId)
      return informe as WorkflowItem
    },
  },

  // File Management handled through informe-juridico-api-service directly

  // Helpers
  getLatest: async (medidaId) => {
    const items = await getInformesJuridicosByMedida(medidaId, {
      ordering: '-fecha_creacion',
      limit: 1,
    })
    return items.length > 0 ? (items[0] as WorkflowItem) : null
  },

  hasItems: async (medidaId) => {
    const items = await getInformesJuridicosByMedida(medidaId, { limit: 1 })
    return items.length > 0
  },
}

// ============================================================================
// RATIFICACION JUDICIAL API ADAPTER
// ============================================================================

export const ratificacionApiAdapter: WorkflowApiService = {
  // Read Operations
  getList: async (medidaId, params = {}) => {
    // Ratificación returns single item or history
    try {
      const historial = await getHistorialRatificaciones(medidaId)
      return historial as WorkflowItem[]
    } catch (error) {
      // If no history endpoint, try single ratificacion
      try {
        const ratificacion = await getRatificacionJudicial(medidaId)
        return ratificacion ? [ratificacion as WorkflowItem] : []
      } catch {
        return []
      }
    }
  },

  getDetail: async (medidaId, itemId) => {
    // For ratificacion, itemId might not be used if there's only one per medida
    const ratificacion = await getRatificacionJudicial(medidaId)
    return ratificacion as WorkflowItem
  },

  // Write Operations
  create: async (medidaId, data) => {
    const ratificacion = await createRatificacionJudicial(medidaId, data)
    return ratificacion as WorkflowItem
  },

  // Note: Ratificación is read-only after creation - no update or delete

  // Helpers
  getLatest: async (medidaId) => {
    try {
      const ratificacion = await getRatificacionJudicial(medidaId)
      return ratificacion ? (ratificacion as WorkflowItem) : null
    } catch {
      return null
    }
  },

  hasItems: async (medidaId) => {
    try {
      const ratificacion = await getRatificacionJudicial(medidaId)
      return !!ratificacion
    } catch {
      return false
    }
  },
}

// ============================================================================
// ADAPTER REGISTRY
// ============================================================================

/**
 * Get the appropriate API adapter for a section type
 */
export function getApiAdapter(sectionType: string): WorkflowApiService {
  switch (sectionType) {
    case 'intervencion':
      return intervencionApiAdapter
    case 'nota-aval':
      return notaAvalApiAdapter
    case 'informe-juridico':
      return informeJuridicoApiAdapter
    case 'ratificacion':
      return ratificacionApiAdapter
    default:
      throw new Error(`Unknown section type: ${sectionType}`)
  }
}
