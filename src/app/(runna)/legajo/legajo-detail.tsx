"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { CircularProgress, Typography, IconButton, Box, Alert, Button, Tabs, Tab, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArticleIcon from "@mui/icons-material/Article"
import AddIcon from "@mui/icons-material/Add"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SecurityIcon from "@mui/icons-material/Security"
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom"
import GavelIcon from "@mui/icons-material/Gavel"
import { useRouter } from "next/navigation"
import { fetchLegajoDetail } from "../legajo-mesa/api/legajos-api-service"
import type { LegajoDetailResponse } from "../legajo-mesa/types/legajo-api"
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openMedidaMenu = Boolean(anchorEl)

  const router = useRouter()

  useEffect(() => {
    const loadLegajoData = async () => {
      if (params.id) {
        try {
          setIsLoading(true)
          setError(null)

          // Call the real API to fetch legajo detail
          const response = await fetchLegajoDetail(Number(params.id), {
            include_history: false, // Set to true if you want to include history
          })

          console.log("Raw API Response:", response)

          // Transform API response to match the Legajo interface
          // Helper function to safely convert any value to string
          const safeToString = (value: any, defaultValue: string = "N/A"): string => {
            if (value === null || value === undefined) return defaultValue
            if (typeof value === 'string') return value
            if (typeof value === 'number') return String(value)
            if (typeof value === 'object') {
              console.warn("Attempted to render object as string:", value)
              return defaultValue
            }
            return String(value)
          }

          // Extract localizacion information
          let ubicacionStr = "N/A"
          let localidadNombre = "N/A"

          if (response.localizacion_actual?.localizacion) {
            const loc = response.localizacion_actual.localizacion
            // Build address string
            const addressParts: string[] = []
            if (loc.tipo_calle && loc.calle) {
              addressParts.push(`${loc.tipo_calle} ${loc.calle}`)
            }
            if (loc.casa_nro) {
              addressParts.push(`N° ${loc.casa_nro}`)
            }
            if (loc.piso_depto) {
              addressParts.push(`Piso ${loc.piso_depto}`)
            }
            if (loc.barrio_nombre) {
              addressParts.push(loc.barrio_nombre)
            }

            ubicacionStr = addressParts.length > 0 ? addressParts.join(", ") : "N/A"
            localidadNombre = loc.localidad_nombre || "N/A"
          }

          // Extract equipo interviniente from asignaciones_activas
          let equipoInterviniente = "N/A"
          let zonaAsignada = "N/A"
          if (response.asignaciones_activas && response.asignaciones_activas.length > 0) {
            const asignacion = response.asignaciones_activas[0]
            equipoInterviniente = asignacion.user_responsable?.nombre_completo || "N/A"
            zonaAsignada = asignacion.zona?.nombre || "N/A"
          }

          // Get prioridad from legajo
          const prioridad = (response.legajo?.urgencia as "ALTA" | "MEDIA" | "BAJA") || "MEDIA"

          // Process medidas_activas
          const medidasActivas = Array.isArray(response.medidas_activas) ? response.medidas_activas : []
          const historialMedidas = Array.isArray(response.historial_medidas) ? response.historial_medidas : []

          // Create medida_activa object from first active medida if available
          let medidaActiva = {
            tipo: "MPI" as const,
            estado: "ACTIVA" as const,
            fecha_apertura: response.legajo?.fecha_apertura || new Date().toISOString(),
            grupo_actuante: equipoInterviniente,
            juzgado: "N/A",
            nro_sac: "N/A",
            respuesta_enviada: false,
          }

          if (medidasActivas.length > 0) {
            const primeraMediada = medidasActivas[0]
            medidaActiva = {
              ...medidaActiva,
              fecha_apertura: primeraMediada.fecha_apertura || medidaActiva.fecha_apertura,
              estado: (primeraMediada.estado as "ACTIVA") || "ACTIVA",
              tipo: (primeraMediada.tipo_medida as "MPI" | "MPE" | "MPJ") || "MPI",
            }
          }

          // Format fecha_apertura for display
          let fechaAperturaFormatted = new Date().toISOString()
          try {
            if (response.legajo?.fecha_apertura) {
              const date = new Date(response.legajo.fecha_apertura)
              if (!isNaN(date.getTime())) {
                fechaAperturaFormatted = date.toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              }
            }
          } catch (error) {
            console.error("Error formatting fecha_apertura:", error)
          }

          const transformedData: Legajo = {
            id: params.id,
            numero_legajo: response.legajo?.numero || `L-${params.id}`,
            fecha_apertura: fechaAperturaFormatted,
            persona_principal: {
              nombre: response.persona?.nombre || "N/A",
              apellido: response.persona?.apellido || "N/A",
              dni: response.persona?.dni ? String(response.persona.dni) : "N/A",
              edad: response.persona?.edad_aproximada ||
                    (response.persona?.edad_calculada ? Number(response.persona.edad_calculada) : 0),
              alias: response.persona?.nombre_autopercibido || undefined,
              telefono: response.persona?.telefono ? String(response.persona.telefono) : undefined,
            },
            ubicacion: ubicacionStr,
            localidad: { nombre: localidadNombre },
            equipo_interviniente: equipoInterviniente,
            prioridad: prioridad,
            medida_activa: medidaActiva,
            situaciones_criticas: {
              BP: false,
              RSA: false,
              DCS: false,
              SCP: false,
            },
            intervenciones: [], // TODO: Parse from historial_cambios or other source
            historial_medidas: {
              MPI: historialMedidas.filter(m => m.tipo_medida === "MPI"),
              MPE: historialMedidas.filter(m => m.tipo_medida === "MPE"),
              MPJ: historialMedidas.filter(m => m.tipo_medida === "MPJ"),
            },
          }

          console.log("Transformed legajo data:", transformedData)


          setLegajoData(transformedData)
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

  const handleTomarMedida = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMedidaMenu = () => {
    setAnchorEl(null)
  }

  const handleSelectMedidaType = (type: 'MPI' | 'MPE' | 'MPJ') => {
    handleCloseMedidaMenu()
    console.log(`Creating ${type} medida`)

    // Navigate to the appropriate medida page
    if (type === 'MPE') {
      router.push(`/legajo/${params.id}/medida/mpe`)
    } else if (type === 'MPI') {
      router.push(`/legajo/${params.id}/medida/medida-detail`)
    } else if (type === 'MPJ') {
      // For now, just show a message - you can implement MPJ later
      console.log('MPJ functionality not implemented yet')
    }
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
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  endIcon={<ArrowDropDownIcon />}
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

                <Menu
                  anchorEl={anchorEl}
                  open={openMedidaMenu}
                  onClose={handleCloseMedidaMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => handleSelectMedidaType('MPI')}>
                    <ListItemIcon>
                      <SecurityIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Medida de Protección Integral (MPI)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Protección integral de derechos
                      </Typography>
                    </ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleSelectMedidaType('MPE')}>
                    <ListItemIcon>
                      <FamilyRestroomIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Medida de Protección Excepcional (MPE)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Evaluación familiar y competencias parentales
                      </Typography>
                    </ListItemText>
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={() => handleSelectMedidaType('MPJ')} disabled>
                    <ListItemIcon>
                      <GavelIcon fontSize="small" color="disabled" />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.disabled' }}>
                        Medida de Protección Judicial (MPJ)
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Próximamente disponible
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                </Menu>
              </>
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "black" }}>
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
