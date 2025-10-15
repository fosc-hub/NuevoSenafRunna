"use client"

import type React from "react"
import { Box, LinearProgress, Typography, Tooltip, useTheme } from "@mui/material"
import type { AlertLevel } from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"
import { ALERT_COLORS, ALERT_MESSAGES } from "@/components/forms/constants/duplicate-thresholds"

interface ScoringProgressBarProps {
  /** Score de coincidencia (0.0 - 1.0) */
  score: number

  /** Nivel de alerta calculado */
  alertLevel: AlertLevel

  /** Mostrar porcentaje (default: true) */
  showPercentage?: boolean

  /** Tamaño del componente */
  size?: "small" | "medium" | "large"

  /** Mostrar tooltip con explicación */
  showTooltip?: boolean
}

/**
 * Barra de progreso visual para mostrar el score de coincidencia
 *
 * Características:
 * - Color dinámico según nivel de alerta (rojo/naranja/amarillo)
 * - Tooltip con explicación del scoring
 * - Porcentaje visible
 * - Diferentes tamaños
 *
 * @example
 * ```tsx
 * <ScoringProgressBar
 *   score={0.95}
 *   alertLevel="CRITICA"
 *   showPercentage={true}
 *   showTooltip={true}
 * />
 * ```
 */
const ScoringProgressBar: React.FC<ScoringProgressBarProps> = ({
  score,
  alertLevel,
  showPercentage = true,
  size = "medium",
  showTooltip = true,
}) => {
  const theme = useTheme()

  // Convertir score a porcentaje
  const percentage = Math.round(score * 100)

  // Obtener color según nivel de alerta
  const getColor = (): string => {
    return ALERT_COLORS[alertLevel] || theme.palette.grey[500]
  }

  // Obtener altura según tamaño
  const getHeight = (): number => {
    switch (size) {
      case "small":
        return 4
      case "large":
        return 12
      case "medium":
      default:
        return 8
    }
  }

  // Obtener texto del tooltip
  const getTooltipText = (): string => {
    const baseMessage = ALERT_MESSAGES[alertLevel]?.subtitle || "Nivel de coincidencia"
    return `${percentage}% de coincidencia - ${baseMessage}`
  }

  const progressBar = (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: getHeight(),
            borderRadius: 1,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              backgroundColor: getColor(),
              borderRadius: 1,
              transition: "transform 0.4s ease-in-out",
            },
          }}
        />
      </Box>

      {showPercentage && (
        <Typography
          variant={size === "small" ? "caption" : "body2"}
          sx={{
            fontWeight: 600,
            color: getColor(),
            minWidth: size === "small" ? "35px" : "45px",
            textAlign: "right",
          }}
        >
          {percentage}%
        </Typography>
      )}
    </Box>
  )

  if (showTooltip) {
    return (
      <Tooltip title={getTooltipText()} arrow placement="top">
        {progressBar}
      </Tooltip>
    )
  }

  return progressBar
}

export default ScoringProgressBar
