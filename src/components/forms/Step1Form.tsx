"use client"

import React from "react"
import { useWatch } from "react-hook-form"
import { type Control, Controller, useFieldArray } from "react-hook-form"
import {
  TextField,
  Grid,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  FormHelperText,
  Autocomplete,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { format, parse } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "./types/formTypes"
import { Typography } from "@mui/material"
import { Add, Remove, CloudUpload } from "@mui/icons-material"

interface Step1FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

// Helper function to add a red asterisk to labels
const RequiredLabel = ({ label }: { label: string }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean }> = ({ control, readOnly = false }) => {
  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
  })
  const selectedMotivo = useWatch({ control, name: "motivo_ingreso" })
  const selectedBloqueRemitente = useWatch({ control, name: "bloque_datos_remitente" })

  const createNewUser = useWatch({
    control,
    name: "createNewUsuarioExterno",
    defaultValue: false,
  })

  const [selectedNumberType, setSelectedNumberType] = React.useState<string>("nro_notificacion_102")
  const { fields, append, remove } = useFieldArray({
    control,
    name: "codigosDemanda",
  })

  const {
    data: zonasData,
    isLoading: isLoadingZonas,
    isError: isErrorZonas,
  } = useQuery({
    queryKey: ["zonas"],
  })

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return <Typography color="error">Error al cargar los datos del formulario</Typography>
  }

  if (!dropdownData) {
    return <Typography>No se pudieron cargar los datos del formulario</Typography>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="fecha_oficio_documento"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label={<RequiredLabel label="Fecha de oficio/documento" />}
                disabled={readOnly}
                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                    size: "small",
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="fecha_ingreso_senaf"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label={<RequiredLabel label="Fecha de ingreso SENAF" />}
                disabled={readOnly}
                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                    size: "small",
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="bloque_datos_remitente"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.bloques_datos_remitente || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.bloques_datos_remitente?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Datos del remitente" />}
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
            name="tipo_institucion"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => {
              const filteredSubOrigins = dropdownData.tipo_institucion_demanda?.filter(
                (subOrigen: any) => subOrigen.bloque_datos_remitente === selectedBloqueRemitente,
              )

              return (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredSubOrigins || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={filteredSubOrigins?.find((item) => item.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label="Tipo de Institución" />}
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
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="institucion"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={<RequiredLabel label="Institución" />}
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <Controller
                        name={`codigosDemanda.${index}.tipo`}
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            disabled={readOnly}
                            options={dropdownData.tipo_codigo_demanda || []}
                            getOptionLabel={(option) => option.nombre || ""}
                            value={dropdownData.tipo_codigo_demanda?.find((item) => item.id === field.value) || null}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => <TextField {...params} label="Tipo de Número" size="small" />}
                            PopperProps={{
                              style: { width: "auto", maxWidth: "300px" },
                            }}
                            size="small"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Controller
                      name={`codigosDemanda.${index}.codigo`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Número"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{ readOnly }}
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <IconButton
                      onClick={() => remove(index)}
                      disabled={readOnly}
                      sx={{
                        color: "action.active",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                  </Grid>
                  {index < fields.length - 1 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  )}
                </Grid>
              </React.Fragment>
            ))}
            <Button
              startIcon={<Add />}
              onClick={() => append({ tipo: "", codigo: "" })}
              disabled={readOnly}
              sx={{
                mt: 2,
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.lighter",
                },
              }}
              size="small"
            >
              AGREGAR NÚMERO
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="ambito_vulneracion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.ambito_vulneracion || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.ambito_vulneracion?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ámbito de Vulneración"
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
            name="tipo_demanda"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.tipo_demanda_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.tipo_demanda_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Tipo de Demanda" />}
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
            name="tipos_presuntos_delitos"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.tipo_presunto_delito || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.tipo_presunto_delito?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => {
                    console.log("Selected presunto_delito:", newValue ? newValue.id : null)
                    field.onChange(newValue ? newValue.id : null)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Presunto Delito"
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
                {error && <FormHelperText>{error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="objetivo_de_demanda"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.objetivo_de_demanda_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.objetivo_de_demanda_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Objetivo de demanda" />}
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
            name="motivo_ingreso"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.categoria_motivo || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.categoria_motivo?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Presunto motivo de Intervención"
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
            name="submotivo_ingreso"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const filteredSubmotivos = dropdownData.categoria_submotivo?.filter(
                (submotivo) => submotivo.motivo === selectedMotivo,
              )

              return (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredSubmotivos || []}
                    getOptionLabel={(option) => option.nombre || ""}
                    value={filteredSubmotivos?.find((item) => item.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Presunto submotivo de intervención"
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
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Zona de asignación de la demanda
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="zona"
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.zonas || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.zonas?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Zona a la cual se le asignará la demanda" />}
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
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Datos de Localización del grupo familiar
          </Typography>
          <LocalizacionFields prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Archivos Adjuntos
          </Typography>
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
            <Controller
              name="adjuntos"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      field.onChange([...field.value, ...files])
                    }}
                    style={{ display: "none" }}
                    disabled={readOnly}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      component="span"
                      startIcon={<CloudUpload />}
                      variant="outlined"
                      disabled={readOnly}
                      sx={{
                        mb: 2,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.lighter",
                        },
                      }}
                      size="small"
                    >
                      AGREGAR ARCHIVOS
                    </Button>
                  </label>

                  {field.value.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Archivos seleccionados:
                      </Typography>
                      {field.value.map((file: File, index: number) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {file.name}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              const newFiles = [...field.value]
                              newFiles.splice(index, 1)
                              field.onChange(newFiles)
                            }}
                            disabled={readOnly}
                            size="small"
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Observaciones
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="observaciones"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Observaciones"
                fullWidth
                multiline
                rows={6}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

export default Step1Form

