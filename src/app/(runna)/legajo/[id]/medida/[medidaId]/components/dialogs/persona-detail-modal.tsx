"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Avatar,
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from "@mui/material"
import {
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  FolderOpen as FolderOpenIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AssignmentInd as AssignmentIndIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material"
import { get } from "@/app/api/apiService"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface PersonaDetailModalProps {
  open: boolean
  onClose: () => void
  legajoData: LegajoDetailResponse
  readOnly?: boolean
  onEdit?: (section: "personal" | "location" | "legajo") => void
}

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `persona-tab-${index}`,
    "aria-controls": `persona-tabpanel-${index}`,
  }
}

// Helper functions
const formatFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "No registrado"
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return fecha || "No registrado"
  }
}

const calcularEdad = (fechaNacimiento: string | null | undefined): number | null => {
  if (!fechaNacimiento) return null
  try {
    const fecha = new Date(fechaNacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - fecha.getFullYear()
    const mes = hoy.getMonth() - fecha.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--
    }
    return edad
  } catch {
    return null
  }
}

const getInitials = (nombre: string = "", apellido: string = ""): string => {
  const n = nombre?.charAt(0) || ""
  const a = apellido?.charAt(0) || ""
  return `${n}${a}`.toUpperCase() || "??"
}

const getAvatarColor = (nombre: string = ""): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ]
  const index = nombre.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add snackbar notification here
    console.log(`${label} copiado al portapapeles`)
  } catch (error) {
    console.error("Error al copiar:", error)
  }
}

