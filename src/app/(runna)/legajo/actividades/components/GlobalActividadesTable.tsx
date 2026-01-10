"use client"

import React, { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  Skeleton
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import FolderIcon from '@mui/icons-material/Folder'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useUser } from '@/utils/auth/userZustand'

// Import services
import { globalActividadService, type GlobalActividadFilters } from '../services/globalActividadService'

// Import types from existing location
import type { TActividadPlanTrabajo, ActorEnum } from '../../[id]/medida/[medidaId]/types/actividades'
import { getActorColor, ACTOR_LABELS } from '../../[id]/medida/[medidaId]/types/actividades'

// Import reusable components from existing location
import { ActividadDetailModal } from '../../[id]/medida/[medidaId]/components/medida/ActividadDetailModal'
import { ResponsablesAvatarGroup } from '../../[id]/medida/[medidaId]/components/medida/ResponsablesAvatarGroup'
import { DeadlineIndicator } from '../../[id]/medida/[medidaId]/components/medida/DeadlineIndicator'
import { useActorVisibility } from '../../[id]/medida/[medidaId]/hooks/useActorVisibility'

// Estado options with display labels
const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROGRESO', label: 'En Progreso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'PENDIENTE_VISADO', label: 'Pendiente de Visado' },
  { value: 'VISADO_CON_OBSERVACION', label: 'Visado con Observaciones' },
  { value: 'VISADO_APROBADO', label: 'Visado Aprobado' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'VENCIDA', label: 'Vencida' }
]

// Actor options
const ACTOR_OPTIONS = [
  { value: '', label: 'Todos los equipos' },
  { value: 'EQUIPO_TECNICO', label: 'Equipo Técnico' },
  { value: 'EQUIPO_LEGAL', label: 'Equipo Legal' },
  { value: 'EQUIPOS_RESIDENCIALES', label: 'Equipos Residenciales' },
  { value: 'ADULTOS_INSTITUCION', label: 'Adultos/Institución' }
]

// Origen options
const ORIGEN_OPTIONS = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'MANUAL', label: 'Creación Manual' },
  { value: 'DEMANDA_PI', label: 'Demanda - Petición de Informe' },
  { value: 'DEMANDA_OFICIO', label: 'Demanda - Carga de Oficios' },
  { value: 'OFICIO', label: 'Oficio Judicial' }
]

// Get estado color for chip
const getEstadoColor = (estado: string): { backgroundColor: string; color: string } => {
  const colors: Record<string, { backgroundColor: string; color: string }> = {
    'PENDIENTE': { backgroundColor: '#ff9800', color: 'white' },
    'EN_PROGRESO': { backgroundColor: '#2196f3', color: 'white' },
    'COMPLETADA': { backgroundColor: '#4caf50', color: 'white' },
    'PENDIENTE_VISADO': { backgroundColor: '#9c27b0', color: 'white' },
    'VISADO_CON_OBSERVACION': { backgroundColor: '#ff5722', color: 'white' },
    'VISADO_APROBADO': { backgroundColor: '#009688', color: 'white' },
    'CANCELADA': { backgroundColor: '#f44336', color: 'white' },
    'VENCIDA': { backgroundColor: '#9e9e9e', color: 'white' }
  }
  return colors[estado] || { backgroundColor: '#9e9e9e', color: 'white' }
}

