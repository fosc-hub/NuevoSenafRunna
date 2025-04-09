"use client"

import type React from "react"
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider } from "@mui/material"
import {
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
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
  const baseUrl = "https://web-production-c6370.up.railway.app"

  const handleDeleteAdjunto = (archivo: string) => {
    setAdjuntos((prev) => prev.filter((file) => file.archivo !== archivo))
  }

  // Función para extraer el nombre del archivo de la ruta
  const getFileName = (filePath: string): string => {
    const parts = filePath.split("/")
    return parts[parts.length - 1]
  }

  // Función para determinar el tipo de archivo basado en la extensión
  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""
    if (extension === "pdf") return "application/pdf"
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image/" + extension
    return "application/octet-stream"
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
        <List sx={{ maxHeight: 300, overflow: "auto" }}>
          {adjuntos.map((file, index) => {
            const fileName = getFileName(file.archivo)
            const fileType = getFileType(fileName)
            const fileUrl = `${baseUrl}${file.archivo}`

            return (
              <Box key={index}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="download"
                        component="a"
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAdjunto(file.archivo)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {fileType === "application/pdf" ? <PdfIcon color="error" /> : <FileIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={fileName}
                    secondary={
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        Ver archivo
                      </a>
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
