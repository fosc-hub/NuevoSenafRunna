"use client"

import type React from "react"
import { Typography, Button, Box, CircularProgress } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PostAddIcon from "@mui/icons-material/PostAdd"
import { SectionCard } from "./section-card"
import { RegistroIntervencionModal } from "./registro-intervencion-modal"
import { useState, useEffect } from "react"
import type { IntervencionResponse } from "../../types/intervencion-api"

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
  tipoMedida?: "MPI" | "MPE" | "MPJ"
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  /**
   * Pre-fetched interventions for this etapa (from parent)
   * NEW: Replaces internal data fetching to ensure etapa isolation
   */
  intervenciones?: IntervencionResponse[]
  /**
   * Callback to force parent workflow refresh after creating/updating intervenciones
   */
  onWorkflowRefresh?: () => void
}

export const AperturaSection: React.FC<AperturaSectionProps> = ({
  data,
  isActive,
  isCompleted,
  onViewForm,
  medidaId,
  tipoMedida = "MPI",
  legajoData,
  intervenciones = [], // Default to empty array
  onWorkflowRefresh,
}) => {
  const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
  const [lastIntervencionId, setLastIntervencionId] = useState<number | undefined>(undefined)

  /**
   * NEW APPROACH: Use pre-fetched interventions from parent
   * This ensures we only show interventions for THIS etapa (Apertura),
   * not mixed with Innovación, Prórroga, or Cese interventions
   */
  useEffect(() => {
    if (intervenciones && intervenciones.length > 0) {
      // Get the most recent intervention (assuming they come sorted by date desc)
      const lastIntervencion = intervenciones[0]
      setLastIntervencionId(lastIntervencion.id)
      console.log(`[AperturaSection] Loaded ${intervenciones.length} interventions for this etapa`)
    } else {
      setLastIntervencionId(undefined)
      console.log('[AperturaSection] No interventions found for this etapa')
    }
  }, [intervenciones])

  const handleFormularioClick = () => {
    setRegistroModalOpen(true)
  }

  const handleCargarInformesClick = () => {
    setLastIntervencionId(undefined) // Reset to create new
    setRegistroModalOpen(true)
  }

  const handleModalClose = () => {
    setRegistroModalOpen(false)
  }

  const handleIntervencionSaved = () => {
    // Close modal first to give immediate feedback
    setRegistroModalOpen(false)
    // Inform parent so it can refetch etapa detail + medida states
    onWorkflowRefresh?.()
  }

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
            onClick={handleFormularioClick}
            disabled={!lastIntervencionId}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            {lastIntervencionId ? "Ver Última Intervención" : "Sin Intervenciones"}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PostAddIcon />}
            onClick={handleCargarInformesClick}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
            }}
          >
            Nueva Intervención
          </Button>
        </Box>
      </SectionCard>

      {/* Registro Intervención Modal */}
      <RegistroIntervencionModal
        open={registroModalOpen}
        onClose={handleModalClose}
        medidaId={medidaId}
        intervencionId={lastIntervencionId}
        legajoData={legajoData}
        tipoMedida={tipoMedida}
        onSaved={handleIntervencionSaved}
      />
    </>
  )
}
