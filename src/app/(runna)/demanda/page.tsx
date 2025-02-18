"use client"

import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Button, Alert } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import MessageIcon from "@mui/icons-material/Message"
import AssignmentIcon from "@mui/icons-material/Assignment"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { fetchCaseData } from "@/components/forms/utils/api"
import type { FormData } from "@/components/forms/types/formTypes"
import { EnviarRespuestaModal } from "./ui/EnviarRespuestaModal"
import { RegistrarActividadModal } from "./ui/RegistrarActividadModal"

interface DemandaDetailProps {
  params: {
    id: string
  }
  onClose: () => void
}

export default function DemandaDetail({ params, onClose }: DemandaDetailProps) {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRespuestaModalOpen, setIsRespuestaModalOpen] = useState(false)
  const [isActividadModalOpen, setIsActividadModalOpen] = useState(false)

  useEffect(() => {
    const loadCaseData = async () => {
      if (params.id) {
        try {
          setIsLoading(true)
          const data = await fetchCaseData(params.id)
          setFormData(data)
        } catch (err) {
          console.error("Error loading case data:", err)
          setError("Error loading case data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCaseData()
  }, [params.id])

  const handleSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
  }

  const handleActividadSubmit = (activity: { type: string; description: string }) => {
    console.log("Activity submitted:", activity)
    // Handle the activity submission
  }

  if (isLoading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "text.primary",
            mb: 3,
          }}
        >
          Detalle de la Demanda
        </Typography>

        {formData?.unassigned && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "warning.lighter",
              "& .MuiAlert-message": {
                color: "warning.dark",
              },
            }}
          >
            La presente demanda aún no ha sido asignada.
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MessageIcon />}
            onClick={() => setIsRespuestaModalOpen(true)}
          >
            ENVIAR RESPUESTA
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon />}
            onClick={() => setIsActividadModalOpen(true)}
          >
            REGISTRAR ACTIVIDAD
          </Button>
        </Box>

        {formData && <MultiStepForm initialData={formData} onSubmit={handleSubmit} readOnly={false} />}
      </Box>

      <EnviarRespuestaModal
        isOpen={isRespuestaModalOpen}
        onClose={() => setIsRespuestaModalOpen(false)}
        demandaId={Number.parseInt(params.id)}
      />

      <RegistrarActividadModal
        isOpen={isActividadModalOpen}
        onClose={() => setIsActividadModalOpen(false)}
        demandaId={Number.parseInt(params.id)}
      />
    </Box>
  )
}

