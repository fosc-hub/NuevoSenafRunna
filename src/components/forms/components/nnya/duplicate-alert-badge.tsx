"use client"

import type React from "react"
import { Chip, Badge, Tooltip, Box } from "@mui/material"
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import type { AlertLevel } from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"
import { ALERT_COLORS, ALERT_MESSAGES } from "@/components/forms/constants/duplicate-thresholds"

interface DuplicateAlertBadgeProps {
  /** Score de coincidencia (0.0 - 1.0) */
  score: number

  /** Nivel de alerta */
  alertLevel: AlertLevel

  /** Número de legajo encontrado */
  legajoNumero?: string

  /** Click handler para ver detalle */
  onClick?: () => void

  /** Variante del componente */
  variant?: "chip" | "badge" | "icon"

  /** Tamaño */
  size?: "small" | "medium"
}

/**
 * Badge visual para mostrar alerta de duplicado
 *
 * Características:
 * - Color según nivel de alerta
 * - Icono apropiado (error/warning/info)
 * - Click para ver detalle
 * - Múltiples variantes (chip, badge, icon)
 *
 * @example
 * ```tsx
 * <DuplicateAlertBadge
 *   score={0.95}
 *   alertLevel="CRITICA"
 *   legajoNumero="2024-1234"
 *   onClick={() => setShowModal(true)}
 * />
 * ```
 */
const DuplicateAlertBadge: React.FC<DuplicateAlertBadgeProps> = ({
  score,
  alertLevel,
  legajoNumero,
  onClick,
  variant = "chip",
  size = "small",
}) => {
  const percentage = Math.round(score * 100)
  const color = ALERT_COLORS[alertLevel]
  const message = ALERT_MESSAGES[alertLevel]

  // Obtener icono según nivel
  const getIcon = () => {
    switch (alertLevel) {
      case "CRITICA":
        return <ErrorIcon fontSize={size} />
      case "ALTA":
        return <WarningIcon fontSize={size} />
      case "MEDIA":
        return <InfoIcon fontSize={size} />
      default:
        return null
    }
  }

  // Obtener label según variante
  const getLabel = () => {
    if (legajoNumero) {
      return `Legajo ${legajoNumero} (${percentage}%)`
    }
    return `Duplicado: ${percentage}%`
  }

  // Renderizar según variante
  if (variant === "chip") {
    return (
      <Tooltip title={message.subtitle} arrow>
        <Chip
          icon={getIcon()}
          label={getLabel()}
          size={size}
          onClick={onClick}
          sx={{
            backgroundColor: `${color}15`, // 15 = opacity 0.09
            color: color,
            borderColor: color,
            fontWeight: 600,
            cursor: onClick ? "pointer" : "default",
            "&:hover": onClick
              ? {
                  backgroundColor: `${color}25`, // 25 = opacity 0.15
                }
              : undefined,
            "& .MuiChip-icon": {
              color: color,
            },
          }}
        />
      </Tooltip>
    )
  }

  if (variant === "badge") {
    return (
      <Tooltip title={message.subtitle} arrow>
        <Badge
          badgeContent={`${percentage}%`}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: color,
              color: "white",
              fontWeight: 600,
            },
          }}
        >
          {getIcon()}
        </Badge>
      </Tooltip>
    )
  }

  // variant === "icon"
  return (
    <Tooltip title={`${getLabel()} - ${message.subtitle}`} arrow>
      <Box
        onClick={onClick}
        sx={{
          display: "inline-flex",
          cursor: onClick ? "pointer" : "default",
          color: color,
        }}
      >
        {getIcon()}
      </Box>
    </Tooltip>
  )
}

export default DuplicateAlertBadge
