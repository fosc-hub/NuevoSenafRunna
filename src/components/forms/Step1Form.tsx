import React from "react"
import { type Control, Controller, useWatch } from "react-hook-form"
import { TextField, Grid, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { format, parse } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/app/api/apiService"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "./types/formTypes"
import { Typography } from "@mui/material"

const fetchDropdowns = async () => {
  try {
    const response = await get<DropdownData>(`registro-caso-form-dropdowns/`)
    console.log("Fetched dropdown data:", response)
    return response
  } catch (error) {
    console.error("Error al obtener los datos del formulario:", error)
    throw error
  }
}

interface Step1FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean }> = ({ control, readOnly = false }) => {
  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dropdowns"],
    queryFn: fetchDropdowns,
  })

  const createNewUser = useWatch({
    control,
    name: "createNewUsuarioExterno",
    defaultValue: false,
  })

  const [selectedNumberType, setSelectedNumberType] = React.useState<string>("nro_notificacion_102")

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
                renderInput={(params) => (
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
                renderInput={(params) => (
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
                <InputLabel>Datos del remitente</InputLabel>
                <Select {...field} label="Datos del remitente" disabled={readOnly}>
                  {dropdownData.origenes?.map((origen) => (
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
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Tipo de Institución</InputLabel>
                <Select {...field} label="Tipo de Institución" disabled={readOnly}>
                  {dropdownData.sub_origenes?.map((subOrigen) => (
                    <MenuItem key={subOrigen.id} value={subOrigen.id}>
                      {subOrigen.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Número</InputLabel>
            <Select
              value={selectedNumberType}
              onChange={(e) => setSelectedNumberType(e.target.value as string)}
              label="Tipo de Número"
              disabled={readOnly}
            >
              <MenuItem value="nro_Notificacion_102">Nro. Notificación 102</MenuItem>
              <MenuItem value="nro_SAC">Nro. SAC</MenuItem>
              <MenuItem value="nro_SUAC">Nro. SUAC</MenuItem>
              <MenuItem value="nro_Historia_Clinica">Nro. Historia Clínica</MenuItem>
              <MenuItem value="nro_Oficio_Web">Nro. Oficio Web</MenuItem>
              <MenuItem value="nro_Autos_Caratulados">Autos Caratulados</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name={selectedNumberType}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={`Número de ${selectedNumberType.replace("nro_", "").replace("_", " ")}`}
                fullWidth
                type="number"
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="ambito_vulneracion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Ámbito de Vulneración *</InputLabel>
                <Select {...field} label="Ámbito de Vulneración *" disabled={readOnly}>
                  {dropdownData.ambito_vulneracion_choices?.map((option) => (
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
            name="presuntaVulneracion.motivos"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Motivo de Intervención *</InputLabel>
                <Select {...field} label="Motivo de Intervención *" disabled={readOnly}>
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
        
        <Grid item xs={12}>
          <Controller
            name="presuntaVulneracion.motivos"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Submotivo de intervención</InputLabel>
                <Select {...field} label="Submotivo de intervención" disabled={readOnly}>
                  {dropdownData.categoria_submotivos?.map((motivo) => (
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
            name="descripcion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Descripción"
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
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Datos de Localización del grupo familiar
          </Typography>
          <LocalizacionFields prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Observaciones
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="observaciones_adultos"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Observaciones sobre los adultos"
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
          <Controller
            name="observaciones_nnya"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Observaciones sobre los NNyA"
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
      </Grid>
    </LocalizationProvider>
  )
}

export default Step1Form

