"use client"

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Box
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { toast } from 'react-toastify'

interface VisarButtonProps {
  actividadId: number
  canVisar: boolean
  onVisar: (aprobado: boolean, observaciones?: string) => Promise<any>
  loading: boolean
  onSuccess?: () => void
}

export const VisarButton: React.FC<VisarButtonProps> = ({
  actividadId,
  canVisar,
  onVisar,
  loading,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aprobado, setAprobado] = useState<'true' | 'false'>('true')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!canVisar) {
    return null
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setAprobado('true')
    setObservaciones('')
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setAprobado('true')
    setObservaciones('')
    setError(null)
  }

  const handleSubmit = async () => {
    const aprobadoBool = aprobado === 'true'

    // Validate observaciones required if rejected
    if (!aprobadoBool && !observaciones.trim()) {
      setError('Las observaciones son obligatorias al rechazar el visado')
      return
    }

    if (!aprobadoBool && observaciones.trim().length < 10) {
      setError('Las observaciones deben tener al menos 10 caracteres')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await onVisar(aprobadoBool, observaciones || undefined)

      if (result) {
        // Show success toast
        const mensajeExito = aprobadoBool
          ? '✅ Visado aprobado exitosamente. La actividad ha sido completada.'
          : '⚠️ Visado rechazado. La actividad vuelve a estado "En Progreso" para correcciones.'

        toast.success(mensajeExito, {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        // Close dialog
        handleCloseDialog()

        // Call success callback to close modal and refresh
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError('Error al procesar el visado')
      }
    } catch (error: any) {
      console.error('Error al visar actividad:', error)
      setError(error?.message || 'Error al procesar el visado')
      toast.error('Error al procesar el visado', {
        position: 'top-center',
        autoClose: 4000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<CheckCircleIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        Visar Actividad
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Visado Legal de Actividad</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Como miembro del equipo legal, debe revisar y aprobar o rechazar esta actividad.
            </Alert>

            {/* Approval/Rejection Selection */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Decisión de Visado</FormLabel>
              <RadioGroup
                value={aprobado}
                onChange={(e) => setAprobado(e.target.value as 'true' | 'false')}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Aprobar - La actividad cumple con los requisitos legales"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Rechazar con Observaciones - Requiere correcciones"
                />
              </RadioGroup>
            </FormControl>

            {/* Observaciones (required if rejected) */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label={aprobado === 'false' ? 'Observaciones (Obligatorio)' : 'Observaciones (Opcional)'}
              placeholder={
                aprobado === 'false'
                  ? 'Indique los motivos del rechazo y las correcciones necesarias (mínimo 10 caracteres)'
                  : 'Agregue comentarios adicionales si lo desea'
              }
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              required={aprobado === 'false'}
              error={aprobado === 'false' && observaciones.trim().length < 10 && observaciones.length > 0}
              helperText={
                aprobado === 'false' && observaciones.trim().length < 10 && observaciones.length > 0
                  ? `Mínimo 10 caracteres (actual: ${observaciones.trim().length})`
                  : aprobado === 'false'
                  ? 'Obligatorio al rechazar el visado'
                  : 'Opcional'
              }
            />

            {/* Result Information */}
            {aprobado === 'true' ? (
              <Alert severity="success">
                Al aprobar, la actividad pasará a estado &quot;Visado Aprobado&quot; y quedará completada.
              </Alert>
            ) : (
              <Alert severity="warning">
                Al rechazar, la actividad volverá a estado &quot;En Progreso&quot; para que el equipo técnico realice las correcciones necesarias.
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
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={aprobado === 'true' ? 'success' : 'warning'}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={20} />
              ) : aprobado === 'true' ? (
                <CheckCircleIcon />
              ) : (
                <CancelIcon />
              )
            }
          >
            {submitting
              ? 'Procesando...'
              : aprobado === 'true'
              ? 'Aprobar Visado'
              : 'Rechazar con Observaciones'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
