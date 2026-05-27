"use client"

/**
 * NnyaSelectorMedida
 *
 * Selector reutilizable de NNyA para vistas 1-a-1 dentro de una medida
 * compartida (ej.: Seguimiento en Dispositivo). A diferencia de
 * `LegajosAlcanceSelector` (que define scope grupal/específico para algo
 * compartido), este selector elige UNO solo entre los NNyAs vinculados.
 *
 * - Si la medida tiene un único legajo (sin adicionales), retorna null:
 *   el caller debe usar directamente `legajoPrimario.id`.
 * - Si hay múltiples, renderiza un Select sticky en la parte superior del
 *   contenedor para que esté siempre visible mientras se navegan las
 *   subsecciones del tab.
 *
 * Persistencia opcional: el caller decide si guarda la selección en
 * sessionStorage; ver hook `useSelectedLegajo` (futuro) o manejarlo a mano.
 */

import React from "react"
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

export interface NnyaSelectorLegajoPrimario {
  id: number
  numero: string
  nnya: { id?: number; nombre: string; apellido: string }
}

interface NnyaSelectorMedidaProps {
  legajoPrimario: NnyaSelectorLegajoPrimario
  legajosAdicionales: LegajoAdicionalMedida[]
  selectedLegajoId: number
  onChange: (legajoId: number) => void
  /** Default true: queda fijo arriba mientras se scrollea. */
  sticky?: boolean
  /** Texto explicativo encima del select. */
  label?: string
}

interface NnyaOption {
  id: number
  numero: string
  nombre: string
  esPrimario: boolean
}

export const NnyaSelectorMedida: React.FC<NnyaSelectorMedidaProps> = ({
  legajoPrimario,
  legajosAdicionales,
  selectedLegajoId,
  onChange,
  sticky = true,
  label = "NNyA del seguimiento",
}) => {
  const options = React.useMemo<NnyaOption[]>(() => {
    const primario: NnyaOption = {
      id: legajoPrimario.id,
      numero: legajoPrimario.numero,
      nombre: `${legajoPrimario.nnya.nombre} ${legajoPrimario.nnya.apellido}`.trim() || "Sin nombre",
      esPrimario: true,
    }
    const adicionales: NnyaOption[] = legajosAdicionales.map((la) => ({
      id: la.legajo_id,
      numero: la.legajo_numero,
      nombre: la.nnya?.nombre_completo ?? "Sin nombre",
      esPrimario: false,
    }))
    return [primario, ...adicionales]
  }, [legajoPrimario, legajosAdicionales])

  if (legajosAdicionales.length === 0) {
    // Caso 1 NNyA: no se muestra selector — el caller usa legajoPrimario.id directo.
    return null
  }

  const handleChange = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value)
    if (!Number.isNaN(value)) onChange(value)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 5,
        py: 1.5,
        px: 2,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <PersonIcon color="primary" />
        <FormControl size="small" sx={{ minWidth: 320, flex: 1 }}>
          <InputLabel id="nnya-selector-label">{label}</InputLabel>
          <Select<number>
            labelId="nnya-selector-label"
            label={label}
            value={selectedLegajoId}
            onChange={handleChange}
          >
            {options.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {opt.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    · Legajo {opt.numero}
                  </Typography>
                  {opt.esPrimario && (
                    <Chip label="Primario" size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )
}

export default NnyaSelectorMedida
