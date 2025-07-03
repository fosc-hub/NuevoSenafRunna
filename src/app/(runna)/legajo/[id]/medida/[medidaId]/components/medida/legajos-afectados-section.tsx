"use client"

import type React from "react"
import { Typography, Button, Box, Chip, List, ListItem, ListItemText, ListItemIcon } from "@mui/material"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import PersonIcon from "@mui/icons-material/Person"
import AddIcon from "@mui/icons-material/Add"
import { SectionCard } from "./section-card"

interface LegajosAfectadosData {
    numero_legajo: string
    nombre_nnya: string
    relacion: string
}

interface LegajosAfectadosSectionProps {
    data: LegajosAfectadosData[]
    isActive: boolean
    onAddLegajo: () => void
    onViewLegajo: (numeroLegajo: string) => void
}

export const LegajosAfectadosSection: React.FC<LegajosAfectadosSectionProps> = ({
    data,
    isActive,
    onAddLegajo,
    onViewLegajo,
}) => {
    return (
        <SectionCard
            title="Legajos Afectados"
            icon={<AccountTreeIcon color="primary" />}
            isActive={isActive}
            isCompleted={data.length > 0}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    NNyA relacionados en esta evaluación familiar
                </Typography>

                {data.length > 0 ? (
                    <List sx={{ p: 0, mb: 2 }}>
                        {data.map((legajo, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    backgroundColor: "rgba(25, 118, 210, 0.02)",
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                                    },
                                }}
                                onClick={() => onViewLegajo(legajo.numero_legajo)}
                            >
                                <ListItemIcon>
                                    <PersonIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {legajo.nombre_nnya}
                                            </Typography>
                                            <Chip
                                                label={`Legajo ${legajo.numero_legajo}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: "0.7rem" }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                            Relación: {legajo.relacion}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                        No hay legajos afectados registrados
                    </Typography>
                )}

                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAddLegajo}
                    sx={{
                        borderRadius: 8,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                        },
                    }}
                >
                    Agregar legajo afectado
                </Button>
            </Box>
        </SectionCard>
    )
} 