"use client"

/**
 * FileUploadSection - Reusable File Upload and Management Component
 *
 * Provides file upload, list display, and management functionality.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - File upload button with drag-and-drop support
 * - List of uploaded files with download/delete actions
 * - File type filtering
 * - Loading states
 * - Empty state message
 */

import type React from "react"
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Card,
  Alert,
} from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DownloadIcon from "@mui/icons-material/Download"
import DeleteIcon from "@mui/icons-material/Delete"
import DescriptionIcon from "@mui/icons-material/Description"

export interface FileItem {
  id: number | string
  nombre: string
  tipo?: string
  url?: string
  fecha_subida?: string
  tamano?: number
}

export interface FileUploadSectionProps {
  // File data
  files: FileItem[]
  isLoading?: boolean

  // Actions
  onUpload?: (file: File) => void | Promise<void>
  onDownload?: (file: FileItem) => void
  onDelete?: (fileId: number | string) => void | Promise<void>

  // Configuration
  allowedTypes?: string // e.g., ".pdf,.doc,.docx"
  maxSizeInMB?: number
  disabled?: boolean
  readOnly?: boolean

  // Labels
  title?: string
  uploadButtonLabel?: string
  emptyMessage?: string

  // Upload state
  isUploading?: boolean
  uploadError?: string
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  isLoading = false,
  onUpload,
  onDownload,
  onDelete,
  allowedTypes,
  maxSizeInMB = 10,
  disabled = false,
  readOnly = false,
  title = "Documentos y Archivos",
  uploadButtonLabel = "Subir Archivo",
  emptyMessage = "No hay archivos adjuntos",
  isUploading = false,
  uploadError,
}) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSizeInMB) {
        alert(`El archivo excede el tamaño máximo permitido de ${maxSizeInMB}MB`)
        return
      }

      onUpload(file)
      // Reset input
      event.target.value = ""
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ""
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      const kb = bytes / 1024
      return `${kb.toFixed(1)} KB`
    }
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-AR")
    } catch {
      return dateString
    }
  }

  return (
    <Card elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {/* Upload Button */}
        {!readOnly && onUpload && (
          <Button
            variant="outlined"
            component="label"
            startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
            disabled={disabled || isUploading}
            sx={{ textTransform: "none" }}
          >
            {isUploading ? "Subiendo..." : uploadButtonLabel}
            <input
              type="file"
              hidden
              accept={allowedTypes}
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
            />
          </Button>
        )}
      </Box>

      {/* Upload Error */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* File List */}
          {files.length > 0 ? (
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon>
                    <AttachFileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.nombre}
                    secondary={
                      <>
                        {file.tipo && <span>{file.tipo}</span>}
                        {file.tamano && <span> • {formatFileSize(file.tamano)}</span>}
                        {file.fecha_subida && <span> • {formatDate(file.fecha_subida)}</span>}
                      </>
                    }
                    primaryTypographyProps={{
                      sx: { fontWeight: 500 },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {/* Download Button */}
                      {onDownload && file.url && (
                        <IconButton
                          size="small"
                          onClick={() => onDownload(file)}
                          title="Descargar"
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}

                      {/* Delete Button */}
                      {!readOnly && onDelete && (
                        <IconButton
                          size="small"
                          onClick={() => onDelete(file.id)}
                          color="error"
                          title="Eliminar"
                          disabled={disabled}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <AttachFileIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">{emptyMessage}</Typography>
            </Box>
          )}
        </>
      )}
    </Card>
  )
}
