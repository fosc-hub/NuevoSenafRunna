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
 *
 * OPTIMIZATION: For read operations, prefer using the unified etapa detail endpoint:
 * GET /api/medidas/{id}/etapa/{tipo_etapa}/
 *
 * This endpoint returns all documents in one call:
 * - documentos.intervenciones
 * - documentos.notas_aval
 * - documentos.informes_juridicos
 * - documentos.ratificaciones
 *
 * Use the useEtapaDetail hook or getEtapaDetail API function for optimized reads.
 * Use these adapters for write operations (create, update, delete, state transitions).
 */

import type { WorkflowApiService, WorkflowItem } from "../types/workflow"
import type { EtapaDocumentos } from "./etapa-detail-api-service"
import type { IntervencionResponse } from "../types/intervencion-api"
import type { NotaAvalBasicResponse } from "../types/nota-aval-api"
import type { InformeJuridicoBasicResponse } from "../types/informe-juridico-api"
import type { RatificacionJudicial } from "../types/ratificacion-judicial-api"

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
  createRatificacion as createRatificacionJudicial,
  getRatificacion as getRatificacionJudicial,
  getRatificacionHistorial as getHistorialRatificaciones,
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
      const observaciones = typeof reason === 'string' ? { observaciones: reason } : reason
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

// ============================================================================
// UNIFIED ETAPA DATA HELPERS
// ============================================================================

/**
 * Extract documents from unified etapa detail response
 *
 * Usage:
 * ```tsx
 * const { etapaDetail } = useEtapaDetail(medidaId, 'APERTURA')
 * const { intervenciones, notasAval, informesJuridicos, ratificaciones } =
 *   extractDocumentsFromEtapa(etapaDetail?.etapa.documentos)
 * ```
 */
export function extractDocumentsFromEtapa(documentos: EtapaDocumentos | null | undefined) {
  return {
    intervenciones: documentos?.intervenciones ?? [],
    notasAval: documentos?.notas_aval ?? [],
    informesJuridicos: documentos?.informes_juridicos ?? [],
    ratificaciones: documentos?.ratificaciones ?? [],
  }
}

/**
 * Get latest document from array (sorted by date descending)
 */
export function getLatestFromArray<T extends { fecha_creacion?: string; fecha_emision?: string; fecha_registro?: string }>(
  items: T[],
  dateField: 'fecha_creacion' | 'fecha_emision' | 'fecha_registro' = 'fecha_creacion'
): T | null {
  if (!items || items.length === 0) return null

  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0).getTime()
    const dateB = new Date(b[dateField] || 0).getTime()
    return dateB - dateA
  })[0]
}

/**
 * Get latest intervencion from etapa documents
 */
export function getLatestIntervencion(documentos: EtapaDocumentos | null | undefined): IntervencionResponse | null {
  return getLatestFromArray(documentos?.intervenciones ?? [], 'fecha_creacion')
}

/**
 * Get latest nota de aval from etapa documents
 */
export function getLatestNotaAval(documentos: EtapaDocumentos | null | undefined): NotaAvalBasicResponse | null {
  return getLatestFromArray(documentos?.notas_aval ?? [], 'fecha_emision')
}

/**
 * Get latest informe juridico from etapa documents
 */
export function getLatestInformeJuridico(documentos: EtapaDocumentos | null | undefined): InformeJuridicoBasicResponse | null {
  return getLatestFromArray(documentos?.informes_juridicos ?? [], 'fecha_creacion')
}

/**
 * Get latest ratificacion from etapa documents
 */
export function getLatestRatificacion(documentos: EtapaDocumentos | null | undefined): RatificacionJudicial | null {
  return getLatestFromArray(documentos?.ratificaciones ?? [], 'fecha_registro')
}

/**
 * Check document presence in etapa
 */
export function checkDocumentPresence(documentos: EtapaDocumentos | null | undefined) {
  return {
    hasIntervenciones: (documentos?.intervenciones?.length ?? 0) > 0,
    hasNotasAval: (documentos?.notas_aval?.length ?? 0) > 0,
    hasInformesJuridicos: (documentos?.informes_juridicos?.length ?? 0) > 0,
    hasRatificaciones: (documentos?.ratificaciones?.length ?? 0) > 0,
    totalDocuments:
      (documentos?.intervenciones?.length ?? 0) +
      (documentos?.notas_aval?.length ?? 0) +
      (documentos?.informes_juridicos?.length ?? 0) +
      (documentos?.ratificaciones?.length ?? 0),
  }
}

// ============================================================================
// OPTIMIZED READ ADAPTERS (using pre-fetched etapa data)
// ============================================================================

/**
 * Create a read-only adapter that uses pre-fetched etapa data
 * instead of making separate API calls.
 *
 * Write operations still use the original API services.
 *
 * Usage:
 * ```tsx
 * const { etapaDetail } = useEtapaDetail(medidaId, 'APERTURA')
 * const adapter = createOptimizedNotaAvalAdapter(etapaDetail?.etapa.documentos)
 *
 * // Read operations use cached data (no API call)
 * const latest = await adapter.getLatest(medidaId) // Returns from cache
 *
 * // Write operations still make API calls
 * await adapter.create(medidaId, data) // Makes POST request
 * ```
 */
