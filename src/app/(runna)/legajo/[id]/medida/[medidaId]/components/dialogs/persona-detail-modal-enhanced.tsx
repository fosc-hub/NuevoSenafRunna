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
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material"
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
  People as PeopleIcon,
} from "@mui/icons-material"
import { usePersonaCondicionesVulnerabilidad } from "../../hooks/usePersonaData"
import { useNNyAData } from "../../hooks/usePersonasRelacionadas"
import { buildFullAddress } from "../../api/localizacion-api-service"
import { updateNNyAData, type NNyAUpdateRequest } from "../../api/personas-relacionadas-api-service"
import { PersonasRelacionadasSection } from "../personas-relacionadas"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { toast } from "react-toastify"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { fetchDropdownData } from "@/components/forms/utils/fetchFormCase"
import type { DropdownData } from "@/components/forms/types/formTypes"
import { Autocomplete } from "@mui/material"

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
    console.log(`${label} copiado al portapapeles`)
  } catch (error) {
    console.error("Error al copiar:", error)
  }
}

// Form state interface for inline editing
interface PersonaFormState {
  // Personal info
  nombre: string
  nombre_autopercibido: string
  apellido: string
  fecha_nacimiento: string
  edad_aproximada: string
  nacionalidad: string
  dni: string
  situacion_dni: string
  genero: string
  telefono: string
  observaciones: string
  // Location - FKs are numbers, strings for text fields
  calle: string
  numero: string
  piso: string
  departamento: string
  barrio: number | null // FK
  localidad: number | null // FK
  cpc: number | null // FK
  referencia_geo: string
  mza: string // Will be converted to number on save
  lote: string // Will be converted to number on save
  // Education - FK for institucion, enum keys for choices
  institucion_educativa: number | null // FK
  nivel_alcanzado: string // Enum key
  esta_escolarizado: boolean
  ultimo_cursado: string // Enum key
  tipo_escuela: string // Enum key
  comentarios_educativos: string
  // Health - FK for institucion and medico, enum keys for choices
  institucion_sanitaria: number | null // FK
  obra_social: string // Enum key
  intervencion: string // Enum key
  auh: boolean
  medico_cabecera: number | null // FK to TMedico
  // Display-only fields for medico (read from API, not sent back)
  medico_nombre: string
  medico_mail: string
  medico_telefono: string
  observaciones_medicas: string
  // Vulnerability
  condiciones_vulnerabilidad: number[]
}

const initialFormState: PersonaFormState = {
  nombre: "",
  nombre_autopercibido: "",
  apellido: "",
  fecha_nacimiento: "",
  edad_aproximada: "",
  nacionalidad: "",
  dni: "",
  situacion_dni: "",
  genero: "",
  telefono: "",
  observaciones: "",
  calle: "",
  numero: "",
  piso: "",
  departamento: "",
  barrio: null,
  localidad: null,
  cpc: null,
  referencia_geo: "",
  mza: "",
  lote: "",
  institucion_educativa: null,
  nivel_alcanzado: "",
  esta_escolarizado: false,
  ultimo_cursado: "",
  tipo_escuela: "",
  comentarios_educativos: "",
  institucion_sanitaria: null,
  obra_social: "",
  intervencion: "",
  auh: false,
  medico_cabecera: null,
  medico_nombre: "",
  medico_mail: "",
  medico_telefono: "",
  observaciones_medicas: "",
  condiciones_vulnerabilidad: [],
}

