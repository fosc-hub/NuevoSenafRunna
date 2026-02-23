"use client"

/**
 * OrganoJudicialSection - Origen del Oficio section
 *
 * Contains fields for:
 * - Tipo de Organismo (bloque_datos_remitente) - OBLIGATORIO
 * - Organismo (institucion/tipo_institucion_demanda) - OBLIGATORIO, filtered by Tipo
 * - Departamento Judicial (CAPITAL | INTERIOR)
 */

import type React from "react"
import { useMemo } from "react"
import { Box, Grid, TextField, Autocomplete } from "@mui/material"
import { Controller, useFormContext } from "react-hook-form"
import type { OrganoJudicialSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"

const OrganoJudicialSection: React.FC<OrganoJudicialSectionProps> = ({
  bloquesRemitente,
  tipoInstitucionDemanda,
  departamentoJudicialChoices,
  readOnly = false,
}) => {
  const { control, watch, setValue } = useFormContext<CargaOficiosFormData>()

  // Watch the selected bloque_datos_remitente to filter instituciones
  const watchedBloqueRemitente = watch("bloque_datos_remitente")

  // Filter instituciones by selected bloque_datos_remitente
  const filteredInstituciones = useMemo(() => {
    if (!watchedBloqueRemitente) return tipoInstitucionDemanda
    return tipoInstitucionDemanda.filter(
      (inst) => inst.bloque_datos_remitente === watchedBloqueRemitente
    )
  }, [watchedBloqueRemitente, tipoInstitucionDemanda])

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Row 1: Tipo de Organismo + Departamento Judicial */}
        <Grid item xs={12} md={6}>
          <Controller
            name="bloque_datos_remitente"
            control={control}
            rules={{ required: "El tipo de organismo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly}
                options={bloquesRemitente}
                getOptionLabel={(option) => option.nombre || ""}
                value={bloquesRemitente.find((b) => b.id === field.value) || null}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue.id : null)
                  // Clear institucion when tipo changes
                  setValue("institucion", null)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de Organismo *"
                    required
                    error={!!error}
                    helperText={error?.message}
                    placeholder="Seleccione el tipo de organismo"
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="departamento_judicial"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly}
                options={departamentoJudicialChoices}
                getOptionLabel={(option) => option.value || ""}
                value={departamentoJudicialChoices.find((d) => d.key === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Departamento Judicial"
                    error={!!error}
                    helperText={error?.message}
                    placeholder="Capital o Interior"
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* Row 2: Organismo (filtered by Tipo de Organismo) */}
        <Grid item xs={12}>
          <Controller
            name="institucion"
            control={control}
            rules={{ required: "El organismo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly || !watchedBloqueRemitente}
                options={filteredInstituciones}
                getOptionLabel={(option) => option.nombre || ""}
                value={filteredInstituciones.find((i) => i.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Organismo *"
                    required
                    error={!!error}
                    helperText={
                      error?.message ||
                      (!watchedBloqueRemitente
                        ? "Primero seleccione un Tipo de Organismo"
                        : `${filteredInstituciones.length} organismos disponibles`)
                    }
                    placeholder="Seleccione el organismo"
                  />
                )}
                noOptionsText={
                  !watchedBloqueRemitente
                    ? "Seleccione primero un Tipo de Organismo"
                    : "No hay organismos para este tipo"
                }
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrganoJudicialSection
