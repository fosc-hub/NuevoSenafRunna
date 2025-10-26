"use client"

/**
 * Workflow Stepper Component - V2 Enhanced
 *
 * Smart router component that displays type-specific workflows:
 * - V2 Mode: Routes to appropriate components based on tipo_medida + tipo_etapa
 * - V1 Mode: Renders legacy 4-step workflow (backward compatible)
 *
 * V2 Features:
 * - MPJ: Stage-only stepper (no estados)
 * - MPI Cese: Completion message (no estados)
 * - MPE POST_CESE: Post-cese activities section (no estados)
 * - Standard workflows: Estado-based stepper (catalog-driven)
 *
 * V1 Features (legacy):
 * - Visual progress indication (color coding, check icons, progress bars)
 * - Sequential navigation (locked until previous step completed)
 * - Estado-based completion detection
 * - Responsive design
 */

import React from "react"
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepIcon,
  Box,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import LockIcon from "@mui/icons-material/Lock"
import type { StepStatus, StepProgress } from "../../types/workflow"

// V2 Imports
import type { TipoEtapa, TEstadoEtapaMedida } from "../../types/estado-etapa"
import type { TipoMedida, EtapaMedida } from "../../types/medida-api"
import { shouldSkipEstados } from "../../utils/estado-validation"
import MPJStageStepper from "./mpj-stage-stepper"
import MPICeseCompletion from "./mpi-cese-completion"
import MPEPostCeseSection from "./mpe-post-cese-section"
import EstadoStepper from "./estado-stepper"

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StepperContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[1],
}))

const StepProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
  },
}))

const StepHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}))

// ============================================================================
// TYPES
// ============================================================================

export interface WorkflowStep {
  id: number
  label: string
  description: string
  status: StepStatus
  progress: StepProgress
  content: React.ReactNode
}

// ============================================================================
// V2 PROPS (Type-Specific Workflows)
// ============================================================================

interface V2WorkflowProps {
  /** V2 Mode: Measure type */
  tipoMedida: TipoMedida

  /** V2 Mode: Stage type (from etapa_actual.tipo_etapa) */
  tipoEtapa: TipoEtapa | null

  /** V2 Mode: Current etapa data */
  etapaActual: EtapaMedida | null

  /** V2 Mode: Medida ID for API calls */
  medidaId: number

  /** V2 Mode: Available estados from catalog (filtered by type/stage) */
  availableEstados?: TEstadoEtapaMedida[]

  /** V2 Mode: Fecha cese efectivo (for MPE POST_CESE) */
  fechaCeseEfectivo?: string | null

  /** V2 Mode: Plan trabajo ID (for MPE POST_CESE) */
  planTrabajoId?: number | null
}

// ============================================================================
// V1 PROPS (Legacy 4-Step Workflow)
// ============================================================================

interface V1WorkflowProps {
  /** V1 Mode: Step definitions */
  steps: WorkflowStep[]

  /** V1 Mode: Active step index */
  activeStep: number

  /** V1 Mode: Step click handler */
  onStepClick: (stepIndex: number) => void

  /** V1 Mode: Stepper orientation */
  orientation?: "horizontal" | "vertical"
}

// ============================================================================
// COMBINED PROPS (V1 OR V2)
// ============================================================================

/**
 * WorkflowStepper supports two modes:
 * - V2 Mode: Provide tipoMedida, tipoEtapa, etapaActual, medidaId
 * - V1 Mode: Provide steps, activeStep, onStepClick
 */
type WorkflowStepperProps =
  | V2WorkflowProps
  | V1WorkflowProps

// Type guards
function isV2Props(props: WorkflowStepperProps): props is V2WorkflowProps {
  return 'tipoMedida' in props
}

function isV1Props(props: WorkflowStepperProps): props is V1WorkflowProps {
  return 'steps' in props
}

// ============================================================================
// CUSTOM STEP ICON
// ============================================================================

interface CustomStepIconProps {
  active: boolean
  completed: boolean
  locked: boolean
  icon: React.ReactNode
  progress: number
}

