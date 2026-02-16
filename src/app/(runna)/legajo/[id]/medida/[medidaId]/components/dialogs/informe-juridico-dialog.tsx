"use client"

/**
 * InformeJuridicoDialog Component (MED-04)
 * Modal para crear y enviar Informe Jurídico por Equipo Legal
 *
 * Flujo unificado con 3 pasos:
 * - Paso 1: Datos de Notificación (instituciones, fecha, medio, destinatarios)
 * - Paso 2: Documentos (informe oficial + acuses de recibo)
 * - Paso 3: Revisión y Envío (resumen antes de enviar)
 *
 * Features:
 * - Wizard modal with stepper navigation
 * - Clickable Paper cards for medio notificación
 * - Drag-drop file upload with visual feedback
 * - Review step with editable summary
 */

import React, { useState, useRef, useCallback } from "react"
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Avatar,
} from "@mui/material"
import {
  Close as CloseIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  LocalPostOffice as LocalPostOfficeIcon,
  Person as PersonIcon,
  Shuffle as ShuffleIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"
import { WizardModal, type WizardStep } from "../medida/shared/wizard-modal"
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
// CONSTANTS
// ============================================================================

const MEDIO_ICONS: Record<MedioNotificacion, React.ReactNode> = {
  EMAIL: <EmailIcon sx={{ fontSize: 32 }} />,
  POSTAL: <LocalPostOfficeIcon sx={{ fontSize: 32 }} />,
  PRESENCIAL: <PersonIcon sx={{ fontSize: 32 }} />,
  MIXTO: <ShuffleIcon sx={{ fontSize: 32 }} />,
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

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(getInitialFormData())
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // File state
  const [informeOficial, setInformeOficial] = useState<File | null>(null)
  const [acuses, setAcuses] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])

  // Drag-drop state
  const [isDraggingInforme, setIsDraggingInforme] = useState(false)
  const [isDraggingAcuse, setIsDraggingAcuse] = useState(false)

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

  // Drag-drop handlers for Informe Oficial
  const handleInformeDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingInforme(true)
  }

  const handleInformeDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingInforme(false)
  }

  const handleInformeDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleInformeDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingInforme(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const error = validatePdfFile(file)
      if (error) {
        setFileErrors([error])
        return
      }
      setInformeOficial(file)
      setFileErrors([])
    }
  }

  // Drag-drop handlers for Acuses
  const handleAcuseDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAcuse(true)
  }

  const handleAcuseDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAcuse(false)
  }

  const handleAcuseDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleAcuseDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAcuse(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const newAcuses: File[] = []
      const errors: string[] = []

      Array.from(files).forEach((file) => {
        const error = validatePdfFile(file)
        if (error) {
          errors.push(error)
        } else {
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

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 0) {
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
    }

    if (step === 1) {
      if (!informeOficial) {
        errors.informe_oficial = "El informe oficial es obligatorio"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleStepClick = (step: number) => {
    if (step < activeStep || validateStep(activeStep)) {
      setActiveStep(step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
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
      setActiveStep(0)
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
    setActiveStep(0)
    setFormData(getInitialFormData())
    setFormErrors({})
    setSubmitError(null)
    setInformeOficial(null)
    setAcuses([])
    setFileErrors([])

    onClose()
  }

  // ============================================================================
  // STEP CONTENT
  // ============================================================================

  // Step 1: Datos de Notificación
  const renderStep1 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Observaciones */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
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
        </CardContent>
      </Card>

      {/* Instituciones Notificadas */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <BusinessIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Instituciones Notificadas *
            </Typography>
          </Box>
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
        </CardContent>
      </Card>

      {/* Fecha de Notificaciones */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CalendarIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Fecha de Notificaciones *
            </Typography>
          </Box>
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
        </CardContent>
      </Card>

      {/* Medio de Notificación - Clickable Cards */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Medio de Notificación *
          </Typography>
          <Grid container spacing={2}>
            {(Object.entries(MEDIO_NOTIFICACION_LABELS) as [MedioNotificacion, string][]).map(([value, label]) => (
              <Grid item xs={6} sm={3} key={value}>
                <Paper
                  elevation={formData.medio_notificacion === value ? 4 : 1}
                  onClick={() => !isLoading && handleFieldChange("medio_notificacion", value)}
                  sx={{
                    p: 2,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    border: formData.medio_notificacion === value ? '2px solid #4f3ff0' : '2px solid transparent',
                    backgroundColor: formData.medio_notificacion === value ? 'rgba(79, 63, 240, 0.05)' : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4f3ff0',
                      transform: isLoading ? 'none' : 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: formData.medio_notificacion === value ? '#4f3ff0' : 'text.secondary', mb: 1 }}>
                      {MEDIO_ICONS[value]}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: formData.medio_notificacion === value ? 600 : 400,
                        color: formData.medio_notificacion === value ? '#4f3ff0' : 'text.primary',
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Destinatarios */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <PeopleIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Destinatarios *
            </Typography>
          </Box>
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
        </CardContent>
      </Card>
    </Box>
  )

  // Step 2: Documentos
  const renderStep2 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Informe Oficial (Required) - Drag & Drop */}
      <Card variant="outlined" sx={{ borderColor: formErrors.informe_oficial ? 'error.main' : 'divider' }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: informeOficial ? 'success.main' : 'primary.main' }}>
              <GavelIcon />
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Informe Jurídico Oficial
              </Typography>
              <Chip label="Requerido" size="small" color="error" variant="outlined" />
            </Box>
          }
          subheader="Documento oficial del informe jurídico en formato PDF"
          action={
            informeOficial && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Archivo cargado"
                color="success"
                size="small"
              />
            )
          }
        />
        <CardContent>
          {informeOficial ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'success.50',
                borderColor: 'success.200',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <PdfIcon color="error" sx={{ fontSize: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {informeOficial.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(informeOficial.size)}
                </Typography>
              </Box>
              <IconButton
                onClick={handleRemoveInformeOficial}
                disabled={isLoading}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ) : (
            <Paper
              onDragEnter={handleInformeDragEnter}
              onDragOver={handleInformeDragOver}
              onDragLeave={handleInformeDragLeave}
              onDrop={handleInformeDrop}
              onClick={() => informeInputRef.current?.click()}
              sx={{
                border: isDraggingInforme ? '2px dashed #4f3ff0' : '2px dashed',
                borderColor: isDraggingInforme ? '#4f3ff0' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: isDraggingInforme ? 'rgba(79, 63, 240, 0.05)' : 'background.default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isLoading ? 'background.default' : 'action.hover',
                  borderColor: isLoading ? 'divider' : '#4f3ff0',
                },
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: isDraggingInforme ? '#4f3ff0' : 'text.secondary',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {isDraggingInforme ? "Suelta el archivo aquí" : "Arrastra y suelta el informe oficial"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                o haz clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Solo archivos PDF, máximo 10MB
              </Typography>
              <input
                ref={informeInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={handleInformeOficialSelect}
                disabled={isLoading}
              />
            </Paper>
          )}

          {formErrors.informe_oficial && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {formErrors.informe_oficial}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Acuses de Recibo (Optional) - Drag & Drop */}
      <Card variant="outlined">
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <ReceiptIcon />
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Acuses de Recibo
              </Typography>
              <Chip label="Opcional" size="small" color="default" variant="outlined" />
            </Box>
          }
          subheader="Comprobantes de recepción de las notificaciones"
          action={
            acuses.length > 0 && (
              <Chip
                label={`${acuses.length} archivo${acuses.length > 1 ? 's' : ''}`}
                color="secondary"
                size="small"
              />
            )
          }
        />
        <CardContent>
          {/* Drag & Drop Zone */}
          <Paper
            onDragEnter={handleAcuseDragEnter}
            onDragOver={handleAcuseDragOver}
            onDragLeave={handleAcuseDragLeave}
            onDrop={handleAcuseDrop}
            onClick={() => acuseInputRef.current?.click()}
            sx={{
              border: isDraggingAcuse ? '2px dashed #9c27b0' : '2px dashed',
              borderColor: isDraggingAcuse ? '#9c27b0' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: isDraggingAcuse ? 'rgba(156, 39, 176, 0.05)' : 'background.default',
              transition: 'all 0.2s ease',
              mb: acuses.length > 0 ? 2 : 0,
              '&:hover': {
                backgroundColor: isLoading ? 'background.default' : 'action.hover',
                borderColor: isLoading ? 'divider' : '#9c27b0',
              },
            }}
          >
            <CloudUploadIcon
              sx={{
                fontSize: 36,
                color: isDraggingAcuse ? '#9c27b0' : 'text.secondary',
                mb: 1,
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {isDraggingAcuse ? "Suelta los archivos aquí" : "Agregar acuses de recibo"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Puede agregar múltiples archivos PDF, máximo 10MB cada uno
            </Typography>
            <input
              ref={acuseInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleAcuseSelect}
              disabled={isLoading}
            />
          </Paper>

          {/* Acuses List */}
          {acuses.length > 0 && (
            <Grid container spacing={2}>
              {acuses.map((file, index) => (
                <Grid item xs={12} sm={6} key={`${file.name}-${index}`}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'grey.50',
                    }}
                  >
                    <PdfIcon color="error" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleRemoveAcuse(index)}
                      disabled={isLoading}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
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
    </Box>
  )

  // Step 3: Revisión y Envío
  const renderStep3 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Card */}
      <Card variant="outlined">
        <CardHeader
          title="Resumen de la Notificación"
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Instituciones */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Instituciones Notificadas
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formData.instituciones_notificadas}
                </Typography>
              </Paper>
            </Grid>

            {/* Fecha y Medio */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Notificaciones
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {new Date(formData.fecha_notificaciones).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {MEDIO_ICONS[formData.medio_notificacion]}
                  <Typography variant="subtitle2" color="text.secondary">
                    Medio de Notificación
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {MEDIO_NOTIFICACION_LABELS[formData.medio_notificacion]}
                </Typography>
              </Paper>
            </Grid>

            {/* Destinatarios */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PeopleIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Destinatarios
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formData.destinatarios}
                </Typography>
              </Paper>
            </Grid>

            {/* Observaciones */}
            {formData.observaciones && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Observaciones
                  </Typography>
                  <Typography variant="body1">
                    {formData.observaciones}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card variant="outlined">
        <CardHeader
          title="Documentos Adjuntos"
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Informe Oficial */}
            <Grid item xs={12} sm={6}>
              <Card
                variant="outlined"
                sx={{ borderColor: 'success.main', bgcolor: 'success.50' }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <GavelIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Informe Oficial
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {informeOficial?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {informeOficial && formatFileSize(informeOficial.size)}
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" />
                </CardContent>
              </Card>
            </Grid>

            {/* Acuses Count */}
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Acuses de Recibo
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {acuses.length} archivo{acuses.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submit Error */}
      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Info */}
      <Alert severity="info" icon={<SendIcon />}>
        <Typography variant="body2">
          Al hacer clic en "Crear y Enviar", el informe se creará, los archivos se subirán
          y el informe se enviará automáticamente. La medida avanzará al estado
          <strong> PENDIENTE_RATIFICACION_JUDICIAL</strong>.
        </Typography>
      </Alert>
    </Box>
  )

  // ============================================================================
  // WIZARD STEPS
  // ============================================================================

  const wizardSteps: WizardStep[] = [
    { label: 'Datos de Notificación', content: renderStep1() },
    { label: 'Documentos', content: renderStep2() },
    { label: 'Revisión y Envío', content: renderStep3() },
  ]

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <WizardModal
      open={open}
      onClose={handleClose}
      title={`Crear y Enviar Informe Jurídico${medidaNumero ? ` - Medida ${medidaNumero}` : ''}`}
      steps={wizardSteps}
      activeStep={activeStep}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={handleStepClick}
      maxWidth="md"
      fullWidth={true}
      showProgress={true}
      allowStepClick={true}
      primaryAction={
        activeStep === wizardSteps.length - 1
          ? {
              label: isLoading ? "Enviando..." : "Crear y Enviar",
              onClick: handleSubmit,
              disabled: isLoading || !informeOficial,
              loading: isLoading,
              icon: <SendIcon />,
            }
          : {
              label: "Siguiente",
              onClick: handleNext,
              disabled: isLoading,
            }
      }
    />
  )
}
