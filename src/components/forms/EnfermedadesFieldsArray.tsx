// EnfermedadesFieldArray.tsx
import React from "react";
import {
  useFieldArray,
  Controller,
  UseFormWatch,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  FormControl,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface EnfermedadesFieldArrayProps {
  nestIndex: number;
  control: Control<any>;
  readOnly?: boolean;
  dropdownData: any;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const EnfermedadesFieldArray: React.FC<EnfermedadesFieldArrayProps> = ({
  nestIndex,
  control,
  readOnly = false,
  dropdownData,
  watch,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `ninosAdolescentes.${nestIndex}.persona_enfermedades`,
  });

  return (
    <>
      {fields.map((field, enfIndex) => (
        <Box
          key={field.id}
          sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Enfermedad {enfIndex + 1}
          </Typography>
          {!readOnly && (
            <IconButton
              onClick={() => remove(enfIndex)}
              color="error"
              sx={{ float: "right" }}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Grid container spacing={2}>
            {/* Situación de Salud */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.situacion_salud`}
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.situacion_salud || []}
                      getOptionLabel={(option) => option.nombre || ""}
                      value={
                        dropdownData.situacion_salud?.find(
                          (item: any) => item.id === field.value
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.id : null)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Situación de Salud"
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

            {/* Nombre de la Enfermedad */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.enfermedad.nombre`}
                        
                rules={{ required: "Este campo es obligatorio" }}

                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Nombre de la Enfermedad"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{ readOnly }}
                    size="small"
                  />
                )}
              />
            </Grid>

            {/* Institución Sanitaria Interviniente */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.institucion_sanitaria || []}
                      getOptionLabel={(option) => option.nombre || ""}
                      value={
                        dropdownData.institucion_sanitaria?.find(
                          (item: any) => item.id === field.value
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.id : null);
                        if (newValue) {
                          setValue(
                            `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente_nombre`,
                            newValue.nombre
                          );
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Institución Sanitaria Interviniente"
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

            {/* Campo condicional para "other" */}
            {watch(
              `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente`
            ) === "other" && (
              <Grid item xs={12} md={6}>
                <Controller
                  name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente_nombre`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Nombre de la Institución Sanitaria"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ readOnly }}
                      size="small"
                    />
                  )}
                />
              </Grid>
            )}

            {/* Certificación */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.certificacion`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.certificacion_choices || []}
                      getOptionLabel={(option) => option.value || ""}
                      value={
                        dropdownData.certificacion_choices?.find(
                          (item: any) => item.key === field.value
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.key : null)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Certificación"
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


            {/* Información del Tratamiento */}
            <Grid item xs={12}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.informacion_tratamiento`}
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
                    size="small"
                  />
                )}
              />
            </Grid>

            {/* Segundo bloque de Médico de Tratamiento */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Médico de Tratamiento
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.medico_tratamiento.nombre`}
                    rules={{ required: "Este campo es obligatorio" }}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Nombre del Médico"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{ readOnly }}
                        size="small"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.medico_tratamiento.mail`}
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
                        size="small"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.medico_tratamiento.telefono`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Teléfono del Médico"
                        fullWidth
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{ readOnly }}
                        size="small"
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
          onClick={() => append({})}
          sx={{ mt: 1, color: "primary.main" }}
          size="small"
        >
          Añadir otra enfermedad
        </Button>
      )}
    </>
  );
};

export default EnfermedadesFieldArray;
