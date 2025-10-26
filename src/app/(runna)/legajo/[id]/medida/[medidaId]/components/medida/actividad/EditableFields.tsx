"use client"

import React, { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface EditableFieldsProps {
  actividad: TActividadPlanTrabajo
  canEdit: boolean
  onSave: (updatedFields: Partial<TActividadPlanTrabajo>) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

const PRIORIDAD_OPTIONS = [
  { value: 'BAJA', label: 'Baja', color: 'success' as const },
  { value: 'MEDIA', label: 'Media', color: 'info' as const },
  { value: 'ALTA', label: 'Alta', color: 'warning' as const },
  { value: 'URGENTE', label: 'Urgente', color: 'error' as const },
]

export const EditableFields: React.FC<EditableFieldsProps> = ({
  actividad,
  canEdit,
  onSave,
  loading,
  onSuccess
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [nombre, setNombre] = useState(actividad.nombre)
  const [descripcion, setDescripcion] = useState(actividad.descripcion || '')
  const [fechaLimite, setFechaLimite] = useState(
    actividad.fecha_limite ? new Date(actividad.fecha_limite).toISOString().split('T')[0] : ''
  )
  const [prioridad, setPrioridad] = useState(actividad.prioridad)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setNombre(actividad.nombre)
    setDescripcion(actividad.descripcion || '')
    setFechaLimite(
      actividad.fecha_limite ? new Date(actividad.fecha_limite).toISOString().split('T')[0] : ''
    )
    setPrioridad(actividad.prioridad)
    setError(null)
  }

  const handleSave = async () => {
    // Validation
    if (!nombre.trim()) {
      setError('El nombre de la actividad es obligatorio')
      return
    }

    if (nombre.trim().length < 5) {
      setError('El nombre debe tener al menos 5 caracteres')
      return
    }

    if (!fechaLimite) {
      setError('La fecha límite es obligatoria')
      return
    }

    setSubmitting(true)
    setError(null)

    // Build updated fields object
    const updatedFields: Partial<TActividadPlanTrabajo> = {}
    if (nombre !== actividad.nombre) updatedFields.nombre = nombre
    if (descripcion !== (actividad.descripcion || '')) updatedFields.descripcion = descripcion
    if (fechaLimite !== (actividad.fecha_limite ? new Date(actividad.fecha_limite).toISOString().split('T')[0] : '')) {
      updatedFields.fecha_limite = fechaLimite
    }
    if (prioridad !== actividad.prioridad) updatedFields.prioridad = prioridad

    // Check if any changes were made
    if (Object.keys(updatedFields).length === 0) {
      setError('No se realizaron cambios')
      setSubmitting(false)
      return
    }

    const result = await onSave(updatedFields)

    if (result) {
      setIsEditing(false)
      onSuccess()
    } else {
      setError('Error al guardar los cambios')
    }

    setSubmitting(false)
  }

  if (!canEdit) {
    // Read-only view for users without edit permission
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detalles de la Actividad
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Nombre:
            </Typography>
            <Typography variant="body1">{actividad.nombre}</Typography>
          </Box>
          {actividad.descripcion && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Descripción:
              </Typography>
              <Typography variant="body2">{actividad.descripcion}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha Límite:
            </Typography>
            <Typography variant="body2">
              {actividad.fecha_limite
                ? new Date(actividad.fecha_limite).toLocaleDateString('es-ES', { dateStyle: 'long' })
                : 'No especificada'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Prioridad:
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={PRIORIDAD_OPTIONS.find(p => p.value === actividad.prioridad)?.label || actividad.prioridad}
                color={PRIORIDAD_OPTIONS.find(p => p.value === actividad.prioridad)?.color || 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Detalles de la Actividad
        </Typography>
        {!isEditing && (
          <IconButton onClick={handleEdit} color="primary" disabled={loading}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Nombre Field */}
        <TextField
          fullWidth
          label="Nombre de la Actividad"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={!isEditing || submitting}
          required
          error={isEditing && nombre.trim().length > 0 && nombre.trim().length < 5}
          helperText={
            isEditing && nombre.trim().length > 0 && nombre.trim().length < 5
              ? `Mínimo 5 caracteres (actual: ${nombre.trim().length})`
              : ''
          }
          InputProps={{
            readOnly: !isEditing,
          }}
        />

        {/* Descripción Field */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={!isEditing || submitting}
          placeholder={isEditing ? 'Descripción detallada de la actividad' : ''}
          InputProps={{
            readOnly: !isEditing,
          }}
        />

        {/* Fecha Límite Field */}
        <TextField
          fullWidth
          type="date"
          label="Fecha Límite"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          disabled={!isEditing || submitting}
          required
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            readOnly: !isEditing,
          }}
        />

        {/* Prioridad Field */}
        {isEditing ? (
          <FormControl fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as any)}
              label="Prioridad"
              disabled={submitting}
            >
              {PRIORIDAD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={option.label}
                      color={option.color}
                      size="small"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Prioridad:
            </Typography>
            <Chip
              label={PRIORIDAD_OPTIONS.find(p => p.value === prioridad)?.label || prioridad}
              color={PRIORIDAD_OPTIONS.find(p => p.value === prioridad)?.color || 'default'}
              size="small"
            />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
