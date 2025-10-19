"use client"

import React from "react"
import { Box, Tooltip, Typography, LinearProgress } from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material"
import type { OficioConSemaforo, SemaforoEstado } from "../types/legajo-api"
import {
  SEMAFORO_COLORS,
  PROGRESS_BAR_COLORS,
  getSemaforoColor,
  calculateSemaforo,
} from "../config/legajo-theme"

/**
 * Component to display oficios with progress bars showing time to vencimiento
 */
export const OficiosProgressBars: React.FC<{ oficios: OficioConSemaforo[] }> = ({ oficios }) => {
  if (oficios.length === 0) {
    return <Typography variant="body2" color="text.disabled">Sin oficios</Typography>
  }

  const calculateProgress = (fechaVencimiento: string): number => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const totalDias = 30 // Asumimos 30 días desde creación (puede ajustarse)
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    // Convertir días restantes a porcentaje
    // Más días restantes = más progreso (barra más llena)
    const progreso = Math.max(0, Math.min(100, (diasRestantes / totalDias) * 100))
    return progreso
  }

  const getProgressBarColor = (semaforo: SemaforoEstado): string => {
    switch (semaforo) {
      case "verde":
        return PROGRESS_BAR_COLORS.verde
      case "amarillo":
        return PROGRESS_BAR_COLORS.amarillo
      case "rojo":
        return PROGRESS_BAR_COLORS.rojo
      default:
        return PROGRESS_BAR_COLORS.background
    }
  }

  const getSemaforoIcon = (semaforo: SemaforoEstado) => {
    switch (semaforo) {
      case "verde":
        return <CheckCircleIcon fontSize="small" />
      case "amarillo":
        return <WarningIcon fontSize="small" />
      case "rojo":
        return <ErrorIcon fontSize="small" />
      default:
        return null
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
      {oficios.map((oficio, index) => {
        const semaforo = oficio.semaforo || calculateSemaforo(oficio.fecha_vencimiento || "")
        const colors = getSemaforoColor(semaforo)
        const progress = oficio.fecha_vencimiento ? calculateProgress(oficio.fecha_vencimiento) : 0

        // Calcular días restantes
        let diasRestantes = 0
        if (oficio.fecha_vencimiento) {
          const hoy = new Date()
          const vencimiento = new Date(oficio.fecha_vencimiento)
          diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        }

        const tooltipText = oficio.fecha_vencimiento
          ? `${oficio.tipo}: ${diasRestantes} días ${diasRestantes >= 0 ? "restantes" : "vencidos"} (${new Date(oficio.fecha_vencimiento).toLocaleDateString("es-AR")})`
          : `${oficio.tipo}: Sin fecha de vencimiento`

        return (
          <Tooltip key={index} title={tooltipText}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "6px 10px",
                borderRadius: "8px",
                bgcolor: colors.bg,
                border: `1px solid ${colors.border}`,
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {/* Icon */}
              <Box sx={{ color: colors.icon, display: "flex", alignItems: "center" }}>
                {getSemaforoIcon(semaforo)}
              </Box>

              {/* Progress bar and label */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {oficio.tipo}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text,
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      ml: 1,
                    }}
                  >
                    {diasRestantes >= 0 ? `${diasRestantes}d` : `${Math.abs(diasRestantes)}d venc.`}
                  </Typography>
                </Box>

                {/* Progress bar */}
                {oficio.fecha_vencimiento && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, progress)}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: PROGRESS_BAR_COLORS.background,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: getProgressBarColor(semaforo),
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

/**
 * Compact version for table cells
 */
export const OficiosProgressCompact: React.FC<{ oficios: OficioConSemaforo[] }> = ({ oficios }) => {
  if (oficios.length === 0) {
    return <Typography variant="body2" color="text.disabled">-</Typography>
  }

  // Show only most critical oficio in compact mode
  const sortedOficios = [...oficios].sort((a, b) => {
    const getSemaforoPriority = (s: SemaforoEstado) => {
      if (s === "rojo") return 3
      if (s === "amarillo") return 2
      return 1
    }
    return getSemaforoPriority(b.semaforo) - getSemaforoPriority(a.semaforo)
  })

  const mostCritical = sortedOficios[0]
  const semaforo = mostCritical.semaforo || calculateSemaforo(mostCritical.fecha_vencimiento || "")
  const colors = getSemaforoColor(semaforo)

  let diasRestantes = 0
  if (mostCritical.fecha_vencimiento) {
    const hoy = new Date()
    const vencimiento = new Date(mostCritical.fecha_vencimiento)
    diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  const tooltipText = `${oficios.length} oficio${oficios.length > 1 ? "s" : ""} - Más crítico: ${mostCritical.tipo} (${diasRestantes >= 0 ? `${diasRestantes}d` : `Vencido`})`

  return (
    <Tooltip title={tooltipText}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          padding: "4px 8px",
          borderRadius: "6px",
          bgcolor: colors.bg,
          border: `1px solid ${colors.border}`,
          minWidth: 80,
        }}
      >
        <Box sx={{ color: colors.icon, display: "flex", alignItems: "center" }}>
          {semaforo === "verde" && <CheckCircleIcon fontSize="small" />}
          {semaforo === "amarillo" && <WarningIcon fontSize="small" />}
          {semaforo === "rojo" && <ErrorIcon fontSize="small" />}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: colors.text,
            fontWeight: "bold",
            fontSize: "0.7rem",
          }}
        >
          {oficios.length} ({diasRestantes >= 0 ? `${diasRestantes}d` : "Venc."})
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default OficiosProgressBars
