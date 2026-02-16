"use client"

/**
 * AdjuntosNotaAval Component (MED-03)
 * Componente para gestionar y visualizar adjuntos de Nota de Aval
 *
 * Características:
 * - Drag-drop upload zone
 * - Card-based file display (responsive grid)
 * - Enhanced empty state with illustration
 * - Download de archivos PDF
 * - Eliminación de adjuntos (solo Director o Superusuario)
 * - Validación de archivos (PDF, máx 10MB)
 */

import React, { useState, useRef } from "react"
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material"
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material"
import { useNotaAvalAdjuntos } from "../../hooks/useNotaAvalAdjuntos"
import { extractUserName } from "../../types/nota-aval-api"
import type { AdjuntoNotaAval } from "../../types/nota-aval-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface AdjuntosNotaAvalProps {
  medidaId: number
  canDelete?: boolean // Si el usuario puede eliminar adjuntos (Director o Superusuario)
  canUpload?: boolean // Si el usuario puede subir adjuntos (Director o Superusuario)
  showUploadButton?: boolean // Mostrar botón de upload
  dense?: boolean // Modo compacto
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdjuntosNotaAval: React.FC<AdjuntosNotaAvalProps> = ({
  medidaId,
  canDelete = false,
  canUpload = false,
  // showUploadButton is kept for API compatibility but drag-drop zone replaces it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showUploadButton = false,
  dense = false,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    adjuntos,
    isLoadingAdjuntos,
    adjuntosError,
    deleteAdjunto,
    isDeleting,
    uploadFile,
    isUploading,
    uploadProgress,
    hasAdjuntos,
    adjuntosCount,
    formatFileSize,
    validateFileBeforeUpload,
    allowedExtensions,
    maxSizeBytes,
  } = useNotaAvalAdjuntos(medidaId)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle file download
   */
  const handleDownload = (adjunto: AdjuntoNotaAval) => {
    window.open(adjunto.archivo, "_blank")
  }

  /**
   * Handle file delete
   */
  const handleDelete = async (adjuntoId: number) => {
    if (!canDelete) return

    if (
      !confirm(
        "¿Está seguro que desea eliminar este adjunto? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    try {
      await deleteAdjunto(adjuntoId)
    } catch (error) {
      console.error("Error deleting adjunto:", error)
    }
  }

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUpload) return

    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    const validation = validateFileBeforeUpload(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      await uploadFile(file)
    } catch (error) {
      console.error("Error uploading file:", error)
    }

    event.target.value = ""
  }

  /**
   * Handle drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    if (!canUpload) return
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
  const handleDrop = async (e: React.DragEvent) => {
    if (!canUpload) return
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Upload first valid file
    for (const file of files) {
      const validation = validateFileBeforeUpload(file)
      if (validation.valid) {
        try {
          await uploadFile(file)
        } catch (error) {
          console.error("Error uploading file:", error)
        }
        break // Only upload one file at a time
      } else {
        alert(validation.error)
      }
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

  if (isLoadingAdjuntos) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (adjuntosError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar adjuntos: {adjuntosError.message}
      </Alert>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2">
            Documentos Adjuntos
          </Typography>
          {hasAdjuntos && (
            <Chip label={adjuntosCount} size="small" color="primary" />
          )}
        </Box>
      </Box>

      {/* DRAG & DROP UPLOAD ZONE */}
      {canUpload && (
        <Paper
          variant="outlined"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            p: 3,
            mb: 2,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "grey.300",
            bgcolor: isDragging ? "action.hover" : "background.default",
            cursor: isUploading ? "default" : "pointer",
            transition: "all 0.2s ease",
            opacity: isUploading ? 0.7 : 1,
            "&:hover": {
              borderColor: isUploading ? "grey.300" : "primary.light",
              bgcolor: isUploading ? "background.default" : "action.hover",
            },
          }}
        >
          {isUploading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Subiendo {uploadProgress?.fileName}... {uploadProgress?.progress}%
              </Typography>
            </Box>
          ) : (
            <>
              <CloudUploadIcon
                sx={{
                  fontSize: 40,
                  color: isDragging ? "primary.main" : "text.secondary",
                  mb: 1,
                }}
              />
              <Typography variant="body2" color={isDragging ? "primary.main" : "text.secondary"}>
                {isDragging ? "Suelta el archivo aquí" : "Arrastra archivos o haz clic para seleccionar"}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                PDF, máximo {formatFileSize(maxSizeBytes)}
              </Typography>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={allowedExtensions.join(",")}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </Paper>
      )}

      {/* ADJUNTOS LIST - Card based */}
      {hasAdjuntos ? (
        <Grid container spacing={2}>
          {adjuntos?.map((adjunto) => (
            <Grid item xs={12} sm={dense ? 12 : 6} key={adjunto.id}>
              <Card
                variant="outlined"
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: dense ? 1 : 1.5,
                    px: 2,
                    "&:last-child": { pb: dense ? 1 : 1.5 },
                  }}
                >
                  {/* ICON */}
                  <Avatar
                    sx={{
                      bgcolor: "error.lighter",
                      width: dense ? 36 : 40,
                      height: dense ? 36 : 40,
                    }}
                  >
                    <PdfIcon sx={{ color: "error.main", fontSize: dense ? 20 : 24 }} />
                  </Avatar>

                  {/* TEXT */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      title={adjunto.nombre_archivo}
                    >
                      {adjunto.nombre_archivo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {formatFileSize(adjunto.tamano_bytes)}
                      {" • "}
                      {formatDate(adjunto.fecha_carga)}
                      {adjunto.subido_por_detalle && !dense && (
                        <>
                          {" • "}
                          {extractUserName(adjunto.subido_por_detalle)}
                        </>
                      )}
                    </Typography>
                  </Box>

                  {/* ACTIONS */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Descargar">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(adjunto)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {canDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(adjunto.id)}
                          disabled={isDeleting}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* EMPTY STATE */
        <Box sx={{ textAlign: "center", py: 4 }}>
          <AttachFileIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sin documentos adjuntos
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {canUpload
              ? "Arrastra archivos aquí o usa el área de arriba para subir documentos"
              : "No hay documentos disponibles para esta nota de aval"}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
