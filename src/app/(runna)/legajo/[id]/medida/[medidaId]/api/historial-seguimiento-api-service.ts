/**
 * API Service for Historial de Seguimiento Unificado (PLTM-04)
 * Connects to /api/medidas/{medida_pk}/historial-seguimiento/ endpoints
 *
 * PLTM-04: Historial de Seguimiento Unificado
 * - List unified timeline events for a medida
 * - Get event types and categories
 * - Get summary statistics
 * - Export to CSV
 * - Track stage transitions
 */

import { get } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import type {
  HistorialSeguimientoResponse,
  HistorialEventoItem,
  HistorialTiposResponse,
  HistorialResumenResponse,
  HistorialSeguimientoQueryParams,
  TrazabilidadEtapasResponse,
  TrazabilidadCompactaResponse,
  TrazabilidadQueryParams,
} from "../types/historial-seguimiento-api"

// ============================================================================
// HISTORIAL DE SEGUIMIENTO - CRUD OPERATIONS
// ============================================================================

/**
 * Get historial de seguimiento of a medida (paginated list)
 * GET /api/medidas/{medida_id}/historial-seguimiento/
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Paginated response with timeline events
 */
export const getHistorialSeguimiento = async (
  medidaId: number,
  params: HistorialSeguimientoQueryParams = {}
): Promise<HistorialSeguimientoResponse> => {
  try {
    const queryParams: Record<string, string> = {}

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.tipo_evento) {
      queryParams.tipo_evento = params.tipo_evento
    }

    if (params.tipos_evento) {
      queryParams.tipos_evento = params.tipos_evento
    }

    if (params.categoria) {
      queryParams.categoria = params.categoria
    }

    if (params.etapa !== undefined) {
      queryParams.etapa = String(params.etapa)
    }

    if (params.etapa_tipo) {
      queryParams.etapa_tipo = params.etapa_tipo
    }

    if (params.usuario !== undefined) {
      queryParams.usuario = String(params.usuario)
    }

    if (params.search) {
      queryParams.search = params.search
    }

    if (params.page !== undefined) {
      queryParams.page = String(params.page)
    }

    if (params.page_size !== undefined) {
      queryParams.page_size = String(params.page_size)
    }

    console.log(`Fetching historial de seguimiento for medida ${medidaId} with params:`, queryParams)

    const response = await get<HistorialSeguimientoResponse>(
      `medidas/${medidaId}/historial-seguimiento/`,
      queryParams
    )

    console.log("Historial de seguimiento retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching historial de seguimiento for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get historial evento detail
 * GET /api/medidas/{medida_id}/historial-seguimiento/{id}/
 *
 * @param medidaId ID de la medida
 * @param eventoId ID del evento
 * @returns Evento detail
 */
export const getHistorialEventoDetail = async (
  medidaId: number,
  eventoId: number
): Promise<HistorialEventoItem> => {
  try {
    console.log(`Fetching historial evento detail: medida ${medidaId}, evento ${eventoId}`)

    const response = await get<HistorialEventoItem>(
      `medidas/${medidaId}/historial-seguimiento/${eventoId}/`
    )

    console.log("Historial evento detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching historial evento detail: medida ${medidaId}, evento ${eventoId}`,
      error
    )
    throw error
  }
}

// ============================================================================
// CATALOG AND SUMMARY ENDPOINTS
// ============================================================================

/**
 * Get available event types
 * GET /api/medidas/{medida_id}/historial-seguimiento/tipos/
 *
 * @param medidaId ID de la medida
 * @returns Available event types organized by category
 */
export const getHistorialTipos = async (
  medidaId: number
): Promise<HistorialTiposResponse> => {
  try {
    console.log(`Fetching historial tipos for medida ${medidaId}`)

    const response = await get<HistorialTiposResponse>(
      `medidas/${medidaId}/historial-seguimiento/tipos/`
    )

    console.log("Historial tipos retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching historial tipos for medida ${medidaId}:`, error)
    throw error
  }
}

/**
 * Get historial summary statistics
 * GET /api/medidas/{medida_id}/historial-seguimiento/resumen/
 *
 * @param medidaId ID de la medida
 * @returns Summary statistics
 */
export const getHistorialResumen = async (
  medidaId: number
): Promise<HistorialResumenResponse> => {
  try {
    console.log(`Fetching historial resumen for medida ${medidaId}`)

    const response = await get<HistorialResumenResponse>(
      `medidas/${medidaId}/historial-seguimiento/resumen/`
    )

    console.log("Historial resumen retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching historial resumen for medida ${medidaId}:`, error)
    throw error
  }
}

// ============================================================================
// EXPORT OPERATIONS
// ============================================================================

/**
 * Export historial de seguimiento to CSV
 * GET /api/medidas/{medida_id}/historial-seguimiento/exportar/
 *
 * @param medidaId ID de la medida
 * @param params Optional filters
 * @returns Blob with CSV content
 */
export const exportarHistorialSeguimiento = async (
  medidaId: number,
  params: HistorialSeguimientoQueryParams = {}
): Promise<Blob> => {
  try {
    console.log(`Exporting historial de seguimiento for medida ${medidaId}`)

    const queryParams: Record<string, string> = {}

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.tipo_evento) {
      queryParams.tipo_evento = params.tipo_evento
    }

    if (params.categoria) {
      queryParams.categoria = params.categoria
    }

    const response = await axiosInstance.get(
      `medidas/${medidaId}/historial-seguimiento/exportar/`,
      {
        params: queryParams,
        responseType: 'blob',
      }
    )

    console.log("Historial de seguimiento exported")

    return response.data
  } catch (error: any) {
    console.error(`Error exporting historial de seguimiento for medida ${medidaId}:`, error)
    throw error
  }
}

// ============================================================================
// TRAZABILIDAD DE ETAPAS
// ============================================================================

/**
 * Get trazabilidad de etapas (full timeline)
 * GET /api/medidas/{medida_id}/trazabilidad-etapas/
 *
 * @param medidaId ID de la medida
 * @param params Optional filters
 * @returns Full stage traceability timeline
 */
export const getTrazabilidadEtapas = async (
  medidaId: number,
  params: TrazabilidadQueryParams = {}
): Promise<TrazabilidadEtapasResponse> => {
  try {
    const queryParams: Record<string, string> = {}

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.tipo) {
      queryParams.tipo = params.tipo
    }

    console.log(`Fetching trazabilidad etapas for medida ${medidaId}`)

    const response = await get<TrazabilidadEtapasResponse>(
      `medidas/${medidaId}/trazabilidad-etapas/`,
      queryParams
    )

    console.log("Trazabilidad etapas retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching trazabilidad etapas for medida ${medidaId}:`, error)
    throw error
  }
}

/**
 * Get trazabilidad de etapas (compact view for UI)
 * GET /api/medidas/{medida_id}/trazabilidad-etapas/compacta/
 *
 * @param medidaId ID de la medida
 * @returns Compact stage traceability for UI stepper
 */
export const getTrazabilidadCompacta = async (
  medidaId: number
): Promise<TrazabilidadCompactaResponse> => {
  try {
    console.log(`Fetching trazabilidad compacta for medida ${medidaId}`)

    const response = await get<TrazabilidadCompactaResponse>(
      `medidas/${medidaId}/trazabilidad-etapas/compacta/`
    )

    console.log("Trazabilidad compacta retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching trazabilidad compacta for medida ${medidaId}:`, error)
    throw error
  }
}

/**
 * Export trazabilidad de etapas to CSV
 * GET /api/medidas/{medida_id}/trazabilidad-etapas/exportar/
 *
 * @param medidaId ID de la medida
 * @returns Blob with CSV content
 */
export const exportarTrazabilidad = async (
  medidaId: number
): Promise<Blob> => {
  try {
    console.log(`Exporting trazabilidad for medida ${medidaId}`)

    const response = await axiosInstance.get(
      `medidas/${medidaId}/trazabilidad-etapas/exportar/`,
      {
        responseType: 'blob',
      }
    )

    console.log("Trazabilidad exported")

    return response.data
  } catch (error: any) {
    console.error(`Error exporting trazabilidad for medida ${medidaId}:`, error)
    throw error
  }
}

// ============================================================================
// ADMIN - GLOBAL HISTORIAL
// ============================================================================

/**
 * Get global historial (admin only)
 * GET /api/historial-seguimiento-global/
 *
 * @param params Query parameters para filtrar
 * @returns Paginated response with all medidas events
 */
export const getHistorialGlobal = async (
  params: HistorialSeguimientoQueryParams = {}
): Promise<HistorialSeguimientoResponse> => {
  try {
    const queryParams: Record<string, string> = {}

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.tipo_evento) {
      queryParams.tipo_evento = params.tipo_evento
    }

    if (params.categoria) {
      queryParams.categoria = params.categoria
    }

    if (params.search) {
      queryParams.search = params.search
    }

    if (params.page !== undefined) {
      queryParams.page = String(params.page)
    }

    if (params.page_size !== undefined) {
      queryParams.page_size = String(params.page_size)
    }

    console.log('Fetching historial global with params:', queryParams)

    const response = await get<HistorialSeguimientoResponse>(
      'historial-seguimiento-global/',
      queryParams
    )

    console.log("Historial global retrieved:", response)

    return response
  } catch (error: any) {
    console.error('Error fetching historial global:', error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Trigger CSV download in browser
 * @param blob CSV blob
 * @param filename Filename for download
 */
export const downloadCsvBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Export historial and trigger download
 * @param medidaId ID de la medida
 * @param numeroMedida Número de medida for filename
 * @param params Optional filters
 */
export const exportarYDescargarHistorial = async (
  medidaId: number,
  numeroMedida: string,
  params: HistorialSeguimientoQueryParams = {}
): Promise<void> => {
  const blob = await exportarHistorialSeguimiento(medidaId, params)
  const filename = `historial_seguimiento_${numeroMedida.replace(/[/\\]/g, '_')}.csv`
  downloadCsvBlob(blob, filename)
}

/**
 * Export trazabilidad and trigger download
 * @param medidaId ID de la medida
 * @param numeroMedida Número de medida for filename
 */
export const exportarYDescargarTrazabilidad = async (
  medidaId: number,
  numeroMedida: string
): Promise<void> => {
  const blob = await exportarTrazabilidad(medidaId)
  const filename = `trazabilidad_etapas_${numeroMedida.replace(/[/\\]/g, '_')}.csv`
  downloadCsvBlob(blob, filename)
}
