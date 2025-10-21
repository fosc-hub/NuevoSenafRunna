"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  Chip,
} from "@mui/material"
import {
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"

// Modificar la interfaz Adjunto para que coincida con la estructura de datos real
interface Adjunto {
  archivo: string
  id?: string
  name?: string
  type?: string
  size?: number
  date?: string
  url?: string
}

interface AdjuntosTabProps {
  adjuntos: Adjunto[]
  setAdjuntos: React.Dispatch<React.SetStateAction<Adjunto[]>>
}

// Actualizar la función AdjuntosTab para manejar la nueva estructura de datos
export default function AdjuntosTab({ adjuntos, setAdjuntos }: AdjuntosTabProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleDeleteAdjunto = (archivo: string) => {
    setAdjuntos((prev) => prev.filter((file) => file.archivo !== archivo))
  }

  // Función para extraer el nombre del archivo de la ruta
  const getFileName = (filePath: string): string => {
    if (!filePath) return "Archivo sin nombre"
    const parts = filePath.split("/")
    return parts[parts.length - 1]
  }

  // Función para determinar el tipo de archivo basado en la extensión
  const getFileType = (fileName: string): string => {
    if (!fileName) return "application/octet-stream"
    const extension = fileName.split(".").pop()?.toLowerCase() || ""
    if (extension === "pdf") return "application/pdf"
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image/" + extension
    if (["doc", "docx"].includes(extension)) return "application/msword"
    if (["xls", "xlsx"].includes(extension)) return "application/vnd.ms-excel"
    return "application/octet-stream"
  }

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon color="info" />
    if (fileType === "application/pdf") return <PdfIcon color="error" />
    if (fileType.includes("msword") || fileType.includes("document")) return <DescriptionIcon color="primary" />
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <DescriptionIcon color="success" />
    return <FileIcon color="action" />
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch (e) {
      return dateString
    }
  }

  // Función para previsualizar archivos
  const handlePreview = (fileUrl: string, fileType: string) => {
    if (fileType.startsWith("image/") || fileType === "application/pdf") {
      setPreviewUrl(fileUrl)
      window.open(fileUrl, "_blank")
    } else {
      // Si no es un tipo previsualizable, descargar directamente
      window.open(fileUrl, "_blank")
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Adjuntos
      </Typography>
      {adjuntos.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No hay archivos adjuntos
        </Typography>
      ) : (
        <List sx={{ maxHeight: 500, overflow: "auto" }}>
          {adjuntos.map((file, index) => {
            const fileName = file.name || getFileName(file.archivo)
            const fileType = file.type || getFileType(fileName)
            // Fix URL construction: check if archivo already has full URL
            const fileUrl = file.url || (file.archivo.startsWith("http://") || file.archivo.startsWith("https://")
              ? file.archivo
              : `${baseUrl}${file.archivo}`)
            const fileDate = file.date || ""

            return (
              <Box key={index}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Previsualizar">
                        <IconButton edge="end" aria-label="preview" onClick={() => handlePreview(fileUrl, fileType)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descargar">
                        <IconButton
                          edge="end"
                          aria-label="download"
                          component="a"
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAdjunto(file.archivo)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>{getFileIcon(fileType)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {fileName}
                        <Chip
                          label={fileType.split("/")[1]?.toUpperCase() || "ARCHIVO"}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {fileDate && formatDate(fileDate)}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="a"
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: "none", color: "primary.main", display: "block", mt: 0.5 }}
                        >
                          Ver archivo
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </Box>
            )
          })}
        </List>
      )}
    </Paper>
  )
}
