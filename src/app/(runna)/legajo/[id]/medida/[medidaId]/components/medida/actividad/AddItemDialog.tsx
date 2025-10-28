"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AttachmentUpload } from '../AttachmentUpload'

interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  onAddComentario: (texto: string) => Promise<void>
  onAddAdjunto: (files: File[], tipos: string[], descripciones: string[]) => Promise<void>
  onAddBoth: (texto: string, files: File[], tipos: string[], descripciones: string[]) => Promise<void>
}

type Mode = 'menu' | 'comentario' | 'adjunto' | 'both'

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onAddComentario,
  onAddAdjunto,
  onAddBoth
}) => {
  const [mode, setMode] = useState<Mode>('menu')
  const [comentarioTexto, setComentarioTexto] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [tipos, setTipos] = useState<string[]>([])
  const [descripciones, setDescripciones] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setMode('menu')
    setComentarioTexto('')
    setFiles([])
    setTipos([])
    setDescripciones([])
    setError(null)
    onClose()
  }

  const handleBack = () => {
    setMode('menu')
    setError(null)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      if (mode === 'comentario') {
        if (!comentarioTexto.trim()) {
          setError('El comentario no puede estar vacío')
          setSubmitting(false)
          return
        }
        await onAddComentario(comentarioTexto)
      } else if (mode === 'adjunto') {
        if (files.length === 0) {
          setError('Debes seleccionar al menos un archivo')
          setSubmitting(false)
          return
        }
        await onAddAdjunto(files, tipos, descripciones)
      } else if (mode === 'both') {
        if (!comentarioTexto.trim() && files.length === 0) {
          setError('Debes agregar un comentario y/o archivos')
          setSubmitting(false)
          return
        }
        await onAddBoth(comentarioTexto, files, tipos, descripciones)
      }

      handleClose()
    } catch (err: any) {
      setError(err.message || 'Error al agregar el item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (newFiles: File[], newTipos?: string[], newDescripciones?: string[]) => {
    setFiles(newFiles)
    if (newTipos) setTipos(newTipos)
    if (newDescripciones) setDescripciones(newDescripciones)
  }

  const getDialogTitle = () => {
    switch (mode) {
      case 'comentario':
        return 'Agregar Comentario'
      case 'adjunto':
        return 'Subir Archivo'
      case 'both':
        return 'Agregar Comentario y Archivo'
      default:
        return 'Agregar a la Actividad'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: mode === 'menu' ? 'auto' : '500px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode !== 'menu' && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Volver
            </Button>
          )}
          {getDialogTitle()}
        </Box>
      </DialogTitle>

      <DialogContent>
        {mode === 'menu' && (
          <List sx={{ pt: 0 }}>
            <ListItemButton
              onClick={() => setMode('comentario')}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
            >
              <ListItemIcon>
                <ChatBubbleOutlineIcon color="primary" sx={{ fontSize: 32 }} />
              </ListItemIcon>
              <ListItemText
                primary="Agregar Comentario"
                secondary="Escribe un comentario para esta actividad. Puedes mencionar usuarios con @usuario."
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => setMode('adjunto')}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                '&:hover': {
                  borderColor: 'info.main',
                  bgcolor: 'info.50'
                }
              }}
            >
              <ListItemIcon>
                <AttachFileIcon color="info" sx={{ fontSize: 32 }} />
              </ListItemIcon>
              <ListItemText
                primary="Subir Archivo"
                secondary="Adjunta evidencias, actas, informes, fotos u otros documentos relacionados."
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => setMode('both')}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'success.main',
                  bgcolor: 'success.50'
                }
              }}
            >
              <ListItemIcon>
                <AddCircleOutlineIcon color="success" sx={{ fontSize: 32 }} />
              </ListItemIcon>
              <ListItemText
                primary="Agregar Ambos"
                secondary="Escribe un comentario y adjunta archivos en una sola acción."
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </List>
        )}

        {(mode === 'comentario' || mode === 'both') && (
          <Box sx={{ mb: mode === 'both' ? 3 : 0 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Comentario {mode === 'both' && '(opcional)'}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Usa @usuario para mencionar a otros usuarios. Serán notificados automáticamente.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={mode === 'both' ? 4 : 6}
              placeholder="Escribe tu comentario aquí... (Ctrl+Enter para enviar)"
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit()
                }
              }}
              disabled={submitting}
              sx={{ mt: 1 }}
            />
          </Box>
        )}

        {mode === 'both' && <Divider sx={{ my: 2 }} />}

        {(mode === 'adjunto' || mode === 'both') && (
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Archivos {mode === 'both' && '(opcional)'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Formatos permitidos: PDF, JPG, PNG, DOCX. Tamaño máximo: 10MB por archivo.
            </Typography>
            <AttachmentUpload
              files={files}
              onChange={handleFileChange}
              requiereEvidencia={false}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        {mode !== 'menu' && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
