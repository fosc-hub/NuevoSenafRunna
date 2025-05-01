"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useFieldArray, type Control, Controller, useWatch } from "react-hook-form"
import {
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Checkbox,
  Button,
  Box,
  FormControl,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  useTheme,
  Autocomplete,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  useMediaQuery,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  Notes as NotesIcon,
} from "@mui/icons-material"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData } from "./types/formTypes"
import { format, parse } from "date-fns"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import { useParams } from "next/navigation"

interface FormData {
  adultosConvivientes: {
    nombre: string
    apellido: string
    fechaNacimiento: Date | null
    fechaDefuncion: Date | null
    edadAproximada: string
    dni: string
    situacionDni: string
    genero: string
    conviviente: boolean
    legalmenteResponsable: boolean
    ocupacion: string
    supuesto_autordv: string
    garantiza_proteccion: boolean
    observaciones: string
    useDefaultLocalizacion: boolean
    telefono: string
    localizacion?: {
      calle: string
      localidad: number
      // otros campos de localización
    }
    vinculacion: string
    vinculo_con_nnya_principal: number
    vinculo_demanda: string
    condicionesVulnerabilidad: string[]
    nacionalidad: string
  }[]
  street: string
  city: string
  country: string
}

interface Step2FormProps {
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly?: boolean
  id?: string
}

// Helper function to add a red asterisk to labels
const RequiredLabel = ({ label }: { label: string }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

// Section component for better organization
const FormSection = ({
  title,
  icon,
  children,
}: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box sx={{ mr: 1, color: "primary.main" }}>{icon}</Box>
      <Typography color="primary" variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ pl: 1 }}>{children}</Box>
  </Box>
)

