"use client"

/**
 * ExpedienteSection - Case file details section
 *
 * Contains fields for case/expediente information:
 * - Número de Oficio Web (opcional)
 * - SAC (opcional)
 * - Plazo de Respuesta (días)
 * - Autos Caratulados (OBLIGATORIO)
 * - Presuntos Delitos (OBLIGATORIO) - tags separados por coma
 * - Descripción Detallada (OBLIGATORIO)
 */

import type React from "react"
import { Box, Grid, TextField, InputAdornment } from "@mui/material"
import {
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  LocalOffer as TagIcon,
} from "@mui/icons-material"
import { Controller, useFormContext } from "react-hook-form"
import type { ExpedienteSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"

const ExpedienteSection: React.FC<ExpedienteSectionProps> = ({ readOnly = false, errors }) => {
  const { control } = useFormContext<CargaOficiosFormData>()

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Row 1: Nro. Oficio Web + SAC + Plazo */}
        <Grid item xs={12} md={4}>
          <Controller
            name="nro_oficio_web"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Nro. Oficio Web"
                fullWidth
                disabled={readOnly}
                error={!!error || !!errors?.nro_oficio_web}
                helperText={error?.message || errors?.nro_oficio_web}
                placeholder="Ej: 12345"
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

        <Grid item xs={12} md={4}>
          <Controller
            name="numero_expediente"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="SAC"
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
                label="Autos Caratulados *"
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

        {/* Row 3: Presuntos Delitos (tags) */}
        <Grid item xs={12}>
          <Controller
            name="presuntos_delitos"
            control={control}
            rules={{
              required: "Los presuntos delitos son obligatorios",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Presuntos Delitos *"
                fullWidth
                required
                disabled={readOnly}
                error={!!error || !!errors?.presuntos_delitos}
                helperText={
                  error?.message ||
                  errors?.presuntos_delitos ||
                  "Ingrese cada delito separado por coma. Ej: Robo, Hurto, Lesiones"
                }
                placeholder="Robo, Hurto, Lesiones..."
                InputProps={{
                  readOnly,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Row 4: Descripción Detallada (full width, multiline) */}
        <Grid item xs={12}>
          <Controller
            name="descripcion"
            control={control}
            rules={{
              required: "La descripción es obligatoria",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Descripción Detallada *"
                fullWidth
                required
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
