"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import { TipoActividadSelect } from './TipoActividadSelect'
import { ResponsableSelect } from './ResponsableSelect'
import { AttachmentUpload } from './AttachmentUpload'
import { actividadService } from '../../services/actividadService'
import type { CreateActividadRequest } from '../../types/actividades'

const actividadSchema = z.object({
  tipo_actividad: z.number().min(1, 'El tipo de actividad es requerido'),
  subactividad: z.string().min(1, 'La subactividad es requerida'),
  fecha_planificacion: z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
  descripcion: z.string().optional(),
  responsable_principal: z.number().min(1, 'El responsable principal es requerido'),
  responsables_secundarios: z.array(z.number()).optional(),
  referentes_externos: z.string().optional(),
  es_borrador: z.boolean().optional(),
  adjuntos_archivos: z.array(z.instanceof(File)).optional(),
  adjuntos_tipos: z.array(z.string()).optional(),
  adjuntos_descripciones: z.array(z.string()).optional()
})

type ActividadFormData = z.infer<typeof actividadSchema>

interface ActorTabContentProps {
  actor: string
  planTrabajoId: number
  formData: Partial<CreateActividadRequest>
  onChange: (updates: Partial<CreateActividadRequest>) => void
  onClose: () => void
  onSuccess?: () => void
}

export const ActorTabContent: React.FC<ActorTabContentProps> = ({
  actor,
  planTrabajoId,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ActividadFormData>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      tipo_actividad: 0,
      subactividad: '',
      fecha_planificacion: new Date(),
      descripcion: '',
      responsable_principal: 0,
      responsables_secundarios: [],
      referentes_externos: '',
      es_borrador: false
    }
  })

  const selectedTipo = watch('tipo_actividad')

  const onSubmit = async (data: ActividadFormData) => {
    setLoading(true)
    setError(null)

    try {
      await actividadService.create({
        ...data,
        plan_trabajo: planTrabajoId,
        origen: 'MANUAL',
        fecha_planificacion: data.fecha_planificacion.toISOString().split('T')[0]
      })

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Error creating activity:', err)
      setError(err.response?.data?.detail || 'Error al crear la actividad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
          Tipo de actividad
        </Typography>
        <Controller
          name="tipo_actividad"
          control={control}
          render={({ field }) => (
            <TipoActividadSelect
              value={field.value}
              onChange={field.onChange}
              actor={actor}
              error={!!errors.tipo_actividad}
              helperText={errors.tipo_actividad?.message}
            />
          )}
        />
      </Box>

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

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
          Responsables
        </Typography>
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
              sx={{ mt: 2 }}
            />
          )}
        />
      </Box>

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

      <Controller
        name="adjuntos_archivos"
        control={control}
        render={({ field }) => (
          <AttachmentUpload
            files={field.value || []}
            onChange={field.onChange}
            requiereEvidencia={selectedTipo ? false : false} // TODO: Get from tipo
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Controller
          name="es_borrador"
          control={control}
          render={({ field }) => (
            <Button
              type="submit"
              variant="outlined"
              disabled={loading}
              onClick={() => field.onChange(true)}
            >
              Guardar como Borrador
            </Button>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Actividad'}
        </Button>
      </Box>
    </Box>
  )
}
