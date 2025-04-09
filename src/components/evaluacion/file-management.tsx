"use client"

import type React from "react"

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material"
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"

interface FileInfo {
  id: string
  name: string
  type: string
  size: number
  date: string
  url: string
  archivo?: string
}

interface FileManagementProps {
  demandaId?: number | null
}

// Export the handle type for TypeScript support
export interface FileManagementHandle {
  addGeneratedPDF: (pdfBlob: Blob, fileName: string) => FileInfo
}

const FileManagement = forwardRef<FileManagementHandle, FileManagementProps>(({ demandaId }, ref) => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    addGeneratedPDF: (pdfBlob: Blob, fileName = "informe_valoracion.pdf") => {
      // Crear un objeto URL para el blob
      const blobUrl = URL.createObjectURL(pdfBlob)

      // Crear un nuevo archivo en el formato esperado por la API
      const newFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: fileName,
        type: "application/pdf",
        size: pdfBlob.size,
        date: new Date().toLocaleString(),
        url: blobUrl,
        archivo: `/media/TDemandaAdjunto/archivo_${Math.floor(Math.random() * 1000)}/${fileName}`,
      }

      setFiles((prev) => [...prev, newFile])

      // Añadir el archivo a los adjuntos si existe la función setAdjuntos
      if (typeof window !== "undefined" && window.dispatchEvent) {
        // Crear un evento personalizado para notificar que se ha generado un nuevo archivo
        const event = new CustomEvent("newFileGenerated", { detail: { file: newFile } })
        window.dispatchEvent(event)
      }

      toast.success("Informe generado y guardado exitosamente", {
        position: "top-center",
        autoClose: 3000,
      })

      return newFile
    },
  }))

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      uploadFiles(Array.from(event.target.files))
    }
  }

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  // Upload files
  const uploadFiles = (fileList: File[]) => {
    // In a real application, you would upload these files to your server
    // For this example, we'll just add them to our local state

    const newFiles = fileList.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      date: new Date().toLocaleString(),
      url: URL.createObjectURL(file),
    }))

    setFiles((prev) => [...prev, ...newFiles])

    toast.success(
      `${fileList.length} archivo${fileList.length !== 1 ? "s" : ""} subido${fileList.length !== 1 ? "s" : ""} exitosamente`,
      {
        position: "top-center",
        autoClose: 3000,
      },
    )
  }

  // Delete a file
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
    toast.info("Archivo eliminado", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
          ARCHIVOS
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Upload area */}
          <Box
            sx={{
              flex: "1 1 40%",
              border: "2px dashed",
              borderColor: isDragging ? "#0EA5E9" : "rgba(0, 0, 0, 0.12)",
              borderRadius: 1,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              backgroundColor: isDragging ? "rgba(14, 165, 233, 0.08)" : "transparent",
              transition: "all 0.2s ease",
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 2 }} />
            <Typography variant="body1" align="center" gutterBottom>
              Arrastra y suelta archivos aquí
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => fileInputRef.current?.click()} sx={{ mt: 2 }}>
              SELECCIONAR ARCHIVOS
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} multiple />
          </Box>

          {/* Existing files */}
          <Box sx={{ flex: "1 1 60%" }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              Archivos existentes:
            </Typography>

            {files.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                No hay archivos existentes
              </Typography>
            ) : (
              <List sx={{ maxHeight: 300, overflow: "auto" }}>
                {files.map((file) => (
                  <Box key={file.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="download" href={file.url} download={file.name}>
                            <DownloadIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        {file.type === "application/pdf" ? <PdfIcon color="error" /> : <FileIcon color="primary" />}
                      </ListItemIcon>
                      <ListItemText primary={file.name} secondary={`${formatFileSize(file.size)} • ${file.date}`} />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
})

FileManagement.displayName = "FileManagement"

export default FileManagement
