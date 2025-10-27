"use client"

/**
 * Unified Workflow Tab Component - V2 Enhanced
 *
 * Dual-mode workflow stepper supporting both V1 and V2 architectures:
 *
 * V2 MODE (catalog-based estados):
 * - Fetches estados from TEstadoEtapaMedida catalog
 * - Filtered by tipo_medida + tipo_etapa
 * - Displays 1-5 estados with responsable_tipo and siguiente_accion
 * - Used when medidaApiData.etapa_actual.estado_especifico exists
 *
 * V1 MODE (legacy hardcoded workflow):
 * - Uses hardcoded 4-step workflow
 * - Backward compatible fallback
 * - Used when estado_especifico is null/undefined
 *
 * Workflow phases: Apertura, Innovación, Prórroga, Cese
 * Medida types: MPE, MPI, MPJ
 */

import React, { useState, useEffect } from "react"
import { Box, CircularProgress, Button, Alert } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
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
import { getAllEstados } from "../../api/estado-etapa-api-service"
import { createEtapa } from "../../api/etapa-api-service"
import { workflowPhaseToTipoEtapa } from "../../utils/workflow-tipo-mapper"
import IniciarEtapaDialog from "../dialogs/iniciar-etapa-dialog"
import type { StepStatus, WorkflowPhase } from "../../types/workflow"
import type { NotaAvalBasicResponse } from "../../types/nota-aval-api"
import type { InformeJuridicoBasicResponse } from "../../types/informe-juridico-api"
import type { RatificacionJudicial } from "../../types/ratificacion-judicial-api"
import type { TEstadoEtapaMedida } from "../../types/estado-etapa"
import type { MedidaDetailResponse } from "../../types/medida-api"

// ============================================================================
// TYPES
// ============================================================================

