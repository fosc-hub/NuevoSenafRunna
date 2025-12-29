"use client"

import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField, Box } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import BaseDialog from '@/components/shared/BaseDialog'
import { TipoActividadSelect } from './TipoActividadSelect'
import { ResponsableSelect } from './ResponsableSelect'
import { actividadService } from '../../services/actividadService'
import { useFormSubmission } from '@/hooks'
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

/**
 * REFACTORED: Uses BaseDialog + useFormSubmission + React Hook Form
 * Eliminated duplicate loading/error state management
 */
export const EditActividadModal: React.FC<EditActividadModalProps> = ({
  open,
  onClose,
  actividad,
  onSuccess
}) => {
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

  const { submit, isLoading, error } = useFormSubmission<EditActividadFormData>({
    onSubmit: async (data) => {
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
    },
    showSuccessToast: false,
    showErrorToast: false, // BaseDialog handles error display
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
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

  const onSubmitForm = handleSubmit((data) => submit(data))

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Editar Actividad"
      centerTitle
      error={error}
      loading={isLoading}
      loadingMessage="Guardando..."
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '95vh' } }}
      contentSx={{ overflow: 'auto' }}
      actions={[
        {
          label: "Cancelar",
          onClick: onClose,
          variant: "outlined",
          disabled: isLoading,
        },
        {
          label: isLoading ? "Guardando..." : "Guardar Cambios",
          onClick: onSubmitForm,
          variant: "contained",
          disabled: isLoading,
          loading: isLoading,
        },
      ]}
    >
      <Box component="form" onSubmit={onSubmitForm} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Controller
          name="tipo_actividad"
          control={control}
          render={({ field }) => (
            <TipoActividadSelect
              value={field.value}
              onChange={field.onChange}
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
    </BaseDialog>
  )
}
