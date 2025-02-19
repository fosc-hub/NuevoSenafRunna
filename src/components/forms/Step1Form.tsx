import React from "react"
import { useWatch } from "react-hook-form"
import { type Control, Controller, useFieldArray } from "react-hook-form"
import {
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  FormHelperText,
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
import { Add, Remove } from "@mui/icons-material"

interface Step1FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean }> = ({ control, readOnly = false }) => {
  const selectedMotivo = useWatch({ control, name: "presuntaVulneracion.motivos" })

  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
  })

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

  const selectedOrigen = useWatch({ control, name: "origen" })

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
        <Grid item xs={12} md={6}>
          <Controller
            name="fecha_oficio_documento"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                {...field}
                label="Fecha de oficio/documento *"
                disabled={readOnly}
                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                renderInput={(params: any) => (
                  <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="fecha_ingreso_senaf"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                {...field}
                label="Fecha de ingreso SENAF *"
                disabled={readOnly}
                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                renderInput={(params: any) => (
                  <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="origen"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Bloque datos del remitente</InputLabel>
                <Select {...field} label="Datos del remitente" disabled={readOnly}>
                  {dropdownData.bloques_datos_remitente?.map((origen: any) => (
                    <MenuItem key={origen.id} value={origen.id}>
                      {origen.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="sub_origen"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const filteredSubOrigins = dropdownData.tipo_institucion_demanda?.filter(
                (subOrigen: any) => subOrigen.bloque_datos_remitente === selectedOrigen,
              )

              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Tipo de Institución</InputLabel>
                  <Select {...field} label="Tipo de Institución" disabled={readOnly}>
                    {filteredSubOrigins?.map((subOrigen: any) => (
                      <MenuItem key={subOrigen.id} value={subOrigen.id}>
                        {subOrigen.nombre}
                      </MenuItem>
                    ))}
                  </Select>
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
                label="Institución *"
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 2 }}>
            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Código</InputLabel>
                      <Controller
                        name={`codigosDemanda.${index}.tipo`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Tipo de Código" disabled={readOnly}>
                            {dropdownData.tipo_codigo_demanda?.map((tipoCodigo: any) => (
                              <MenuItem key={tipoCodigo.id} value={tipoCodigo.id}>
                                {tipoCodigo.nombre}
                              </MenuItem>
                            ))}
                          </Select>
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
                          label="Código"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{ readOnly }}
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
            >
              AGREGAR CÓDIGO
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="ambito_vulneracion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Ámbito de Vulneración</InputLabel>
                <Select {...field} label="Ámbito de Vulneración" disabled={readOnly}>
                  {dropdownData.ambito_vulneracion?.map((motivo: any) => (
                    <MenuItem key={motivo.id} value={motivo.id}>
                      {motivo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="tipo_demanda"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Tipo de Demanda</InputLabel>
                <Select {...field} label="Tipo de Demanda" disabled={readOnly}>
                  {dropdownData.tipo_demanda_choices?.map((tipo: any) => (
                    <MenuItem key={tipo.key} value={tipo.key}>
                      {tipo.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="presuntos_delitos"
            control={control}
            defaultValue={[]}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Presuntos Delitos</InputLabel>
                <Select
                  {...field}
                  multiple
                  label="Presuntos Delitos"
                  disabled={readOnly}
                  value={field.value || []}
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange(Array.isArray(value) ? value : [])
                  }}
                >
                  {dropdownData.tipo_presunto_delito?.map((delito: any) => (
                    <MenuItem key={delito.id} value={delito.id}>
                      {delito.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="envio_respuesta"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Envío de Respuesta</InputLabel>
                <Select {...field} label="Envío de Respuesta" disabled={readOnly}>
                  {dropdownData.envio_de_respuesta_choices?.map((choice: any) => (
                    <MenuItem key={choice.key} value={choice.key}>
                      {choice.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="presuntaVulneracion.motivos"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Motivo de Intervención *</InputLabel>
                <Select {...field} label="Motivo de Intervención *" disabled={readOnly}>
                  {dropdownData.categoria_motivo?.map((motivo: any) => (
                    <MenuItem key={motivo.id} value={motivo.id}>
                      {motivo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="presuntaVulneracion.submotivos"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const filteredSubmotivos = dropdownData.categoria_submotivo?.filter(
                (submotivo) => submotivo.motivo === selectedMotivo,
              )

              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Submotivo de intervención</InputLabel>
                  <Select {...field} label="Submotivo de intervención" disabled={readOnly}>
                    {filteredSubmotivos?.map((submotivo) => (
                      <MenuItem key={submotivo.id} value={submotivo.id}>
                        {submotivo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Datos de Localización del grupo familiar
          </Typography>
          <LocalizacionFields prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="zona"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Zona a la cual se le asignará la demanda</InputLabel>
                <Select {...field} label="Zona a la cual se le asignará la demanda" disabled={readOnly}>
                  {dropdownData.zonas?.map((zona: any) => (
                    <MenuItem key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
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
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

export default Step1Form

