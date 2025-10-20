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
    Grid
} from "@mui/material"
import { useState, useEffect } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import CancelIcon from "@mui/icons-material/Cancel"
import { PlanAccionModal } from "../plan-accion-modal"
import { ActividadDetailModal } from "../ActividadDetailModal"
import { EditActividadModal } from "../EditActividadModal"
import { CancelActividadModal } from "../CancelActividadModal"
import { actividadService } from "../../../services/actividadService"
import type { TActividadPlanTrabajo, ActividadFilters } from "../../../types/actividades"

interface PlanTrabajoTabProps {
    medidaData: any
    planTrabajoId: number
}

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({ medidaData, planTrabajoId }) => {
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
    const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

    // Filters
    const [filters, setFilters] = useState<ActividadFilters>({
        estado: '',
        actor: '',
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

    return (
        <>
            <Box sx={{ p: 3 }}>
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

                        {/* Filters */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Buscar"
                                    value={filters.search || ''}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Actor</InputLabel>
                                    <Select
                                        value={filters.actor || ''}
                                        onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
                                        label="Actor"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="EQUIPO_TECNICO">Equipo Técnico</MenuItem>
                                        <MenuItem value="EQUIPOS_RESIDENCIALES">Equipos Residenciales</MenuItem>
                                        <MenuItem value="ADULTOS_INSTITUCION">Adultos/Institución</MenuItem>
                                        <MenuItem value="EQUIPO_LEGAL">Equipo Legal</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Tipo / Subactividad
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Actor
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Responsable
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Fecha Plan.
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Estado
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>
                                        Días Restantes
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', fontSize: '0.875rem', textAlign: 'center' }}>
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">Cargando...</TableCell>
                                    </TableRow>
                                ) : !actividades || actividades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No hay actividades</TableCell>
                                    </TableRow>
                                ) : (
                                    actividades.map((actividad) => (
                                        <TableRow
                                            key={actividad.id}
                                            hover
                                            sx={{
                                                backgroundColor: actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                                                    ? 'rgba(211, 47, 47, 0.08)'
                                                    : actividad.es_borrador
                                                    ? 'rgba(237, 108, 2, 0.08)'
                                                    : 'transparent',
                                                borderLeft: actividad.esta_vencida && actividad.estado === 'PENDIENTE'
                                                    ? '4px solid #d32f2f'
                                                    : actividad.es_borrador
                                                    ? '4px solid #ed6c02'
                                                    : '4px solid transparent'
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
                                                    </Box>
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
                                                </Box>
                                            </TableCell>
                                            <TableCell>{actividad.actor_display}</TableCell>
                                            <TableCell>{actividad.responsable_principal_info.full_name}</TableCell>
                                            <TableCell>
                                                {new Date(actividad.fecha_planificacion).toLocaleDateString('es-ES')}
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
                                                <Chip
                                                    label={actividad.esta_vencida
                                                        ? `Vencida hace ${Math.abs(actividad.dias_restantes)} días`
                                                        : actividad.dias_restantes <= 3 && actividad.estado === 'PENDIENTE'
                                                        ? `⚠️ ${actividad.dias_restantes} días`
                                                        : `${actividad.dias_restantes} días`
                                                    }
                                                    color={actividad.esta_vencida
                                                        ? 'error'
                                                        : actividad.dias_restantes <= 3 && actividad.estado === 'PENDIENTE'
                                                        ? 'warning'
                                                        : 'default'
                                                    }
                                                    size="small"
                                                    sx={{
                                                        fontWeight: (actividad.esta_vencida || actividad.dias_restantes <= 3) && actividad.estado === 'PENDIENTE'
                                                            ? 600
                                                            : 400
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewDetail(actividad)}
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: 'primary.main',
                                                            '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.2)' }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(actividad)}
                                                        disabled={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'}
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: 'primary.main',
                                                            '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.2)' },
                                                            '&:disabled': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCancelActividad(actividad)}
                                                        disabled={actividad.estado === 'REALIZADA' || actividad.estado === 'CANCELADA'}
                                                        color="error"
                                                        sx={{
                                                            '&:disabled': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                                                        }}
                                                    >
                                                        <CancelIcon fontSize="small" />
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
                </>
            )}
        </>
    )
}
