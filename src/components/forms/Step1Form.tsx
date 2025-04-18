"use client"

import React from "react"
import { useWatch } from "react-hook-form"
import { type Control, Controller, useFieldArray, useController } from "react-hook-form"
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
import { Add, Remove, CloudUpload, AttachFile, OpenInNew } from "@mui/icons-material"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import { useState, useEffect } from "react"

// Componente para la sección de archivos adjuntos
const FileUploadSection = ({ control, readOnly }: { control: Control<FormData>; readOnly?: boolean }) => {
  const { field } = useController({ name: "adjuntos", control, defaultValue: [] })
  const { value, onChange } = field

  // Separar archivos existentes (objetos con propiedad 'archivo') y nuevos archivos (objetos File)
  const existingFiles = Array.isArray(value)
    ? value.filter((file) => typeof file === "object" && "archivo" in file)
    : []

  const newFiles = Array.isArray(value) ? value.filter((file) => !(typeof file === "object" && "archivo" in file)) : []

  // Función para extraer el nombre del archivo de la ruta
  const getFileName = (filePath: string) => {
    return filePath.split("/").pop() || filePath
  }

  // Función para abrir el archivo en una nueva pestaña
  const openFile = (filePath: string) => {
    window.open(`https://web-production-c6370.up.railway.app${filePath}`, "_blank")
  }

  // Función para eliminar un archivo nuevo
  const removeNewFile = (index: number) => {
    const updatedFiles = [...value]
    // Encontrar el índice real considerando los archivos existentes
    const realIndex = existingFiles.length + index
    updatedFiles.splice(realIndex, 1)
    onChange(updatedFiles)
  }

  return (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
      <Grid container spacing={2} justifyContent="center">
        {/* Sección para agregar nuevos archivos */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: "4px",
              p: 2,
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                onChange([...value, ...files])
              }}
              style={{ display: "none" }}
              disabled={readOnly}
            />
            <label htmlFor="file-upload">
              <CloudUpload color="action" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" gutterBottom display="block">
                Arrastra y suelta archivos aquí
              </Typography>
              <Button component="span" variant="outlined" disabled={readOnly} size="small" sx={{ mt: 1 }}>
                SELECCIONAR ARCHIVOS
              </Button>
            </label>

            {newFiles.length > 0 && (
              <Box sx={{ mt: 2, width: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Archivos nuevos:
                </Typography>
                {newFiles.map((file: File, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      py: 0.5,
                      "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                      <AttachFile sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }} fontSize="small" />
                      <Typography variant="body2" noWrap title={file.name}>
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeNewFile(index)} disabled={readOnly} size="small" color="error">
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Sección para mostrar archivos existentes */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #eee",
              borderRadius: "4px",
              p: 1,
              height: "100%",
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Archivos existentes:
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {existingFiles.length > 0 ? (
                existingFiles.map((file: any, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      py: 0.5,
                      "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", flexGrow: 1 }}>
                      <AttachFile sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }} fontSize="small" />
                      <Typography variant="body2" noWrap title={getFileName(file.archivo)}>
                        {getFileName(file.archivo)}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="primary" onClick={() => openFile(file.archivo)}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
                  No hay archivos existentes
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

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

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean }> = ({ control, readOnly = false, id }) => {
  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
  })

  // Vinculacion state
  const [vinculacionResults, setVinculacionResults] = useState<{
    demanda_ids: number[]
    match_descriptions: string[]
  } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // Use the hook from conexionesApi
  const { buscarPorNombreApellido, buscarPorDni, buscarCompleto } = useBusquedaVinculacion(800) // 800ms debounce

  // Handle the results from the vinculacion search
  const handleVinculacionResults = (results: { demanda_ids: number[]; match_descriptions: string[] }) => {
    if (results.demanda_ids.length > 0) {
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // Watch for changes in the relevant fields
  const watchedCodigos = useWatch({
    control,
    name: "codigosDemanda",
  })

  const watchedLocalizacion = useWatch({
    control,
    name: "localizacion",
  })

  // Effect to handle changes in codigo and localizacion
  useEffect(() => {
    if (!watchedCodigos || !watchedLocalizacion) return

    // Check if we have a valid codigo
    const codigoValido = watchedCodigos.find((codigo) => codigo.codigo && codigo.codigo.trim().length > 0)

    // Check if we have valid localizacion data
    const calleValida = watchedLocalizacion?.calle && watchedLocalizacion.calle.trim().length > 0
    const localidadValida = watchedLocalizacion?.localidad && !isNaN(Number(watchedLocalizacion.localidad))

    // If we have valid data, search for vinculaciones
    if (codigoValido || (calleValida && localidadValida)) {
      console.log(
        "Buscando vinculaciones con:",
        codigoValido ? `Código: ${codigoValido.codigo}` : "",
        calleValida ? `Calle: ${watchedLocalizacion.calle}` : "",
        localidadValida ? `Localidad: ${watchedLocalizacion.localidad}` : "",
      )

      // Prepare search data
      const searchData: any = {}

      if (codigoValido) {
        searchData.codigo = codigoValido.codigo
      }

      if (calleValida && localidadValida) {
        searchData.localizacion = {
          calle: watchedLocalizacion.calle,
          localidad: Number(watchedLocalizacion.localidad),
        }
      }

      // Perform the search
      buscarCompleto(
        "", // nombre y apellido vacío
        0, // dni vacío
        codigoValido?.codigo || "",
        calleValida && localidadValida
          ? {
              calle: watchedLocalizacion.calle,
              localidad: Number(watchedLocalizacion.localidad),
            }
          : undefined,
        handleVinculacionResults,
      )
    }
  }, [watchedCodigos, watchedLocalizacion, buscarCompleto])

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

  // Lista de etiquetas (ejemplo - ajustar según necesidades reales)
  const etiquetasOptions = [
    { id: "urgente", nombre: "Urgente" },
    { id: "prioritario", nombre: "Prioritario" },
    { id: "seguimiento", nombre: "Seguimiento" },
    { id: "pendiente", nombre: "Pendiente" },
    { id: "completado", nombre: "Completado" },
    { id: "revision", nombre: "En Revisión" },
  ]

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
        {/* Sección de Información Básica */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
            Información Básica
          </Typography>
        </Grid>

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

        {/* Sección de Etiqueta y Envío de Respuesta */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="etiqueta"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.etiqueta || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={dropdownData.etiqueta?.find((item) => item.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Etiqueta" error={!!error} helperText={error?.message} size="small" />
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

        <Grid item xs={12} sm={6}>
          <Controller
            name="envio_de_respuesta"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.envio_de_respuesta_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.envio_de_respuesta_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Envío de respuesta"
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

        {/* Sección de Datos del Remitente */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Datos del Remitente
          </Typography>
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

        {/* Sección de Códigos de Demanda */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Códigos de Demanda
          </Typography>
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

        {/* Sección de Clasificación de la Demanda */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Clasificación de la Demanda
          </Typography>
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

        {/* Sección de Motivos de Intervención */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Motivos de Intervención
          </Typography>
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

        {/* Sección de Zona de Asignación */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
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

        {/* Sección de Localización */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Datos de Localización del grupo familiar
          </Typography>
          <LocalizacionFields prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </Grid>

        {/* Sección de Archivos Adjuntos */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Archivos Adjuntos
          </Typography>
          <FileUploadSection control={control} readOnly={readOnly} />
        </Grid>

        {/* Sección de Observaciones */}
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
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
      {/* Notification for vinculacion results */}
      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
      />
    </LocalizationProvider>
  )
}

export default Step1Form
