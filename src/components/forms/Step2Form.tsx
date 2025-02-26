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
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
    vinculo_con_nnya_principal: string
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
      vinculo_con_nnya_principal: "",
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
                          renderInput={(params: any) => <TextField {...params} fullWidth />}
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
                          <InputLabel>Nacionalidad</InputLabel>
                          <Select {...field} label="Nacionalidad" disabled={readOnly}>
                            {dropdownData.nacionalidad_choices?.map((option: any) => (
                              <MenuItem key={option.key} value={option.key}>
                                {option.value}
                              </MenuItem>
                            ))}
                          </Select>
                          {error && <FormHelperText>{error.message}</FormHelperText>}
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
                          helperText={error?.message}
                          InputProps={{ readOnly }}
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
                            <InputLabel>Situación DNI</InputLabel>
                            <Select {...field} label="Situación DNI" disabled={readOnly}>
                              {dropdownData.situacion_dni_choices.map((option) => (
                                <MenuItem key={option.key} value={option.key}>
                                  {option.value}
                                </MenuItem>
                              ))}
                            </Select>
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
                          <InputLabel>Género</InputLabel>
                          <Select {...field} label="Género" disabled={readOnly}>
                            {dropdownData.genero_choices.map((option) => (
                              <MenuItem key={option.key} value={option.key}>
                                {option.value}
                              </MenuItem>
                            ))}
                          </Select>
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
                          <InputLabel>Vinculación</InputLabel>
                          <Select {...field} label="Vinculación" disabled={readOnly}>
                            {dropdownData.vinculo_demanda_choices.map((option) => (
                              <MenuItem key={option.key} value={option.key}>
                                {option.value}
                              </MenuItem>
                            ))}
                          </Select>
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
                          <InputLabel>Vínculo con NNYA Principal</InputLabel>
                          <Select {...field} label="Vínculo con NNYA Principal" disabled={readOnly}>
                            {dropdownData.vinculo_con_nnya_principal_choices.map((option) => (
                              <MenuItem key={option.id} value={option.nombre}>
                                {option.nombre}
                              </MenuItem>
                            ))}
                          </Select>
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
                            <Switch checked={value} onChange={(e) => onChange(e.target.checked)} disabled={readOnly} />
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
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Condiciones de Vulnerabilidad</InputLabel>
                          <Select {...field} multiple label="Condiciones de Vulnerabilidad" disabled={readOnly}>
                            {dropdownData.condiciones_vulnerabilidad
                              .filter((cv) => cv.adulto && !cv.nnya)
                              .map((cv) => (
                                <MenuItem key={cv.id} value={cv.id}>
                                  {`${cv.nombre} - ${cv.descripcion}`}
                                </MenuItem>
                              ))}
                          </Select>
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
          <Button startIcon={<AddIcon />} onClick={addAdultoConviviente} sx={{ mt: 2 }}>
            Añadir otro adulto
          </Button>
        )}
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar este adulto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default Step2Form

