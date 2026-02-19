"use client"

/**
 * CeseMedidaModal Component
 *
 * Confirmation dialog for closing protection measures (MPI and MPE).
 * Supports both direct closure (MPI) and two-phase closure (MPE Flow A/B).
 *
 * Features:
 * - Dynamic title and button text based on measure type and flow
 * - Optional observaciones field
 * - Checkbox to cancel pending activities (MPI and MPE Flow A only)
 * - Loading state during API call
 * - Visual feedback with icons and colors
 */

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material"
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"

// ============================================================================
// INTERFACES
// ============================================================================

interface CeseMedidaModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Type of measure (MPI or MPE) */
  tipoMedida: "MPI" | "MPE"
  /**
   * Whether the medida is in CESE etapa (MPE only)
   * - false: Flow A (Solicitar Cese - initiates cese)
   * - true: Flow B (Confirmar Cese - closes medida)
   */
  esEtapaCese?: boolean
  /**
   * Callback when user confirms the action
   * @param observaciones - Optional reason for closure
   * @param cancelarActividades - Whether to cancel pending activities
   */
  onConfirm: (observaciones: string, cancelarActividades: boolean) => Promise<void>
  /** Whether the API call is in progress */
  isLoading: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get modal configuration based on tipo and flow
 */
const getModalConfig = (tipoMedida: "MPI" | "MPE", esEtapaCese?: boolean) => {
  if (tipoMedida === "MPI") {
    return {
      title: "Confirmar Cese de Medida MPI",
      description: "Esta accion cerrara la medida de forma permanente. Las actividades pendientes seran canceladas.",
      buttonText: "Cesar Medida",
      buttonColor: "error" as const,
      showCancelarActividades: true,
      severity: "warning" as const,
    }
  }

  // MPE
  if (esEtapaCese) {
    // Flow B - Confirmar Cese
    return {
      title: "Confirmar Cese de Medida MPE",
      description: "Esto cerrara la medida definitivamente y creara la etapa POST_CESE para seguimiento.",
      buttonText: "Confirmar Cese",
      buttonColor: "error" as const,
      showCancelarActividades: false, // Activities already handled in Flow A
      severity: "warning" as const,
    }
  }

  // Flow A - Solicitar Cese
  return {
    title: "Solicitar Cese de Medida MPE",
    description: "Esto iniciara el proceso de cese. Debera completar el ciclo MED-02 → MED-05 antes del cierre definitivo.",
    buttonText: "Solicitar Cese",
    buttonColor: "warning" as const,
    showCancelarActividades: true,
    severity: "info" as const,
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CeseMedidaModal: React.FC<CeseMedidaModalProps> = ({
  open,
  onClose,
  tipoMedida,
  esEtapaCese = false,
  onConfirm,
  isLoading,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [observaciones, setObservaciones] = useState("")
  const [cancelarActividades, setCancelarActividades] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // CONFIG
  // ============================================================================

  const config = getModalConfig(tipoMedida, esEtapaCese)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle confirm action
   */
  const handleConfirm = async () => {
    setError(null)
    try {
      await onConfirm(observaciones, cancelarActividades)
      // Reset form on success
      setObservaciones("")
      setCancelarActividades(true)
    } catch (err: any) {
      setError(err?.message || "Error al procesar la solicitud")
    }
  }

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isLoading) {
      setObservaciones("")
      setCancelarActividades(true)
      setError(null)
      onClose()
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 1,
        }}
      >
        <WarningIcon color="warning" />
        <Typography variant="h6" component="span">
          {config.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Description Alert */}
          <Alert severity={config.severity} icon={<WarningIcon />}>
            <Typography variant="body2">{config.description}</Typography>
          </Alert>

          {/* Observaciones Field */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones (opcional)"
            placeholder="Ingrese el motivo del cese..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={isLoading}
            variant="outlined"
          />

          {/* Cancelar Actividades Checkbox */}
          {config.showCancelarActividades && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={cancelarActividades}
                  onChange={(e) => setCancelarActividades(e.target.checked)}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label="Cancelar actividades pendientes automaticamente"
            />
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<CloseIcon />}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={config.buttonColor}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircleIcon />
            )
          }
          sx={{ textTransform: "none" }}
        >
          {isLoading ? "Procesando..." : config.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CeseMedidaModal
