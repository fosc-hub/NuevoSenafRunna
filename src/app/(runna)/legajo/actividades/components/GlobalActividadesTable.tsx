"use client"

import React, { useState, useMemo, useCallback } from 'react'
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
  Grid,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Skeleton,
  Checkbox,
  Button,
  Collapse,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import RefreshIcon from '@mui/icons-material/Refresh'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import FolderIcon from '@mui/icons-material/Folder'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useUser } from '@/utils/auth/userZustand'

// Import services
import { globalActividadService, type GlobalActividadFilters } from '../services/globalActividadService'

// Import types from existing location
import type { TActividadPlanTrabajo } from '../../[id]/medida/[medidaId]/types/actividades'
import { getActorColor, ACTOR_LABELS } from '../../[id]/medida/[medidaId]/types/actividades'

// Import reusable components from existing location
import { ActividadDetailModal } from '../../[id]/medida/[medidaId]/components/medida/ActividadDetailModal'
import { ResponsablesAvatarGroup } from '../../[id]/medida/[medidaId]/components/medida/ResponsablesAvatarGroup'
import { DeadlineIndicator } from '../../[id]/medida/[medidaId]/components/medida/DeadlineIndicator'
import { useActorVisibility } from '../../[id]/medida/[medidaId]/hooks/useActorVisibility'
import BulkAsignarActividadModal from './BulkAsignarActividadModal'
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel'

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
  useUser() // For auth context
  const { actorFilter, canSeeAllActors } = useActorVisibility()

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

  // Acuse de Recibo state
  const [pendingAcuseActividad, setPendingAcuseActividad] = useState<TActividadPlanTrabajo | null>(null)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<number>>(() => {
    // Initialize from sessionStorage if available
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('acknowledgedActividades')
      if (stored) {
        try {
          return new Set(JSON.parse(stored))
        } catch {
          return new Set()
        }
      }
    }
    return new Set()
  })

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

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
  const { data: response, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['global-actividades', effectiveFilters],
    queryFn: () => globalActividadService.list(effectiveFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: keepPreviousData, // Keep showing old data while fetching new data
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

  const handleFilterChange = useCallback((key: keyof GlobalActividadFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0) // Reset to first page on filter change
  }, [])

  const handleClearFilters = () => {
    setFilters({
      search: '',
      estado: '',
      actor: '',
      origen: '',
      ordering: '-fecha_creacion',
      // Reset all advanced filters
      nnya_nombre: undefined,
      nnya_dni: undefined,
      numero_legajo: undefined,
      tipo_medida: undefined,
      responsable: undefined,
      tipo_actividad: undefined,
      zona: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
      fecha_creacion_desde: undefined,
      fecha_creacion_hasta: undefined,
      vencida: undefined,
      pendiente_visado: undefined,
      es_borrador: undefined,
      dias_restantes_max: undefined,
    })
    setPage(0)
  }

  // Check if activity requires acknowledgment before viewing
  const handleRequestViewDetail = (actividad: TActividadPlanTrabajo) => {
    if (acknowledgedIds.has(actividad.id)) {
      // Already acknowledged, open directly
      setSelectedActividad(actividad)
      setDetailModalOpen(true)
    } else {
      // Requires acknowledgment first
      setPendingAcuseActividad(actividad)
    }
  }

  // Handle acknowledgment confirmation
  const handleConfirmAcuse = () => {
    if (pendingAcuseActividad) {
      // Add to acknowledged set
      const newAcknowledged = new Set(acknowledgedIds)
      newAcknowledged.add(pendingAcuseActividad.id)
      setAcknowledgedIds(newAcknowledged)

      // Persist to sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('acknowledgedActividades', JSON.stringify([...newAcknowledged]))
      }

      // Open the detail modal
      setSelectedActividad(pendingAcuseActividad)
      setDetailModalOpen(true)
      setPendingAcuseActividad(null)
    }
  }

  // Handle acknowledgment cancel
  const handleCancelAcuse = () => {
    setPendingAcuseActividad(null)
  }

  // Direct view (for already acknowledged activities)
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

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.estado ||
    filters.actor ||
    filters.origen ||
    filters.nnya_nombre ||
    filters.nnya_dni ||
    filters.numero_legajo ||
    filters.tipo_medida ||
    filters.responsable ||
    filters.tipo_actividad ||
    filters.zona ||
    filters.fecha_desde ||
    filters.fecha_hasta ||
    filters.fecha_creacion_desde ||
    filters.fecha_creacion_hasta ||
    filters.vencida ||
    filters.pendiente_visado ||
    filters.es_borrador ||
    filters.dias_restantes_max
  )

  // Selection handlers for bulk operations
  const selectedActividades = useMemo(
    () => actividades.filter((a) => selectedIds.has(a.id)),
    [actividades, selectedIds]
  )

  const isAllSelected = useMemo(
    () => actividades.length > 0 && actividades.every((a) => selectedIds.has(a.id)),
    [actividades, selectedIds]
  )

  const isIndeterminate = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds, isAllSelected]
  )

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all visible
      const newSelected = new Set(selectedIds)
      actividades.forEach((a) => newSelected.delete(a.id))
      setSelectedIds(newSelected)
    } else {
      // Select all visible
      const newSelected = new Set(selectedIds)
      actividades.forEach((a) => newSelected.add(a.id))
      setSelectedIds(newSelected)
    }
  }

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleOpenBulkModal = () => {
    setBulkModalOpen(true)
  }

  const handleCloseBulkModal = () => {
    setBulkModalOpen(false)
  }

  const handleBulkSuccess = () => {
    setSelectedIds(new Set())
    setBulkModalOpen(false)
    refetch()
  }

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
      <Paper elevation={2} sx={{ borderRadius: 2, position: 'relative' }}>
        {/* Subtle loading indicator when fetching new data */}
        {isFetching && actividades.length > 0 && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderRadius: '8px 8px 0 0',
            }}
          />
        )}
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

          {/* Advanced Filters Panel */}
          <AdvancedFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            canSeeAllActors={canSeeAllActors}
          />
        </Box>

        {/* Bulk Actions Toolbar */}
        <Collapse in={selectedIds.size > 0}>
          <Box
            sx={{
              mx: 3,
              mb: 2,
              p: 2,
              bgcolor: 'primary.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckBoxIcon color="primary" />
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {selectedIds.size} {selectedIds.size === 1 ? 'actividad seleccionada' : 'actividades seleccionadas'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AssignmentIndIcon />}
                onClick={handleOpenBulkModal}
              >
                Asignar Responsables
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleClearSelection}
              >
                Cancelar Selección
              </Button>
            </Box>
          </Box>
        </Collapse>

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
                <TableCell padding="checkbox" sx={{ backgroundColor: 'primary.main' }}>
                  <Tooltip title={isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                      sx={{
                        color: 'white',
                        '&.Mui-checked': { color: 'white' },
                        '&.MuiCheckbox-indeterminate': { color: 'white' },
                      }}
                    />
                  </Tooltip>
                </TableCell>
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
              {isLoading && actividades.length === 0 ? (
                // Initial loading rows (only when no data yet)
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox"><Skeleton variant="rectangular" width={24} height={24} /></TableCell>
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
                  <TableCell colSpan={9} align="center">
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
                    selected={selectedIds.has(actividad.id)}
                    sx={{
                      backgroundColor: selectedIds.has(actividad.id)
                        ? 'rgba(156, 39, 176, 0.08)'
                        : actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                          ? 'rgba(211, 47, 47, 0.05)'
                          : actividad.es_borrador
                            ? 'rgba(237, 108, 2, 0.05)'
                            : 'transparent',
                      borderLeft: selectedIds.has(actividad.id)
                        ? '4px solid #9c27b0'
                        : actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                          ? '4px solid #d32f2f'
                          : actividad.es_borrador
                            ? '4px solid #ed6c02'
                            : '4px solid transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedIds.has(actividad.id)
                          ? 'rgba(156, 39, 176, 0.12)'
                          : actividad.esta_vencida
                            ? 'rgba(211, 47, 47, 0.08)'
                            : 'rgba(156, 39, 176, 0.04)'
                      }
                    }}
                    onClick={() => handleRequestViewDetail(actividad)}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(actividad.id)}
                        onChange={() => handleSelectOne(actividad.id)}
                        color="primary"
                      />
                    </TableCell>
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
                        {/* Acuse de Recibo / Ver Detalle Button */}
                        {acknowledgedIds.has(actividad.id) ? (
                          <Tooltip title="Ver detalle (ya confirmado)">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(actividad)}
                              sx={{
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                color: 'success.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Acuse de Recibo - Confirmar para ver">
                            <IconButton
                              size="small"
                              onClick={() => setPendingAcuseActividad(actividad)}
                              sx={{
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                color: 'warning.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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

      {/* Bulk Assignment Modal */}
      <BulkAsignarActividadModal
        open={bulkModalOpen}
        onClose={handleCloseBulkModal}
        selectedActividades={selectedActividades}
        onSuccess={handleBulkSuccess}
      />

      {/* Acuse de Recibo Dialog */}
      <Dialog
        open={!!pendingAcuseActividad}
        onClose={handleCancelAcuse}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            borderTop: '4px solid #ff9800',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon color="warning" />
          Acuse de Recibo
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Está a punto de acceder a la siguiente actividad:
          </DialogContentText>
          {pendingAcuseActividad && (
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
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {pendingAcuseActividad.tipo_actividad_info?.nombre || 'Sin tipo'}
              </Typography>
              {pendingAcuseActividad.subactividad && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {pendingAcuseActividad.subactividad}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                {pendingAcuseActividad.legajo_info && (
                  <Chip
                    size="small"
                    icon={<FolderIcon />}
                    label={`${pendingAcuseActividad.legajo_info.nnya_apellido}, ${pendingAcuseActividad.legajo_info.nnya_nombre}`}
                    variant="outlined"
                  />
                )}
                <Chip
                  size="small"
                  label={pendingAcuseActividad.estado_display || pendingAcuseActividad.estado}
                  sx={{
                    ...getEstadoColor(pendingAcuseActividad.estado),
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Paper>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            Al confirmar el acuse de recibo, quedará registrado que ha tomado conocimiento de esta actividad.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCancelAcuse}
            color="inherit"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAcuse}
            color="warning"
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
          >
            Confirmar Acuse de Recibo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
