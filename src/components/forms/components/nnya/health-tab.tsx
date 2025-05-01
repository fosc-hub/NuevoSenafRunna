"use client"

import type React from "react"
import {
  Grid,
  TextField,
  FormControl,
  Autocomplete,
  Paper,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material"
import { Controller, type Control, type UseFormSetValue } from "react-hook-form"
import { MedicalServices as MedicalIcon, Coronavirus as VirusIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import RequiredLabel from "../required-label"
import EnfermedadesFieldArray from "../../EnfermedadesFieldsArray"
import type { DropdownData, FormData } from "../../types/formTypes"

interface HealthTabProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedFields: any
  setValue: UseFormSetValue<FormData>
}

const HealthTab: React.FC<HealthTabProps> = ({ index, control, dropdownData, readOnly, watchedFields, setValue }) => {
  return (
    <>
      {/* Sección de Salud */}
      <FormSection title="Información de Salud" icon={<MedicalIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name={`ninosAdolescentes.${index}.cobertura_medica.institucion_sanitaria`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.institucion_sanitaria || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={dropdownData.institucion_sanitaria?.find((item) => item.id === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.id : null)
                      // Also store the name for reference
                      if (newValue) {
                        setValue(
                          `ninosAdolescentes.${index}.cobertura_medica.institucion_sanitaria_nombre`,
                          newValue.nombre,
                        )
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Institución Sanitaria" />}
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
              name={`ninosAdolescentes.${index}.cobertura_medica.obra_social`}
              rules={{ required: "Este campo es obligatorio" }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.obra_social_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.obra_social_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Obra Social" />}
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
              name={`ninosAdolescentes.${index}.cobertura_medica.intervencion`}
              rules={{ required: "Este campo es obligatorio" }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.intervencion_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.intervencion_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Intervención" />}
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
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.auh`}
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
                label="AUH (Asignación Universal por Hijo)"
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Médico Cabecera
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.medico_cabecera.nombre`}
                    rules={{ required: "Este campo es obligatorio" }}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={<RequiredLabel label="Nombre del Médico" />}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{ readOnly }}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.medico_cabecera.mail`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Email del Médico"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{ readOnly }}
                        type="email"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.medico_cabecera.telefono`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Teléfono del Médico"
                        fullWidth
                        type="number"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{ readOnly }}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name={`ninosAdolescentes.${index}.cobertura_medica.observaciones`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Observaciones Médicas"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  placeholder="Ingrese observaciones sobre la situación médica..."
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Sección de Enfermedades */}
      <FormSection title="Enfermedades" icon={<VirusIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <EnfermedadesFieldArray
              nestIndex={index}
              control={control}
              readOnly={readOnly}
              dropdownData={dropdownData}
              watchedValues={watchedFields}
              setValue={setValue}
            />
          </Grid>
        </Grid>
      </FormSection>
    </>
  )
}

export default HealthTab
