"use client"

import type React from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Autocomplete
} from "@mui/material"
import { useState } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { InformacionEducativaSection } from "../shared/InformacionEducativaSection"
import { InformacionSaludSection } from "../shared/InformacionSaludSection"
import { TalleresSection } from "../shared/TalleresSection"
import type { CambioLugarResguardo, NotaSeguimiento, TipoSituacion, SituacionNNyA, TLocalCentroVida } from "../../../types/seguimiento-dispositivo"
import { mapEducacionFromDemanda, mapSaludFromDemandaEnhanced } from "../../../utils/seguimiento-mapper"
import { useMemo, useEffect } from "react"
import { seguimientoDispositivoService } from "../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"

// No more mock data - using real API

// Situación del NNyA en Instituto (MPJ specific) - API v2.0
const SituacionInstitutoSection = ({ medidaId }: { medidaId: number }) => {
  const [tipoSituacion, setTipoSituacion] = useState<TipoSituacion>('AUTORIZACION')
  const [fecha, setFecha] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [situaciones, setSituaciones] = useState<SituacionNNyA[]>([])
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch existing situaciones on mount
  useEffect(() => {
    fetchSituaciones()
  }, [medidaId])

  const fetchSituaciones = async () => {
    setLoading(true)
    try {
      const data = await seguimientoDispositivoService.listSituaciones(medidaId)
      // Ensure data is an array
      setSituaciones(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching situaciones:', error)
      setSituaciones([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!fecha) {
      toast.error('La fecha es requerida')
      return
    }

    try {
      const savedSituacion = await seguimientoDispositivoService.addSituacionDispositivo(medidaId, {
        tipo_situacion: tipoSituacion,
        fecha: fecha,
        observaciones: observaciones || undefined
      })

      // Reset form
      setTipoSituacion('AUTORIZACION')
      setFecha('')
      setObservaciones('')

      // Add new situación to local state instead of refetching
      setSituaciones(prev => [savedSituacion, ...prev])
    } catch (error) {
      // Error handled by apiService
      console.error('Error saving situación:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Situación del NNyA en Instituto
      </Typography>

      {/* Form to add new situación */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Radio buttons for tipo_situacion */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Tipo de Situación *
              </Typography>
              <RadioGroup
                row
                value={tipoSituacion}
                onChange={(e) => setTipoSituacion(e.target.value as TipoSituacion)}
              >
                <FormControlLabel
                  value="AUTORIZACION"
                  control={<Radio />}
                  label="Autorización"
                />
                <FormControlLabel
                  value="PERMISO"
                  control={<Radio />}
                  label="Permiso"
                />
                <FormControlLabel
                  value="PERMISO_PROLONGADO"
                  control={<Radio />}
                  label="Permiso Prolongado"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Fecha field with validation */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today // Prevent future dates
              }}
              helperText="La fecha no puede ser futura (requerido)"
              error={!fecha}
            />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales sobre la situación (opcional)"
            />
          </Grid>

          {/* Save button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!fecha}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Guardar Situación
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved situaciones */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Historial de Situaciones
        </Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Cargando situaciones...
          </Typography>
        ) : situaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay situaciones registradas
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {situaciones.map((situacion) => (
              <Card key={situacion.id} elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Tipo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {situacion.tipo_situacion_display}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Fecha
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDate(situacion.fecha)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Fecha de Registro
                      </Typography>
                      <Typography variant="body2">
                        {situacion.fecha_registro ? formatDateTime(situacion.fecha_registro) : '-'}
                      </Typography>
                    </Grid>
                    {situacion.observaciones && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Observaciones
                        </Typography>
                        <Typography variant="body2">
                          {situacion.observaciones}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Cambio de Lugar de Resguardo Section (shared between MPE and MPJ)
const CambioLugarResguardoSection = ({ medidaId }: { medidaId: number }) => {
  const [cambios, setCambios] = useState<CambioLugarResguardo[]>([])
  const [locales, setLocales] = useState<TLocalCentroVida[]>([])
  const [lugarOrigen, setLugarOrigen] = useState<TLocalCentroVida | null>(null)
  const [lugarDestino, setLugarDestino] = useState<TLocalCentroVida | null>(null)
  const [fecha, setFecha] = useState("")
  const [motivo, setMotivo] = useState("")
  const [autorizadoPor, setAutorizadoPor] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingLocales, setLoadingLocales] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch locations on mount
  useEffect(() => {
    fetchLocales()
  }, [])

  // Fetch existing cambios on mount
  useEffect(() => {
    fetchCambios()
  }, [medidaId])

  const fetchLocales = async () => {
    setLoadingLocales(true)
    try {
      const data = await seguimientoDispositivoService.listLocalesCentroVida()
      setLocales(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching locales:', error)
      setLocales([])
    } finally {
      setLoadingLocales(false)
    }
  }

  const fetchCambios = async () => {
    setLoading(true)
    try {
      const data = await seguimientoDispositivoService.listCambiosLugar(medidaId)
      setCambios(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching cambios de lugar:', error)
      setCambios([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lugarOrigen || !lugarDestino || !fecha) {
      toast.error('Lugar origen, lugar destino y fecha son requeridos')
      return
    }

    if (lugarOrigen.id === lugarDestino.id) {
      toast.error('El lugar de origen y destino no pueden ser iguales')
      return
    }

    try {
      const savedCambio = await seguimientoDispositivoService.addCambioResguardo(medidaId, {
        lugar_origen: lugarOrigen.id,
        lugar_destino: lugarDestino.id,
        fecha_cambio: fecha,
        motivo: motivo || undefined,
        autorizado_por: autorizadoPor || undefined
      })

      // Reset form
      setLugarOrigen(null)
      setLugarDestino(null)
      setFecha('')
      setMotivo('')
      setAutorizadoPor('')

      // Add new cambio to local state
      setCambios(prev => [savedCambio, ...prev])
    } catch (error) {
      console.error('Error saving cambio de lugar:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
        Cambio de Lugar de Resguardo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre los cambios de ubicación del NNyA en diferentes dispositivos
      </Typography>

      {/* Form to add new cambio */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
          Nuevo Cambio de Lugar
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={locales}
              getOptionLabel={(option) => option.nombre}
              value={lugarOrigen}
              onChange={(_, newValue) => setLugarOrigen(newValue)}
              loading={loadingLocales}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Lugar de Origen"
                  placeholder="Seleccione el lugar actual"
                  helperText="Seleccione el lugar donde se encuentra actualmente el NNyA"
                  error={!lugarOrigen}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.direccion && (
                      <Typography variant="caption" color="text.secondary">
                        {option.direccion}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={locales}
              getOptionLabel={(option) => option.nombre}
              value={lugarDestino}
              onChange={(_, newValue) => setLugarDestino(newValue)}
              loading={loadingLocales}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Lugar de Destino"
                  placeholder="Seleccione el nuevo lugar"
                  helperText="Seleccione el lugar al que se trasladará el NNyA"
                  error={!lugarDestino || (lugarOrigen && lugarDestino && lugarOrigen.id === lugarDestino.id)}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.direccion && (
                      <Typography variant="caption" color="text.secondary">
                        {option.direccion}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha del Cambio"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today
              }}
              helperText="Fecha en que se realizó el cambio"
              error={!fecha}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Autorizado Por"
              value={autorizadoPor}
              onChange={(e) => setAutorizadoPor(e.target.value)}
              placeholder="Ej: Juez Dr. Juan Pérez"
              helperText="Persona que autorizó el cambio (opcional)"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo del Cambio"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo del cambio de lugar..."
              helperText="Detalle las razones del cambio (opcional)"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!lugarOrigen || !lugarDestino || !fecha || (lugarOrigen && lugarDestino && lugarOrigen.id === lugarDestino.id)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Registrar Cambio
              </Button>
              <Typography variant="caption" color="text.secondary">
                * Campos requeridos: Lugar origen, Lugar destino y Fecha
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved cambios */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Cambios
          </Typography>
          {cambios.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Total: {cambios.length} {cambios.length === 1 ? 'cambio' : 'cambios'}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando historial de cambios...
            </Typography>
          </Paper>
        ) : cambios.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              No hay cambios de lugar registrados
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Los cambios aparecerán aquí una vez que registre el primero
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cambios.map((cambio, index) => (
              <Card
                key={cambio.id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)'
                  },
                  borderLeft: index === 0 ? '4px solid #1976d2' : '4px solid #e0e0e0'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            bgcolor: index === 0 ? '#1976d2' : '#9e9e9e',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {index === 0 ? 'MÁS RECIENTE' : `CAMBIO #${cambios.length - index}`}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Movimiento
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                        {cambio.lugar_origen_nombre || `Dispositivo ${cambio.lugar_origen}`}
                        {' → '}
                        {cambio.lugar_destino_nombre || `Dispositivo ${cambio.lugar_destino}`}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Fecha del Cambio
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {formatDate(cambio.fecha_cambio)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Registrado
                      </Typography>
                      <Typography variant="body2">
                        {cambio.fecha_registro ? formatDateTime(cambio.fecha_registro) : '-'}
                      </Typography>
                    </Grid>

                    {cambio.motivo && (
                      <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Motivo
                          </Typography>
                          <Typography variant="body2">
                            {cambio.motivo}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {cambio.autorizado_por && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Autorizado Por
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cambio.autorizado_por}
                        </Typography>
                      </Grid>
                    )}

                    {cambio.adjunto_url && (
                      <Grid item xs={12}>
                        <Button
                          size="small"
                          startIcon={<AttachFileIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          Ver Adjunto
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Notas de Seguimiento Section (shared between MPE and MPJ)
const NotasSeguimientoSection = ({ medidaId }: { medidaId: number }) => {
  const [notas, setNotas] = useState<NotaSeguimiento[]>([])
  const [titulo, setTitulo] = useState("")
  const [nota, setNota] = useState("")
  const [fecha, setFecha] = useState("")
  const [autor, setAutor] = useState("")
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Fetch existing notas on mount
  useEffect(() => {
    fetchNotas()
  }, [medidaId])

  const fetchNotas = async () => {
    setLoading(true)
    try {
      const data = await seguimientoDispositivoService.listNotasSeguimiento(medidaId)
      setNotas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching notas de seguimiento:', error)
      setNotas([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!titulo || !nota || !fecha) {
      toast.error('Título, nota y fecha son requeridos')
      return
    }

    try {
      const savedNota = await seguimientoDispositivoService.addNotaSeguimiento(medidaId, {
        titulo: titulo,
        nota: nota,
        fecha: fecha,
        autor: autor || undefined
      })

      // Reset form
      setTitulo('')
      setNota('')
      setFecha('')
      setAutor('')

      // Add new nota to local state
      setNotas(prev => [savedNota, ...prev])
    } catch (error) {
      console.error('Error saving nota de seguimiento:', error)
    }
  }

  const handleDelete = async (notaId: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota?')) {
      return
    }

    try {
      await seguimientoDispositivoService.deleteNotaSeguimiento(medidaId, notaId)
      toast.success('Nota eliminada exitosamente')

      // Remove from local state
      setNotas(prev => prev.filter(n => n.id !== notaId))
    } catch (error) {
      console.error('Error deleting nota:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
        Notas de Seguimiento
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre observaciones y seguimiento del NNyA en el dispositivo
      </Typography>

      {/* Form to add new nota */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
          Nueva Nota de Seguimiento
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Título de la Nota"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Visita de seguimiento mensual"
              helperText="Ingrese un título descriptivo para la nota"
              error={!titulo && titulo !== ""}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="date"
              label="Fecha de la Nota"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today
              }}
              helperText="Fecha del seguimiento"
              error={!fecha}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Describa detalladamente las observaciones del seguimiento..."
              helperText="Describa las observaciones y detalles del seguimiento"
              error={!nota && nota !== ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ej: Lic. María González"
              helperText="Persona que realizó el seguimiento (opcional)"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!titulo || !nota || !fecha}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Agregar Nota
              </Button>
              <Typography variant="caption" color="text.secondary">
                * Campos requeridos: Título, Nota y Fecha
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* List of saved notas */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Notas
          </Typography>
          {notas.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Total: {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando notas de seguimiento...
            </Typography>
          </Paper>
        ) : notas.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notas de seguimiento registradas
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Las notas aparecerán aquí una vez que registre la primera
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notas.map((nota, index) => (
              <Card
                key={nota.id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)'
                  },
                  borderLeft: index === 0 ? '4px solid #1976d2' : '4px solid #e0e0e0'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {index === 0 && (
                          <Box
                            sx={{
                              bgcolor: '#1976d2',
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            MÁS RECIENTE
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Fecha: {formatDate(nota.fecha)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1976d2', fontSize: '1.1rem' }}>
                        {nota.titulo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {nota.adjunto_url && (
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{
                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                          }}
                        >
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(nota.id!)}
                        sx={{
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {nota.nota}
                    </Typography>
                  </Paper>

                  <Grid container spacing={2}>
                    {nota.autor_nombre && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Autor
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {nota.autor_nombre}
                        </Typography>
                      </Grid>
                    )}
                    {nota.fecha_registro && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Fecha de Registro
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTime(nota.fecha_registro)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Main MPJ Seguimiento Dispositivo Tab
interface SeguimientoDispositivoMPJProps {
  medidaId: number // Required for API calls
  demandaData?: any // Full demanda data from the full-detail endpoint
  personaId?: number // Optional specific persona ID to use
}

export const SeguimientoDispositivoMPJ: React.FC<SeguimientoDispositivoMPJProps> = ({
  medidaId,
  demandaData,
  personaId
}) => {
  const [selectedSection, setSelectedSection] = useState<string>("situacion-instituto")

  // Transform demanda data to seguimiento format
  const educacionData = useMemo(() => {
    if (!demandaData) return undefined
    return mapEducacionFromDemanda(demandaData, personaId)
  }, [demandaData, personaId])

  const saludData = useMemo(() => {
    if (!demandaData) return undefined
    return mapSaludFromDemandaEnhanced(demandaData, personaId)
  }, [demandaData, personaId])

  const sidebarOptions = [
    { id: "situacion-instituto", label: "Situación del NNyA" },
    { id: "informacion-educativa", label: "Información Educativa" },
    { id: "informacion-salud", label: "Información de Salud" },
    { id: "talleres", label: "Talleres Recreativos y Sociolaborales" },
    { id: "cambio-lugar", label: "Cambio de Lugar de Resguardo" },
    { id: "notas-seguimiento", label: "Notas de Seguimiento" }
  ]

  const renderContent = () => {
    switch (selectedSection) {
      case "situacion-instituto":
        return <SituacionInstitutoSection medidaId={medidaId} />
      case "informacion-educativa":
        return <InformacionEducativaSection medidaId={medidaId} personaId={personaId} data={educacionData} />
      case "informacion-salud":
        return <InformacionSaludSection medidaId={medidaId} personaId={personaId} data={saludData} />
      case "talleres":
        return <TalleresSection medidaId={medidaId} maxTalleres={5} />
      case "cambio-lugar":
        return <CambioLugarResguardoSection medidaId={medidaId} />
      case "notas-seguimiento":
        return <NotasSeguimientoSection medidaId={medidaId} />
      default:
        return <SituacionInstitutoSection medidaId={medidaId} />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Sidebar */}
        <Box sx={{ width: 300, flexShrink: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sidebarOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedSection === option.id ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedSection(option.id)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  justifyContent: "flex-start",
                  py: 1.5,
                  px: 2,
                  fontWeight: selectedSection === option.id ? 600 : 400,
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            {renderContent()}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
