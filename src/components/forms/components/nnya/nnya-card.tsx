"use client"

import type React from "react"
import { useState } from "react"
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  Collapse,
  Divider,
  Box,
  Typography,
  Chip,
  Badge,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  Warning as WarningIcon,
  Link as LinkIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material"
import type { Control, UseFormSetValue } from "react-hook-form"
import TabPanel from "../tab-panel"
import PersonalInfoTab from "./personal-info-tab"
import EducationTab from "./education-tab"
import HealthTab from "./health-tab"
import VulnerabilityTab from "./vulnerability-tab"
import { differenceInYears, parse } from "date-fns"
import type { DropdownData, FormData } from "../../types/formTypes"

interface NNYACardProps {
  index: number
  field: any
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedFields: any
  setValue: UseFormSetValue<FormData>
  expanded: boolean
  toggleExpanded: () => void
  onDelete: () => void
  isPrincipal: boolean
}

const NNYACard: React.FC<NNYACardProps> = ({
  index,
  field,
  control,
  dropdownData,
  readOnly,
  watchedFields,
  setValue,
  expanded,
  toggleExpanded,
  onDelete,
  isPrincipal,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const watchedField = watchedFields?.[index] || {}
  const fullName = `${watchedField.nombre || ""} ${watchedField.apellido || ""}`.trim()
  const hasName = fullName.length > 0

  // Calculate age from birth date
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    try {
      const date = parse(birthDate, "yyyy-MM-dd", new Date())
      return differenceInYears(new Date(), date)
    } catch (e) {
      return null
    }
  }

  const age = calculateAge(watchedField.fechaNacimiento)
  const hasVulnerabilities = (watchedField.condicionesVulnerabilidad?.condicion_vulnerabilidad || []).length > 0
  const hasVulneraciones = (watchedField.vulneraciones || []).length > 0
  const legajoVinculado = watchedField.legajo_existente_vinculado

  // Function to get initials from name and surname
  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }

  // Function to get a color based on index
  const getAvatarColor = (index: number) => {
    const colors = [
      "#1976d2", // blue
      "#388e3c", // green
      "#d32f2f", // red
      "#7b1fa2", // purple
      "#f57c00", // orange
      "#0288d1", // light blue
      "#c2185b", // pink
      "#455a64", // blue grey
      "#512da8", // deep purple
      "#00796b", // teal
    ]
    return colors[index % colors.length]
  }

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: "visible",
        boxShadow: expanded ? 3 : 1,
        transition: "box-shadow 0.3s ease-in-out",
        border: isPrincipal ? `1px solid ${theme.palette.primary.main}` : undefined,
        borderLeft: hasVulneraciones ? `4px solid ${theme.palette.error.main}` : undefined,
      }}
    >
      <CardHeader
        avatar={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              hasVulnerabilities ? (
                <Tooltip
                  title={`${watchedField.condicionesVulnerabilidad?.condicion_vulnerabilidad?.length || 0} condiciones de vulnerabilidad`}
                >
                  <WarningIcon color="warning" fontSize="small" />
                </Tooltip>
              ) : null
            }
          >
            <Avatar
              sx={{
                bgcolor: getAvatarColor(index),
                width: 40,
                height: 40,
                fontSize: "1rem",
              }}
            >
              {hasName ? getInitials(watchedField.nombre || "", watchedField.apellido || "") : `N${index + 1}`}
            </Avatar>
          </Badge>
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {hasName ? fullName : `NNYA ${index + 1}`}
            </Typography>
            {isPrincipal && <Chip label="Principal" size="small" color="primary" sx={{ ml: 1, fontSize: "0.75rem" }} />}
            {watchedField.dni && (
              <Chip label={`DNI: ${watchedField.dni}`} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
            )}
            {age && <Chip label={`${age} años`} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />}
          </Box>
        }
        subheader={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
            {watchedField.demanda_persona?.vinculo_demanda && (
              <Chip
                icon={<LinkIcon fontSize="small" />}
                label={
                  dropdownData.vinculo_demanda_choices?.find(
                    (item: { key: string; value: string }) =>
                      item.key === watchedField.demanda_persona?.vinculo_demanda,
                  )?.value || "Vinculación"
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {watchedField.educacion?.esta_escolarizado && (
              <Chip
                icon={<SchoolIcon fontSize="small" />}
                label="Escolarizado"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {hasVulneraciones && (
              <Chip
                icon={<GavelIcon fontSize="small" />}
                label={`${watchedField.vulneraciones?.length} vulneraciones`}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {legajoVinculado && legajoVinculado.fue_vinculado && (
              <Tooltip title={`Vinculado al legajo ${legajoVinculado.legajo_numero}`}>
                <Chip
                  icon={<CheckCircleIcon fontSize="small" />}
                  label={`Legajo ${legajoVinculado.legajo_numero}`}
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // TODO: Navigate to legajo detail
                    window.open(`/legajo/${legajoVinculado.legajo_id}`, "_blank")
                  }}
                />
              </Tooltip>
            )}
          </Box>
        }
        action={
          <Box>
            <IconButton onClick={toggleExpanded} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            {!readOnly && (
              <IconButton onClick={onDelete} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          pb: expanded ? 0 : 2,
          "& .MuiCardHeader-content": {
            overflow: "hidden",
          },
        }}
      />

      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ my: 2 }} />

          {isPrincipal && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Este es el niño, niña o adolescente principal de la demanda.
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : undefined}
              aria-label="NNYA information tabs"
            >
              <Tab
                icon={<PersonIcon />}
                label={isMobile ? undefined : "Información Personal"}
                id={`tab-${index}-0`}
                aria-controls={`tabpanel-${index}-0`}
              />
              <Tab
                icon={<SchoolIcon />}
                label={isMobile ? undefined : "Educación"}
                id={`tab-${index}-1`}
                aria-controls={`tabpanel-${index}-1`}
              />
              <Tab
                icon={<MedicalIcon />}
                label={isMobile ? undefined : "Salud"}
                id={`tab-${index}-2`}
                aria-controls={`tabpanel-${index}-2`}
              />
              <Tab
                icon={<WarningIcon />}
                label={isMobile ? undefined : "Vulnerabilidad"}
                id={`tab-${index}-3`}
                aria-controls={`tabpanel-${index}-3`}
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <PersonalInfoTab
              index={index}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedFields={watchedFields}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <EducationTab
              index={index}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedFields={watchedFields}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <HealthTab
              index={index}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedFields={watchedFields}
              setValue={setValue}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <VulnerabilityTab
              index={index}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedFields={watchedFields}
              setValue={setValue}
            />
          </TabPanel>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default NNYACard