export const GlobalActividadesTable: React.FC = () => {
  const router = useRouter()
  const { user } = useUser()
  const { actorFilter, canSeeAllActors, isActorAllowed } = useActorVisibility()

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filter state
  const [filters, setFilters] = useState<GlobalActividadFilters>({
    search: '',
    estado: '',
    actor: '',
    origen: '',
    ordering: '-fecha_creacion'
  })

  // Modal state
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Build effective filters with actor restriction
  const effectiveFilters = useMemo(() => {
    const baseFilters: GlobalActividadFilters = {
      ...filters,
      page: page + 1, // API uses 1-indexed pages
      page_size: rowsPerPage
    }

    // Apply actor filter if user is restricted
    if (!canSeeAllActors && actorFilter) {
      baseFilters.actor = actorFilter
    } else if (filters.actor) {
      baseFilters.actor = filters.actor
    }

    return baseFilters
  }, [filters, page, rowsPerPage, actorFilter, canSeeAllActors])

  // Fetch activities
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['global-actividades', effectiveFilters],
    queryFn: () => globalActividadService.list(effectiveFilters),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Parse response
  const { actividades, totalCount } = useMemo(() => {
    if (!response) {
      return { actividades: [], totalCount: 0 }
    }

    if (Array.isArray(response)) {
      return { actividades: response, totalCount: response.length }
    }

    return {
      actividades: response.results || [],
      totalCount: response.count || 0
    }
  }, [response])

  // Statistics
  const statistics = useMemo(() => {
    const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length
    const enProgreso = actividades.filter(a => a.estado === 'EN_PROGRESO').length
    const vencidas = actividades.filter(a => a.esta_vencida && a.estado !== 'CANCELADA').length

    return { pendientes, enProgreso, vencidas, total: actividades.length }
  }, [actividades])

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (key: keyof GlobalActividadFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0) // Reset to first page on filter change
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      estado: '',
      actor: '',
      origen: '',
      ordering: '-fecha_creacion'
    })
    setPage(0)
  }

  const handleViewDetail = (actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setDetailModalOpen(true)
  }

  const handleGoToLegajo = (actividad: TActividadPlanTrabajo) => {
    // Use legajo_info and medida_info from the activity response directly
    if (actividad.legajo_info?.id && actividad.medida_info?.id) {
      // Navigate to the medida page within the legajo
      router.push(`/legajo/${actividad.legajo_info.id}/medida/${actividad.medida_info.id}`)
    } else {
      // If legajo/medida info is not available, open the detail modal
      console.warn('Legajo/medida info not available for activity', actividad.id)
      handleViewDetail(actividad)
    }
  }

  const hasActiveFilters = filters.search || filters.estado || filters.actor || filters.origen

  // Loading skeleton
  if (isLoading && actividades.length === 0) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} />
      </Paper>
    )
  }

  return (
    <>
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Mis Actividades
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las actividades asignadas a ti o a tu equipo
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {hasActiveFilters && (
                <Tooltip title="Limpiar filtros">
                  <IconButton onClick={handleClearFilters} size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Actualizar">
                <IconButton onClick={() => refetch()} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderLeft: '4px solid #ff9800'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {statistics.pendientes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderLeft: '4px solid #2196f3'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {statistics.enProgreso}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En Progreso
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: statistics.vencidas > 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                borderLeft: `4px solid ${statistics.vencidas > 0 ? '#f44336' : '#4caf50'}`
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: statistics.vencidas > 0 ? '#f44336' : '#4caf50' }}>
                  {statistics.vencidas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vencidas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderLeft: '4px solid #9c27b0'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Filters */}
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar actividades..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  label="Estado"
                >
                  {ESTADO_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Actor - only show if user can see all actors */}
            {canSeeAllActors && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Equipo</InputLabel>
                  <Select
                    value={filters.actor || ''}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                    label="Equipo"
                  >
                    {ACTOR_OPTIONS.map(opt => (
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
                  onChange={(e) => handleFilterChange('origen', e.target.value)}
                  label="Origen"
                >
                  {ORIGEN_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ordering */}
            <Grid item xs={12} sm={6} md={canSeeAllActors ? 3 : 5}>
              <FormControl fullWidth size="small">
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filters.ordering || '-fecha_creacion'}
                  onChange={(e) => handleFilterChange('ordering', e.target.value)}
                  label="Ordenar por"
                >
                  <MenuItem value="-fecha_creacion">Más recientes primero</MenuItem>
                  <MenuItem value="fecha_creacion">Más antiguos primero</MenuItem>
                  <MenuItem value="fecha_planificacion">Fecha planificada (asc)</MenuItem>
                  <MenuItem value="-fecha_planificacion">Fecha planificada (desc)</MenuItem>
                  <MenuItem value="estado">Estado (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
            Error al cargar las actividades. Por favor intenta nuevamente.
          </Alert>
        )}

        {/* Table */}
        <TableContainer>
          <Table sx={{ '& .MuiTableRow-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
            <TableHead>
              <TableRow sx={{
                backgroundColor: 'primary.main',
                '& .MuiTableCell-root': { position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'primary.main' }
              }}>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Tipo / Subactividad
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  NNyA / Legajo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Equipo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Responsables
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Fecha Plan.
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                  Plazo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem', textAlign: 'center' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Loading rows
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={100} height={24} /></TableCell>
                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                  </TableRow>
                ))
              ) : actividades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <FilterListIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {hasActiveFilters
                          ? 'No se encontraron actividades con los filtros aplicados'
                          : 'No tienes actividades asignadas'
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hasActiveFilters
                          ? 'Intenta modificar los filtros para ver más resultados'
                          : 'Las actividades asignadas a ti aparecerán aquí'
                        }
                      </Typography>
                      {hasActiveFilters && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label="Limpiar filtros"
                            onClick={handleClearFilters}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                actividades.map((actividad) => (
                  <TableRow
                    key={actividad.id}
                    hover
                    sx={{
                      backgroundColor: actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                        ? 'rgba(211, 47, 47, 0.05)'
                        : actividad.es_borrador
                          ? 'rgba(237, 108, 2, 0.05)'
                          : 'transparent',
                      borderLeft: actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                        ? '4px solid #d32f2f'
                        : actividad.es_borrador
                          ? '4px solid #ed6c02'
                          : '4px solid transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: actividad.esta_vencida ? 'rgba(211, 47, 47, 0.08)' : 'rgba(156, 39, 176, 0.04)'
                      }
                    }}
                    onClick={() => handleViewDetail(actividad)}
                  >
                    {/* Tipo / Subactividad */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {actividad.tipo_actividad_info?.nombre || 'Sin tipo'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actividad.subactividad}
                          </Typography>
                          {actividad.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                            >
                              {actividad.descripcion.length > 40
                                ? `${actividad.descripcion.substring(0, 40)}...`
                                : actividad.descripcion}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                          {actividad.esta_vencida && actividad.estado === 'PENDIENTE' && (
                            <Chip
                              label="VENCIDA"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                            />
                          )}
                          {actividad.es_borrador && (
                            <Chip
                              label="BORRADOR"
                              size="small"
                              variant="outlined"
                              color="warning"
                              sx={{ fontWeight: 500, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* NNyA / Legajo */}
                    <TableCell>
                      {actividad.legajo_info ? (
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {actividad.legajo_info.nnya_apellido}, {actividad.legajo_info.nnya_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actividad.legajo_info.numero}
                          </Typography>
                          {actividad.medida_info && (
                            <Chip
                              label={actividad.medida_info.tipo_medida}
                              size="small"
                              sx={{
                                ml: 1,
                                fontSize: '0.65rem',
                                height: 18,
                                backgroundColor: actividad.medida_info.estado_vigencia === 'VIGENTE'
                                  ? 'rgba(76, 175, 80, 0.1)'
                                  : 'rgba(158, 158, 158, 0.1)',
                                color: actividad.medida_info.estado_vigencia === 'VIGENTE'
                                  ? '#388e3c'
                                  : '#757575'
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin información
                        </Typography>
                      )}
                    </TableCell>

                    {/* Equipo (Actor) */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Chip
                        label={actividad.actor_display || ACTOR_LABELS[actividad.actor] || actividad.actor}
                        size="small"
                        sx={{
                          backgroundColor: getActorColor(actividad.actor),
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>

                    {/* Responsables */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ResponsablesAvatarGroup
                        responsablePrincipal={actividad.responsable_principal_info}
                        responsablesSecundarios={actividad.responsables_secundarios_info}
                      />
                    </TableCell>

                    {/* Fecha Planificación */}
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(actividad.fecha_planificacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Typography>
                    </TableCell>

                    {/* Estado */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Chip
                        label={actividad.estado_display || actividad.estado}
                        sx={{
                          ...getEstadoColor(actividad.estado),
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
                    </TableCell>

                    {/* Plazo */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DeadlineIndicator
                        diasRestantes={actividad.dias_restantes}
                        estaVencida={actividad.esta_vencida}
                        estado={actividad.estado}
                        fechaPlanificacion={actividad.fecha_planificacion}
                      />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(actividad)}
                            sx={{
                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={actividad.legajo_info ? `Ir al legajo ${actividad.legajo_info.numero}` : 'Ir al legajo'}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGoToLegajo(actividad)
                            }}
                            disabled={!actividad.legajo_info || !actividad.medida_info}
                            sx={{
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              color: 'info.main',
                              '&:hover': {
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              '&:disabled': {
                                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <FolderIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Detail Modal */}
      {selectedActividad && (
        <ActividadDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedActividad(null)
          }}
          actividad={selectedActividad}
          onUpdate={() => refetch()}
        />
      )}
    </>
  )
}
