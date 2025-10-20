"use client"

/**
 * WizardModal - Reusable Multi-Step Wizard Component
 *
 * Provides stepper UI and navigation for multi-step forms.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - Visual stepper with progress indicator
 * - Step navigation (next, back, direct step click)
 * - Responsive layout
 * - Customizable step labels
 * - Action buttons (primary and secondary)
 */

import type React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Typography,
  LinearProgress,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"

export interface WizardStep {
  label: string
  content: React.ReactNode
  optional?: boolean
}

export interface WizardModalProps {
  open: boolean
  onClose: () => void
  title: string
  steps: WizardStep[]
  activeStep: number
  onNext?: () => void
  onBack?: () => void
  onStepClick?: (step: number) => void
  primaryAction?: {
    label: string
    onClick: () => void | Promise<void>
    disabled?: boolean
    loading?: boolean
    icon?: React.ReactNode
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void | Promise<void>
    disabled?: boolean
    loading?: boolean
    icon?: React.ReactNode
    variant?: "text" | "outlined" | "contained"
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success"
  }>
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"
  fullWidth?: boolean
  showProgress?: boolean
  allowStepClick?: boolean
}

export const WizardModal: React.FC<WizardModalProps> = ({
  open,
  onClose,
  title,
  steps,
  activeStep,
  onNext,
  onBack,
  onStepClick,
  primaryAction,
  secondaryActions = [],
  maxWidth = "lg",
  fullWidth = true,
  showProgress = true,
  allowStepClick = true,
}) => {
  const progress = ((activeStep + 1) / steps.length) * 100
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === steps.length - 1

  const handleStepClick = (step: number) => {
    if (allowStepClick && onStepClick) {
      onStepClick(step)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Progress Bar */}
      {showProgress && (
        <Box sx={{ px: 3 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      )}

      {/* Stepper */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel
                optional={step.optional ? <Typography variant="caption">Opcional</Typography> : undefined}
                sx={{
                  cursor: allowStepClick ? "pointer" : "default",
                  "& .MuiStepLabel-label": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
                onClick={() => handleStepClick(index)}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 2, overflowY: "auto" }}>
        {steps[activeStep]?.content}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Back Button */}
          {!isFirstStep && onBack && (
            <Button
              onClick={onBack}
              startIcon={<NavigateBeforeIcon />}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Anterior
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant || "outlined"}
              color={action.color || "primary"}
              startIcon={action.icon}
              sx={{ textTransform: "none" }}
            >
              {action.label}
            </Button>
          ))}

          {/* Next Button */}
          {!isLastStep && onNext && (
            <Button
              onClick={onNext}
              endIcon={<NavigateNextIcon />}
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              Siguiente
            </Button>
          )}

          {/* Primary Action (usually on last step) */}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              variant="contained"
              color="primary"
              startIcon={primaryAction.loading ? undefined : primaryAction.icon}
              sx={{ textTransform: "none" }}
            >
              {primaryAction.loading ? "Procesando..." : primaryAction.label}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
