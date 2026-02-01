"use client"

/**
 * EstadoInformeBadge Component - PLTM-03
 *
 * Compact badge display for informe de seguimiento estado.
 *
 * Features:
 * - Color-coded by estado
 * - Icon display based on estado
 * - Tooltip with additional info (dias para vencimiento)
 * - Responsive sizing
 *
 * Used in:
 * - InformesMensualesTable
 * - Informe detail views
 */

import React from "react"
import { Chip, Tooltip, Box, type ChipProps } from "@mui/material"
import ScheduleIcon from "@mui/icons-material/Schedule"
import ErrorIcon from "@mui/icons-material/Error"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import type { EstadoInformeSeguimiento } from "../../../types/informe-seguimiento-api"
import { ESTADO_INFORME_CONFIG, formatDiasVencimiento } from "../../../types/informe-seguimiento-api"

// ============================================================================
// TYPES
// ============================================================================

export interface EstadoInformeBadgeProps {
  /** Estado del informe */
  estado: EstadoInformeSeguimiento

  /** Días para vencimiento (positivo = restantes, negativo = vencido) */
  diasParaVencimiento?: number

  /** Whether it was late delivery */
  entregaTardia?: boolean

  /** Badge size */
  size?: "small" | "medium"

  /** Show tooltip with days info */
  showTooltip?: boolean

  /** Show icon */
  showIcon?: boolean

  /** Additional chip props */
  chipProps?: Partial<ChipProps>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon component based on estado
 */
function getEstadoIcon(estado: EstadoInformeSeguimiento): React.ReactNode {
  const iconConfig = ESTADO_INFORME_CONFIG[estado]

  const iconStyle = { fontSize: 16 }

  switch (iconConfig.icon) {
    case 'Schedule':
      return <ScheduleIcon sx={iconStyle} />
    case 'Error':
      return <ErrorIcon sx={iconStyle} />
    case 'CheckCircle':
      return <CheckCircleIcon sx={iconStyle} />
    case 'Warning':
      return <WarningIcon sx={iconStyle} />
    default:
      return <ScheduleIcon sx={iconStyle} />
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EstadoInformeBadge: React.FC<EstadoInformeBadgeProps> = ({
  estado,
  diasParaVencimiento,
  entregaTardia,
  size = "small",
  showTooltip = true,
  showIcon = true,
  chipProps = {},
}) => {
  const config = ESTADO_INFORME_CONFIG[estado]

  if (!config) {
    return (
      <Chip
        label="Desconocido"
        size={size}
        variant="outlined"
        {...chipProps}
      />
    )
  }

  // Build tooltip content
  const tooltipContent = showTooltip ? (
    <Box>
      <Box sx={{ fontWeight: 600, mb: 0.5 }}>
        {config.label}
      </Box>
      {diasParaVencimiento !== undefined && (
        <Box sx={{ fontSize: "0.875rem" }}>
          {formatDiasVencimiento(diasParaVencimiento)}
        </Box>
      )}
      {entregaTardia && (
        <Box sx={{ fontSize: "0.875rem", fontStyle: "italic", mt: 0.5 }}>
          Entrega tardía
        </Box>
      )}
    </Box>
  ) : null

  const badgeChip = (
    <Chip
      label={config.label}
      size={size}
      icon={showIcon ? getEstadoIcon(estado) as React.ReactElement : undefined}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: config.textColor,
        },
        ...chipProps?.sx,
      }}
      {...chipProps}
    />
  )

  // Wrap with tooltip if enabled
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip title={tooltipContent} arrow placement="top">
        {badgeChip}
      </Tooltip>
    )
  }

  return badgeChip
}

export default EstadoInformeBadge
