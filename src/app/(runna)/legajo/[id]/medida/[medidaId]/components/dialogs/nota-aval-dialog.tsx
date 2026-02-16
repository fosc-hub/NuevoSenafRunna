"use client"

/**
 * NotaAvalDialog Component (MED-03)
 * Modal para que el Director emita su decisión sobre la intervención
 *
 * Características:
 * - Wizard de 2 pasos: Decisión → Documentos y Confirmación
 * - Selección de decisión: Aprobar / Observar
 * - Campo de comentarios (obligatorio si observa, mínimo 10 caracteres)
 * - Drag-drop upload de adjuntos (PDFs, máx 10MB)
 * - Card-based file display
 * - Review summary antes de confirmar
 * - Validaciones en tiempo real
 * - Manejo de estados: loading, error, success
 */

import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Avatar,
  TextField,
} from "@mui/material"
import {
  CheckCircleOutline as ApprovedIcon,
  WarningAmber as ObservedIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import type { TNotaAvalDecision } from "../../types/nota-aval-api"
import { DECISION_LABELS, DECISION_DESCRIPTIONS, NOTA_AVAL_VALIDATIONS } from "../../types/nota-aval-api"
import { useNotaAval } from "../../hooks/useNotaAval"
import { useNotaAvalAdjuntos } from "../../hooks/useNotaAvalAdjuntos"
import { WizardModal, type WizardStep } from "../medida/shared/wizard-modal"

// ============================================================================
// INTERFACES
// ============================================================================

interface NotaAvalDialogProps {
  open: boolean
  onClose: () => void
  medidaId: number
  medidaNumero?: string
  onSuccess?: () => void
}

interface FileToUpload {
  id: string
  file: File
  error?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NotaAvalDialog: React.FC<NotaAvalDialogProps> = ({
  open,
  onClose,
  medidaId,
  medidaNumero,
  onSuccess,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeStep, setActiveStep] = useState(0)
  const [decision, setDecision] = useState<TNotaAvalDecision | "">("")
  const [comentarios, setComentarios] = useState("")
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // HOOKS
  // ============================================================================

  const { emitirDecision, isCreating } = useNotaAval(medidaId, { enabled: false })
  const {
    uploadFile,
    validateFileBeforeUpload,
    maxSizeBytes,
    allowedExtensions,
    isUploading,
    uploadProgress,
    formatFileSize,
  } = useNotaAvalAdjuntos(medidaId, { enabled: false })

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isObservado = decision === "OBSERVADO"
  const comentariosRequired = isObservado
  const comentariosMinLength = isObservado ? NOTA_AVAL_VALIDATIONS.OBSERVADO.minLength : 0

  // Validation
  const comentariosError =
    comentariosRequired && comentarios.trim().length < comentariosMinLength
      ? `Los comentarios son obligatorios al observar (mínimo ${comentariosMinLength} caracteres)`
      : ""

  const isStep1Valid = decision !== "" && !comentariosError
  const isFormValid = isStep1Valid && !isCreating && !isUploading
  const validFilesCount = filesToUpload.filter(f => !f.error).length

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle decision change
   */
  const handleDecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDecision(event.target.value as TNotaAvalDecision)
  }

  /**
   * Handle comentarios change
   */
  const handleComentariosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComentarios(event.target.value)
  }

  /**
   * Process file for upload
   */
  const processFile = useCallback((file: File) => {
    const validation = validateFileBeforeUpload(file)
    const newFile: FileToUpload = {
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      error: validation.valid ? undefined : validation.error,
    }
    setFilesToUpload(prev => [...prev, newFile])
  }, [validateFileBeforeUpload])

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(processFile)
    event.target.value = ""
  }

  /**
   * Handle drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * Handle drag leave
   */
  const handleDragLeave = () => {
    setIsDragging(false)
  }

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(processFile)
  }

  /**
   * Handle file removal
   */
  const handleFileRemove = (fileId: string) => {
    setFilesToUpload(prev => prev.filter(f => f.id !== fileId))
  }

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (activeStep === 0 && isStep1Valid) {
      setActiveStep(1)
    }
  }

  /**
   * Handle back step
   */
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1)
    }
  }

  /**
   * Handle step click
   */
  const handleStepClick = (step: number) => {
    if (step === 0 || (step === 1 && isStep1Valid)) {
      setActiveStep(step)
    }
  }

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (!isFormValid || !decision) return

    try {
      // 1. Create nota de aval
      await emitirDecision(decision, comentarios.trim() || undefined)

      // 2. Upload files if any (only valid files)
      const validFiles = filesToUpload.filter(f => !f.error)
      for (const fileToUpload of validFiles) {
        try {
          await uploadFile(fileToUpload.file)
        } catch (error) {
          console.error(`Error uploading file ${fileToUpload.file.name}:`, error)
          // Continue with other files even if one fails
        }
      }

      // 3. Call onSuccess callback
      onSuccess?.()

      // 4. Close dialog
      handleClose()
    } catch (error) {
      console.error("Error emitting nota de aval:", error)
    }
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (isCreating || isUploading) {
      return
    }

    // Reset state
    setActiveStep(0)
    setDecision("")
    setComentarios("")
    setFilesToUpload([])
    setIsDragging(false)

    onClose()
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setDecision("")
      setComentarios("")
      setFilesToUpload([])
      setIsDragging(false)
    }
  }, [open])

  // ============================================================================
  // STEP CONTENT
  // ============================================================================

  /**
   * Step 1: Decision selection + comments
   */
  const DecisionStep = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* INFO ALERT */}
      <Alert severity="info">
        Como Director, debe revisar la intervención cargada y emitir su decisión.
        Al aprobar, la medida avanzará al Equipo Legal. Al observar, retornará al Equipo Técnico para correcciones.
      </Alert>

      {/* DECISION SELECTOR */}
      <FormControl component="fieldset" required>
        <FormLabel component="legend">Decisión *</FormLabel>
        <RadioGroup
          value={decision}
          onChange={handleDecisionChange}
          sx={{ mt: 1 }}
        >
          {/* APROBAR */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 1,
              cursor: "pointer",
              border: decision === "APROBADO" ? 2 : 1,
              borderColor: decision === "APROBADO" ? "success.main" : "divider",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: "success.main", bgcolor: "success.lighter" },
            }}
            onClick={() => !isCreating && setDecision("APROBADO")}
          >
            <FormControlLabel
              value="APROBADO"
              control={<Radio color="success" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ApprovedIcon color="success" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {DECISION_LABELS.APROBADO}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {DECISION_DESCRIPTIONS.APROBADO}
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={isCreating}
              sx={{ width: "100%", m: 0 }}
            />
          </Paper>

          {/* OBSERVAR */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              cursor: "pointer",
              border: decision === "OBSERVADO" ? 2 : 1,
              borderColor: decision === "OBSERVADO" ? "warning.main" : "divider",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: "warning.main", bgcolor: "warning.lighter" },
            }}
            onClick={() => !isCreating && setDecision("OBSERVADO")}
          >
            <FormControlLabel
              value="OBSERVADO"
              control={<Radio color="warning" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ObservedIcon color="warning" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {DECISION_LABELS.OBSERVADO}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {DECISION_DESCRIPTIONS.OBSERVADO}
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={isCreating}
              sx={{ width: "100%", m: 0 }}
            />
          </Paper>
        </RadioGroup>
      </FormControl>

      {/* COMENTARIOS */}
      <TextField
        label={`Comentarios ${isObservado ? "*" : "(Opcional)"}`}
        multiline
        rows={4}
        value={comentarios}
        onChange={handleComentariosChange}
        placeholder={
          isObservado
            ? "Especifique las observaciones que el Equipo Técnico debe corregir..."
            : "Agregue comentarios adicionales si lo desea..."
        }
        required={isObservado}
        error={!!comentariosError && comentarios.length > 0}
        helperText={
          comentariosError && comentarios.length > 0
            ? comentariosError
            : isObservado
              ? `Mínimo ${comentariosMinLength} caracteres (actual: ${comentarios.trim().length})`
              : `Caracteres: ${comentarios.trim().length}`
        }
        disabled={isCreating}
        fullWidth
      />
    </Box>
  )

  /**
   * Step 2: Documents upload + Review summary
   */
  const DocumentsStep = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* DRAG & DROP ZONE */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Adjuntar documentos (Opcional)
        </Typography>

        <Paper
          variant="outlined"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "grey.300",
            bgcolor: isDragging ? "action.hover" : "background.default",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "primary.light",
              bgcolor: "action.hover",
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? "primary.main" : "text.secondary", mb: 1 }} />
          <Typography variant="body1" color={isDragging ? "primary.main" : "text.primary"}>
            {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Solo PDF, máximo {formatFileSize(maxSizeBytes)}
          </Typography>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept={allowedExtensions.join(",")}
            onChange={handleFileSelect}
            disabled={isCreating || isUploading}
          />
        </Paper>
      </Box>

      {/* FILES LIST - Card based */}
      {filesToUpload.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Archivos seleccionados ({filesToUpload.length})
          </Typography>
          <Grid container spacing={2}>
            {filesToUpload.map((fileToUpload) => (
              <Grid item xs={12} sm={6} key={fileToUpload.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor: fileToUpload.error ? "error.main" : "divider",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: fileToUpload.error ? "error.main" : "primary.main",
                      boxShadow: 1,
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Avatar
                      sx={{
                        bgcolor: fileToUpload.error ? "error.light" : "error.lighter",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <PdfIcon sx={{ color: fileToUpload.error ? "error.main" : "error.dark" }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        noWrap
                        title={fileToUpload.file.name}
                      >
                        {fileToUpload.file.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={fileToUpload.error ? "error" : "text.secondary"}
                      >
                        {fileToUpload.error || formatFileSize(fileToUpload.file.size)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileRemove(fileToUpload.id)
                      }}
                      disabled={isCreating || isUploading}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* UPLOAD PROGRESS */}
      {uploadProgress && uploadProgress.isUploading && (
        <Alert severity="info" icon={false}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">
              Subiendo {uploadProgress.fileName}... {uploadProgress.progress}%
            </Typography>
          </Box>
        </Alert>
      )}

      {/* REVIEW SUMMARY CARD */}
      <Card
        variant="outlined"
        sx={{
          mt: 2,
          bgcolor: decision === "APROBADO" ? "success.lighter" : "warning.lighter",
          borderColor: decision === "APROBADO" ? "success.light" : "warning.light",
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: decision === "APROBADO" ? "success.main" : "warning.main",
                width: 48,
                height: 48,
              }}
            >
              {decision === "APROBADO" ? <ApprovedIcon /> : <ObservedIcon />}
            </Avatar>
          }
          title={
            <Typography variant="subtitle1" fontWeight={600}>
              Resumen de Decisión
            </Typography>
          }
          subheader={medidaNumero ? `Medida: ${medidaNumero}` : undefined}
        />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Decisión
              </Typography>
              <Typography fontWeight={600}>
                {decision === "APROBADO" ? "Aprobar Intervención" : "Observar Intervención"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Archivos adjuntos
              </Typography>
              <Typography fontWeight={500}>
                {validFilesCount} archivo{validFilesCount !== 1 ? "s" : ""} válido{validFilesCount !== 1 ? "s" : ""}
                {filesToUpload.length - validFilesCount > 0 && (
                  <Typography component="span" variant="body2" color="error.main" sx={{ ml: 1 }}>
                    ({filesToUpload.length - validFilesCount} con error)
                  </Typography>
                )}
              </Typography>
            </Grid>
            {comentarios.trim() && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Comentarios
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    bgcolor: "background.paper",
                    p: 1.5,
                    borderRadius: 1,
                    mt: 0.5,
                  }}
                >
                  {comentarios}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Alert
            severity={decision === "APROBADO" ? "success" : "warning"}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              {decision === "APROBADO"
                ? "La intervención será aprobada y la medida avanzará al Equipo Legal para informe jurídico."
                : "La intervención será observada y retornará al Equipo Técnico para realizar las correcciones indicadas."}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )

  // ============================================================================
  // WIZARD STEPS CONFIG
  // ============================================================================

  const steps: WizardStep[] = [
    { label: "Decisión", content: DecisionStep },
    { label: "Documentos y Confirmación", content: DocumentsStep },
  ]

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <WizardModal
      open={open}
      onClose={handleClose}
      title="Emitir Aprobación de Superior"
      steps={steps}
      activeStep={activeStep}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={handleStepClick}
      primaryAction={{
        label: activeStep === 0
          ? "Siguiente"
          : isCreating || isUploading
            ? "Procesando..."
            : decision === "APROBADO"
              ? "Aprobar Intervención"
              : "Observar Intervención",
        onClick: activeStep === 0 ? handleNext : handleSubmit,
        disabled: activeStep === 0 ? !isStep1Valid : !isFormValid,
        loading: isCreating || isUploading,
      }}
      maxWidth="md"
      allowStepClick={true}
    />
  )
}
