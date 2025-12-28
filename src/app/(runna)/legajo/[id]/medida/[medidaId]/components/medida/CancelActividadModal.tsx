"use client"

import React, { useState } from 'react'
import { TextField, Typography, Box } from '@mui/material'
import BaseDialog from '@/components/shared/BaseDialog'
import { actividadService } from '../../services/actividadService'

interface CancelActividadModalProps {
  open: boolean
  onClose: () => void
  actividadId: number
  actividadNombre: string
  onSuccess?: () => void
}

/**
 * Modal for canceling an activity
 *
 * REFACTORED: Now uses BaseDialog shared component
 * Previous implementation: ~130 lines
 * Current implementation: ~60 lines
 * Savings: ~70 lines of duplicate dialog boilerplate
 */
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
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Cancelar Actividad"
      centerTitle
      error={error}
      loading={loading}
      loadingMessage="Cancelando actividad..."
      warning="Esta acción no se puede deshacer. La actividad quedará marcada como CANCELADA."
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "outlined",
          disabled: loading,
        },
        {
          label: "Confirmar Cancelación",
          onClick: handleCancel,
          variant: "contained",
          color: "error",
          disabled: loading || !motivo.trim(),
          loading: loading,
        },
      ]}
    >
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
    </BaseDialog>
  )
}
