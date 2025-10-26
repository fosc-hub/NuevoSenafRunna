"use client"

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Link,
  Button
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { AttachmentUpload } from '../AttachmentUpload'
import type { TAdjuntoActividad } from '../../../types/actividades'
import { actividadService } from '../../../services/actividadService'

interface EvidenciasTabProps {
  actividadId: number
  adjuntos: TAdjuntoActividad[]
  canEdit: boolean
  onSuccess: () => void
}

export const EvidenciasTab: React.FC<EvidenciasTabProps> = ({
  actividadId,
  adjuntos,
  canEdit,
  onSuccess
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (
    files: File[],
    tipos?: string[],
    descripciones?: string[]
  ) => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Upload each file individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const tipo = tipos?.[i] || 'EVIDENCIA'
        const descripcion = descripciones?.[i] || ''

        await actividadService.addAttachment(actividadId, {
          tipo_adjunto: tipo,
          archivo: file,
          descripcion
        })
      }

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Group adjuntos by activo status
  const adjuntosActivos = adjuntos.filter(adj => adj.archivo_url) // Active attachments
  const totalAdjuntos = adjuntosActivos.length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Upload Section */}
      {canEdit && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Adjuntar Evidencias
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sube archivos como evidencia de la ejecución de esta actividad. Los formatos permitidos son: PDF, JPG, PNG, DOCX.
          </Typography>

          <AttachmentUpload
            files={[]}
            onChange={handleFileUpload}
            requiereEvidencia={false}
          />

          {uploading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Subiendo archivos...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Paper>
      )}

      {/* Adjuntos List */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Archivos Adjuntos
          </Typography>
          <Chip
            label={`${totalAdjuntos} archivo${totalAdjuntos !== 1 ? 's' : ''}`}
            color="primary"
            size="small"
          />
        </Box>

        {adjuntosActivos.length === 0 ? (
          <Alert severity="info">
            No hay archivos adjuntos en esta actividad.
          </Alert>
        ) : (
          <List>
            {adjuntosActivos.map((adjunto) => (
              <ListItem
                key={adjunto.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper'
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      href={adjunto.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver archivo"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      href={adjunto.archivo_url}
                      download
                      title="Descargar archivo"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>
                  <AttachFileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {adjunto.archivo.split('/').pop()}
                      </Typography>
                      <Chip
                        label={adjunto.tipo_adjunto_display}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Subido el {new Date(adjunto.fecha_carga).toLocaleDateString('es-ES', { dateStyle: 'medium' })} por {adjunto.usuario_carga_info.full_name}
                      </Typography>
                      {adjunto.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {adjunto.descripcion}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Evidence Requirement Warning */}
      {totalAdjuntos === 0 && (
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Atención:</strong> Las actividades originadas en PI/Oficios requieren al menos un adjunto (evidencia) para poder completarse.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
