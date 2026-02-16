"use client"

/**
 * Cese Tab - Workflow Stepper UX (V2 Enhanced)
 *
 * Uses the UnifiedWorkflowTab component to display workflow:
 * - V2 Mode: Catalog-based estados 1-5 (MPE)
 * - V1 Mode: Hardcoded 4-step workflow (backward compatible)
 *
 * Automatically detects mode based on medidaApiData.etapa_actual.estado_especifico
 */

import React from "react"
import { UnifiedWorkflowTab } from "../unified-workflow-tab"
import type { MedidaDetailResponse } from "../../../types/medida-api"

interface CeseTabProps {
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }
  medidaApiData?: MedidaDetailResponse
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  /** Callback to refetch medida data from API after state changes */
  onMedidaRefetch?: () => void
}

export const CeseTab: React.FC<CeseTabProps> = ({
  medidaData,
  medidaApiData,
  legajoData,
  onMedidaRefetch,
}) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      medidaApiData={medidaApiData}
      legajoData={legajoData}
      workflowPhase="cese"
      onMedidaRefetch={onMedidaRefetch}
    />
  )
}

export default CeseTab
