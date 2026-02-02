"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { CircularProgress, Typography, IconButton, Box, Alert, Button, Tabs, Tab, Menu, MenuItem, ListItemIcon, ListItemText, Divider, AlertTitle } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArticleIcon from "@mui/icons-material/Article"
import AddIcon from "@mui/icons-material/Add"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SecurityIcon from "@mui/icons-material/Security"
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom"
import GavelIcon from "@mui/icons-material/Gavel"
import RefreshIcon from "@mui/icons-material/Refresh"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useRouter } from "next/navigation"
import { updateLegajoDatosPersonales } from "../legajo-mesa/api/legajos-api-service"
import { fetchEnhancedLegajoDetail } from "../legajo-mesa/api/legajo-enhanced-service"
import type { LegajoDetailResponse, PersonaDetailData } from "../legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"
import { AddIntervencionDialog, NewIntervencion } from "./[id]/medida/[medidaId]/components/dialogs/add-intervencion-dialog"
import { AttachmentDialog } from "./[id]/medida/[medidaId]/components/dialogs/attachement-dialog"
import { EditDatosPersonalesDialog } from "./[id]/medida/[medidaId]/components/dialogs/edit-datos-personales-dialog"
import { CrearMedidaDialog } from "./[id]/medida/[medidaId]/components/dialogs/crear-medida-dialog"
import { DatosPersonalesSection } from "./[id]/medida/[medidaId]/components/legajo/datos-personales-section"
import { LegajoHeader } from "./[id]/medida/[medidaId]/components/legajo/legajo-header"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./[id]/medida/[medidaId]/components/navigation-breadcrumbs"
// New components
import { AsignacionesSection } from "./[id]/medida/[medidaId]/components/legajo/asignaciones-section"
import { OficiosSection } from "./[id]/medida/[medidaId]/components/legajo/oficios-section"
import { DemandasSection } from "./[id]/medida/[medidaId]/components/legajo/demandas-section"
import { DocumentosSection } from "./[id]/medida/[medidaId]/components/legajo/documentos-section"
import { ResponsablesSection } from "./[id]/medida/[medidaId]/components/legajo/responsables-section"
import { HistorialCambiosSection } from "./[id]/medida/[medidaId]/components/legajo/historial-cambios-section"
import { PlanTrabajoSection } from "./[id]/medida/[medidaId]/components/legajo/plan-trabajo-section"
import { HistorialAsignacionesSection } from "./[id]/medida/[medidaId]/components/legajo/historial-asignaciones-section"
import { MedidasActivasSection } from "./[id]/medida/[medidaId]/components/legajo/medidas-activas-section"
import PersonaDetailModalEnhanced from "./[id]/medida/[medidaId]/components/dialogs/persona-detail-modal-enhanced"

// Importar tipos

