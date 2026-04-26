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
import EtiquetaDocumentoSelector from "@/components/forms/components/EtiquetaDocumentoSelector"
import { useEtiquetasDocumento } from "@/hooks/useEtiquetasDocumento"

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
  etiquetaId: number | null
}

export const AgregarDocumentoModal: React.FC<AgregarDocumentoModalProps> = ({
  open,
  onClose,
  onSuccess,
  legajoId,
  demandaId,
  medidasIds = [],
}) => {
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<number | null>(null)
  const [medidaSeleccionada, setMedidaSeleccionada] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { etiquetas } = useEtiquetasDocumento()
  const tiposArchivosPermitidos = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
  const tamanoMaximoMB = 10

  const etiquetaNombre = (id?: number | null) =>
    id ? etiquetas.find((e) => e.id === id)?.nombre ?? null : null

  // Convert pending files to FileItem for display
  const displayFiles: FileItem[] = pendingFiles.map((pf) => ({
    id: pf.id,
    nombre: pf.nombre,
    tipo: pf.tipo,
    tamano: pf.tamanio,
    fecha_subida: pf.fechaSubida.toISOString(),
    etiqueta_nombre: etiquetaNombre(pf.etiquetaId),
  }))

  const handleMedidaChange = (event: SelectChangeEvent<string>) => {
    setMedidaSeleccionada(event.target.value)
    setError(null)
  }

  const handleFileUpload = useCallback(
    (file: File, etiquetaId?: number | null) => {
      const newFile: PendingFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        nombre: file.name,
        tipo: file.type,
        tamanio: file.size,
        fechaSubida: new Date(),
        etiquetaId: etiquetaId ?? null,
      }
      setPendingFiles((prev) => [...prev, newFile])
      setError(null)
    },
    [],
  )

  const handleFileDelete = useCallback((fileId: number | string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== fileId))
  }, [])

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset state
      setEtiquetaSeleccionada(null)
      setMedidaSeleccionada("")
      setDescripcion("")
      setPendingFiles([])
      setError(null)
      setSuccessMessage(null)
      onClose()
    }
  }

  const validateForm = (): boolean => {
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

        {/* Etiqueta del documento (catálogo unificado) */}
        <Box sx={{ mb: 3 }}>
          <EtiquetaDocumentoSelector
            value={etiquetaSeleccionada}
            onChange={setEtiquetaSeleccionada}
            disabled={isSubmitting}
            helperText="Aplica al próximo archivo cargado. Si no elegís etiqueta el sistema usa 'Sin clasificar'."
          />
        </Box>

        {/* Medida selector cuando hay varias medidas vinculadas al legajo */}
        {medidasIds.length > 1 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="medida-select-label">Medida</InputLabel>
            <Select
              labelId="medida-select-label"
              value={medidaSeleccionada}
              label="Medida"
              onChange={handleMedidaChange}
              disabled={isSubmitting}
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

        {/* File Upload — la etiqueta seleccionada arriba se aplica al archivo subido */}
        <FileUploadSection
          files={displayFiles}
          onUpload={(file) => handleFileUpload(file, etiquetaSeleccionada)}
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
          disabled={isSubmitting || pendingFiles.length === 0}
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
