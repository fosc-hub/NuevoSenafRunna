"use client"

import React, { useState, useEffect } from "react"
import { useWatch } from "react-hook-form"
import { type Control, Controller, useFieldArray, useController } from "react-hook-form"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { es } from "date-fns/locale"
import { format, parse } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import {
  TextField,
  Grid,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Box,
  FormHelperText,
  Autocomplete,
  Typography,
  Paper,
  Tooltip,
  Alert,
  Collapse,
  Card,
  CardContent,
} from "@mui/material"
import { Add, Remove, CloudUpload, AttachFile, OpenInNew, ExpandMore, ExpandLess } from "@mui/icons-material"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "./types/formTypes"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"

// Mock data for Oficio functionality
const TIPOS_OFICIO_MOCK = [
  { id: "oficio_1", nombre: "Evaluación Psicológica Integral - 3 actividades, 8 acciones" },
  { id: "oficio_2", nombre: "Visita Domiciliaria Completa - 4 actividades, 12 acciones" },
  { id: "oficio_3", nombre: "Seguimiento Familiar - 2 actividades, 5 acciones" },
  { id: "oficio_4", nombre: "Entrevista Socioambiental - 3 actividades, 7 acciones" },
  { id: "oficio_5", nombre: "Informe Técnico Multidisciplinario - 5 actividades, 15 acciones" },
]

const TIPOS_MEDIDA_MOCK = [
  { id: "mpi", nombre: "MPI" },
  { id: "mpe", nombre: "MPE" },
  { id: "mpj", nombre: "MPJ" },
]

const OFICIO_OPTION = { key: "oficio", value: "Oficio" }