export default function PersonaDetailModal({
  open,
  onClose,
  legajoData,
  readOnly = false,
  onEdit,
}: PersonaDetailModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState(0)
  const [personaCompleta, setPersonaCompleta] = useState<Record<string, unknown> | null>(null)
  const [loadingPersona, setLoadingPersona] = useState(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Extract data
  const persona = legajoData?.persona
  const legajo = legajoData?.legajo
  const asignaciones = legajoData?.asignaciones_activas || []
  const medidasActivas = legajoData?.medidas_activas || []
  const demandas = legajoData?.demandas_relacionadas
  const permisos = legajoData?.permisos_usuario

  // Fetch complete persona data including education, health, vulnerability from demanda
  useEffect(() => {
    const fetchPersonaCompleta = async () => {
      if (!open || !persona?.id) return

      setLoadingPersona(true)
      try {
        // Get the first demanda ID from demandas_relacionadas
        const demandas = legajoData?.demandas_relacionadas?.resultados || []

        if (demandas.length === 0) {
          console.log("No demandas relacionadas found")
          setPersonaCompleta(null)
          setLoadingPersona(false)
          return
        }

        // Get demanda ID (support multiple formats)
        let demandaId: number | null = null
        const firstDemanda = demandas[0]

        if (firstDemanda?.demanda?.demanda_id) {
          demandaId = firstDemanda.demanda.demanda_id
        } else if (firstDemanda?.demanda_id) {
          demandaId = firstDemanda.demanda_id
        } else if (firstDemanda?.id) {
          demandaId = firstDemanda.id
        }

        if (!demandaId) {
          console.log("Could not extract demanda ID")
          setPersonaCompleta(null)
          setLoadingPersona(false)
          return
        }

        console.log(`Fetching full-detail for demanda ${demandaId}`)

        // Fetch demanda full-detail which includes personas with education, health, vulnerability
        const response = await get<Record<string, unknown>>(`registro-demanda-form/${demandaId}/full-detail/`)

        console.log("Full-detail response:", response)
        console.log("Response has root localizacion?", response?.localizacion)

        // Find the persona in the personas array
        const personas = response?.personas || []
        console.log("Personas array length:", personas.length)
        if (personas.length > 0) {
          console.log("First persona structure:", personas[0])
          console.log("First persona has localizacion?", personas[0]?.localizacion)
        }

        const personaEnDemanda = personas.find((p: Record<string, unknown>) => (p.persona as Record<string, unknown>)?.id === persona.id)

        if (personaEnDemanda) {
          console.log("Found persona in demanda:", personaEnDemanda)
          console.log("PersonaEnDemanda.localizacion:", personaEnDemanda.localizacion)

          // If persona doesn't have localizacion, try fallbacks
          if (!personaEnDemanda.localizacion) {
            // Try root localizacion from response
            if (response?.localizacion) {
              console.log("Using root localizacion from response")
              personaEnDemanda.localizacion = response.localizacion
            }
            // Try legajo localizacion_actual as last resort
            else if (legajoData?.localizacion_actual?.localizacion) {
              console.log("Using legajoData.localizacion_actual.localizacion")
              personaEnDemanda.localizacion = legajoData.localizacion_actual.localizacion
            }
          }

          setPersonaCompleta(personaEnDemanda)
        } else {
          console.log("Persona not found in demanda personas array")
          setPersonaCompleta(null)
        }
      } catch (error) {
        console.error("Error fetching persona completa:", error)
        setPersonaCompleta(null)
      } finally {
        setLoadingPersona(false)
      }
    }

    fetchPersonaCompleta()
  }, [open, persona?.id, legajoData])

  // Calculate edad
  const edad =
    calcularEdad(persona?.fecha_nacimiento) || persona?.edad_aproximada || persona?.edad_calculada

  // Get avatar color
  const avatarColor = getAvatarColor(persona?.nombre)

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: fullScreen ? 0 : 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: avatarColor,
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {getInitials(persona?.nombre, persona?.apellido)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {persona?.nombre} {persona?.apellido}
              </Typography>
              {persona?.nombre_autopercibido && (
                <Typography variant="body2" color="text.secondary">
                  &ldquo;{persona.nombre_autopercibido}&rdquo;
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <Chip label={`DNI: ${persona?.dni || "N/A"}`} size="small" variant="outlined" />
                <Chip label={`${edad || "N/A"} años`} size="small" variant="outlined" color="primary" />
                {legajo?.urgencia?.nombre === "ALTA" && <Chip label="URGENTE" color="error" size="small" />}
                {asignaciones[0]?.zona && (
                  <Chip label={asignaciones[0].zona.nombre} size="small" variant="outlined" color="secondary" />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="cerrar"
            sx={{ alignSelf: "flex-start" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={fullScreen ? "scrollable" : "scrollable"}
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
      >
        <Tab icon={<PersonIcon />} iconPosition="start" label="Personal" {...a11yProps(0)} />
        <Tab icon={<LocationOnIcon />} iconPosition="start" label="Ubicación" {...a11yProps(1)} />
        <Tab icon={<SchoolIcon />} iconPosition="start" label="Educación" {...a11yProps(2)} />
        <Tab icon={<MedicalIcon />} iconPosition="start" label="Salud" {...a11yProps(3)} />
        <Tab icon={<WarningIcon />} iconPosition="start" label="Vulnerabilidad" {...a11yProps(4)} />
        <Tab icon={<FolderOpenIcon />} iconPosition="start" label="Legajo" {...a11yProps(5)} />
        <Tab icon={<InfoIcon />} iconPosition="start" label="Contexto" {...a11yProps(6)} />
      </Tabs>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab 1: Información Personal */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información Personal
            </Typography>
            {!readOnly && permisos?.puede_editar && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  onEdit?.("personal")
                  onClose()
                }}
                size="small"
              >
                Editar
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nombre Completo
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {persona?.nombre} {persona?.apellido}
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(`${persona?.nombre} ${persona?.apellido}`, "Nombre")}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>

            {persona?.nombre_autopercibido && (
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nombre Autopercibido
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {persona.nombre_autopercibido}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  DNI
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BadgeIcon color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {persona?.dni || "No registrado"}
                  </Typography>
                  {persona?.dni && (
                    <IconButton size="small" onClick={() => copyToClipboard(String(persona.dni), "DNI")}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {persona?.situacion_dni && (
                  <Chip label={persona.situacion_dni} size="small" sx={{ mt: 1 }} variant="outlined" />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Fecha de Nacimiento
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatFecha(persona?.fecha_nacimiento)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Edad: {edad || "No calculada"} años
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Género
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {persona?.genero || "No especificado"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nacionalidad
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {persona?.nacionalidad || "No especificada"}
                </Typography>
              </Paper>
            </Grid>

            {persona?.telefono && (
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Teléfono
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {persona.telefono}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(String(persona.telefono), "Teléfono")}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            )}

            {persona?.observaciones && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Observaciones
                  </Typography>
                  <Typography variant="body1">{persona.observaciones}</Typography>
                </Paper>
              </Grid>
            )}

            {persona?.fecha_defuncion && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fecha de Defunción
                  </Typography>
                  <Typography variant="body2">{formatFecha(persona.fecha_defuncion)}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 2: Ubicación y Contacto */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ubicación y Contacto
            </Typography>
            {!readOnly && permisos?.puede_editar && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  onEdit?.("location")
                  onClose()
                }}
                size="small"
              >
                Editar
              </Button>
            )}
          </Box>

          {loadingPersona ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : personaCompleta?.localizacion ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <HomeIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Dirección Completa
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.localizacion.tipo_calle || ""} {personaCompleta.localizacion.calle || ""}
                    {personaCompleta.localizacion.casa_nro ? ` N° ${personaCompleta.localizacion.casa_nro}` : ""}
                    {personaCompleta.localizacion.piso_depto ? `, Piso ${personaCompleta.localizacion.piso_depto}` : ""}
                  </Typography>
                </Paper>
              </Grid>

              {personaCompleta.localizacion.barrio && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Barrio
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.localizacion.barrio}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.localizacion.localidad?.nombre && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Localidad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.localizacion.localidad.nombre}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.localizacion.cpc && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CPC
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.localizacion.cpc}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.localizacion.referencia_geo && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Referencia Geográfica
                    </Typography>
                    <Typography variant="body1">{personaCompleta.localizacion.referencia_geo}</Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.localizacion.mza && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Manzana
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.localizacion.mza}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.localizacion.lote && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Lote
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.localizacion.lote}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {persona?.telefono && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Teléfono de Contacto
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon color="action" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {persona.telefono}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(String(persona.telefono), "Teléfono")}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              No hay información de ubicación registrada para esta persona.
            </Alert>
          )}
        </TabPanel>

        {/* Tab 3: Información Educativa */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Información Educativa
          </Typography>

          {loadingPersona ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : personaCompleta?.educacion ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <SchoolIcon color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Institución Educativa
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.educacion.institucion_educativa?.nombre || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nivel Alcanzado
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.educacion.nivel_alcanzado || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estado de Escolarización
                  </Typography>
                  <Chip
                    label={personaCompleta.educacion.esta_escolarizado ? "Escolarizado" : "No escolarizado"}
                    color={personaCompleta.educacion.esta_escolarizado ? "success" : "default"}
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              {personaCompleta.educacion.ultimo_cursado && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Último Cursado
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.educacion.ultimo_cursado}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.educacion.tipo_escuela && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tipo de Escuela
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {personaCompleta.educacion.tipo_escuela}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.educacion.comentarios_educativos && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Comentarios Educativos
                    </Typography>
                    <Typography variant="body1">{personaCompleta.educacion.comentarios_educativos}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              No hay información educativa registrada para esta persona.
            </Alert>
          )}
        </TabPanel>

        {/* Tab 4: Información de Salud */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Información de Salud
          </Typography>

          {loadingPersona ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : personaCompleta?.cobertura_medica ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <LocalHospitalIcon color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Institución Sanitaria
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.cobertura_medica.institucion_sanitaria?.nombre || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Obra Social
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.cobertura_medica.obra_social || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tipo de Intervención
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {personaCompleta.cobertura_medica.intervencion || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Asignación Universal por Hijo (AUH)
                  </Typography>
                  <Chip
                    label={personaCompleta.cobertura_medica.auh ? "Sí" : "No"}
                    color={personaCompleta.cobertura_medica.auh ? "success" : "default"}
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              {personaCompleta.cobertura_medica.medico_cabecera && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      Médico de Cabecera
                    </Typography>
                    <Grid container spacing={2}>
                      {personaCompleta.cobertura_medica.medico_cabecera.nombre && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Nombre
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {personaCompleta.cobertura_medica.medico_cabecera.nombre}
                          </Typography>
                        </Grid>
                      )}
                      {personaCompleta.cobertura_medica.medico_cabecera.mail && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {personaCompleta.cobertura_medica.medico_cabecera.mail}
                          </Typography>
                        </Grid>
                      )}
                      {personaCompleta.cobertura_medica.medico_cabecera.telefono && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {personaCompleta.cobertura_medica.medico_cabecera.telefono}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.cobertura_medica.observaciones && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Observaciones Médicas
                    </Typography>
                    <Typography variant="body1">{personaCompleta.cobertura_medica.observaciones}</Typography>
                  </Paper>
                </Grid>
              )}

              {personaCompleta.persona_enfermedades && personaCompleta.persona_enfermedades.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Enfermedades Registradas
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {(personaCompleta.persona_enfermedades as Array<Record<string, unknown>>).map((enfermedad: Record<string, unknown>, idx: number) => (
                        <Chip
                          key={idx}
                          label={(enfermedad.nombre as string) || String(enfermedad)}
                          variant="outlined"
                          color="warning"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              No hay información de salud registrada para esta persona.
            </Alert>
          )}
        </TabPanel>

        {/* Tab 5: Condiciones de Vulnerabilidad */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Condiciones de Vulnerabilidad
          </Typography>

          {loadingPersona ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : personaCompleta?.condiciones_vulnerabilidad && personaCompleta.condiciones_vulnerabilidad.length > 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  Se han identificado {personaCompleta.condiciones_vulnerabilidad.length} condiciones de vulnerabilidad
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Condiciones Identificadas
                  </Typography>
                  <List dense>
                    {(personaCompleta.condiciones_vulnerabilidad as Array<Record<string, unknown>>).map((condicion: Record<string, unknown>, idx: number) => (
                      <ListItem key={idx} divider={idx < (personaCompleta.condiciones_vulnerabilidad as Array<Record<string, unknown>>).length - 1}>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={condicion.condicion_vulnerabilidad?.nombre || condicion.nombre || "Condición"}
                          secondary={
                            condicion.condicion_vulnerabilidad?.descripcion ||
                            condicion.descripcion ||
                            `Peso: ${condicion.condicion_vulnerabilidad?.peso || condicion.peso || "N/A"}`
                          }
                        />
                        {(condicion.condicion_vulnerabilidad?.peso || condicion.peso) && (
                          <Chip
                            label={`Peso: ${condicion.condicion_vulnerabilidad?.peso || condicion.peso}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {personaCompleta.condiciones_vulnerabilidad.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "warning.light", color: "warning.contrastText" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Peso Total de Vulnerabilidad
                    </Typography>
                    <Typography variant="h4">
                      {personaCompleta.condiciones_vulnerabilidad.reduce(
                        (sum: number, c: any) =>
                          sum + (c.condicion_vulnerabilidad?.peso || c.peso || 0),
                        0
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              No se han identificado condiciones de vulnerabilidad para esta persona.
            </Alert>
          )}
        </TabPanel>

        {/* Tab 6: Información del Legajo */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información del Legajo
            </Typography>
            {!readOnly && permisos?.puede_editar && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  onEdit?.("legajo")
                  onClose()
                }}
                size="small"
              >
                Editar
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Número de Legajo
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {legajo?.numero || "N/A"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estado
                </Typography>
                <Chip
                  label={
                    typeof legajo?.estado === 'string'
                      ? legajo.estado
                      : (typeof legajo?.estado === 'object' && legajo.estado && 'estado' in legajo.estado)
                        ? legajo.estado.estado
                        : "N/A"
                  }
                  color="primary"
                  variant="outlined"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Fecha de Apertura
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatFecha(legajo?.fecha_apertura)}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Última Actualización
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatFecha(legajo?.ultima_actualizacion)}
                </Typography>
              </Paper>
            </Grid>

            {legajo?.urgencia && (
              <Grid item xs={12}>
                <Alert severity={legajo.urgencia.nombre === "ALTA" ? "error" : "info"}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nivel de Urgencia
                  </Typography>
                  <Chip label={legajo.urgencia.nombre} color={legajo.urgencia.nombre === "ALTA" ? "error" : "default"} />
                </Alert>
              </Grid>
            )}

            {asignaciones.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Asignaciones Activas
                  </Typography>
                  <List dense>
                    {asignaciones.map((asig: any, idx: number) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <AssignmentIndIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={asig.user_responsable?.nombre_completo || "Sin asignar"}
                          secondary={`${asig.zona?.nombre || "Sin zona"} - ${asig.tipo_responsabilidad || ""}`}
                        />
                        {asig.recibido && <CheckCircleIcon color="success" fontSize="small" />}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 7: Contexto Adicional */}
        <TabPanel value={activeTab} index={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Contexto Adicional
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {medidasActivas?.length || 0}
                </Typography>
                <Typography variant="caption">Medidas Activas</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="secondary">
                  {demandas?.resumen?.total_demandas || 0}
                </Typography>
                <Typography variant="caption">Demandas Relacionadas</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {demandas?.resumen?.con_medidas_creadas || 0}
                </Typography>
                <Typography variant="caption">Con Medidas Creadas</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {demandas?.resumen?.activas || 0}
                </Typography>
                <Typography variant="caption">Demandas Activas</Typography>
              </Paper>
            </Grid>

            {medidasActivas && medidasActivas.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Medidas Activas Detalle
                  </Typography>
                  <List dense>
                    {medidasActivas.map((medida: any, idx: number) => {
                      // Safely extract string values from potentially nested objects
                      const numeroMedida = typeof medida.numero_medida === 'string'
                        ? medida.numero_medida
                        : (medida.numero || `M-${medida.id}`)

                      const tipoMedidaDisplay = typeof medida.tipo_medida_display === 'string'
                        ? medida.tipo_medida_display
                        : (typeof medida.tipo_medida === 'string' ? medida.tipo_medida : 'N/A')

                      const estadoDisplay = typeof medida.estado_vigencia_display === 'string'
                        ? medida.estado_vigencia_display
                        : (typeof medida.estado_vigencia === 'string'
                          ? medida.estado_vigencia
                          : (typeof medida.estado === 'string' ? medida.estado : 'N/A'))

                      const tipoMedida = typeof medida.tipo_medida === 'string'
                        ? medida.tipo_medida
                        : (typeof medida.tipo === 'string' ? medida.tipo : 'N/A')

                      return (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={numeroMedida}
                            secondary={`${tipoMedidaDisplay} - ${estadoDisplay}`}
                          />
                          <Chip label={tipoMedida} size="small" variant="outlined" />
                        </ListItem>
                      )
                    })}
                  </List>
                </Paper>
              </Grid>
            )}

            {permisos && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Permisos del Usuario
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    {permisos.puede_editar && <Chip label="Editar" size="small" color="primary" />}
                    {permisos.puede_agregar_documentos && <Chip label="Agregar Documentos" size="small" />}
                    {permisos.puede_tomar_medidas && <Chip label="Tomar Medidas" size="small" />}
                    {permisos.puede_asignar_zonas && <Chip label="Asignar Zonas" size="small" />}
                    {permisos.puede_reasignar && <Chip label="Reasignar" size="small" />}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </DialogContent>
    </Dialog>
  )
}
