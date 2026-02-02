"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Collapse,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"
import {
  PersonalInfoDisplay,
  EducationDisplay,
  HealthDisplay,
  VulnerabilityDisplay,
} from "./display"
import type { PersonaCompletaSectionProps, PersonaEditableFields } from "./types/persona-completa.types"

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
      id={`persona-completa-tabpanel-${index}`}
      aria-labelledby={`persona-completa-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `persona-completa-tab-${index}`,
    "aria-controls": `persona-completa-tabpanel-${index}`,
  }
}

// Helper to get initials
const getInitials = (nombre: string = "", apellido: string = ""): string => {
  const n = nombre?.charAt(0) || ""
  const a = apellido?.charAt(0) || ""
  return `${n}${a}`.toUpperCase() || "??"
}

// Helper to get avatar color based on name
const getAvatarColor = (nombre: string = ""): string => {
  const colors = [
    "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2",
    "#f57c00", "#0288d1", "#c2185b", "#455a64",
  ]
  const index = nombre.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

const PersonaCompletaSection: React.FC<PersonaCompletaSectionProps> = ({
  persona,
  defaultExpanded = false,
  showEditButton = false,
  onEdit,
  onSave,
  hideActions = false,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState(0)

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PersonaEditableFields>({
    nombre: persona.nombre || "",
    apellido: persona.apellido || "",
    nombre_autopercibido: persona.nombre_autopercibido || "",
    fecha_nacimiento: persona.fecha_nacimiento || "",
    nacionalidad: persona.nacionalidad || "",
    dni: persona.dni,
    situacion_dni: persona.situacion_dni || "",
    genero: persona.genero || "",
    telefono: persona.telefono,
    observaciones: persona.observaciones || "",
  })

  // Calculate counts for badges
  const condicionesCount = persona.condiciones_vulnerabilidad?.length || 0
  const vulneracionesCount = persona.vulneraciones?.length || 0
  const enfermedadesCount = persona.persona_enfermedades?.length || 0
  const hasVulnerabilityData = condicionesCount > 0 || vulneracionesCount > 0

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    // Reset form data to current persona values
    setFormData({
      nombre: persona.nombre || "",
      apellido: persona.apellido || "",
      nombre_autopercibido: persona.nombre_autopercibido || "",
      fecha_nacimiento: persona.fecha_nacimiento || "",
      nacionalidad: persona.nacionalidad || "",
      dni: persona.dni,
      situacion_dni: persona.situacion_dni || "",
      genero: persona.genero || "",
      telefono: persona.telefono,
      observaciones: persona.observaciones || "",
    })
    setEditError(null)
    setIsEditing(true)
    // Switch to Personal tab when entering edit mode
    setActiveTab(0)
  }

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditError(null)
  }

  // Handle saving
  const handleSave = async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      setEditError(null)
      await onSave(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving persona data:", error)
      setEditError(error instanceof Error ? error.message : "Error al guardar los datos")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof PersonaEditableFields) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'dni' || field === 'telefono'
        ? (value === '' ? null : Number(value))
        : value,
    }))
  }

  // Calculate age
  const edad = persona.edad_calculada ?? persona.edad_aproximada

  // Determine if we should use inline editing (onSave provided) or external dialog (onEdit provided)
  const useInlineEditing = !!onSave
  const handleEditClick = () => {
    if (useInlineEditing) {
      handleEnterEditMode()
    } else if (onEdit) {
      onEdit()
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: "hidden",
        borderColor: expanded ? "primary.main" : "divider",
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Header - Always Visible */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: isEditing ? "warning.50" : (expanded ? "primary.50" : "grey.50"),
          cursor: isEditing ? "default" : "pointer",
          transition: "background-color 0.3s ease",
          "&:hover": {
            bgcolor: isEditing ? "warning.50" : (expanded ? "primary.100" : "grey.100"),
          },
        }}
        onClick={isEditing ? undefined : toggleExpanded}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: getAvatarColor(persona.nombre),
              width: 48,
              height: 48,
            }}
          >
            {getInitials(persona.nombre, persona.apellido)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
              {isEditing ? (
                <>
                  <EditIcon fontSize="small" color="warning" />
                  Editando datos de {persona.nombre} {persona.apellido}
                </>
              ) : (
                <>
                  <VisibilityIcon fontSize="small" color="primary" />
                  Ver todos los datos de {persona.nombre} {persona.apellido}
                </>
              )}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
              {persona.dni && (
                <Chip label={`DNI: ${persona.dni}`} size="small" variant="outlined" />
              )}
              {edad && (
                <Chip label={`${edad} años`} size="small" variant="outlined" />
              )}
              {hasVulnerabilityData && (
                <Chip
                  icon={<WarningIcon fontSize="small" />}
                  label={`${condicionesCount + vulneracionesCount} alertas`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {isEditing && (
                <Chip
                  label="Modo edición"
                  size="small"
                  color="warning"
                />
              )}
            </Box>
          </Box>
        </Box>
        {!isEditing && (
          <IconButton size="large">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {/* Expanded Content */}
      <Collapse in={expanded || isEditing}>
        <Divider />

        {/* Error alert */}
        {editError && (
          <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
            {editError}
          </Alert>
        )}

        {/* Tabs - Hidden during editing since we only edit Personal info */}
        {!isEditing && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : undefined}
              aria-label="Información completa de la persona"
            >
              <Tab
                icon={<PersonIcon />}
                iconPosition="start"
                label={isMobile ? undefined : "Personal"}
                {...a11yProps(0)}
              />
              <Tab
                icon={<SchoolIcon />}
                iconPosition="start"
                label={isMobile ? undefined : "Educación"}
                {...a11yProps(1)}
              />
              <Tab
                icon={
                  <Badge
                    badgeContent={enfermedadesCount}
                    color="warning"
                    max={99}
                    invisible={enfermedadesCount === 0}
                  >
                    <MedicalIcon />
                  </Badge>
                }
                iconPosition="start"
                label={isMobile ? undefined : "Salud"}
                {...a11yProps(2)}
              />
              <Tab
                icon={
                  <Badge
                    badgeContent={condicionesCount + vulneracionesCount}
                    color="error"
                    max={99}
                    invisible={!hasVulnerabilityData}
                  >
                    <WarningIcon />
                  </Badge>
                }
                iconPosition="start"
                label={isMobile ? undefined : "Vulnerabilidad"}
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>
        )}

        {/* Tab Panels / Edit Form */}
        <Box sx={{ px: 3 }}>
          {isEditing ? (
            // Edit Form
            <Box sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" />
                Editar Información Personal
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.nombre}
                    onChange={handleFieldChange("nombre")}
                    disabled={isSaving}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={formData.apellido}
                    onChange={handleFieldChange("apellido")}
                    disabled={isSaving}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre Autopercibido"
                    value={formData.nombre_autopercibido || ""}
                    onChange={handleFieldChange("nombre_autopercibido")}
                    disabled={isSaving}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="DNI"
                    type="number"
                    value={formData.dni || ""}
                    onChange={handleFieldChange("dni")}
                    disabled={isSaving}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Situación DNI"
                    value={formData.situacion_dni || ""}
                    onChange={handleFieldChange("situacion_dni")}
                    disabled={isSaving}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="VALIDO">Válido</MenuItem>
                    <MenuItem value="EN_TRAMITE">En trámite</MenuItem>
                    <MenuItem value="EXTRAVIADO">Extraviado</MenuItem>
                    <MenuItem value="SIN_DNI">Sin DNI</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento || ""}
                    onChange={handleFieldChange("fecha_nacimiento")}
                    disabled={isSaving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Género"
                    value={formData.genero || ""}
                    onChange={handleFieldChange("genero")}
                    disabled={isSaving}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                    <MenuItem value="NO_BINARIO">No Binario</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Nacionalidad"
                    value={formData.nacionalidad || ""}
                    onChange={handleFieldChange("nacionalidad")}
                    disabled={isSaving}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="ARGENTINA">Argentina</MenuItem>
                    <MenuItem value="BOLIVIANA">Boliviana</MenuItem>
                    <MenuItem value="BRASILEÑA">Brasileña</MenuItem>
                    <MenuItem value="CHILENA">Chilena</MenuItem>
                    <MenuItem value="PARAGUAYA">Paraguaya</MenuItem>
                    <MenuItem value="PERUANA">Peruana</MenuItem>
                    <MenuItem value="URUGUAYA">Uruguaya</MenuItem>
                    <MenuItem value="VENEZOLANA">Venezolana</MenuItem>
                    <MenuItem value="OTRA">Otra</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono || ""}
                    onChange={handleFieldChange("telefono")}
                    disabled={isSaving}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observaciones"
                    value={formData.observaciones || ""}
                    onChange={handleFieldChange("observaciones")}
                    disabled={isSaving}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            // View Mode - Tab Panels
            <>
              <TabPanel value={activeTab} index={0}>
                <PersonalInfoDisplay persona={persona} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <EducationDisplay persona={persona} />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <HealthDisplay persona={persona} />
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <VulnerabilityDisplay persona={persona} />
              </TabPanel>
            </>
          )}
        </Box>

        {/* Footer Actions */}
        {!hideActions && (
          <>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 1 }}>
              {isEditing ? (
                // Edit mode actions
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    startIcon={<CancelIcon />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </>
              ) : (
                // View mode actions
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleExpanded}
                    startIcon={<CloseIcon />}
                  >
                    Cerrar
                  </Button>
                  {showEditButton && (onSave || onEdit) && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleEditClick}
                      startIcon={<EditIcon />}
                    >
                      Editar datos
                    </Button>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  )
}

export default PersonaCompletaSection
