"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useFieldArray, useFormContext, Controller, useWatch } from "react-hook-form"
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
  Chip,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
} from "@mui/material"
import { type Theme, useTheme } from "@mui/material/styles"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandMore"
import type { DropdownData, FormData } from "./types/formTypes"
import { format, parse } from "date-fns"
import LocalizacionFields from "./LocalizacionFields"
import VulneracionesFieldArray from "./VulneracionesFieldsArray"
import EnfermedadesFieldArray from "./EnfermedadesFieldsArray"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import { useParams } from "next/navigation"

interface Step3FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
  adultosConvivientes: FormData["adultosConvivientes"]
  id?: string
}

// Helper function to add a red asterisk to labels
const RequiredLabel = ({ label }: { label: string }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

const Step3Form: React.FC<Step3FormProps> = ({ dropdownData, readOnly = false, adultosConvivientes, id }) => {
  const theme = useTheme()
  const { control, getValues, setValue } = useFormContext<FormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ninosAdolescentes",
  })

  // Importante: Usar useWatch en lugar de watch para detectar cambios en tiempo real
  const watchedFields = useWatch({
    control,
    name: "ninosAdolescentes",
  })

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
    name: fields.map((field, index) => `ninosAdolescentes.${index}.nombre`),
  })

  const watchedApellidos = useWatch({
    control,
    name: fields.map((field, index) => `ninosAdolescentes.${index}.apellido`),
  })

  const watchedDnis = useWatch({
    control,
    name: fields.map((field, index) => `ninosAdolescentes.${index}.dni`),
  })

  const watchedUseDefaultLocalizacion = useWatch({
    control,
    name: fields.map((field, index) => `ninosAdolescentes.${index}.useDefaultLocalizacion`),
  })

  // Effect para manejar cambios SOLO en los campos relevantes para la búsqueda
  useEffect(() => {
    if (!fields.length) return

    // Procesar cada niño/adolescente
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

  const [selectedSituacionSalud, setSelectedSituacionSalud] = useState<number[]>([])
  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addNinoAdolescente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      fechaDefuncion: null,
      edadAproximada: "",
      dni: "",
      situacionDni: "",
      genero: "",
      observaciones: "",
      useDefaultLocalizacion: true,
      localizacion: {
        calle: "",
        tipo_calle: "",
        piso_depto: "",
        lote: "",
        mza: "",
        casa_nro: "",
        referencia_geo: "",
        geolocalizacion: "",
        barrio: null,
        localidad: null,
        cpc: null,
      },
      educacion: {
        institucion_educativa: "",
        nivel_alcanzado: "",
        esta_escolarizado: false,
        ultimo_cursado: "",
        tipo_escuela: "",
        comentarios_educativos: "",
        curso: "",
        nivel: "",
        turno: "",
        comentarios: "",
      },
      cobertura_medica: {
        obra_social: "",
        intervencion: "",
        auh: false,
        observaciones: "",
        institucion_sanitaria: null,
        medico_cabecera: null,
      },
      persona_enfermedades: [],
      demanda_persona: {
        conviviente: true,
        vinculo_demanda: "",
        vinculo_con_nnya_principal: "",
      },
      condicionesVulnerabilidad: [],
      vulneraciones: [],
    })
    setExpandedSections([...expandedSections, true])
  }

  const toggleSection = (index: number) => {
    const newExpandedSections = [...expandedSections]
    newExpandedSections[index] = !newExpandedSections[index]
    setExpandedSections(newExpandedSections)
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
      const newExpandedSections = [...expandedSections]
      newExpandedSections.splice(deleteIndex, 1)
      setExpandedSections(newExpandedSections)
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

  function getStyles(name: string, selectedItems: readonly string[], theme: Theme) {
    return {
      fontWeight:
        selectedItems.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    }
  }

  const params = useParams()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Niñas, niños y adolescentes convivientes
        </Typography>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">
                {index === 0 ? "Niño, Niña o Adolescente Principal" : `Niño, Niña o Adolescente ${index + 1}`}
              </Typography>
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
            </Box>
            <Collapse in={expandedSections[index]}>
              <Grid container spacing={2}>
                {/* Sección de Información Personal */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    Información Personal
                  </Typography>
                </Grid>

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
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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

                {/* Resto del formulario... */}
                {/* Sección de Fechas */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Fechas
                  </Typography>
                </Grid>

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
                      />
                    )}
                  />
                </Grid>

                {/* Sección de Localización */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Localización
                  </Typography>
                </Grid>

                <Grid item xs={12}>
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
                </Grid>

                {!watchedFields?.[index]?.useDefaultLocalizacion && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Localización específica
                    </Typography>
                    <LocalizacionFields
                      control={control}
                      prefix={`ninosAdolescentes.${index}.localizacion`}
                      dropdownData={dropdownData}
                      readOnly={readOnly}
                    />
                  </Grid>
                )}

                {/* Sección de Información de la Demanda */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Información de la Demanda
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={`ninosAdolescentes.${index}.demanda_persona.conviviente`}
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
                    label="Conviviente"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`ninosAdolescentes.${index}.demanda_persona.vinculo_demanda`}
                    rules={{ required: "Este campo es obligatorio" }}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
                        <Autocomplete
                          disabled={readOnly}
                          options={dropdownData.vinculo_con_nnya_principal_choices || []}
                          getOptionLabel={(option) => option.nombre || ""}
                          value={
                            dropdownData.vinculo_con_nnya_principal_choices?.find((item) => item.id === field.value) ||
                            null
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

                {/* Sección de Educación */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Información Educativa
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`ninosAdolescentes.${index}.educacion.institucion_educativa.nombre`}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`ninosAdolescentes.${index}.educacion.ultimo_cursado`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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
                        rows={2}
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{ readOnly }}
                        size="small"
                      />
                    )}
                  />
                </Grid>

                {/* Sección de Salud */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Información de Salud
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.institucion_sanitaria`}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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
                      <FormControl fullWidth error={!!error}>
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
                    label="AUH"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
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
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`ninosAdolescentes.${index}.cobertura_medica.observaciones`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Observaciones"
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

                {/* Sección de Enfermedades */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Enfermedades
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <EnfermedadesFieldArray
                    nestIndex={index}
                    control={control}
                    readOnly={readOnly}
                    dropdownData={dropdownData}
                    watchedValues={watchedFields} // Pass watchedFields instead of useWatch
                    setValue={setValue}
                  />
                </Grid>

                {/* Sección de Vulnerabilidad */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Condiciones de Vulnerabilidad
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`ninosAdolescentes.${index}.condicionesVulnerabilidad.condicion_vulnerabilidad`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <Autocomplete
                          disabled={readOnly}
                          multiple
                          options={dropdownData.condiciones_vulnerabilidad?.filter((cv) => cv.nnya && !cv.adulto) || []}
                          getOptionLabel={(option) => (option.nombre ? `${option.nombre} (Peso: ${option.peso})` : "")}
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
                            />
                          )}
                          renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                              <Chip
                                key={option.id}
                                label={`${option.nombre} (Peso: ${option.peso})`}
                                {...getTagProps({ index })}
                                size="small"
                              />
                            ))
                          }
                          PopperProps={{
                            style: { width: "auto", maxWidth: "300px" },
                          }}
                          size="small"
                        />
                        {/* Display total count of selected conditions */}
                        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary">
                            Total seleccionado: {(field.value || []).length}
                          </Typography>
                          {(field.value || []).length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Peso total:{" "}
                              {(field.value || [])
                                .map((id) => dropdownData.condiciones_vulnerabilidad.find((cv) => cv.id === id))
                                .filter(Boolean)
                                .reduce((sum, condition) => sum + condition.peso, 0)}
                            </Typography>
                          )}
                        </Box>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Sección de Vulneraciones */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Presunta Vulneración de Derechos informada
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <VulneracionesFieldArray
                    nestIndex={index}
                    control={control}
                    readOnly={readOnly}
                    dropdownData={dropdownData}
                    watchedValues={watchedFields} // Pass watchedFields instead of useWatch
                    setValue={setValue}
                  />
                </Grid>

                {/* Sección de Observaciones */}
                <Grid item xs={12}>
                  <Typography color="primary" variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Observaciones
                  </Typography>
                </Grid>

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
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        ))}
        {!readOnly && (
          <Button startIcon={<AddIcon />} onClick={addNinoAdolescente} sx={{ mt: 2 }} size="small">
            Añadir otro niño o adolescente
          </Button>
        )}
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar este niño, niña o adolescente? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary" size="small">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus size="small">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
      />
    </LocalizationProvider>
  )
}

export default Step3Form
