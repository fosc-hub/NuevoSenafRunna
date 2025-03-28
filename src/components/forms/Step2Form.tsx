"use client"

import { useState } from "react"
import type React from "react"
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
  FormHelperText,
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
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData } from "./types/formTypes"
import { format, parse } from "date-fns"

interface FormData {
  adultosConvivientes: {
    nombre: string
    apellido: string
    fechaNacimiento: Date | null
    edadAproximada: string
    dni: string
    situacionDni: string
    genero: string
    conviviente: boolean
    supuesto_autordv: string
    garantiza_proteccion: boolean
    observaciones: string
    useDefaultLocalizacion: boolean
    localizacion?: {
      // Add localizacion fields here
    }
    vinculacion: string
    vinculo_con_nnya_principal: number
    vinculo_demanda: string
    condicionesVulnerabilidad: string[]
    nacionalidad: string
    vinculo_demanda: string
  }[]
  street: string
  city: string
  country: string
}

interface Step2FormProps {
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly?: boolean
}

const Step2Form: React.FC<Step2FormProps> = ({ control, dropdownData, readOnly = false }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "adultosConvivientes",
  })
  const watchedFields = useWatch({ control, name: "adultosConvivientes" })
  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addAdultoConviviente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      edadAproximada: "",
      dni: "",
      situacionDni: "",
      genero: "",
      conviviente: false,
      supuesto_autordv: "",
      garantiza_proteccion: false,
      observaciones: "",
      useDefaultLocalizacion: true,
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

  const theme = useTheme()

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Adultos
        </Typography>
        {fields.map((field, index) => {
          const watchedField = watchedFields?.[index] || {}
          return (
            <Box key={field.id} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Adulto {index + 1}</Typography>
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
                  <Grid item xs={12} md={6}>
                    <Controller
                      name={`adultosConvivientes.${index}.nombre`}
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
                      name={`adultosConvivientes.${index}.apellido`}
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
                      name={`adultosConvivientes.${index}.fechaNacimiento`}
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Fecha de Nacimiento"
                          disabled={readOnly}
                          value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                          renderInput={(params: any) => <TextField {...params} fullWidth size="small" />}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name={`adultosConvivientes.${index}.nacionalidad`}
                      control={control}
                      rules={{ required: "Este campo es obligatorio" }}
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
                  <Grid item xs={12} md={6}>
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
                          <FormControl fullWidth error={!!error}>
                            <Autocomplete
                              disabled={readOnly}
                              options={dropdownData.situacion_dni_choices || []}
                              getOptionLabel={(option) => option.value || ""}
                              value={
                                dropdownData.situacion_dni_choices?.find((item) => item.key === field.value) || null
                              }
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
                  ) : null}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name={`adultosConvivientes.${index}.genero`}
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
                      name={`adultosConvivientes.${index}.vinculacion`}
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
                                label="Vinculación"
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
                  <Grid item xs={12} md={6}>
                    <Controller
                      name={`adultosConvivientes.${index}.vinculo_con_nnya_principal`}
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
                          {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                      )}
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
                      label="Conviviente"
                    />
                  </Grid>
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
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                  </Grid>
                  {!watchedField.useDefaultLocalizacion && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Localización específica
                      </Typography>
                      <LocalizacionFields
                        control={control}
                        prefix={`adultosConvivientes.${index}.localizacion`}
                        dropdownData={dropdownData}
                        readOnly={readOnly}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Condiciones de Vulnerabilidad
                    </Typography>
                    <Controller
                      name={`adultosConvivientes.${index}.condicionesVulnerabilidad`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error}>
                          <Autocomplete
                            disabled={readOnly}
                            multiple
                            options={
                              dropdownData.condiciones_vulnerabilidad.filter((cv) => cv.adulto && !cv.nnya) || []
                            }
                            getOptionLabel={(option) => option.nombre || ""}
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
                                <Chip key={option.id} label={option.nombre} {...getTagProps({ index })} size="small" />
                              ))
                            }
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
              </Collapse>
            </Box>
          )
        })}
        {!readOnly && (
          <Button startIcon={<AddIcon />} onClick={addAdultoConviviente} sx={{ mt: 2 }} size="small">
            Añadir otro adulto
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
            ¿Está seguro de que desea eliminar este adulto? Esta acción no se puede deshacer.
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

export default Step2Form

