"use client"

import type React from "react"
import { Typography, Button, Box, CircularProgress } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PostAddIcon from "@mui/icons-material/PostAdd"
import { SectionCard } from "./section-card"
import { RegistroIntervencionModal } from "./registro-intervencion-modal"
import { useState, useEffect } from "react"
import { getIntervencionesByMedida } from "../../api/intervenciones-api-service"

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
  const [lastIntervencionId, setLastIntervencionId] = useState<number | undefined>(undefined)
  const [isLoadingIntervenciones, setIsLoadingIntervenciones] = useState<boolean>(false)

  // Load last intervention on mount
  useEffect(() => {
    const loadLastIntervencion = async () => {
      setIsLoadingIntervenciones(true)
      try {
        const intervenciones = await getIntervencionesByMedida(medidaId)
        if (intervenciones && intervenciones.length > 0) {
          // Get the most recent intervention (assuming they come sorted by date desc)
          const lastIntervencion = intervenciones[0]
          setLastIntervencionId(lastIntervencion.id)
        }
      } catch (error) {
        console.error("Error loading intervenciones:", error)
      } finally {
        setIsLoadingIntervenciones(false)
      }
    }

    loadLastIntervencion()
  }, [medidaId])

  const handleFormularioClick = () => {
    setRegistroModalOpen(true)
  }

  const handleCargarInformesClick = () => {
    setLastIntervencionId(undefined) // Reset to create new
    setRegistroModalOpen(true)
  }

  const handleModalClose = () => {
    setRegistroModalOpen(false)
    // Reload last intervention after closing modal
    const reloadLastIntervencion = async () => {
      try {
        const intervenciones = await getIntervencionesByMedida(medidaId)
        if (intervenciones && intervenciones.length > 0) {
          setLastIntervencionId(intervenciones[0].id)
        }
      } catch (error) {
        console.error("Error reloading intervenciones:", error)
      }
    }
    reloadLastIntervencion()
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
            startIcon={isLoadingIntervenciones ? <CircularProgress size={20} /> : <DescriptionIcon />}
            onClick={handleFormularioClick}
            disabled={isLoadingIntervenciones || !lastIntervencionId}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            {isLoadingIntervenciones ? "Cargando..." : lastIntervencionId ? "Ver Última Intervención" : "Sin Intervenciones"}
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
        onSaved={handleModalClose}
      />
    </>
  )
}
