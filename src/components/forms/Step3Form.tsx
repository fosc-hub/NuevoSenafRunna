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
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import AddIcon from "@mui/icons-material/Add"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "../types/formTypes"

interface Step3FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
  adultosConvivientes: { id: string; nombre: string; apellido: string }[]
}

const Step3Form: React.FC<Step3FormProps> = ({ dropdownData, readOnly = false, adultosConvivientes }) => {
  const { control, watch } = useFormContext<FormData>()
  const { fields, append } = useFieldArray({
    control,
    name: "ninosAdolescentes",
  })

  const watchedFields = watch("ninosAdolescentes")

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
      educacion: {
        institucion_educativa: "",
        curso: "",
        nivel: "",
        turno: "",
      },
      salud: {
        institucion_sanitaria: "",
      },
      vulneraciones: [{}],
      condicionesVulnerabilidad: { condicion_vulnerabilidad: [] },
    })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Niñas, niños y adolescentes convivientes
        </Typography>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
            <Typography variant="subtitle1" gutterBottom>
              {index === 0 ? "Niño, Niña o Adolescente Principal" : `Niño, Niña o Adolescente ${index + 1}`}
            </Typography>
            <Grid container spacing={2}>
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
                      {...field}
                      label="Fecha de Nacimiento"
                      disabled={readOnly}
                      renderInput={(params) => <TextField {...params} fullWidth />}
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
                      helperText={error?.message}
                      InputProps={{ readOnly }}
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
              <Grid item xs={12} md={6}>
                <Controller
                  name={`ninosAdolescentes.${index}.genero`}
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
                    />
                  )}
                />
              </Grid>
              {index !== 0 && (
                <Grid item xs={12}>
                  <Controller
                    name={`ninosAdolescentes.${index}.vinculacion.vinculo`}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <InputLabel>Vínculo con NNYA principal</InputLabel>
                        <Select {...field} label="Vínculo con NNYA principal" disabled={readOnly}>
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
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name={`ninosAdolescentes.${index}.useDefaultLocalizacion`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Switch checked={value} onChange={(e) => onChange(e.target.checked)} disabled={readOnly} />
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
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Información Educativa
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.educacion.institucion_educativa`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Institución Educativa</InputLabel>
                      <Select {...field} label="Institución Educativa" disabled={readOnly}>
                        {dropdownData.instituciones_educativas.map((institucion) => (
                          <MenuItem key={institucion.id} value={institucion.id}>
                            {institucion.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name={`ninosAdolescentes.${index}.educacion.curso`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Curso"
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
                  name={`ninosAdolescentes.${index}.educacion.nivel`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Nivel</InputLabel>
                      <Select {...field} label="Nivel" disabled={readOnly}>
                        {[
                          { id: "PRIMARIO", label: "Primario" },
                          { id: "SECUNDARIO", label: "Secundario" },
                          { id: "TERCIARIO", label: "Terciario" },
                          { id: "UNIVERSITARIO", label: "Universitario" },
                          { id: "OTRO", label: "Otro" },
                        ].map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name={`ninosAdolescentes.${index}.educacion.turno`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Turno</InputLabel>
                      <Select {...field} label="Turno" disabled={readOnly}>
                        {[
                          { id: "MANIANA", label: "Mañana" },
                          { id: "TARDE", label: "Tarde" },
                          { id: "NOCHE", label: "Noche" },
                          { id: "OTRO", label: "Otro" },
                        ].map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name={`ninosAdolescentes.${index}.educacion.comentarios`}
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Información de Salud
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.salud.institucion_sanitaria`}
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Institución Sanitaria</InputLabel>
                      <Select {...field} label="Institución Sanitaria" disabled={readOnly}>
                        {dropdownData.instituciones_sanitarias.map((institucion) => (
                          <MenuItem key={institucion.id} value={institucion.id}>
                            {institucion.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name={`ninosAdolescentes.${index}.salud.observaciones`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Observaciones de Salud"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ readOnly }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones de Vulnerabilidad
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.condicionesVulnerabilidad.condicion_vulnerabilidad`}
                  control={control}
                  rules={{ required: "Seleccione al menos una condición de vulnerabilidad" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Condiciones de Vulnerabilidad</InputLabel>
                      <Select {...field} multiple label="Condiciones de Vulnerabilidad" disabled={readOnly}>
                        {dropdownData.condiciones_vulnerabilidad
                          .filter((cv) => !cv.adulto)
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
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Presunta Vulneración de Derechos informada
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.vulneraciones`}
                  control={control}
                  render={({ field }) => (
                    <>
                      {field.value.map((vulneracion, vulIndex) => (
                        <Box key={vulIndex} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Vulneración {vulIndex + 1}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.categoria_motivo`}
                                control={control}
                                rules={{ required: "Este campo es obligatorio" }}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Categoría de Motivos</InputLabel>
                                    <Select {...field} label="Categoría de Motivos" disabled={readOnly}>
                                      {dropdownData.categoria_motivos?.map((motivo) => (
                                        <MenuItem key={motivo.id} value={motivo.id}>
                                          {motivo.nombre}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.categoria_submotivo`}
                                control={control}
                                rules={{ required: "Este campo es obligatorio" }}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Subcategoría</InputLabel>
                                    <Select {...field} label="Subcategoría" disabled={readOnly}>
                                      {dropdownData.categoria_submotivos
                                        ?.filter(
                                          (submotivo) =>
                                            submotivo.motivo ===
                                            watch(
                                              `ninosAdolescentes.${index}.vulneraciones.${vulIndex}.categoria_motivo`,
                                            ),
                                        )
                                        .map((submotivo) => (
                                          <MenuItem key={submotivo.id} value={submotivo.id}>
                                            {submotivo.nombre}
                                          </MenuItem>
                                        ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.gravedad_vulneracion`}
                                control={control}
                                rules={{ required: "Este campo es obligatorio" }}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Gravedad de la Vulneración</InputLabel>
                                    <Select {...field} label="Gravedad de la Vulneración" disabled={readOnly}>
                                      {dropdownData.gravedades_vulneracion?.map((gravedad) => (
                                        <MenuItem key={gravedad.id} value={gravedad.id}>
                                          {gravedad.nombre}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.urgencia_vulneracion`}
                                control={control}
                                rules={{ required: "Este campo es obligatorio" }}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Urgencia de la Vulneración</InputLabel>
                                    <Select {...field} label="Urgencia de la Vulneración" disabled={readOnly}>
                                      {dropdownData.urgencias_vulneracion?.map((urgencia) => (
                                        <MenuItem key={urgencia.id} value={urgencia.id}>
                                          {urgencia.nombre}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Controller
                                name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.autor_dv`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Autor DV</InputLabel>
                                    <Select {...field} label="Autor DV" disabled={readOnly}>
                                      {adultosConvivientes?.map((adulto) => (
                                        <MenuItem key={adulto.id} value={adulto.id}>
                                          {`${adulto.nombre} ${adulto.apellido}`}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControlLabel
                                control={
                                  <Controller
                                    name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.principal_demanda`}
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
                                label="Principal Demanda"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControlLabel
                                control={
                                  <Controller
                                    name={`ninosAdolescentes.${index}.vulneraciones.${vulIndex}.transcurre_actualidad`}
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
                                label="Transcurre Actualidad"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      {!readOnly && (
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => field.onChange([...field.value, {}])}
                          sx={{ mt: 1, color: "primary.main" }}
                        >
                          Añadir otra vulneración
                        </Button>
                      )}
                    </>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        ))}
        {!readOnly && (
          <Button startIcon={<AddIcon />} onClick={addNinoAdolescente} sx={{ mt: 2 }}>
            Añadir otro niño o adolescente
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default Step3Form

