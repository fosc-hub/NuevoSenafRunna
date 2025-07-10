"use client"

import type React from "react"
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip
} from "@mui/material"

interface OtrasIntervencionesSectionProps {
    onAgregarIntervencion: () => void
}

export const OtrasIntervencionesSection: React.FC<OtrasIntervencionesSectionProps> = ({
    onAgregarIntervencion
}) => {
    const mockInterventions = [
        {
            id: 1,
            userName: "UserName",
            date: "12/12/2025",
            rating: 5,
            text: "Observación de la intervención"
        },
        {
            id: 2,
            userName: "UserName",
            date: "12/12/2025",
            rating: 5,
            text: "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
        },
        {
            id: 3,
            userName: "UserName",
            date: "12/12/2025",
            rating: 5,
            text: "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
        }
    ]

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        Otras intervenciones
                    </Typography>
                    <Chip label="En revisión" color="secondary" size="small" />
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onAgregarIntervencion}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Agregar intervención
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                texto: 1
            </Typography>

            {/* Intervention Cards */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {mockInterventions.map((intervention) => (
                    <Paper
                        key={intervention.id}
                        elevation={1}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        backgroundColor: "primary.main",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                                        U
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {intervention.userName}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography variant="caption" color="text.secondary">
                                    {intervention.date}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                    {intervention.rating}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {intervention.text}
                        </Typography>
                    </Paper>
                ))}
            </Box>
        </Paper>
    )
} 