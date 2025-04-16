"use client"

import type React from "react"
import { Typography, Button } from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { SectionCard } from "./section-card"

interface CierreSectionProps {
  data: {
    fecha: string
    estado: string
    equipo: string
  }
  isActive: boolean
  isCompleted: boolean
  onCloseMeasure: () => void
}

export const CierreSection: React.FC<CierreSectionProps> = ({ data, isActive, isCompleted, onCloseMeasure }) => {
  return (
    <SectionCard title="Cierre" icon={<AssignmentIcon color="primary" />} isActive={isActive} isCompleted={isCompleted}>
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
        variant="contained"
        color="error"
        onClick={onCloseMeasure}
        disabled={isCompleted}
        sx={{
          borderRadius: 8,
          textTransform: "none",
          px: 3,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          },
        }}
      >
        {isCompleted ? "Medida cerrada" : "Cerrar medida"}
      </Button>
    </SectionCard>
  )
}
