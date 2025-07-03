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
    TablePagination
} from "@mui/material"
import { useState } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { PlanAccionModal } from "../plan-accion-modal"

interface PlanTrabajoTabProps {
    medidaData: any
}

interface Actividad {
    id: number
    nombre: string
    fechaPlazo: string
    estado: string
    cantidadIntervenciones: number
}

const mockActividades: Actividad[] = [
    {
        id: 1,
        nombre: "actividad 1",
        fechaPlazo: "12/12/2025",
        estado: "Realizada",
        cantidadIntervenciones: 3
    },
    {
        id: 2,
        nombre: "actividad 1",
        fechaPlazo: "12/12/2025",
        estado: "Realizada",
        cantidadIntervenciones: 2
    },
    {
        id: 3,
        nombre: "actividad 2",
        fechaPlazo: "15/12/2025",
        estado: "Pendiente",
        cantidadIntervenciones: 1
    },
    {
        id: 4,
        nombre: "actividad 3",
        fechaPlazo: "20/12/2025",
        estado: "En progreso",
        cantidadIntervenciones: 5
    }
]

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({ medidaData }) => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [actividades] = useState<Actividad[]>(mockActividades)
    const [planAccionModalOpen, setPlanAccionModalOpen] = useState<boolean>(false)

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'realizada':
                return { backgroundColor: '#4dd0e1', color: 'white' }
            case 'pendiente':
                return { backgroundColor: '#ff9800', color: 'white' }
            case 'en progreso':
                return { backgroundColor: '#2196f3', color: 'white' }
            default:
                return { backgroundColor: '#9e9e9e', color: 'white' }
        }
    }

    return (
        <>
            <Box sx={{ p: 3 }}>
                <Paper elevation={2} sx={{ borderRadius: 2 }}>
                    {/* Header */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 3,
                        pb: 0
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Plan de trabajo
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setPlanAccionModalOpen(true)}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                            }}
                        >
                            Agregar actividad
                        </Button>
                    </Box>

                    {/* Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}>
                                        Actividades planificadas
                                    </TableCell>
                                    <TableCell sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}>
                                        Fecha de plazo
                                    </TableCell>
                                    <TableCell sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}>
                                        Estado
                                    </TableCell>
                                    <TableCell sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        textAlign: 'center'
                                    }}>
                                        Cantidad intervenciones
                                    </TableCell>
                                    <TableCell sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        textAlign: 'center'
                                    }}>
                                        Botones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {actividades
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((actividad) => (
                                        <TableRow key={actividad.id} hover>
                                            <TableCell>{actividad.nombre}</TableCell>
                                            <TableCell>{actividad.fechaPlazo}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={actividad.estado}
                                                    sx={{
                                                        ...getEstadoColor(actividad.estado),
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                                        }
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <ArrowBackIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={actividades.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Rows per page:"
                        sx={{
                            '.MuiTablePagination-toolbar': {
                                paddingLeft: 2,
                                paddingRight: 2,
                            },
                        }}
                    />
                </Paper>
            </Box>

            {/* Plan de Acción Modal */}
            <PlanAccionModal
                open={planAccionModalOpen}
                onClose={() => setPlanAccionModalOpen(false)}
            />
        </>
    )
} 