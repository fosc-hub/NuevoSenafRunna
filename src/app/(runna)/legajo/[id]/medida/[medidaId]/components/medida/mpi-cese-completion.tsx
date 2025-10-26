"use client"

/**
 * MPI Cese Completion Component - MED-01 V2
 *
 * Display component for MPI CESE stage.
 * MPI Cese does NOT use estados workflow - only requires technical closure report.
 *
 * Business Logic (from MED-01 V2 spec):
 * - MPI APERTURA: Uses estados 1-2 (Registro → Aprobación JZ)
 * - MPI CESE: NO estados, direct closure with informe de cierre técnico
 *
 * This component replaces the standard workflow stepper for MPI CESE.
 */

import React from "react"
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import InfoIcon from "@mui/icons-material/Info"
import type { EtapaMedida } from "../../types/medida-api"

// ============================================================================
// TYPES
// ============================================================================

export interface MPICeseCompletionProps {
  /** Current etapa from medida */
  etapaActual: EtapaMedida | null

  /** Optional: Show detailed instructions */
  showInstructions?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MPICeseCompletion: React.FC<MPICeseCompletionProps> = ({
  etapaActual,
  showInstructions = true,
}) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 48,
            color: theme.palette.success.main,
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Cese de Medida de Protección Integral (MPI)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Proceso simplificado de cierre
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
          Flujo Simplificado
        </AlertTitle>
        <Typography variant="body2">
          El cese de MPI no requiere el proceso jurídico completo (estados 1-5).
          Solo es necesario completar el informe técnico de cierre.
        </Typography>
      </Alert>

      {/* Current Stage Info */}
      {etapaActual && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Etapa Actual:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {etapaActual.nombre}
          </Typography>
          {etapaActual.fecha_creacion && (
            <Typography variant="caption" color="text.secondary">
              Iniciado: {new Date(etapaActual.fecha_creacion).toLocaleDateString('es-AR')}
            </Typography>
          )}
          {etapaActual.observaciones && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {etapaActual.observaciones}
            </Typography>
          )}
        </Box>
      )}

      {/* Instructions */}
      {showInstructions && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Pasos para completar el cierre:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <AssignmentTurnedInIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Completar Informe Técnico de Cierre"
                secondary="Documentar el proceso de intervención y resultados obtenidos"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AssignmentTurnedInIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Adjuntar Documentación de Respaldo"
                secondary="Incluir evidencias y actas relevantes del proceso"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Registrar Fecha de Cierre Efectivo"
                secondary="Indicar la fecha oficial de finalización de la medida"
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Footer Note */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <strong>Nota:</strong> El cese de MPI no requiere aprobación de Director ni
          informe jurídico, a diferencia de las Medidas de Protección Excepcional (MPE).
        </Typography>
      </Box>
    </Paper>
  )
}

export default MPICeseCompletion
