"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper, LinearProgress } from "@mui/material"

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
            <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 600, mb: 3 }}>
                MPE
            </Typography>

            {/* Estado de Medida Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Estado de Medida
                </Typography>

                {/* Status Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    <Chip
                        label="Inicial"
                        color={getChipColor(estados.inicial)}
                        variant={getChipVariant(estados.inicial)}
                        size="small"
                    />
                    <Chip
                        label="Apertura"
                        color={getChipColor(estados.apertura)}
                        variant={getChipVariant(estados.apertura)}
                        size="small"
                    />
                    <Chip
                        label={`Innovación ${estados.innovacion}`}
                        color={getChipColor(false, estados.innovacion)}
                        variant={getChipVariant(false, estados.innovacion)}
                        size="small"
                    />
                    <Chip
                        label={`Prórroga ${estados.prorroga}`}
                        color={getChipColor(false, estados.prorroga)}
                        variant={getChipVariant(false, estados.prorroga)}
                        size="small"
                    />
                    <Chip
                        label={`Cambio de lugar de resguardo ${estados.cambio_lugar}`}
                        color={getChipColor(false, estados.cambio_lugar)}
                        variant={getChipVariant(false, estados.cambio_lugar)}
                        size="small"
                    />
                    <Chip
                        label="Seguimiento Intervención"
                        color="success"
                        variant={estados.seguimiento_intervencion ? "filled" : "outlined"}
                        size="small"
                    />
                    <Chip
                        label="Cese"
                        color={getChipColor(estados.cese)}
                        variant={getChipVariant(estados.cese)}
                        size="small"
                    />
                    <Chip
                        label="Post Cese"
                        color={getChipColor(estados.post_cese)}
                        variant={getChipVariant(estados.post_cese)}
                        size="small"
                    />
                </Box>

                {/* Information Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: "bold" }}>
                                Fecha: {medidaData.fecha}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
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
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
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
                        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                            Iniciada {progreso.iniciada}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                            En seguimiento {progreso.en_seguimiento}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                            Cierre {progreso.cierre}%
                        </Typography>
                    </Box>

                    {/* Main Progress Bar */}
                    <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", height: 40 }}>
                        <Box
                            sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.iniciada}%`,
                                backgroundColor: "#e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                Iniciada {progreso.iniciada}%
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                position: "absolute",
                                left: `${progreso.iniciada}%`,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.en_seguimiento}%`,
                                backgroundColor: "#4db6ac",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500, color: "white" }}>
                                En seguimiento {progreso.en_seguimiento}%
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: `${progreso.cierre}%`,
                                backgroundColor: "#ff8a65",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                Cierre {progreso.cierre}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Total Progress */}
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{
                            backgroundColor: "#4db6ac",
                            height: 40,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${progreso.total}%`,
                                    backgroundColor: "#4db6ac",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: `${progreso.total}%`,
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: "#ff8a65",
                                }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: "white", zIndex: 1 }}>
                                {progreso.total}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Action Button */}
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: "#5c6bc0",
                        color: "white",
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        "&:hover": {
                            backgroundColor: "#3f51b5",
                        },
                    }}
                >
                    Carga para residencias
                </Button>
            </Box>
        </Paper>
    )
} 