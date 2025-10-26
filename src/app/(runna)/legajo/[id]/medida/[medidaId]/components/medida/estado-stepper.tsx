"use client"

/**
 * Estado Stepper Component - MED-01 V2
 *
 * Generic estado-based stepper for standard MPI/MPE workflows.
 *
 * Standard Workflows:
 * - MPI (APERTURA/INNOVACION/PRORROGA): Estados 1-2 only
 * - MPE (APERTURA/INNOVACION/PRORROGA/CESE): Estados 1-5 full progression
 *
 * Key Features:
 * - Catalog-based estado display (1-5 estados)
 * - Sequential progression visualization
 * - Role-based responsibility indicators
 * - Next action display per estado
 * - Type-aware (different estados for MPI vs MPE)
 *
 * NOT for:
 * - MPJ (uses MPJStageStepper - no estados)
 * - MPI Cese (uses MPICeseCompletion - no estados)
 * - MPE POST_CESE (uses MPEPostCeseSection - no estados)
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
  Chip,
  useTheme,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import type { TEstadoEtapaMedida, ResponsableTipo } from "../../types/estado-etapa"
import type { TipoMedida } from "../../types/medida-api"
import type { EtapaMedida } from "../../types/medida-api"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for Estado Stepper
 */
export interface EstadoStepperProps {
  /** Available estados from catalog (filtered by tipo_medida and tipo_etapa) */
  availableEstados: TEstadoEtapaMedida[]

  /** Current etapa with estado_especifico reference */
  etapaActual: EtapaMedida | null

  /** Measure type for display context */
  tipoMedida: TipoMedida

  /** Optional: Show detailed metadata */
  showMetadata?: boolean

  /** Optional: Orientation (horizontal or vertical) */
  orientation?: "horizontal" | "vertical"
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get active step index from current estado_especifico
 */
function getActiveEstadoIndex(
  availableEstados: TEstadoEtapaMedida[],
  etapaActual: EtapaMedida | null
): number {
  if (!etapaActual?.estado_especifico) {
    return 0 // Default to first estado
  }

  // estado_especifico can be the full object or null
  const currentEstadoId = typeof etapaActual.estado_especifico === 'object'
    ? etapaActual.estado_especifico.id
    : null

  if (!currentEstadoId) {
    return 0
  }

  const index = availableEstados.findIndex(
    (estado) => estado.id === currentEstadoId
  )

  return index >= 0 ? index : 0
}

/**
 * Get responsable type label
 */
function getResponsableLabel(responsableTipo: ResponsableTipo): string {
  const labels: Record<ResponsableTipo, string> = {
    EQUIPO_TECNICO: 'Equipo Técnico',
    JEFE_ZONAL: 'Jefe Zonal',
    DIRECTOR: 'Director',
    EQUIPO_LEGAL: 'Equipo Legal',
  }
  return labels[responsableTipo] || responsableTipo
}

/**
 * Get responsable chip color
 */
function getResponsableColor(responsableTipo: ResponsableTipo): 'primary' | 'secondary' | 'info' | 'warning' {
  const colors: Record<ResponsableTipo, 'primary' | 'secondary' | 'info' | 'warning'> = {
    EQUIPO_TECNICO: 'primary',
    JEFE_ZONAL: 'secondary',
    DIRECTOR: 'warning',
    EQUIPO_LEGAL: 'info',
  }
  return colors[responsableTipo] || 'primary'
}

/**
 * Get count label for MPI context
 */
function getEstadoCountLabel(tipoMedida: TipoMedida, totalEstados: number): string {
  if (tipoMedida === 'MPI') {
    return `Estados 1-2 (MPI usa solo los primeros ${totalEstados} estados)`
  }
  return `Estados 1-${totalEstados} (MPE usa todos los estados)`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EstadoStepper: React.FC<EstadoStepperProps> = ({
  availableEstados,
  etapaActual,
  tipoMedida,
  showMetadata = true,
  orientation = "horizontal",
}) => {
  const theme = useTheme()
  const activeEstadoIndex = getActiveEstadoIndex(availableEstados, etapaActual)

  // Find current estado object
  const currentEstadoId = typeof etapaActual?.estado_especifico === 'object' && etapaActual.estado_especifico !== null
    ? etapaActual.estado_especifico.id
    : null

  const currentEstado = currentEstadoId
    ? availableEstados.find((e) => e.id === currentEstadoId)
    : availableEstados[0]

  // Sort estados by orden
  const sortedEstados = [...availableEstados].sort((a, b) => a.orden - b.orden)

  if (sortedEstados.length === 0) {
    return (
      <Alert severity="warning">
        No hay estados disponibles para esta medida y etapa.
      </Alert>
    )
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {/* Info Alert for MPI */}
      {showMetadata && tipoMedida === 'MPI' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            MPI - Estados Simplificados
          </AlertTitle>
          <Typography variant="body2">
            {getEstadoCountLabel(tipoMedida, sortedEstados.length)}.
            Después del Estado {sortedEstados.length}, la etapa CESE se completa directamente sin estados adicionales.
          </Typography>
        </Alert>
      )}

      {/* Estado Stepper */}
      <Stepper
        activeStep={activeEstadoIndex}
        orientation={orientation}
        alternativeLabel={orientation === "horizontal"}
      >
        {sortedEstados.map((estado, index) => {
          const isActive = index === activeEstadoIndex
          const isCompleted = index < activeEstadoIndex

          return (
            <Step key={estado.id} completed={isCompleted}>
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
                      border: active ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                  >
                    {completed ? (
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {estado.orden}
                      </Typography>
                    )}
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
                  {estado.nombre_display}
                </Typography>

                {/* Estado Metadata */}
                {showMetadata && (
                  <Box sx={{ mt: 1 }}>
                    {/* Responsable Chip */}
                    <Chip
                      label={getResponsableLabel(estado.responsable_tipo)}
                      size="small"
                      color={getResponsableColor(estado.responsable_tipo)}
                      sx={{ mt: 0.5, mb: 0.5 }}
                    />

                    {/* Next Action */}
                    {estado.siguiente_accion && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: 'block',
                          mt: 0.5,
                          fontStyle: 'italic',
                        }}
                      >
                        {estado.siguiente_accion}
                      </Typography>
                    )}
                  </Box>
                )}
              </StepLabel>
            </Step>
          )
        })}
      </Stepper>

      {/* Current Estado Summary */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Estado Actual:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {currentEstado?.nombre_display || 'Estado no definido'}
          </Typography>
          <Chip
            label={getResponsableLabel(currentEstado?.responsable_tipo || 'EQUIPO_TECNICO')}
            size="small"
            color={getResponsableColor(currentEstado?.responsable_tipo || 'EQUIPO_TECNICO')}
          />
        </Box>

        {currentEstado?.siguiente_accion && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Siguiente Acción:
            </Typography>
            <Typography variant="body2">
              {currentEstado.siguiente_accion}
            </Typography>
          </Alert>
        )}

        {etapaActual?.observaciones && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: theme.palette.text.secondary }}>
            Observaciones: {etapaActual.observaciones}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default EstadoStepper
