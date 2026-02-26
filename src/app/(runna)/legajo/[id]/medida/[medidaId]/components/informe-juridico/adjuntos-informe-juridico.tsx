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
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Documentos Adjuntos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({adjuntos.length})
          </Typography>
        </Box>
      </Box>

      {/* Status chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          icon={tieneInformeOficial ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <GavelIcon sx={{ fontSize: '14px !important' }} />}
          label={tieneInformeOficial ? "Informe Cargado" : "Falta Informe"}
          color={tieneInformeOficial ? "success" : "warning"}
          size="small"
          sx={{ height: 24, fontSize: '0.75rem' }}
        />
        <Chip
          icon={<ReceiptIcon sx={{ fontSize: '14px !important' }} />}
          label={`${cantidadAcuses} Acuse${cantidadAcuses !== 1 ? "s" : ""}`}
          variant="outlined"
          size="small"
          sx={{ height: 24, fontSize: '0.75rem' }}
        />
      </Box>

      {/* Compact Drag-drop upload zone */}
      {canModify && (
        <Paper
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? '#4f3ff0' : 'divider',
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging ? 'rgba(79, 63, 240, 0.05)' : 'rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isUploading ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)',
              borderColor: isUploading ? 'divider' : '#4f3ff0',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            {isUploading ? (
              <CircularProgress size={20} />
            ) : (
              <UploadIcon sx={{ fontSize: 24, color: isDragging ? '#4f3ff0' : 'text.secondary' }} />
            )}
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {isDragging ? "Suelta aquí" : "Cargar nuevos documentos PDF"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Arrastra y suelta o haz clic para seleccionar (Máx 10MB)
              </Typography>
            </Box>
          </Box>
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
          {/* Informe Oficial Card - Compact */}
          {informeOficial && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  gap: 2,
                  borderColor: 'success.main',
                  borderWidth: 1.5,
                  bgcolor: 'success.50',
                  borderRadius: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                  <GavelIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      Informe Oficial
                    </Typography>
                    <Chip label="Principal" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" noWrap display="block" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {informeOficial.nombre_original}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {formatFileSize(informeOficial.tamano_bytes)} • {formatDate(informeOficial.fecha_carga)}
                    {informeOficial.subido_por_detalle && ` • Por: ${extractUserName(informeOficial.subido_por_detalle)}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Descargar">
                    <IconButton size="small" onClick={() => handleDownload(informeOficial)} color="primary">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canModify && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(informeOficial.id)}
                        disabled={isDeleting}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
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

              {/* Acuses List - Compact */}
              {acuses.map((adjunto) => (
                <Grid item xs={12} sm={6} key={adjunto.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.25,
                      gap: 1.5,
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'grey.100', color: 'grey.600', width: 32, height: 32 }}>
                      <ReceiptIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" noWrap display="block" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {adjunto.nombre_original}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {formatFileSize(adjunto.tamano_bytes)} • {formatDate(adjunto.fecha_carga)}
                      </Typography>
                      {adjunto.descripcion && (
                        <Typography variant="caption" noWrap display="block" sx={{ fontStyle: 'italic', color: 'text.disabled', fontSize: '0.65rem' }}>
                          {adjunto.descripcion}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0 }}>
                      <IconButton size="small" onClick={() => handleDownload(adjunto)}>
                        <DownloadIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      {canModify && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(adjunto.id)}
                          disabled={isDeleting}
                          color="error"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
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
