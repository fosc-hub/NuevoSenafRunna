/**
 * API Service for Etapa Detail Endpoint
 * Connects to /api/medidas/{id}/etapa/{tipo_etapa}/ endpoint
 *
 * Purpose: Fetch detailed information for a specific etapa with ALL its related documents
 * (interventions, notas de aval, informes juridicos, ratificaciones)
 *
 * This endpoint returns etapa-specific data, ensuring proper separation between
 * Apertura, Innovación, Prórroga, and Cese tabs.
 *
 * Solution for: Each tab should show ONLY documents from its specific etapa.
 */

import { get } from '@/app/api/apiService'
import type { TipoEtapa, TEstadoEtapaMedida, TipoMedidaCodigo } from '../types/estado-etapa'
import type { IntervencionResponse } from '../types/intervencion-api'
import type { NotaAvalBasicResponse } from '../types/nota-aval-api'
import type { InformeJuridicoBasicResponse } from '../types/informe-juridico-api'
import type { RatificacionJudicial } from '../types/ratificacion-judicial-api'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Medida basic information from etapa detail response
 */
export interface EtapaMedidaBasicInfo {
  id: number
  numero_medida: string
  tipo_medida: TipoMedidaCodigo
}

/**
 * Current estado information for the etapa
 */
export interface EstadoActualInfo {
  /** Estado code (e.g., "PENDIENTE_NOTA_AVAL") */
  codigo: string
  /** Sequential order (1-5) */
  orden: number
  /** Display name (e.g., "Pendiente Nota de Aval") */
  nombre_display: string
  /** Responsible role type */
  responsable_tipo: string
  /** Full estado catalog entry (optional) */
  estado_detalle?: TEstadoEtapaMedida
}

/**
 * Documents belonging to a specific etapa
 */
export interface EtapaDocumentos {
  /** Interventions for this etapa only */
  intervenciones: IntervencionResponse[]
  /** Notas de aval for this etapa only */
  notas_aval: NotaAvalBasicResponse[]
  /** Informes juridicos for this etapa only */
  informes_juridicos: InformeJuridicoBasicResponse[]
  /** Ratificaciones for this etapa only */
  ratificaciones: RatificacionJudicial[]
}

/**
 * Etapa information with estado and documents
 */
export interface EtapaInfo {
  /** Etapa ID */
  id: number
  /** Stage type (APERTURA, INNOVACION, PRORROGA, CESE, etc.) */
  tipo_etapa: TipoEtapa
  /** Current estado for this etapa */
  estado_actual: EstadoActualInfo | null
  /** Start date/time of etapa */
  fecha_inicio: string
  /** End date/time of etapa (null if still active) */
  fecha_fin: string | null
  /** Whether this etapa is currently active */
  activa: boolean
  /** All documents belonging to this etapa */
  documentos: EtapaDocumentos
  /** Additional observations */
  observaciones?: string | null
}

/**
 * Complete Etapa Detail Response
 * GET /api/medidas/{id}/etapa/{tipo_etapa}/
 *
 * Returns complete information for a specific etapa including:
 * - Basic medida information
 * - Etapa status and estado
 * - All documents (interventions, notas, informes, ratificaciones) for this etapa only
 */
export interface EtapaDetailResponse {
  medida: EtapaMedidaBasicInfo
  etapa: EtapaInfo
}

/**
 * Error response when etapa doesn't exist (404)
 */
export interface EtapaNotFoundError {
  detail: string
  error_code?: string
  tipo_etapa?: TipoEtapa
  medida_id?: number
}

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

/**
 * Get detailed information for a specific etapa
 * GET /api/medidas/{id}/etapa/{tipo_etapa}/
 *
 * This endpoint returns the etapa with ALL its related documents
 * (interventions, notas de aval, informes juridicos, ratificaciones)
 *
 * Benefits:
 * - Single API call gets all etapa data
 * - Documents are properly filtered by etapa
 * - No cross-contamination between tabs
 * - Better performance (1 call vs 4)
 *
 * Error Handling:
 * - 404: Etapa doesn't exist yet (normal for Innovación, Prórroga, Cese before creation)
 * - 403: User doesn't have permission to view this medida
 * - 400: Invalid tipo_etapa parameter
 *
 * @param medidaId ID of the medida
 * @param tipoEtapa Type of etapa (APERTURA, INNOVACION, PRORROGA, CESE, etc.)
 * @returns Etapa detail with all documents
 * @throws Error if request fails (except 404 which returns null)
 */
