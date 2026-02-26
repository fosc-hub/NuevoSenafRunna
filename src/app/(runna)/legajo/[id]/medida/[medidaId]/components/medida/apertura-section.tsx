"use client"

import type React from "react"
import { Typography, Button, Box, CircularProgress } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PostAddIcon from "@mui/icons-material/PostAdd"
import { SectionCard } from "./section-card"
import { RegistroIntervencionModal } from "./registro-intervencion-modal"
import { useState, useEffect } from "react"
import { getAdjuntos } from "../../api/intervenciones-api-service"
import type { IntervencionResponse, AdjuntoIntervencion } from "../../types/intervencion-api"

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
   * Workflow phase (apertura, innovacion, prorroga, cese)
   * Passed to modal for conditional field rendering
   */
  workflowPhase?: 'apertura' | 'innovacion' | 'prorroga' | 'cese'
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
  workflowPhase,
  intervenciones = [], // Default to empty array
  onWorkflowRefresh,
}) => {
  const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
  const [lastIntervencionId, setLastIntervencionId] = useState<number | undefined>(undefined)
  const [informeObligatorio, setInformeObligatorio] = useState<AdjuntoIntervencion | null>(null)
  const [isLoadingInforme, setIsLoadingInforme] = useState(false)

  // Get display name for current workflow phase
  const getEtapaDisplayName = (phase?: string): string => {
    const names: Record<string, string> = {
      'apertura': 'Apertura',
      'innovacion': 'Innovación',
      'prorroga': 'Prórroga',
      'cese': 'Cese'
    }
    return phase ? (names[phase] || 'Apertura') : 'Apertura'
  }

  const etapaName = getEtapaDisplayName(workflowPhase)

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

  /**
   * Fetch attachments for the latest intervention to find the mandatory report
   */
  useEffect(() => {
    const fetchInforme = async () => {
      if (!lastIntervencionId) {
        setInformeObligatorio(null)
        return
      }

      try {
        setIsLoadingInforme(true)
        const adjuntos = await getAdjuntos(medidaId, lastIntervencionId)
        // Find the "INFORME" type attachment
        const report = adjuntos.find((a) => a.tipo === 'INFORME')
        setInformeObligatorio(report || null)
      } catch (error) {
        console.error("[AperturaSection] Error fetching adjuntos:", error)
        setInformeObligatorio(null)
      } finally {
        setIsLoadingInforme(false)
      }
    }

    fetchInforme()
  }, [lastIntervencionId, medidaId])

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

  // Check if legajo data is available
  const hasLegajoData = !!(
    legajoData?.numero &&
    legajoData?.persona_nombre &&
    legajoData?.persona_apellido
  )

  return (
    <>
      <SectionCard
        title={etapaName}
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
            variant={lastIntervencionId ? "outlined" : "contained"}
            color="primary"
            startIcon={lastIntervencionId ? <DescriptionIcon /> : <PostAddIcon />}
            onClick={handleFormularioClick}
            disabled={!hasLegajoData}
            title={
              !hasLegajoData
                ? "Esperando datos del legajo..."
                : lastIntervencionId
                  ? "Editar Intervención de Apertura"
                  : "Crear nueva intervención de apertura"
            }
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
              ...(lastIntervencionId && {
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }),
            }}
          >
            {data.estado === 'PENDIENTE_APROBACION_REGISTRO'
              ? `Ver y Aprobar ${etapaName}`
              : lastIntervencionId
                ? "Ver/Editar Intervención"
                : "Nueva Intervención"}
          </Button>

          {informeObligatorio && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DescriptionIcon />}
              href={informeObligatorio.url_descarga}
              target="_blank"
              title="Descargar/Ver Informe Obligatorio"
              sx={{
                borderRadius: 8,
                textTransform: "none",
                px: 3,
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                }
              }}
            >
              Ver Informe Obligatorio (PDF)
            </Button>
          )}

          {isLoadingInforme && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Box>
      </SectionCard >

      {/* Registro Intervención Modal */}
      < RegistroIntervencionModal
        open={registroModalOpen}
        onClose={handleModalClose}
        medidaId={medidaId}
        intervencionId={lastIntervencionId}
        legajoData={legajoData}
        tipoMedida={tipoMedida}
        workflowPhase={workflowPhase}
        onSaved={handleIntervencionSaved}
      />
    </>
  )
}
