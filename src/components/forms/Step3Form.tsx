"use client"

import { useState } from "react"
import type React from "react"
import { useFieldArray, useFormContext, Controller } from "react-hook-form"
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
import LocalizacionFields from "./LocalizacionFields" // Import the LocalizacionFields component
import VulneracionesFieldArray from "./VulneracionesFieldsArray"
import EnfermedadesFieldArray from "./EnfermedadesFieldsArray"

interface Step3FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
  adultosConvivientes: FormData["adultosConvivientes"]
}

const Step3Form: React.FC<Step3FormProps> = ({ dropdownData, readOnly = false, adultosConvivientes }) => {
  const theme = useTheme()
  const { control, watch, getValues, setValue } = useFormContext<FormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ninosAdolescentes",
  })

  const watchedFields = watch("ninosAdolescentes")

  const [selectedSituacionSalud, setSelectedSituacionSalud] = useState<number[]>([])
  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addNinoAdolescente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
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

  // ... rest of the component logic remains the same

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
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`ninosAdolescentes.${index}.nombre`}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Nombre"
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
                        label="Apellido"
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
                    name={`ninosAdolescentes.${index}.fechaNacimiento`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de Nacimiento"
                        value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                        onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                        disabled={readOnly}
                        renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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
                              label="Situación DNI"
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
                              label="Género"
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
                              label="Nacionalidad"
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
                {/*
                {index !== 0 && (
                  <Grid item xs={12}>
                    <Controller
                      name={`ninosAdolescentes.${index}.vinculacion.vinculo`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error}>
                          <InputLabel>Vínculo con NNYA principal</InputLabel>
                          <Select {...field} label="Vínculo con NNYA principal" disabled={readOnly}>
                            {dropdownData.vinculo_con_nnya_principal_choices?.map((vinculo) => (
                              <MenuItem key={vinculo.id} value={vinculo.id}>
                                {vinculo.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
                */}
                {/* Location Information */}
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

                {/* Education Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información Educativa
                  </Typography>
                  <Grid container spacing={2}>
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
                                  : dropdownData.institucion_educativa?.find((item) => item.nombre === field.value) ||
                                    null
                              }
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.nombre : null)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Institución Educativa"
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
                              label="Nueva Institución Educativa"
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
                              value={
                                dropdownData.nivel_alcanzado_choices?.find((item) => item.key === field.value) || null
                              }
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nivel Alcanzado"
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
                        rules={{ required: "Este campo es obligatorio" }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControl fullWidth error={!!error}>
                            <Autocomplete
                              disabled={readOnly}
                              options={dropdownData.ultimo_cursado_choices || []}
                              getOptionLabel={(option) => option.value || ""}
                              value={
                                dropdownData.ultimo_cursado_choices?.find((item) => item.key === field.value) || null
                              }
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
                              value={
                                dropdownData.tipo_escuela_choices?.find((item) => item.key === field.value) || null
                              }
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Tipo de Escuela"
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
                  </Grid>
                </Grid>
                {/* Vulnerability Conditions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Condiciones de Vulnerabilidad
                  </Typography>
                  <Controller
                    name={`ninosAdolescentes.${index}.condicionesVulnerabilidad.condicion_vulnerabilidad`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <Autocomplete
                          disabled={readOnly}
                          multiple
                          options={dropdownData.condiciones_vulnerabilidad.filter((cv) => cv.nnya && !cv.adulto) || []}
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
                {/* Health Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información de Salud
                  </Typography>
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
                              label="Institución Sanitaria"
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

                {/* Medical Coverage */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cobertura Médica
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name={`ninosAdolescentes.${index}.cobertura_medica.obra_social`}
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
                                  label="Obra Social"
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
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormControl fullWidth error={!!error}>
                            <Autocomplete
                              disabled={readOnly}
                              options={dropdownData.intervencion_choices || []}
                              getOptionLabel={(option) => option.value || ""}
                              value={
                                dropdownData.intervencion_choices?.find((item) => item.key === field.value) || null
                              }
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Intervención"
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
                      <Typography variant="subtitle2" gutterBottom>
                        Médico Cabecera
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`ninosAdolescentes.${index}.cobertura_medica.medico_cabecera.nombre`}
                            control={control}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="Nombre del Médico"
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
                  </Grid>
                </Grid>

     <Grid item xs={12}>
      <Typography variant="subtitle2" gutterBottom>
        Enfermedades
      </Typography>
      <EnfermedadesFieldArray
        nestIndex={index}
        control={control}
        readOnly={readOnly}
        dropdownData={dropdownData}
        watch={watch}
        setValue={setValue}
      />
    </Grid>

                {/* Demand Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información de la Demanda
                  </Typography>
                  <Grid container spacing={2}>
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
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormControl fullWidth error={!!error}>
                            <Autocomplete
                              disabled={readOnly}
                              options={dropdownData.vinculo_demanda_choices || []}
                              getOptionLabel={(option) => option.value || ""}
                              value={
                                dropdownData.vinculo_demanda_choices?.find((item) => item.key === field.value) || null
                              }
                              onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Vínculo con la Demanda"
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
                </Grid>

                {/* Rights Violations */}
{/* Sección Vulneraciones */}
<Grid item xs={12}>
      <Typography variant="subtitle2" gutterBottom>
        Presunta Vulneración de Derechos informada
      </Typography>
      <VulneracionesFieldArray
        nestIndex={index}
        control={control}
        readOnly={readOnly}
        dropdownData={dropdownData}
        watch={watch}
        setValue={setValue}
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
    </LocalizationProvider>
  )
}

export default Step3Form

