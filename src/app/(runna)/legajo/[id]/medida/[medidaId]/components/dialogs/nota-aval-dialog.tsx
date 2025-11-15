"use client"

/**
 * NotaAvalDialog Component (MED-03)
 * Modal para que el Director emita su decisión sobre la intervención
 *
 * Características:
 * - Selección de decisión: Aprobar / Observar
 * - Campo de comentarios (obligatorio si observa, mínimo 10 caracteres)
 * - Upload de adjuntos (PDFs, máx 10MB)
 * - Validaciones en tiempo real
 * - Confirmación antes de enviar
 * - Manejo de estados: loading, error, success
 */

import React, { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material"
import {
  CheckCircleOutline as ApprovedIcon,
  WarningAmber as ObservedIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import type { TNotaAvalDecision } from "../../types/nota-aval-api"
import { DECISION_LABELS, DECISION_DESCRIPTIONS, NOTA_AVAL_VALIDATIONS } from "../../types/nota-aval-api"
import { useNotaAval } from "../../hooks/useNotaAval"
import { useNotaAvalAdjuntos } from "../../hooks/useNotaAvalAdjuntos"

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

  const [decision, setDecision] = useState<TNotaAvalDecision | "">("")
  const [comentarios, setComentarios] = useState("")
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

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

  const isFormValid = decision !== "" && !comentariosError && !isCreating && !isUploading

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle decision change
   */
  const handleDecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDecision(event.target.value as TNotaAvalDecision)
    setShowConfirmation(false)
  }

  /**
   * Handle comentarios change
   */
  const handleComentariosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComentarios(event.target.value)
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newFiles: FileToUpload[] = []

    Array.from(files).forEach((file) => {
      // Validate file
      const validation = validateFileBeforeUpload(file)

      newFiles.push({
        id: `${Date.now()}-${file.name}`,
        file,
        error: validation.valid ? undefined : validation.error,
      })
    })

    setFilesToUpload((prev) => [...prev, ...newFiles])

    // Reset input
    event.target.value = ""
  }

  /**
   * Handle file removal
   */
  const handleFileRemove = (fileId: string) => {
    setFilesToUpload((prev) => prev.filter((f) => f.id !== fileId))
  }

  /**
   * Handle submit (show confirmation)
   */
  const handleSubmit = () => {
    if (!isFormValid) return
    setShowConfirmation(true)
  }

  /**
   * Handle confirmed submit (actually create nota de aval)
   */
  const handleConfirmedSubmit = async () => {
    if (!isFormValid || decision === "") return

    try {
      // 1. Create nota de aval
      await emitirDecision(decision, comentarios.trim() || undefined)

      // 2. Upload files if any (only valid files)
      const validFiles = filesToUpload.filter((f) => !f.error)
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
      setShowConfirmation(false)
    }
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (isCreating || isUploading) {
      // Don't allow closing while creating/uploading
      return
    }

    // Reset state
    setDecision("")
    setComentarios("")
    setFilesToUpload([])
    setShowConfirmation(false)

    // Call onClose
    onClose()
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDecision("")
      setComentarios("")
      setFilesToUpload([])
      setShowConfirmation(false)
    }
  }, [open])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isCreating || isUploading}
    >
      {/* HEADER */}
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Emitir Aprobación de Superior</Typography>
          <IconButton
            onClick={handleClose}
            disabled={isCreating || isUploading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {medidaNumero && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Medida: {medidaNumero}
          </Typography>
        )}
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent dividers>
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
                  "&:hover": { borderColor: "success.main" },
                }}
                onClick={() => !isCreating && setDecision("APROBADO")}
              >
                <FormControlLabel
                  value="APROBADO"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ApprovedIcon color="success" />
                      <Box>
                        <Typography variant="subtitle1">{DECISION_LABELS.APROBADO}</Typography>
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
                  "&:hover": { borderColor: "warning.main" },
                }}
                onClick={() => !isCreating && setDecision("OBSERVADO")}
              >
                <FormControlLabel
                  value="OBSERVADO"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ObservedIcon color="warning" />
                      <Box>
                        <Typography variant="subtitle1">{DECISION_LABELS.OBSERVADO}</Typography>
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

          {/* ADJUNTOS */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Adjuntar documentos (Opcional)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Solo archivos PDF, tamaño máximo {formatFileSize(maxSizeBytes)}
            </Typography>

            {/* Upload Button */}
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={isCreating || isUploading}
              sx={{ textTransform: "none", mb: 2 }}
            >
              Seleccionar archivos
              <input
                type="file"
                hidden
                multiple
                accept={allowedExtensions.join(",")}
                onChange={handleFileSelect}
                disabled={isCreating || isUploading}
              />
            </Button>

            {/* Files List */}
            {filesToUpload.length > 0 && (
              <List dense>
                {filesToUpload.map((fileToUpload) => (
                  <ListItem
                    key={fileToUpload.id}
                    sx={{
                      border: 1,
                      borderColor: fileToUpload.error ? "error.main" : "divider",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <PdfIcon color={fileToUpload.error ? "error" : "primary"} sx={{ mr: 1 }} />
                    <ListItemText
                      primary={fileToUpload.file.name}
                      secondary={
                        fileToUpload.error || formatFileSize(fileToUpload.file.size)
                      }
                      primaryTypographyProps={{
                        sx: { wordBreak: "break-word" },
                      }}
                      secondaryTypographyProps={{
                        color: fileToUpload.error ? "error" : "text.secondary",
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleFileRemove(fileToUpload.id)}
                        disabled={isCreating || isUploading}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Upload Progress */}
            {uploadProgress && uploadProgress.isUploading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="caption">
                  Subiendo {uploadProgress.fileName}... {uploadProgress.progress}%
                </Typography>
              </Box>
            )}
          </Box>

          {/* CONFIRMATION */}
          {showConfirmation && (
            <Alert
              severity={decision === "APROBADO" ? "success" : "warning"}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancelar
                </Button>
              }
            >
              <Typography variant="subtitle2" gutterBottom>
                ¿Confirmar decisión?
              </Typography>
              <Typography variant="body2">
                {decision === "APROBADO"
                  ? "La intervención será aprobada y la medida avanzará al Equipo Legal para informe jurídico."
                  : "La intervención será observada y retornará al Equipo Técnico para realizar las correcciones indicadas."}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isCreating || isUploading}
          color="inherit"
        >
          Cancelar
        </Button>
        {!showConfirmation ? (
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            variant="contained"
            color={decision === "APROBADO" ? "success" : decision === "OBSERVADO" ? "warning" : "primary"}
            startIcon={isCreating || isUploading ? <CircularProgress size={16} /> : null}
          >
            {isCreating
              ? "Emitiendo..."
              : isUploading
                ? "Subiendo archivos..."
                : decision === "APROBADO"
                  ? "Aprobar Intervención"
                  : "Observar Intervención"}
          </Button>
        ) : (
          <Button
            onClick={handleConfirmedSubmit}
            disabled={!isFormValid}
            variant="contained"
            color={decision === "APROBADO" ? "success" : "warning"}
            startIcon={isCreating || isUploading ? <CircularProgress size={16} /> : null}
          >
            {isCreating || isUploading ? "Procesando..." : "Confirmar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
