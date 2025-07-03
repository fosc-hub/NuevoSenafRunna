"use client"

import type React from "react"
import { Typography, Button, Box, Chip, IconButton } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import AssignmentIcon from "@mui/icons-material/Assignment"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import { SectionCard } from "./section-card"
import { Task } from "../../types/medidas"

interface PlanEvaluacionSectionProps {
    tasks: Task[]
    isActive: boolean
    onAddTask: () => void
    onViewTaskDetails: (index: number) => void
    onEditTask: (index: number) => void
}

export const PlanEvaluacionSection: React.FC<PlanEvaluacionSectionProps> = ({
    tasks,
    isActive,
    onAddTask,
    onViewTaskDetails,
    onEditTask,
}) => {
    return (
        <SectionCard
            title="Plan de Evaluación"
            icon={<AssignmentIcon color="primary" />}
            isActive={isActive}
            isCompleted={tasks.length > 0}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Actividades y tareas del proceso de evaluación familiar
                </Typography>

                {tasks.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                        {tasks.map((task, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    backgroundColor: task.estado ? "rgba(76, 175, 80, 0.04)" : "rgba(158, 158, 158, 0.04)",
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: task.estado ? "rgba(76, 175, 80, 0.08)" : "rgba(158, 158, 158, 0.08)",
                                    },
                                }}
                                onClick={() => onViewTaskDetails(index)}
                            >
                                {task.estado ? (
                                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                                ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: "text.secondary", mr: 1 }} />
                                )}

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                        {task.tarea}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                                        {task.objetivo}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Chip
                                            label={task.fecha}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: "0.7rem" }}
                                        />
                                        <Chip
                                            label={`Plazo: ${task.plazo}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: "0.7rem" }}
                                        />
                                    </Box>
                                </Box>

                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEditTask(index)
                                    }}
                                    sx={{ ml: 1 }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                        No hay tareas de evaluación registradas
                    </Typography>
                )}

                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAddTask}
                    sx={{
                        borderRadius: 8,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                        },
                    }}
                >
                    Agregar tarea de evaluación
                </Button>
            </Box>
        </SectionCard>
    )
} 