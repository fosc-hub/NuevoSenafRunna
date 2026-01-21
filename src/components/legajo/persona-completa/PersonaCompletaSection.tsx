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
} from "@mui/icons-material"
import {
  PersonalInfoDisplay,
  EducationDisplay,
  HealthDisplay,
  VulnerabilityDisplay,
} from "./display"
import type { PersonaCompletaSectionProps, TabId } from "./types/persona-completa.types"

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
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState(0)

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

  // Calculate age
  const edad = persona.edad_calculada ?? persona.edad_aproximada

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
          bgcolor: expanded ? "primary.50" : "grey.50",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          "&:hover": {
            bgcolor: expanded ? "primary.100" : "grey.100",
          },
        }}
        onClick={toggleExpanded}
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
              <VisibilityIcon fontSize="small" color="primary" />
              Ver todos los datos de {persona.nombre} {persona.apellido}
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
            </Box>
          </Box>
        </Box>
        <IconButton size="large">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Divider />

        {/* Tabs */}
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

        {/* Tab Panels */}
        <Box sx={{ px: 3 }}>
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
        </Box>

        {/* Footer Actions */}
        <Divider />
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={toggleExpanded}
            startIcon={<CloseIcon />}
          >
            Cerrar
          </Button>
          {showEditButton && onEdit && (
            <Button
              variant="contained"
              size="small"
              onClick={onEdit}
            >
              Editar datos
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default PersonaCompletaSection
