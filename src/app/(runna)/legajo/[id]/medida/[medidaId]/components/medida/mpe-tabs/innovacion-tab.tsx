"use client"

/**
 * Innovación Tab - Workflow Stepper UX
 *
 * Uses the UnifiedWorkflowTab component to display the 4-step workflow
 * with visual stepper for the Innovación phase.
 */

import React from "react"
import { UnifiedWorkflowTab } from "../unified-workflow-tab"

interface InnovacionTabProps {
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

export const InnovacionTab: React.FC<InnovacionTabProps> = ({
  medidaData,
  legajoData,
}) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      legajoData={legajoData}
      workflowPhase="innovacion"
    />
  )
}

export default InnovacionTab
