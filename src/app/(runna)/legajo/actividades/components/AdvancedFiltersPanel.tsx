"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Collapse,
  Button,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider,
  InputAdornment,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es } from 'date-fns/locale'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import FolderIcon from '@mui/icons-material/Folder'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CategoryIcon from '@mui/icons-material/Category'
import { useCatalogData, extractArray } from '@/hooks/useApiQuery'
import type { GlobalActividadFilters } from '../services/globalActividadService'
import type { TTipoActividad } from '../../[id]/medida/[medidaId]/types/actividades'
import type { Usuario, Zona } from '@/app/(runna)/legajo-mesa/types/asignacion-types'
import type { TableVariant } from './UnifiedActividadesTable'

// Estado options for multi-select
const ESTADO_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#ff9800' },
  { value: 'EN_PROGRESO', label: 'En Progreso', color: '#2196f3' },
  { value: 'COMPLETADA', label: 'Completada', color: '#4caf50' },
  { value: 'PENDIENTE_VISADO_JZ', label: 'Pendiente Visado JZ', color: '#f57c00' },
  { value: 'PENDIENTE_VISADO', label: 'Pendiente Visado Legal', color: '#9c27b0' },
  { value: 'VISADO_CON_OBSERVACION', label: 'Visado con Observación', color: '#ff5722' },
  { value: 'VISADO_APROBADO', label: 'Visado Aprobado', color: '#009688' },
  { value: 'CANCELADA', label: 'Cancelada', color: '#f44336' },
  { value: 'VENCIDA', label: 'Vencida', color: '#9e9e9e' },
]

// Tipo Medida options
const TIPO_MEDIDA_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'MPI', label: 'MPI - Medida de Protección Integral' },
  { value: 'MPE', label: 'MPE - Medida de Protección Excepcional' },
  { value: 'MPJ', label: 'MPJ - Medida Penal Juvenil' },
]

// Origen options
const ORIGEN_OPTIONS = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'MANUAL', label: 'Creación Manual' },
  { value: 'DEMANDA_PI', label: 'Demanda - Petición de Informe' },
  { value: 'DEMANDA_OFICIO', label: 'Demanda - Carga de Oficios' },
  { value: 'OFICIO', label: 'Oficio Judicial' },
]

// Actor options
const ACTOR_OPTIONS = [
  { value: '', label: 'Todos los equipos' },
  { value: 'EQUIPO_TECNICO', label: 'Equipo Técnico' },
  { value: 'EQUIPO_LEGAL', label: 'Equipo Legal' },
  { value: 'EQUIPOS_RESIDENCIALES', label: 'Equipos Residenciales' },
  { value: 'ADULTOS_INSTITUCION', label: 'Adultos/Institución' },
]

