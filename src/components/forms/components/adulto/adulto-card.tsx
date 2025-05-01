"use client"

import type React from "react"
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
} from "@mui/material"
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"
import type { Control } from "react-hook-form"
import PersonalInfoSection from "./personal-info-section"
import DatesSection from "./dates-section"
import OccupationSection from "./occupation-section"
import LinksSection from "./links-section"
import ContactSection from "./contact-section"
import VulnerabilitySection from "./vulnerability-section"
import ObservationsSection from "./observations-section"
import type { DropdownData, FormData } from "../../types/formTypes"

interface AdultoCardProps {
  index: number
  field: any
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedField: any
  expanded: boolean
  toggleExpanded: () => void
  onDelete: () => void
}

const AdultoCard: React.FC<AdultoCardProps> = ({
  index,
  field,
  control,
  dropdownData,
  readOnly,
  watchedField,
  expanded,
  toggleExpanded,
  onDelete,
}) => {
  const fullName = `${watchedField.nombre || ""} ${watchedField.apellido || ""}`.trim()
  const hasName = fullName.length > 0
  const hasVulnerabilities = (watchedField.condicionesVulnerabilidad || []).length > 0

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
        border: hasVulnerabilities ? `1px solid ${(theme) => theme.palette.warning.light}` : undefined,
      }}
    >
      <CardHeader
        avatar={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              hasVulnerabilities ? (
                <Tooltip title={`${watchedField.condicionesVulnerabilidad?.length} condiciones de vulnerabilidad`}>
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
              {hasName ? getInitials(watchedField.nombre || "", watchedField.apellido || "") : `A${index + 1}`}
            </Avatar>
          </Badge>
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {hasName ? fullName : `Adulto ${index + 1}`}
            </Typography>
            {watchedField.dni && (
              <Chip
                label={`DNI: ${watchedField.dni}`}
                size="small"
                variant="outlined"
                sx={{ ml: 1, fontSize: "0.75rem" }}
              />
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
            {watchedField.vinculacion && (
              <Chip
                icon={<LinkIcon fontSize="small" />}
                label={
                  dropdownData.vinculo_demanda_choices?.find((item) => item.key === watchedField.vinculacion)?.value ||
                  "Vinculación"
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {watchedField.legalmenteResponsable && (
              <Chip
                label="Legalmente Responsable"
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {watchedField.conviviente && (
              <Chip label="Conviviente" size="small" color="info" variant="outlined" sx={{ fontSize: "0.7rem" }} />
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

          <PersonalInfoSection index={index} control={control} dropdownData={dropdownData} readOnly={readOnly} />
          <DatesSection index={index} control={control} readOnly={readOnly} />
          <OccupationSection index={index} control={control} dropdownData={dropdownData} readOnly={readOnly} />
          <LinksSection index={index} control={control} dropdownData={dropdownData} readOnly={readOnly} />
          <ContactSection
            index={index}
            control={control}
            dropdownData={dropdownData}
            readOnly={readOnly}
            watchedField={watchedField}
          />
          <VulnerabilitySection index={index} control={control} dropdownData={dropdownData} readOnly={readOnly} />
          <ObservationsSection index={index} control={control} readOnly={readOnly} />
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default AdultoCard
