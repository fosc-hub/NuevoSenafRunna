"use client"

/**
 * InformeJuridicoDialog Component (MED-04)
 * Modal para crear y enviar Informe Jurídico por Equipo Legal
 *
 * Flujo unificado:
 * - Formulario con datos del informe jurídico
 * - Upload de informe oficial (PDF, obligatorio)
 * - Upload de acuses de recibo (PDFs, opcionales)
 * - Crea + sube archivos + envía en una operación atómica
 */

import React, { useState, useRef } from "react"
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
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material"
import {
  Close as CloseIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material"
import {
  MEDIO_NOTIFICACION_LABELS,
  validateFechaNotificaciones,
  ADJUNTO_INFORME_JURIDICO_CONFIG,
} from "../../types/informe-juridico-api"
import type {
  MedioNotificacion,
  CrearYEnviarInformeJuridicoRequest,
} from "../../types/informe-juridico-api"
import { getCurrentDateISO } from "@/utils/dateUtils"

// ============================================================================
// INTERFACES
// ============================================================================

interface InformeJuridicoDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CrearYEnviarInformeJuridicoRequest) => Promise<void>
  isLoading?: boolean
  medidaNumero?: string
}

interface FormData {
  observaciones: string
  instituciones_notificadas: string
  fecha_notificaciones: string
  medio_notificacion: MedioNotificacion
  destinatarios: string
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialFormData = (): FormData => ({
  observaciones: "",
  instituciones_notificadas: "",
  fecha_notificaciones: getCurrentDateISO(),
  medio_notificacion: "EMAIL",
  destinatarios: "",
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const validatePdfFile = (file: File): string | null => {
  if (file.type !== 'application/pdf') {
    return `"${file.name}" no es un archivo PDF`
  }
  if (file.size > ADJUNTO_INFORME_JURIDICO_CONFIG.MAX_SIZE_BYTES) {
    return `"${file.name}" excede el tamaño máximo de 10MB`
  }
  return null
}

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

  const [formData, setFormData] = useState<FormData>(getInitialFormData())
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // File state
  const [informeOficial, setInformeOficial] = useState<File | null>(null)
  const [acuses, setAcuses] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])

  // Refs for file inputs
  const informeInputRef = useRef<HTMLInputElement>(null)
  const acuseInputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleInformeOficialSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validatePdfFile(file)
    if (error) {
      setFileErrors((prev) => [...prev, error])
      return
    }

    setInformeOficial(file)
    setFileErrors([])

