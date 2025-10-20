"use client"

/**
 * Workflow Step Content Wrapper
 *
 * Wraps workflow section components with step-specific UI elements:
 * - Step actions (Continue, Back, Skip)
 * - Help text and guidance
 * - Completion indicators
 * - Transition animations
 */

import React from "react"
import { Box, Button, Typography, Alert, Fade, Paper } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import type { StepStatus } from "../../types/workflow"

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowStepContentProps {
  /** The actual section component (AperturaSection, NotaAvalSection, etc.) */
  children: React.ReactNode

  /** Current step number (0-indexed) */
  stepNumber: number

  /** Total number of steps */
  totalSteps: number

  /** Step completion status */
  status: StepStatus

  /** Is this the first step? */
  isFirst: boolean

  /** Is this the last step? */
  isLast: boolean

  /** Can the user proceed to next step? */
  canContinue: boolean

  /** Callback when user clicks Continue/Next */
  onContinue?: () => void

  /** Callback when user clicks Back */
  onBack?: () => void

  /** Optional help text for this step */
  helpText?: string

  /** Optional warning/alert message */
  warningMessage?: string

  /** Show step navigation buttons */
  showNavigation?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

export const WorkflowStepContent: React.FC<WorkflowStepContentProps> = ({
  children,
  stepNumber,
  totalSteps,
  status,
  isFirst,
  isLast,
  canContinue,
  onContinue,
  onBack,
  helpText,
  warningMessage,
  showNavigation = true,
}) => {
  return (
    <Fade in timeout={500}>
      <Box>
        {/* Help Text */}
        {helpText && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {helpText}
          </Alert>
        )}

        {/* Warning Message */}
        {warningMessage && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {warningMessage}
          </Alert>
        )}

        {/* Step Content (actual section component) */}
        <Paper elevation={0} sx={{ p: 0 }}>
          {children}
        </Paper>

        {/* Step Navigation */}
        {showNavigation && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {/* Back Button */}
            <Box>
              {!isFirst && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={onBack}
                  sx={{ minWidth: 120 }}
                >
                  Anterior
                </Button>
              )}
            </Box>

            {/* Step Progress Info */}
            <Typography variant="body2" color="text.secondary">
              Paso {stepNumber + 1} de {totalSteps}
            </Typography>

            {/* Continue Button */}
            <Box>
              {!isLast ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onContinue}
                  disabled={!canContinue || status === "locked"}
                  sx={{ minWidth: 120 }}
                >
                  {canContinue ? "Continuar" : "Completar paso actual"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={onContinue}
                  disabled={!canContinue}
                  sx={{ minWidth: 120 }}
                >
                  {canContinue ? "Finalizar" : "Completar último paso"}
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Completion Guidance */}
        {status === "current" && !canContinue && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={false}>
              <Typography variant="body2">
                <strong>Para continuar al siguiente paso:</strong>
              </Typography>
              {getCompletionGuidance(stepNumber)}
            </Alert>
          </Box>
        )}
      </Box>
    </Fade>
  )
}

// ============================================================================
// HELPER: COMPLETION GUIDANCE PER STEP
// ============================================================================

function getCompletionGuidance(stepNumber: number): React.ReactNode {
  switch (stepNumber) {
    case 0: // Intervención
      return (
        <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
          <Typography component="li" variant="body2">
            Complete todos los campos requeridos del formulario
          </Typography>
          <Typography component="li" variant="body2">
            Suba los archivos necesarios (Modelo, Acta, etc.)
          </Typography>
          <Typography component="li" variant="body2">
            Envíe la intervención para aprobación (ET)
          </Typography>
          <Typography component="li" variant="body2">
            Espere la aprobación del Jefe de Zona (JZ)
          </Typography>
        </Box>
      )

    case 1: // Nota de Aval
      return (
        <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
          <Typography component="li" variant="body2">
            El Director de Zona debe crear la Nota de Aval
          </Typography>
          <Typography component="li" variant="body2">
            Seleccione una decisión: APROBAR u OBSERVAR
          </Typography>
          <Typography component="li" variant="body2">
            Agregue comentarios (obligatorio)
          </Typography>
          <Typography component="li" variant="body2">
            Suba el archivo PDF de la Nota de Aval oficial
          </Typography>
        </Box>
      )

    case 2: // Informe Jurídico
      return (
        <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
          <Typography component="li" variant="body2">
            El Equipo Legal debe crear el Informe Jurídico
          </Typography>
          <Typography component="li" variant="body2">
            Complete la información de notificaciones
          </Typography>
          <Typography component="li" variant="body2">
            Suba el Informe oficial (1 archivo obligatorio)
          </Typography>
          <Typography component="li" variant="body2">
            Suba los Acuses de Recibo (hasta 10 archivos)
          </Typography>
          <Typography component="li" variant="body2">
            Envíe el informe (no se podrá editar después)
          </Typography>
        </Box>
      )

    case 3: // Ratificación
      return (
        <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
          <Typography component="li" variant="body2">
            El Equipo Legal o JZ debe registrar la Ratificación
          </Typography>
          <Typography component="li" variant="body2">
            Suba la Resolución Judicial (archivo PDF obligatorio)
          </Typography>
          <Typography component="li" variant="body2">
            Agregue observaciones opcionales
          </Typography>
          <Typography component="li" variant="body2">
            Este paso completa la fase de Apertura
          </Typography>
        </Box>
      )

    default:
      return null
  }
}
