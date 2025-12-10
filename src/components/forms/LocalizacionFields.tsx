"use client"

import React from "react"
import { Grid, TextField, FormControl, Paper, Autocomplete } from "@mui/material"
import { type Control, Controller, useWatch } from "react-hook-form"
import type { DropdownData } from "./types/formTypes"

interface LocalizacionFieldsProps {
  control: Control<any>
  prefix: string
  dropdownData: DropdownData
  readOnly?: boolean
}

// Helper function to add a red asterisk to labels
const RequiredLabel = ({ label }: { label: string }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

const LocalizacionFields: React.FC<LocalizacionFieldsProps> = ({ control, prefix, dropdownData, readOnly = false }) => {
  const selectedLocalidad = useWatch({
    control,
    name: `${prefix}.localidad`,
  })

  const filteredBarrios = dropdownData.barrio?.filter((barrio: any) => barrio.localidad === selectedLocalidad)

  const filteredCPCs = dropdownData.cpc?.filter((cpc: any) => cpc.localidad === selectedLocalidad)

  return (
    <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
      <Grid container spacing={3}>
        {/* Calle y Tipo de Calle */}
        <Grid item xs={12} md={8}>
          <Controller
            name={`${prefix}.calle`}
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={<RequiredLabel label="Calle" />}
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.tipo_calle`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.tipo_calle_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.tipo_calle_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Calle"
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

        {/* Altura y Piso/Depto */}
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.casa_nro`}
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={<RequiredLabel label="Altura" />}
                fullWidth
                type="number"
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.piso_depto`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Piso/Depto"
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>

        {/* Lote y Manzana */}
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.lote`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Lote"
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.mza`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Manzana"
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>

        {/* Referencia Geográfica */}
        <Grid item xs={12}>
          <Controller
            name={`${prefix}.referencia_geo`}
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={<RequiredLabel label="Referencia Geográfica" />}
                fullWidth
                multiline
                rows={2}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name={`${prefix}.geolocalizacion`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Geolocalización"
                fullWidth
                multiline
                rows={2}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
        {/* Localidad */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.localidad`}
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.localidad || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.localidad?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Localidad" />}
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

        {/* Barrio */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.barrio`}
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredBarrios || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={filteredBarrios?.find((item) => item.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField {...params} label="Barrio" error={!!error} helperText={error?.message} size="small" />
                    )}
                    PopperProps={{
                      style: { width: "auto", maxWidth: "300px" },
                    }}
                    size="small"
                  />
                </FormControl>
              )
            }}
          />
        </Grid>

        {/* CPC */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.cpc`}
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredCPCs || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={filteredCPCs?.find((item) => item.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField {...params} label="CPC" error={!!error} helperText={error?.message} size="small" />
                    )}
                    PopperProps={{
                      style: { width: "auto", maxWidth: "300px" },
                    }}
                    size="small"
                  />
                </FormControl>
              )
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default LocalizacionFields

