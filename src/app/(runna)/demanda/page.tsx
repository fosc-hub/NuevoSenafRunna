"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Tabs, Tab, Paper, Button } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
import { fetchCaseData } from "@/components/forms/utils/api"
import { update } from "@/app/api/apiService"
import type { FormData } from "@/components/forms/types/formTypes"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { EnviarRespuestaForm } from "./ui/EnviarRespuestaModal"
import { RegistrarActividadForm } from "./ui/RegistrarActividadModal"
import { ConexionesDemandaTab } from "./ui/ConexionesDemandaTab"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demanda-tabpanel-${index}`}
      aria-labelledby={`demanda-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `demanda-tab-${index}`,
    "aria-controls": `demanda-tabpanel-${index}`,
  }
}

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
  const [tabValue, setTabValue] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    // The actual submission is handled in the MultiStepForm component
  }

  const handleEnviarEvaluacion = async () => {
    if (!params.id) return

    setIsSubmitting(true)
    try {
      const updatedData = await update(
        "registro-demanda-form",
        Number.parseInt(params.id),
        { estado_demanda: "EVALUACION" },
        true,
        "Demanda enviada a evaluación exitosamente",
      )

      // Update local state to reflect the change
      if (formData) {
        setFormData({
          ...formData,
          estado_demanda: "EVALUACION",
        })
      }
    } catch (err) {
      console.error("Error updating case status:", err)
      // Error toast is handled by the API service
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = () => {
    //This function is no longer needed
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  const isEvaluacionDisabled = formData?.estado_demanda === "EVALUACION"

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: "text.primary",
            }}
          >
            Detalle de la Demanda
          </Typography>
        </Box>

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

        {isEvaluacionDisabled && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: "info.lighter",
              "& .MuiAlert-message": {
                color: "info.dark",
              },
            }}
          >
            Esta demanda ya se encuentra en evaluación.
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="demanda tabs" variant="fullWidth">
              <Tab label="Detalles" {...a11yProps(0)} />
              <Tab label="Enviar Respuesta" {...a11yProps(1)} />
              <Tab label="Registrar Actividad" {...a11yProps(2)} />
              <Tab label="Conexiones" {...a11yProps(3)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {formData && (
              <>
                <MultiStepForm initialData={formData} onSubmit={handleSubmit} readOnly={false} id={params.id} />
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleEnviarEvaluacion}
                    disabled={isSubmitting || isEvaluacionDisabled}
                    sx={{
                      backgroundColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar a Evaluación"}
                  </Button>
                </Box>
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <EnviarRespuestaForm demandaId={Number.parseInt(params.id)} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <RegistrarActividadForm demandaId={Number.parseInt(params.id)} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <ConexionesDemandaTab demandaId={Number.parseInt(params.id)} />
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  )
}

