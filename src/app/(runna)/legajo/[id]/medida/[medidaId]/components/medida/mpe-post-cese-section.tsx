"use client"

/**
 * MPE Post-Cese Section Component - MED-01 V2
 *
 * Display section for MPE POST_CESE stage.
 * Allows PLTM activities after fecha_cese_efectivo.
 *
 * Business Logic (from MED-01 V2 spec):
 * - MPE can have POST_CESE stage after fecha_cese_efectivo is set
 * - POST_CESE stage does NOT use estados (estado_especifico = null)
 * - Only PLTM activities are allowed in this stage
 * - Used for follow-up activities after measure closure
 *
 * This component replaces the standard workflow for MPE POST_CESE.
 */

import React from "react"
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  useTheme,
} from "@mui/material"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import AssignmentIcon from "@mui/icons-material/Assignment"
import InfoIcon from "@mui/icons-material/Info"
import { SectionCard } from "./shared/section-card"

// ============================================================================
// TYPES
// ============================================================================

export interface MPEPostCeseSectionProps {
  /** Medida ID */
  medidaId: number

  /** Effective closure date */
  fechaCeseEfectivo: string

  /** Plan Trabajo ID for PLTM activities */
  planTrabajoId: number

  /** Optional: Current etapa name */
  etapaNombre?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MPEPostCeseSection: React.FC<MPEPostCeseSectionProps> = ({
  medidaId,
  fechaCeseEfectivo,
  planTrabajoId,
  etapaNombre,
}) => {
  const theme = useTheme()

  // Format fecha_cese_efectivo
  const formattedDate = new Date(fechaCeseEfectivo).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <SectionCard
      title="Post-Cese (MPE)"
      chips={[{ label: "Post-Cese", color: "info" }]}
      additionalInfo={["Actividades de seguimiento posterior al cese"]}
    >
      {/* Section Icon - Visual indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <EventAvailableIcon
          sx={{
            fontSize: 48,
            color: theme.palette.info.main,
          }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Etapa Post-Cese Activa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha de cese efectivo: {formattedDate}
          </Typography>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 3 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          Información
        </AlertTitle>
        <Typography variant="body2">
          Esta etapa permite registrar actividades de seguimiento posteriores al cese
          de la medida a través del Plan de Trabajo (PLTM).
        </Typography>
      </Alert>

      {/* Current Stage Info */}
      {etapaNombre && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            borderLeft: `4px solid ${theme.palette.info.main}`,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Etapa Actual:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {etapaNombre}
          </Typography>
        </Box>
      )}

      {/* Plan Trabajo Section Placeholder */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <AssignmentIcon
            sx={{
              fontSize: 64,
              color: theme.palette.grey[400],
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Plan de Trabajo (PLTM)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí se mostrarán las actividades PLTM de seguimiento post-cese.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Plan Trabajo ID: {planTrabajoId}
          </Typography>
        </Box>
      </Box>

      {/* Footer Note */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <strong>Nota:</strong> La etapa POST_CESE no utiliza estados de aprobación.
          Solo se pueden registrar actividades de seguimiento en el Plan de Trabajo.
        </Typography>
      </Box>
    </SectionCard>
  )
}

export default MPEPostCeseSection
