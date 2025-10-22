"use client"

/**
 * Unified Workflow Tab Component
 *
 * Reusable workflow stepper that works for ALL workflow phases:
 * - Apertura
 * - Innovación
 * - Prórroga
 * - Cese
 *
 * And all medida types:
 * - MPE
 * - MPI
 * - MPJ
 *
 * This eliminates code duplication across apertura-tab, innovacion-tab,
 * prorroga-tab, and cese-tab by providing a single unified component.
 */

import React, { useState, useEffect } from "react"
import { useUser } from "@/utils/auth/userZustand"
import { AperturaSection } from "./apertura-section"
import { NotaAvalSection } from "./nota-aval-section"
import { InformeJuridicoSection } from "./informe-juridico-section"
import { RatificacionJudicialSection } from "./ratificacion-judicial-section"
import { WorkflowStepper, WorkflowStep } from "./workflow-stepper"
import { WorkflowStepContent } from "./workflow-step-content"
import {
  determineStepStatus,
  getStepName,
  getStepDescription,
  createStepProgress,
  isIntervencionCompleted,
  isNotaAvalCompleted,
  isInformeJuridicoCompleted,
  isRatificacionCompleted,
} from "../../utils/step-completion"
import { getMostRecentNotaAval } from "../../api/nota-aval-api-service"
import { hasInformeJuridico } from "../../api/informe-juridico-api-service"
import { getRatificacionActiva } from "../../api/ratificacion-judicial-api-service"
import type { StepStatus, WorkflowPhase } from "../../types/workflow"
import type { NotaAvalBasicResponse } from "../../types/nota-aval-api"
import type { InformeJuridicoBasicResponse } from "../../types/informe-juridico-api"
import type { RatificacionJudicial } from "../../types/ratificacion-judicial-api"

// ============================================================================
// TYPES
// ============================================================================

interface UnifiedWorkflowTabProps {
  /** Medida data */
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }

  /** Legajo data for context */
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }

  /** Workflow phase (apertura, innovacion, prorroga, cese) */
  workflowPhase?: WorkflowPhase
}

// ============================================================================
// COMPONENT
// ============================================================================

