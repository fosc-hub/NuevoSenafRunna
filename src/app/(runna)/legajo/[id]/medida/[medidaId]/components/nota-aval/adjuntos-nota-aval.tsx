"use client"

/**
 * AdjuntosNotaAval Component (MED-03)
 * Componente para gestionar y visualizar adjuntos de Nota de Aval
 *
 * Características:
 * - Lista de adjuntos con información detallada
 * - Download de archivos PDF
 * - Eliminación de adjuntos (solo Director o Superusuario)
 * - Vista previa de documentos
 * - Upload de nuevos adjuntos
 * - Validación de archivos (PDF, máx 10MB)
 */

import React from "react"
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
} from "@mui/material"
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
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
  showUploadButton = false,
  dense = false,
}) => {
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
    // Open in new tab or download
    window.open(adjunto.archivo, "_blank")
  }

  /**
   * Handle file delete
   */
  const handleDelete = async (adjuntoId: number) => {
    if (!canDelete) return

    // Show confirmation
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

    // Validate file
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

    // Reset input
    event.target.value = ""
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
  // EMPTY STATE
  // ============================================================================

  if (!hasAdjuntos && !showUploadButton) {
    return (
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No hay adjuntos disponibles
        </Typography>
      </Paper>
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
          mb: 1,
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

        {/* UPLOAD BUTTON */}
        {showUploadButton && canUpload && (
          <Button
            component="label"
            size="small"
            startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
            disabled={isUploading}
            sx={{ textTransform: "none" }}
          >
            Subir archivo
            <input
              type="file"
              hidden
              accept={allowedExtensions.join(",")}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Button>
        )}
      </Box>

      {/* INFO TEXT */}
      {canUpload && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Solo archivos PDF, tamaño máximo {formatFileSize(maxSizeBytes)}
        </Typography>
      )}

      {/* UPLOAD PROGRESS */}
      {uploadProgress && uploadProgress.isUploading && (
        <Alert severity="info" icon={<CircularProgress size={16} />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Subiendo {uploadProgress.fileName}... {uploadProgress.progress}%
          </Typography>
        </Alert>
      )}

      {/* ADJUNTOS LIST */}
      {hasAdjuntos ? (
        <List dense={dense} sx={{ py: 0 }}>
          {adjuntos?.map((adjunto) => (
            <Paper
              key={adjunto.id}
              variant="outlined"
              sx={{
                mb: 1,
                "&:last-child": { mb: 0 },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItem>
                {/* ICON */}
                <ListItemIcon>
                  <PdfIcon color="error" />
                </ListItemIcon>

                {/* TEXT */}
                <ListItemText
                  primary={adjunto.nombre_archivo}
                  secondary={
                    <>
                      {formatFileSize(adjunto.tamano_bytes)}
                      {" • "}
                      {formatDate(adjunto.fecha_carga)}
                      {adjunto.subido_por_detalle && (
                        <>
                          {" • "}
                          {extractUserName(adjunto.subido_por_detalle)}
                        </>
                      )}
                    </>
                  }
                  primaryTypographyProps={{
                    sx: { wordBreak: "break-word" },
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                  }}
                />

                {/* ACTIONS */}
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {/* Download Button */}
                    <Tooltip title="Descargar">
                      <IconButton
                        edge="end"
                        onClick={() => handleDownload(adjunto)}
                        size="small"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Delete Button */}
                    {canDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(adjunto.id)}
                          disabled={isDeleting}
                          size="small"
                          color="error"
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
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
          <AttachFileIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No hay adjuntos disponibles
          </Typography>
          {canUpload && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Puede subir documentos usando el botón de arriba
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  )
}
