"use client"

/**
 * Informe de Cierre Modal - MED-MPI-CIERRE
 *
 * Modal for Equipo Técnico to register closure report for MPI measures
 *
 * Features:
 * - Observaciones textarea with min 20 character validation
 * - Character counter
 * - File upload (drag-drop + click)
 * - File validation (extension, size)
 * - Multiple file support
 * - Error handling
 * - Success callback
 *
 * Workflow:
 * 1. User enters observaciones (min 20 chars)
 * 2. User optionally uploads files
 * 3. System creates informe (Estado 3 → 4 transition)
 * 4. System uploads each file
 * 5. Success toast + callback + close modal
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DeleteIcon from "@mui/icons-material/Delete"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import {
  createInformeCierre,
  uploadAdjuntoInformeCierre,
} from "../../api/informe-cierre-api-service"
import {
  validateFile,
  formatFileSize,
  getAcceptAttribute,
} from "../../utils/file-validation"
import type { InformeCierre } from "../../types/informe-cierre-api"

// ============================================================================
// PROPS
// ============================================================================

interface InformeCierreModalProps {
  open: boolean
  onClose: () => void
  medidaId: number
  onSuccess?: (informe: InformeCierre) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InformeCierreModal: React.FC<InformeCierreModalProps> = ({
  open,
  onClose,
  medidaId,
  onSuccess,
}) => {
  // ========== State ==========
  const [observaciones, setObservaciones] = useState("")
  const [archivos, setArchivos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ========== Validation ==========
  const isObservacionesValid = observaciones.trim().length >= 20
  const canSubmit = isObservacionesValid && !isSubmitting

  // ========== File Handlers ==========
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)

      // Validate each file
      for (const file of newFiles) {
        const validation = validateFile(file)
        if (!validation.valid) {
          setError(validation.error || "Archivo inválido")
          return
        }
      }

      // Add valid files
      setArchivos((prev) => [...prev, ...newFiles])
      setError(null)
    }
  }

  const handleRemoveFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  // ========== Submit Handler ==========
  const handleSubmit = async () => {
    setError(null)

    // Validate observaciones
    if (!isObservacionesValid) {
      setError("Las observaciones deben tener al menos 20 caracteres")
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create informe de cierre
      // This triggers Estado 3 → Estado 4 transition automatically
      const informeCreado = await createInformeCierre(medidaId, {
        observaciones: observaciones.trim(),
      })

      console.log("Informe created, now uploading files...")

      // Step 2: Upload adjuntos if any
      if (archivos.length > 0) {
        const uploadPromises = archivos.map((archivo) =>
          uploadAdjuntoInformeCierre(
            medidaId,
            informeCreado.id,
            archivo,
            "INFORME_TECNICO", // Default type
            `Adjunto: ${archivo.name}`
          )
        )

        await Promise.all(uploadPromises)
        console.log("All files uploaded successfully")
      }

      // Step 3: Success - notify parent and close
      if (onSuccess) {
        onSuccess(informeCreado)
      }

      // Close modal and reset
      handleClose()
    } catch (err: any) {
      console.error("Error creating informe cierre:", err)

      // Extract error message
      const errorMessage =
        err?.response?.data?.detalle ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al crear el informe de cierre"

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
    setArchivos([])
    setError(null)
    onClose()
  }

  // ========== Render ==========
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Registrar Informe de Cierre
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Complete la fundamentación del cierre de esta medida MPI. Describa los
          objetivos alcanzados, la situación estabilizada del NNyA y su familia, y
          las razones para el cierre de la intervención.
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Observaciones Field */}
        <TextField
          label="Observaciones *"
          multiline
          rows={6}
          fullWidth
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Describa los objetivos alcanzados, la situación actual del NNyA y familia, y las razones para el cierre de la intervención..."
          helperText={
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <span>
                {observaciones.length} / 20 caracteres mínimo
              </span>
              {isObservacionesValid && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Válido"
                  color="success"
                  size="small"
                />
              )}
            </Box>
          }
          error={observaciones.length > 0 && !isObservacionesValid}
          disabled={isSubmitting}
          sx={{ mb: 3 }}
        />

        {/* File Upload Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Adjuntos (Opcional)
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            disabled={isSubmitting}
            sx={{ mb: 1 }}
          >
            Seleccionar Archivos
            <input
              type="file"
              hidden
              multiple
              accept={getAcceptAttribute()}
              onChange={handleFileChange}
            />
          </Button>

          <Typography variant="caption" display="block" color="text.secondary">
            Formatos permitidos: PDF, DOC, DOCX, JPG, PNG (máx. 10 MB cada uno)
          </Typography>
        </Box>

        {/* File List */}
        {archivos.length > 0 && (
          <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {archivos.map((archivo, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={archivo.name}
                  secondary={formatFileSize(archivo.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isSubmitting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!canSubmit}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting ? "Enviando..." : "Enviar Informe"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
