"use client"

import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import type { TAdjuntoActividad } from '../../../types/actividades'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatFileSize } from '@/utils/fileUtils'
import { usePdfViewer } from '@/hooks'
import {
  isPdfFile,
  downloadFileAuthenticated
} from '@/utils/pdfUtils'

interface AdjuntoCardProps {
  adjunto: TAdjuntoActividad
}

export const AdjuntoCard: React.FC<AdjuntoCardProps> = ({ adjunto }) => {
  const [loading, setLoading] = useState(false)
  const { openUrl, PdfModal } = usePdfViewer()
  const isPdf = isPdfFile(adjunto.nombre_original, adjunto.tipo_mime)

  /**
   * Handle file view - open in PDF viewer or new window
   * Uses adjunto.archivo (direct media URL) instead of archivo_url
   */
  const handleViewFile = useCallback(() => {
    if (isPdf) {
      // Open PDF in the viewer modal
      openUrl(adjunto.archivo, {
        title: adjunto.nombre_original,
        fileName: adjunto.nombre_original
      })
    } else {
      // For non-PDF files, open in new window
      window.open(adjunto.archivo, '_blank', 'noopener,noreferrer')
    }
  }, [adjunto.archivo, adjunto.nombre_original, isPdf, openUrl])

  /**
   * Handle file download
   * Uses adjunto.archivo (direct media URL)
   */
  const handleDownload = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch the file and trigger download with correct filename
      await downloadFileAuthenticated(adjunto.archivo, adjunto.nombre_original)
    } catch (error) {
      console.error('Error downloading file:', error)
      // Fallback: open in new tab
      window.open(adjunto.archivo, '_blank')
    } finally {
      setLoading(false)
    }
  }, [adjunto.archivo, adjunto.nombre_original])
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
          <Tooltip title={isPdf ? "Ver PDF" : "Ver archivo"}>
            <IconButton
              size="small"
              onClick={handleViewFile}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'white' }
              }}
            >
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar archivo">
            <IconButton
              size="small"
              onClick={handleDownload}
              disabled={loading}
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
            &ldquo;{adjunto.descripcion}&rdquo;
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

      {/* PDF Viewer Modal */}
      {PdfModal}
    </Paper>
  )
}
