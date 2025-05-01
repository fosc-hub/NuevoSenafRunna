"use client"

import type React from "react"
import { Grid, TextField, FormControl, Autocomplete } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { Person as PersonIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import RequiredLabel from "../required-label"
import type { DropdownData, FormData } from "../../types/formTypes"

interface PersonalInfoSectionProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ index, control, dropdownData, readOnly }) => {
  return (
    <FormSection title="Información Personal" icon={<PersonIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name={`adultosConvivientes.${index}.nombre`}
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
            name={`adultosConvivientes.${index}.apellido`}
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
            name={`adultosConvivientes.${index}.dni`}
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

        {dropdownData && dropdownData.situacion_dni_choices ? (
          <Grid item xs={12} md={6}>
            <Controller
              name={`adultosConvivientes.${index}.situacionDni`}
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
        ) : null}

        <Grid item xs={12} md={6}>
          <Controller
            name={`adultosConvivientes.${index}.genero`}
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
            name={`adultosConvivientes.${index}.nacionalidad`}
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
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
  )
}

export default PersonalInfoSection
