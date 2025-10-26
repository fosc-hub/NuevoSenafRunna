"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import type { TComentarioActividad } from '../../../types/actividades'

interface ComentariosTabProps {
  actividadId: number
  comentarios: TComentarioActividad[]
  onAgregarComentario: (texto: string) => Promise<any>
  loading: boolean
}

export const ComentariosTab: React.FC<ComentariosTabProps> = ({
  actividadId,
  comentarios,
  onAgregarComentario,
  loading
}) => {
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!nuevoComentario.trim()) {
      setError('El comentario no puede estar vacío')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await onAgregarComentario(nuevoComentario)

    if (result) {
      setNuevoComentario('')
    } else {
      setError('Error al agregar el comentario')
    }

    setSubmitting(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  const renderMenciones = (texto: string) => {
    // Simple @mention highlighting
    const parts = texto.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Chip
            key={index}
            label={part}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mx: 0.5 }}
          />
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Comment Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Agregar Comentario
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Usa @usuario para mencionar a otros usuarios. Serán notificados automáticamente.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe tu comentario aquí... (Ctrl+Enter para enviar)"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={submitting}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
          {error && (
            <Alert severity="error" sx={{ flex: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            endIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={submitting || !nuevoComentario.trim()}
          >
            {submitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>
      </Paper>

      {/* Comments Timeline */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : comentarios.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </Typography>
          </Paper>
        ) : (
          <List>
            {comentarios.map((comentario) => (
              <ListItem
                key={comentario.id}
                alignItems="flex-start"
                sx={{
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  mb: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {comentario.autor.nombre_completo.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {comentario.autor.nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comentario.fecha_creacion).toLocaleString('es-ES', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                      {comentario.editado && ' (editado)'}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {renderMenciones(comentario.texto)}
                </Typography>

                {/* Mentions */}
                {comentario.menciones && comentario.menciones.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      Mencionados:
                    </Typography>
                    {comentario.menciones.map((mencion) => (
                      <Chip
                        key={mencion.id}
                        label={mencion.nombre_completo}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}

                {/* Notifications sent indicator */}
                {comentario.notificaciones_enviadas > 0 && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                    ✓ {comentario.notificaciones_enviadas} notificación(es) enviada(s)
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
