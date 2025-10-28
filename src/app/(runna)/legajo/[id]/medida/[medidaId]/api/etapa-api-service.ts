/**
 * Etapa API Service - MED-01 V2
 *
 * Service for creating and managing etapas (workflow stages).
 * Provides functions for explicit etapa creation for Innovación, Prórroga, and Cese stages.
 *
 * Backend Endpoints:
 * - POST /api/medidas/{id}/transicionar-etapa/ - Transition to new etapa (CORRECT)
 * - POST /api/medidas/{medida_id}/etapas/ - Old endpoint (DEPRECATED)
 */

import { create } from '@/app/api/apiService'
import type { TipoEtapa } from '../types/estado-etapa'
import type { EtapaMedida } from '../types/medida-api'

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to create a new etapa
 */
export interface CreateEtapaRequest {
  /** Stage type to create */
  tipo_etapa: TipoEtapa

  /** Optional initial observations */
  observaciones?: string
}

/**
 * Response after creating etapa
 */
export interface CreateEtapaResponse extends EtapaMedida {
  mensaje?: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Transition to a new etapa for a medida (CORRECT ENDPOINT)
 * POST /api/medidas/{id}/transicionar-etapa/
 *
 * This is the correct endpoint according to MED-01 V2 specification.
 * Creates a new TEtapaMedida record and initializes appropriate estado.
 *
 * @param medidaId ID de la medida
 * @param data Datos de la etapa a crear
 * @returns Etapa creada con estado inicial
 */
export const transicionarEtapa = async (
  medidaId: number,
  data: CreateEtapaRequest
): Promise<CreateEtapaResponse> => {
  try {
    console.log(`[EtapaService] Transitioning to new etapa for medida ${medidaId}:`, data)

    // Use correct endpoint: transicionar-etapa
    const response = await create<CreateEtapaResponse>(
      `medidas/${medidaId}/transicionar-etapa`,
      data as Partial<CreateEtapaResponse>
    )

    console.log('[EtapaService] Etapa transition successful:', response)

    return response
  } catch (error: any) {
    console.error(`[EtapaService] Error transitioning etapa for medida ${medidaId}:`, error)
    console.error('[EtapaService] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * @deprecated Use transicionarEtapa() instead. This uses the old endpoint.
 *
 * Create a new etapa for a medida
 * POST /api/medidas/{medida_id}/etapas/ (DEPRECATED ENDPOINT)
 *
 * @param medidaId ID de la medida
 * @param data Datos de la etapa a crear
 * @returns Etapa creada con estado inicial
 */
export const createEtapa = async (
  medidaId: number,
  data: CreateEtapaRequest
): Promise<CreateEtapaResponse> => {
  // Redirect to correct implementation for backward compatibility
  console.warn('[EtapaService] createEtapa is deprecated. Use transicionarEtapa() instead.')
  return transicionarEtapa(medidaId, data)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get etapa tipo label for display
 */
export function getEtapaTipoLabel(tipoEtapa: TipoEtapa): string {
  const labels: Record<TipoEtapa, string> = {
    APERTURA: 'Apertura',
    INNOVACION: 'Innovación',
    PRORROGA: 'Prórroga',
    CESE: 'Cese',
    POST_CESE: 'Post-Cese',
    PROCESO: 'Proceso',
  }
  return labels[tipoEtapa] || tipoEtapa
}

/**
 * Check if etapa type can be explicitly created
 * APERTURA is created automatically, others can be created on demand
 */
export function canCreateEtapa(tipoEtapa: TipoEtapa): boolean {
  // APERTURA is created automatically when medida is created
  // Others can be created explicitly
  return tipoEtapa !== 'APERTURA'
}

// ============================================================================
// EXPORTS
// ============================================================================

export const etapaService = {
  transicionar: transicionarEtapa, // Preferred method
  create: createEtapa, // Deprecated - kept for backward compatibility
  getLabel: getEtapaTipoLabel,
  canCreate: canCreateEtapa,
}

export default etapaService
