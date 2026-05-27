"use client"

/**
 * LegajosAlcanceSelector
 *
 * Selector reutilizable para definir la granularidad de una etapa, actividad
 * o informe dentro de una medida que tiene más de un legajo vinculado (SAC
 * compartido). Modelo backend: campo M2M `legajos_alcance` (ver
 * claudedocs/GRANULARIDAD_LEGAJOS_MEDIDA_COMPARTIDA.md).
 *
 * Regla:
 * - value = []  → grupal (aplica a TODOS los legajos vinculados)
 * - value = [N] → aplica solo a esos legajos específicos
 *
 * UX:
 * - Sin legajos adicionales: muestra un caption informativo, no input.
 * - Con adicionales: toggle "Grupal" (default) / "Específico" + Autocomplete
 *   multi-select cuando se elige "Específico".
 */

import React from "react"
import {
  Autocomplete,
  Box,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

export interface LegajosAlcanceLegajoPrimario {
  id: number
  numero: string
  nnya: {
    nombre: string
    apellido: string
  }
}

export interface LegajosAlcanceOption {
  id: number
  numero: string
  label: string
  esPrimario: boolean
}

interface LegajosAlcanceSelectorProps {
  legajoPrimario: LegajosAlcanceLegajoPrimario
  legajosAdicionales: LegajoAdicionalMedida[]
  /** IDs de legajos seleccionados. Vacío = grupal. */
  value: number[]
  onChange: (legajoIds: number[]) => void
  disabled?: boolean
  label?: string
  /** Texto de ayuda contextual debajo del control. */
  helperText?: string
  /**
   * Callback que informa al padre cuando el estado del selector es inválido
   * (modo "específico" sin legajos seleccionados). Útil para deshabilitar
   * el botón de submit del formulario contenedor.
   */
  onValidityChange?: (isValid: boolean) => void
}

/**
 * Construye la lista unificada de opciones (primario + adicionales).
 * Exportada para reuso en otros componentes que necesiten la misma lista.
 */
export function buildLegajosOptions(
  legajoPrimario: LegajosAlcanceLegajoPrimario,
  legajosAdicionales: LegajoAdicionalMedida[]
): LegajosAlcanceOption[] {
  const primarioOption: LegajosAlcanceOption = {
    id: legajoPrimario.id,
    numero: legajoPrimario.numero,
    label: `Legajo ${legajoPrimario.numero} — ${legajoPrimario.nnya.nombre} ${legajoPrimario.nnya.apellido}`.trim(),
    esPrimario: true,
  }
  const adicionalesOptions: LegajosAlcanceOption[] = legajosAdicionales.map((la) => ({
    id: la.legajo_id,
    numero: la.legajo_numero,
    label: `Legajo ${la.legajo_numero} — ${la.nnya.nombre_completo}`.trim(),
    esPrimario: false,
  }))
  return [primarioOption, ...adicionalesOptions]
}

export const LegajosAlcanceSelector: React.FC<LegajosAlcanceSelectorProps> = ({
  legajoPrimario,
  legajosAdicionales,
  value,
  onChange,
  disabled = false,
  label = "Alcance",
  helperText,
  onValidityChange,
}) => {
  const hasAdicionales = legajosAdicionales.length > 0
  const options = React.useMemo(
    () => buildLegajosOptions(legajoPrimario, legajosAdicionales),
    [legajoPrimario, legajosAdicionales]
  )
  const selectedOptions = React.useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value]
  )

  // El modo UI ("grupal" vs "especifico") se separa del value para permitir que
  // el usuario entre en modo "específico" con value=[] y vea el Autocomplete
  // vacío para empezar a elegir. Si el value llega no-vacío (edición), arranca
  // en "específico"; si está vacío, arranca en "grupal".
  const [mode, setMode] = React.useState<"grupal" | "especifico">(
    value.length === 0 ? "grupal" : "especifico"
  )

  // Si el value externo cambia (ej. reset del form), sincronizar el modo.
  React.useEffect(() => {
    if (value.length > 0 && mode === "grupal") {
      setMode("especifico")
    }
  }, [value, mode])

  // Estado inválido: el usuario eligió "específico" pero no seleccionó ningún
  // NNyA todavía. Informamos al padre para que pueda bloquear el submit.
  const isInvalid = mode === "especifico" && value.length === 0
  React.useEffect(() => {
    onValidityChange?.(!isInvalid)
  }, [isInvalid, onValidityChange])

  // Forzamos abrir el dropdown apenas el usuario entra en modo específico para
  // que vea las opciones disponibles (previene el caso de submit con [] por error).
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false)

  if (!hasAdicionales) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
        <GroupsIcon fontSize="small" />
        <Typography variant="caption">
          Aplica al único NNyA de la medida ({legajoPrimario.nnya.nombre} {legajoPrimario.nnya.apellido}).
        </Typography>
      </Box>
    )
  }

  const handleModeChange = (_: React.ChangeEvent<HTMLInputElement>, newMode: string) => {
    if (newMode === "grupal") {
      setMode("grupal")
      setAutocompleteOpen(false)
      onChange([]) // Grupal = sin scope
    } else if (newMode === "especifico") {
      setMode("especifico")
      setAutocompleteOpen(true) // abre el dropdown para que el usuario vea las opciones
      // No tocamos value: queda como estaba (vacío para que el usuario elija,
      // o pre-poblado si venía de edición).
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <RadioGroup
        row
        value={mode}
        onChange={handleModeChange}
      >
        <FormControlLabel
          value="grupal"
          control={<Radio size="small" disabled={disabled} />}
          label={`Grupal — aplica a todos los NNyAs (${options.length})`}
        />
        <FormControlLabel
          value="especifico"
          control={<Radio size="small" disabled={disabled} />}
          label="Solo a NNyAs específicos"
        />
      </RadioGroup>

      {mode === "especifico" && (
        <Autocomplete
          multiple
          size="small"
          options={options}
          value={selectedOptions}
          onChange={(_, newValue) => onChange(newValue.map((o) => o.id))}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          disabled={disabled}
          open={autocompleteOpen}
          onOpen={() => setAutocompleteOpen(true)}
          onClose={() => setAutocompleteOpen(false)}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key: tagKey, ...tagRest } = getTagProps({ index })
              return (
                <Chip
                  key={option.id}
                  size="small"
                  label={option.label}
                  color={option.esPrimario ? "primary" : "default"}
                  {...tagRest}
                />
              )
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              error={isInvalid}
              helperText={
                isInvalid
                  ? "Seleccione al menos un NNyA o vuelva a Grupal."
                  : undefined
              }
              placeholder={selectedOptions.length === 0 ? "Seleccione uno o más legajos" : ""}
              onClick={() => setAutocompleteOpen(true)}
            />
          )}
        />
      )}

      {helperText && !isInvalid && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export default LegajosAlcanceSelector
