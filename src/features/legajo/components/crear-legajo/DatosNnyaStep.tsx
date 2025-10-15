'use client'

/**
 * Step 2: NNyA Data (LEG-02)
 * Shows selected NNyA or form for creating new one
 */

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Paper,
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'

// Validation schema
const nnyaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  dni: z.number().optional(),
  situacion_dni: z.enum(['EN_TRAMITE', 'VENCIDO', 'EXTRAVIADO', 'INEXISTENTE', 'VALIDO', 'OTRO']),
  fecha_nacimiento: z.date().optional(),
  edad_aproximada: z.number().optional(),
  nacionalidad: z.enum(['ARGENTINA', 'EXTRANJERA']),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICA']),
  domicilio_calle: z.string().optional(),
  domicilio_numero: z.string().optional(),
  domicilio_localidad: z.string().optional(),
  domicilio_provincia: z.string().optional(),
})

type NnyaFormData = z.infer<typeof nnyaSchema>

interface Props {
  nnyaSeleccionado: any
  modoCreacion: 'existente' | 'nuevo'
  onComplete: (datos: any) => void
  onBack: () => void
}

export default function DatosNnyaStep({ nnyaSeleccionado, modoCreacion, onComplete, onBack }: Props) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<NnyaFormData>({
    resolver: zodResolver(nnyaSchema),
    defaultValues: {
      nombre: nnyaSeleccionado?.nombre || '',
      apellido: nnyaSeleccionado?.apellido || '',
      dni: nnyaSeleccionado?.dni || undefined,
      situacion_dni: 'VALIDO',
      nacionalidad: 'ARGENTINA',
      genero: 'NO_ESPECIFICA',
    },
    mode: 'onChange',
  })

  const onSubmit = (data: NnyaFormData) => {
    const formattedData = {
      ...data,
      fecha_nacimiento: data.fecha_nacimiento
        ? data.fecha_nacimiento.toISOString().split('T')[0]
        : undefined,
    }
    onComplete(formattedData)
  }

  // If using existing NNyA, just show info and continue
  if (modoCreacion === 'existente' && nnyaSeleccionado) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
          Paso 2: Datos del NNyA
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Usando NNyA existente: <strong>{nnyaSeleccionado.nombre} {nnyaSeleccionado.apellido}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            DNI: {nnyaSeleccionado.dni || 'No especificado'}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={onBack}>
            Atrás
          </Button>
          <Button variant="contained" onClick={() => onComplete({})}>
            Continuar
          </Button>
        </Box>
      </Box>
    )
  }

  // Form for creating new NNyA
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
          Paso 2: Datos del NNyA
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete los datos personales del NNyA. Los campos marcados con * son obligatorios.
        </Typography>

        <Grid container spacing={2.5}>
          {/* Nombre y Apellido */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre *"
                  fullWidth
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="apellido"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Apellido *"
                  fullWidth
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
                />
              )}
            />
          </Grid>

          {/* DNI y Situación DNI */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="dni"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="DNI"
                  type="number"
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  error={!!errors.dni}
                  helperText={errors.dni?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="situacion_dni"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.situacion_dni}>
                  <InputLabel>Situación DNI *</InputLabel>
                  <Select {...field} label="Situación DNI *">
                    <MenuItem value="VALIDO">Válido</MenuItem>
                    <MenuItem value="EN_TRAMITE">En Trámite</MenuItem>
                    <MenuItem value="VENCIDO">Vencido</MenuItem>
                    <MenuItem value="EXTRAVIADO">Extraviado</MenuItem>
                    <MenuItem value="INEXISTENTE">Inexistente</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Fecha Nacimiento y Edad Aproximada */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="fecha_nacimiento"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Fecha de Nacimiento"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.fecha_nacimiento,
                      helperText: errors.fecha_nacimiento?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="edad_aproximada"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Edad Aproximada"
                  type="number"
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  helperText="Si no conoce la fecha exacta"
                />
              )}
            />
          </Grid>

          {/* Género y Nacionalidad */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Género *</InputLabel>
                  <Select {...field} label="Género *">
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                    <MenuItem value="NO_ESPECIFICA">No Especifica</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="nacionalidad"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Nacionalidad *</InputLabel>
                  <Select {...field} label="Nacionalidad *">
                    <MenuItem value="ARGENTINA">Argentina</MenuItem>
                    <MenuItem value="EXTRANJERA">Extranjera</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Domicilio */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
              Domicilio (Opcional)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Controller
              name="domicilio_calle"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Calle" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name="domicilio_numero"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Número" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="domicilio_localidad"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Localidad" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="domicilio_provincia"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Provincia" fullWidth />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid}>
            Continuar
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  )
}
