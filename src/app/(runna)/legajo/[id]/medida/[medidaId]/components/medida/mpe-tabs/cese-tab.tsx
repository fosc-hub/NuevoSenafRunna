"use client"

/**
 * Cese Tab - Workflow Stepper UX
 *
 * Uses the UnifiedWorkflowTab component to display the 4-step workflow
 * with visual stepper for the Cese phase.
 */

import React from "react"
import { UnifiedWorkflowTab } from "../unified-workflow-tab"

interface CeseTabProps {
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
}

export const CeseTab: React.FC<CeseTabProps> = ({
  medidaData,
  legajoData,
}) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      legajoData={legajoData}
      workflowPhase="cese"
    />
  )
}

export default CeseTab
