"use client"

/**
 * AdjuntosInformeJuridico Component (MED-04)
 * Componente para gestionar y visualizar adjuntos de Informe Jurídico
 *
 * Características:
 * - Drag-and-drop file upload with visual feedback
 * - Card-based file list with visual type distinction
 * - Download y eliminación de archivos
 * - Validación de archivos (PDF, máx 10MB)
 * - Distinción visual entre informe oficial y acuses de recibo
 */

import React, { useState, useRef } from "react"
import {
  Box,
  Typography,
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
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
} from "@mui/material"
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Gavel as GavelIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { extractUserName, TIPO_ADJUNTO_LABELS } from "../../types/informe-juridico-api"
import type {
  AdjuntoInformeJuridico,
  TipoAdjuntoInformeJuridico,
} from "../../types/informe-juridico-api"
import { formatFileSize } from '@/utils/fileUtils'

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
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

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
   * Validate file
   */
  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Solo se permiten archivos PDF"
    }
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo excede el tamaño máximo de 10MB"
    }
    return null
  }

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

  // Drag-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (canModify && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!canModify || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }
      setSelectedFile(file)
      setTipoAdjunto(tieneInformeOficial ? "ACUSE" : "INFORME")
      setUploadDialogOpen(true)
    }
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Documentos Adjuntos
          </Typography>
          <Chip
            label={`${adjuntos.length} archivo${adjuntos.length !== 1 ? 's' : ''}`}
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Status chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip
          icon={tieneInformeOficial ? <CheckCircleIcon /> : <GavelIcon />}
          label={
            tieneInformeOficial
              ? "Informe Oficial Cargado"
              : "Falta Informe Oficial"
          }
          color={tieneInformeOficial ? "success" : "warning"}
          size="small"
        />
        <Chip
          icon={<ReceiptIcon />}
          label={`${cantidadAcuses} Acuse${cantidadAcuses !== 1 ? "s" : ""} de Recibo`}
          color="default"
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Drag-drop upload zone */}
      {canModify && (
        <Paper
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          sx={{
            border: isDragging ? '2px dashed #4f3ff0' : '2px dashed',
            borderColor: isDragging ? '#4f3ff0' : 'divider',
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging ? 'rgba(79, 63, 240, 0.05)' : 'background.default',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isUploading ? 'background.default' : 'action.hover',
              borderColor: isUploading ? 'divider' : '#4f3ff0',
            },
          }}
        >
          <UploadIcon
            sx={{
              fontSize: 40,
              color: isDragging ? '#4f3ff0' : 'text.secondary',
              mb: 1,
            }}
          />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {isDragging ? "Suelta el archivo aquí" : "Arrastra y suelta archivos PDF"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            o haz clic para seleccionar • Máximo 10MB por archivo
          </Typography>
          {isUploading && <CircularProgress size={24} sx={{ mt: 2 }} />}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </Paper>
      )}

      {/* Upload error */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Card-based file list */}
      {!hasAdjuntos ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <PdfIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No hay documentos adjuntos
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {canModify
              ? "Arrastra archivos PDF o haz clic en el área superior para agregar"
              : "El equipo legal aún no ha cargado documentos"
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {/* Informe Oficial Card */}
          {informeOficial && (
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: 'success.main',
                  borderWidth: 2,
                  bgcolor: 'success.50',
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                    <GavelIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Informe Oficial
                      </Typography>
                      <Chip
                        label="Principal"
                        size="small"
                        color="success"
                      />
                    </Box>
                    <Typography variant="body2" noWrap>
                      {informeOficial.nombre_original}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(informeOficial.tamano_bytes)} • {formatDate(informeOficial.fecha_carga)}
                      {informeOficial.subido_por_detalle && ` • Por: ${extractUserName(informeOficial.subido_por_detalle)}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Descargar">
                      <IconButton onClick={() => handleDownload(informeOficial)} color="primary">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {canModify && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => handleDelete(informeOficial.id)}
                          disabled={isDeleting}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Acuses Section */}
          {acuses.length > 0 && (
            <>
              {informeOficial && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Acuses de Recibo ({cantidadAcuses})
                    </Typography>
                  </Divider>
                </Grid>
              )}

              {/* Acuses Cards */}
              {acuses.map((adjunto) => (
                <Grid item xs={12} sm={6} key={adjunto.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'grey.200', color: 'grey.700' }}>
                        <ReceiptIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            icon={<PdfIcon sx={{ fontSize: 14 }} />}
                            label="Acuse"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {adjunto.nombre_original}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(adjunto.tamano_bytes)} • {formatDate(adjunto.fecha_carga)}
                        </Typography>
                        {adjunto.descripcion && (
                          <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            {adjunto.descripcion}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title="Descargar">
                          <IconButton size="small" onClick={() => handleDownload(adjunto)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canModify && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(adjunto.id)}
                              disabled={isDeleting}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !isUploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Agregar Adjunto
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Tipo de adjunto */}
            <FormControl fullWidth>
              <InputLabel>Tipo de Adjunto</InputLabel>
              <Select
                value={tipoAdjunto}
                onChange={(e) => setTipoAdjunto(e.target.value as TipoAdjuntoInformeJuridico)}
                label="Tipo de Adjunto"
              >
                <MenuItem value="INFORME" disabled={tieneInformeOficial}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GavelIcon color={tieneInformeOficial ? 'disabled' : 'success'} fontSize="small" />
                    {TIPO_ADJUNTO_LABELS.INFORME}
                    {tieneInformeOficial && " (ya cargado)"}
                  </Box>
                </MenuItem>
                <MenuItem value="ACUSE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon fontSize="small" />
                    {TIPO_ADJUNTO_LABELS.ACUSE}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* File preview / selector */}
            {selectedFile ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: tipoAdjunto === 'INFORME' ? 'success.50' : 'grey.50',
                }}
              >
                <PdfIcon color="error" sx={{ fontSize: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ) : (
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ py: 2 }}
              >
                Seleccionar Archivo PDF
                <input
                  type="file"
                  hidden
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                />
              </Button>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
            sx={{
              backgroundColor: "#4f3ff0",
              "&:hover": { backgroundColor: "#3a2cc2" },
            }}
          >
            {isUploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
