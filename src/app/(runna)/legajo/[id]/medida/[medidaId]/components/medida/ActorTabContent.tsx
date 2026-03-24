"use client"

import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
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
import { DerechoPrincipalSelector } from './DerechoPrincipalSelector'
import { ActividadEspecificaSelector } from './ActividadEspecificaSelector'
import { TipoActividadSelect } from './TipoActividadSelect'
import { ResponsableSelect } from './ResponsableSelect'
import { AttachmentUpload } from './AttachmentUpload'
import { actividadService } from '../../services/actividadService'
import type { CreateActividadRequest } from '../../types/actividades'
import { getCurrentDateISO } from '@/utils/dateUtils'

/**
 * PLTM V4.1: Hybrid System Schema Factory
 * Creates appropriate validation schema based on team type
 */
const createActividadSchema = (isEquipoTecnico: boolean, isDraft: boolean) => {
  if (isEquipoTecnico) {
    // EQUIPO_TECNICO: Hierarchical structure (Derecho Principal → Actividad Específica)
    return z.object({
      tipo_actividad: z.number().min(1, 'Debe seleccionar un Derecho Principal'),
      subtipo_actividad: isDraft
        ? z.number().nullable().optional()
        : z.number().nullable().refine(val => val !== null && val !== undefined && val >= 1, {
            message: 'Debe seleccionar una Actividad Específica'
          }),
      fecha_planificacion: isDraft
        ? z.date().optional()
        : z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
      descripcion: z.string().optional(),
      responsable_principal: isDraft
        ? z.number().optional()
        : z.number().min(1, 'El responsable principal es requerido'),
      responsables_secundarios: z.array(z.number()).optional(),
      referentes_externos: z.string().optional(),
      es_borrador: z.boolean().optional(),
      adjuntos_archivos: z.array(z.instanceof(File)).optional(),
      adjuntos_tipos: z.array(z.string()).optional(),
      adjuntos_descripciones: z.array(z.string()).optional()
    })
  } else {
    // Other teams: Flat structure (Direct activity selection, no subtipo)
    return z.object({
      tipo_actividad: z.number().min(1, 'Debe seleccionar una Actividad'),
      subtipo_actividad: z.number().nullable().optional(), // Always optional for flat structure
      fecha_planificacion: isDraft
        ? z.date().optional()
        : z.date().min(new Date(1900, 0, 1), 'La fecha es requerida'),
      descripcion: z.string().optional(),
      responsable_principal: isDraft
        ? z.number().optional()
        : z.number().min(1, 'El responsable principal es requerido'),
      responsables_secundarios: z.array(z.number()).optional(),
      referentes_externos: z.string().optional(),
      es_borrador: z.boolean().optional(),
      adjuntos_archivos: z.array(z.instanceof(File)).optional(),
      adjuntos_tipos: z.array(z.string()).optional(),
      adjuntos_descripciones: z.array(z.string()).optional()
    })
  }
}

type ActividadFormData = z.infer<typeof actividadSchemaFinal>

interface ActorTabContentProps {
  actor: string
  planTrabajoId: number
  formData: Partial<CreateActividadRequest>
  onChange: (updates: Partial<CreateActividadRequest>) => void
  onClose: () => void
  onSuccess?: () => void
  /** MPI = Protección Integral, MPE = Protección Excepcional, MPJ = Penal Juvenil */
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ'
  filterEtapa?: 'APERTURA' | 'PROCESO' | 'CESE'
}

