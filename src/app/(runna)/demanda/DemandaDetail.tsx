"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Tabs, Tab, Paper, Button } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
import ArticleIcon from "@mui/icons-material/Article"
import { update } from "@/app/api/apiService"
import type { FormData } from "@/components/forms/types/formTypes"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { EnviarRespuestaForm } from "./ui/EnviarRespuestaModal"
import { RegistrarActividadForm } from "./ui/RegistrarActividadModal"
import { ConexionesDemandaTab } from "./ui/ConexionesDemandaTab"
import { useRouter } from "next/navigation"
import { fetchCaseData } from "@/components/forms/utils/apiToFormData"
import { useUser } from "@/utils/auth/userZustand"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  disabled?: boolean
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, disabled = false, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demanda-tabpanel-${index}`}
      aria-labelledby={`demanda-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, opacity: disabled ? 0.7 : 1, pointerEvents: disabled ? "none" : "auto" }}>{children}</Box>
      )}
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
  onClose?: () => void
  isFullPage?: boolean
}

export default function DemandaDetail({ params, onClose, isFullPage = false }: DemandaDetailProps) {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = user?.all_permissions?.includes('view_tdemandavinculada') ||
    user?.all_permissions?.includes('add_tdemandavinculada') ||
    user?.all_permissions?.includes('change_tdemandavinculada') ||
    user?.is_superuser ||
    user?.is_staff

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

  const isEvaluacionDisabled = formData?.estado_demanda === "EVALUACION"

  const isPeticionDeInforme = formData?.objetivo_de_demanda === "PETICION_DE_INFORME"

  const isEditingBlocked = ["ARCHIVADA", "ADMITIDA", "PENDIENTE_AUTORIZACION"].includes(formData?.estado_demanda || "")

  // If it's a petition for report, force tab value to be 1 (Enviar Respuesta)
  // Remove this useEffect that forces the tab value to be 1
  // useEffect(() => {
  //   if (isPeticionDeInforme && tabValue !== 1) {
  //     setTabValue(1)
  //   }
  // }, [isPeticionDeInforme, tabValue])

  // Replace with this useEffect that only sets the initial tab value
  useEffect(() => {
    // Only set the initial tab value when the component first loads
    if (isPeticionDeInforme && !isLoading && formData) {
      setTabValue(1)
    }
  }, [isPeticionDeInforme, isLoading, formData])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Allow changing to any tab, but the form in the Details tab will be read-only
    // if it's a petition for report
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
      // Se crea un nuevo FormData y se agrega la clave "data"
      // con el objeto JSON que contiene el estado de la demanda
      const formDataToSend = new FormData()
      formDataToSend.append("data", JSON.stringify({ estado_demanda: "EVALUACION" }))

      const updatedData = await update(
        "registro-demanda-form",
        Number.parseInt(params.id),
        formDataToSend,
        true,
        "Demanda enviada a evaluación exitosamente",
      )

      // Actualiza el estado local para reflejar el cambio
      if (formData) {
        setFormData({
          ...formData,
          estado_demanda: "EVALUACION",
        })
      }

      // Si NO es página completa (es modal/drawer), cerrar automáticamente después de enviar exitosamente
      if (!isFullPage && onClose) {
        // Esperar un momento para que el usuario vea el mensaje de éxito antes de cerrar
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err) {
      console.error("Error updating case status:", err)
      // El manejo del error se realiza en el servicio API
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenInFullPage = () => {
    router.push(`/demanda/${params.id}`)
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
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...(isFullPage && {
          display: "flex",
          justifyContent: "center",
        }),
      }}
    >
      <Box
        sx={{
          p: 3,
          ...(isFullPage && {
            maxWidth: "1200px",
            width: "100%",
          }),
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: "text.primary",
            }}
          >
            Detalle de la Demanda
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {!isFullPage && (
              <IconButton aria-label="Ver en página completa" onClick={handleOpenInFullPage} color="primary">
                <ArticleIcon />
              </IconButton>
            )}

            {!isFullPage && onClose && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {formData?.unassigned && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "warning.light",
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

        {isEditingBlocked && (
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
            Esta demanda no puede ser editada debido a su estado actual.
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="demanda tabs" variant="fullWidth">
              <Tab label="Detalles" {...a11yProps(0)} />
              <Tab label="Enviar Respuesta" {...a11yProps(1)} />
              <Tab
                label="Registrar Actividad"
                {...a11yProps(2)}
                disabled={isPeticionDeInforme}
                sx={{ opacity: isPeticionDeInforme ? 0.7 : 1 }}
              />
              {hasVinculacionPermission && (
                <Tab
                  label="Conexiones"
                  {...a11yProps(3)}
                  disabled={isPeticionDeInforme}
                  sx={{ opacity: isPeticionDeInforme ? 0.7 : 1 }}
                />
              )}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {formData && (
              <>
                <MultiStepForm
                  initialData={formData}
                  onSubmit={handleSubmit}
                  readOnly={isPeticionDeInforme || isEditingBlocked}
                  id={params.id}
                  isPeticionDeInforme={isPeticionDeInforme || isEditingBlocked}
                  demandaId={Number.parseInt(params.id)}
                />
                {!isPeticionDeInforme && (
                  <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={handleEnviarEvaluacion}
                      disabled={isSubmitting || isEvaluacionDisabled || isEditingBlocked}
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
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ opacity: isEditingBlocked ? 0.7 : 1, pointerEvents: isEditingBlocked ? "none" : "auto" }}>
              <EnviarRespuestaForm demandaId={Number.parseInt(params.id)} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                opacity: isPeticionDeInforme || isEditingBlocked ? 0.7 : 1,
                pointerEvents: isPeticionDeInforme || isEditingBlocked ? "none" : "auto",
              }}
            >
              <RegistrarActividadForm demandaId={Number.parseInt(params.id)} />
            </Box>
          </TabPanel>

          {hasVinculacionPermission && (
            <TabPanel value={tabValue} index={3}>
              <Box
                sx={{
                  opacity: isPeticionDeInforme || isEditingBlocked ? 0.7 : 1,
                  pointerEvents: isPeticionDeInforme || isEditingBlocked ? "none" : "auto",
                }}
              >
                <ConexionesDemandaTab demandaId={Number.parseInt(params.id)} />
              </Box>
            </TabPanel>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
