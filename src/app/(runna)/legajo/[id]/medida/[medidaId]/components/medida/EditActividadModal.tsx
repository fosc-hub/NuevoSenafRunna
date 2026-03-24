"use client"

import React, { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField, Box, Alert } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import BaseDialog from '@/components/shared/BaseDialog'
import { DerechoPrincipalSelector } from './DerechoPrincipalSelector'
import { ActividadEspecificaSelector } from './ActividadEspecificaSelector'
import { TipoActividadSelect } from './TipoActividadSelect'
import { ResponsableSelect } from './ResponsableSelect'
import { actividadService } from '../../services/actividadService'
import { useFormSubmission } from '@/hooks'
import type { TActividadPlanTrabajo, UpdateActividadRequest } from '../../types/actividades'

/**
 * PLTM V4.1: Hybrid System Schema Factory for editing
 * Creates appropriate validation schema based on team type
 */
const createEditSchema = (isEquipoTecnico: boolean) => {
  if (isEquipoTecnico) {
    // EQUIPO_TECNICO: Hierarchical structure
    return z.object({
      tipo_actividad: z.number().min(1, 'Debe seleccionar un Derecho Principal'),
      subtipo_actividad: z.number().min(1, 'Debe seleccionar una Actividad Específica'),
      fecha_planificacion: z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
      descripcion: z.string().optional(),
      responsable_principal: z.number().min(1, 'El responsable principal es requerido'),
      responsables_secundarios: z.array(z.number()).optional(),
      referentes_externos: z.string().optional()
    })
  } else {
    // Other teams: Flat structure
    return z.object({
      tipo_actividad: z.number().min(1, 'Debe seleccionar una Actividad'),
      subtipo_actividad: z.number().optional(), // Optional for flat structure
      fecha_planificacion: z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
      descripcion: z.string().optional(),
      responsable_principal: z.number().min(1, 'El responsable principal es requerido'),
      responsables_secundarios: z.array(z.number()).optional(),
      referentes_externos: z.string().optional()
    })
  }
}

type EditActividadFormData = z.infer<typeof editActividadSchema>

interface EditActividadModalProps {
  open: boolean
  onClose: () => void
  actividad: TActividadPlanTrabajo
  /** MPI = Protección Integral, MPE = Protección Excepcional, MPJ = Penal Juvenil */
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ'
  onSuccess?: () => void
}

/**
 * PLTM V4.1: Edit Activity Modal with Hybrid System Support
 *
 * Supports both structures:
 * - EQUIPO_TECNICO: Two-step cascading (Derecho Principal → Actividad Específica)
 * - Other teams: Single-step direct activity selection
 *
 * REFACTORED: Uses BaseDialog + useFormSubmission + React Hook Form
 * Eliminated duplicate loading/error state management
 */
export const EditActividadModal: React.FC<EditActividadModalProps> = ({
  open,
  onClose,
  actividad,
  tipoMedida,
  onSuccess
}) => {
  // PLTM V4.1: Detect team type from actividad
  const isEquipoTecnico = actividad.actor === 'EQUIPO_TECNICO'

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EditActividadFormData>({
    resolver: zodResolver(createEditSchema(isEquipoTecnico)),
    defaultValues: {
      tipo_actividad: actividad.tipo_actividad || actividad.derecho_principal,
      subtipo_actividad: actividad.subtipo_actividad || 0,
      fecha_planificacion: new Date(actividad.fecha_planificacion),
      descripcion: actividad.descripcion || '',
      responsable_principal: actividad.responsable_principal,
      responsables_secundarios: actividad.responsables_secundarios?.map(r => typeof r === 'number' ? r : r.id) || [],
      referentes_externos: actividad.referentes_externos || ''
    }
  })

  // Watch tipo_actividad changes for cascading reset (only for EQUIPO_TECNICO)
  const watchedDerechoId = useWatch({ control, name: 'tipo_actividad' })

  // Reset subtipo_actividad when derecho changes (only for hierarchical structure)
  useEffect(() => {
    // Only reset if derecho actually changed (not initial load) and for EQUIPO_TECNICO
    if (isEquipoTecnico && watchedDerechoId && watchedDerechoId !== actividad.tipo_actividad) {
      setValue('subtipo_actividad', 0)
    }
  }, [watchedDerechoId, actividad.tipo_actividad, setValue, isEquipoTecnico])

  const { submit, isLoading, error } = useFormSubmission<EditActividadFormData>({
    onSubmit: async (data) => {
      // PLTM V4.1: Hybrid system update
      // - EQUIPO_TECNICO: Both tipo_actividad and subtipo_actividad
      // - Other teams: Only tipo_actividad, omit subtipo_actividad
      const updateData: any = {
        tipo_actividad: data.tipo_actividad,
        fecha_planificacion: data.fecha_planificacion.toISOString().split('T')[0],
        descripcion: data.descripcion,
        responsable_principal: data.responsable_principal,
        responsables_secundarios: data.responsables_secundarios,
        referentes_externos: data.referentes_externos
      }

      // Only include subtipo_actividad for EQUIPO_TECNICO
      if (isEquipoTecnico && data.subtipo_actividad) {
        updateData.subtipo_actividad = data.subtipo_actividad
      }

      await actividadService.update(actividad.id, updateData)
    },
    showSuccessToast: true,
    successMessage: 'Actividad actualizada exitosamente',
    showErrorToast: false, // BaseDialog handles error display
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        tipo_actividad: actividad.tipo_actividad || actividad.derecho_principal,
        subtipo_actividad: actividad.subtipo_actividad,
        fecha_planificacion: new Date(actividad.fecha_planificacion),
        descripcion: actividad.descripcion || '',
        responsable_principal: actividad.responsable_principal,
        responsables_secundarios: actividad.responsables_secundarios?.map(r => typeof r === 'number' ? r : r.id) || [],
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
        {/* PLTM V4.1: Info alert - Different message based on team type */}
        {isEquipoTecnico ? (
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            <strong>Sistema Jerárquico:</strong> Primero seleccione el Derecho Principal y luego la Actividad Específica.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            <strong>Edición de Actividad:</strong> Seleccione la actividad correspondiente a su equipo.
          </Alert>
        )}

        {/* PLTM V4.1: Conditional rendering based on team type */}
        {isEquipoTecnico ? (
          <>
            {/* Hierarchical structure for EQUIPO_TECNICO */}
            <Controller
              name="tipo_actividad"
              control={control}
              render={({ field }) => (
                <DerechoPrincipalSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.tipo_actividad}
                  helperText={errors.tipo_actividad?.message}
                />
              )}
            />

            <Controller
              name="subtipo_actividad"
              control={control}
              render={({ field }) => (
                <ActividadEspecificaSelector
                  derechoId={watchedDerechoId}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.subtipo_actividad}
                  helperText={errors.subtipo_actividad?.message}
                />
              )}
            />
          </>
        ) : (
          <>
            {/* Flat structure for other teams */}
            <Controller
              name="tipo_actividad"
              control={control}
              render={({ field }) => (
                <TipoActividadSelect
                  value={field.value}
                  onChange={field.onChange}
                  actor={actividad.actor}
                  tipoMedida={tipoMedida}
                  error={!!errors.tipo_actividad}
                  helperText={errors.tipo_actividad?.message}
                />
              )}
            />
          </>
        )}

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
              placeholder="Detalles adicionales sobre esta actividad..."
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
