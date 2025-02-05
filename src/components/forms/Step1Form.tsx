import type React from "react"
import { type Control, Controller, useWatch } from "react-hook-form"
import {
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { format, parse } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/app/api/apiService"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "./types/formTypes"

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
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Origen *</InputLabel>
                <Select {...field} label="Origen *" disabled={readOnly}>
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
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Sub Origen *</InputLabel>
                <Select {...field} label="Sub Origen *" disabled={readOnly}>
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
            rules={{ required: "Este campo es obligatorio" }}
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
          <Controller
            name="nro_notificacion_102"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Nro. Notificación 102"
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
            name="nro_sac"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Nro. SAC"
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
            name="nro_suac"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Nro. SUAC"
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
            name="nro_historia_clinica"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Nro. Historia Clínica"
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
            name="nro_oficio_web"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Nro. Oficio Web"
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
            name="autos_caratulados"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Autos Caratulados *"
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
            name="ambito_vulneracion"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
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
          <Controller
            name="presuntaVulneracion.motivos"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
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
          <Typography color="primary" sx={{ mt: 2, mb: 1 }}>
            Datos de Localización
          </Typography>
          <LocalizacionFields prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </Grid>

      </Grid>
    </LocalizationProvider>
  )
}

export default Step1Form

