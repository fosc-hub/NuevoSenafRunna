'use client'

/**
 * Step 3: Assignment (LEG-02)
 * Select urgencia, zona trabajo, usuario responsable
 * Optionally select centro de vida
 */

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  getUrgencias,
  getZonasDisponibles,
  getUsuariosPorZona,
  getLocalesCentroVida,
} from '../../api/catalogos.service'

interface Props {
  formData: any
  onComplete: (asignacion: any) => void
  onBack: () => void
}

export default function AsignacionStep({ formData, onComplete, onBack }: Props) {
  const [includeCentroVida, setIncludeCentroVida] = useState(false)
  const [zonaTrabajo, setZonaTrabajo] = useState<number | null>(null)
  const [zonaCentroVida, setZonaCentroVida] = useState<number | null>(null)

  const { control, handleSubmit, watch, setValue, formState: { isValid } } = useForm({
    defaultValues: {
      urgencia: '',
      zona_trabajo_id: '',
      user_responsable_trabajo_id: '',
      local_centro_vida_id: '',
      zona_centro_vida_id: '',
      user_responsable_centro_vida_id: '',
    },
  })

  // Fetch catalogs
  const { data: urgenciasData, isLoading: loadingUrgencias } = useQuery({
    queryKey: ['urgencias'],
    queryFn: getUrgencias,
  })
  // Handle both direct array and paginated response { results: [...] }
  const urgencias = Array.isArray(urgenciasData) 
    ? urgenciasData 
    : (urgenciasData as any)?.results ?? []

  const { data: zonasData, isLoading: loadingZonas } = useQuery({
    queryKey: ['zonas'],
    queryFn: getZonasDisponibles,
  })
  // Handle both direct array and paginated response { results: [...] }
  const zonas = Array.isArray(zonasData) 
    ? zonasData 
    : (zonasData as any)?.results ?? []

  const { data: usuariosTrabajoData, isLoading: loadingUsuariosTrabajo } = useQuery({
    queryKey: ['usuarios', zonaTrabajo],
    queryFn: () => getUsuariosPorZona(zonaTrabajo!),
    enabled: !!zonaTrabajo,
  })
  // Handle both direct array and paginated response { results: [...] }
  const usuariosTrabajo = Array.isArray(usuariosTrabajoData) 
    ? usuariosTrabajoData 
    : (usuariosTrabajoData as any)?.results ?? []

  const { data: usuariosCentroVidaData } = useQuery({
    queryKey: ['usuarios', zonaCentroVida],
    queryFn: () => getUsuariosPorZona(zonaCentroVida!),
    enabled: !!zonaCentroVida && includeCentroVida,
  })
  // Handle both direct array and paginated response { results: [...] }
  const usuariosCentroVida = Array.isArray(usuariosCentroVidaData) 
    ? usuariosCentroVidaData 
    : (usuariosCentroVidaData as any)?.results ?? []

  const { data: localesData } = useQuery({
    queryKey: ['locales', zonaCentroVida],
    queryFn: () => getLocalesCentroVida(zonaCentroVida!),
    enabled: !!zonaCentroVida && includeCentroVida,
  })
  // Handle both direct array and paginated response { results: [...] }
  const locales = Array.isArray(localesData) 
    ? localesData 
    : (localesData as any)?.results ?? []

  const onSubmit = (data: any) => {
    // Convertir strings vacíos a null y asegurar que los IDs sean números
    const asignacion: any = {
      urgencia: data.urgencia ? Number(data.urgencia) : null,
      zona_trabajo_id: data.zona_trabajo_id ? Number(data.zona_trabajo_id) : null,
      user_responsable_trabajo_id: data.user_responsable_trabajo_id ? Number(data.user_responsable_trabajo_id) : null,
      origen: 'Creación manual',
    }

    if (includeCentroVida) {
      asignacion.local_centro_vida_id = data.local_centro_vida_id ? Number(data.local_centro_vida_id) : null
      asignacion.zona_centro_vida_id = data.zona_centro_vida_id ? Number(data.zona_centro_vida_id) : null
      asignacion.user_responsable_centro_vida_id = data.user_responsable_centro_vida_id ? Number(data.user_responsable_centro_vida_id) : null
    }

    onComplete(asignacion)
  }

  const isLoading = loadingUrgencias || loadingZonas

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
        Paso 3: Asignación de Legajo
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure la urgencia y asigne el legajo a una zona y responsable.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Urgencia */}
          <Grid item xs={12}>
            <Controller
              name="urgencia"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel>Urgencia *</InputLabel>
                  <Select {...field} label="Urgencia *">
                    {urgencias.map((u: any) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Equipo de Trabajo
            </Typography>
          </Grid>

          {/* Zona Trabajo */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="zona_trabajo_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel>Zona *</InputLabel>
                  <Select
                    {...field}
                    label="Zona *"
                    onChange={(e) => {
                      field.onChange(e)
                      const zonaId = e.target.value as number
                      setZonaTrabajo(zonaId)
                      setValue('user_responsable_trabajo_id', '')
                    }}
                  >
                    {zonas.map((z: any) => (
                      <MenuItem key={z.id} value={z.id}>
                        {z.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Responsable Trabajo */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="user_responsable_trabajo_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth required disabled={!zonaTrabajo || loadingUsuariosTrabajo}>
                  <InputLabel>Responsable *</InputLabel>
                  <Select {...field} label="Responsable *">
                    {loadingUsuariosTrabajo ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando usuarios...
                      </MenuItem>
                    ) : usuariosTrabajo.length === 0 ? (
                      <MenuItem disabled>No hay usuarios en esta zona</MenuItem>
                    ) : (
                      usuariosTrabajo.map((u: any) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.nombre_completo || `${u.first_name} ${u.last_name}` || u.username}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Centro de Vida (Optional) */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch checked={includeCentroVida} onChange={(e) => setIncludeCentroVida(e.target.checked)} />
              }
              label="Asignar Centro de Vida (opcional)"
            />
          </Grid>

          {includeCentroVida && (
            <>
              <Grid item xs={12}>
                <Alert severity="info">
                  Si asigna centro de vida, debe completar todos los campos relacionados.
                </Alert>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="zona_centro_vida_id"
                  control={control}
                  rules={{ required: includeCentroVida }}
                  render={({ field }) => (
                    <FormControl fullWidth required={includeCentroVida}>
                      <InputLabel>Zona Centro de Vida</InputLabel>
                      <Select
                        {...field}
                        label="Zona Centro de Vida"
                        onChange={(e) => {
                          field.onChange(e)
                          const zonaId = e.target.value as number
                          setZonaCentroVida(zonaId)
                          setValue('local_centro_vida_id', '')
                          setValue('user_responsable_centro_vida_id', '')
                        }}
                      >
                        {zonas.map((z: any) => (
                          <MenuItem key={z.id} value={z.id}>
                            {z.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="local_centro_vida_id"
                  control={control}
                  rules={{ required: includeCentroVida }}
                  render={({ field }) => (
                    <FormControl fullWidth required={includeCentroVida} disabled={!zonaCentroVida}>
                      <InputLabel>Local</InputLabel>
                      <Select {...field} label="Local">
                        {locales.length === 0 ? (
                          <MenuItem disabled>No hay locales en esta zona</MenuItem>
                        ) : (
                          locales.map((l: any) => (
                            <MenuItem key={l.id} value={l.id}>
                              {l.nombre}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="user_responsable_centro_vida_id"
                  control={control}
                  rules={{ required: includeCentroVida }}
                  render={({ field }) => (
                    <FormControl fullWidth required={includeCentroVida} disabled={!zonaCentroVida}>
                      <InputLabel>Responsable</InputLabel>
                      <Select {...field} label="Responsable">
                        {usuariosCentroVida.length === 0 ? (
                          <MenuItem disabled>No hay usuarios en esta zona</MenuItem>
                        ) : (
                          usuariosCentroVida.map((u: any) => (
                            <MenuItem key={u.id} value={u.id}>
                              {u.nombre_completo || `${u.first_name} ${u.last_name}` || u.username}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={isLoading}>
          Atrás
        </Button>
        <Button type="submit" variant="contained" disabled={!isValid || isLoading}>
          Continuar
        </Button>
      </Box>
    </form>
  )
}
