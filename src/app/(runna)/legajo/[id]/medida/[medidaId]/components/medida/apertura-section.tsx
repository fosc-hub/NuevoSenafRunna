"use client"

import type React from "react"
import { Typography, Button, Box } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PostAddIcon from "@mui/icons-material/PostAdd"
import { SectionCard } from "./section-card"
import { RegistroIntervencionModal } from "./registro-intervencion-modal"
import { useState } from "react"

interface AperturaSectionProps {
  data: {
    fecha: string
    estado: string
    equipo: string
  }
  isActive: boolean
  isCompleted: boolean
  onViewForm: () => void
  medidaId: number
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
}

export const AperturaSection: React.FC<AperturaSectionProps> = ({ data, isActive, isCompleted, onViewForm, medidaId, legajoData }) => {
  const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)

  return (
    <>
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

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

          <Button
            variant="contained"
            color="primary"
            startIcon={<PostAddIcon />}
            onClick={() => setRegistroModalOpen(true)}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
            }}
          >
            Cargar informes
          </Button>
        </Box>
      </SectionCard>

      {/* Registro Intervención Modal */}
      <RegistroIntervencionModal
        open={registroModalOpen}
        onClose={() => setRegistroModalOpen(false)}
        medidaId={medidaId}
        legajoData={legajoData}
      />
    </>
  )
}
