"use client"

/**
 * EsGrupalChip
 *
 * Chip compacto para indicar si un registro (etapa/actividad/informe) aplica a
 * todos los NNyAs de la medida (grupal) o solo a un subconjunto (específico).
 * Cuando es específico, muestra un tooltip con los números de legajo.
 *
 * Si la medida no tiene legajos adicionales (un único NNyA), retorna null —
 * la distinción es irrelevante.
 */

import React from "react"
import { Chip, Tooltip } from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import PersonIcon from "@mui/icons-material/Person"

interface EsGrupalChipProps {
  esGrupal?: boolean
  legajosAlcance?: number[]
  /** Mapeo legajo_id → label ("Legajo 123 — Juan Pérez") para mostrar en tooltip. */
  legajoLabels?: Record<number, string>
  /** Si la medida tiene un único NNyA, el chip no se muestra. */
  hasMultipleLegajos: boolean
  size?: "small" | "medium"
}

export const EsGrupalChip: React.FC<EsGrupalChipProps> = ({
  esGrupal,
  legajosAlcance = [],
  legajoLabels = {},
  hasMultipleLegajos,
  size = "small",
}) => {
  if (!hasMultipleLegajos) return null
  if (esGrupal === undefined) return null

  if (esGrupal) {
    return (
      <Chip
        icon={<GroupsIcon />}
        label="Grupal"
        size={size}
        color="info"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    )
  }

  const tooltipText =
    legajosAlcance.length === 0
      ? "Sin legajos en alcance"
      : legajosAlcance
          .map((id) => legajoLabels[id] ?? `Legajo #${id}`)
          .join(" · ")

  return (
    <Tooltip title={tooltipText} arrow>
      <Chip
        icon={<PersonIcon />}
        label={`Específico (${legajosAlcance.length})`}
        size={size}
        color="warning"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    </Tooltip>
  )
}

export default EsGrupalChip
