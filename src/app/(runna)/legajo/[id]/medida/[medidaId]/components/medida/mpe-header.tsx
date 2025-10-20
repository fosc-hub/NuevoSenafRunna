"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper, LinearProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { ResidenciasTab } from "./mpe-tabs/residencias-tab"
import { useState } from "react"

interface MPEHeaderProps {
    medidaData: {
        numero: string
        fecha: string
        juzgado: string
        fecha_resguardo: string
        lugar_resguardo: string
        origen_demanda: string
        zona_trabajo: string
        zona_centro_vida: string
        articulacion_local: boolean
        persona: {
            nombre: string
        }
        ubicacion: string
        numero_sac: string
        equipos: string
        articulacion_area_local: boolean
        urgencia?: string
        estado_actual?: string
    }
    estados: {
        inicial: boolean
        apertura: boolean
        innovacion: number
        prorroga: number
        cambio_lugar: number
        seguimiento_intervencion: boolean
        cese: boolean
        post_cese: boolean
    }
    progreso: {
        iniciada: number
        en_seguimiento: number
        cierre: number
        total: number
    }
}

export const MPEHeader: React.FC<MPEHeaderProps> = ({ medidaData, estados, progreso }) => {
    const theme = useTheme();
    const [residenciasModalOpen, setResidenciasModalOpen] = useState(false);
    const getChipColor = (active: boolean, count?: number) => {
        if (count !== undefined) {
            return count > 0 ? "primary" : "default"
        }
        return active ? "primary" : "default"
    }

    const getChipVariant = (active: boolean, count?: number) => {
        if (count !== undefined) {
            return count > 0 ? "filled" : "outlined"
        }
        return active ? "filled" : "outlined"
    }

    return (
        <Paper
            elevation={2}
            sx={{
                width: "100%",
                mb: 4,
                p: 3,
                borderRadius: 2,
            }}
        >
            {/* MPE Title */}
            <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 600, mb: 3, color: "primary.main" }}>
                MPE
            </Typography>

            {/* Estado de Medida Section */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        Estado de Medida
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {medidaData.urgencia && (
                            <Chip
                                label={`Urgencia: ${medidaData.urgencia}`}
                                color="error"
                                size="small"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                        {medidaData.estado_actual && (
                            <Chip
                                label={medidaData.estado_actual}
                                color="info"
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    <Chip
                        label="Inicial"
                        color={getChipColor(estados.inicial)}
                        variant={getChipVariant(estados.inicial)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Apertura"
                        color={getChipColor(estados.apertura)}
                        variant={getChipVariant(estados.apertura)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Innovación ${estados.innovacion}`}
                        color={estados.innovacion > 0 ? "secondary" : "default"}
                        variant={estados.innovacion > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Prórroga ${estados.prorroga}`}
                        color={estados.prorroga > 0 ? "secondary" : "default"}
                        variant={estados.prorroga > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Cambio de lugar de resguardo ${estados.cambio_lugar}`}
                        color={estados.cambio_lugar > 0 ? "secondary" : "default"}
                        variant={estados.cambio_lugar > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Seguimiento Intervención"
                        color="success"
                        variant={estados.seguimiento_intervencion ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Cese"
                        color={getChipColor(estados.cese)}
                        variant={getChipVariant(estados.cese)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Post Cese"
                        color={getChipColor(estados.post_cese)}
                        variant={getChipVariant(estados.post_cese)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                {/* Information Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: "bold" }}>
                                Fecha: {medidaData.fecha}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "secondary.main" }}>
                                Juzgado: {medidaData.juzgado}
                            </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Fecha:</strong> {medidaData.fecha_resguardo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Lugar de resguardo:</strong> {medidaData.lugar_resguardo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Origen de la demanda:</strong> {medidaData.origen_demanda}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Zona Uder de Trabajo:</strong> {medidaData.zona_trabajo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Zona Uder centro de vida:</strong> {medidaData.zona_centro_vida}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Articulación con área local:</strong> {medidaData.articulacion_local ? "Sí" : "No"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { md: "right" } }}>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "primary.main" }}>
                                {medidaData.persona.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Ubicación del NNyA:</strong> {medidaData.ubicacion}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Número de Sac:</strong> {medidaData.numero_sac}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Equipos:</strong> {medidaData.equipos}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Articulación con área local:</strong> {medidaData.articulacion_area_local ? "Sí" : "No"}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Progress Section */}
                <Box sx={{ mb: 3 }}>
                    {/* Progress Labels */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "primary.main" }}>
                            Iniciada {progreso.iniciada}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "secondary.main" }}>
                            En seguimiento {progreso.en_seguimiento}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "warning.main" }}>
                            Cierre {progreso.cierre}%
                        </Typography>
                    </Box>

                    {/* Main Progress Bar */}
                    <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", height: 40, background: theme.palette.grey[200] }}>
                        {/* Iniciada */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.iniciada}%`,
                                backgroundColor: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500, color: "white" }}>
                                Iniciada {progreso.iniciada}%
                            </Typography>
                        </Box>
                        {/* En seguimiento */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: `${progreso.iniciada}%`,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.en_seguimiento}%`,
                                backgroundColor: "secondary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500, color: "white" }}>
                                En seguimiento {progreso.en_seguimiento}%
                            </Typography>
                        </Box>
                        {/* Cierre */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: `calc(${progreso.iniciada}% + ${progreso.en_seguimiento}%)`,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.cierre}%`,
                                backgroundColor: "warning.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 3
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500, color: "white" }}>
                                Cierre {progreso.cierre}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Total Progress */}
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progreso.total}
                            sx={{
                                height: 16,
                                borderRadius: 2,
                                backgroundColor: theme.palette.grey[300],
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: theme.palette.primary.main,
                                },
                            }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mt: 1, textAlign: "center" }}>
                            {progreso.total}%
                        </Typography>
                    </Box>
                </Box>

                {/* Action Button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setResidenciasModalOpen(true)}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "1rem"
                    }}
                >
                    Carga para residencias
                </Button>
            </Box>

            {/* Residencias Modal */}
            <Dialog
                open={residenciasModalOpen}
                onClose={() => setResidenciasModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '1.5rem',
                    position: 'relative',
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    Carga para Residencias
                    <IconButton
                        onClick={() => setResidenciasModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'grey.500',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, overflow: 'auto' }}>
                    <ResidenciasTab />
                </DialogContent>
            </Dialog>
        </Paper>
    )
} 