"use client"

/**
 * LocalizacionOficioSection - Section for NNyA location fields
 *
 * Contains optional localization fields for CARGA_OFICIOS:
 * - calle, casa_nro, localidad, referencia_geo, tipo_calle, piso_depto,
 *   lote, mza, barrio, cpc, geolocalizacion (all optional)
 */

import type React from "react"
import { useMemo } from "react"
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  Typography,
  Alert,
} from "@mui/material"
import { LocationOn as LocationIcon } from "@mui/icons-material"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import type {
  LocalizacionOficioSectionProps,
  CargaOficiosFormData,
} from "../types/carga-oficios.types"

const LocalizacionOficioSection: React.FC<LocalizacionOficioSectionProps> = ({
  dropdownData,
  readOnly = false,
}) => {
  const { control } = useFormContext<CargaOficiosFormData>()

  // Watch localidad to filter barrio and cpc
  const selectedLocalidad = useWatch({
    control,
    name: "localizacion.localidad",
  })

  // Filter barrios by selected localidad
  const filteredBarrios = useMemo(() => {
    if (!selectedLocalidad || !dropdownData.barrio) return []
    return dropdownData.barrio.filter(
      (barrio) => barrio.localidad === selectedLocalidad || barrio.localidad === Number(selectedLocalidad)
    )
  }, [selectedLocalidad, dropdownData.barrio])

  // Filter CPCs by selected localidad
  const filteredCPCs = useMemo(() => {
    if (!selectedLocalidad || !dropdownData.cpc) return []
    return dropdownData.cpc.filter(
      (cpc) => cpc.localidad === selectedLocalidad || cpc.localidad === Number(selectedLocalidad)
    )
  }, [selectedLocalidad, dropdownData.cpc])

  return (
    <Box>
      <Alert
        severity="info"
        icon={<LocationIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          Ingrese la dirección del NNyA (Niño, Niña y Adolescente). Todos los campos son opcionales.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Row 1: Calle and Tipo de Calle */}
        <Grid item xs={12} md={8}>
          <Controller
            name="localizacion.calle"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Calle"
                fullWidth
                disabled={readOnly}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="localizacion.tipo_calle"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.tipo_calle_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={
                    dropdownData.tipo_calle_choices?.find(
                      (item) => item.key === field.value
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.key : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Calle"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        {/* Row 2: Altura and Piso/Depto */}
        <Grid item xs={12} md={6}>
          <Controller
            name="localizacion.casa_nro"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Altura"
                fullWidth
                type="number"
                disabled={readOnly}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="localizacion.piso_depto"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Piso/Depto"
                fullWidth
                disabled={readOnly}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        {/* Row 3: Lote and Manzana */}
        <Grid item xs={12} md={6}>
          <Controller
            name="localizacion.lote"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Lote"
                fullWidth
                disabled={readOnly}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="localizacion.mza"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Manzana"
                fullWidth
                disabled={readOnly}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        {/* Row 4: Referencia Geográfica */}
        <Grid item xs={12}>
          <Controller
            name="localizacion.referencia_geo"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Referencia Geográfica"
                fullWidth
                multiline
                rows={2}
                disabled={readOnly}
                error={!!error}
                helperText={error?.message || "Ej: A 2 cuadras del hospital, frente a la plaza"}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        {/* Row 5: Geolocalización */}
        <Grid item xs={12}>
          <Controller
            name="localizacion.geolocalizacion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Geolocalización"
                fullWidth
                disabled={readOnly}
                error={!!error}
                helperText={error?.message || "Coordenadas GPS o enlace a mapa"}
                InputProps={{ readOnly }}
              />
            )}
          />
        </Grid>

        {/* Row 6: Localidad, Barrio, CPC */}
        <Grid item xs={12} md={4}>
          <Controller
            name="localizacion.localidad"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.localidad || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={
                    dropdownData.localidad?.find(
                      (item) => item.id === field.value || item.id === Number(field.value)
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.id : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Localidad"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="localizacion.barrio"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly || !selectedLocalidad}
                  options={filteredBarrios}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={
                    filteredBarrios?.find(
                      (item) => item.id === field.value || item.id === Number(field.value)
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.id : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Barrio"
                      error={!!error}
                      helperText={error?.message || (!selectedLocalidad ? "Seleccione primero una localidad" : "")}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="localizacion.cpc"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <Autocomplete
                  disabled={readOnly || !selectedLocalidad}
                  options={filteredCPCs}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={
                    filteredCPCs?.find(
                      (item) => item.id === field.value || item.id === Number(field.value)
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.id : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="CPC"
                      error={!!error}
                      helperText={error?.message || (!selectedLocalidad ? "Seleccione primero una localidad" : "")}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default LocalizacionOficioSection
