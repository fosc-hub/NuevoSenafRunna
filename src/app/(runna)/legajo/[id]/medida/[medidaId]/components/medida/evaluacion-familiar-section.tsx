"use client"

import type React from "react"
import { Typography, Button, Box, Chip } from "@mui/material"
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import { SectionCard } from "./section-card"

interface EvaluacionFamiliarSectionProps {
    data: {
        estado: string
        fecha_inicio: string
        fecha_finalizacion: string
        equipo_evaluador: string
        observaciones: string
    }
    isActive: boolean
    onEdit: () => void
    onStartEvaluation: () => void
}

export const EvaluacionFamiliarSection: React.FC<EvaluacionFamiliarSectionProps> = ({
    data,
    isActive,
    onEdit,
    onStartEvaluation,
}) => {
    const hasEvaluation = data.estado && data.estado !== ""
    const isCompleted = data.estado === "Finalizada"
    const isInProgress = data.estado === "En curso"

    return (
        <SectionCard
            title="Evaluación Familiar"
            icon={<FamilyRestroomIcon color="primary" />}
            isActive={isActive}
            isCompleted={hasEvaluation}
        >
            {hasEvaluation ? (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Chip
                            label={data.estado}
                            size="small"
                            color={isCompleted ? "success" : isInProgress ? "warning" : "default"}
                            sx={{ fontWeight: 500 }}
                        />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Fecha de inicio:</strong> {data.fecha_inicio}
                    </Typography>

                    {data.fecha_finalizacion && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Fecha de finalización:</strong> {data.fecha_finalizacion}
                        </Typography>
                    )}

                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Equipo evaluador:</strong> {data.equipo_evaluador || "No especificado"}
                    </Typography>

                    {data.observaciones && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: "rgba(25, 118, 210, 0.04)", borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Observaciones:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {data.observaciones}
                            </Typography>
                        </Box>
                    )}

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        sx={{
                            borderRadius: 8,
                            textTransform: "none",
                            px: 3,
                            mt: 2,
                            "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                            },
                        }}
                    >
                        Editar evaluación
                    </Button>
                </Box>
            ) : (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                        No se ha iniciado la evaluación familiar
                    </Typography>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onStartEvaluation}
                        sx={{
                            borderRadius: 8,
                            textTransform: "none",
                            px: 3,
                            "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                            },
                        }}
                    >
                        Iniciar evaluación familiar
                    </Button>
                </Box>
            )}
        </SectionCard>
    )
} 