interface AdvancedFiltersPanelProps {
  filters: GlobalActividadFilters
  onFilterChange: (key: keyof GlobalActividadFilters, value: any) => void
  onClearFilters: () => void
  canSeeAllActors: boolean
  /** Variant determines which filter sections to show */
  variant?: TableVariant
}

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  canSeeAllActors,
  variant = 'global',
}) => {
  // Determine which sections to show based on variant
  // Only show NNyA & Legajo section for global view since legajo/medida already have this context
  const showNnyaLegajoSection = variant === 'global'
  const [expanded, setExpanded] = useState(false)

  // Debounced search state - local state for immediate UI feedback
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localNnyaNombre, setLocalNnyaNombre] = useState(filters.nnya_nombre || '')
  const [localNnyaDni, setLocalNnyaDni] = useState(filters.nnya_dni || '')
  const [localNumeroLegajo, setLocalNumeroLegajo] = useState(filters.numero_legajo || '')

  // Sync local state when filters are cleared externally
  useEffect(() => {
    setLocalSearch(filters.search || '')
    setLocalNnyaNombre(filters.nnya_nombre || '')
    setLocalNnyaDni(filters.nnya_dni || '')
    setLocalNumeroLegajo(filters.numero_legajo || '')
  }, [filters.search, filters.nnya_nombre, filters.nnya_dni, filters.numero_legajo])

  // Debounced search - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange('search', localSearch || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, filters.search, onFilterChange])

  // Debounced NNyA name search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNnyaNombre !== (filters.nnya_nombre || '')) {
        onFilterChange('nnya_nombre', localNnyaNombre || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNnyaNombre, filters.nnya_nombre, onFilterChange])

  // Debounced NNyA DNI search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNnyaDni !== (filters.nnya_dni || '')) {
        onFilterChange('nnya_dni', localNnyaDni || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNnyaDni, filters.nnya_dni, onFilterChange])

  // Debounced legajo number search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNumeroLegajo !== (filters.numero_legajo || '')) {
        onFilterChange('numero_legajo', localNumeroLegajo || undefined)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localNumeroLegajo, filters.numero_legajo, onFilterChange])

  // Fetch catalog data
  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<Usuario[]>('users/')
  const usuarios = extractArray(usuariosData)

  const { data: tiposActividadData, isLoading: isLoadingTipos } = useCatalogData<TTipoActividad[]>(
    'tipos-actividad-plan-trabajo/?activo=true&page_size=500'
  )
  const tiposActividad = extractArray(tiposActividadData)

  const { data: zonasData, isLoading: isLoadingZonas } = useCatalogData<Zona[]>('zonas/')
  const zonas = extractArray(zonasData)

  // Parse estado values from comma-separated string
  const selectedEstados = filters.estado ? filters.estado.split(',').filter(Boolean) : []

  // Handle estado toggle
  const handleEstadoToggle = (estadoValue: string) => {
    const currentEstados = new Set(selectedEstados)
    if (currentEstados.has(estadoValue)) {
      currentEstados.delete(estadoValue)
    } else {
      currentEstados.add(estadoValue)
    }
    onFilterChange('estado', Array.from(currentEstados).join(','))
  }

  // Count active advanced filters
  const advancedFilterCount = [
    filters.nnya_nombre,
    filters.nnya_dni,
    filters.numero_legajo,
    filters.tipo_medida,
    filters.responsable,
    filters.tipo_actividad,
    filters.zona,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.fecha_creacion_desde,
    filters.fecha_creacion_hasta,
    filters.vencida,
    filters.pendiente_visado,
    filters.es_borrador,
    filters.dias_restantes_max,
  ].filter(Boolean).length

  const getUserDisplayName = (user: Usuario) => {
    return user.nombre_completo || `${user.first_name} ${user.last_name}`.trim() || user.username
  }

  // Prevent form submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mb: 3 }}>
        {/* Primary Filters - Always Visible */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar (descripción, tipo, NNyA, legajo, responsable)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: localSearch && localSearch !== (filters.search || '') ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      ...
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Actor - only show if user can see all actors */}
          {canSeeAllActors && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={filters.actor || ''}
                  onChange={(e) => onFilterChange('actor', e.target.value)}
                  label="Equipo"
                >
                  {ACTOR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Origen */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Origen</InputLabel>
              <Select
                value={filters.origen || ''}
                onChange={(e) => onFilterChange('origen', e.target.value)}
                label="Origen"
              >
                {ORIGEN_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Ordering */}
          <Grid item xs={12} sm={6} md={canSeeAllActors ? 2 : 3}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.ordering || '-fecha_creacion'}
                onChange={(e) => onFilterChange('ordering', e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="-fecha_creacion">Más recientes</MenuItem>
                <MenuItem value="fecha_creacion">Más antiguos</MenuItem>
                <MenuItem value="fecha_planificacion">Fecha planificada (asc)</MenuItem>
                <MenuItem value="-fecha_planificacion">Fecha planificada (desc)</MenuItem>
                <MenuItem value="dias_restantes">Plazo más urgente</MenuItem>
                <MenuItem value="-dias_restantes">Plazo más lejano</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Advanced Filters Toggle */}
          <Grid item xs={12} sm={6} md={canSeeAllActors ? 2 : 3}>
            <Button
              type="button"
              fullWidth
              variant={expanded ? 'contained' : 'outlined'}
              color={advancedFilterCount > 0 ? 'primary' : 'inherit'}
              startIcon={<FilterListIcon />}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpanded(!expanded)}
              sx={{ height: 40 }}
            >
              Filtros {advancedFilterCount > 0 && `(${advancedFilterCount})`}
            </Button>
          </Grid>
        </Grid>

        {/* Estado Multi-Select Chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Filtrar por estado (clic para activar/desactivar):
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {ESTADO_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                size="small"
                onClick={() => handleEstadoToggle(opt.value)}
                variant={selectedEstados.includes(opt.value) ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: selectedEstados.includes(opt.value) ? opt.color : 'transparent',
                  color: selectedEstados.includes(opt.value) ? 'white' : 'text.primary',
                  borderColor: opt.color,
                  '&:hover': {
                    backgroundColor: selectedEstados.includes(opt.value)
                      ? opt.color
                      : `${opt.color}20`,
                  },
                }}
              />
            ))}
            {selectedEstados.length > 0 && (
              <Chip
                label="Limpiar estados"
                size="small"
                variant="outlined"
                onDelete={() => onFilterChange('estado', '')}
                deleteIcon={<ClearIcon />}
              />
            )}
          </Box>
        </Box>

        {/* Advanced Filters Panel */}
        <Collapse in={expanded}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              {/* Section: NNyA & Legajo - Only for global variant */}
              {showNnyaLegajoSection && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ChildCareIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        NNyA y Legajo
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre NNyA"
                      placeholder="Buscar por nombre/apellido..."
                      value={localNnyaNombre}
                      onChange={(e) => setLocalNnyaNombre(e.target.value)}
                      onKeyDown={handleKeyDown}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="DNI NNyA"
                      placeholder="Buscar por DNI..."
                      value={localNnyaDni}
                      onChange={(e) => setLocalNnyaDni(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Número de Legajo"
                      placeholder="Ej: LEG-2024-001"
                      value={localNumeroLegajo}
                      onChange={(e) => setLocalNumeroLegajo(e.target.value)}
                      onKeyDown={handleKeyDown}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FolderIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Medida</InputLabel>
                      <Select
                        value={filters.tipo_medida || ''}
                        onChange={(e) => onFilterChange('tipo_medida', e.target.value)}
                        label="Tipo de Medida"
                      >
                        {TIPO_MEDIDA_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                </>
              )}

              {/* Section: Responsable & Activity Type */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CategoryIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Responsable y Tipo de Actividad
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => getUserDisplayName(option)}
                  value={usuarios.find((u) => u.id === filters.responsable) || null}
                  onChange={(_, newValue) => onFilterChange('responsable', newValue?.id || undefined)}
                  loading={isLoadingUsuarios}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Responsable (principal o secundario)"
                      placeholder="Buscar usuario..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={tiposActividad}
                  getOptionLabel={(option) => option.nombre}
                  value={tiposActividad.find((t) => t.id === filters.tipo_actividad) || null}
                  onChange={(_, newValue) => onFilterChange('tipo_actividad', newValue?.id || undefined)}
                  loading={isLoadingTipos}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Tipo de Actividad"
                      placeholder="Buscar tipo..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={zonas}
                  getOptionLabel={(option) => option.nombre}
                  value={zonas.find((z) => z.id === filters.zona) || null}
                  onChange={(_, newValue) => onFilterChange('zona', newValue?.id || undefined)}
                  loading={isLoadingZonas}
                  renderInput={(params) => (
                    <TextField {...params} size="small" label="Zona" placeholder="Buscar zona..." />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Section: Date Ranges */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Rangos de Fecha
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha planificada desde"
                  value={filters.fecha_desde ? new Date(filters.fecha_desde) : null}
                  onChange={(date) =>
                    onFilterChange('fecha_desde', date ? date.toISOString().split('T')[0] : undefined)
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha planificada hasta"
                  value={filters.fecha_hasta ? new Date(filters.fecha_hasta) : null}
                  onChange={(date) =>
                    onFilterChange('fecha_hasta', date ? date.toISOString().split('T')[0] : undefined)
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha creación desde"
                  value={filters.fecha_creacion_desde ? new Date(filters.fecha_creacion_desde) : null}
                  onChange={(date) =>
                    onFilterChange(
                      'fecha_creacion_desde',
                      date ? date.toISOString().split('T')[0] : undefined
                    )
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha creación hasta"
                  value={filters.fecha_creacion_hasta ? new Date(filters.fecha_creacion_hasta) : null}
                  onChange={(date) =>
                    onFilterChange(
                      'fecha_creacion_hasta',
                      date ? date.toISOString().split('T')[0] : undefined
                    )
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Section: Additional Filters */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FilterListIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Filtros Adicionales
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Días restantes máximo"
                  type="number"
                  placeholder="Ej: 7"
                  value={filters.dias_restantes_max || ''}
                  onChange={(e) => onFilterChange('dias_restantes_max', e.target.value)}
                  onKeyDown={handleKeyDown}
                  helperText="Mostrar actividades con plazo <= días"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={9}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.vencida === true || filters.vencida === 'true'}
                        onChange={(e) =>
                          onFilterChange('vencida', e.target.checked ? true : undefined)
                        }
                        color="error"
                      />
                    }
                    label={
                      <Typography variant="body2" color="error.main">
                        Solo vencidas
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          filters.pendiente_visado === true || filters.pendiente_visado === 'true'
                        }
                        onChange={(e) =>
                          onFilterChange('pendiente_visado', e.target.checked ? true : undefined)
                        }
                        color="secondary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="secondary.main">
                        Pendientes de visado
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.es_borrador === true}
                        onChange={(e) =>
                          onFilterChange('es_borrador', e.target.checked ? true : undefined)
                        }
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2" color="warning.main">
                        Solo borradores
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              {/* Clear All Filters Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={onClearFilters}
                    size="small"
                  >
                    Limpiar todos los filtros
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>
    </LocalizationProvider>
  )
}

export default AdvancedFiltersPanel