export default function PersonaDetailModalEnhanced({
  open,
  onClose,
  legajoData,
  readOnly = false,
  onEdit,
}: PersonaDetailModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"))
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<PersonaFormState>(initialFormState)

  // Extract data
  const persona = legajoData?.persona
  const legajo = legajoData?.legajo
  const asignaciones = legajoData?.asignaciones_activas || []
  const medidasActivas = legajoData?.medidas_activas || []
  const demandas = legajoData?.demandas_relacionadas
  const permisos = legajoData?.permisos_usuario
  const personaId = persona?.id
  const legajoId = legajo?.id

  // Fetch NNyA data from unified endpoint (includes localizacion, educacion, cobertura_medica)
  const { data: nnyaData, isLoading: loadingNNyA } = useNNyAData(legajoId, {
    enabled: open && !!legajoId,
  })

  // Extract data from NNyA response
  const localizacion = nnyaData?.localizacion || null
  const educacion = nnyaData?.educacion || null
  const saludData = nnyaData ? {
    cobertura_medica: nnyaData.cobertura_medica || null,
    persona_enfermedades: nnyaData.persona_enfermedades || [],
  } : null

  // Loading states derived from NNyA loading
  const loadingLocalizacion = loadingNNyA
  const loadingEducacion = loadingNNyA
  const loadingSalud = loadingNNyA

  // Fetch vulnerability data (separate endpoint for now)
  const { data: vulnerabilidadData, isLoading: loadingVulnerabilidad } = usePersonaCondicionesVulnerabilidad(
    personaId,
    {
      enabled: open && !!personaId && activeTab === 4, // Only load when Vulnerability tab is active
    }
  )

  // Fetch dropdown data for edit mode
  const { data: dropdownData, isLoading: loadingDropdowns } = useQuery<DropdownData>({
    queryKey: ["registro-demanda-form-dropdowns"],
    queryFn: fetchDropdownData,
    enabled: open && isEditing,
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Initialize form data when entering edit mode
  const initializeFormData = () => {
    // Helper to extract ID from object or return value if already a number
    const extractId = (value: any): number | null => {
      if (!value) return null
      if (typeof value === "number") return value
      if (typeof value === "object" && value.id) return value.id
      return null
    }

    // Use NNyA data which has the correct field names from /api/legajos/{id}/nnya/
    const loc = localizacion as any
    const edu = educacion as any
    const salud = saludData?.cobertura_medica as any

    setFormData({
      nombre: nnyaData?.nombre || persona?.nombre || "",
      nombre_autopercibido: nnyaData?.nombre_autopercibido || persona?.nombre_autopercibido || "",
      apellido: nnyaData?.apellido || persona?.apellido || "",
      fecha_nacimiento: nnyaData?.fecha_nacimiento || persona?.fecha_nacimiento || "",
      edad_aproximada: (nnyaData?.edad_aproximada || persona?.edad_aproximada)?.toString() || "",
      nacionalidad: nnyaData?.nacionalidad || persona?.nacionalidad || "",
      dni: (nnyaData?.dni || persona?.dni)?.toString() || "",
      situacion_dni: nnyaData?.situacion_dni || persona?.situacion_dni || "",
      genero: nnyaData?.genero || persona?.genero || "",
      telefono: (nnyaData?.telefono || persona?.telefono)?.toString() || "",
      observaciones: nnyaData?.observaciones || persona?.observaciones || "",
      // Location - NNyA response uses casa_nro, piso_depto, and FKs are already integers
      calle: loc?.calle || "",
      numero: loc?.casa_nro?.toString() || "", // API field is casa_nro
      piso: loc?.piso_depto || "", // API field is piso_depto
      departamento: "", // Not in NNyA response
      barrio: typeof loc?.barrio === "number" ? loc.barrio : extractId(loc?.barrio),
      localidad: typeof loc?.localidad === "number" ? loc.localidad : extractId(loc?.localidad),
      cpc: typeof loc?.cpc === "number" ? loc.cpc : extractId(loc?.cpc),
      referencia_geo: loc?.referencia_geo || "",
      mza: loc?.mza?.toString() || "",
      lote: loc?.lote?.toString() || "",
      // Education - institucion_educativa can be object with id/nombre
      institucion_educativa: extractId(edu?.institucion_educativa),
      nivel_alcanzado: edu?.nivel_alcanzado || "",
      esta_escolarizado: edu?.esta_escolarizado || false,
      ultimo_cursado: edu?.ultimo_cursado || "",
      tipo_escuela: edu?.tipo_escuela || "",
      comentarios_educativos: edu?.comentarios_educativos || "",
      // Health - institucion_sanitaria can be object with id/nombre
      institucion_sanitaria: extractId(salud?.institucion_sanitaria),
      obra_social: salud?.obra_social || "",
      intervencion: salud?.intervencion || "",
      auh: salud?.auh || false,
      medico_cabecera: extractId(salud?.medico_cabecera),
      // Display-only fields for medico info
      medico_nombre: salud?.medico_cabecera?.nombre || "",
      medico_mail: salud?.medico_cabecera?.mail || "",
      medico_telefono: salud?.medico_cabecera?.telefono || "",
      observaciones_medicas: salud?.observaciones || "",
      // Vulnerability
      condiciones_vulnerabilidad: vulnerabilidadData?.condiciones_vulnerabilidad?.map((c: any) => c.condicion_vulnerabilidad?.id || c.id) || [],
    })
  }

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    initializeFormData()
    setIsEditing(true)
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData(initialFormState)
  }

  // Handle form field change
  const handleFieldChange = (field: keyof PersonaFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle saving changes
  const handleSave = async () => {
    if (!legajo?.id) {
      toast.error("No se puede guardar: ID de legajo no disponible")
      return
    }

    setIsSaving(true)
    try {
      // Helper to parse integer or return null
      const parseIntOrNull = (value: string | number | null | undefined): number | null => {
        if (value === null || value === undefined || value === "") return null
        const parsed = typeof value === "number" ? value : parseInt(value, 10)
        return isNaN(parsed) ? null : parsed
      }

      const updateData: NNyAUpdateRequest = {
        nombre: formData.nombre || undefined,
        nombre_autopercibido: formData.nombre_autopercibido || null,
        apellido: formData.apellido || undefined,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        edad_aproximada: parseIntOrNull(formData.edad_aproximada),
        nacionalidad: formData.nacionalidad || null,
        dni: parseIntOrNull(formData.dni),
        situacion_dni: formData.situacion_dni || null,
        genero: formData.genero || null,
        telefono: formData.telefono || null,
        observaciones: formData.observaciones || null,
        localizacion: {
          calle: formData.calle || undefined,
          casa_nro: formData.numero || "", // NOT NULL in DB - send empty string if not provided
          piso: formData.piso || undefined,
          departamento: formData.departamento || undefined,
          barrio: formData.barrio, // FK - already number or null
          localidad: formData.localidad, // FK - already number or null
          cpc: formData.cpc, // FK - already number or null
          referencia_geo: formData.referencia_geo || undefined,
          mza: parseIntOrNull(formData.mza), // Convert to integer
          lote: parseIntOrNull(formData.lote), // Convert to integer
        },
        educacion: {
          institucion_educativa: formData.institucion_educativa, // FK - already number or null
          nivel_alcanzado: formData.nivel_alcanzado || null, // Enum key
          esta_escolarizado: formData.esta_escolarizado,
          ultimo_cursado: formData.ultimo_cursado || null, // Enum key
          tipo_escuela: formData.tipo_escuela || null, // Enum key
          comentarios_educativos: formData.comentarios_educativos || null,
        },
        cobertura_medica: {
          institucion_sanitaria: formData.institucion_sanitaria, // FK - already number or null
          obra_social: formData.obra_social || null, // Enum key
          intervencion: formData.intervencion || null, // Enum key
          auh: formData.auh,
          medico_cabecera: formData.medico_cabecera, // FK - integer or null
          observaciones: formData.observaciones_medicas || null,
        },
      }

      await updateNNyAData(legajo.id, updateData)
      toast.success("Datos actualizados correctamente")

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["legajo-detail"] })
      queryClient.invalidateQueries({ queryKey: ["nnya-data"] })
      queryClient.invalidateQueries({ queryKey: ["persona-localizacion"] })
      queryClient.invalidateQueries({ queryKey: ["persona-educacion"] })
      queryClient.invalidateQueries({ queryKey: ["persona-cobertura-medica"] })
      queryClient.invalidateQueries({ queryKey: ["persona-condiciones-vulnerabilidad"] })

      setIsEditing(false)
    } catch (error: any) {
      console.error("[PersonaDetailModal] Error saving:", error)
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || "Error al guardar los cambios"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate edad
  const edad =
    calcularEdad(persona?.fecha_nacimiento) || persona?.edad_aproximada || persona?.edad_calculada

  // Get avatar color
  const avatarColor = getAvatarColor(persona?.nombre)

  // Full address for location tab
  const fullAddress = localizacion ? buildFullAddress(localizacion) : "N/A"

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
        <Tab icon={<PeopleIcon />} iconPosition="start" label="Familia" {...a11yProps(5)} />
        <Tab icon={<FolderOpenIcon />} iconPosition="start" label="Legajo" {...a11yProps(6)} />
        <Tab icon={<InfoIcon />} iconPosition="start" label="Contexto" {...a11yProps(7)} />
      </Tabs>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab 0: Información Personal */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información Personal
            </Typography>
            {!readOnly && permisos?.puede_editar && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEnterEditMode}
                size="small"
              >
                Editar
              </Button>
            )}
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  size="small"
                  color="inherit"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                  disabled={isSaving}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </Box>

          {isEditing ? (
            // Edit mode
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange("nombre", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => handleFieldChange("apellido", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Autopercibido"
                  value={formData.nombre_autopercibido}
                  onChange={(e) => handleFieldChange("nombre_autopercibido", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DNI"
                  value={formData.dni}
                  onChange={(e) => handleFieldChange("dni", e.target.value)}
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Situación DNI"
                  value={formData.situacion_dni}
                  onChange={(e) => handleFieldChange("situacion_dni", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => handleFieldChange("fecha_nacimiento", e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Edad Aproximada"
                  value={formData.edad_aproximada}
                  onChange={(e) => handleFieldChange("edad_aproximada", e.target.value)}
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={formData.genero}
                    label="Género"
                    onChange={(e) => handleFieldChange("genero", e.target.value)}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                    <MenuItem value="NO_BINARIO">No Binario</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nacionalidad"
                  value={formData.nacionalidad}
                  onChange={(e) => handleFieldChange("nacionalidad", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleFieldChange("telefono", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleFieldChange("observaciones", e.target.value)}
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          ) : (
            // View mode
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

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Teléfono
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {persona?.telefono || "No registrado"}
                    </Typography>
                    {persona?.telefono && (
                      <IconButton size="small" onClick={() => copyToClipboard(String(persona.telefono), "Teléfono")}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Paper>
              </Grid>

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
          )}
        </TabPanel>

        {/* Tab 1: Ubicación y Contacto */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ubicación y Contacto
            </Typography>
            {!readOnly && permisos?.puede_editar && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEnterEditMode}
                size="small"
              >
                Editar
              </Button>
            )}
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  size="small"
                  color="inherit"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                  disabled={isSaving}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </Box>

          {loadingLocalizacion ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isEditing ? (
            // Edit mode
            <Grid container spacing={2}>
              {loadingDropdowns ? (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Calle"
                      value={formData.calle}
                      onChange={(e) => handleFieldChange("calle", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Número"
                      value={formData.numero}
                      onChange={(e) => handleFieldChange("numero", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Piso"
                      value={formData.piso}
                      onChange={(e) => handleFieldChange("piso", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Departamento"
                      value={formData.departamento}
                      onChange={(e) => handleFieldChange("departamento", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.barrio || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        (dropdownData?.barrio || [])
                          .find((item: any) => item.id === formData.barrio) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("barrio", newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} label="Barrio" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.localidad || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        (dropdownData?.localidad || [])
                          .find((item: any) => item.id === formData.localidad) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("localidad", newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} label="Localidad" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.cpc || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        (dropdownData?.cpc || [])
                          .find((item: any) => item.id === formData.cpc) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("cpc", newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} label="CPC" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Manzana"
                      value={formData.mza}
                      onChange={(e) => handleFieldChange("mza", e.target.value)}
                      size="small"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Lote"
                      value={formData.lote}
                      onChange={(e) => handleFieldChange("lote", e.target.value)}
                      size="small"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Referencia Geográfica"
                      value={formData.referencia_geo}
                      onChange={(e) => handleFieldChange("referencia_geo", e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          ) : localizacion ? (
            // View mode with data
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
                    {fullAddress}
                  </Typography>
                </Paper>
              </Grid>

              {((localizacion as any).barrio_nombre || (localizacion as any).barrio) && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Barrio
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(localizacion as any).barrio_nombre || (localizacion as any).barrio}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {((localizacion as any).localidad_nombre || (localizacion as any).localidad?.nombre) && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Localidad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(localizacion as any).localidad_nombre || (localizacion as any).localidad?.nombre}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {((localizacion as any).cpc_nombre || (localizacion as any).cpc) && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CPC
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(localizacion as any).cpc_nombre || (localizacion as any).cpc}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {localizacion.referencia_geo && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Referencia Geográfica
                    </Typography>
                    <Typography variant="body1">{localizacion.referencia_geo}</Typography>
                  </Paper>
                </Grid>
              )}

              {localizacion.mza && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Manzana
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {localizacion.mza}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {localizacion.lote && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Lote
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {localizacion.lote}
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
              {!readOnly && permisos?.puede_editar && (
                <Button
                  size="small"
                  onClick={handleEnterEditMode}
                  sx={{ ml: 2 }}
                >
                  Agregar información
                </Button>
              )}
            </Alert>
          )}
        </TabPanel>

        {/* Tab 2: Información Educativa */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información Educativa
            </Typography>
            {!readOnly && permisos?.puede_editar && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEnterEditMode}
                size="small"
              >
                Editar
              </Button>
            )}
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  size="small"
                  color="inherit"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                  disabled={isSaving}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </Box>

          {loadingEducacion ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isEditing ? (
            // Edit mode
            <Grid container spacing={2}>
              {loadingDropdowns ? (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={dropdownData?.instituciones_educativas || dropdownData?.institucion_educativa || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        (dropdownData?.instituciones_educativas || dropdownData?.institucion_educativa || [])
                          .find((item: any) => item.id === formData.institucion_educativa) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("institucion_educativa", newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} label="Institución Educativa" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.nivel_alcanzado_choices || dropdownData?.nivel_educativo_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={
                        (dropdownData?.nivel_alcanzado_choices || dropdownData?.nivel_educativo_choices || [])
                          .find((item: any) => item.key === formData.nivel_alcanzado) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("nivel_alcanzado", newValue?.key || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Nivel Alcanzado" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.esta_escolarizado}
                          onChange={(e) => handleFieldChange("esta_escolarizado", e.target.checked)}
                        />
                      }
                      label="Está Escolarizado"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.ultimo_cursado_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={
                        (dropdownData?.ultimo_cursado_choices || [])
                          .find((item: any) => item.key === formData.ultimo_cursado) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("ultimo_cursado", newValue?.key || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Último Cursado" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.tipo_escuela_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={
                        (dropdownData?.tipo_escuela_choices || [])
                          .find((item: any) => item.key === formData.tipo_escuela) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("tipo_escuela", newValue?.key || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Tipo de Escuela" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Comentarios Educativos"
                      value={formData.comentarios_educativos}
                      onChange={(e) => handleFieldChange("comentarios_educativos", e.target.value)}
                      size="small"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          ) : educacion ? (
            // View mode with data
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
                    {educacion.institucion_educativa?.nombre || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nivel Alcanzado
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {educacion.nivel_alcanzado || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estado de Escolarización
                  </Typography>
                  <Chip
                    label={educacion.esta_escolarizado ? "Escolarizado" : "No escolarizado"}
                    color={educacion.esta_escolarizado ? "success" : "default"}
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              {educacion.ultimo_cursado && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Último Cursado
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {educacion.ultimo_cursado}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {educacion.tipo_escuela && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tipo de Escuela
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {educacion.tipo_escuela}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {educacion.comentarios_educativos && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Comentarios Educativos
                    </Typography>
                    <Typography variant="body1">{educacion.comentarios_educativos}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">
              No hay información educativa registrada para esta persona.
              {!readOnly && permisos?.puede_editar && (
                <Button
                  size="small"
                  onClick={handleEnterEditMode}
                  sx={{ ml: 2 }}
                >
                  Agregar información
                </Button>
              )}
            </Alert>
          )}
        </TabPanel>

        {/* Tab 3: Información de Salud */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información de Salud
            </Typography>
            {!readOnly && permisos?.puede_editar && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEnterEditMode}
                size="small"
              >
                Editar
              </Button>
            )}
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  size="small"
                  color="inherit"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                  disabled={isSaving}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </Box>

          {loadingSalud ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isEditing ? (
            // Edit mode
            <Grid container spacing={2}>
              {loadingDropdowns ? (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={dropdownData?.instituciones_sanitarias || dropdownData?.institucion_sanitaria || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        (dropdownData?.instituciones_sanitarias || dropdownData?.institucion_sanitaria || [])
                          .find((item: any) => item.id === formData.institucion_sanitaria) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("institucion_sanitaria", newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} label="Institución Sanitaria" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.obra_social_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={
                        (dropdownData?.obra_social_choices || [])
                          .find((item: any) => item.key === formData.obra_social) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("obra_social", newValue?.key || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Obra Social" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={dropdownData?.intervencion_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={
                        (dropdownData?.intervencion_choices || [])
                          .find((item: any) => item.key === formData.intervencion) || null
                      }
                      onChange={(_, newValue) => handleFieldChange("intervencion", newValue?.key || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Tipo de Intervención" size="small" />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.auh}
                          onChange={(e) => handleFieldChange("auh", e.target.checked)}
                        />
                      }
                      label="Asignación Universal por Hijo (AUH)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Médico de Cabecera
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Nombre del Médico"
                      value={formData.medico_nombre}
                      onChange={(e) => handleFieldChange("medico_nombre", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Email del Médico"
                      value={formData.medico_mail}
                      onChange={(e) => handleFieldChange("medico_mail", e.target.value)}
                      size="small"
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Teléfono del Médico"
                      value={formData.medico_telefono}
                      onChange={(e) => handleFieldChange("medico_telefono", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Observaciones Médicas"
                      value={formData.observaciones_medicas}
                      onChange={(e) => handleFieldChange("observaciones_medicas", e.target.value)}
                      size="small"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          ) : saludData?.cobertura_medica ? (
            // View mode with data
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
                    {saludData.cobertura_medica.institucion_sanitaria?.nombre || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Obra Social
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {saludData.cobertura_medica.obra_social || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tipo de Intervención
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {saludData.cobertura_medica.intervencion || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Asignación Universal por Hijo (AUH)
                  </Typography>
                  <Chip
                    label={saludData.cobertura_medica.auh ? "Sí" : "No"}
                    color={saludData.cobertura_medica.auh ? "success" : "default"}
                    variant="outlined"
                  />
                </Paper>
              </Grid>

              {saludData.cobertura_medica.medico_cabecera && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      Médico de Cabecera
                    </Typography>
                    <Grid container spacing={2}>
                      {saludData.cobertura_medica.medico_cabecera.nombre && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Nombre
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {saludData.cobertura_medica.medico_cabecera.nombre}
                          </Typography>
                        </Grid>
                      )}
                      {saludData.cobertura_medica.medico_cabecera.mail && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {saludData.cobertura_medica.medico_cabecera.mail}
                          </Typography>
                        </Grid>
                      )}
                      {saludData.cobertura_medica.medico_cabecera.telefono && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {saludData.cobertura_medica.medico_cabecera.telefono}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {saludData.cobertura_medica.observaciones && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Observaciones Médicas
                    </Typography>
                    <Typography variant="body1">{saludData.cobertura_medica.observaciones}</Typography>
                  </Paper>
                </Grid>
              )}

              {saludData.persona_enfermedades && saludData.persona_enfermedades.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Enfermedades Registradas
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {saludData.persona_enfermedades.map((enfermedad: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={enfermedad.enfermedad?.nombre || enfermedad.nombre || "Enfermedad"}
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
              {!readOnly && permisos?.puede_editar && (
                <Button
                  size="small"
                  onClick={handleEnterEditMode}
                  sx={{ ml: 2 }}
                >
                  Agregar información
                </Button>
              )}
            </Alert>
          )}
        </TabPanel>

        {/* Tab 4: Condiciones de Vulnerabilidad */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Condiciones de Vulnerabilidad
            </Typography>
            {!readOnly && permisos?.puede_editar && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEnterEditMode}
                size="small"
              >
                Editar
              </Button>
            )}
            {isEditing && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  size="small"
                  color="inherit"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                  disabled={isSaving}
                >
                  Guardar
                </Button>
              </Box>
            )}
          </Box>

          {loadingVulnerabilidad ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isEditing ? (
            // Edit mode - show current conditions with ability to modify
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Las condiciones de vulnerabilidad se gestionan desde la sección de evaluación del legajo.
                  Esta vista permite visualizar las condiciones actuales.
                </Alert>
              </Grid>
              {vulnerabilidadData?.condiciones_vulnerabilidad && vulnerabilidadData.condiciones_vulnerabilidad.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      Condiciones Actuales
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {vulnerabilidadData.condiciones_vulnerabilidad.map((condicion: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={condicion.condicion_vulnerabilidad?.nombre || condicion.nombre || "Condición"}
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : vulnerabilidadData?.condiciones_vulnerabilidad && vulnerabilidadData.condiciones_vulnerabilidad.length > 0 ? (
            // View mode with data
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  Se han identificado {vulnerabilidadData.condiciones_vulnerabilidad.length} condiciones de vulnerabilidad
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Condiciones Identificadas
                  </Typography>
                  <List dense>
                    {vulnerabilidadData.condiciones_vulnerabilidad.map((condicion: any, idx: number) => (
                      <ListItem key={idx} divider={idx < vulnerabilidadData.condiciones_vulnerabilidad.length - 1}>
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

              {vulnerabilidadData.condiciones_vulnerabilidad.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "warning.light", color: "warning.contrastText" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Peso Total de Vulnerabilidad
                    </Typography>
                    <Typography variant="h4">
                      {vulnerabilidadData.condiciones_vulnerabilidad.reduce(
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

        {/* Tab 5: Familia / Personas Relacionadas */}
        <TabPanel value={activeTab} index={5}>
          <PersonasRelacionadasSection
            legajoId={legajo?.id || 0}
            nnyaId={persona?.id || 0}
            readOnly={readOnly}
            canEdit={permisos?.puede_editar}
          />
        </TabPanel>

        {/* Tab 6: Información del Legajo */}
        <TabPanel value={activeTab} index={6}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información del Legajo
            </Typography>
            {/* Legajo info is read-only in this modal - edit from main page */}
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
        <TabPanel value={activeTab} index={7}>
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