const CustomStepIcon: React.FC<CustomStepIconProps> = ({
  active,
  completed,
  locked,
  icon,
  progress,
}) => {
  const theme = useTheme()

  // Determine icon and color
  let displayIcon: React.ReactNode
  let color: string

  if (completed) {
    displayIcon = <CheckCircleIcon />
    color = theme.palette.success.main
  } else if (locked) {
    displayIcon = <LockIcon />
    color = theme.palette.grey[400]
  } else if (active) {
    displayIcon = icon
    color = theme.palette.primary.main
  } else {
    displayIcon = <RadioButtonUncheckedIcon />
    color = theme.palette.grey[400]
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: completed
          ? theme.palette.success.light
          : active
          ? theme.palette.primary.light
          : theme.palette.grey[100],
        color: color,
        position: "relative",
      }}
    >
      {displayIcon}
      {active && !completed && progress > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// STEP STATUS CHIP
// ============================================================================

interface StepStatusChipProps {
  estado?: string
  status: StepStatus
}

const StepStatusChip: React.FC<StepStatusChipProps> = ({ estado, status }) => {
  const getChipProps = () => {
    if (status === "completed") {
      return {
        label: estado || "Completado",
        color: "success" as const,
      }
    }
    if (status === "current") {
      return {
        label: estado || "En Progreso",
        color: "primary" as const,
      }
    }
    if (status === "locked") {
      return {
        label: "Bloqueado",
        color: "default" as const,
      }
    }
    return {
      label: "Pendiente",
      color: "default" as const,
    }
  }

  const chipProps = getChipProps()

  return (
    <Chip
      {...chipProps}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WorkflowStepper: React.FC<WorkflowStepperProps> = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // ========================================================================
  // V2 MODE: Type-Specific Workflow Routing
  // ========================================================================
  if (isV2Props(props)) {
    const {
      tipoMedida,
      tipoEtapa,
      etapaActual,
      medidaId,
      availableEstados = [],
      fechaCeseEfectivo,
      planTrabajoId,
    } = props

    // MPJ: Show stage-only stepper (no estados)
    if (tipoMedida === 'MPJ') {
      return <MPJStageStepper etapaActual={etapaActual} showDescriptions={true} />
    }

    // MPI Cese OR MPE POST_CESE: Show completion/post-cese sections (no estados)
    if (shouldSkipEstados(tipoMedida, tipoEtapa)) {
      // MPI Cese: Show completion message
      if (tipoMedida === 'MPI' && tipoEtapa === 'CESE') {
        return <MPICeseCompletion etapaActual={etapaActual} showInstructions={true} />
      }

      // MPE POST_CESE: Show post-cese activities
      if (tipoMedida === 'MPE' && tipoEtapa === 'POST_CESE') {
        if (!fechaCeseEfectivo) {
          return (
            <Box sx={{ p: 3, backgroundColor: theme.palette.warning.light, borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Error: MPE POST_CESE requiere fecha_cese_efectivo
              </Typography>
            </Box>
          )
        }

        return (
          <MPEPostCeseSection
            medidaId={medidaId}
            fechaCeseEfectivo={fechaCeseEfectivo}
            planTrabajoId={planTrabajoId || 0}
            etapaNombre={etapaActual?.nombre}
          />
        )
      }
    }

    // Standard workflow: Estado-based stepper (MPI 1-2 estados, MPE 1-5 estados)
    return (
      <EstadoStepper
        availableEstados={availableEstados}
        etapaActual={etapaActual}
        tipoMedida={tipoMedida}
        showMetadata={true}
        orientation={isMobile ? "vertical" : "horizontal"}
      />
    )
  }

  // ========================================================================
  // V1 MODE: Legacy 4-Step Workflow
  // ========================================================================
  if (!isV1Props(props)) {
    return (
      <Box sx={{ p: 3, backgroundColor: theme.palette.error.light, borderRadius: 2 }}>
        <Typography variant="body1" color="error">
          Error: WorkflowStepper requiere props V1 o V2
        </Typography>
      </Box>
    )
  }

  const { steps, activeStep, onStepClick, orientation = "horizontal" } = props

  // Use vertical orientation on mobile for better UX
  const effectiveOrientation = isMobile ? "vertical" : orientation

  const handleStepClick = (stepIndex: number) => {
    const step = steps[stepIndex]

    // Allow navigation only if:
    // 1. Step is current or completed
    // 2. Step is not locked
    if (step.status !== "locked" && (step.status === "current" || step.status === "completed" || stepIndex <= activeStep)) {
      onStepClick(stepIndex)
    }
  }

  return (
    <StepperContainer>
      <Stepper
        activeStep={activeStep}
        orientation={effectiveOrientation}
        nonLinear={false} // Sequential navigation only
        sx={{
          ...(effectiveOrientation === "horizontal" && {
            ".MuiStepConnector-line": {
              borderTopWidth: 2,
            },
          }),
        }}
      >
        {steps.map((step, index) => {
          const isActive = activeStep === index
          const isCompleted = step.status === "completed"
          const isLocked = step.status === "locked"
          const isClickable = !isLocked && (isCompleted || isActive || index < activeStep)

          return (
            <Step
              key={step.id}
              completed={isCompleted}
              sx={{
                cursor: isClickable ? "pointer" : "not-allowed",
                opacity: isLocked ? 0.5 : 1,
              }}
              onClick={() => handleStepClick(index)}
            >
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon
                    active={isActive}
                    completed={isCompleted}
                    locked={isLocked}
                    icon={<Typography variant="h6">{index + 1}</Typography>}
                    progress={step.progress.percentage}
                  />
                )}
                optional={
                  effectiveOrientation === "horizontal" ? (
                    <Box sx={{ mt: 1 }}>
                      <StepStatusChip
                        estado={step.progress.estado}
                        status={step.status}
                      />
                      {!isLocked && (
                        <StepProgressBar
                          variant="determinate"
                          value={step.progress.percentage}
                          color={isCompleted ? "success" : isActive ? "primary" : "inherit"}
                        />
                      )}
                    </Box>
                  ) : undefined
                }
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      color: isLocked
                        ? theme.palette.text.disabled
                        : isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    }}
                  >
                    {step.label}
                  </Typography>
                  {effectiveOrientation === "vertical" && (
                    <Box sx={{ mt: 1 }}>
                      <StepStatusChip
                        estado={step.progress.estado}
                        status={step.status}
                      />
                    </Box>
                  )}
                </Box>
              </StepLabel>

              {effectiveOrientation === "vertical" && (
                <StepContent>
                  {!isLocked && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progreso: {Math.round(step.progress.percentage)}%
                      </Typography>
                      <StepProgressBar
                        variant="determinate"
                        value={step.progress.percentage}
                        color={isCompleted ? "success" : "primary"}
                      />
                    </Box>
                  )}
                </StepContent>
              )}
            </Step>
          )
        })}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mt: 4 }}>
        {steps[activeStep] && (
          <Box>
            <StepHeader>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steps[activeStep].description}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <StepStatusChip
                  estado={steps[activeStep].progress.estado}
                  status={steps[activeStep].status}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(steps[activeStep].progress.percentage)}% completado
                </Typography>
              </Box>
            </StepHeader>

            {/* Actual step content (section component) */}
            {steps[activeStep].content}
          </Box>
        )}
      </Box>
    </StepperContainer>
  )
}
