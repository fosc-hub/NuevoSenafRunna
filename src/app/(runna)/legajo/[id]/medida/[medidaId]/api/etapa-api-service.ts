/**
 * Etapa API Service - MED-01 V2
 *
 * Service for creating and managing etapas (workflow stages).
 * Provides functions for explicit etapa creation for Innovación, Prórroga, and Cese stages.
 *
 * Backend Endpoints:
 * - POST /api/medidas/{medida_id}/etapas/ - Create new etapa
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
 * Create a new etapa for a medida
 * POST /api/medidas/{medida_id}/etapas/
 *
 * @param medidaId ID de la medida
 * @param data Datos de la etapa a crear
 * @returns Etapa creada con estado inicial
 */
export const createEtapa = async (
  medidaId: number,
  data: CreateEtapaRequest
): Promise<CreateEtapaResponse> => {
  try {
    console.log(`[EtapaService] Creating etapa for medida ${medidaId}:`, data)

    // Make API call - create() already adds trailing slash
    const response = await create<CreateEtapaResponse>(
      `medidas/${medidaId}/etapas`,
      data as Partial<CreateEtapaResponse>
    )

    console.log('[EtapaService] Etapa created successfully:', response)

    return response
  } catch (error: any) {
    console.error(`[EtapaService] Error creating etapa for medida ${medidaId}:`, error)
    console.error('[EtapaService] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
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
  create: createEtapa,
  getLabel: getEtapaTipoLabel,
  canCreate: canCreateEtapa,
}

export default etapaService
