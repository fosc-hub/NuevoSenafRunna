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
import { InformeCierreSection } from "./informe-cierre-section"
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
import { createEtapa } from "../../api/etapa-api-service"
import { getEtapaDetail, type EtapaDetailResponse } from "../../api/etapa-detail-api-service"
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
   * DISABLED: V2 mode uses a different UI that doesn't have interactive sections.
   * We want to keep using V1 mode (with AperturaSection, NotaAvalSection, etc.)
   * even when estado_especifico exists.
   *
   * V1 mode provides the full interactive workflow with sections for:
   * - Registro de Intervención (with modal)
   * - Nota de Aval (with form)
   * - Informe Jurídico (with uploads)
   * - Ratificación Judicial (with documents)
   */
  const useV2Mode = false // Always use V1 interactive workflow

  // ========== State Management ==========
  const [activeStep, setActiveStep] = useState(0)
  const [etapaDetail, setEtapaDetail] = useState<EtapaDetailResponse | null>(null)
  const [notaAval, setNotaAval] = useState<NotaAvalBasicResponse | null>(null)
  const [informeJuridico, setInformeJuridico] = useState<boolean>(false)
  const [ratificacion, setRatificacion] = useState<RatificacionJudicial | null>(null)
  const [isLoadingWorkflowData, setIsLoadingWorkflowData] = useState(true)

  // V2 State: Estados catalog (kept for WorkflowStepper compatibility, always empty)
  const [estadosCatalog] = useState<TEstadoEtapaMedida[]>([])
  const [isLoadingEstados] = useState(false)

  // Etapa creation state
  const [iniciarEtapaDialogOpen, setIniciarEtapaDialogOpen] = useState(false)
  const [isCreatingEtapa, setIsCreatingEtapa] = useState(false)
  const [createEtapaError, setCreateEtapaError] = useState<string | null>(null)

  /**
   * CRITICAL FIX: Use estado from the SPECIFIC etapa being viewed, not the current medida estado
   *
   * Previously: Used medidaData.estado (always the current active etapa's estado)
   * Now: Use etapaActualForThisTab.estado (the estado of THIS specific etapa)
   *
   * This ensures:
   * - Apertura tab shows Apertura's estado (even if it's no longer active)
   * - Innovación tab shows Innovación's estado
   * - Each tab has independent workflow progress
   */
  const estadoActual = etapaActualForThisTab?.estado || medidaData.estado || ""

  // Prepare data for AperturaSection
  const aperturaData = {
    fecha: medidaData.fecha_apertura || "",
    estado: estadoActual,
    equipo: "", // TODO: Get from medidaData if available
  }

  // ========== Fetch Etapa Detail Data on Mount ==========
  /**
   * NEW APPROACH: Fetch etapa detail with ALL documents in a single API call
   * Benefits:
   * - Single API call vs 3-4 separate calls
   * - Documents properly filtered by etapa (no cross-contamination)
   * - Better performance and consistency
   */
  useEffect(() => {
    const fetchEtapaDetail = async () => {
      if (!workflowPhase) {
        console.warn('[UnifiedWorkflowTab] No workflowPhase provided, skipping etapa detail fetch')
        setIsLoadingWorkflowData(false)
        return
      }

      try {
        setIsLoadingWorkflowData(true)

        const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

        console.log(`[UnifiedWorkflowTab] Fetching etapa detail for ${tipoEtapa}`)

        // Single API call gets ALL documents for this etapa
        const detail = await getEtapaDetail(medidaData.id, tipoEtapa)

        if (!detail) {
          // Etapa doesn't exist yet (404) - normal for non-Apertura stages
          console.log(`[UnifiedWorkflowTab] Etapa ${tipoEtapa} not found (not created yet)`)
          setEtapaDetail(null)
          setNotaAval(null)
          setInformeJuridico(false)
          setRatificacion(null)
        } else {
          // Extract documents from etapa detail
          const docs = detail.etapa.documentos

          console.log(`[UnifiedWorkflowTab] Etapa detail loaded:`, {
            tipo_etapa: detail.etapa.tipo_etapa,
            estado_actual: detail.etapa.estado_actual?.nombre_display,
            intervenciones: docs.intervenciones.length,
            notas_aval: docs.notas_aval.length,
            informes_juridicos: docs.informes_juridicos.length,
            ratificaciones: docs.ratificaciones.length,
          })

          setEtapaDetail(detail)

          // Extract individual documents for backward compatibility with existing code
          setNotaAval(docs.notas_aval.length > 0 ? docs.notas_aval[0] : null)
          setInformeJuridico(docs.informes_juridicos.length > 0)
          setRatificacion(docs.ratificaciones.length > 0 ? docs.ratificaciones[0] : null)
        }
      } catch (error) {
        console.error("[UnifiedWorkflowTab] Error fetching etapa detail:", error)
        setEtapaDetail(null)
        setNotaAval(null)
        setInformeJuridico(false)
        setRatificacion(null)
      } finally {
        setIsLoadingWorkflowData(false)
      }
    }

    fetchEtapaDetail()
  }, [medidaData.id, workflowPhase])

  // ========== V2 Estados Catalog (REMOVED - no longer needed) ==========
  /**
   * OPTIMIZATION: We no longer need to fetch the estados catalog separately
   * because etapaDetail already includes the current estado_actual.
   *
   * The WorkflowStepper can use etapaDetail.etapa.estado_actual directly.
   * estadosCatalog is kept as an empty array for WorkflowStepper prop compatibility.
   */

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
            intervenciones={etapaDetail?.etapa.documentos.intervenciones ?? []}
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

  // ========== MPI Closure Section Detection ==========
  // Show InformeCierreSection when:
  // - MPI measure
  // - Cese phase (or Estados 3/4 detected)
  // - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE) or Estado 4 (INFORME_DE_CIERRE_REDACTADO)
  const showInformeCierreSection =
    medidaData.tipo_medida === "MPI" &&
    medidaApiData &&
    etapaActualForThisTab &&
    (etapaActualForThisTab.estado === "PENDIENTE_DE_INFORME_DE_CIERRE" ||
      etapaActualForThisTab.estado === "INFORME_DE_CIERRE_REDACTADO")

  // Extract available estados from etapa's estado_especifico_detalle
  const availableEstadosFromEtapa: TEstadoEtapaMedida[] =
    etapaActualForThisTab?.estado_especifico_detalle?.estados_disponibles?.map((estado: any) => ({
      id: 0, // Not needed for display
      codigo: estado.codigo,
      nombre_display: estado.nombre,
      orden: estado.orden,
      responsable_tipo: 'EQUIPO_TECNICO', // Default, will be overridden by actual estado
      siguiente_accion: '',
      aplica_a_tipos_medida: [],
      aplica_a_tipos_etapa: [],
      activo: true,
    })) ?? []

  // V2 MODE: Use catalog-based EstadoStepper
  // Updated: Uses estados from etapa's estado_especifico_detalle instead of separate API call
  if (useV2Mode && workflowPhase && etapaActualForThisTab) {
    return (
      <>
        <WorkflowStepper
          tipoMedida={medidaData.tipo_medida}
          tipoEtapa={workflowPhaseToTipoEtapa(workflowPhase)}
          etapaActual={etapaActualForThisTab}
          medidaId={medidaData.id}
          availableEstados={availableEstadosFromEtapa}
          fechaCeseEfectivo={medidaApiData?.fecha_cese_efectivo}
          planTrabajoId={medidaApiData?.plan_trabajo_id}
        />

        {/* MPI Closure Section (Estados 3-4) */}
        {showInformeCierreSection && (
          <Box sx={{ mt: 3 }}>
            <InformeCierreSection
              medidaId={medidaData.id}
              medidaApiData={medidaApiData}
              isJZ={isJZ}
              onRefresh={() => window.location.reload()}
            />
          </Box>
        )}
      </>
    )
  }

  // V1 MODE: Fallback to hardcoded steps (backward compatible)
  return (
    <>
      <WorkflowStepper
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        orientation="horizontal"
      />

      {/* MPI Closure Section (Estados 3-4) - V1 Mode */}
      {showInformeCierreSection && (
        <Box sx={{ mt: 3 }}>
          <InformeCierreSection
            medidaId={medidaData.id}
            medidaApiData={medidaApiData}
            isJZ={isJZ}
            onRefresh={() => window.location.reload()}
          />
        </Box>
      )}
    </>
  )
}

export default UnifiedWorkflowTab
