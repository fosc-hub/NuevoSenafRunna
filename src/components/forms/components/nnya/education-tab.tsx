"use client"

import type React from "react"
import { Grid, TextField, FormControl, Autocomplete, Paper, FormControlLabel, Checkbox } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { School as SchoolIcon } from "@mui/icons-material"
import FormSection from "../form-section"
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
            name={`ninosAdolescentes.${index}.educacion.institucion_educativa`}
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={[
                    ...((dropdownData.instituciones_educativas || dropdownData.institucion_educativa) || []),
                    { id: "other", nombre: "Otra" },
                  ]}
                  getOptionLabel={(option: any) => option.nombre || ""}
                  value={
                    field.value === "other"
                      ? { id: "other", nombre: "Otra" }
                      : ((dropdownData.instituciones_educativas || dropdownData.institucion_educativa) || [])
                        .find((item: any) => item.id === (typeof field.value === 'object' && field.value ? (field.value as any).id : field.value)) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? (newValue.id === "other" ? "other" : { id: newValue.id, nombre: newValue.nombre }) : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Institución Educativa"
                      required
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        {watchedFields?.[index]?.educacion?.institucion_educativa === "other" && (
          <Grid item xs={12}>
            <Controller
              name={`ninosAdolescentes.${index}.educacion.institucion_educativa`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Nueva Institución Educativa"
                  required
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
                  options={(dropdownData.nivel_alcanzado_choices || dropdownData.nivel_educativo_choices) || []}
                  getOptionLabel={(option: any) => option.value || ""}
                  value={
                    ((dropdownData.nivel_alcanzado_choices || dropdownData.nivel_educativo_choices) || [])
                      .find((item: any) => item.key === field.value) || null
                  }
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nivel Alcanzado"
                      required
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
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
                  getOptionLabel={(option: any) => option.value || ""}
                  value={dropdownData.ultimo_cursado_choices?.find((item: any) => item.key === field.value) || null}
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
                  getOptionLabel={(option: any) => option.value || ""}
                  value={dropdownData.tipo_escuela_choices?.find((item: any) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Escuela"
                      required
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
                  )}
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
