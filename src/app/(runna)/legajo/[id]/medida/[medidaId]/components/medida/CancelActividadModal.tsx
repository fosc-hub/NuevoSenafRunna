"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { actividadService } from '../../services/actividadService'

interface CancelActividadModalProps {
  open: boolean
  onClose: () => void
  actividadId: number
  actividadNombre: string
  onSuccess?: () => void
}

export const CancelActividadModal: React.FC<CancelActividadModalProps> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  onSuccess
}) => {
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (!motivo.trim()) {
      setError('El motivo de cancelación es requerido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await actividadService.cancel(actividadId, motivo)
      onSuccess?.()
      handleClose()
    } catch (err: any) {
      console.error('Error canceling activity:', err)
      setError(err.response?.data?.detail || 'Error al cancelar la actividad')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMotivo('')
    setError(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '1.25rem',
        position: 'relative',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        Cancelar Actividad
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Actividad:
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {actividadNombre}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Motivo de Cancelación"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Explique las razones por las cuales se cancela esta actividad..."
          error={!!error && !motivo.trim()}
          helperText="Campo requerido"
          required
        />

        <Alert severity="warning" sx={{ mt: 2 }}>
          Esta acción no se puede deshacer. La actividad quedará marcada como CANCELADA.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          fullWidth
        >
          Volver
        </Button>
        <Button
          onClick={handleCancel}
          variant="contained"
          color="error"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