// Helper function to add a red asterisk to labels
const RequiredLabel = ({ label }: { label: string }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

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
    // If the path already includes the full URL, use it directly
    // Otherwise, prepend the base URL
    const url = filePath.startsWith("http://") || filePath.startsWith("https://")
      ? filePath
      : `https://web-runna-v2legajos.up.railway.app${filePath}`
    window.open(url, "_blank")
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
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={3}>
          {/* Sección para agregar nuevos archivos */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "primary.light",
                borderRadius: "8px",
                p: 3,
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                backgroundColor: "background.paper",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
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
                <CloudUpload color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Arrastra y suelta archivos aquí
                </Typography>
                <Button
                  component="span"
                  variant="contained"
                  disabled={readOnly}
                  size="medium"
                  sx={{ mt: 2 }}
                  disableElevation
                >
                  SELECCIONAR ARCHIVOS
                </Button>
              </label>

              {newFiles.length > 0 && (
                <Box sx={{ mt: 3, width: "100%" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Archivos nuevos:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: "150px", overflow: "auto" }}>
                    {newFiles.map((file: File | { archivo: string }, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          py: 0.75,
                          px: 1,
                          "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                          <AttachFile sx={{ mr: 1, color: "primary.light", flexShrink: 0 }} fontSize="small" />
                          <Typography variant="body2" noWrap title={'name' in file ? file.name : file.archivo}>
                            {'name' in file ? file.name : file.archivo}
                          </Typography>
                        </Box>
                        <Tooltip title="Eliminar archivo">
                          <IconButton
                            onClick={() => removeNewFile(index)}
                            disabled={readOnly}
                            size="small"
                            color="error"
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Sección para mostrar archivos existentes */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                p: 3,
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Archivos existentes:
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                  mt: 1,
                }}
              >
                {existingFiles.length > 0 ? (
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: "200px", overflow: "auto" }}>
                    {existingFiles.map((file: any, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          py: 0.75,
                          px: 1,
                          "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", flexGrow: 1 }}>
                          <AttachFile sx={{ mr: 1, color: "primary.light", flexShrink: 0 }} fontSize="small" />
                          <Typography variant="body2" noWrap title={getFileName(file.archivo)}>
                            {getFileName(file.archivo)}
                          </Typography>
                        </Box>
                        <Tooltip title="Ver archivo">
                          <IconButton size="small" color="primary" onClick={() => openFile(file.archivo)}>
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Paper>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                      No hay archivos existentes
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// Componente de sección con título y contenido
const FormSection = ({
  title,
  children,
  collapsible = false,
}: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
}) => {
  const [expanded, setExpanded] = useState(!collapsible)

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          cursor: collapsible ? "pointer" : "default",
          "&:hover": collapsible ? { color: "primary.main" } : {},
        }}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <Typography
          color="primary"
          variant="subtitle1"
          sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
        >
          {title}
          {collapsible && (expanded ? <ExpandLess /> : <ExpandMore />)}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {children}
        </Paper>
      </Collapse>
    </Box>
  )
}

interface Step1FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean; id?: number }> = ({ control, readOnly = false, id }) => {
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
    const codigoValido = watchedCodigos.find((codigo: any) => codigo.codigo && codigo.codigo.trim().length > 0)

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
        id, // Pass the current demanda ID
      )
    }
  }, [watchedCodigos, watchedLocalizacion, buscarCompleto])

  const selectedMotivo = useWatch({ control, name: "motivo_ingreso" })
  const selectedBloqueRemitente = useWatch({ control, name: "bloque_datos_remitente" })
  const selectedObjetivoDemanda = useWatch({ control, name: "objetivo_de_demanda" })

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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar los datos del formulario. Por favor, intente nuevamente.
      </Alert>
    )
  }

  if (!dropdownData) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No se pudieron cargar los datos del formulario. Por favor, intente nuevamente.
      </Alert>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: "12px", bgcolor: "primary.light", color: "white" }}>
          <Typography variant="h5" gutterBottom>
            Registro de Demanda
          </Typography>
          <Typography variant="body2">
            Complete todos los campos requeridos para registrar una nueva demanda en el sistema.
          </Typography>
        </Paper>

        {/* Sección de Información Básica */}
        <FormSection title="Información Básica">
          <Grid container spacing={3}>
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
                        size: "medium",
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
                        size: "medium",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="etiqueta"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.etiqueta || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.etiqueta?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Etiqueta"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
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
                      getOptionLabel={(option: any) => option.value || ""}
                      value={dropdownData.envio_de_respuesta_choices?.find((item: any) => item.key === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Envío de respuesta"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Datos del Remitente */}
        <FormSection title="Tipo de Organismo">
          <Grid container spacing={3}>
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
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.bloques_datos_remitente?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={<RequiredLabel label="Tipo de Organismo" />}
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
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
                        getOptionLabel={(option: any) => option.nombre || ""}
                        value={filteredSubOrigins?.find((item: any) => item.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={<RequiredLabel label="Organismo" />}
                            error={!!error}
                            helperText={error?.message}
                            size="medium"
                          />
                        )}
                        size="medium"
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
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Nombre de la Institución"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{ readOnly }}
                    size="medium"
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Códigos de Demanda */}
        <FormSection title="Códigos de Demanda">
          <Box>
            {fields.map((field, index) => (
              <Paper
                key={field.id}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: "8px",
                  borderColor: index % 2 === 0 ? "primary.light" : "divider",
                }}
              >
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
                            getOptionLabel={(option: any) => option.nombre || ""}
                            value={dropdownData.tipo_codigo_demanda?.find((item: any) => item.id === field.value) || null}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => <TextField {...params} label="Tipo de Número" size="medium" />}
                            size="medium"
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
                          size="medium"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Eliminar código">
                      <IconButton
                        onClick={() => remove(index)}
                        disabled={readOnly}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "error.lighter",
                          },
                        }}
                      >
                        <Remove />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              startIcon={<Add />}
              onClick={() => append({ tipo: "", codigo: "" })}
              disabled={readOnly}
              variant="outlined"
              sx={{
                mt: 2,
                borderRadius: "20px",
                px: 3,
              }}
              size="medium"
            >
              AGREGAR NÚMERO
            </Button>
          </Box>
        </FormSection>

        {/* Sección de Clasificación de la Demanda */}
        <FormSection title="Clasificación de la Demanda">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="ambito_vulneracion"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.ambito_vulneracion || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.ambito_vulneracion?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ámbito de Vulneración"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="objetivo_de_demanda"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => {
                  // Combine API options with mock "Oficio" option
                  const objetivoDemandaOptions = [
                    ...(dropdownData.objetivo_de_demanda_choices || []),
                    OFICIO_OPTION,
                  ]

                  return (
                    <FormControl fullWidth error={!!error}>
                      <Autocomplete
                        disabled={readOnly}
                        options={objetivoDemandaOptions}
                        getOptionLabel={(option: any) => option.value || ""}
                        value={objetivoDemandaOptions.find((item: any) => item.key === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={<RequiredLabel label="Objetivo de demanda" />}
                            error={!!error}
                            helperText={error?.message}
                            size="medium"
                          />
                        )}
                        size="medium"
                      />
                    </FormControl>
                  )
                }}
              />
            </Grid>

            {/* Conditional fields when "Oficio" is selected */}
            {selectedObjetivoDemanda === "oficio" && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="tipo_oficio"
                    rules={{ required: "Este campo es obligatorio cuando se selecciona Oficio" }}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <Autocomplete
                          disabled={readOnly}
                          options={TIPOS_OFICIO_MOCK}
                          getOptionLabel={(option: any) => option.nombre || ""}
                          value={TIPOS_OFICIO_MOCK.find((item: any) => item.id === field.value) || null}
                          onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={<RequiredLabel label="Tipo de Oficio" />}
                              error={!!error}
                              helperText={error?.message}
                              size="medium"
                            />
                          )}
                          size="medium"
                        />
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="tipo_medida"
                    rules={{ required: "Este campo es obligatorio cuando se selecciona Oficio" }}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <Autocomplete
                          disabled={readOnly}
                          options={TIPOS_MEDIDA_MOCK}
                          getOptionLabel={(option: any) => option.nombre || ""}
                          value={TIPOS_MEDIDA_MOCK.find((item: any) => item.id === field.value) || null}
                          onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={<RequiredLabel label="Tipo de medida" />}
                              error={!!error}
                              helperText={error?.message}
                              size="medium"
                            />
                          )}
                          size="medium"
                        />
                      </FormControl>
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </FormSection>

        {/* Sección de Motivos de Intervención */}
        <FormSection title="Principal Motivo de Intervención">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="motivo_ingreso"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.categoria_motivo || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.categoria_motivo?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Presunto motivo de Intervención"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
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
                    (submotivo: any) => submotivo.motivo === selectedMotivo,
                  )

                  return (
                    <FormControl fullWidth error={!!error}>
                      <Autocomplete
                        disabled={readOnly}
                        options={filteredSubmotivos || []}
                        getOptionLabel={(option: any) => option.nombre || ""}
                        value={filteredSubmotivos?.find((item: any) => item.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Presunto submotivo de intervención"
                            error={!!error}
                            helperText={error?.message}
                            size="medium"
                          />
                        )}
                        size="medium"
                      />
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Zona de Asignación */}
        <FormSection title="Zona de asignación de la demanda">
          <Grid container spacing={3}>
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
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.zonas?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={<RequiredLabel label="Zona a la cual se le asignará la demanda" />}
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Localización */}
        <FormSection title="Datos de Localización del grupo familiar">
          <LocalizacionFields control={control} prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </FormSection>

        {/* Sección de Archivos Adjuntos */}
        <FormSection title="Archivos Adjuntos">
          <FileUploadSection control={control} readOnly={readOnly} />
        </FormSection>

        {/* Sección de Observaciones */}
        <FormSection title="Observaciones" collapsible={true}>
          <Grid container spacing={3}>
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
                    size="medium"
                    placeholder="Ingrese cualquier información adicional relevante para esta demanda..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormSection>
      </Box>
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
