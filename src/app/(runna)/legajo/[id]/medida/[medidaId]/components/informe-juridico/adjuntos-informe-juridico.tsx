"use client"

/**
 * AdjuntosInformeJuridico Component (MED-04)
 * Componente para gestionar y visualizar adjuntos de Informe Jurídico
 *
 * Características:
 * - Lista de adjuntos (INFORME oficial + ACUSES de recibo)
 * - Download de archivos PDF
 * - Eliminación de adjuntos (solo si informe no enviado)
 * - Vista previa de documentos
 * - Upload de nuevos adjuntos (informe oficial + acuses)
 * - Validación de archivos (PDF, máx 10MB)
 * - Distinción visual entre informe oficial y acuses de recibo
 */

import React, { useState } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { extractUserName, TIPO_ADJUNTO_LABELS } from "../../types/informe-juridico-api"
import type {
  AdjuntoInformeJuridico,
  TipoAdjuntoInformeJuridico,
} from "../../types/informe-juridico-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface AdjuntosInformeJuridicoProps {
  medidaId: number
  adjuntos: AdjuntoInformeJuridico[]
  isLoading: boolean
  error: string | null
  canModify: boolean // Si el usuario puede modificar adjuntos (Equipo Legal y no enviado)
  onUpload: (
    file: File,
    tipoAdjunto: TipoAdjuntoInformeJuridico,
    descripcion?: string
  ) => Promise<void>
  onDelete: (adjuntoId: number) => Promise<void>
  isUploading?: boolean
  isDeleting?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdjuntosInformeJuridico: React.FC<AdjuntosInformeJuridicoProps> = ({
  medidaId,
  adjuntos,
  isLoading,
  error,
  canModify,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tipoAdjunto, setTipoAdjunto] = useState<TipoAdjuntoInformeJuridico>("ACUSE")
  const [descripcion, setDescripcion] = useState("")
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Derived state
  const hasAdjuntos = adjuntos.length > 0
  const informeOficial = adjuntos.find((adj) => adj.tipo_adjunto === "INFORME")
  const acuses = adjuntos.filter((adj) => adj.tipo_adjunto === "ACUSE")
  const tieneInformeOficial = !!informeOficial
  const cantidadAcuses = acuses.length

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle file download
   */
  const handleDownload = (adjunto: AdjuntoInformeJuridico) => {
    window.open(adjunto.archivo, "_blank")
  }

  /**
   * Handle file delete
   */
  const handleDelete = async (adjuntoId: number) => {
    if (!canModify) return

    if (
      !confirm(
        "¿Está seguro que desea eliminar este adjunto? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    try {
      await onDelete(adjuntoId)
    } catch (error) {
      console.error("Error deleting adjunto:", error)
    }
  }

  /**
   * Open upload dialog
   */
  const openUploadDialog = () => {
    setSelectedFile(null)
    setTipoAdjunto(tieneInformeOficial ? "ACUSE" : "INFORME")
    setDescripcion("")
    setUploadError(null)
    setUploadDialogOpen(true)
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadError("Solo se permiten archivos PDF")
      setSelectedFile(null)
      return
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setUploadError("El archivo excede el tamaño máximo de 10MB")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setUploadError(null)
  }

  /**
   * Handle upload submit
   */
  const handleUploadSubmit = async () => {
    if (!selectedFile) return

    try {
      setUploadError(null)
      await onUpload(selectedFile, tipoAdjunto, descripcion || undefined)
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setDescripcion("")
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setUploadError(error.message || "Error al subir archivo")
    }
  }

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar adjuntos: {error}
      </Alert>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* Header with upload button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Adjuntos ({adjuntos.length})
        </Typography>

        {canModify && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            onClick={openUploadDialog}
            disabled={isUploading}
          >
            Agregar Adjunto
          </Button>
        )}
      </Box>

      {/* Status chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          icon={tieneInformeOficial ? <CheckCircleIcon /> : <DescriptionIcon />}
          label={
            tieneInformeOficial
              ? "Informe Oficial Cargado"
              : "Falta Informe Oficial"
          }
          color={tieneInformeOficial ? "success" : "warning"}
          size="small"
        />
        <Chip
          icon={<AssignmentIcon />}
          label={`${cantidadAcuses} Acuse${cantidadAcuses !== 1 ? "s" : ""} de Recibo`}
          color="info"
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Adjuntos list */}
      {!hasAdjuntos ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay adjuntos disponibles
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {adjuntos.map((adjunto, index) => (
              <React.Fragment key={adjunto.id}>
                {index > 0 && <Box sx={{ borderTop: 1, borderColor: "divider" }} />}
                <ListItem
                  sx={{
                    py: 2,
                    backgroundColor:
                      adjunto.tipo_adjunto === "INFORME"
                        ? "rgba(76, 175, 80, 0.05)"
                        : "transparent",
                  }}
                >
                  <ListItemIcon>
                    <PdfIcon
                      color={adjunto.tipo_adjunto === "INFORME" ? "success" : "primary"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {adjunto.nombre_original}
                        </Typography>
                        <Chip
                          label={TIPO_ADJUNTO_LABELS[adjunto.tipo_adjunto]}
                          size="small"
                          color={adjunto.tipo_adjunto === "INFORME" ? "success" : "default"}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Tamaño: {formatFileSize(adjunto.tamano_bytes)} •
                          Subido: {formatDate(adjunto.fecha_carga)}
                        </Typography>
                        {adjunto.subido_por_detalle && (
                          <Typography variant="caption" display="block">
                            Por: {extractUserName(adjunto.subido_por_detalle)}
                          </Typography>
                        )}
                        {adjunto.descripcion && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ fontStyle: "italic", mt: 0.5 }}
                          >
                            {adjunto.descripcion}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Descargar">
                      <IconButton edge="end" onClick={() => handleDownload(adjunto)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {canModify && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(adjunto.id)}
                          disabled={isDeleting}
                          color="error"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !isUploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Adjunto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Tipo de adjunto */}
            <FormControl fullWidth>
              <InputLabel>Tipo de Adjunto</InputLabel>
              <Select
                value={tipoAdjunto}
                onChange={(e) => setTipoAdjunto(e.target.value as TipoAdjuntoInformeJuridico)}
                label="Tipo de Adjunto"
                disabled={tieneInformeOficial && tipoAdjunto === "INFORME"}
              >
                <MenuItem value="INFORME" disabled={tieneInformeOficial}>
                  {TIPO_ADJUNTO_LABELS.INFORME}
                  {tieneInformeOficial && " (ya cargado)"}
                </MenuItem>
                <MenuItem value="ACUSE">{TIPO_ADJUNTO_LABELS.ACUSE}</MenuItem>
              </Select>
            </FormControl>

            {/* File selector */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
              fullWidth
            >
              {selectedFile ? selectedFile.name : "Seleccionar Archivo PDF"}
              <input
                type="file"
                hidden
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Alert severity="info" icon={<PdfIcon />}>
                {formatFileSize(selectedFile.size)}
              </Alert>
            )}

            {/* Descripción (opcional para acuses) */}
            {tipoAdjunto === "ACUSE" && (
              <TextField
                label="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Ej: Acuse de recibo Juzgado de Familia N°5"
                helperText="Descripción útil para identificar el acuse"
              />
            )}

            {uploadError && (
              <Alert severity="error" onClose={() => setUploadError(null)}>
                {uploadError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {isUploading ? "Subiendo..." : "Subir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
