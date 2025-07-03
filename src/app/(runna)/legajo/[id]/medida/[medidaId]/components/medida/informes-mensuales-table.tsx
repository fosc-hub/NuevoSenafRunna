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
    IconButton,
    Button
} from "@mui/material"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { CompletarInformeModal } from "./completar-informe-modal"
import { useState } from "react"

interface InformeMensual {
    fecha: string
    numeroInforme: number
    estado: string
    adjuntos: boolean
}

interface InformesMensualesTableProps {
    informes?: InformeMensual[]
}

const mockData: InformeMensual[] = [
    {
        fecha: "12/05/2023",
        numeroInforme: 1,
        estado: "Completado",
        adjuntos: true
    },
    {
        fecha: "28/04/2023",
        numeroInforme: 2,
        estado: "Pendiente",
        adjuntos: true
    },
    {
        fecha: "20/03/2023",
        numeroInforme: 3,
        estado: "Completado",
        adjuntos: true
    }
]

export const InformesMensualesTable: React.FC<InformesMensualesTableProps> = ({
    informes = mockData
}) => {
    const [modalOpenIndex, setModalOpenIndex] = useState<number | null>(null)

    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'completado':
                return 'success'
            case 'pendiente':
                return 'warning'
            default:
                return 'default'
        }
    }

    return (
        <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Informes mensuales requeridos
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Número de informe</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Adjuntos</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Adjuntos</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {informes.map((informe, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{informe.fecha}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{informe.numeroInforme}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={informe.estado}
                                            color={getEstadoColor(informe.estado)}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {informe.adjuntos && (
                                            <IconButton size="small" color="primary">
                                                <AttachFileIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                minWidth: 120,
                                            }}
                                            onClick={() => setModalOpenIndex(index)}
                                        >
                                            Completar informe
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {modalOpenIndex !== null && (
                <CompletarInformeModal
                    open={modalOpenIndex !== null}
                    onClose={() => setModalOpenIndex(null)}
                />
            )}
        </Paper>
    )
} 