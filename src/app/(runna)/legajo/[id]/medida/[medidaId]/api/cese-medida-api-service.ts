/**
 * API Service for Cese de Medidas (Measure Closure)
 *
 * Handles API calls for closing protection measures:
 * - MPI: Direct closure via /medidas/{id}/cesar-medida/
 * - MPE: Two-phase closure via /medidas/{id}/solicitar-cese/
 *
 * @module cese-medida-api-service
 */

import { create } from "@/app/api/apiService"
import type {
  CesarMedidaMPIRequest,
  CesarMedidaMPIResponse,
  SolicitarCeseMPERequest,
  SolicitarCeseMPEResponse,
} from "../types/cese-medida-api"

// ============================================================================
// MPI CESE
// ============================================================================

/**
 * Close an MPI measure directly
 * POST /api/medidas/{medida_id}/cesar-medida/
 *
 * Requirements:
 * - User must be Jefe Zonal (jefe: true) or Superuser
 * - Medida must be MPI type
 * - Medida must be in VIGENTE state
 *
 * @param medidaId - ID of the medida to close
 * @param data - Request data with observaciones and cancelar_actividades flag
 * @returns Response with closed medida details and etapa cese info
 * @throws Error if user lacks permissions or medida is in invalid state
 */
export const cesarMedidaMPI = async (
  medidaId: number,
  data: CesarMedidaMPIRequest
): Promise<CesarMedidaMPIResponse> => {
  try {
    console.log(`[cese-medida-api] Cesando medida MPI ${medidaId}:`, data)

    const response = await create<CesarMedidaMPIResponse>(
      `medidas/${medidaId}/cesar-medida`,
      data as Partial<CesarMedidaMPIResponse>,
      false // No toast here, handled by hook
    )

    console.log("[cese-medida-api] MPI cese successful:", response)
    return response
  } catch (error: any) {
    console.error(`[cese-medida-api] Error cesando medida MPI ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// MPE CESE
// ============================================================================

/**
 * Initiate or confirm MPE measure closure
 * POST /api/medidas/{medida_id}/solicitar-cese/
 *
 * Two flows:
 * - FLOW A (Initiate): When medida is NOT in CESE etapa → Creates CESE etapa
 * - FLOW B (Confirm): When medida IS in CESE etapa → Closes medida, creates POST_CESE
 *
 * Requirements:
 * - User must be Jefe Zonal (jefe: true) or Superuser
 * - Medida must be MPE type
 * - Medida must be in VIGENTE state
 *
 * @param medidaId - ID of the medida to initiate/confirm cese
 * @param data - Request data with observaciones and cancelar_actividades flag
 * @returns Response with cese status (iniciado or confirmado) and details
 * @throws Error if user lacks permissions or medida is in invalid state
 */
export const solicitarCeseMPE = async (
  medidaId: number,
  data: SolicitarCeseMPERequest
): Promise<SolicitarCeseMPEResponse> => {
  try {
    console.log(`[cese-medida-api] Solicitando cese MPE ${medidaId}:`, data)

    const response = await create<SolicitarCeseMPEResponse>(
      `medidas/${medidaId}/solicitar-cese`,
      data as Partial<SolicitarCeseMPEResponse>,
      false // No toast here, handled by hook
    )

    console.log("[cese-medida-api] MPE cese response:", response)
    return response
  } catch (error: any) {
    console.error(`[cese-medida-api] Error solicitando cese MPE ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// EXPORT SERVICE OBJECT (optional, for consistency with other services)
// ============================================================================

const CeseMedidaAPI = {
  cesarMedidaMPI,
  solicitarCeseMPE,
}

export default CeseMedidaAPI
