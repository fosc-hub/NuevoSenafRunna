"use client"

// EnfermedadesFieldArray.tsx
import type React from "react"
import {
  useFieldArray,
  Controller,
  useController,
  type Control,
  type UseFormSetValue,
  useFormContext,
} from "react-hook-form"
import { Box, Typography, Grid, Button, IconButton, TextField, FormControl, Autocomplete } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { FileUploadSection, type FileItem } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"

// Wrapper component that integrates shared FileUploadSection with react-hook-form
const FileUploadField = ({
  name,
  control,
  readOnly,
  getFileName,
  openFile,
}: {
  name: string
  control: Control<any>
  readOnly?: boolean
  getFileName: (filePath: string) => string
  openFile: (filePath: string) => void
}) => {
  const { field } = useController({ name, control })
  const { value, onChange } = field

  // Extract server files (files with 'archivo' property) and new files (File objects)
  const serverFiles = Array.isArray(value) ? value.filter((file) => typeof file === "object" && "archivo" in file) : []
  const newFiles = Array.isArray(value) ? value.filter((file) => file instanceof File) : []

  // Convert to FileItem[] for display
  const displayFiles: FileItem[] = [
    // Server files
    ...serverFiles.map((file: any, idx: number) => ({
      id: `server_${idx}`,
      nombre: getFileName(file.archivo),
      tipo: 'application/octet-stream',
      url: `https://web-runna-v2legajos.up.railway.app${file.archivo}`,
      tamano: 0,
    })),
    // New files
    ...newFiles.map((file: File, idx: number) => ({
      id: `new_${idx}`,
      nombre: file.name,
      tipo: file.type,
      tamano: file.size,
    }))
  ]

  const handleFileUpload = (file: File) => {
    // Keep existing server files and add new file
    onChange([...serverFiles, ...newFiles, file])
  }

  const handleFileDownload = (file: FileItem) => {
    if (file.url) {
      openFile(file.url.replace('https://web-runna-v2legajos.up.railway.app', ''))
    }
  }

  const handleFileDelete = (fileId: number | string) => {
    const id = fileId.toString()

    if (id.startsWith('server_')) {
      // Remove server file
      const index = Number.parseInt(id.replace('server_', ''))
      const updatedServerFiles = serverFiles.filter((_, idx) => idx !== index)
      onChange([...updatedServerFiles, ...newFiles])
    } else if (id.startsWith('new_')) {
      // Remove new file
      const index = Number.parseInt(id.replace('new_', ''))
      const updatedNewFiles = newFiles.filter((_, idx) => idx !== index)
      onChange([...serverFiles, ...updatedNewFiles])
    }
  }

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Certificado Adjunto
      </Typography>
      <FileUploadSection
        files={displayFiles}
        onUpload={handleFileUpload}
        onDownload={handleFileDownload}
        onDelete={handleFileDelete}
        title=""
        multiple={true}
        emptyMessage="No hay archivos adjuntos. Arrastra archivos o haz clic para seleccionar."
        dragDropMessage="Arrastra y suelta archivos aquí"
        uploadButtonLabel="Seleccionar archivos"
        disabled={readOnly}
      />
    </Box>
  )
}

interface EnfermedadesFieldArrayProps {
  nestIndex: number
  control: Control<any>
  readOnly?: boolean
  dropdownData: any
  watchedValues: any // Changed from watch to watchedValues
  setValue: UseFormSetValue<any>
}

const EnfermedadesFieldArray: React.FC<EnfermedadesFieldArrayProps> = ({
  nestIndex,
  control,
  readOnly = false,
  dropdownData,
  watchedValues, // Changed from watch to watchedValues
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `ninosAdolescentes.${nestIndex}.persona_enfermedades`,
  })

  // Use useFormContext to get the watch function
  const { watch } = useFormContext()

  // Function to extract filename from path
  const getFileName = (filePath: string) => {
    return filePath.split("/").pop() || filePath
  }

  // Function to open file in new tab
  const openFile = (filePath: string) => {
    window.open(`https://web-runna-v2legajos.up.railway.app${filePath}`, "_blank")
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
                      getOptionLabel={(option) => {
                        if (!option || typeof option !== 'object') return ""
                        return option.nombre || ""
                      }}
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
                      getOptionLabel={(option) => {
                        if (!option || typeof option !== 'object') return ""
                        return option.nombre || ""
                      }}
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
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Campo condicional para "other" */}
            {watchedValues?.[
              `ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.institucion_sanitaria_interviniente`
            ] === "other" && (
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
                      getOptionLabel={(option) => {
                        if (!option || typeof option !== 'object') return ""
                        return option.value || ""
                      }}
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
                      size="small"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* Certificado Adjunto */}
            <Grid item xs={12}>
              <FileUploadField
                name={`ninosAdolescentes.${nestIndex}.persona_enfermedades.${enfIndex}.certificado_adjunto`}
                control={control}
                readOnly={readOnly}
                getFileName={getFileName}
                openFile={openFile}
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
