"use client"

import type React from "react"
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    TablePagination,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Tooltip
} from "@mui/material"
import { useState, useEffect } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import CancelIcon from "@mui/icons-material/Cancel"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import { PlanAccionModal } from "../plan-accion-modal"
import { ActividadDetailModal } from "../ActividadDetailModal"
import { EditActividadModal } from "../EditActividadModal"
import { CancelActividadModal } from "../CancelActividadModal"
import AsignarActividadModal from "../AsignarActividadModal"
import { ActividadStatistics } from "../ActividadStatistics"
import { ResponsablesAvatarGroup } from "../ResponsablesAvatarGroup"
import { DeadlineIndicator } from "../DeadlineIndicator"
import { QuickFilterChips } from "../QuickFilterChips"
import { actividadService } from "../../../services/actividadService"
import type { TActividadPlanTrabajo, ActividadFilters } from "../../../types/actividades"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import TimelineIcon from "@mui/icons-material/Timeline"

interface PlanTrabajoTabProps {
    medidaData: any
    planTrabajoId: number
    filterEtapa?: 'APERTURA' | 'PROCESO' | 'CESE'
}

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({ medidaData, planTrabajoId, filterEtapa }) => {
    const [actividades, setActividades] = useState<TActividadPlanTrabajo[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    // Modals
    const [planAccionModalOpen, setPlanAccionModalOpen] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [asignarModalOpen, setAsignarModalOpen] = useState(false)
    const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

    // Filters
    const [filters, setFilters] = useState<ActividadFilters>({
        estado: '',
        search: ''
    })

    useEffect(() => {
        loadActividades()
    }, [page, rowsPerPage, filters, planTrabajoId])

    const loadActividades = async () => {
        setLoading(true)
        try {
            const response = await actividadService.list(planTrabajoId, {
                ...filters,
                ordering: '-fecha_creacion'
            })

            console.log('API Response:', response)

            // Handle both paginated response and direct array response
            if (Array.isArray(response)) {
                // Direct array response
                setActividades(response)
                setTotalCount(response.length)
            } else {
                // Paginated response
                setActividades(response.results || [])
                setTotalCount(response.count || 0)
            }
        } catch (error) {
            console.error('Error loading activities:', error)
            setActividades([]) // Ensure actividades is always an array
            setTotalCount(0)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const getEstadoColor = (estado: string) => {
        const colors: Record<string, any> = {
            'PENDIENTE': { backgroundColor: '#ff9800', color: 'white' },
            'EN_PROGRESO': { backgroundColor: '#2196f3', color: 'white' },
            'REALIZADA': { backgroundColor: '#4caf50', color: 'white' },
            'CANCELADA': { backgroundColor: '#f44336', color: 'white' },
            'VENCIDA': { backgroundColor: '#9e9e9e', color: 'white' }
        }
        return colors[estado] || { backgroundColor: '#9e9e9e', color: 'white' }
    }

    const handleViewDetail = (actividad: TActividadPlanTrabajo) => {
        setSelectedActividad(actividad)
        setDetailModalOpen(true)
    }

    const handleEdit = (actividad: TActividadPlanTrabajo) => {
        setSelectedActividad(actividad)
        setEditModalOpen(true)
    }

    const handleCancelActividad = (actividad: TActividadPlanTrabajo) => {
        setSelectedActividad(actividad)
        setCancelModalOpen(true)
    }

    const handleAsignar = (actividad: TActividadPlanTrabajo) => {
        setSelectedActividad(actividad)
        setAsignarModalOpen(true)
    }

    // Filter activities by etapa if filterEtapa prop is provided (MPJ)
    const filteredActividades = filterEtapa
        ? actividades.filter(actividad => actividad.tipo_actividad_info.etapa_medida_aplicable === filterEtapa)
        : actividades

    return (
        <>
            <Box sx={{ p: 3 }}>
                {/* Statistics Dashboard */}
                <ActividadStatistics actividades={filteredActividades} />

                <Paper elevation={2} sx={{ borderRadius: 2 }}>
                    {/* Header with Filters */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Plan de trabajo
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setPlanAccionModalOpen(true)}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Agregar actividad
                            </Button>
                        </Box>

                        {/* Quick Filter Chips */}
                        <QuickFilterChips
                            activeFilters={filters}
                            onFilterChange={setFilters}
                        />

                        {/* Filters */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Buscar"
                                    value={filters.search || ''}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={filters.estado || ''}
                                        onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                                        label="Estado"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                                        <MenuItem value="EN_PROGRESO">En Progreso</MenuItem>
                                        <MenuItem value="REALIZADA">Realizada</MenuItem>
                                        <MenuItem value="CANCELADA">Cancelada</MenuItem>
                                        <MenuItem value="VENCIDA">Vencida</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Cargando...</TableCell>
                                    </TableRow>
                                ) : !filteredActividades || filteredActividades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    No hay actividades en el plan de trabajo
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Comienza agregando tu primera actividad
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setPlanAccionModalOpen(true)}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    Agregar primera actividad
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredActividades.map((actividad) => (
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
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {actividad.tipo_actividad_info.nombre}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {actividad.subactividad}
                                                        </Typography>
                                                        {actividad.descripcion && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                                                {actividad.descripcion.length > 50
                                                                    ? `${actividad.descripcion.substring(0, 50)}...`
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
                                                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {actividad.es_borrador && (
                                                            <Chip
                                                                label="BORRADOR"
                                                                size="small"
                                                                variant="outlined"
                                                                color="warning"
                                                                sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {(actividad.adjuntos && actividad.adjuntos.length > 0) && (
                                                            <Tooltip
                                                                title={`Actividad registrada (${actividad.adjuntos.length} ${actividad.adjuntos.length === 1 ? 'archivo' : 'archivos'})`}
                                                                arrow
                                                            >
                                                                <Chip
                                                                    icon={<TimelineIcon fontSize="small" />}
                                                                    label={actividad.adjuntos.length}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="info"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <ResponsablesAvatarGroup
                                                    responsablePrincipal={actividad.responsable_principal_info}
                                                    responsablesSecundarios={actividad.responsables_secundarios_info}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(actividad.fecha_planificacion).toLocaleDateString('es-ES')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={actividad.estado_display}
                                                    sx={{
                                                        ...getEstadoColor(actividad.estado),
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <DeadlineIndicator
                                                    diasRestantes={actividad.dias_restantes}
                                                    estaVencida={actividad.esta_vencida}
                                                    estado={actividad.estado}
                                                    fechaPlanificacion={actividad.fecha_planificacion}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewDetail(actividad)}
                                                        title="Ver detalle"
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
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(actividad)}
                                                        disabled={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'}
                                                        title={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'
                                                            ? 'No se puede editar'
                                                            : 'Editar'}
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            '&:disabled': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                                color: 'rgba(0, 0, 0, 0.26)'
                                                            },
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCancelActividad(actividad)}
                                                        disabled={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'}
                                                        title={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'
                                                            ? 'No se puede cancelar'
                                                            : 'Cancelar'}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            '&:disabled': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                                color: 'rgba(0, 0, 0, 0.26)'
                                                            },
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAsignar(actividad)}
                                                        title="Asignar responsables"
                                                        sx={{
                                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                            color: 'info.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <AssignmentIndIcon fontSize="small" />
                                                    </IconButton>
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
                    />
                </Paper>
            </Box>

            {/* Modals */}
            <PlanAccionModal
                open={planAccionModalOpen}
                onClose={() => setPlanAccionModalOpen(false)}
                planTrabajoId={planTrabajoId}
                onSuccess={loadActividades}
                filterEtapa={filterEtapa}
            />

            {selectedActividad && (
                <>
                    <ActividadDetailModal
                        open={detailModalOpen}
                        onClose={() => {
                            setDetailModalOpen(false)
                            setSelectedActividad(null)
                        }}
                        actividad={selectedActividad}
                        onUpdate={loadActividades}
                    />

                    <EditActividadModal
                        open={editModalOpen}
                        onClose={() => {
                            setEditModalOpen(false)
                            setSelectedActividad(null)
                        }}
                        actividad={selectedActividad}
                        onSuccess={loadActividades}
                    />

                    <CancelActividadModal
                        open={cancelModalOpen}
                        onClose={() => {
                            setCancelModalOpen(false)
                            setSelectedActividad(null)
                        }}
                        actividadId={selectedActividad.id}
                        actividadNombre={`${selectedActividad.tipo_actividad_info.nombre} - ${selectedActividad.subactividad}`}
                        onSuccess={loadActividades}
                    />

                    <AsignarActividadModal
                        open={asignarModalOpen}
                        onClose={() => {
                            setAsignarModalOpen(false)
                            setSelectedActividad(null)
                        }}
                        actividadId={selectedActividad.id}
                        onSuccess={loadActividades}
                    />
                </>
            )}
        </>
    )
}
