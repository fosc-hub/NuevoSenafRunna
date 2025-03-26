"use client"

// EnfermedadesFieldArray.tsx
import type React from "react"
import { useFieldArray, Controller, type UseFormWatch, type UseFormSetValue, type Control } from "react-hook-form"
import { Box, Typography, Grid, Button, IconButton, TextField, FormControl, Autocomplete } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { useState, useRef, useCallback } from "react"

interface EnfermedadesFieldArrayProps {
  nestIndex: number
  control: Control<any>
  readOnly?: boolean
  dropdownData: any
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
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
  })

  // Function to extract filename from path
  const getFileName = (filePath: string) => {
    return filePath.split("/").pop() || filePath
  }

  // Function to open file in new tab
  const openFile = (filePath: string) => {
    window.open(`https://web-production-c6370.up.railway.app${filePath}`, "_blank")
  }

  return (
    <>
      {fields.map((field, enfIndex) => (
        <Box key={field.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
          <Typography variant="subtitle2" gutterBottom>
            Enfermedad {enfIndex + 1}
          </Typography>
          {!readOnly && (
            <IconButton onClick={() => remove(enfIndex)} color="error" sx={{ float: "right" }} size="small">
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
                      value={dropdownData.situacion_salud?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              Situación de Salud <span style={{ color: "red" }}>*</span>
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

            {/* Nombre de la Enfermedad */}
            <Grid item xs={12} md={6}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.enfermedad.nombre`}
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={
                      <>
                        Nombre de la Enfermedad <span style={{ color: "red" }}>*</span>
                      </>
                    }
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
                      value={dropdownData.institucion_sanitaria?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.id : null)
                        if (newValue) {
                          setValue(
                            `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente_nombre`,
                            newValue.nombre,
                          )
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
              `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente`,
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
                      value={dropdownData.certificacion_choices?.find((item: any) => item.key === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
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

            {/* Certificado Adjunto */}
            <Grid item xs={12}>
              <Controller
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.certificado_adjunto`}
                control={control}
                render={({ field }) => {
                  const { value, onChange } = field
                  const { error } = control.getFieldState(
                    `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.certificado_adjunto`,
                    {},
                  )
                  const [isDragging, setIsDragging] = useState(false)

                  // Move these declarations outside of handleDrop and handleFileChange
                  const fileInputRef = useRef<HTMLInputElement>(null)
                  const dropAreaRef = useRef<HTMLDivElement>(null)

                  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(true)
                  }, [])

                  const handleDragOver = useCallback(
                    (e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!isDragging) {
                        setIsDragging(true)
                      }
                    },
                    [isDragging],
                  )

                  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault()
                    e.stopPropagation()

                    // Only set isDragging to false if we're leaving the drop area (not a child element)
                    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
                      setIsDragging(false)
                    }
                  }, [])

                  const handleDrop = useCallback(
                    (e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDragging(false)

                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        onChange(Array.from(e.dataTransfer.files))
                      }
                    },
                    [onChange],
                  )

                  const handleFileChange = useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files) {
                        onChange(Array.from(e.target.files))
                      }
                    },
                    [onChange],
                  )

                  const removeFile = useCallback(
                    (index: number) => {
                      if (Array.isArray(value)) {
                        const newFiles = [...value]
                        newFiles.splice(index, 1)
                        onChange(newFiles)
                      }
                    },
                    [onChange, value],
                  )

                  // Check if value is an array of objects with 'archivo' property (from server)
                  const isServerFiles =
                    Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && "archivo" in value[0]

                  return (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Certificado Adjunto
                      </Typography>

                      <Grid container spacing={2}>
                        {/* Display existing server files if available */}
                        <Grid item xs={12} md={isServerFiles ? 6 : 12}>
                          {/* Upload area for new files */}
                          <Box
                            ref={dropAreaRef}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              border: "2px dashed",
                              borderColor: isDragging ? "primary.main" : "#ccc",
                              borderRadius: "4px",
                              p: 2,
                              height: "100%",
                              minHeight: "150px",
                              textAlign: "center",
                              cursor: "pointer",
                              backgroundColor: isDragging ? "rgba(25, 118, 210, 0.04)" : "transparent",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "primary.light",
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                              },
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <input
                              name={field.name}
                              ref={fileInputRef}
                              type="file"
                              multiple
                              hidden
                              disabled={readOnly}
                              onChange={handleFileChange}
                            />

                            {/* Display new files being uploaded */}
                            {!isServerFiles && Array.isArray(value) && value.length > 0 ? (
                              <Box
                                sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
                              >
                                {value.map((file: File, idx: number) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      py: 0.5,
                                      "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                                      <AttachFileIcon
                                        sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                                        fontSize="small"
                                      />
                                      <Typography variant="body2" noWrap title={file.name}>
                                        {file.name}
                                      </Typography>
                                    </Box>
                                    {!readOnly && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          removeFile(idx)
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CloudUploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="body2" gutterBottom>
                                  Arrastra y suelta archivos aquí
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  o haz clic para seleccionar archivos
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>

                        {isServerFiles && (
                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                border: "1px solid #eee",
                                borderRadius: "4px",
                                p: 1,
                                height: "100%",
                                minHeight: "150px",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Typography variant="subtitle2" gutterBottom>
                                Archivos existentes:
                              </Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  overflow: "auto",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {value.map((file: any, idx: number) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      py: 0.5,
                                      "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                                    }}
                                  >
                                    <Box
                                      sx={{ display: "flex", alignItems: "center", overflow: "hidden", flexGrow: 1 }}
                                    >
                                      <AttachFileIcon
                                        sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                                        fontSize="small"
                                      />
                                      <Typography variant="body2" noWrap title={getFileName(file.archivo)}>
                                        {getFileName(file.archivo)}
                                      </Typography>
                                    </Box>
                                    <IconButton size="small" color="primary" onClick={() => openFile(file.archivo)}>
                                      <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>

                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </Box>
                  )
                }}
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
                        label={
                          <>
                            Nombre del Médico <span style={{ color: "red" }}>*</span>
                          </>
                        }
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
        <Button startIcon={<AddIcon />} onClick={() => append({})} sx={{ mt: 1, color: "primary.main" }} size="small">
          Añadir otra enfermedad
        </Button>
      )}
    </>
  )
}

export default EnfermedadesFieldArray

