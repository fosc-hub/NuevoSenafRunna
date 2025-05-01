"use client"

import type React from "react"
import {
  Grid,
  TextField,
  FormControl,
  Autocomplete,
  Paper,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { format, parse } from "date-fns"
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  Link as LinkIcon,
  Notes as NotesIcon,
} from "@mui/icons-material"
import FormSection from "../form-section"
import RequiredLabel from "../required-label"
import LocalizacionFields from "../../LocalizacionFields"
import type { DropdownData, FormData } from "../../types/formTypes"

interface PersonalInfoTabProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedFields: any
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ index, control, dropdownData, readOnly, watchedFields }) => {
  return (
    <>
      {/* Sección de Información Personal */}
      <FormSection title="Información Personal" icon={<PersonIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name={`ninosAdolescentes.${index}.nombre`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label={<RequiredLabel label="Nombre" />}
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name={`ninosAdolescentes.${index}.apellido`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label={<RequiredLabel label="Apellido" />}
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={`ninosAdolescentes.${index}.dni`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="DNI"
                  fullWidth
                  error={!!error}
                  type="number"
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={`ninosAdolescentes.${index}.situacionDni`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.situacion_dni_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.situacion_dni_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Situación DNI" />}
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
              name={`ninosAdolescentes.${index}.genero`}
              control={control}
              rules={{ required: "Este campo es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.genero_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.genero_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Género" />}
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
              name={`ninosAdolescentes.${index}.nacionalidad`}
              rules={{ required: "Este campo es obligatorio" }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.nacionalidad_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.nacionalidad_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Nacionalidad" />}
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
        </Grid>
      </FormSection>

      {/* Sección de Fechas */}
      <FormSection title="Fechas" icon={<CalendarIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Controller
              name={`ninosAdolescentes.${index}.fechaNacimiento`}
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha de Nacimiento"
                  value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                  onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                  disabled={readOnly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: { mb: 2 },
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Controller
              name={`ninosAdolescentes.${index}.fechaDefuncion`}
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha de Defunción"
                  value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                  onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                  disabled={readOnly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: { mb: 2 },
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Controller
              name={`ninosAdolescentes.${index}.edadAproximada`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Edad Aproximada"
                  fullWidth
                  type="number"
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Sección de Localización */}
      <FormSection title="Localización" icon={<HomeIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Controller
                    name={`ninosAdolescentes.${index}.useDefaultLocalizacion`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={readOnly}
                        size="small"
                      />
                    )}
                  />
                }
                label="Usar localización de la demanda"
              />
            </Paper>
          </Grid>

          {!watchedFields?.[index]?.useDefaultLocalizacion && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  borderColor: "primary.light",
                  borderStyle: "dashed",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Localización específica</Typography>
                </Box>
                <LocalizacionFields
                  control={control}
                  prefix={`ninosAdolescentes.${index}.localizacion`}
                  dropdownData={dropdownData}
                  readOnly={readOnly}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </FormSection>

      {/* Sección de Información de la Demanda */}
      <FormSection title="Información de la Demanda" icon={<LinkIcon />}>
        <Grid container spacing={3}>
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
                    name={`ninosAdolescentes.${index}.demanda_persona.conviviente`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={readOnly}
                        size="small"
                      />
                    )}
                  />
                }
                label="Conviviente"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={`ninosAdolescentes.${index}.demanda_persona.vinculo_demanda`}
              rules={{ required: "Este campo es obligatorio" }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.vinculo_demanda_choices || []}
                    getOptionLabel={(option) => option.value || ""}
                    value={dropdownData.vinculo_demanda_choices?.find((item) => item.key === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Vínculo con la Demanda" />}
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
              name={`ninosAdolescentes.${index}.demanda_persona.vinculo_con_nnya_principal`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.vinculo_con_nnya_principal_choices || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={
                      dropdownData.vinculo_con_nnya_principal_choices?.find((item) => item.id === field.value) || null
                    }
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vínculo con NNYA Principal"
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
        </Grid>
      </FormSection>

      {/* Sección de Observaciones */}
      <FormSection title="Observaciones" icon={<NotesIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name={`ninosAdolescentes.${index}.observaciones`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Observaciones"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                  size="small"
                  placeholder="Ingrese cualquier información adicional relevante..."
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>
    </>
  )
}

export default PersonalInfoTab
