"use client"

import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper
} from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import type { TComentarioActividad } from '../../../types/actividades'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ComentarioCardProps {
  comentario: TComentarioActividad
}

export const ComentarioCard: React.FC<ComentarioCardProps> = ({ comentario }) => {
  const renderMenciones = (texto: string) => {
    // Simple @mention highlighting
    const parts = texto.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Chip
            key={`mention-${index}`}
            label={part}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mx: 0.5 }}
          />
        )
      }
      // Don't render empty strings
      if (!part) return null
      return <span key={`text-${index}`}>{part}</span>
    })
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: 'primary.main',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', mt: 0.5 }}>
          {comentario.autor.nombre_completo.charAt(0)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {comentario.autor.nombre_completo}
            </Typography>
            <Chip
              label="Comentario"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'primary.main',
                color: 'white'
              }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
            title={new Date(comentario.fecha_creacion).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'medium'
            })}
          >
            {formatDistanceToNow(new Date(comentario.fecha_creacion), {
              addSuffix: true,
              locale: es
            })}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Typography
        variant="body2"
        sx={{
          mb: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          pl: 6
        }}
      >
        {renderMenciones(comentario.texto)}
      </Typography>

      {/* Footer metadata - only show if we have mention or notification data */}
      {((comentario.menciones?.length ?? 0) > 0 || (comentario.notificaciones_enviadas ?? 0) > 0) && (
        <Box sx={{ pl: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Mentions */}
          {(comentario.menciones?.length ?? 0) > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                Mencionados:
              </Typography>
              {comentario.menciones.map((mencion) => (
                <Chip
                  key={mencion.id}
                  label={mencion.nombre_completo}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}

          {/* Notifications sent indicator */}
          {(comentario.notificaciones_enviadas ?? 0) > 0 && (
            <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ✓ {comentario.notificaciones_enviadas} notificación(es) enviada(s)
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  )
}
