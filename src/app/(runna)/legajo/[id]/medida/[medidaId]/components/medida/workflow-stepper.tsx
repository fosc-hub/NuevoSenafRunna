"use client"

/**
 * Workflow Stepper Component
 *
 * Horizontal stepper that visualizes the 4-step workflow progression
 * with sequential navigation and completion status.
 *
 * Features:
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

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  activeStep: number
  onStepClick: (stepIndex: number) => void
  orientation?: "horizontal" | "vertical"
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

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  orientation = "horizontal",
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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
