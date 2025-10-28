"use client"

import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import type { TAdjuntoActividad } from '../../../types/actividades'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AdjuntoCardProps {
  adjunto: TAdjuntoActividad
}

export const AdjuntoCard: React.FC<AdjuntoCardProps> = ({ adjunto }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getFileIcon = (tipo_mime: string) => {
    if (tipo_mime.includes('pdf')) return '📄'
    if (tipo_mime.includes('image')) return '🖼️'
    if (tipo_mime.includes('word') || tipo_mime.includes('document')) return '📝'
    if (tipo_mime.includes('excel') || tipo_mime.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'blue.50',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: 'info.main',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'info.main',
            mt: 0.5,
            fontSize: '1.2rem'
          }}
        >
          {getFileIcon(adjunto.tipo_mime)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <AttachFileIcon sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {adjunto.usuario_carga.nombre_completo}
            </Typography>
            <Chip
              label="Adjunto"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'info.main',
                color: 'white'
              }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
            title={new Date(adjunto.fecha_subida).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'medium'
            })}
          >
            {formatDistanceToNow(new Date(adjunto.fecha_subida), {
              addSuffix: true,
              locale: es
            })}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver archivo">
            <IconButton
              size="small"
              href={adjunto.archivo_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar archivo">
            <IconButton
              size="small"
              href={adjunto.archivo_url}
              download
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* File Info */}
      <Box
        sx={{
          pl: 6,
          p: 1.5,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <InsertDriveFileIcon sx={{ fontSize: 18, color: 'info.main' }} />
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {adjunto.nombre_original}
          </Typography>
          <Chip
            label={adjunto.tipo_adjunto_display}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Tamaño: {formatFileSize(adjunto.tamanio_bytes)} • Tipo: {adjunto.tipo_mime}
        </Typography>

        {adjunto.descripcion && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 0.5,
              fontStyle: 'italic',
              fontSize: '0.85rem'
            }}
          >
            "{adjunto.descripcion}"
          </Typography>
        )}

        {adjunto.version > 1 && (
          <Chip
            label={`Versión ${adjunto.version}`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Paper>
  )
}
