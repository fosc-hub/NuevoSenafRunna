"use client"

/**
 * EstadoBadge Component - MED-01 V2
 *
 * Compact badge display for current estado in page headers and summaries.
 *
 * Features:
 * - Color-coded by responsable_tipo
 * - Shows estado nombre_display and orden
 * - Tooltip with next action
 * - Responsive sizing (small, medium, large)
 * - Handles null estados (MPJ, MPI Cese, MPE Post-Cese)
 *
 * Used in:
 * - Page headers
 * - Summary cards
 * - List views
 */

import React from "react"
import { Chip, Tooltip, type ChipProps } from "@mui/material"
import type { TEstadoEtapaMedida, ResponsableTipo } from "../../../types/estado-etapa"
import type { EtapaMedida } from "../../../types/medida-api"

// ============================================================================
// TYPES
// ============================================================================

export interface EstadoBadgeProps {
  /** Current etapa with estado_especifico reference */
  etapaActual: EtapaMedida | null

  /** Available estados from catalog (to find matching estado) */
  availableEstados?: TEstadoEtapaMedida[]

  /** Badge size */
  size?: "small" | "medium"

  /** Show tooltip with next action */
  showTooltip?: boolean

  /** Additional chip props */
  chipProps?: Partial<ChipProps>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get MUI color for responsable tipo
 */
function getEstadoColor(
  responsableTipo: ResponsableTipo
): "primary" | "secondary" | "info" | "warning" | "success" {
  const colorMap: Record<ResponsableTipo, "primary" | "secondary" | "info" | "warning"> = {
    EQUIPO_TECNICO: "primary",
    JEFE_ZONAL: "secondary",
    DIRECTOR: "warning",
    EQUIPO_LEGAL: "info",
  }
  return colorMap[responsableTipo] || "primary"
}

/**
 * Get responsable label
 */
function getResponsableLabel(responsableTipo: ResponsableTipo): string {
  const labels: Record<ResponsableTipo, string> = {
    EQUIPO_TECNICO: "Equipo Técnico",
    JEFE_ZONAL: "Jefe Zonal",
    DIRECTOR: "Director",
    EQUIPO_LEGAL: "Equipo Legal",
  }
  return labels[responsableTipo] || responsableTipo
}

/**
 * Get current estado object from etapa
 */
function getCurrentEstado(
  etapaActual: EtapaMedida | null,
  availableEstados?: TEstadoEtapaMedida[]
): TEstadoEtapaMedida | null {
  if (!etapaActual?.estado_especifico || !availableEstados?.length) {
    return null
  }

  // estado_especifico can be the full object or just ID
  const estadoId =
    typeof etapaActual.estado_especifico === "object" && etapaActual.estado_especifico !== null
      ? etapaActual.estado_especifico.id
      : null

  if (!estadoId) {
    return null
  }

  return availableEstados.find((e) => e.id === estadoId) || null
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({
  etapaActual,
  availableEstados,
  size = "medium",
  showTooltip = true,
  chipProps = {},
}) => {
  const currentEstado = getCurrentEstado(etapaActual, availableEstados)

  // No estado case (MPJ, MPI Cese, MPE Post-Cese, or APERTURA without estados)
  if (!currentEstado) {
    return (
      <Chip
        label="Sin Estado"
        size={size}
        variant="outlined"
        {...chipProps}
      />
    )
  }

  const chipColor = getEstadoColor(currentEstado.responsable_tipo)
  const chipLabel = `Estado ${currentEstado.orden}: ${currentEstado.nombre_display}`

  // Build tooltip content
  const tooltipContent = showTooltip ? (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {chipLabel}
      </div>
      <div style={{ fontSize: "0.875rem", marginBottom: 4 }}>
        Responsable: {getResponsableLabel(currentEstado.responsable_tipo)}
      </div>
      {currentEstado.siguiente_accion && (
        <div style={{ fontSize: "0.875rem", fontStyle: "italic" }}>
          Siguiente: {currentEstado.siguiente_accion}
        </div>
      )}
    </div>
  ) : null

  const badgeChip = (
    <Chip
      label={chipLabel}
      color={chipColor}
      size={size}
      {...chipProps}
    />
  )

  // Wrap with tooltip if enabled and content exists
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip title={tooltipContent} arrow placement="bottom">
        {badgeChip}
      </Tooltip>
    )
  }

  return badgeChip
}

export default EstadoBadge