export const getEtapaDetail = async (
  medidaId: number,
  tipoEtapa: TipoEtapa
): Promise<EtapaDetailResponse | null> => {
  try {
    console.log(`[EtapaDetailService] Fetching etapa ${tipoEtapa} for medida ${medidaId}`)

    const response = await get<EtapaDetailResponse>(
      `medidas/${medidaId}/etapa/${tipoEtapa}/`
    )

    console.log('[EtapaDetailService] Etapa detail retrieved:', {
      medida: response.medida.numero_medida,
      tipo_etapa: response.etapa.tipo_etapa,
      estado_actual: response.etapa.estado_actual?.nombre_display,
      activa: response.etapa.activa,
      documentos: {
        intervenciones: response.etapa.documentos.intervenciones.length,
        notas_aval: response.etapa.documentos.notas_aval.length,
        informes_juridicos: response.etapa.documentos.informes_juridicos.length,
        ratificaciones: response.etapa.documentos.ratificaciones.length,
      },
    })

    return response
  } catch (error: any) {
    // Handle 404 gracefully - etapa doesn't exist yet (normal for non-Apertura stages)
    if (error?.response?.status === 404) {
      console.log(
        `[EtapaDetailService] Etapa ${tipoEtapa} not found for medida ${medidaId} (not created yet)`
      )
      return null
    }

    // Log and re-throw other errors
    console.error(`[EtapaDetailService] Error fetching etapa ${tipoEtapa}:`, error)
    console.error('[EtapaDetailService] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      medidaId,
      tipoEtapa,
    })

    throw error
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR EACH ETAPA TYPE
// ============================================================================

/**
 * Get Apertura etapa detail
 * @param medidaId ID of the medida
 * @returns Apertura etapa detail or null if not found
 */
export const getAperturaDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'APERTURA')
}

/**
 * Get Innovación etapa detail
 * @param medidaId ID of the medida
 * @returns Innovación etapa detail or null if not created yet
 */
export const getInnovacionDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'INNOVACION')
}

/**
 * Get Prórroga etapa detail
 * @param medidaId ID of the medida
 * @returns Prórroga etapa detail or null if not created yet
 */
export const getProrrogaDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'PRORROGA')
}

/**
 * Get Cese etapa detail
 * @param medidaId ID of the medida
 * @returns Cese etapa detail or null if not created yet
 */
export const getCeseDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'CESE')
}

/**
 * Get Post-Cese etapa detail (MPE only)
 * @param medidaId ID of the medida
 * @returns Post-Cese etapa detail or null if not created yet
 */
export const getPostCeseDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'POST_CESE')
}

/**
 * Get Proceso etapa detail (MPJ only)
 * @param medidaId ID of the medida
 * @returns Proceso etapa detail or null if not created yet
 */
export const getProcesoDetail = (medidaId: number): Promise<EtapaDetailResponse | null> => {
  return getEtapaDetail(medidaId, 'PROCESO')
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an etapa exists
 * @param medidaId ID of the medida
 * @param tipoEtapa Type of etapa to check
 * @returns true if etapa exists, false otherwise
 */
export const etapaExists = async (
  medidaId: number,
  tipoEtapa: TipoEtapa
): Promise<boolean> => {
  try {
    const result = await getEtapaDetail(medidaId, tipoEtapa)
    return result !== null
  } catch (error) {
    return false
  }
}

/**
 * Get current estado order for an etapa
 * @param etapaDetail Etapa detail response
 * @returns Estado order (1-5) or 0 if no estado
 */
export const getCurrentEstadoOrder = (etapaDetail: EtapaDetailResponse | null): number => {
  if (!etapaDetail) return 0
  return etapaDetail.etapa.estado_actual?.orden ?? 0
}

/**
 * Check if etapa is active
 * @param etapaDetail Etapa detail response
 * @returns true if etapa is active
 */
export const isEtapaActive = (etapaDetail: EtapaDetailResponse | null): boolean => {
  if (!etapaDetail) return false
  return etapaDetail.etapa.activa
}

/**
 * Get total document count for an etapa
 * @param etapaDetail Etapa detail response
 * @returns Total number of documents across all types
 */
export const getTotalDocumentCount = (etapaDetail: EtapaDetailResponse | null): number => {
  if (!etapaDetail) return 0

  const docs = etapaDetail.etapa.documentos
  return (
    docs.intervenciones.length +
    docs.notas_aval.length +
    docs.informes_juridicos.length +
    docs.ratificaciones.length
  )
}
