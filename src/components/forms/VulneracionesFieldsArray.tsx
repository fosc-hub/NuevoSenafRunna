"use client"

// VulneracionesFieldArray.tsx
import type React from "react"
import { useFieldArray, Controller, type UseFormSetValue, type Control, useFormContext } from "react-hook-form"
import { Box, Typography, Grid, Button, IconButton, TextField, FormControl, Autocomplete, Chip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"

interface VulneracionesFieldArrayProps {
  nestIndex: number
  control: Control<any>
  readOnly?: boolean
  dropdownData: any
  watchedValues: any // Changed from watch to watchedValues
  setValue: UseFormSetValue<any>
}

const VulneracionesFieldArray: React.FC<VulneracionesFieldArrayProps> = ({
  nestIndex,
  control,
  readOnly = false,
  dropdownData,
  watchedValues, // Changed from watch to watchedValues
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `ninosAdolescentes.${nestIndex}.vulneraciones`,
  })

  // Use useFormContext to get the watch function
  const { watch } = useFormContext()

  return (
    <>
      {fields.map((field, vulIndex) => (
        <Box key={field.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
          <Typography variant="subtitle2" gutterBottom>
            Vulneración {vulIndex + 1}
          </Typography>
          {!readOnly && (
            <IconButton onClick={() => remove(vulIndex)} color="error" sx={{ float: "right" }} size="small">
              <DeleteIcon />
            </IconButton>
          )}
          <Grid container spacing={2}>
            {/* Campo "Categoría de Motivos" */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_motivo`}
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.categoria_motivo || []}
                      getOptionLabel={(option) => (option.nombre ? `${option.nombre} (Peso: ${option.peso})` : "")}
                      value={dropdownData.categoria_motivo?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              Categoría de Motivos <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!error}
                          helperText={error?.message}
                          size="small"
                        />
                      )}
                      PopperProps={{ style: { width: "auto", maxWidth: "300px" } }}
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Campo "Subcategoría" */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_submotivo`}
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={
                        dropdownData.categoria_submotivo?.filter(
                          (sub: any) =>
                            sub.motivo ===
                            watch(`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_motivo`),
                        ) || []
                      }
                      getOptionLabel={(option) => (option.nombre ? `${option.nombre} (Peso: ${option.peso})` : "")}
                      value={
                        dropdownData.categoria_submotivo
                          ?.filter(
                            (sub: any) =>
                              sub.motivo ===
                              watch(`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_motivo`),
                          )
                          .find((item: any) => item.id === field.value) || null
                      }
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              Subcategoría <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!error}
                          helperText={error?.message}
                          size="small"
                        />
                      )}
                      PopperProps={{ style: { width: "auto", maxWidth: "300px" } }}
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Campo "Gravedad de la Vulneración" */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.gravedad_vulneracion`}
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.gravedad_vulneracion || []}
                      getOptionLabel={(option) => (option.nombre ? `${option.nombre} (Peso: ${option.peso})` : "")}
                      value={dropdownData.gravedad_vulneracion?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              Gravedad de la Vulneración <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!error}
                          helperText={error?.message}
                          size="small"
                        />
                      )}
                      PopperProps={{ style: { width: "auto", maxWidth: "300px" } }}
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Campo "Urgencia de la Vulneración" */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.urgencia_vulneracion`}
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.urgencia_vulneracion || []}
                      getOptionLabel={(option) => (option.nombre ? `${option.nombre} (Peso: ${option.peso})` : "")}
                      value={dropdownData.urgencia_vulneracion?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              Urgencia de la Vulneración <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!error}
                          helperText={error?.message}
                          size="small"
                        />
                      )}
                      PopperProps={{ style: { width: "auto", maxWidth: "300px" } }}
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Cálculo y despliegue de los pesos totales con colores */}
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  p: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px dashed",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Peso Total: {(() => {
                    const categoriaMotivo = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_motivo`,
                    )
                    const categoriaSubmotivo = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_submotivo`,
                    )
                    const gravedadVulneracion = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.gravedad_vulneracion`,
                    )
                    const urgenciaVulneracion = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.urgencia_vulneracion`,
                    )
                    let total = 0
                    total += dropdownData.categoria_motivo?.find((item: any) => item.id === categoriaMotivo)?.peso || 0
                    total +=
                      dropdownData.categoria_submotivo?.find((item: any) => item.id === categoriaSubmotivo)?.peso || 0
                    total +=
                      dropdownData.gravedad_vulneracion?.find((item: any) => item.id === gravedadVulneracion)?.peso || 0
                    total +=
                      dropdownData.urgencia_vulneracion?.find((item: any) => item.id === urgenciaVulneracion)?.peso || 0
                    return total
                  })()}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {(() => {
                    const categoriaMotivo = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_motivo`,
                    )
                    const categoriaSubmotivo = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.categoria_submotivo`,
                    )
                    const gravedadVulneracion = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.gravedad_vulneracion`,
                    )
                    const urgenciaVulneracion = watch(
                      `ninosAdolescentes.${nestIndex}.vulneraciones.${vulIndex}.urgencia_vulneracion`,
                    )
                    const chips = []
                    const catMotivoPeso = dropdownData.categoria_motivo?.find(
                      (item: any) => item.id === categoriaMotivo,
                    )?.peso
                    const catSubmotivoPeso = dropdownData.categoria_submotivo?.find(
                      (item: any) => item.id === categoriaSubmotivo,
                    )?.peso
                    const gravedadPeso = dropdownData.gravedad_vulneracion?.find(
                      (item: any) => item.id === gravedadVulneracion,
                    )?.peso
                    const urgenciaPeso = dropdownData.urgencia_vulneracion?.find(
                      (item: any) => item.id === urgenciaVulneracion,
                    )?.peso
                    if (catMotivoPeso)
                      chips.push(
                        <Chip
                          key="cat"
                          size="small"
                          label={`Categoría: ${catMotivoPeso}`}
                          color="primary"
                          variant="outlined"
                        />,
                      )
                    if (catSubmotivoPeso)
                      chips.push(
                        <Chip
                          key="sub"
                          size="small"
                          label={`Subcategoría: ${catSubmotivoPeso}`}
                          color="secondary"
                          variant="outlined"
                        />,
                      )
                    if (gravedadPeso)
                      chips.push(
                        <Chip
                          key="grav"
                          size="small"
                          label={`Gravedad: ${gravedadPeso}`}
                          color="error"
                          variant="outlined"
                        />,
                      )
                    if (urgenciaPeso)
                      chips.push(
                        <Chip
                          key="urg"
                          size="small"
                          label={`Urgencia: ${urgenciaPeso}`}
                          color="warning"
                          variant="outlined"
                        />,
                      )
                    return chips
                  })()}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ))}
      {!readOnly && (
        <Button startIcon={<AddIcon />} onClick={() => append({})} sx={{ mt: 1, color: "primary.main" }} size="small">
          Añadir otra vulneración
        </Button>
      )}
    </>
  )
}

export default VulneracionesFieldArray
