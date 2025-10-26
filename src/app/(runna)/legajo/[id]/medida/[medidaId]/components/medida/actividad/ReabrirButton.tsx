"use client"

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip
} from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface ReabrirButtonProps {
  actividad: TActividadPlanTrabajo
  canReopen: boolean
  onReabrir: (motivo: string, nuevoEstado?: string) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

const LOCKED_STATES = ['COMPLETADA', 'CANCELADA', 'VISADO_APROBADO']

export const ReabrirButton: React.FC<ReabrirButtonProps> = ({
  actividad,
  canReopen,
  onReabrir,
  loading,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isLocked = LOCKED_STATES.includes(actividad.estado)

  if (!canReopen || !isLocked) {
    return null
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setMotivo('')
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setMotivo('')
    setError(null)
  }

  const handleSubmit = async () => {
    // Validation
    if (!motivo.trim()) {
      setError('El motivo de la reapertura es obligatorio')
      return
    }

    if (motivo.trim().length < 15) {
      setError('El motivo debe tener al menos 15 caracteres')
      return
    }

    setSubmitting(true)
    setError(null)

    // Determine target state based on current state
    let nuevoEstado: string | undefined
    if (actividad.estado === 'CANCELADA') {
      nuevoEstado = 'PENDIENTE'
    } else if (actividad.estado === 'COMPLETADA' || actividad.estado === 'VISADO_APROBADO') {
      nuevoEstado = 'EN_PROGRESO'
    }

    const result = await onReabrir(motivo, nuevoEstado)

    if (result) {
      handleCloseDialog()
      onSuccess()
    } else {
      setError('Error al reabrir la actividad')
    }

    setSubmitting(false)
  }

  const getTargetState = (): string => {
    if (actividad.estado === 'CANCELADA') return 'PENDIENTE'
    if (actividad.estado === 'COMPLETADA' || actividad.estado === 'VISADO_APROBADO') return 'EN_PROGRESO'
    return 'PENDIENTE'
  }

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<RestoreIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        Reabrir Actividad
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reabrir Actividad Cerrada</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Information Alert */}
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Atención:</strong> Esta operación reabrirá una actividad previamente cerrada. Esta acción quedará registrada en el historial de auditoría.
              </Typography>
            </Alert>

            {/* Current and Target State Display */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado Actual:
              </Typography>
              <Chip
                label={actividad.estado_display || actividad.estado}
                color="error"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                →
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado Destino:
              </Typography>
              <Chip
                label={getTargetState()}
                color="warning"
              />
            </Box>

            {/* Motivo Input (required, min 15 chars) */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo de la Reapertura (Obligatorio)"
              placeholder="Indique el motivo por el cual se reabre esta actividad (mínimo 15 caracteres)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              error={motivo.length > 0 && motivo.trim().length < 15}
              helperText={
                motivo.length > 0 && motivo.trim().length < 15
                  ? `Mínimo 15 caracteres (actual: ${motivo.trim().length})`
                  : 'Explique claramente el motivo de la reapertura'
              }
            />

            {/* Impact Warning */}
            <Alert severity="info">
              <Typography variant="body2">
                Al reabrir esta actividad:
              </Typography>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>
                  <Typography variant="caption">
                    Se creará un registro de reapertura en el historial
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    El equipo responsable será notificado
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    La actividad volverá a estado &quot;{getTargetState()}&quot;
                  </Typography>
                </li>
                {actividad.estado === 'VISADO_APROBADO' && (
                  <li>
                    <Typography variant="caption" color="warning.main">
                      Se invalidará el visado legal aprobado previamente
                    </Typography>
                  </li>
                )}
              </ul>
            </Alert>

            {/* Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="warning"
            disabled={submitting || !motivo.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : <RestoreIcon />}
          >
            {submitting ? 'Reabriendo...' : 'Confirmar Reapertura'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
