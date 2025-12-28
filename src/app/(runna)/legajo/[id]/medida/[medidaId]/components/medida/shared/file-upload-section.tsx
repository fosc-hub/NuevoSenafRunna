"use client"

/**
 * FileUploadSection - Reusable File Upload and Management Component
 *
 * Provides file upload, list display, and management functionality.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - File upload button with drag-and-drop support (NEW)
 * - Drag-and-drop zone for intuitive file uploading (NEW)
 * - List of uploaded files with download/delete actions
 * - File type filtering
 * - Multiple file upload support
 * - Loading states
 * - Empty state message
 *
 * REFACTORED: Enhanced with drag-and-drop functionality
 * Consolidates duplicate drag-and-drop patterns from 7+ files
 */

import type React from "react"
import { useState, useRef } from "react"
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
  Paper,
} from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DownloadIcon from "@mui/icons-material/Download"
import DeleteIcon from "@mui/icons-material/Delete"
import DescriptionIcon from "@mui/icons-material/Description"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import { formatDateLocaleAR } from "@/utils/dateUtils"

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
  multiple?: boolean // Allow multiple file selection (default: false)

  // Drag-and-drop (NEW)
  enableDragDrop?: boolean // Enable drag-and-drop zone (default: true)
  dragDropMessage?: string // Message shown in drag zone
  dragDropHeight?: number | string // Height of drag zone

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
  multiple = false,
  enableDragDrop = true,
  dragDropMessage = "Arrastra y suelta archivos aquí",
  dragDropHeight = 200,
  title = "Documentos y Archivos",
  uploadButtonLabel = "Subir Archivo",
  emptyMessage = "No hay archivos adjuntos",
  isUploading = false,
  uploadError,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles.length > 0 && onUpload) {
      const filesToProcess = multiple ? Array.from(selectedFiles) : [selectedFiles[0]]

      filesToProcess.forEach((file) => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > maxSizeInMB) {
          alert(`El archivo "${file.name}" excede el tamaño máximo permitido de ${maxSizeInMB}MB`)
          return
        }

        onUpload(file)
      })

      // Reset input
      event.target.value = ""
    }
  }

  // Drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !readOnly) {
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
    if (!isDragging && !disabled && !readOnly) {
      setIsDragging(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || readOnly || !onUpload) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      const filesToProcess = multiple ? Array.from(droppedFiles) : [droppedFiles[0]]

      filesToProcess.forEach((file) => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > maxSizeInMB) {
          alert(`El archivo "${file.name}" excede el tamaño máximo permitido de ${maxSizeInMB}MB`)
          return
        }

        onUpload(file)
      })
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
      return formatDateLocaleAR(dateString)
    } catch {
      return dateString
    }
  }

  return (
    <Card elevation={2} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {/* Upload Button (shown when drag-drop is disabled) */}
        {!readOnly && onUpload && !enableDragDrop && (
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
              multiple={multiple}
            />
          </Button>
        )}
      </Box>

      {/* Drag-and-Drop Zone (NEW) */}
      {!readOnly && onUpload && enableDragDrop && (
        <Paper
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: isDragging ? "2px dashed" : "2px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: "center",
            cursor: disabled || isUploading ? "not-allowed" : "pointer",
            backgroundColor: isDragging ? "action.hover" : "background.default",
            transition: "all 0.2s ease",
            minHeight: dragDropHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: disabled || isUploading ? "background.default" : "action.hover",
              borderColor: disabled || isUploading ? "divider" : "primary.main",
            },
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: isDragging ? "primary.main" : "text.secondary",
              mb: 2,
            }}
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {isDragging ? "Suelta los archivos aquí" : dragDropMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            o{" "}
            <Button variant="text" component="span" sx={{ textTransform: "none", fontWeight: 600, p: 0 }}>
              selecciona archivos
            </Button>
          </Typography>
          {isUploading && <CircularProgress size={24} sx={{ mt: 1 }} />}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept={allowedTypes}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            multiple={multiple}
          />
        </Paper>
      )}

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
