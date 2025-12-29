"use client"

import React, { useState } from 'react'
import { TextField, Typography, Box } from '@mui/material'
import BaseDialog from '@/components/shared/BaseDialog'
import { actividadService } from '../../services/actividadService'
import { useFormSubmission } from '@/hooks'

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
 * REFACTORED: Uses BaseDialog + useFormSubmission hooks
 * Previous implementation: ~130 lines → ~60 lines → ~45 lines
 * Cumulative savings: ~85 lines of duplicate boilerplate
 */
export const CancelActividadModal: React.FC<CancelActividadModalProps> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  onSuccess
}) => {
  const [motivo, setMotivo] = useState('')

  const { submit, isLoading, error, close } = useFormSubmission({
    onSubmit: async () => {
      await actividadService.cancel(actividadId, motivo)
    },
    validate: () => !motivo.trim() ? 'El motivo de cancelación es requerido' : undefined,
    showSuccessToast: false,
    showErrorToast: false, // BaseDialog handles error display
    onSuccess: () => onSuccess?.(),
    onReset: () => setMotivo(''),
    onClose,
  })

  const handleCancel = () => submit({})

  const handleClose = () => close()

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Cancelar Actividad"
      centerTitle
      error={error}
      loading={isLoading}
      loadingMessage="Cancelando actividad..."
      warning="Esta acción no se puede deshacer. La actividad quedará marcada como CANCELADA."
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "outlined",
          disabled: isLoading,
        },
        {
          label: "Confirmar Cancelación",
          onClick: handleCancel,
          variant: "contained",
          color: "error",
          disabled: isLoading || !motivo.trim(),
          loading: isLoading,
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
