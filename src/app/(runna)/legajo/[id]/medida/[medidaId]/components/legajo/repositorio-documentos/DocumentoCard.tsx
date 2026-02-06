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
  CircularProgress,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import BlockIcon from '@mui/icons-material/Block'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatFileSize } from '@/utils/fileUtils'
import { usePdfViewer } from '@/hooks'
import { isPdfFile, downloadFileAuthenticated } from '@/utils/pdfUtils'
import type { Documento } from '../../../types/repositorio-documentos'
import { getFileIcon, getTipoModeloLabel, CATEGORY_CONFIG } from './constants'

interface DocumentoCardProps {
  documento: Documento
}

export const DocumentoCard: React.FC<DocumentoCardProps> = ({ documento }) => {
  const [loading, setLoading] = useState(false)
  const { openUrl, PdfModal } = usePdfViewer()

  const fileName = documento.nombre_archivo || 'Sin nombre'
  const extension = documento.extension || ''
  const isPdf = isPdfFile(fileName)
  const hasFile = Boolean(documento.archivo_url)
  const categoryConfig = CATEGORY_CONFIG[documento.categoria]

  /**
   * Handle file view - open in PDF viewer or new window
   */
  const handleViewFile = useCallback(() => {
    if (!documento.archivo_url) return

    if (isPdf) {
      openUrl(documento.archivo_url, {
        title: fileName,
        fileName: fileName,
      })
    } else {
      window.open(documento.archivo_url, '_blank', 'noopener,noreferrer')
    }
  }, [documento.archivo_url, fileName, isPdf, openUrl])

  /**
   * Handle file download
   */
  const handleDownload = useCallback(async () => {
    if (!documento.archivo_url) return

    setLoading(true)
    try {
      await downloadFileAuthenticated(documento.archivo_url, fileName)
    } catch (error) {
      console.error('Error downloading file:', error)
      window.open(documento.archivo_url, '_blank')
    } finally {
      setLoading(false)
    }
  }, [documento.archivo_url, fileName])

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Fecha desconocida'
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      })
    } catch {
      return dateString
    }
  }

  /**
   * Get full date for tooltip
   */
  const getFullDate = (dateString: string | null): string => {
    if (!dateString) return 'Fecha desconocida'
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'medium',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: categoryConfig.bgColor,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: categoryConfig.borderColor,
        borderRadius: 2,
        transition: 'all 0.2s',
        opacity: hasFile ? 1 : 0.7,
        '&:hover': {
          boxShadow: hasFile ? 2 : 0,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: categoryConfig.borderColor,
            mt: 0.5,
            fontSize: '1.2rem',
          }}
        >
          {hasFile ? getFileIcon(extension) : <BlockIcon fontSize="small" />}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <InsertDriveFileIcon
              sx={{ fontSize: 16, color: categoryConfig.borderColor }}
            />
            <Tooltip title={fileName}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </Typography>
            </Tooltip>
            <Chip
              label={getTipoModeloLabel(documento.tipo_modelo)}
              size="small"
              color={categoryConfig.color}
              sx={{
                height: 20,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          <Tooltip title={getFullDate(documento.fecha_subida)}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {formatDate(documento.fecha_subida)}
              {documento.usuario_subida && ` • ${documento.usuario_subida.nombre_completo}`}
            </Typography>
          </Tooltip>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={hasFile ? (isPdf ? 'Ver PDF' : 'Ver archivo') : 'Archivo no disponible'}>
            <span>
              <IconButton
                size="small"
                onClick={handleViewFile}
                disabled={loading || !hasFile}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={hasFile ? 'Descargar archivo' : 'Archivo no disponible'}>
            <span>
              <IconButton
                size="small"
                onClick={handleDownload}
                disabled={loading || !hasFile}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* File Info */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Tamaño: {formatFileSize(documento.tamanio_bytes)}
          </Typography>
          {extension && (
            <>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formato: {extension.toUpperCase()}
              </Typography>
            </>
          )}
          <Chip
            label={documento.tipo_modelo_display || documento.tipo_modelo}
            size="small"
            variant="outlined"
            color={categoryConfig.color}
            sx={{ height: 18, fontSize: '0.65rem', ml: 'auto' }}
          />
        </Box>

        {documento.descripcion && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 0.5,
              fontStyle: 'italic',
              fontSize: '0.85rem',
            }}
          >
            &ldquo;{documento.descripcion}&rdquo;
          </Typography>
        )}

        {!hasFile && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <BlockIcon sx={{ fontSize: 14, color: 'error.main' }} />
            <Typography variant="caption" color="error.main">
              Archivo no disponible
            </Typography>
          </Box>
        )}
      </Box>

      {/* PDF Viewer Modal */}
      {PdfModal}
    </Paper>
  )
}

export default DocumentoCard
