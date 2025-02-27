"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Tabs, Tab, Paper } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { fetchCaseData } from "@/components/forms/utils/api"
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
              <MultiStepForm
                initialData={formData}
                onSubmit={handleSubmit}
                readOnly={false}
                id={params.id} // Pass the id as a string
              />
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

