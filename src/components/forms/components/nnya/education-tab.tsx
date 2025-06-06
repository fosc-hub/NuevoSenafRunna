"use client"

import type React from "react"
import { Grid, TextField, FormControl, Autocomplete, Paper, FormControlLabel, Checkbox } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { School as SchoolIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import RequiredLabel from "../required-label"
import type { DropdownData, FormData } from "../../types/formTypes"

interface EducationTabProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedFields: any
}

const EducationTab: React.FC<EducationTabProps> = ({ index, control, dropdownData, readOnly, watchedFields }) => {
  return (
    <FormSection title="Información Educativa" icon={<SchoolIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name={`ninosAdolescentes.${index}.educacion.institucion_educativa.nombre`}
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={[...(dropdownData.institucion_educativa || []), { id: "other", nombre: "Otra" }]}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={
                    field.value === "other"
                      ? { id: "other", nombre: "Otra" }
                      : dropdownData.institucion_educativa?.find((item) => item.nombre === field.value) || null
                  }
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.nombre : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Institución Educativa" />}
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
                  PopperProps={{
                    style: { width: "auto", maxWidth: "300px" },
                  }}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        {watchedFields?.[index]?.educacion?.institucion_educativa?.nombre === "other" && (
          <Grid item xs={12}>
            <Controller
              name={`ninosAdolescentes.${index}.educacion.institucion_educativa.nombre`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label={<RequiredLabel label="Nueva Institución Educativa" />}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Controller
            name={`ninosAdolescentes.${index}.educacion.nivel_alcanzado`}
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.nivel_alcanzado_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.nivel_alcanzado_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Nivel Alcanzado" />}
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
                  PopperProps={{
                    style: { width: "auto", maxWidth: "300px" },
                  }}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Controller
                  name={`ninosAdolescentes.${index}.educacion.esta_escolarizado`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  )}
                />
              }
              label="Está Escolarizado"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={`ninosAdolescentes.${index}.educacion.ultimo_cursado`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.ultimo_cursado_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.ultimo_cursado_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Último Cursado"
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
                  PopperProps={{
                    style: { width: "auto", maxWidth: "300px" },
                  }}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={`ninosAdolescentes.${index}.educacion.tipo_escuela`}
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.tipo_escuela_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.tipo_escuela_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Tipo de Escuela" />}
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
                  PopperProps={{
                    style: { width: "auto", maxWidth: "300px" },
                  }}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name={`ninosAdolescentes.${index}.educacion.comentarios_educativos`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Comentarios Educativos"
                fullWidth
                multiline
                rows={3}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
                placeholder="Ingrese comentarios sobre la situación educativa..."
                sx={{ mb: 2 }}
              />
            )}
          />
        </Grid>
      </Grid>
    </FormSection>
  )
}

export default EducationTab
