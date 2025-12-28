"use client"

import React, { useState, useEffect } from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box,
  Typography,
  Chip
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import BaseDialog from '@/components/shared/BaseDialog'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface TransferirDialogProps {
  actividad: TActividadPlanTrabajo
  canTransfer: boolean
  onTransferir: (equipoDestinoId: number, responsableNuevoId?: number, motivo?: string) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

// Mock data - Replace with actual API calls
const EQUIPOS_DISPONIBLES = [
  { id: 1, nombre: 'Equipo Técnico A' },
  { id: 2, nombre: 'Equipo Técnico B' },
  { id: 3, nombre: 'Equipo Legal' },
  { id: 4, nombre: 'Equipo Administrativo' },
]

const USUARIOS_DISPONIBLES = [
  { id: 1, nombre_completo: 'Juan Pérez' },
  { id: 2, nombre_completo: 'María González' },
  { id: 3, nombre_completo: 'Carlos Rodríguez' },
  { id: 4, nombre_completo: 'Ana Martínez' },
]

export const TransferirDialog: React.FC<TransferirDialogProps> = ({
  actividad,
  canTransfer,
  onTransferir,
  loading,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [equipoDestino, setEquipoDestino] = useState<number | ''>('')
  const [responsableNuevo, setResponsableNuevo] = useState<number | ''>('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!canTransfer) {
    return null
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setEquipoDestino('')
    setResponsableNuevo('')
    setMotivo('')
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEquipoDestino('')
    setResponsableNuevo('')
    setMotivo('')
    setError(null)
  }

  const handleSubmit = async () => {
    // Validation
    if (!equipoDestino) {
      setError('Debe seleccionar un equipo destino')
      return
    }

    if (!motivo.trim()) {
      setError('El motivo de la transferencia es obligatorio')
      return
    }

    if (motivo.trim().length < 15) {
      setError('El motivo debe tener al menos 15 caracteres')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await onTransferir(
      equipoDestino as number,
      responsableNuevo ? (responsableNuevo as number) : undefined,
      motivo
    )

    if (result) {
      handleCloseDialog()
      onSuccess()
    } else {
      setError('Error al transferir la actividad')
    }

    setSubmitting(false)
  }

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<SwapHorizIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        Transferir Actividad
      </Button>

      <BaseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        title="Transferir Actividad a Otro Equipo"
        titleIcon={<SwapHorizIcon />}
        info="Esta operación transferirá la actividad a otro equipo. El equipo destino asumirá la responsabilidad de su ejecución."
        error={error}
        actions={[
          {
            label: "Cancelar",
            onClick: handleCloseDialog,
            variant: "text",
            disabled: submitting
          },
          {
            label: submitting ? 'Transfiriendo...' : 'Confirmar Transferencia',
            onClick: handleSubmit,
            variant: "contained",
            color: "warning",
            disabled: submitting || !equipoDestino || !motivo.trim(),
            startIcon: <SwapHorizIcon />,
            loading: submitting
          }
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Current Team Display */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Equipo Actual:
            </Typography>
            <Chip
              label={actividad.equipo_responsable_display || 'Sin equipo asignado'}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Destination Team Selection */}
          <FormControl fullWidth required>
            <InputLabel>Equipo Destino</InputLabel>
            <Select
              value={equipoDestino}
              onChange={(e) => setEquipoDestino(e.target.value as number)}
              label="Equipo Destino"
            >
              {EQUIPOS_DISPONIBLES.map((equipo) => (
                <MenuItem key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Optional New Responsable Selection */}
          <FormControl fullWidth>
            <InputLabel>Nuevo Responsable (Opcional)</InputLabel>
            <Select
              value={responsableNuevo}
              onChange={(e) => setResponsableNuevo(e.target.value as number)}
              label="Nuevo Responsable (Opcional)"
            >
              <MenuItem value="">
                <em>Sin cambio - mantener responsable actual</em>
              </MenuItem>
              {USUARIOS_DISPONIBLES.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Motivo Input (required, min 15 chars) */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo de la Transferencia (Obligatorio)"
            placeholder="Indique el motivo de la transferencia (mínimo 15 caracteres)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            error={motivo.length > 0 && motivo.trim().length < 15}
            helperText={
              motivo.length > 0 && motivo.trim().length < 15
                ? `Mínimo 15 caracteres (actual: ${motivo.trim().length})`
                : 'Explique claramente el motivo de la transferencia'
            }
          />

          {/* Warnings */}
          {equipoDestino && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Atención:</strong> Al confirmar, esta actividad será transferida al equipo seleccionado y se creará un registro en el historial de transferencias.
              </Typography>
            </Alert>
          )}
        </Box>
      </BaseDialog>
    </>
  )
}
