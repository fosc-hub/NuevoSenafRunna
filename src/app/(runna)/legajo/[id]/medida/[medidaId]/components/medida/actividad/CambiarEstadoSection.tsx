"use client"

import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Typography
} from '@mui/material'
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

// Valid state transitions based on PLTM-02 specification
// Note: PENDIENTE_VISADO_JZ is auto-transitioned by backend when completing activity with requiere_visado_legales=true
// Note: PENDIENTE_VISADO_JZ → PENDIENTE_VISADO should ONLY be done via /visar-jz/ endpoint (VisarJzButton component)
// Note: PENDIENTE_VISADO → VISADO_APROBADO/VISADO_CON_OBSERVACION should ONLY be done via /visar/ endpoint (VisarButton component)
const TRANSICIONES_PERMITIDAS: Record<string, string[]> = {
  'PENDIENTE': ['EN_PROGRESO', 'CANCELADA'],
  'EN_PROGRESO': ['COMPLETADA', 'CANCELADA', 'PENDIENTE'],
  // COMPLETADA state removed - backend auto-transitions to PENDIENTE_VISADO_JZ if needed
  // PENDIENTE_VISADO_JZ transitions removed - use VisarJzButton component with /visar-jz/ endpoint
  // PENDIENTE_VISADO transitions removed - use VisarButton component with /visar/ endpoint
  'VISADO_CON_OBSERVACION': ['EN_PROGRESO'], // Can reopen after legal rejection
  'VENCIDA': ['EN_PROGRESO', 'CANCELADA'],
}

const ESTADO_LABELS: Record<string, string> = {
  'PENDIENTE': 'Pendiente',
  'EN_PROGRESO': 'En Progreso',
  'COMPLETADA': 'Completada',
  'PENDIENTE_VISADO_JZ': 'Pendiente Visado JZ',
  'PENDIENTE_VISADO': 'Pendiente Visado Legal',
  'VISADO_CON_OBSERVACION': 'Visado con Observación',
  'VISADO_APROBADO': 'Visado Aprobado',
  'CANCELADA': 'Cancelada',
  'VENCIDA': 'Vencida',
}

interface CambiarEstadoSectionProps {
  actividad: TActividadPlanTrabajo
  canEdit: boolean
  onSuccess: () => void
  onCambiarEstado: (nuevoEstado: string, motivo?: string) => Promise<any>
  loading: boolean
}

export const CambiarEstadoSection: React.FC<CambiarEstadoSectionProps> = ({
  actividad,
  canEdit,
  onSuccess,
  onCambiarEstado,
  loading
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const estadoActual = actividad.estado
  const transicionesPermitidas = TRANSICIONES_PERMITIDAS[estadoActual] || []

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setNuevoEstado('')
    setMotivo('')
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setNuevoEstado('')
    setMotivo('')
    setError(null)
  }

  const handleSubmit = async () => {
    // Validate
    if (!nuevoEstado) {
      setError('Debe seleccionar un estado')
      return
    }

    // Validate motivo required for CANCELADA
    if (nuevoEstado === 'CANCELADA' && !motivo.trim()) {
      setError('El motivo es obligatorio para cancelar una actividad')
      return
    }

    // Validate motivo minimum length
    if (nuevoEstado === 'CANCELADA' && motivo.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres')
      return
    }

    // Call API
    const result = await onCambiarEstado(nuevoEstado, motivo || undefined)

    if (result) {
      handleCloseDialog()
      onSuccess()
    } else {
      setError('Error al cambiar el estado. Verifique los requisitos (ej: evidencia obligatoria)')
    }
  }

  if (!canEdit || transicionesPermitidas.length === 0) {
    return null
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ChangeCircleIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        Cambiar Estado
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Estado de Actividad</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Current State */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado Actual:
              </Typography>
              <Chip
                label={ESTADO_LABELS[estadoActual] || estadoActual}
                color="info"
              />
            </Box>

            {/* New State Selection */}
            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                label="Nuevo Estado"
              >
                {transicionesPermitidas.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {ESTADO_LABELS[estado] || estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Motivo Input (required for CANCELADA) */}
            {nuevoEstado === 'CANCELADA' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Motivo de Cancelación"
                placeholder="Ingrese el motivo de cancelación (mínimo 10 caracteres)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                error={nuevoEstado === 'CANCELADA' && motivo.trim().length < 10 && motivo.length > 0}
                helperText={
                  nuevoEstado === 'CANCELADA' && motivo.trim().length < 10 && motivo.length > 0
                    ? `Mínimo 10 caracteres (actual: ${motivo.trim().length})`
                    : 'Obligatorio para cancelar la actividad'
                }
              />
            )}

            {/* Warnings */}
            {nuevoEstado === 'COMPLETADA' && actividad.requiere_visado_legales && (
              <Alert severity="info">
                Esta actividad requiere visado. Al completarla, pasará a &quot;Pendiente Visado JZ&quot; para revisión del Jefe Zonal, y luego al equipo Legal para visado final.
              </Alert>
            )}

            {nuevoEstado === 'COMPLETADA' && (actividad.origen === 'DEMANDA_PI' || actividad.origen === 'DEMANDA_OFICIO') && (
              <Alert severity="warning">
                Actividades de PI/Oficio requieren al menos un adjunto (evidencia) para completarse.
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !nuevoEstado}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Cambiando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