export const ActorTabContent: React.FC<ActorTabContentProps> = ({
  actor,
  planTrabajoId,
  onClose,
  onSuccess,
  tipoMedida,
  filterEtapa
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraft, setIsDraft] = useState(false)

  // PLTM V4.1: Detect team type for hybrid system
  const isEquipoTecnico = actor === 'EQUIPO_TECNICO'

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors }
  } = useForm<ActividadFormData>({
    resolver: zodResolver(createActividadSchema(isEquipoTecnico, isDraft)),
    mode: 'onBlur', // Changed from 'onChange' to avoid immediate validation
    defaultValues: {
      tipo_actividad: 0,
      subtipo_actividad: undefined, // Changed from 0 to undefined to avoid validation error on load
      fecha_planificacion: new Date(),
      descripcion: '',
      responsable_principal: 0,
      responsables_secundarios: [],
      referentes_externos: '',
      es_borrador: false
    }
  })

  // PLTM V4.1: Watch tipo_actividad for cascading reset (only for EQUIPO_TECNICO)
  const watchedDerechoId = useWatch({ control, name: 'tipo_actividad' })
  const selectedSubtipo = watch('subtipo_actividad')

  // Reset subtipo_actividad when derecho changes (only for hierarchical structure)
  useEffect(() => {
    if (isEquipoTecnico && watchedDerechoId) {
      setValue('subtipo_actividad', 0)
    }
  }, [watchedDerechoId, setValue, isEquipoTecnico])

  const [adjuntosTipos, setAdjuntosTipos] = useState<string[]>([])
  const [adjuntosDescripciones, setAdjuntosDescripciones] = useState<string[]>([])

  const handleDraftSubmit = async () => {
    setIsDraft(true)
    // Trigger validation with draft schema
    const isValid = await trigger()
    if (isValid) {
      handleSubmit(onSubmit)()
    }
  }

  const handleFinalSubmit = async () => {
    setIsDraft(false)
    // Trigger validation with final schema
    const isValid = await trigger()
    if (isValid) {
      handleSubmit(onSubmit)()
    }
  }

  const onSubmit = async (data: ActividadFormData) => {
    setLoading(true)
    setError(null)

    try {
      // PLTM V4.1: Hybrid system submission
      // - EQUIPO_TECNICO: tipo_actividad (Derecho) + subtipo_actividad (Specific activity)
      // - Other teams: tipo_actividad (Standalone activity), omit subtipo_actividad field
      const payload: any = {
        plan_trabajo: planTrabajoId,
        tipo_actividad: data.tipo_actividad,
        fecha_planificacion: data.fecha_planificacion?.toISOString().split('T')[0] || getCurrentDateISO(),
        descripcion: data.descripcion,
        responsable_principal: data.responsable_principal || 0,
        responsables_secundarios: data.responsables_secundarios,
        referentes_externos: data.referentes_externos,
        origen: 'MANUAL',
        es_borrador: isDraft,
        adjuntos_archivos: data.adjuntos_archivos,
        adjuntos_tipos: adjuntosTipos,
        adjuntos_descripciones: adjuntosDescripciones
      }

      // Only include subtipo_actividad for EQUIPO_TECNICO
      if (isEquipoTecnico && data.subtipo_actividad) {
        payload.subtipo_actividad = data.subtipo_actividad
      }

      await actividadService.create(payload)

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

      {/* PLTM V4.1: Info alert - Different message based on team type */}
      {isEquipoTecnico ? (
        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
          <strong>Sistema Jerárquico:</strong> Primero seleccione el Derecho Principal y luego la Actividad Específica.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
          <strong>Selección Directa:</strong> Seleccione la actividad correspondiente a su equipo.
        </Alert>
      )}

      {/* PLTM V4.1: Conditional rendering based on team type */}
      {isEquipoTecnico ? (
        <>
          {/* Hierarchical structure for EQUIPO_TECNICO */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
              Selección de Actividad
            </Typography>
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
          </Box>

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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
              Selección de Actividad
            </Typography>
            <Controller
              name="tipo_actividad"
              control={control}
              render={({ field }) => (
                <TipoActividadSelect
                  value={field.value}
                  onChange={field.onChange}
                  actor={actor}
                  tipoMedida={tipoMedida}
                  filterEtapa={filterEtapa}
                  error={!!errors.tipo_actividad}
                  helperText={errors.tipo_actividad?.message}
                />
              )}
            />
          </Box>
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
            onChange={(files, tipos, descripciones) => {
              field.onChange(files)
              if (tipos) setAdjuntosTipos(tipos)
              if (descripciones) setAdjuntosDescripciones(descripciones)
            }}
            requiereEvidencia={selectedSubtipo ? false : false} // TODO: Get from subtipo_actividad_info
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={handleDraftSubmit}
          sx={{ textTransform: 'none' }}
        >
          💾 Guardar como Borrador
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleFinalSubmit}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Guardando...' : '✅ Guardar Actividad'}
        </Button>
      </Box>
    </Box>
  )
}
