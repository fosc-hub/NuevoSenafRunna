"use client"

/**
 * CodigosDemandaOficioSection - Section for SAC and Nro. Oficio Web codes
 *
 * Uses the same TCodigoDemanda pattern as Step1Form.
 * Per backend spec (OficiosJudiciales.md line 344-345):
 * "SAC/Numero Oficio: Usar TCodigoDemanda existente con tipos SAC, N de Oficio Web"
 */

import type React from "react"
import {
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Paper,
  Tooltip,
  FormControl,
  Autocomplete,
  Typography,
  Alert,
} from "@mui/material"
import { Add, Remove, Info as InfoIcon } from "@mui/icons-material"
import { Controller, useFormContext, useFieldArray } from "react-hook-form"
import type { CargaOficiosFormData } from "../types/carga-oficios.types"

interface CodigosDemandaOficioSectionProps {
  tipoCodigoDemanda: Array<{ id: number; nombre: string }>
  readOnly?: boolean
}

const CodigosDemandaOficioSection: React.FC<CodigosDemandaOficioSectionProps> = ({
  tipoCodigoDemanda,
  readOnly = false,
}) => {
  const { control } = useFormContext<CargaOficiosFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "codigosDemanda" as any,
  })

  // Filter to show only SAC and N de Oficio Web types for oficios
  const filteredTipos = tipoCodigoDemanda?.filter((tipo) => {
    const nombre = tipo.nombre.toLowerCase()
    return (
      nombre.includes("sac") ||
      nombre.includes("oficio") ||
      nombre.includes("web") ||
      nombre.includes("notificacion") ||
      nombre.includes("102")
    )
  }) || tipoCodigoDemanda || []

  return (
    <Box>
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          Ingrese los códigos de identificación del oficio (SAC, Nro. Oficio Web, Notificación 102, etc.)
        </Typography>
      </Alert>

      {fields.map((field, index) => (
        <Paper
          key={field.id}
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "8px",
            borderColor: index % 2 === 0 ? "primary.light" : "divider",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <Controller
                  name={`codigosDemanda.${index}.tipo` as any}
                  control={control}
                  render={({ field: fieldProps }) => (
                    <Autocomplete
                      disabled={readOnly}
                      options={filteredTipos}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={
                        filteredTipos?.find(
                          (item: any) => item.id === fieldProps.value
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        fieldProps.onChange(newValue ? newValue.id : null)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo de Código"
                          placeholder="SAC, Nro. Oficio Web, etc."
                        />
                      )}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Controller
                name={`codigosDemanda.${index}.codigo` as any}
                control={control}
                render={({ field: fieldProps, fieldState: { error } }) => (
                  <TextField
                    {...fieldProps}
                    label="Número"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{ readOnly }}
                    placeholder="Ej: 3462384"
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Tooltip title="Eliminar código">
                <IconButton
                  onClick={() => remove(index)}
                  disabled={readOnly}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.lighter",
                    },
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<Add />}
        onClick={() => append({ tipo: "", codigo: "" })}
        disabled={readOnly}
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: "20px",
          px: 3,
        }}
      >
        AGREGAR CÓDIGO
      </Button>
    </Box>
  )
}

export default CodigosDemandaOficioSection
