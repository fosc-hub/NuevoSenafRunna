"use client"

/**
 * InformeJuridicoDialog Component (MED-04)
 * Modal para crear Informe Jurídico por Equipo Legal
 *
 * Características:
 * - Formulario para datos del informe jurídico
 * - Campos: observaciones, instituciones_notificadas, fecha_notificaciones,
 *   medio_notificacion, destinatarios
 * - Validaciones frontend (fecha no futura, campos obligatorios)
 * - Feedback de éxito/error
 * - Upload de adjuntos después de crear informe
 */

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material"
import {
  Close as CloseIcon,
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import {
  MEDIO_NOTIFICACION_LABELS,
  validateFechaNotificaciones,
} from "../../types/informe-juridico-api"
import type {
  CreateInformeJuridicoRequest,
  MedioNotificacion,
} from "../../types/informe-juridico-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface InformeJuridicoDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateInformeJuridicoRequest) => Promise<void>
  isLoading?: boolean
  medidaNumero?: string
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialFormData = (): CreateInformeJuridicoRequest => ({
  observaciones: "",
  instituciones_notificadas: "",
  fecha_notificaciones: new Date().toISOString().split("T")[0], // Today in YYYY-MM-DD
  medio_notificacion: "EMAIL",
  destinatarios: "",
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InformeJuridicoDialog: React.FC<InformeJuridicoDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  medidaNumero,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<CreateInformeJuridicoRequest>(
    getInitialFormData()
  )
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle form field change
   */
  const handleFieldChange = (field: keyof CreateInformeJuridicoRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Instituciones notificadas (obligatorio)
    if (!formData.instituciones_notificadas.trim()) {
      errors.instituciones_notificadas = "Las instituciones notificadas son obligatorias"
    }

    // Destinatarios (obligatorio)
    if (!formData.destinatarios.trim()) {
      errors.destinatarios = "Los destinatarios son obligatorios"
    }

    // Fecha de notificaciones (obligatorio y no puede ser futura)
    if (!formData.fecha_notificaciones) {
      errors.fecha_notificaciones = "La fecha de notificaciones es obligatoria"
    } else if (!validateFechaNotificaciones(formData.fecha_notificaciones)) {
      errors.fecha_notificaciones = "La fecha de notificaciones no puede ser futura"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    // Validate
    if (!validateForm()) {
      return
    }

    try {
      setSubmitError(null)
      await onSubmit(formData)

      // Reset form
      setFormData(getInitialFormData())
      setFormErrors({})

      // Close dialog
      onClose()
    } catch (error: any) {
      console.error("Error creating informe jurídico:", error)
      setSubmitError(error.message || "Error al crear informe jurídico")
    }
  }

  /**
   * Handle close
   */
  const handleClose = () => {
    if (isLoading) return

    // Reset form
    setFormData(getInitialFormData())
    setFormErrors({})
    setSubmitError(null)

    onClose()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 600,
          fontSize: "1.5rem",
          position: "relative",
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        Crear Informe Jurídico
        {medidaNumero && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Medida: {medidaNumero}
          </Typography>
        )}
        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Observaciones */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Observaciones (opcional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleFieldChange("observaciones", e.target.value)}
              placeholder="Observaciones adicionales del Equipo Legal..."
              variant="outlined"
              disabled={isLoading}
            />
          </Box>

          <Divider />

          {/* Notificaciones Section */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notificaciones Institucionales
          </Typography>

          {/* Instituciones Notificadas */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Instituciones Notificadas *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={formData.instituciones_notificadas}
              onChange={(e) =>
                handleFieldChange("instituciones_notificadas", e.target.value)
              }
              placeholder="Juzgado de Familia N°5, Defensoría de NNyA, Área de Salud Mental..."
              variant="outlined"
              disabled={isLoading}
              error={!!formErrors.instituciones_notificadas}
              helperText={formErrors.instituciones_notificadas}
            />
          </Box>

          {/* Fecha y Medio de Notificación */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Fecha de Notificaciones */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Fecha de Notificaciones *
              </Typography>
              <TextField
                type="date"
                fullWidth
                value={formData.fecha_notificaciones}
                onChange={(e) => handleFieldChange("fecha_notificaciones", e.target.value)}
                variant="outlined"
                disabled={isLoading}
                error={!!formErrors.fecha_notificaciones}
                helperText={formErrors.fecha_notificaciones}
                InputProps={{
                  inputProps: {
                    max: new Date().toISOString().split("T")[0], // Max today
                  },
                }}
              />
            </Box>

            {/* Medio de Notificación */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Medio de Notificación *
              </Typography>
              <FormControl fullWidth disabled={isLoading}>
                <Select
                  value={formData.medio_notificacion}
                  onChange={(e) =>
                    handleFieldChange(
                      "medio_notificacion",
                      e.target.value as MedioNotificacion
                    )
                  }
                >
                  {Object.entries(MEDIO_NOTIFICACION_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Destinatarios */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Destinatarios *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={formData.destinatarios}
              onChange={(e) => handleFieldChange("destinatarios", e.target.value)}
              placeholder="juzgadofamilia5@jus.gob.ar, defensoria@gob.ar, saludmental@gob.ar..."
              variant="outlined"
              disabled={isLoading}
              error={!!formErrors.destinatarios}
              helperText={
                formErrors.destinatarios ||
                "Emails, direcciones o nombres de contacto de los destinatarios"
              }
            />
          </Box>

          {/* Submit Error */}
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              Después de crear el informe, podrá adjuntar el informe jurídico oficial
              (PDF) y los acuses de recibo de las notificaciones.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 4, pb: 3, pt: 2, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
          fullWidth
          size="large"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          fullWidth
          size="large"
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
            backgroundColor: "#4f3ff0",
            "&:hover": { backgroundColor: "#3a2cc2" },
          }}
        >
          {isLoading ? "Guardando..." : "Guardar Informe"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
