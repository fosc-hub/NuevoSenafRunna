"use client"

/**
 * Apertura Tab - Workflow Stepper UX
 *
 * Uses the UnifiedWorkflowTab component to display the 4-step workflow
 * with visual stepper for the Apertura phase.
 */

import React from "react"
import { UnifiedWorkflowTab } from "../unified-workflow-tab"

interface AperturaTabUnifiedProps {
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

export const AperturaTabUnified: React.FC<AperturaTabUnifiedProps> = ({
  medidaData,
  legajoData,
}) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      legajoData={legajoData}
      workflowPhase="apertura"
    />
  )
}

export default AperturaTabUnified
