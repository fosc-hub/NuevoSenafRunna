"use client"

/**
 * MPJ Stage Stepper Component - MED-01 V2
 *
 * MPJ-specific stepper showing only stage transitions (no estados).
 *
 * MPJ Workflow:
 * - APERTURA: Initial stage when medida is created
 * - PROCESO: Judicial process stage (auto-transitions when PLTM activity with etapa_medida_aplicable='PROCESO' is created)
 * - CESE: Closure stage (auto-transitions when PLTM activity with etapa_medida_aplicable='CESE' is created)
 *
 * Key Differences from MPI/MPE:
 * - NO estados (estado_especifico = null always)
 * - Stage transitions triggered by PLTM activity creation, not manual estado changes
 * - Only 3 stages (no INNOVACION, PRORROGA, or POST_CESE)
 *
 * Features:
 * - Visual stage progression indicator
 * - Informational alert about auto-transitions
 * - Clean, minimal UI without estado complexity
 */

import React from "react"
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  useTheme,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import GavelIcon from "@mui/icons-material/Gavel"
import AssignmentIcon from "@mui/icons-material/Assignment"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import type { TipoEtapa } from "../../types/estado-etapa"
import type { EtapaMedida } from "../../types/medida-api"

// ============================================================================
// TYPES
// ============================================================================

/**
 * MPJ Stage configuration
 */
interface MPJStage {
  tipo_etapa: TipoEtapa
  label: string
  description: string
  icon: React.ReactElement
}

/**
 * Props for MPJ Stage Stepper
 */
export interface MPJStageStepperProps {
  /** Current etapa from medida */
  etapaActual: EtapaMedida | null

  /** Optional: Show detailed descriptions */
  showDescriptions?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * MPJ Stage definitions (ordered)
 */
const MPJ_STAGES: MPJStage[] = [
  {
    tipo_etapa: 'APERTURA',
    label: 'Apertura de la Medida',
    description: 'Medida penal juvenil iniciada y asignada al equipo técnico',
    icon: <AssignmentIcon />,
  },
  {
    tipo_etapa: 'PROCESO',
    label: 'Proceso Judicial',
    description: 'En trámite judicial con oficios y actividades PLTM',
    icon: <GavelIcon />,
  },
  {
    tipo_etapa: 'CESE',
    label: 'Cese de la Medida',
    description: 'Medida finalizada por resolución judicial',
    icon: <CheckCircleIcon />,
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get active step index from current etapa
 */
function getActiveStepIndex(etapaActual: EtapaMedida | null): number {
  if (!etapaActual) {
    return 0 // Default to APERTURA
  }

  const index = MPJ_STAGES.findIndex(
    (stage) => stage.tipo_etapa === etapaActual.tipo_etapa
  )

  return index >= 0 ? index : 0
}

/**
 * Get stage label by tipo_etapa
 */
function getStageLabel(tipoEtapa: TipoEtapa | null): string {
  if (!tipoEtapa) return 'Sin etapa definida'

  const stage = MPJ_STAGES.find((s) => s.tipo_etapa === tipoEtapa)
  return stage?.label || tipoEtapa
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MPJStageStepper: React.FC<MPJStageStepperProps> = ({
  etapaActual,
  showDescriptions = true,
}) => {
  const theme = useTheme()
  const activeStepIndex = getActiveStepIndex(etapaActual)

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {/* Info Alert */}
      {showDescriptions && (
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{ mb: 3 }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            MPJ - Transiciones Automáticas
          </AlertTitle>
          <Typography variant="body2">
            Las etapas de Medidas Penales Juveniles avanzan automáticamente al crear
            actividades en el Plan de Trabajo (PLTM). No hay estados intermedios de
            aprobación como en MPI/MPE.
          </Typography>
        </Alert>
      )}

      {/* Stage Stepper */}
      <Stepper activeStep={activeStepIndex} alternativeLabel>
        {MPJ_STAGES.map((stage, index) => {
          const isActive = index === activeStepIndex
          const isCompleted = index < activeStepIndex

          return (
            <Step key={stage.tipo_etapa} completed={isCompleted}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: completed
                        ? theme.palette.success.light
                        : active
                        ? theme.palette.primary.light
                        : theme.palette.grey[200],
                      color: completed
                        ? theme.palette.success.main
                        : active
                        ? theme.palette.primary.main
                        : theme.palette.grey[500],
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {React.cloneElement(stage.icon, {
                      sx: { fontSize: 24 },
                    })}
                  </Box>
                )}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isActive ? 700 : 600,
                    color: isCompleted
                      ? theme.palette.success.main
                      : isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    mt: 1,
                  }}
                >
                  {stage.label}
                </Typography>
                {showDescriptions && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      mt: 0.5,
                      display: 'block',
                    }}
                  >
                    {stage.description}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          )
        })}
      </Stepper>

      {/* Current Stage Summary */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Etapa Actual:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {getStageLabel(etapaActual?.tipo_etapa || null)}
        </Typography>
        {etapaActual?.nombre && (
          <Typography variant="caption" color="text.secondary">
            {etapaActual.nombre}
          </Typography>
        )}
        {etapaActual?.observaciones && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {etapaActual.observaciones}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default MPJStageStepper
