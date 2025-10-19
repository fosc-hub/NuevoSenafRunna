"use client"

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  IconButton,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import { TipoActividadSelect } from './TipoActividadSelect'
import { ResponsableSelect } from './ResponsableSelect'
import { actividadService } from '../../services/actividadService'
import type { TActividadPlanTrabajo, UpdateActividadRequest } from '../../types/actividades'

const editActividadSchema = z.object({
  tipo_actividad: z.number().min(1, 'El tipo de actividad es requerido'),
  subactividad: z.string().min(1, 'La subactividad es requerida'),
  fecha_planificacion: z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
  descripcion: z.string().optional(),
  responsable_principal: z.number().min(1, 'El responsable principal es requerido'),
  responsables_secundarios: z.array(z.number()).optional(),
  referentes_externos: z.string().optional()
})

type EditActividadFormData = z.infer<typeof editActividadSchema>

interface EditActividadModalProps {
  open: boolean
  onClose: () => void
  actividad: TActividadPlanTrabajo
  onSuccess?: () => void
}

export const EditActividadModal: React.FC<EditActividadModalProps> = ({
  open,
  onClose,
  actividad,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditActividadFormData>({
    resolver: zodResolver(editActividadSchema),
    defaultValues: {
      tipo_actividad: actividad.tipo_actividad,
      subactividad: actividad.subactividad,
      fecha_planificacion: new Date(actividad.fecha_planificacion),
      descripcion: actividad.descripcion || '',
      responsable_principal: actividad.responsable_principal,
      responsables_secundarios: actividad.responsables_secundarios || [],
      referentes_externos: actividad.referentes_externos || ''
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        tipo_actividad: actividad.tipo_actividad,
        subactividad: actividad.subactividad,
        fecha_planificacion: new Date(actividad.fecha_planificacion),
        descripcion: actividad.descripcion || '',
        responsable_principal: actividad.responsable_principal,
        responsables_secundarios: actividad.responsables_secundarios || [],
        referentes_externos: actividad.referentes_externos || ''
      })
    }
  }, [open, actividad, reset])

  const onSubmit = async (data: EditActividadFormData) => {
    setLoading(true)
    setError(null)

    try {
      const updateData: UpdateActividadRequest = {
        tipo_actividad: data.tipo_actividad,
        subactividad: data.subactividad,
        fecha_planificacion: data.fecha_planificacion.toISOString().split('T')[0],
        descripcion: data.descripcion,
        responsable_principal: data.responsable_principal,
        responsables_secundarios: data.responsables_secundarios,
        referentes_externos: data.referentes_externos
      }

      await actividadService.update(actividad.id, updateData)
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Error updating activity:', err)
      setError(err.response?.data?.detail || 'Error al actualizar la actividad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '95vh' } }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '1.5rem',
        position: 'relative',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        Editar Actividad
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, overflow: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Controller
            name="tipo_actividad"
            control={control}
            render={({ field }) => (
              <TipoActividadSelect
                value={field.value}
                onChange={field.onChange}
                actor={actividad.actor}
                error={!!errors.tipo_actividad}
                helperText={errors.tipo_actividad?.message}
              />
            )}
          />

          <Controller
            name="subactividad"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Subactividad (detalle específico)"
                multiline
                rows={2}
                error={!!errors.subactividad}
                helperText={errors.subactividad?.message}
              />
            )}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Controller
              name="fecha_planificacion"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha de planificación"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.fecha_planificacion,
                      helperText: errors.fecha_planificacion?.message
                    }
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción (opcional)"
                multiline
                rows={4}
                error={!!errors.descripcion}
                helperText={errors.descripcion?.message}
              />
            )}
          />

          <Controller
            name="responsable_principal"
            control={control}
            render={({ field }) => (
              <ResponsableSelect
                label="Responsable Principal"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.responsable_principal}
                helperText={errors.responsable_principal?.message}
              />
            )}
          />

          <Controller
            name="responsables_secundarios"
            control={control}
            render={({ field }) => (
              <ResponsableSelect
                label="Responsables Secundarios (opcional)"
                value={field.value || []}
                onChange={field.onChange}
                multiple
              />
            )}
          />

          <Controller
            name="referentes_externos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Referentes Externos (opcional)"
                multiline
                rows={2}
                helperText="Ej: Institución, persona, teléfono"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading} fullWidth>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