interface UnifiedWorkflowTabProps {
  /** Medida data (legacy format for V1 compatibility) */
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }

  /**
   * Full medida API response (V2 mode)
   * If provided and has etapa_actual.estado_especifico, enables V2 catalog-based workflow
   * If not provided or estado_especifico is null, falls back to V1 hardcoded workflow
   */
  medidaApiData?: MedidaDetailResponse

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
  medidaApiData,
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

  // ========== V2 Etapa Filtering ==========
  /**
   * Find the specific etapa for this workflowPhase from historial_etapas
   * This is crucial because each tab (Apertura, Innovación, etc.) should show
   * its own etapa's estado, not etapa_actual which is the most recent one.
   */
  const getEtapaForWorkflow = (): typeof medidaApiData.etapa_actual => {
    if (!medidaApiData || !workflowPhase) {
      return medidaApiData?.etapa_actual || null
    }

    // Convert workflowPhase to TipoEtapa enum
    const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

    // Find the etapa that matches this workflow phase
    const etapaForThisWorkflow = medidaApiData.historial_etapas?.find(
      (etapa) => etapa.tipo_etapa === tipoEtapa
    )

    // Return matched etapa, or null if not found
    return etapaForThisWorkflow || null
  }

  const etapaActualForThisTab = getEtapaForWorkflow()

  // ========== V2 Mode Detection ==========
  /**
   * Use V2 catalog-based workflow if:
   * 1. medidaApiData is provided
   * 2. etapaActualForThisTab exists
   * 3. estado_especifico is not null/undefined (backend V2 deployed)
   *
   * Otherwise fall back to V1 hardcoded workflow (backward compatible)
   */
  const useV2Mode =
    etapaActualForThisTab?.estado_especifico !== undefined &&
    etapaActualForThisTab?.estado_especifico !== null

  // ========== State Management ==========
  const [activeStep, setActiveStep] = useState(0)
  const [notaAval, setNotaAval] = useState<NotaAvalBasicResponse | null>(null)
  const [informeJuridico, setInformeJuridico] = useState<boolean>(false)
  const [ratificacion, setRatificacion] = useState<RatificacionJudicial | null>(null)
  const [isLoadingWorkflowData, setIsLoadingWorkflowData] = useState(true)

  // V2 State: Estados catalog
  const [estadosCatalog, setEstadosCatalog] = useState<TEstadoEtapaMedida[]>([])
  const [isLoadingEstados, setIsLoadingEstados] = useState(false)

  // Etapa creation state
  const [iniciarEtapaDialogOpen, setIniciarEtapaDialogOpen] = useState(false)
  const [isCreatingEtapa, setIsCreatingEtapa] = useState(false)
  const [createEtapaError, setCreateEtapaError] = useState<string | null>(null)

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

  // ========== Fetch V2 Estados Catalog ==========
  useEffect(() => {
    // Only fetch catalog if V2 mode is enabled and workflowPhase is provided
    if (!useV2Mode || !workflowPhase) {
      return
    }

    const fetchEstadosCatalog = async () => {
      try {
        setIsLoadingEstados(true)

        // Convert workflowPhase to TipoEtapa enum
        const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

        // Fetch estados filtered by tipo_medida and tipo_etapa
        const estados = await getAllEstados({
          tipo_medida: medidaData.tipo_medida,
          tipo_etapa: tipoEtapa,
          activo: true,
        })

        setEstadosCatalog(estados)
      } catch (error) {
        console.error("Error fetching estados catalog:", error)
        // On error, leave estadosCatalog empty which will trigger V1 fallback
        setEstadosCatalog([])
      } finally {
        setIsLoadingEstados(false)
      }
    }

    fetchEstadosCatalog()
  }, [useV2Mode, medidaData.tipo_medida, workflowPhase])

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
            etapaId={etapaActualForThisTab?.id}
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

  // ========== Etapa Creation Handlers ==========
  const handleIniciarEtapa = () => {
    setCreateEtapaError(null)
    setIniciarEtapaDialogOpen(true)
  }

  const handleConfirmIniciarEtapa = async (observaciones?: string) => {
    if (!workflowPhase) return

    try {
      setIsCreatingEtapa(true)
      setCreateEtapaError(null)

      const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

      console.log(`[UnifiedWorkflowTab] Creating new etapa ${tipoEtapa} for medida ${medidaData.id}`)

      await createEtapa(medidaData.id, {
        tipo_etapa: tipoEtapa,
        observaciones,
      })

      console.log('[UnifiedWorkflowTab] Etapa created successfully, reloading page...')

      // Refresh page to load new etapa data
      window.location.reload()
    } catch (error: any) {
      console.error('[UnifiedWorkflowTab] Error creating etapa:', error)
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        'Error al crear la etapa'
      setCreateEtapaError(errorMessage)
    } finally {
      setIsCreatingEtapa(false)
    }
  }

  // ========== Render ==========

  // Loading state
  if (isLoadingEstados || isLoadingWorkflowData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // No etapa found for this workflow phase
  if (medidaApiData && !etapaActualForThisTab && workflowPhase) {
    const tipoEtapaLabel = {
      apertura: 'Apertura',
      innovacion: 'Innovación',
      prorroga: 'Prórroga',
      cese: 'Cese',
    }[workflowPhase]

    const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

    return (
      <>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Alert severity="info" sx={{ width: '100%', maxWidth: 600 }}>
            No existe una etapa de <strong>{tipoEtapaLabel}</strong> para esta medida.
            {workflowPhase !== 'apertura' && (
              <>
                {' '}
                Para comenzar a trabajar en esta etapa, debe iniciarla primero.
              </>
            )}
          </Alert>

          {createEtapaError && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
              {createEtapaError}
            </Alert>
          )}

          {workflowPhase !== 'apertura' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleIniciarEtapa}
              disabled={isCreatingEtapa}
            >
              Iniciar Etapa de {tipoEtapaLabel}
            </Button>
          )}
        </Box>

        <IniciarEtapaDialog
          open={iniciarEtapaDialogOpen}
          onClose={() => {
            setIniciarEtapaDialogOpen(false)
            setCreateEtapaError(null)
          }}
          onConfirm={handleConfirmIniciarEtapa}
          tipoEtapa={tipoEtapa}
          isLoading={isCreatingEtapa}
        />
      </>
    )
  }

  // V2 MODE: Use catalog-based EstadoStepper
  if (useV2Mode && estadosCatalog.length > 0 && workflowPhase && etapaActualForThisTab) {
    return (
      <WorkflowStepper
        tipoMedida={medidaData.tipo_medida}
        tipoEtapa={workflowPhaseToTipoEtapa(workflowPhase)}
        etapaActual={etapaActualForThisTab}
        medidaId={medidaData.id}
        availableEstados={estadosCatalog}
        fechaCeseEfectivo={medidaApiData?.fecha_cese_efectivo}
        planTrabajoId={medidaApiData?.plan_trabajo_id}
      />
    )
  }

  // V1 MODE: Fallback to hardcoded steps (backward compatible)
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
