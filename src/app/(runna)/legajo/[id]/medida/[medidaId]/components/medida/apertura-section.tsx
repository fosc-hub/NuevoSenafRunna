"use client"

import type React from "react"
import { Typography, Button } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { SectionCard } from "./section-card"

interface AperturaSectionProps {
  data: {
    fecha: string
    estado: string
    equipo: string
  }
  isActive: boolean
  isCompleted: boolean
  onViewForm: () => void
}

export const AperturaSection: React.FC<AperturaSectionProps> = ({ data, isActive, isCompleted, onViewForm }) => {
  return (
    <SectionCard
      title="Apertura"
      icon={<AssignmentIcon color="primary" />}
      isActive={isActive}
      isCompleted={isCompleted}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Fecha:</strong> {data.fecha}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Estado:</strong> {data.estado || "No especificado"}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        <strong>Equipo:</strong> {data.equipo || "No especificado"}
      </Typography>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<DescriptionIcon />}
        onClick={onViewForm}
        sx={{
          borderRadius: 8,
          textTransform: "none",
          px: 3,
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        Formulario
      </Button>
    </SectionCard>
  )
}