export const UnifiedWorkflowTab: React.FC<UnifiedWorkflowTabProps> = ({
  medidaData,
  legajoData,
  workflowPhase = "apertura",
}) => {
  // ========== User Permissions ==========
  const { user } = useUser()
  const isSuperuser = user?.is_superuser || false
  const isDirector = user?.zonas?.some((z) => z.director) || false
  const userLevel = isDirector ? 3 : undefined
  const isJZ = user?.zonas?.some((z) => z.jefe) || false
  const isEquipoLegal = false // TODO: Add legal flag to user zonas data

  // ========== State Management ==========
  const [activeStep, setActiveStep] = useState(0)
  const [notaAval, setNotaAval] = useState<NotaAvalBasicResponse | null>(null)
  const [informeJuridico, setInformeJuridico] = useState<boolean>(false)
  const [ratificacion, setRatificacion] = useState<RatificacionJudicial | null>(null)
  const [isLoadingWorkflowData, setIsLoadingWorkflowData] = useState(true)

  // Extract estado from medidaData
  const estadoActual = medidaData.estado || ""

  // Prepare data for AperturaSection
  const aperturaData = {
    fecha: medidaData.fecha_apertura || "",
    estado: estadoActual,
    equipo: "", // TODO: Get from medidaData if available
  }

  // ========== Fetch Workflow Data on Mount ==========
  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        setIsLoadingWorkflowData(true)

        // Fetch nota de aval
        const notaAvalData = await getMostRecentNotaAval(medidaData.id)
        setNotaAval(notaAvalData)

        // Fetch informe juridico existence
        const hasInforme = await hasInformeJuridico(medidaData.id)
        setInformeJuridico(hasInforme)

        // Fetch ratificacion activa
        const ratifData = await getRatificacionActiva(medidaData.id)
        setRatificacion(ratifData)

      } catch (error) {
        console.error("Error fetching workflow data:", error)
      } finally {
        setIsLoadingWorkflowData(false)
      }
    }

    fetchWorkflowData()
  }, [medidaData.id])

  // ========== Step Completion Logic ==========
  // Step 1: Intervención completed when estado is PENDIENTE_NOTA_AVAL or beyond
  const step1Completed = isIntervencionCompleted(estadoActual)

  // Step 2: Nota de Aval completed when estado is PENDIENTE_INFORME_JURIDICO or beyond
  // OR when nota exists with decision
  const step2Completed = isNotaAvalCompleted(
    notaAval !== null,
    notaAval?.decision !== null && notaAval?.decision !== undefined,
    estadoActual
  )

  // Step 3: Informe Jurídico completed when estado is PENDIENTE_RATIFICACION_JUDICIAL or beyond
  // OR when informe exists (for backwards compatibility)
  const step3Completed = isInformeJuridicoCompleted(informeJuridico, estadoActual)

  // Step 4: Ratificación completed when estado is RATIFICADA/VIGENTE/CERRADA
  // OR when ratificacion exists with adjuntos (PDF)
  const step4Completed = isRatificacionCompleted(
    ratificacion !== null,
    ratificacion?.adjuntos !== undefined && ratificacion?.adjuntos.length > 0,
    estadoActual
  )

  // MPI only has 3 steps (no Ratificación Judicial)
  // MPE and MPJ have 4 steps
  const isMPI = medidaData.tipo_medida === "MPI"
  const totalSteps = isMPI ? 3 : 4

  const completedSteps = isMPI
    ? [step1Completed, step2Completed, step3Completed]
    : [step1Completed, step2Completed, step3Completed, step4Completed]

  // ========== Progress Calculation ==========
  // Calculate progress based on actual data
  const step1Progress = step1Completed ? 100 : estadoActual === "ENVIADO" ? 70 : 30

  const step2Progress = step2Completed
    ? 100
    : notaAval
      ? (notaAval.decision ? 70 : 30)
      : 0

  const step3Progress = step3Completed ? 100 : informeJuridico ? 50 : 0

  const step4Progress = step4Completed
    ? 100
    : ratificacion
      ? (ratificacion.adjuntos && ratificacion.adjuntos.length > 0 ? 70 : 30)
      : 0

  // ========== Step Definitions ==========
  const steps: WorkflowStep[] = [
    {
      id: 1,
      label: getStepName(0),
      description: getStepDescription(0),
      status: determineStepStatus(0, activeStep, step1Completed, true),
      progress: createStepProgress(step1Progress, estadoActual),
      content: (
        <WorkflowStepContent
          stepNumber={0}
          totalSteps={totalSteps}
          status={determineStepStatus(0, activeStep, step1Completed, true)}
          isFirst={true}
          isLast={false}
          canContinue={step1Completed}
          onContinue={() => setActiveStep(1)}
          showNavigation={true}
        >
          <AperturaSection
            data={aperturaData}
            isActive={activeStep === 0}
            isCompleted={step1Completed}
            onViewForm={() => {}}
            medidaId={medidaData.id}
            tipoMedida={medidaData.tipo_medida}
            legajoData={legajoData}
          />
        </WorkflowStepContent>
      ),
    },
    {
      id: 2,
      label: getStepName(1),
      description: getStepDescription(1),
      status: determineStepStatus(1, activeStep, step2Completed, step1Completed),
      progress: createStepProgress(step2Progress),
      content: (
        <WorkflowStepContent
          stepNumber={1}
          totalSteps={totalSteps}
          status={determineStepStatus(1, activeStep, step2Completed, step1Completed)}
          isFirst={false}
          isLast={false}
          canContinue={step2Completed}
          onContinue={() => setActiveStep(2)}
          onBack={() => setActiveStep(0)}
          showNavigation={true}
        >
          <NotaAvalSection
            medidaId={medidaData.id}
            medidaNumero={medidaData.numero_medida}
            estadoActual={estadoActual}
            userLevel={userLevel}
            isSuperuser={isSuperuser}
            onNotaAvalCreated={() => window.location.reload()}
          />
        </WorkflowStepContent>
      ),
    },
    {
      id: 3,
      label: getStepName(2),
      description: getStepDescription(2),
      status: determineStepStatus(2, activeStep, step3Completed, step2Completed),
      progress: createStepProgress(step3Progress),
      content: (
        <WorkflowStepContent
          stepNumber={2}
          totalSteps={totalSteps}
          status={determineStepStatus(2, activeStep, step3Completed, step2Completed)}
          isFirst={false}
          isLast={isMPI}
          canContinue={step3Completed}
          onContinue={isMPI ? undefined : () => setActiveStep(3)}
          onBack={() => setActiveStep(1)}
          showNavigation={true}
        >
          <InformeJuridicoSection
            medidaId={medidaData.id}
            isEquipoLegal={isEquipoLegal}
            isSuperuser={isSuperuser}
            estadoActual={estadoActual}
          />
        </WorkflowStepContent>
      ),
    },
    // Step 4 only for MPE and MPJ (not MPI)
    ...(!isMPI ? [{
      id: 4,
      label: getStepName(3),
      description: getStepDescription(3),
      status: determineStepStatus(3, activeStep, step4Completed, step3Completed),
      progress: createStepProgress(step4Progress),
      content: (
        <WorkflowStepContent
          stepNumber={3}
          totalSteps={totalSteps}
          status={determineStepStatus(3, activeStep, step4Completed, step3Completed)}
          isFirst={false}
          isLast={true}
          canContinue={step4Completed}
          onBack={() => setActiveStep(2)}
          showNavigation={true}
        >
          <RatificacionJudicialSection
            medidaId={medidaData.id}
            isEquipoLegal={isEquipoLegal}
            isJZ={isJZ}
            isSuperuser={isSuperuser}
            estadoActual={estadoActual}
          />
        </WorkflowStepContent>
      ),
    }] : []),
  ]

  // ========== Auto-navigate to first incomplete step on mount ==========
  useEffect(() => {
    const firstIncomplete = completedSteps.findIndex((completed) => !completed)
    if (firstIncomplete !== -1 && firstIncomplete !== activeStep) {
      setActiveStep(firstIncomplete)
    }
  }, []) // Only run on mount

  // ========== Render ==========
  return (
    <WorkflowStepper
      steps={steps}
      activeStep={activeStep}
      onStepClick={setActiveStep}
      orientation="horizontal"
    />
  )
}

export default UnifiedWorkflowTab