interface LegajoDetailProps {
  params: {
    id: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

export default function LegajoDetail({ params, onClose, isFullPage = false }: LegajoDetailProps) {
  const [legajoData, setLegajoData] = useState<LegajoDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState("")
  const [openAddIntervencionDialog, setOpenAddIntervencionDialog] = useState(false)
  const [openEditDatosDialog, setOpenEditDatosDialog] = useState(false)
  const [openCrearMedidaDialog, setOpenCrearMedidaDialog] = useState(false)
  const [openPersonaCompletaModal, setOpenPersonaCompletaModal] = useState(false)
  const [medidasRefreshTrigger, setMedidasRefreshTrigger] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openMedidaMenu = Boolean(anchorEl)

  const router = useRouter()
  const { user } = useUser()

  // Admins (is_superuser o is_staff) tienen acceso completo
  const isAdmin = user?.is_superuser || user?.is_staff

  const loadLegajoData = async () => {
    if (params.id) {
      try {
        setIsLoading(true)
        setError(null)

        // Call the enhanced API to fetch legajo detail with demanda adjuntos
        const response = await fetchEnhancedLegajoDetail(Number(params.id), {
          include_history: false, // Set to true if you want to include history
        })

        console.log("Legajo Detail API Response:", response)
        console.log("Permisos del usuario:", response.permisos_usuario)

        // Use the response directly without transformation
        setLegajoData(response)
      } catch (err) {
        console.error("Error loading legajo data:", err)
        // Provide more detailed error messages
        if (err instanceof Error) {
          if (err.message.includes("404")) {
            setError("No se encontró el legajo solicitado.")
          } else if (err.message.includes("403")) {
            setError("No tienes permisos para ver este legajo.")
          } else if (err.message.includes("Network") || err.message.includes("fetch")) {
            setError("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.")
          } else {
            setError(`Error al cargar los datos: ${err.message}`)
          }
        } else {
          setError("Error al cargar los datos del legajo. Por favor, intente nuevamente.")
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadLegajoData()
  }, [params.id])

  const handleOpenInFullPage = () => {
    router.push(`/legajo/${params.id}`)
  }

  const handleTomarMedida = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMedidaMenu = () => {
    setAnchorEl(null)
  }

  const handleSelectMedidaType = (type: 'MPI' | 'MPE' | 'MPJ') => {
    handleCloseMedidaMenu()
    console.log(`Creating ${type} medida`)

    // Open the crear medida dialog
    setOpenCrearMedidaDialog(true)
  }

  const handleCrearMedidaSuccess = async () => {
    // Trigger refresh of medidas section
    setMedidasRefreshTrigger(prev => prev + 1)

    // Also reload legajo data
    await loadLegajoData()
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleViewLastReport = () => {
    console.log("View last report clicked")
    // Implement the action for viewing the last report
  }

  const handleViewMoreInterventions = () => {
    setActiveTab(0) // Switch to General tab (includes datos personales)
  }

  const handleViewAllPersonalData = () => {
    setOpenPersonaCompletaModal(true)
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

  const handleSaveIntervencion = (_intervencion: NewIntervencion) => {
    // TODO: Implement intervencion saving via API
    console.log("Save intervencion - to be implemented with API call")
    setOpenAddIntervencionDialog(false)
  }

  const handleEditDatosPersonales = () => {
    setOpenEditDatosDialog(true)
  }

  const handleSaveDatosPersonales = async (updatedPersona: Partial<PersonaDetailData>) => {
    if (!params.id) return

    try {
      // Call API to update datos personales
      await updateLegajoDatosPersonales(Number(params.id), updatedPersona)

      // Reload legajo data to reflect changes
      await loadLegajoData()

      setOpenEditDatosDialog(false)
    } catch (error) {
      console.error("Error saving datos personales:", error)
      throw error // Let the dialog handle the error display
    }
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
      <Box sx={{ m: 2 }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadLegajoData}
            >
              Reintentar
            </Button>
          }
        >
          <AlertTitle>Error al cargar el legajo</AlertTitle>
          {error}
        </Alert>
      </Box>
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
  const puedeEditarPersona = isAdmin || legajoData.permisos_usuario?.puede_editar

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
            <Tab label="General" />
            <Tab label="Asignaciones" />
            <Tab label="Oficios" />
            <Tab label="Demandas" />
            <Tab label="Documentos" />
            {(isAdmin || legajoData.permisos_usuario?.puede_ver_historial) && <Tab label="Auditoría" />}
          </Tabs>
        </Box>

        {/* TAB 0: General (Datos Personales + Medidas Activas + Plan de Trabajo) */}
        {activeTab === 0 && (
          <>
            <DatosPersonalesSection legajoData={legajoData} onEdit={handleEditDatosPersonales} />
            <MedidasActivasSection
              legajoData={legajoData}
              onAddMedida={() => setOpenCrearMedidaDialog(true)}
              showAddButton={isAdmin || legajoData.permisos_usuario?.puede_tomar_medidas || false}
              refreshTrigger={medidasRefreshTrigger}
            />
            <PlanTrabajoSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 1: Asignaciones (Asignaciones Activas + Responsables + Historial) */}
        {activeTab === 1 && (
          <>
            <AsignacionesSection legajoData={legajoData} />
            <ResponsablesSection legajoData={legajoData} />
            <HistorialAsignacionesSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 2: Oficios */}
        {activeTab === 2 && (
          <>
            <OficiosSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 3: Demandas */}
        {activeTab === 3 && (
          <>
            <DemandasSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 4: Documentos */}
        {activeTab === 4 && (
          <>
            <DocumentosSection legajoData={legajoData} />
          </>
        )}

        {/* TAB 5: Auditoría (Historial de Cambios) - Solo con permiso o admin */}
        {activeTab === 5 && (isAdmin || legajoData.permisos_usuario?.puede_ver_historial) && (
          <>
            <HistorialCambiosSection legajoData={legajoData} />
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

      <EditDatosPersonalesDialog
        open={openEditDatosDialog}
        persona={legajoData?.persona || null}
        onClose={() => setOpenEditDatosDialog(false)}
        onSave={handleSaveDatosPersonales}
      />

      <CrearMedidaDialog
        open={openCrearMedidaDialog}
        legajoId={Number(params.id)}
        onClose={() => setOpenCrearMedidaDialog(false)}
        onSuccess={handleCrearMedidaSuccess}
      />

      <PersonaDetailModalEnhanced
        open={openPersonaCompletaModal}
        onClose={() => setOpenPersonaCompletaModal(false)}
        legajoData={legajoData}
        readOnly={!puedeEditarPersona}
      />
    </Box>
  )
}
