"use client"

/**
 * ExpedienteSection - Case file details section
 *
 * Contains fields for case/expediente information:
 * - Nro. Oficio Web (placeholder - backend gap)
 * - Plazo de Respuesta (days)
 * - Expediente (SAC number)
 * - Autos Caratulados
 * - Descripción Detallada
 */

import type React from "react"
import { Box, Grid, TextField, InputAdornment } from "@mui/material"
import {
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material"
import { Controller, useFormContext } from "react-hook-form"
import PlaceholderField from "./PlaceholderField"
import type { ExpedienteSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"

const ExpedienteSection: React.FC<ExpedienteSectionProps> = ({ readOnly = false, errors }) => {
  const { control } = useFormContext<CargaOficiosFormData>()

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Row 1: Nro. Oficio Web (placeholder) + Plazo + Expediente SAC */}
        <Grid item xs={12} md={4}>
          <PlaceholderField
            label="Nro. Oficio Web"
            tooltip="Número de oficio del sistema web judicial"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="plazo_dias"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Plazo de Respuesta"
                type="number"
                fullWidth
                disabled={readOnly}
                error={!!error || !!errors?.plazo_dias}
                helperText={error?.message || errors?.plazo_dias || "Días para responder"}
                inputProps={{ min: 1, max: 365 }}
                InputProps={{
                  readOnly,
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">días</InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value ? Number(value) : null)
                }}
                value={field.value ?? ""}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="numero_expediente"
            control={control}
            rules={{
              pattern: {
                value: /^[0-9]+$/,
                message: "Solo se permiten números",
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Expediente (SAC)"
                fullWidth
                disabled={readOnly}
                error={!!error || !!errors?.numero_expediente}
                helperText={error?.message || errors?.numero_expediente}
                placeholder="Ej: 3462384"
                InputProps={{
                  readOnly,
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { fontFamily: "monospace" },
                }}
              />
            )}
          />
        </Grid>

        {/* Row 2: Autos Caratulados (full width) */}
        <Grid item xs={12}>
          <Controller
            name="caratula"
            control={control}
            rules={{
              required: "La carátula es obligatoria",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Autos Caratulados"
                fullWidth
                required
                disabled={readOnly}
                error={!!error || !!errors?.caratula}
                helperText={error?.message || errors?.caratula}
                placeholder="Ej: APELLIDO NOMBRE (edad) PSA - DELITO"
                InputProps={{
                  readOnly,
                  startAdornment: (
                    <InputAdornment position="start">
                      <GavelIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Row 3: Descripción Detallada (full width, multiline) */}
        <Grid item xs={12}>
          <Controller
            name="descripcion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Descripción Detallada"
                fullWidth
                multiline
                rows={4}
                disabled={readOnly}
                error={!!error || !!errors?.descripcion}
                helperText={
                  error?.message ||
                  errors?.descripcion ||
                  "Ampliar detalles de la carátula o estado de la causa"
                }
                placeholder="Ingrese información adicional sobre el caso, estado de la causa, observaciones relevantes..."
                InputProps={{
                  readOnly,
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1.5 }}
                    >
                      <DescriptionIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ExpedienteSection
