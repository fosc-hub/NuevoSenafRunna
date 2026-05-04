"use client"

/**
 * GAP-17: Derivación Interna PLTM
 *
 * Reasignar `responsables_secundarios` de una actividad sin crear una nueva
 * intervención formal. Solo disponible si la actividad tiene
 * `permite_derivacion_interna=true` y el usuario es JZ o Director.
 *
 * Endpoint: PATCH /api/actividades/{id}/responsables/
 */

import React, { useEffect, useState } from 'react'
import { Button, Box, Typography } from '@mui/material'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import BaseDialog from '@/components/shared/BaseDialog'
import { ResponsableSelect } from '../ResponsableSelect'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface DerivacionInternaDialogProps {
  actividad: TActividadPlanTrabajo
  canDerivar: boolean
  onReasignar: (responsablesSecundarios: number[]) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

export const DerivacionInternaDialog: React.FC<DerivacionInternaDialogProps> = ({
  actividad,
  canDerivar,
  onReasignar,
  loading,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false)
  const [responsables, setResponsables] = useState<number[]>(
    actividad.responsables_secundarios || []
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setResponsables(actividad.responsables_secundarios || [])
      setError(null)
    }
  }, [open, actividad.responsables_secundarios])

  if (!canDerivar) return null

  const handleSubmit = async () => {
    setError(null)
    const result = await onReasignar(responsables)
    if (result) {
      setOpen(false)
      onSuccess()
    } else {
      setError('No se pudo reasignar los responsables. Intentá nuevamente.')
    }
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="info"
        startIcon={<GroupAddIcon />}
        onClick={() => setOpen(true)}
      >
        Reasignar responsables
      </Button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Derivación interna"
        titleIcon={<GroupAddIcon color="info" />}
        maxWidth="sm"
        error={error}
        loading={loading}
        loadingMessage="Reasignando responsables..."
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setOpen(false),
            variant: 'text',
          },
          {
            label: loading ? 'Guardando...' : 'Guardar cambios',
            onClick: handleSubmit,
            variant: 'contained',
            color: 'primary',
            disabled: loading,
          },
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Reasigná responsables secundarios sin crear una nueva intervención.
            El responsable principal no cambia.
          </Typography>

          <ResponsableSelect
            label="Responsables secundarios"
            multiple
            value={responsables}
            onChange={(value) => setResponsables(value as number[])}
            disabled={loading}
          />
        </Box>
      </BaseDialog>
    </>
  )
}