const Step2Form: React.FC<Step2FormProps> = ({ control, dropdownData, readOnly = false, id }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "adultosConvivientes",
  })
  const watchedFields = useWatch({ control, name: "adultosConvivientes" })
  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Vinculacion state
  const [vinculacionResults, setVinculacionResults] = useState<{
    demanda_ids: number[]
    match_descriptions: string[]
  } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // Use the hook from conexionesApi
  const { buscarCompleto } = useBusquedaVinculacion(800) // 800ms debounce

  // Memoizar la función handleVinculacionResults para evitar recreaciones innecesarias
  const handleVinculacionResults = useCallback((results: { demanda_ids: number[]; match_descriptions: string[] }) => {
    if (results.demanda_ids.length > 0) {
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }, [])

  // Observar SOLO los campos específicos que necesitamos para la búsqueda
  const watchedNombres = useWatch({
    control,
    name: fields.map((field, index) => `adultosConvivientes.${index}.nombre`),
  })

  const watchedApellidos = useWatch({
    control,
    name: fields.map((field, index) => `adultosConvivientes.${index}.apellido`),
  })

  const watchedDnis = useWatch({
    control,
    name: fields.map((field, index) => `adultosConvivientes.${index}.dni`),
  })

  const watchedUseDefaultLocalizacion = useWatch({
    control,
    name: fields.map((field, index) => `adultosConvivientes.${index}.useDefaultLocalizacion`),
  })

  // Effect para manejar cambios SOLO en los campos relevantes para la búsqueda
  useEffect(() => {
    if (!fields.length) return

    // Procesar cada adulto
    fields.forEach((field, index) => {
      // Obtener los valores actuales
      const nombre = watchedNombres[index] || ""
      const apellido = watchedApellidos[index] || ""
      const dni = watchedDnis[index] || ""
      const useDefaultLocalizacion = watchedUseDefaultLocalizacion[index]

      // Construir nombre completo
      const nombreCompleto = nombre && apellido ? `${nombre} ${apellido}`.trim() : ""
      const dniValue = dni ? Number.parseInt(dni) : 0

      // Verificar si tiene localización específica
      let localizacionData = undefined
      if (!useDefaultLocalizacion && watchedFields?.[index]?.localizacion) {
        const localizacion = watchedFields[index].localizacion
        if (localizacion) {
          localizacionData = {
            calle: localizacion.calle || "",
            localidad: Number(localizacion.localidad) || 0,
          }
        }
      }

      // La función buscarCompleto ahora se encarga de validar los datos y aplicar el debounce
      buscarCompleto(nombreCompleto, dniValue, "", localizacionData, handleVinculacionResults)
    })
  }, [
    fields,
    watchedNombres,
    watchedApellidos,
    watchedDnis,
    watchedUseDefaultLocalizacion,
    watchedFields,
    buscarCompleto,
    handleVinculacionResults,
  ])

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const addAdultoConviviente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      fechaDefuncion: null,
      edadAproximada: "",
      dni: "",
      situacionDni: "",
      genero: "",
      conviviente: false,
      legalmenteResponsable: false,
      ocupacion: "",
      supuesto_autordv: "",
      garantiza_proteccion: false,
      observaciones: "",
      useDefaultLocalizacion: true,
      telefono: "",
      vinculacion: "",
      vinculo_con_nnya_principal: 0,
      vinculo_demanda: "",
      condicionesVulnerabilidad: [],
      nacionalidad: "",
    })
    setExpandedSections((prev) => [...prev, true])
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newExpandedSections = [...prev]
      newExpandedSections[index] = !newExpandedSections[index]
      return newExpandedSections
    })
  }

  const openDeleteDialog = (index: number) => {
    setDeleteIndex(index)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleteIndex(null)
  }

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex)
      setExpandedSections((prev) => {
        const newExpandedSections = [...prev]
        newExpandedSections.splice(deleteIndex, 1)
        return newExpandedSections
      })
      closeDeleteDialog()
    }
  }

  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  }

  const getStyles = (name: string, selectedItems: string[], theme: any) => {
    return {
      fontWeight:
        selectedItems.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    }
  }

  const params = useParams()

  // Function to get initials from name and surname
  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }

  // Function to get a color based on index
  const getAvatarColor = (index: number) => {
    const colors = [
      "#1976d2", // blue
      "#388e3c", // green
      "#d32f2f", // red
      "#7b1fa2", // purple
      "#f57c00", // orange
      "#0288d1", // light blue
      "#c2185b", // pink
      "#455a64", // blue grey
      "#512da8", // deep purple
      "#00796b", // teal
    ]
    return colors[index % colors.length]
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <PersonIcon sx={{ mr: 1 }} /> Adultos Convivientes
          </Typography>
          {!readOnly && fields.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addAdultoConviviente}
              size="small"
              color="primary"
              sx={{ borderRadius: "20px" }}
            >
              Añadir Adulto
            </Button>
          )}
        </Box>

        {fields.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              backgroundColor: "background.paper",
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay adultos registrados
            </Typography>
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addAdultoConviviente}
                sx={{ mt: 2, borderRadius: "20px" }}
              >
                Añadir Adulto
              </Button>
            )}
          </Paper>
        ) : (
          fields.map((field, index) => {
            const watchedField = watchedFields?.[index] || {}
            const fullName = `${watchedField.nombre || ""} ${watchedField.apellido || ""}`.trim()
            const hasName = fullName.length > 0
            const hasVulnerabilities = (watchedField.condicionesVulnerabilidad || []).length > 0

            return (
              <Card
                key={field.id}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  overflow: "visible",
                  boxShadow: expandedSections[index] ? 3 : 1,
                  transition: "box-shadow 0.3s ease-in-out",
                  border: hasVulnerabilities ? `1px solid ${theme.palette.warning.light}` : undefined,
                }}
              >
                <CardHeader
                  avatar={
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        hasVulnerabilities ? (
                          <Tooltip
                            title={`${watchedField.condicionesVulnerabilidad?.length} condiciones de vulnerabilidad`}
                          >
                            <WarningIcon color="warning" fontSize="small" />
                          </Tooltip>
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(index),
                          width: 40,
                          height: 40,
                          fontSize: "1rem",
                        }}
                      >
                        {hasName
                          ? getInitials(watchedField.nombre || "", watchedField.apellido || "")
                          : `A${index + 1}`}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {hasName ? fullName : `Adulto ${index + 1}`}
                      </Typography>
                      {watchedField.dni && (
                        <Chip
                          label={`DNI: ${watchedField.dni}`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1, fontSize: "0.75rem" }}
                        />
                      )}
                    </Box>
                  }
                  subheader={
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                      {watchedField.vinculacion && (
                        <Chip
                          icon={<LinkIcon fontSize="small" />}
                          label={
                            dropdownData.vinculo_demanda_choices?.find((item) => item.key === watchedField.vinculacion)
                              ?.value || "Vinculación"
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      )}
                      {watchedField.legalmenteResponsable && (
                        <Chip
                          label="Legalmente Responsable"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      )}
                      {watchedField.conviviente && (
                        <Chip
                          label="Conviviente"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                  }
                  action={
                    <Box>
                      <IconButton onClick={() => toggleSection(index)} size="small">
                        {expandedSections[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      {!readOnly && (
                        <IconButton onClick={() => openDeleteDialog(index)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  }
                  sx={{
                    pb: expandedSections[index] ? 0 : 2,
                    "& .MuiCardHeader-content": {
                      overflow: "hidden",
                    },
                  }}
                />

                <Collapse in={expandedSections[index]}>
                  <CardContent sx={{ pt: 0 }}>
                    <Divider sx={{ my: 2 }} />

                    {/* Sección de Información Personal */}
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
                                    value={
                                      dropdownData.situacion_dni_choices?.find((item) => item.key === field.value) ||
                                      null
                                    }
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
                                  value={
                                    dropdownData.nacionalidad_choices?.find((item) => item.key === field.value) || null
                                  }
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
                            name={`adultosConvivientes.${index}.fechaNacimiento`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                label="Fecha de Nacimiento"
                                disabled={readOnly}
                                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
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
                            name={`adultosConvivientes.${index}.fechaDefuncion`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                label="Fecha de Defunción"
                                disabled={readOnly}
                                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
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
                            name={`adultosConvivientes.${index}.edadAproximada`}
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

                    {/* Sección de Ocupación y Responsabilidad */}
                    <FormSection title="Ocupación y Responsabilidad" icon={<WorkIcon />}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`adultosConvivientes.${index}.ocupacion`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                                <Autocomplete
                                  disabled={readOnly}
                                  options={dropdownData.ocupacion_choices || []}
                                  getOptionLabel={(option) => option.value || ""}
                                  value={
                                    dropdownData.ocupacion_choices?.find((item) => item.key === field.value) || null
                                  }
                                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Ocupación"
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
                                  name={`adultosConvivientes.${index}.legalmenteResponsable`}
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
                              label="Legalmente Responsable"
                            />

                            <FormControlLabel
                              control={
                                <Controller
                                  name={`adultosConvivientes.${index}.conviviente`}
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
                              label="Conviviente con el NNYA"
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </FormSection>

                    {/* Sección de Vínculos */}
                    <FormSection title="Vínculos" icon={<LinkIcon />}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`adultosConvivientes.${index}.vinculacion`}
                            rules={{ required: "Este campo es obligatorio" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                                <Autocomplete
                                  disabled={readOnly}
                                  options={dropdownData.vinculo_demanda_choices || []}
                                  getOptionLabel={(option) => option.value || ""}
                                  value={
                                    dropdownData.vinculo_demanda_choices?.find((item) => item.key === field.value) ||
                                    null
                                  }
                                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={<RequiredLabel label="Vinculación" />}
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
                            name={`adultosConvivientes.${index}.vinculo_con_nnya_principal`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                                <Autocomplete
                                  disabled={readOnly}
                                  options={dropdownData.vinculo_con_nnya_principal_choices || []}
                                  getOptionLabel={(option) => option.nombre || ""}
                                  value={
                                    dropdownData.vinculo_con_nnya_principal_choices?.find(
                                      (item) => item.id === field.value,
                                    ) || null
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

                    {/* Sección de Contacto */}
                    <FormSection title="Datos de Contacto" icon={<PhoneIcon />}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`adultosConvivientes.${index}.telefono`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="Número de Teléfono"
                                fullWidth
                                error={!!error}
                                helperText={error?.message}
                                InputProps={{ readOnly }}
                                size="small"
                                type="number"
                                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                sx={{ mb: 2 }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
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
                                  name={`adultosConvivientes.${index}.useDefaultLocalizacion`}
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

                        {!watchedField.useDefaultLocalizacion && (
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
                                prefix={`adultosConvivientes.${index}.localizacion`}
                                dropdownData={dropdownData}
                                readOnly={readOnly}
                              />
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </FormSection>

                    {/* Sección de Vulnerabilidad */}
                    <FormSection title="Condiciones de Vulnerabilidad" icon={<WarningIcon />}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Controller
                            name={`adultosConvivientes.${index}.condicionesVulnerabilidad`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                                <Autocomplete
                                  disabled={readOnly}
                                  multiple
                                  options={
                                    dropdownData.condiciones_vulnerabilida?.filter((cv) => cv.adulto && !cv.nnya) || []
                                  }
                                  getOptionLabel={(option) =>
                                    option.nombre ? `${option.nombre} (Peso: ${option.peso})` : ""
                                  }
                                  value={(field.value || [])
                                    .map((id) => dropdownData.condiciones_vulnerabilidad.find((cv) => cv.id === id))
                                    .filter(Boolean)}
                                  onChange={(_, newValues) => {
                                    field.onChange(newValues.map((item) => item.id))
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Condiciones de Vulnerabilidad"
                                      error={!!error}
                                      helperText={error?.message}
                                      size="small"
                                      placeholder="Seleccione las condiciones aplicables"
                                    />
                                  )}
                                  renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                      <Chip
                                        key={option.id}
                                        label={`${option.nombre} (Peso: ${option.peso})`}
                                        {...getTagProps({ index })}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    ))
                                  }
                                  PopperProps={{
                                    style: { width: "auto", maxWidth: "300px" },
                                  }}
                                  size="small"
                                />
                                {/* Display total count of selected conditions */}
                                <Box
                                  sx={{
                                    mt: 1,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    Total seleccionado: {(field.value || []).length}
                                  </Typography>
                                  {(field.value || []).length > 0 && (
                                    <Chip
                                      label={`Peso total: ${(field.value || [])
                                        .map((id) => dropdownData.condiciones_vulnerabilidad.find((cv) => cv.id === id))
                                        .filter(Boolean)
                                        .reduce((sum, condition) => sum + condition.peso, 0)}`}
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
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
                            name={`adultosConvivientes.${index}.observaciones`}
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
                  </CardContent>
                </Collapse>
              </Card>
            )
          })
        )}

        {!readOnly && fields.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addAdultoConviviente}
              size="large"
              sx={{ borderRadius: "20px", px: 3 }}
            >
              Añadir Adulto
            </Button>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <DeleteIcon color="error" sx={{ mr: 1 }} /> Confirmar eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar este adulto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" size="medium">
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            autoFocus
            size="medium"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use the modular VinculacionNotification component */}
      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
      />
    </LocalizationProvider>
  )
}

export default Step2Form
