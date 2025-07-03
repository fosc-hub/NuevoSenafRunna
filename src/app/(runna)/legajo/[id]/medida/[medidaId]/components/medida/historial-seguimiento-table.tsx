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
    Chip,
    IconButton
} from "@mui/material"
import AttachFileIcon from "@mui/icons-material/AttachFile"

interface SeguimientoItem {
    fecha: string
    etapa: string
    tipoActividad: string
    cantidad: number
    estado: string
    adjuntos: boolean
}

interface HistorialSeguimientoTableProps {
    items?: SeguimientoItem[]
}

const mockData: SeguimientoItem[] = [
    {
        fecha: "12/05/2023",
        etapa: "Hello World",
        tipoActividad: "Visita",
        cantidad: 3,
        estado: "Completado",
        adjuntos: true
    },
    {
        fecha: "28/04/2023",
        etapa: "Hello World",
        tipoActividad: "Llamada",
        cantidad: 1,
        estado: "Pendiente",
        adjuntos: true
    },
    {
        fecha: "15/04/2023",
        etapa: "Apertura",
        tipoActividad: "Informe jurídico",
        cantidad: 2,
        estado: "Finalizado",
        adjuntos: true
    },
    {
        fecha: "02/04/2023",
        etapa: "Apertura",
        tipoActividad: "Nota de abajo",
        cantidad: 5,
        estado: "Cancelado",
        adjuntos: true
    },
    {
        fecha: "20/03/2023",
        etapa: "Apertura",
        tipoActividad: "Informe técnico",
        cantidad: 1,
        estado: "Completado",
        adjuntos: true
    }
]

export const HistorialSeguimientoTable: React.FC<HistorialSeguimientoTableProps> = ({
    items = mockData
}) => {
    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
                return 'success'
            case 'finalizado':
                return 'info'
            case 'pendiente':
                return 'warning'
            case 'cancelado':
                return 'error'
            default:
                return 'default'
        }
    }

    return (
        <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Historial de Seguimiento
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Etapa</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Tipo de Actividad</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Cantidad</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Adjuntos</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{item.fecha}</TableCell>
                                    <TableCell>{item.etapa}</TableCell>
                                    <TableCell>{item.tipoActividad}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{item.cantidad}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.estado}
                                            color={getEstadoColor(item.estado)}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {item.adjuntos && (
                                            <IconButton size="small" color="primary">
                                                <AttachFileIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>
    )
} 