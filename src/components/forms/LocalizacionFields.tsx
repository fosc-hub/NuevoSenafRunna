import type React from "react"
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Paper } from "@mui/material"
import { type Control, Controller, useWatch } from "react-hook-form"
import type { DropdownData } from "./types/formTypes"

interface LocalizacionFieldsProps {
  control: Control<any>
  prefix: string
  dropdownData: DropdownData
  readOnly?: boolean
}

const LocalizacionFields: React.FC<LocalizacionFieldsProps> = ({ control, prefix, dropdownData, readOnly = false }) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
      <Grid container spacing={3}>
        {/* Calle y Tipo de Calle */}
        <Grid item xs={12} md={8}>
          <Controller
            name={`${prefix}.calle`}
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
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.tipo_calle`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Tipo de Calle</InputLabel>
                <Select {...field} label="Tipo de Calle" disabled={readOnly}>
                  {dropdownData.tipo_calle_choices.map((option: any) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* Número de Casa y Piso/Depto */}
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.casa_nro`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Número de Casa"
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
            name={`${prefix}.piso_depto`}
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

        {/* Lote y Manzana */}
        <Grid item xs={12} md={6}>
          <Controller
            name={`${prefix}.lote`}
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
            name={`${prefix}.mza`}
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

        {/* Referencia Geográfica */}
        <Grid item xs={12}>
          <Controller
            name={`${prefix}.referencia_geo`}
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
            name={`${prefix}.geolocalizacion`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Geolocalización"
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
        {/* Localidad */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.localidad`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Localidad</InputLabel>
                <Select {...field} label="Localidad" disabled={readOnly}>
                  {dropdownData.localidad?.map((localidad: any) => (
                    <MenuItem key={localidad.id} value={localidad.id}>
                      {localidad.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* Barrio */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.barrio`}
            control={control}
            render={({ field, fieldState: { error } }) => {
              const selectedLocalidad = useWatch({
                control,
                name: `${prefix}.localidad`,
              })
              const filteredBarrios = dropdownData.barrio?.filter(
                (barrio: any) => barrio.localidad === selectedLocalidad,
              )

              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Barrio</InputLabel>
                  <Select {...field} label="Barrio" disabled={readOnly}>
                    {filteredBarrios?.map((barrio: any) => (
                      <MenuItem key={barrio.id} value={barrio.id}>
                        {barrio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }}
          />
        </Grid>

        {/* CPC */}
        <Grid item xs={12} md={4}>
          <Controller
            name={`${prefix}.cpc`}
            control={control}
            render={({ field, fieldState: { error } }) => {
              const selectedLocalidad = useWatch({
                control,
                name: `${prefix}.localidad`,
              })
              const filteredCPCs = dropdownData.cpc?.filter((cpc: any) => cpc.localidad === selectedLocalidad)

              return (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>CPC</InputLabel>
                  <Select {...field} label="CPC" disabled={readOnly}>
                    {filteredCPCs?.map((cpc: any) => (
                      <MenuItem key={cpc.id} value={cpc.id}>
                        {cpc.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default LocalizacionFields

