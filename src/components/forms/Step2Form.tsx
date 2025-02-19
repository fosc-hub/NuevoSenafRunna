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
  Chip,
  OutlinedInput,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import AddIcon from "@mui/icons-material/Add"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData } from "./types/formTypes"
import { format, parse } from "date-fns"
import { useTheme, type Theme } from "@mui/material/styles"

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
    vinculacion: {
      vinculo: string
    }
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
}

const Step2Form: React.FC<Step2FormProps> = ({ control, dropdownData, readOnly = false }) => {
  const theme = useTheme()
  const { fields, append } = useFieldArray({
    control,
    name: "adultosConvivientes",
  })
  const watchedFields = useWatch({ control, name: "adultosConvivientes" })

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
      vinculacion: { vinculo: "" },
      condicionesVulnerabilidad: [],
      nacionalidad: "",
    })
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
              <Typography variant="subtitle1" gutterBottom>
                Adulto {index + 1}
              </Typography>
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

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={`adultosConvivientes.${index}.conviviente`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)} disabled={readOnly} />
                        )}
                      />
                    }
                    label="Conviviente"
                  />

                  <FormControlLabel
                    control={
                      <Controller
                        name={`adultosConvivientes.${index}.garantiza_proteccion`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)} disabled={readOnly} />
                        )}
                      />
                    }
                    label="Garantiza Protección"
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
                {/*  
                <Grid item xs={12}> 
                  <Typography variant="subtitle2" gutterBottom>
                    Vinculación con NNyA Principal
                  </Typography> 
                  <Controller
                    name={`adultosConvivientes.${index}.vinculacion.vinculo`}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <InputLabel>Vínculo con NNyA Principal</InputLabel>
                        <Select {...field} label="Vínculo con NNyA Principal" disabled={readOnly}>
                          {dropdownData.vinculos.map((vinculo) => (
                            <MenuItem key={vinculo.id} value={vinculo.id}>
                              {vinculo.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Condiciones de Vulnerabilidad
                  </Typography>
                  <Controller
                    name={`adultosConvivientes.${index}.condicionesVulnerabilidad`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id={`condiciones-vulnerabilidad-label-${index}`}>
                          Condiciones de Vulnerabilidad
                        </InputLabel>
                        <Select
                          {...field}
                          labelId={`condiciones-vulnerabilidad-label-${index}`}
                          id={`condiciones-vulnerabilidad-${index}`}
                          multiple
                          value={field.value || []}
                          onChange={field.onChange}
                          input={
                            <OutlinedInput
                              id={`condiciones-vulnerabilidad-chip-${index}`}
                              label="Condiciones de Vulnerabilidad"
                            />
                          }
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={
                                    dropdownData.condiciones_vulnerabilidad.find((cv) => cv.id === value)?.nombre ||
                                    value
                                  }
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={MenuProps}
                          disabled={readOnly}
                        >
                          {dropdownData.condiciones_vulnerabilidad
                            .filter((cv) => cv.adulto && !cv.nnya)
                            .map((cv) => (
                              <MenuItem
                                key={cv.id}
                                value={cv.id}
                                style={getStyles(cv.nombre, field.value || [], theme)}
                              >
                                {cv.nombre}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )
        })}
        {!readOnly && (
          <Button startIcon={<AddIcon />} onClick={addAdultoConviviente} sx={{ mt: 2 }}>
            Añadir otro adulto
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default Step2Form

