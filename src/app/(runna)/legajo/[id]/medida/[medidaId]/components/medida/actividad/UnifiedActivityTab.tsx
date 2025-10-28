"use client"

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Fab,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import { TimelineItem } from './TimelineItem'
import { AddItemDialog } from './AddItemDialog'
import { useUnifiedActivity } from '../../../hooks/useUnifiedActivity'

interface UnifiedActivityTabProps {
  actividadId: number
  canEdit: boolean
  onSuccess?: () => void
}

export const UnifiedActivityTab: React.FC<UnifiedActivityTabProps> = ({
  actividadId,
  canEdit,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'comentarios' | 'adjuntos'>('all')

  const {
    items,
    loading,
    error,
    loadItems,
    addComentario,
    addAdjunto,
    addBoth,
    filteredItems
  } = useUnifiedActivity(actividadId)

  const handleSuccess = async () => {
    await loadItems()
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleAddComentario = async (texto: string) => {
    await addComentario(texto)
    await handleSuccess()
  }

  const handleAddAdjunto = async (files: File[], tipos: string[], descripciones: string[]) => {
    await addAdjunto(files, tipos, descripciones)
    await handleSuccess()
  }

  const handleAddBoth = async (
    texto: string,
    files: File[],
    tipos: string[],
    descripciones: string[]
  ) => {
    await addBoth(texto, files, tipos, descripciones)
    await handleSuccess()
  }

  const displayedItems = filteredItems(filter)
  const comentariosCount = items.filter(item => item.type === 'COMENTARIO').length
  const adjuntosCount = items.filter(item => item.type === 'ADJUNTO').length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header with filter and statistics */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" fontWeight={600}>
              Actividad de la Tarea
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${items.length} total`}
                size="small"
                color="default"
                variant="outlined"
              />
              <Chip
                label={`${comentariosCount} comentarios`}
                size="small"
                color="primary"
                variant={filter === 'comentarios' ? 'filled' : 'outlined'}
              />
              <Chip
                label={`${adjuntosCount} archivos`}
                size="small"
                color="info"
                variant={filter === 'adjuntos' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="filter-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon fontSize="small" />
                Filtrar
              </Box>
            </InputLabel>
            <Select
              labelId="filter-label"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              label="Filtrar"
            >
              <MenuItem value="all">Mostrar todo</MenuItem>
              <MenuItem value="comentarios">Solo comentarios</MenuItem>
              <MenuItem value="adjuntos">Solo archivos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Timeline */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : displayedItems.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'grey.50',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {filter === 'all' && 'No hay actividad registrada aún'}
              {filter === 'comentarios' && 'No hay comentarios aún'}
              {filter === 'adjuntos' && 'No hay archivos adjuntos aún'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filter === 'all' && '¡Comienza agregando un comentario o subiendo un archivo!'}
              {filter === 'comentarios' && '¡Sé el primero en comentar!'}
              {filter === 'adjuntos' && 'Sube evidencias, actas o documentos relacionados.'}
            </Typography>
            {canEdit && (
              <Tooltip title="Agregar comentario o archivo">
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={() => setDialogOpen(true)}
                  size="medium"
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            )}
          </Paper>
        ) : (
          <Box sx={{ pb: 10 }}>
            {displayedItems.map(item => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      {canEdit && displayedItems.length > 0 && (
        <Tooltip title="Agregar comentario o archivo">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setDialogOpen(true)}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              boxShadow: 4,
              '&:hover': {
                boxShadow: 8
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Add Item Dialog */}
      <AddItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAddComentario={handleAddComentario}
        onAddAdjunto={handleAddAdjunto}
        onAddBoth={handleAddBoth}
      />
    </Box>
  )
}
