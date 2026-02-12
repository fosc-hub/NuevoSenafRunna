"use client"

import type React from "react"
import { useState, useCallback } from "react"
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
} from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import { FileUploadSection, type FileItem } from "../../medida/shared/file-upload-section"

interface AgregarDocumentoModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  legajoId: number
  demandaId?: number | null
  medidasIds?: number[]
}

interface PendingFile {
  id: string
  file: File
  nombre: string
  tipo: string
  tamanio: number
  fechaSubida: Date
}

// Document type options for the dropdown
const TIPO_DOCUMENTO_OPTIONS = [
  { value: "DEMANDA", label: "Adjunto de Demanda", categoria: "DEMANDA" },
  { value: "INTERVENCION", label: "Documentación de Intervención", categoria: "MEDIDA" },
  { value: "INFORME", label: "Informe Técnico", categoria: "MEDIDA" },
  { value: "ACTA", label: "Acta", categoria: "MEDIDA" },
  { value: "RESOLUCION", label: "Resolución", categoria: "MEDIDA" },
  { value: "OTRO", label: "Otro documento", categoria: "MEDIDA" },
]

export const AgregarDocumentoModal: React.FC<AgregarDocumentoModalProps> = ({
  open,
  onClose,
  onSuccess,
  legajoId,
  demandaId,
  medidasIds = [],
}) => {
  const [tipoDocumento, setTipoDocumento] = useState<string>("")
  const [medidaSeleccionada, setMedidaSeleccionada] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const tiposArchivosPermitidos = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
  const tamanoMaximoMB = 10

  // Get the selected tipo option details
  const tipoSeleccionado = TIPO_DOCUMENTO_OPTIONS.find((opt) => opt.value === tipoDocumento)
  const requiresMedida = tipoSeleccionado?.categoria === "MEDIDA"

  // Convert pending files to FileItem for display
  const displayFiles: FileItem[] = pendingFiles.map((pf) => ({
    id: pf.id,
    nombre: pf.nombre,
    tipo: pf.tipo,
    tamano: pf.tamanio,
    fecha_subida: pf.fechaSubida.toISOString(),
  }))

  const handleTipoChange = (event: SelectChangeEvent<string>) => {
    setTipoDocumento(event.target.value)
    setError(null)
  }

  const handleMedidaChange = (event: SelectChangeEvent<string>) => {
    setMedidaSeleccionada(event.target.value)
    setError(null)
  }

  const handleFileUpload = useCallback((file: File) => {
    const newFile: PendingFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      nombre: file.name,
      tipo: file.type,
      tamanio: file.size,
      fechaSubida: new Date(),
    }
    setPendingFiles((prev) => [...prev, newFile])
    setError(null)
  }, [])

  const handleFileDelete = useCallback((fileId: number | string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== fileId))
  }, [])

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset state
      setTipoDocumento("")
      setMedidaSeleccionada("")
      setDescripcion("")
      setPendingFiles([])
      setError(null)
      setSuccessMessage(null)
      onClose()
    }
  }

  const validateForm = (): boolean => {
    if (!tipoDocumento) {
      setError("Debe seleccionar un tipo de documento")
      return false
    }

    if (requiresMedida && !medidaSeleccionada && medidasIds.length > 0) {
      setError("Debe seleccionar una medida")
      return false
    }

    if (pendingFiles.length === 0) {
      setError("Debe adjuntar al menos un archivo")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Implement actual API call based on tipoDocumento
      // For now, we'll show a placeholder message

      // The actual implementation would depend on the document type:
      // - DEMANDA: POST to /api/registro-demanda-form/{demandaId}/adjuntos/
      // - INTERVENCION/ACTA/etc: POST to appropriate medida endpoints

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccessMessage("Documento agregado exitosamente")

      // Call success callback to refresh the list
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after short delay
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al subir el documento"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UploadFileIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Agregar Documento
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          size="small"
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tipo de Documento */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="tipo-documento-label">Tipo de documento *</InputLabel>
          <Select
            labelId="tipo-documento-label"
            value={tipoDocumento}
            label="Tipo de documento *"
            onChange={handleTipoChange}
            disabled={isSubmitting}
          >
            {TIPO_DOCUMENTO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Medida selector (only if type requires medida and there are multiple medidas) */}
        {requiresMedida && medidasIds.length > 0 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="medida-select-label">
              Medida {medidasIds.length > 1 ? "*" : ""}
            </InputLabel>
            <Select
              labelId="medida-select-label"
              value={medidaSeleccionada || (medidasIds.length === 1 ? String(medidasIds[0]) : "")}
              label={`Medida ${medidasIds.length > 1 ? "*" : ""}`}
              onChange={handleMedidaChange}
              disabled={isSubmitting || medidasIds.length === 1}
            >
              {medidasIds.map((medidaId) => (
                <MenuItem key={medidaId} value={String(medidaId)}>
                  Medida #{medidaId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Descripcion */}
        <TextField
          fullWidth
          label="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          multiline
          rows={2}
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          placeholder="Agregue una descripción o notas sobre el documento..."
        />

        {/* File Upload */}
        <FileUploadSection
          files={displayFiles}
          onUpload={handleFileUpload}
          onDelete={handleFileDelete}
          allowedTypes={tiposArchivosPermitidos}
          maxSizeInMB={tamanoMaximoMB}
          multiple={false}
          disabled={isSubmitting}
          title="Archivo"
          uploadButtonLabel="Seleccionar archivo"
          emptyMessage="Arrastre un archivo aquí o haga clic para seleccionar"
          dragDropMessage="Arrastre el archivo aquí"
          dragDropHeight={120}
        />

        {/* Info about allowed files */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG. Tamaño máximo: {tamanoMaximoMB}MB
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || pendingFiles.length === 0 || !tipoDocumento}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ textTransform: "none" }}
        >
          {isSubmitting ? "Guardando..." : "Guardar documento"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AgregarDocumentoModal
