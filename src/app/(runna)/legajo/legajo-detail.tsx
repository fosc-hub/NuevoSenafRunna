"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { CircularProgress, Typography, IconButton, Box, Alert, Button, Tabs, Tab } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArticleIcon from "@mui/icons-material/Article"
import AddIcon from "@mui/icons-material/Add"
import { useRouter } from "next/navigation"
import { getLegajoById } from "../legajo-mesa/mock-data/legajos-service"
import { Intervencion, Legajo } from "./[id]/medida/[medidaId]/types/legajo"
import { AddIntervencionDialog, NewIntervencion } from "./[id]/medida/[medidaId]/components/dialogs/add-intervencion-dialog"
import { AttachmentDialog } from "./[id]/medida/[medidaId]/components/dialogs/attachement-dialog"
import { DatosPersonalesSection } from "./[id]/medida/[medidaId]/components/legajo/datos-personales-section"
import { HistorialMedidasSection } from "./[id]/medida/[medidaId]/components/legajo/historial-medidas-section"
import { IntervencionesSection } from "./[id]/medida/[medidaId]/components/legajo/intervenciones-section"
import { LegajoHeader } from "./[id]/medida/[medidaId]/components/legajo/legajo-header"
import { MedidaActivaCard } from "./[id]/medida/[medidaId]/components/legajo/medida-activa-card"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./[id]/medida/[medidaId]/components/navigation-breadcrumbs"

// Importar tipos

interface LegajoDetailProps {
  params: {
    id: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

export default function LegajoDetail({ params, onClose, isFullPage = false }: LegajoDetailProps) {
  const [legajoData, setLegajoData] = useState<Legajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState("")
  const [openAddIntervencionDialog, setOpenAddIntervencionDialog] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadLegajoData = () => {
      if (params.id) {
        try {
          setIsLoading(true)
          const data = getLegajoById(params.id)
          if (data) {
            setLegajoData(data)
          } else {
            setError(`No se encontró el legajo con ID ${params.id}`)
          }
        } catch (err) {
          console.error("Error loading legajo data:", err)
          setError("Error al cargar los datos del legajo. Por favor, intente nuevamente.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadLegajoData()
  }, [params.id])

  const handleOpenInFullPage = () => {
    router.push(`/legajo/${params.id}`)
  }

  const handleTomarMedida = () => {
    console.log("Tomar medida clicked")
    // Implement the action for taking a measure
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleViewLastReport = () => {
    console.log("View last report clicked")
    // Implement the action for viewing the last report
  }

  const handleViewMoreInterventions = () => {
    setActiveTab(2) // Switch to the Intervenciones tab
  }

  const handleViewAllPersonalData = () => {
    setActiveTab(3) // Switch to the Datos Personales tab
  }

  const handleOpenAttachment = (fileName: string) => {
    setSelectedAttachment(fileName)
    setOpenAttachmentDialog(true)
  }

  const handleDownloadAttachment = () => {
    console.log(`Downloading ${selectedAttachment}...`)
    // Implement download functionality
    setOpenAttachmentDialog(false)
  }

  const handleAddIntervencion = () => {
    setOpenAddIntervencionDialog(true)
  }

  const handleSaveIntervencion = (intervencion: NewIntervencion) => {
    if (!legajoData) return

    const now = new Date()
    const formattedDate = now
      .toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
      .toUpperCase()
    const formattedTime = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }).toLowerCase()

    let descripcion = intervencion.descripcion
    if (intervencion.archivo) {
      descripcion += ` Se adjunta ${intervencion.archivo.name}`
    }

    const newIntervencion: Intervencion = {
      fecha: formattedDate,
      descripcion: descripcion,
      hora: formattedTime,
    }

    const updatedLegajoData = { ...legajoData }
    updatedLegajoData.intervenciones = [newIntervencion, ...updatedLegajoData.intervenciones]
    setLegajoData(updatedLegajoData)
    setOpenAddIntervencionDialog(false)
  }
  const handleSituacionCriticaChange = (key: string, checked: boolean) => {
    if (!legajoData) return

    const updatedLegajoData = { ...legajoData }
    updatedLegajoData.situaciones_criticas = {
      ...updatedLegajoData.situaciones_criticas,
      [key]: checked,
    }
    setLegajoData(updatedLegajoData)
  }

  const handleRespuestaEnviadaChange = (checked: boolean) => {
    if (!legajoData) return

    const updatedLegajoData = { ...legajoData }
    updatedLegajoData.medida_activa.respuesta_enviada = checked
    setLegajoData(updatedLegajoData)
  }
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando información del legajo...
        </Typography>
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

  if (!legajoData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información para este legajo.
      </Alert>
    )
  }

  // Prepare breadcrumb items
  const breadcrumbItems = [...getDefaultBreadcrumbs()]

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
        {!isFullPage ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton aria-label="Ver en página completa" onClick={handleOpenInFullPage} color="primary">
              <ArticleIcon />
            </IconButton>
            {onClose && (
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
        ) : (
          <Box sx={{ mb: 3 }}>
            <NavigationBreadcrumbs items={breadcrumbItems} currentPage={`Legajo ${params.id}`} />
          </Box>
        )}

        <LegajoHeader legajoData={legajoData} onViewAllPersonalData={handleViewAllPersonalData} />

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Secciones del legajo"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              },
            }}
          >
            <Tab label="Medidas Activas" />
            <Tab label="Historial de Medidas" />
            <Tab label="Intervenciones" />
            <Tab label="Datos Personales" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "black" }}>
                Medida activa (1)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleTomarMedida}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                }}
              >
                Tomar Medida
              </Button>
            </Box>

            <MedidaActivaCard
              legajoId={params.id}
              medidaActiva={legajoData.medida_activa}
              situacionesCriticas={legajoData.situaciones_criticas}
              intervenciones={legajoData.intervenciones.slice(0, 3)}
              onViewLastReport={handleViewLastReport}
              onViewMoreInterventions={handleViewMoreInterventions}
              onSituacionCriticaChange={handleSituacionCriticaChange}
              onRespuestaEnviadaChange={handleRespuestaEnviadaChange}
            />
          </>
        )}

        {/* Historial de Medidas Section */}
        {activeTab === 1 && (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "black" }}>
              Historial de Medidas
            </Typography>

            <HistorialMedidasSection legajoId={params.id} historialMedidas={legajoData.historial_medidas} />
          </>
        )}

        {/* Intervenciones Section */}
        {activeTab === 2 && (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 , color: "black"}}>
              Historial de Intervenciones
            </Typography>

            <IntervencionesSection
              intervenciones={legajoData.intervenciones}
              onAddIntervencion={handleAddIntervencion}
              onViewAttachment={handleOpenAttachment}
            />
          </>
        )}

        {/* Datos Personales Section */}
        {activeTab === 3 && (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "black" }}>
              Datos Personales Completos
            </Typography>

            <DatosPersonalesSection legajoData={legajoData} />
          </>
        )}
      </Box>

      {/* Dialogs */}
      <AttachmentDialog
        open={openAttachmentDialog}
        fileName={selectedAttachment}
        onClose={() => setOpenAttachmentDialog(false)}
        onDownload={handleDownloadAttachment}
      />

      <AddIntervencionDialog
        open={openAddIntervencionDialog}
        onClose={() => setOpenAddIntervencionDialog(false)}
        onSave={handleSaveIntervencion}
      />
    </Box>
  )
}
