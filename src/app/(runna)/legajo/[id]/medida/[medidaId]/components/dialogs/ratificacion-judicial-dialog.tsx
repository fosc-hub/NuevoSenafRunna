"use client"

/**
 * RatificacionJudicialDialog Component (MED-05)
 * Dialog para registrar Ratificación Judicial de una medida
 *
 * Características:
 * - Formulario completo de ratificación (decisión, fechas, observaciones)
 * - Upload de archivos multipart (resolución, cédula, acuse)
 * - Validaciones frontend de fechas y archivos
 * - Manejo de errores y loading states
 *
 * Validaciones:
 * - Decisión judicial requerida
 * - Fecha resolución requerida y no futura
 * - Fecha notificación >= fecha resolución (si existe)
 * - Archivo resolución judicial obligatorio (PDF)
 * - Archivos opcionales: cédula y acuse
 */

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormHelperText,
  IconButton,
  Chip,
} from "@mui/material"
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import type {
  CreateRatificacionJudicialRequest,
  UpdateRatificacionJudicialRequest,
  RatificacionJudicial,
} from "../../types/ratificacion-judicial-api"
import {
  DecisionJudicial,
  DECISION_JUDICIAL_LABELS,
  validateRatificacionDates,
} from "../../types/ratificacion-judicial-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface RatificacionJudicialDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateRatificacionJudicialRequest | UpdateRatificacionJudicialRequest) => Promise<void>
  isLoading?: boolean
  medidaNumero?: string
  mode?: "create" | "edit"
  initialData?: RatificacionJudicial | null
  etapaId?: number // ID de la etapa específica (Apertura, Innovación, Prórroga, Cese)
}

