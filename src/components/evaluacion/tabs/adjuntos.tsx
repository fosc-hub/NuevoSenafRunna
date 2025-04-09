"use client"

import type React from "react"
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider } from "@mui/material"
import {
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"

interface Adjunto {
  id: string
  name: string
  type: string
  size: number
  date: string
  url: string
}

interface AdjuntosTabProps {
  adjuntos: Adjunto[]
  setAdjuntos: React.Dispatch<React.SetStateAction<Adjunto[]>>
}

export default function AdjuntosTab({ adjuntos, setAdjuntos }: AdjuntosTabProps) {
  const handleDeleteAdjunto = (id: string) => {
    setAdjuntos((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
          {adjuntos.map((file) => (
            <Box key={file.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="download" href={file.url} download={file.name}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAdjunto(file.id)}>
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
    </Paper>
  )
}
