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
import GavelIcon from '@mui/icons-material/Gavel'
import { toast } from 'react-toastify'

interface VisarJzButtonProps {
  actividadId: number
  canVisarJZ: boolean
  onVisarJZ: (aprobado: boolean, observaciones?: string) => Promise<any>
  loading: boolean
  onSuccess?: () => void
}

export const VisarJzButton: React.FC<VisarJzButtonProps> = ({
  actividadId,
  canVisarJZ,
  onVisarJZ,
  loading,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aprobado, setAprobado] = useState<'true' | 'false'>('true')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!canVisarJZ) {
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

    setSubmitting(true)
    setError(null)

    try {
      const result = await onVisarJZ(aprobadoBool, observaciones || undefined)

      if (result) {
        const mensajeExito = aprobadoBool
          ? '✅ Visado JZ aprobado. La actividad pasa a revisión del equipo Legal.'
          : '⚠️ Visado JZ rechazado. La actividad vuelve a estado "En Progreso" para correcciones.'

        toast.success(mensajeExito, {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        handleCloseDialog()

        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError('Error al procesar el visado JZ')
      }
    } catch (error: any) {
      console.error('Error al Aprobar JZ actividad:', error)
      setError(error?.message || 'Error al procesar el visado JZ')
      toast.error('Error al procesar el visado JZ', {
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
        color="warning"
        startIcon={<GavelIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        Aprobar JZ
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Visado Jefe Zonal (JZ)</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Como Jefe Zonal, debe revisar esta actividad antes de que pase al equipo Legal para su visado final.
            </Alert>

            <FormControl component="fieldset">
              <FormLabel component="legend">Decisión de Visado JZ</FormLabel>
              <RadioGroup
                value={aprobado}
                onChange={(e) => setAprobado(e.target.value as 'true' | 'false')}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Aprobar - Enviar a revisión Legal"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Rechazar - Requiere correcciones del equipo técnico"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={aprobado === 'false' ? 'Observaciones (Recomendado)' : 'Observaciones (Opcional)'}
              placeholder={
                aprobado === 'false'
                  ? 'Indique los motivos del rechazo y las correcciones necesarias'
                  : 'Agregue comentarios adicionales si lo desea'
              }
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />

            {aprobado === 'true' ? (
              <Alert severity="success">
                Al aprobar, la actividad pasará a estado &quot;Pendiente de Visado Legal&quot; para la revisión final del equipo Legal.
              </Alert>
            ) : (
              <Alert severity="warning">
                Al rechazar, la actividad volverá a estado &quot;En Progreso&quot; para que el equipo técnico realice las correcciones necesarias.
              </Alert>
            )}

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
              ? 'Aprobar y Enviar a Legal'
              : 'Rechazar Visado JZ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
