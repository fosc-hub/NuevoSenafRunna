"use client"

/**
 * Rechazar Cierre Modal - MED-MPI-CIERRE
 *
 * Modal for Jefe Zonal to reject closure report and return to Estado 3
 *
 * Features:
 * - Show current informe context for reference
 * - Observaciones textarea (required)
 * - Warning message about consequences
 * - Confirmation before submission
 * - Error handling
 *
 * Workflow:
 * 1. JZ reviews informe context
 * 2. JZ enters observaciones explaining rejection reason
 * 3. System returns medida to Estado 3
 * 4. System marks current informe as rejected and inactive
 * 5. System notifies ET with observaciones
 */

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import WarningIcon from "@mui/icons-material/Warning"
import { rechazarCierre } from "../../api/informe-cierre-api-service"
import type { InformeCierre } from "../../types/informe-cierre-api"

// ============================================================================
// PROPS
// ============================================================================

interface RechazarCierreModalProps {
  open: boolean
  onClose: () => void
  medidaId: number
  informe: InformeCierre | null
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RechazarCierreModal: React.FC<RechazarCierreModalProps> = ({
  open,
  onClose,
  medidaId,
  informe,
  onSuccess,
}) => {
  // ========== State ==========
  const [observaciones, setObservaciones] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ========== Validation ==========
  const canSubmit = observaciones.trim().length > 0 && !isSubmitting

  // ========== Submit Handler ==========
  const handleSubmit = async () => {
    setError(null)

    // Validate observaciones
    if (observaciones.trim().length === 0) {
      setError("Las observaciones son obligatorias al rechazar un informe de cierre")
      return
    }

    setIsSubmitting(true)

    try {
      // Call rejection endpoint
      // This returns medida to Estado 3 and marks informe as rejected
      await rechazarCierre(medidaId, {
        observaciones: observaciones.trim(),
      })

      console.log("Informe rechazado successfully")

      // Success - notify parent and close
      if (onSuccess) {
        onSuccess()
      }

      // Close modal and reset
      handleClose()
    } catch (err: any) {
      console.error("Error rechazando informe:", err)

      // Extract error message
      const errorMessage =
        err?.response?.data?.detalle ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al rechazar el informe de cierre"

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== Close Handler ==========
  const handleClose = () => {
    if (isSubmitting) return // Prevent close during submission

    // Reset state
    setObservaciones("")
    setError(null)
    onClose()
  }

  // ========== Render ==========
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Rechazar Informe de Cierre
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Warning Alert */}
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Consecuencias del rechazo:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>La medida volverá a Estado 3 (Pendiente de informe de cierre)</li>
            <li>El Equipo Técnico será notificado para realizar correcciones</li>
            <li>El informe actual se marcará como rechazado</li>
          </ul>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Informe Context */}
        {informe && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Informe Actual (Para Referencia)
            </Typography>
            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" color="text.secondary" display="block">
              Elaborado por: {informe.elaborado_por_detalle.nombre_completo}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Fecha: {new Date(informe.fecha_registro).toLocaleDateString("es-AR")}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {informe.observaciones}
            </Typography>

            {informe.adjuntos.length > 0 && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Adjuntos: {informe.adjuntos.length} archivo(s)
              </Typography>
            )}
          </Paper>
        )}

        {/* Observaciones de Rechazo */}
        <TextField
          label="Observaciones de Rechazo *"
          multiline
          rows={5}
          fullWidth
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Especifique qué aspectos deben corregirse o mejorarse en el informe..."
          helperText="Explique detalladamente las razones del rechazo y qué correcciones debe realizar el Equipo Técnico"
          error={error !== null && observaciones.trim().length === 0}
          disabled={isSubmitting}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!canSubmit}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting ? "Rechazando..." : "Rechazar Informe"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
