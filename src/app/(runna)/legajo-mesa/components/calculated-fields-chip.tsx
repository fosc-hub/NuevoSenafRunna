"use client"

import React from "react"
import { Chip, Box, Tooltip, Typography } from "@mui/material"
import {
  CalendarToday as CalendarIcon,
  AssignmentTurnedIn as MedidasIcon,
  Description as OficiosIcon,
} from "@mui/icons-material"

/**
 * Props for CalculatedFieldsChip component
 */
interface CalculatedFieldsChipProps {
  diasDesdeApertura?: number
  medidasActivasCount?: number
  oficiosPendientesCount?: number
  compact?: boolean // For table view
}

/**
 * Component to display calculated/computed statistics in a compact chip format
 * Used for showing: dias_desde_apertura, medidas_activas_count, oficios_pendientes_count
 */
export const CalculatedFieldsChip: React.FC<CalculatedFieldsChipProps> = ({
  diasDesdeApertura,
  medidasActivasCount,
  oficiosPendientesCount,
  compact = false,
}) => {
  // Build array of fields to display
  const fields: Array<{
    label: string
    value: number
    icon: React.ReactNode
    color: string
    tooltip: string
  }> = []

  if (diasDesdeApertura !== undefined) {
    fields.push({
      label: "Días",
      value: diasDesdeApertura,
      icon: <CalendarIcon fontSize="small" />,
      color: diasDesdeApertura > 90 ? "#ef5350" : diasDesdeApertura > 30 ? "#ff9800" : "#66bb6a",
      tooltip: `${diasDesdeApertura} días desde apertura`,
    })
  }

  if (medidasActivasCount !== undefined && medidasActivasCount > 0) {
    fields.push({
      label: "Medidas",
      value: medidasActivasCount,
      icon: <MedidasIcon fontSize="small" />,
      color: "#42a5f5",
      tooltip: `${medidasActivasCount} medida${medidasActivasCount > 1 ? "s" : ""} activa${medidasActivasCount > 1 ? "s" : ""}`,
    })
  }

  if (oficiosPendientesCount !== undefined && oficiosPendientesCount > 0) {
    fields.push({
      label: "Oficios",
      value: oficiosPendientesCount,
      icon: <OficiosIcon fontSize="small" />,
      color: "#ab47bc",
      tooltip: `${oficiosPendientesCount} oficio${oficiosPendientesCount > 1 ? "s" : ""} pendiente${oficiosPendientesCount > 1 ? "s" : ""}`,
    })
  }

  if (fields.length === 0) {
    return null
  }

  // Compact mode for table cells
  if (compact) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
        {fields.map((field, index) => (
          <Tooltip key={index} title={field.tooltip}>
            <Chip
              label={field.value}
              size="small"
              icon={field.icon}
              sx={{
                bgcolor: `${field.color}15`,
                color: field.color,
                border: `1px solid ${field.color}40`,
                fontWeight: "bold",
                fontSize: "0.75rem",
                minWidth: 45,
                "& .MuiChip-icon": {
                  color: field.color,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    )
  }

  // Expanded mode for detail views
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
        Estadísticas Calculadas
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {fields.map((field, index) => (
          <Tooltip key={index} title={field.tooltip}>
            <Chip
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {field.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {field.label}
                  </Typography>
                </Box>
              }
              icon={field.icon}
              sx={{
                bgcolor: `${field.color}15`,
                color: field.color,
                border: `1px solid ${field.color}40`,
                fontWeight: "bold",
                px: 1,
                "& .MuiChip-icon": {
                  color: field.color,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  )
}

/**
 * Standalone chip for displaying days since opening
 */
export const DiasDesdeAperturaChip: React.FC<{ dias: number }> = ({ dias }) => {
  const getColorByDias = (d: number) => {
    if (d > 90) return { bg: "#ffebee", text: "#c62828", border: "#ef5350" } // Red
    if (d > 30) return { bg: "#fff3e0", text: "#ef6c00", border: "#ff9800" } // Orange
    return { bg: "#e8f5e9", text: "#2e7d32", border: "#66bb6a" } // Green
  }

  const colors = getColorByDias(dias)

  return (
    <Tooltip title={`Legajo abierto hace ${dias} días`}>
      <Chip
        label={`${dias} días`}
        icon={<CalendarIcon fontSize="small" />}
        size="small"
        sx={{
          bgcolor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontWeight: "bold",
          "& .MuiChip-icon": {
            color: colors.text,
          },
        }}
      />
    </Tooltip>
  )
}

/**
 * Standalone chip for displaying medidas activas count
 */
export const MedidasActivasChip: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) {
    return null
  }

  return (
    <Tooltip title={`${count} medida${count > 1 ? "s" : ""} activa${count > 1 ? "s" : ""}`}>
      <Chip
        label={count}
        icon={<MedidasIcon fontSize="small" />}
        size="small"
        sx={{
          bgcolor: "#e3f2fd",
          color: "#1565c0",
          border: "1px solid #42a5f5",
          fontWeight: "bold",
          "& .MuiChip-icon": {
            color: "#1976d2",
          },
        }}
      />
    </Tooltip>
  )
}

/**
 * Standalone chip for displaying oficios pendientes count
 */
export const OficiosPendientesChip: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) {
    return null
  }

  return (
    <Tooltip title={`${count} oficio${count > 1 ? "s" : ""} pendiente${count > 1 ? "s" : ""}`}>
      <Chip
        label={count}
        icon={<OficiosIcon fontSize="small" />}
        size="small"
        sx={{
          bgcolor: "#f3e5f5",
          color: "#6a1b9a",
          border: "1px solid #ab47bc",
          fontWeight: "bold",
          "& .MuiChip-icon": {
            color: "#8e24aa",
          },
        }}
      />
    </Tooltip>
  )
}

export default CalculatedFieldsChip