interface FormErrors {
  decision?: string
  fecha_resolucion?: string
  fecha_notificacion?: string
  archivo_resolucion_judicial?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RatificacionJudicialDialog: React.FC<
  RatificacionJudicialDialogProps
> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  medidaNumero,
  mode = "create",
  initialData = null,
  etapaId,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Initialize form data based on mode
  const getInitialFormData = () => {
    if (mode === "edit" && initialData) {
      return {
        decision: initialData.decision,
        fecha_resolucion: initialData.fecha_resolucion,
        fecha_notificacion: initialData.fecha_notificacion || "",
        observaciones: initialData.observaciones || "",
      }
    }
    return {
      decision: DecisionJudicial.PENDIENTE,
      fecha_resolucion: "",
      fecha_notificacion: "",
      observaciones: "",
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())

  const [files, setFiles] = useState<{
    archivo_resolucion_judicial: File | null
    archivo_cedula_notificacion: File | null
    archivo_acuse_recibo: File | null
  }>({
    archivo_resolucion_judicial: null,
    archivo_cedula_notificacion: null,
    archivo_acuse_recibo: null,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Update form data when initialData changes (edit mode)
  React.useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setFormData({
        decision: initialData.decision,
        fecha_resolucion: initialData.fecha_resolucion,
        fecha_notificacion: initialData.fecha_notificacion || "",
        observaciones: initialData.observaciones || "",
      })
    } else if (open && mode === "create") {
      // Reset to defaults for create mode
      setFormData({
        decision: DecisionJudicial.PENDIENTE,
        fecha_resolucion: "",
        fecha_notificacion: "",
        observaciones: "",
      })
    }
  }, [open, mode, initialData])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle form field changes
   */
  const handleFieldChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear field error
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (
    field: keyof typeof files,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (file) {
      // Validate PDF
      if (!file.name.endsWith(".pdf")) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Solo se permiten archivos PDF",
        }))
        return
      }

      setFiles((prev) => ({
        ...prev,
        [field]: file,
      }))

      // Clear error
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  /**
   * Handle file removal
   */
  const handleFileRemove = (field: keyof typeof files) => {
    setFiles((prev) => ({
      ...prev,
      [field]: null,
    }))
  }

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate decision
    if (!formData.decision) {
      newErrors.decision = "La decisión judicial es requerida"
    }

    // Validate fecha_resolucion
    if (!formData.fecha_resolucion) {
      newErrors.fecha_resolucion = "La fecha de resolución es requerida"
    } else {
      // Validate dates
      const dateValidation = validateRatificacionDates(
        formData.fecha_resolucion,
        formData.fecha_notificacion || undefined
      )

      if (!dateValidation.valid) {
        if (dateValidation.errors[0]?.includes("resolución")) {
          newErrors.fecha_resolucion = dateValidation.errors[0]
        }
        if (dateValidation.errors[0]?.includes("notificación")) {
          newErrors.fecha_notificacion = dateValidation.errors[0]
        }
      }
    }

    // Validate archivo_resolucion_judicial
    // En modo create es obligatorio, en edit es opcional (solo si se quiere reemplazar)
    if (mode === "create" && !files.archivo_resolucion_judicial) {
      newErrors.archivo_resolucion_judicial =
        "El archivo de resolución judicial es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async () => {
    setSubmitError(null)

    // Validate
    if (!validateForm()) {
      return
    }

    // Build request based on mode
    if (mode === "create") {
      // Validate etapaId is provided
      if (!etapaId) {
        setSubmitError("Error: No se ha especificado la etapa para esta ratificación")
        return
      }

      const request: CreateRatificacionJudicialRequest = {
        etapa_id: etapaId,
        decision: formData.decision as DecisionJudicial,
        fecha_resolucion: formData.fecha_resolucion,
        fecha_notificacion: formData.fecha_notificacion || undefined,
        observaciones: formData.observaciones || undefined,
        archivo_resolucion_judicial: files.archivo_resolucion_judicial!,
        archivo_cedula_notificacion:
          files.archivo_cedula_notificacion || undefined,
        archivo_acuse_recibo: files.archivo_acuse_recibo || undefined,
      }

      try {
        await onSubmit(request)
        handleClose()
      } catch (error: any) {
        setSubmitError(error.message || "Error al registrar ratificación")
      }
    } else {
      // Edit mode: solo incluir campos que cambiaron
      const request: UpdateRatificacionJudicialRequest = {
        decision: formData.decision as DecisionJudicial,
        fecha_resolucion: formData.fecha_resolucion,
        fecha_notificacion: formData.fecha_notificacion || undefined,
        observaciones: formData.observaciones || undefined,
        // Solo incluir archivos si se seleccionaron nuevos
        archivo_resolucion_judicial:
          files.archivo_resolucion_judicial || undefined,
        archivo_cedula_notificacion:
          files.archivo_cedula_notificacion || undefined,
        archivo_acuse_recibo: files.archivo_acuse_recibo || undefined,
      }

      try {
        await onSubmit(request)
        handleClose()
      } catch (error: any) {
        setSubmitError(error.message || "Error al actualizar ratificación")
      }
    }
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (isLoading) return

    // Reset form
    setFormData({
      decision: DecisionJudicial.PENDIENTE,
      fecha_resolucion: "",
      fecha_notificacion: "",
      observaciones: "",
    })
    setFiles({
      archivo_resolucion_judicial: null,
      archivo_cedula_notificacion: null,
      archivo_acuse_recibo: null,
    })
    setErrors({})
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
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {mode === "create"
                ? "Registrar Ratificación Judicial"
                : "Editar Ratificación Judicial"}
            </Typography>
            {medidaNumero && (
              <Typography variant="body2" color="text.secondary">
                Medida: {medidaNumero}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Submit Error */}
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {/* Decisión Judicial */}
          <FormControl fullWidth error={!!errors.decision}>
            <InputLabel>Decisión Judicial *</InputLabel>
            <Select
              value={formData.decision}
              onChange={(e) => handleFieldChange("decision", e.target.value)}
              label="Decisión Judicial *"
              disabled={isLoading}
            >
              {Object.entries(DECISION_JUDICIAL_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {errors.decision && (
              <FormHelperText>{errors.decision}</FormHelperText>
            )}
          </FormControl>

          {/* Fecha Resolución */}
          <TextField
            fullWidth
            type="date"
            label="Fecha de Resolución *"
            value={formData.fecha_resolucion}
            onChange={(e) => handleFieldChange("fecha_resolucion", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.fecha_resolucion}
            helperText={errors.fecha_resolucion || "Fecha oficial de la resolución judicial"}
            disabled={isLoading}
          />

          {/* Fecha Notificación */}
          <TextField
            fullWidth
            type="date"
            label="Fecha de Notificación"
            value={formData.fecha_notificacion}
            onChange={(e) => handleFieldChange("fecha_notificacion", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.fecha_notificacion}
            helperText={
              errors.fecha_notificacion || "Opcional - Fecha de notificación a las partes"
            }
            disabled={isLoading}
          />

          {/* Observaciones */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => handleFieldChange("observaciones", e.target.value)}
            placeholder="Comentarios adicionales sobre la resolución judicial..."
            disabled={isLoading}
          />

          {/* Divider */}
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Adjuntos
            </Typography>

            {/* Archivo Resolución Judicial */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Resolución Judicial {mode === "create" ? "*" : "(Opcional)"} (PDF)
              </Typography>
              {mode === "edit" && initialData && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  {initialData.adjuntos?.find(adj => adj.tipo_adjunto === "RESOLUCION_JUDICIAL")
                    ? `Archivo actual: Resolución Judicial existente. Sube uno nuevo para reemplazarlo.`
                    : "No hay archivo actual. Sube uno nuevo si deseas agregarlo."}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  Seleccionar Archivo
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) =>
                      handleFileSelect("archivo_resolucion_judicial", e)
                    }
                  />
                </Button>
                {files.archivo_resolucion_judicial && (
                  <Chip
                    label={files.archivo_resolucion_judicial.name}
                    icon={<DescriptionIcon />}
                    onDelete={() => handleFileRemove("archivo_resolucion_judicial")}
                    deleteIcon={<DeleteIcon />}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
              {errors.archivo_resolucion_judicial && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {errors.archivo_resolucion_judicial}
                </Typography>
              )}
            </Box>

            {/* Archivo Cédula Notificación (Opcional) */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Cédula de Notificación (PDF - Opcional)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  Seleccionar Archivo
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) =>
                      handleFileSelect("archivo_cedula_notificacion", e)
                    }
                  />
                </Button>
                {files.archivo_cedula_notificacion && (
                  <Chip
                    label={files.archivo_cedula_notificacion.name}
                    icon={<DescriptionIcon />}
                    onDelete={() => handleFileRemove("archivo_cedula_notificacion")}
                    deleteIcon={<DeleteIcon />}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {/* Archivo Acuse Recibo (Opcional) */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Acuse de Recibo (PDF - Opcional)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  Seleccionar Archivo
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => handleFileSelect("archivo_acuse_recibo", e)}
                  />
                </Button>
                {files.archivo_acuse_recibo && (
                  <Chip
                    label={files.archivo_acuse_recibo.name}
                    icon={<DescriptionIcon />}
                    onDelete={() => handleFileRemove("archivo_acuse_recibo")}
                    deleteIcon={<DeleteIcon />}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: "#4f3ff0",
            "&:hover": { backgroundColor: "#3a2cc2" },
            textTransform: "none",
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {mode === "create" ? "Registrando..." : "Actualizando..."}
            </>
          ) : (
            mode === "create" ? "Registrar Ratificación" : "Actualizar Ratificación"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RatificacionJudicialDialog