    // Clear input to allow re-selecting same file
    if (informeInputRef.current) {
      informeInputRef.current.value = ''
    }
  }

  const handleAcuseSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newAcuses: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const error = validatePdfFile(file)
      if (error) {
        errors.push(error)
      } else {
        // Check for duplicates
        const isDuplicate = acuses.some((existing) => existing.name === file.name)
        if (!isDuplicate) {
          newAcuses.push(file)
        }
      }
    })

    if (errors.length > 0) {
      setFileErrors(errors)
    } else {
      setFileErrors([])
    }

    setAcuses((prev) => [...prev, ...newAcuses])

    // Clear input
    if (acuseInputRef.current) {
      acuseInputRef.current.value = ''
    }
  }

  const handleRemoveInformeOficial = () => {
    setInformeOficial(null)
  }

  const handleRemoveAcuse = (index: number) => {
    setAcuses((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.instituciones_notificadas.trim()) {
      errors.instituciones_notificadas = "Las instituciones notificadas son obligatorias"
    }

    if (!formData.destinatarios.trim()) {
      errors.destinatarios = "Los destinatarios son obligatorios"
    }

    if (!formData.fecha_notificaciones) {
      errors.fecha_notificaciones = "La fecha de notificaciones es obligatoria"
    } else if (!validateFechaNotificaciones(formData.fecha_notificaciones)) {
      errors.fecha_notificaciones = "La fecha de notificaciones no puede ser futura"
    }

    if (!informeOficial) {
      errors.informe_oficial = "El informe oficial es obligatorio"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSubmitError(null)

      const request: CrearYEnviarInformeJuridicoRequest = {
        observaciones: formData.observaciones || null,
        instituciones_notificadas: formData.instituciones_notificadas,
        fecha_notificaciones: formData.fecha_notificaciones,
        medio_notificacion: formData.medio_notificacion,
        destinatarios: formData.destinatarios,
        informe_oficial: informeOficial!,
        acuses: acuses.length > 0 ? acuses : undefined,
      }

      await onSubmit(request)

      // Reset form
      setFormData(getInitialFormData())
      setFormErrors({})
      setInformeOficial(null)
      setAcuses([])
      setFileErrors([])

      onClose()
    } catch (error: any) {
      console.error("Error creating informe jurídico:", error)
      setSubmitError(error.message || "Error al crear y enviar informe jurídico")
    }
  }

  const handleClose = () => {
    if (isLoading) return

    // Reset form
    setFormData(getInitialFormData())
    setFormErrors({})
    setSubmitError(null)
    setInformeOficial(null)
    setAcuses([])
    setFileErrors([])

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
        Crear y Enviar Informe Jurídico
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
              rows={2}
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
              onChange={(e) => handleFieldChange("instituciones_notificadas", e.target.value)}
              placeholder="Juzgado de Familia N°5, Defensoría de NNyA, Área de Salud Mental..."
              variant="outlined"
              disabled={isLoading}
              error={!!formErrors.instituciones_notificadas}
              helperText={formErrors.instituciones_notificadas}
            />
          </Box>

          {/* Fecha y Medio de Notificación */}
          <Box sx={{ display: "flex", gap: 2 }}>
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
                    max: getCurrentDateISO(),
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Medio de Notificación *
              </Typography>
              <FormControl fullWidth disabled={isLoading}>
                <Select
                  value={formData.medio_notificacion}
                  onChange={(e) =>
                    handleFieldChange("medio_notificacion", e.target.value as MedioNotificacion)
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
              placeholder="juzgadofamilia5@jus.gob.ar, defensoria@gob.ar..."
              variant="outlined"
              disabled={isLoading}
              error={!!formErrors.destinatarios}
              helperText={
                formErrors.destinatarios ||
                "Emails, direcciones o nombres de contacto de los destinatarios"
              }
            />
          </Box>

          <Divider />

          {/* Documents Section */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documentos
          </Typography>

          {/* Informe Oficial (Required) */}
          <Card variant="outlined" sx={{ borderColor: formErrors.informe_oficial ? 'error.main' : 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Informe Jurídico Oficial *
                  </Typography>
                </Box>
                {informeOficial && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Archivo cargado"
                    color="success"
                    size="small"
                  />
                )}
              </Box>

              {informeOficial ? (
                <List dense>
                  <ListItem
                    sx={{
                      bgcolor: 'success.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.200',
                    }}
                  >
                    <ListItemIcon>
                      <PdfIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={informeOficial.name}
                      secondary={formatFileSize(informeOficial.size)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={handleRemoveInformeOficial}
                        disabled={isLoading}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <input
                    ref={informeInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleInformeOficialSelect}
                    disabled={isLoading}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => informeInputRef.current?.click()}
                    disabled={isLoading}
                    sx={{ borderStyle: 'dashed' }}
                  >
                    Seleccionar Informe Oficial (PDF)
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Máximo 10MB
                  </Typography>
                </Box>
              )}

              {formErrors.informe_oficial && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {formErrors.informe_oficial}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Acuses de Recibo (Optional) */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Acuses de Recibo (opcional)
                  </Typography>
                </Box>
                {acuses.length > 0 && (
                  <Chip
                    label={`${acuses.length} archivo${acuses.length > 1 ? 's' : ''}`}
                    color="secondary"
                    size="small"
                  />
                )}
              </Box>

              {acuses.length > 0 && (
                <List dense sx={{ mb: 2 }}>
                  {acuses.map((file, index) => (
                    <ListItem
                      key={`${file.name}-${index}`}
                      sx={{
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        mb: 0.5,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <ListItemIcon>
                        <PdfIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAcuse(index)}
                          disabled={isLoading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <input
                  ref={acuseInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleAcuseSelect}
                  disabled={isLoading}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => acuseInputRef.current?.click()}
                  disabled={isLoading}
                  sx={{ borderStyle: 'dashed' }}
                >
                  Agregar Acuse de Recibo (PDF)
                </Button>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Puede agregar múltiples acuses. Máximo 10MB cada uno.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* File Errors */}
          {fileErrors.length > 0 && (
            <Alert severity="error" onClose={() => setFileErrors([])}>
              {fileErrors.map((error, i) => (
                <Typography key={i} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Submit Error */}
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2">
              Al hacer clic en "Crear y Enviar", el informe se creará, los archivos se subirán
              y el informe se enviará automáticamente. La medida avanzará al estado
              PENDIENTE_RATIFICACION_JUDICIAL.
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
          disabled={isLoading || !informeOficial}
          variant="contained"
          fullWidth
          size="large"
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
            backgroundColor: "#4f3ff0",
            "&:hover": { backgroundColor: "#3a2cc2" },
          }}
        >
          {isLoading ? "Enviando..." : "Crear y Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
