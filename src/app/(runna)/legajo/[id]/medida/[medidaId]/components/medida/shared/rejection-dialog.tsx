"use client"

/**
 * RejectionDialog - Reusable Rejection Confirmation Dialog
 *
 * Provides a dialog for rejecting workflow items with observaciones/comments.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - Text input for rejection reason/observaciones
 * - Confirmation and cancellation buttons
 * - Loading state during submission
 * - Input validation
 */

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material"
import CancelIcon from "@mui/icons-material/Cancel"
import CloseIcon from "@mui/icons-material/Close"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"

export interface RejectionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (observaciones: string) => void | Promise<void>

  // Labels and content
  title?: string
  description?: string
  observacionesLabel?: string
  observacionesPlaceholder?: string
  confirmButtonLabel?: string
  cancelButtonLabel?: string

  // State
  isSubmitting?: boolean

  // Validation
  minLength?: number
  required?: boolean
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Rechazar",
  description = "Por favor, indique el motivo del rechazo. Esta información será enviada al equipo técnico.",
  observacionesLabel = "Observaciones",
  observacionesPlaceholder = "Describa el motivo del rechazo...",
  confirmButtonLabel = "Rechazar",
  cancelButtonLabel = "Cancelar",
  isSubmitting = false,
  minLength = 10,
  required = true,
}) => {
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    // Validation
    if (required && !observaciones.trim()) {
      setError("Las observaciones son obligatorias")
      return
    }

    if (minLength && observaciones.trim().length < minLength) {
      setError(`Las observaciones deben tener al menos ${minLength} caracteres`)
      return
    }

    // Clear error and submit
    setError(null)
    await onConfirm(observaciones)

    // Reset on success (parent should close dialog)
    setObservaciones("")
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setObservaciones("")
      setError(null)
      onClose()
    }
  }

  const handleObservacionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setObservaciones(e.target.value)
    if (error) {
      setError(null)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <WarningAmberIcon color="warning" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Description */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          {description}
        </Alert>

        {/* Observaciones Input */}
        <TextField
          label={observacionesLabel}
          placeholder={observacionesPlaceholder}
          value={observaciones}
          onChange={handleObservacionesChange}
          multiline
          rows={4}
          fullWidth
          required={required}
          disabled={isSubmitting}
          error={!!error}
          helperText={
            error ||
            (minLength ? `Mínimo ${minLength} caracteres. Actual: ${observaciones.length}` : undefined)
          }
          autoFocus
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {/* Cancel Button */}
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          startIcon={<CloseIcon />}
          sx={{ textTransform: "none" }}
        >
          {cancelButtonLabel}
        </Button>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting || (!observaciones.trim() && required)}
          variant="contained"
          color="error"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <CancelIcon />}
          sx={{ textTransform: "none" }}
        >
          {isSubmitting ? "Rechazando..." : confirmButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