export function createOptimizedNotaAvalAdapter(
  documentos: EtapaDocumentos | null | undefined
): WorkflowApiService {
  const cachedNotasAval = documentos?.notas_aval ?? []

  return {
    // Read Operations - Use cached data
    getList: async () => cachedNotasAval as WorkflowItem[],

    getDetail: async (medidaId, itemId) => {
      // Try to find in cache first
      const cached = cachedNotasAval.find((n) => n.id === itemId)
      if (cached) return cached as WorkflowItem

      // Fallback to API if not in cache
      const nota = await getNotaAvalDetail(medidaId, itemId)
      return nota as WorkflowItem
    },

    // Write Operations - Use original API
    create: async (medidaId, data) => {
      const nota = await createNotaAval(medidaId, data)
      return nota as WorkflowItem
    },

    // Helpers - Use cached data
    getLatest: async () => {
      const latest = getLatestNotaAval(documentos)
      return latest ? (latest as WorkflowItem) : null
    },

    hasItems: async () => cachedNotasAval.length > 0,
  }
}

/**
 * Create optimized informe juridico adapter using pre-fetched etapa data
 */
export function createOptimizedInformeJuridicoAdapter(
  documentos: EtapaDocumentos | null | undefined
): WorkflowApiService {
  const cachedInformes = documentos?.informes_juridicos ?? []

  return {
    // Read Operations - Use cached data
    getList: async () => cachedInformes as WorkflowItem[],

    getDetail: async (medidaId, itemId) => {
      const cached = cachedInformes.find((i) => i.id === itemId)
      if (cached) return cached as WorkflowItem

      const informe = await getInformeJuridicoDetail(medidaId, itemId)
      return informe as WorkflowItem
    },

    // Write Operations - Use original API
    create: async (medidaId, data) => {
      const informe = await createInformeJuridico(medidaId, data)
      return informe as WorkflowItem
    },

    update: async (medidaId, itemId, data) => {
      const informe = await updateInformeJuridico(medidaId, itemId, data)
      return informe as WorkflowItem
    },

    stateActions: {
      enviar: async (medidaId) => {
        const informe = await enviarInformeJuridico(medidaId)
        return informe as WorkflowItem
      },
    },

    // Helpers - Use cached data
    getLatest: async () => {
      const latest = getLatestInformeJuridico(documentos)
      return latest ? (latest as WorkflowItem) : null
    },

    hasItems: async () => cachedInformes.length > 0,
  }
}

/**
 * Create optimized ratificacion adapter using pre-fetched etapa data
 */
export function createOptimizedRatificacionAdapter(
  documentos: EtapaDocumentos | null | undefined
): WorkflowApiService {
  const cachedRatificaciones = documentos?.ratificaciones ?? []

  return {
    // Read Operations - Use cached data
    getList: async () => cachedRatificaciones as WorkflowItem[],

    getDetail: async () => {
      const latest = getLatestRatificacion(documentos)
      return latest ? (latest as WorkflowItem) : ({} as WorkflowItem)
    },

    // Write Operations - Use original API
    create: async (medidaId, data) => {
      const ratificacion = await createRatificacionJudicial(medidaId, data)
      return ratificacion as WorkflowItem
    },

    // Helpers - Use cached data
    getLatest: async () => {
      const latest = getLatestRatificacion(documentos)
      return latest ? (latest as WorkflowItem) : null
    },

    hasItems: async () => cachedRatificaciones.length > 0,
  }
}

/**
 * Create optimized intervencion adapter using pre-fetched etapa data
 */
export function createOptimizedIntervencionAdapter(
  documentos: EtapaDocumentos | null | undefined
): WorkflowApiService {
  const cachedIntervenciones = documentos?.intervenciones ?? []

  return {
    // Read Operations - Use cached data
    getList: async () => cachedIntervenciones as WorkflowItem[],

    getDetail: async (medidaId, itemId) => {
      const cached = cachedIntervenciones.find((i) => i.id === itemId)
      if (cached) return cached as WorkflowItem

      const intervencion = await getIntervencionDetail(medidaId, itemId)
      return intervencion as WorkflowItem
    },

    // Write Operations - Use original API
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
        const observaciones =
          typeof reason === 'string' ? { observaciones: reason } : reason
        const result = await rechazarIntervencion(medidaId, itemId, observaciones)
        return result.intervencion as WorkflowItem
      },
    },

    uploadFile: async (medidaId, itemId, file, type = 'MODELO') => {
      return await uploadIntervencionAdjunto(medidaId, itemId, file, type)
    },

    getFiles: async (medidaId, itemId) => {
      return await getIntervencionAdjuntos(medidaId, itemId)
    },

    deleteFile: async (medidaId, itemId, fileId) => {
      await deleteIntervencionAdjunto(medidaId, itemId, fileId)
    },

    // Helpers - Use cached data
    getLatest: async () => {
      const latest = getLatestIntervencion(documentos)
      return latest ? (latest as WorkflowItem) : null
    },

    hasItems: async () => cachedIntervenciones.length > 0,
  }
}

/**
 * Get optimized API adapter using pre-fetched etapa data
 *
 * Usage:
 * ```tsx
 * const { etapaDetail } = useEtapaDetail(medidaId, 'APERTURA')
 * const adapter = getOptimizedApiAdapter('nota-aval', etapaDetail?.etapa.documentos)
 * ```
 */
export function getOptimizedApiAdapter(
  sectionType: string,
  documentos: EtapaDocumentos | null | undefined
): WorkflowApiService {
  switch (sectionType) {
    case 'intervencion':
      return createOptimizedIntervencionAdapter(documentos)
    case 'nota-aval':
      return createOptimizedNotaAvalAdapter(documentos)
    case 'informe-juridico':
      return createOptimizedInformeJuridicoAdapter(documentos)
    case 'ratificacion':
      return createOptimizedRatificacionAdapter(documentos)
    default:
      throw new Error(`Unknown section type: ${sectionType}`)
  }
}
