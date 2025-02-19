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
  Autocomplete,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import AddIcon from "@mui/icons-material/Add"
import type { DropdownData, FormData, GravedadVulneracion } from "./types/formTypes"
import { format, parse } from "date-fns"

interface Step3FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
  adultosConvivientes: FormData["adultosConvivientes"]
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
      condiciones_vulnerabilidad: [],
      vulneraciones: [],
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
                      label="Fecha de Nacimiento"
                      value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                      onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
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
                        {dropdownData.situacion_dni_choices?.map((option) => (
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
                        {dropdownData.genero_choices?.map((option) => (
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
                  name={`ninosAdolescentes.${index}.nacionalidad`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Nacionalidad</InputLabel>
                      <Select {...field} label="Nacionalidad" disabled={readOnly}>
                        {dropdownData.nacionalidad_choices?.map((option) => (
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
                          {dropdownData.vinculos?.map((vinculo) => (
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
              {/* Location Information */}
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.calle`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Calle"
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
                        name={`ninosAdolescentes.${index}.localizacion.tipo_calle`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormControl fullWidth error={!!error}>
                            <InputLabel>Tipo de Calle</InputLabel>
                            <Select {...field} label="Tipo de Calle" disabled={readOnly}>
                              <MenuItem value="CALLE">Calle</MenuItem>
                              <MenuItem value="AVENIDA">Avenida</MenuItem>
                              <MenuItem value="PASAJE">Pasaje</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.piso_depto`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Piso/Depto"
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
                        name={`ninosAdolescentes.${index}.localizacion.lote`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Lote"
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
                        name={`ninosAdolescentes.${index}.localizacion.mza`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Manzana"
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
                        name={`ninosAdolescentes.${index}.localizacion.casa_nro`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Número de Casa"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                            InputProps={{ readOnly }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.referencia_geo`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Referencia Geográfica"
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
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.geolocalizacion`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Geolocalización"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                            InputProps={{ readOnly }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.barrio`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            {...field}
                            options={dropdownData.barrios || []}
                            getOptionLabel={(option) => option.nombre}
                            renderInput={(params) => <TextField {...params} label="Barrio" error={!!error} />}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            disabled={readOnly}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.localidad`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            {...field}
                            options={dropdownData.localidades || []}
                            getOptionLabel={(option) => option.nombre}
                            renderInput={(params) => <TextField {...params} label="Localidad" error={!!error} />}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            disabled={readOnly}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Controller
                        name={`ninosAdolescentes.${index}.localizacion.cpc`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            {...field}
                            options={dropdownData.cpcs || []}
                            getOptionLabel={(option) => option.nombre}
                            renderInput={(params) => <TextField {...params} label="CPC" error={!!error} />}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            disabled={readOnly}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
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
                          <InputLabel>Institución Educativa</InputLabel>
                          <Select {...field} label="Institución Educativa" disabled={readOnly}>
                            {dropdownData.institucion_educativa?.map((institucion: any) => (
                              <MenuItem key={institucion.id} value={institucion.nombre}>
                                {institucion.nombre}
                              </MenuItem>
                            ))}
                            <MenuItem value="other">Otra</MenuItem>
                          </Select>
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
                          <InputLabel>Nivel Alcanzado</InputLabel>
                          <Select {...field} label="Nivel Alcanzado" disabled={readOnly}>
                            {dropdownData.nivel_alcanzado_choices?.map((option) => (
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
                          <InputLabel>Último Cursado</InputLabel>
                          <Select {...field} label="Último Cursado" disabled={readOnly}>
                            {dropdownData.ultimo_cursado_choices?.map((option) => (
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
                      name={`ninosAdolescentes.${index}.educacion.tipo_escuela`}
                      control={control}
                      rules={{ required: "Este campo es obligatorio" }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error}>
                          <InputLabel>Tipo de Escuela</InputLabel>
                          <Select {...field} label="Tipo de Escuela" disabled={readOnly}>
                            {dropdownData.tipo_escuela_choices?.map((option) => (
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
                  rules={{ required: "Seleccione al menos una condición de vulnerabilidad" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Condiciones de Vulnerabilidad</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Condiciones de Vulnerabilidad"
                        disabled={readOnly}
                        value={Array.isArray(field.value) ? field.value : []} // Ensure value is always an array
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(typeof value === "string" ? value.split(",") : value);
                        }}
                      >
                        {dropdownData.condiciones_vulnerabilidad
                          .filter((cv) => cv.nnya && !cv.adulto)
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
              {/* Health Information */}
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
                        {dropdownData.institucion_sanitaria?.map((institucion: any) => (
                          <MenuItem key={institucion.id} value={institucion.id}>
                            {institucion.nombre}
                          </MenuItem>
                        ))}
                      </Select>
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
                          <InputLabel>Obra Social</InputLabel>
                          <Select {...field} label="Obra Social" disabled={readOnly}>
                            {dropdownData.obra_social_choices?.map((enf: any) => (
                              <MenuItem key={enf.key} value={enf.key}>
                                {enf.value} {/* Use `value` instead of `nombre` */}
                              </MenuItem>
                            ))}
                          </Select>

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
                          <InputLabel>Intervención</InputLabel>
                          <Select {...field} label="Obra Social" disabled={readOnly}>
                            {dropdownData.intervencion_choices?.map((enf: any) => (
                              <MenuItem key={enf.key} value={enf.key}>
                                {enf.value} {/* Use `value` instead of `nombre` */}
                              </MenuItem>
                            ))}
                          </Select>

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
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                InputProps={{ readOnly }}
                                type="tel"
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
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Diseases */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Enfermedades
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.persona_enfermedades`}
                  control={control}
                  render={({ field }) => (
                    <>
                      {field.value.map((enfermedad: any, enfIndex: number) => (
                        <Box key={enfIndex} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.enfermedad.id`}
                                control={control}
                                render={({ field: enfermedadField, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Enfermedad</InputLabel>
                                    <Select {...enfermedadField} label="Enfermedad" disabled={readOnly}>
                                      {dropdownData.enfermedad?.map((enf) => (
                                        <MenuItem key={enf.id} value={enf.id}>
                                          {enf.nombre}
                                        </MenuItem>
                                      ))}
                                      <MenuItem value="other">Otra</MenuItem>
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            {watch(`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.enfermedad.id`) ===
                              "other" && (
                                <Grid item xs={12} md={6}>
                                  <Controller
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.enfermedad.nombre`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        label="Nombre de la Enfermedad"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly }}
                                      />
                                    )}
                                  />
                                </Grid>
                              )}
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.situacion_salud`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Situación de Salud</InputLabel>
                                    <Select {...field} label="Situación de Salud" disabled={readOnly}>
                                      {dropdownData.situacion_salud?.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                          {cat.nombre}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.situacion_salud`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Situación de Salud</InputLabel>
                                    <Select {...field} label="Situación de Salud" disabled={readOnly}>
                                      {dropdownData.situacion_salud?.map((sit) => (
                                        <MenuItem key={sit.id} value={sit.id}>
                                          {sit.nombre}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente.id`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Institución Sanitaria Interviniente</InputLabel>
                                    <Select {...field} label="Institución Sanitaria Interviniente" disabled={readOnly}>
                                      {dropdownData.institucion_sanitaria?.map((inst) => (
                                        <MenuItem key={inst.id} value={inst.id}>
                                          {inst.nombre}
                                        </MenuItem>
                                      ))}
                                      <MenuItem value="other">Otra</MenuItem>
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            {watch(
                              `ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente.id`,
                            ) === "other" && (
                                <Grid item xs={12} md={6}>
                                  <Controller
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente.nombre`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        label="Nombre de la Institución Sanitaria"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly }}
                                      />
                                    )}
                                  />
                                </Grid>
                              )}
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.certificacion`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Certificación</InputLabel>
                                    <Select {...field} label="Obra Social" disabled={readOnly}>
                                      {dropdownData.certificacion_choices?.map((enf: any) => (
                                        <MenuItem key={enf.key} value={enf.key}>
                                          {enf.value} {/* Use `value` instead of `nombre` */}
                                        </MenuItem>
                                      ))}
                                    </Select>

                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.beneficios_gestionados`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <InputLabel>Beneficios Gestionados</InputLabel>
                                    <Select {...field} label="Obra Social" disabled={readOnly}>
                                      {dropdownData.beneficios_choices?.map((enf: any) => (
                                        <MenuItem key={enf.key} value={enf.key}>
                                          {enf.value} {/* Use `value` instead of `nombre` */}
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
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.recibe_tratamiento`}
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
                                label="Recibe Tratamiento"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Controller
                                name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.informacion_tratamiento`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <TextField
                                    {...field}
                                    label="Información del Tratamiento"
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
                                Médico de Tratamiento
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Controller
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.medico_tratamiento.nombre`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        label="Nombre del Médico"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Controller
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.medico_tratamiento.mail`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        label="Email del Médico"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly }}
                                        type="email"
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Controller
                                    name={`ninosAdolescentes.${index}.persona_enfermedades.${enfIndex}.medico_tratamiento.telefono`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        label="Teléfono del Médico"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly }}
                                        type="tel"
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>
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
                          Añadir otra enfermedad
                        </Button>
                      )}
                    </>
                  )}
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
                          <InputLabel>Vínculo con la Demanda</InputLabel>
                          <Select {...field} label="Obra Social" disabled={readOnly}>
                            {dropdownData.vinculo_demanda_choices?.map((enf: any) => (
                              <MenuItem key={enf.key} value={enf.key}>
                                {enf.value} {/* Use `value` instead of `nombre` */}
                              </MenuItem>
                            ))}
                          </Select>

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
                          <InputLabel>Vínculo con NNYA Principal</InputLabel>
                          <Select {...field} label="Obra Social" disabled={readOnly}>
                            {dropdownData.
                              vinculo_con_nnya_principal_choices?.map((enf: any) => (
                                <MenuItem key={enf.key} value={enf.key}>
                                  {enf.value} {/* Use `value` instead of `nombre` */}
                                </MenuItem>
                              ))}
                          </Select>

                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Rights Violations */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Presunta Vulneración de Derechos informada
                </Typography>
                <Controller
                  name={`ninosAdolescentes.${index}.vulneraciones`}
                  control={control}
                  render={({ field }) => (
                    <>
                      {field.value.map((vulneracion: any, vulIndex: number) => (
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
                                      {dropdownData.categoria_motivos?.map((motivo: any) => (
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
                                          (submotivo: any) =>
                                            submotivo.motivo ===
                                            watch(
                                              `ninosAdolescentes.${index}.vulneraciones.${vulIndex}.categoria_motivo`,
                                            ),
                                        )
                                        .map((submotivo: any) => (
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
                                      {dropdownData.gravedades_vulneracion?.map((gravedad: GravedadVulneracion) => (
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
                                      {dropdownData.urgencias_vulneracion?.map((urgencia: any) => (
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
                                    <Select {...field} label="Supuesto Autor DV" disabled={readOnly}>
                                      {adultosConvivientes.map((adulto: any, adultIndex: any) => (
                                        <MenuItem key={adultIndex} value={adultIndex}>
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

