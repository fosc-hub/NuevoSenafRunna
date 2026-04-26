"use client"

/**
 * EtiquetaDocumentoSelector — Autocomplete reutilizable para clasificar
 * cualquier documento que se sube al sistema con una etiqueta del catálogo
 * unificado (TEtiquetaDocumento, /etiquetas-documento/).
 *
 * Sin etiqueta seleccionada el backend asigna SIN_CLASIFICAR por default.
 */

import type React from "react"
import { Autocomplete, TextField, Box, Typography, Chip, CircularProgress } from "@mui/material"
import LabelIcon from "@mui/icons-material/Label"

import type { EtiquetaDocumento } from "@/app/interfaces/etiquetaDocumento"
import { useEtiquetasDocumento } from "@/hooks/useEtiquetasDocumento"

export interface EtiquetaDocumentoSelectorProps {
  /** ID seleccionado (controlado). null o undefined = nada seleccionado */
  value: number | null | undefined
  onChange: (etiquetaId: number | null) => void
  disabled?: boolean
  required?: boolean
  /** Texto auxiliar bajo el campo */
  helperText?: string
  /** Tamaño del input MUI */
  size?: "small" | "medium"
  /** Etiqueta visible del campo */
  label?: string
}

const EtiquetaDocumentoSelector: React.FC<EtiquetaDocumentoSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  helperText,
  size = "small",
  label = "Etiqueta del documento",
}) => {
  const { etiquetas, isLoading } = useEtiquetasDocumento()

  const selected = etiquetas.find((e) => e.id === value) ?? null

  return (
    <Autocomplete<EtiquetaDocumento>
      size={size}
      disabled={disabled || isLoading}
      options={etiquetas}
      value={selected}
      onChange={(_, next) => onChange(next?.id ?? null)}
      getOptionLabel={(option) => option?.nombre ?? ""}
      isOptionEqualToValue={(a, b) => a?.id === b?.id}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LabelIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.nombre}
            </Typography>
            {option.descripcion ? (
              <Typography variant="caption" color="text.secondary">
                {option.descripcion}
              </Typography>
            ) : null}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          helperText={helperText ?? (isLoading ? "Cargando etiquetas…" : undefined)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

/** Pequeño chip de presentación, reutilizable en listas/tarjetas de adjuntos. */
export const EtiquetaDocumentoChip: React.FC<{ nombre?: string | null }> = ({ nombre }) => {
  if (!nombre) return null
  return (
    <Chip
      icon={<LabelIcon fontSize="small" />}
      label={nombre}
      size="small"
      variant="outlined"
      sx={{ height: 22 }}
    />
  )
}

export default EtiquetaDocumentoSelector
