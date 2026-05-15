"use client"

import React, { useState, useEffect } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { type Control, Controller, useFieldArray, useController } from "react-hook-form"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { useQuery } from "@tanstack/react-query"
import { parseDateSafely, formatDateSafely } from "./utils/dateUtils"
import { get } from "@/app/api/apiService"
import {
  TextField,
  Grid,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Box,
  FormHelperText,
  Autocomplete,
  Typography,
  Paper,
  Tooltip,
  Alert,
  Collapse,
  Card,
  CardContent,
} from "@mui/material"
import { Add, Remove, CloudUpload, AttachFile, OpenInNew, ExpandMore, ExpandLess, PictureAsPdf } from "@mui/icons-material"
import { usePdfViewer } from "@/hooks"
import { isPdfFile } from "@/utils/pdfUtils"
import LocalizacionFields from "./LocalizacionFields"
import type { DropdownData, FormData } from "./types/formTypes"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import {
  FileUploadSection as SharedFileUploadSection,
  type FileItem,
} from "@/components/shared/FileUploadSection"

// NOTE: CARGA_OFICIOS dropdowns have been moved to the specialized CargaOficiosForm component


// Adapter local: usa el componente compartido para todo el upload UI.
// Mapea el array `adjuntos` del form (mezcla de File + objetos {archivo})
// al formato FileItem que entiende el shared component.
const FileUploadSection = ({
  control,
  readOnly,
  openPdfUrl,
}: {
  control: Control<FormData>
  readOnly?: boolean
  openPdfUrl: (url: string, options?: { title?: string; fileName?: string }) => void
}) => {
  const { field } = useController({ name: "adjuntos", control, defaultValue: [] })
  const value: any[] = Array.isArray(field.value) ? field.value : []
  const onChange = field.onChange

  const getFileName = (filePath?: string | null) =>
    !filePath ? "Archivo sin nombre" : filePath.split("/").pop() || filePath

  const buildFullUrl = (filePath: string) =>
    filePath.startsWith("http://") || filePath.startsWith("https://")
      ? filePath
      : `https://web-runna-v2legajos.up.railway.app${filePath}`

  const items: FileItem[] = value.map((file, index) => {
    if (file && typeof file === "object" && "archivo" in file) {
      const nombre = getFileName(file.archivo)
      return {
        id: `existing-${index}`,
        nombre,
        url: file.archivo ? buildFullUrl(file.archivo) : undefined,
      }
    }
    return {
      id: `new-${index}`,
      nombre: file.name,
      tipo: file.type,
      tamano: file.size,
    }
  })

  const handleUpload = (file: File) => {
    onChange([...value, file])
  }

  const handleDelete = (id: number | string) => {
    const idx = value.findIndex((_, i) =>
      typeof id === "string" && (id === `existing-${i}` || id === `new-${i}`),
    )
    if (idx === -1) return
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  const handleDownload = (file: FileItem) => {
    if (!file.url) return
    const fileName = file.nombre || "archivo"
    if (isPdfFile(fileName)) {
      openPdfUrl(file.url, { title: "Archivo Adjunto", fileName })
    } else {
      window.open(file.url, "_blank")
    }
  }

  return (
    <SharedFileUploadSection
      files={items}
      onUpload={readOnly ? undefined : handleUpload}
      onDelete={readOnly ? undefined : handleDelete}
      onDownload={handleDownload}
      multiple
      readOnly={readOnly}
      title="Archivos Adjuntos"
      emptyMessage="No hay archivos adjuntos"
    />
  )
}

// Componente de sección con título y contenido
const FormSection = ({
  title,
  children,
  collapsible = false,
}: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
}) => {
  const [expanded, setExpanded] = useState(!collapsible)

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          cursor: collapsible ? "pointer" : "default",
          "&:hover": collapsible ? { color: "primary.main" } : {},
        }}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <Typography
          color="primary"
          variant="subtitle1"
          sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
        >
          {title}
          {collapsible && (expanded ? <ExpandLess /> : <ExpandMore />)}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {children}
        </Paper>
      </Collapse>
    </Box>
  )
}

interface Step1FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const Step1Form: React.FC<{ control: Control<FormData>; readOnly?: boolean; id?: number }> = ({ control, readOnly = false, id }) => {
  // PDF Viewer hook
  const { openUrl: openPdfUrl, PdfModal } = usePdfViewer()

  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
  })

  // Vinculacion state
  const [vinculacionResults, setVinculacionResults] = useState<{
    demanda_ids: number[]
    match_descriptions: string[]
  } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // REG-01: Get form methods to manipulate vinculos
  const { setValue, getValues } = useFormContext<FormData>()

  // Use the hook from conexionesApi
  const { buscarPorNombreApellido, buscarPorDni, buscarCompleto } = useBusquedaVinculacion(800) // 800ms debounce

  // Handle the results from the vinculacion search
  const handleVinculacionResults = (results: { demanda_ids: number[]; match_descriptions: string[] }) => {
    if (results.demanda_ids.length > 0) {
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // REG-01: Handle vincular legajo from notification - adds legajo to VinculosManager
  const handleVincularLegajo = async (legajoId: number, legajoNumero: string) => {
    // Get current vinculos or initialize empty array
    const currentVinculos = getValues("vinculos") || []

    // Check if this legajo is already in the list
    const alreadyAdded = currentVinculos.some((v) => v.legajo === legajoId)
    if (alreadyAdded) {
      console.log("Legajo already added to vinculos")
      return
    }

    // Fetch legajo details to get medidas_activas
    try {
      const legajoData = await get<any>(`legajos/${legajoId}/`)

      // Create new vinculo with legajo info pre-filled
      const newVinculo = {
        legajo: legajoId,
        medida: null,
        tipo_vinculo: null,
        justificacion: "",
        legajo_info: {
          id: legajoId,
          numero: legajoNumero,
          nnya_nombre: `${legajoData.nnya?.nombre || ""} ${legajoData.nnya?.apellido || ""}`.trim(),
          medidas_activas: legajoData.medidas_activas || [],
        },
      }

      // Add to vinculos array
      setValue("vinculos", [...currentVinculos, newVinculo])

      // Scroll to vinculos section if not visible
      setTimeout(() => {
        const vinculosSection = document.querySelector('[data-section="vinculos"]')
        if (vinculosSection) {
          vinculosSection.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    } catch (error) {
      console.error("Error fetching legajo details:", error)
      // Still add the vinculo but without full details
      const newVinculo = {
        legajo: legajoId,
        medida: null,
        tipo_vinculo: null,
        justificacion: "",
        legajo_info: {
          id: legajoId,
          numero: legajoNumero,
          nnya_nombre: legajoNumero, // Fallback to numero if name fetch fails
          medidas_activas: [],
        },
      }
      setValue("vinculos", [...currentVinculos, newVinculo])
    }
  }

  // Watch for changes in the relevant fields
  const watchedCodigos = useWatch({
    control,
    name: "codigosDemanda",
  })

  const watchedLocalizacion = useWatch({
    control,
    name: "localizacion",
  })

  // Effect to handle changes in codigo and localizacion
  useEffect(() => {
    if (!watchedCodigos || !watchedLocalizacion) return

    // Check if we have a valid codigo
    const codigoValido = watchedCodigos.find((codigo: any) => codigo.codigo && codigo.codigo.trim().length > 0)

    // Check if we have valid localizacion data
    const calleValida = watchedLocalizacion?.calle && watchedLocalizacion.calle.trim().length > 0
    const localidadValida = watchedLocalizacion?.localidad && !isNaN(Number(watchedLocalizacion.localidad))

    // If we have valid data, search for vinculaciones
    if (codigoValido || (calleValida && localidadValida)) {
      console.log(
        "Buscando vinculaciones con:",
        codigoValido ? `Código: ${codigoValido.codigo}` : "",
        calleValida ? `Calle: ${watchedLocalizacion.calle}` : "",
        localidadValida ? `Localidad: ${watchedLocalizacion.localidad}` : "",
      )

      // Prepare search data
      const searchData: any = {}

      if (codigoValido) {
        searchData.codigo = codigoValido.codigo
      }

      if (calleValida && localidadValida) {
        searchData.localizacion = {
          calle: watchedLocalizacion.calle,
          localidad: Number(watchedLocalizacion.localidad),
        }
      }

      // Perform the search
      buscarCompleto(
        "", // nombre y apellido vacío
        0, // dni vacío
        codigoValido?.codigo || "",
        calleValida && localidadValida
          ? {
            calle: watchedLocalizacion.calle,
            localidad: Number(watchedLocalizacion.localidad),
          }
          : undefined,
        handleVinculacionResults,
        id, // Pass the current demanda ID
      )
    }
  }, [watchedCodigos, watchedLocalizacion, buscarCompleto])

  const selectedMotivo = useWatch({ control, name: "motivo_ingreso" })
  const selectedBloqueRemitente = useWatch({ control, name: "bloque_datos_remitente" })
  // NOTE: objetivo_de_demanda is now selected in Step 0 (ObjetivoSelectionStep)

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

  const {
    data: zonasData,
    isLoading: isLoadingZonas,
    isError: isErrorZonas,
  } = useQuery({
    queryKey: ["zonas"],
  })

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar los datos del formulario. Por favor, intente nuevamente.
      </Alert>
    )
  }

  if (!dropdownData) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No se pudieron cargar los datos del formulario. Por favor, intente nuevamente.
      </Alert>
    )
  }

  return (
    <>
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: "12px", bgcolor: "primary.light", color: "white" }}>
          <Typography variant="h5" gutterBottom>
            Registro de Demanda
          </Typography>
          <Typography variant="body2">
            Complete todos los campos requeridos para registrar una nueva demanda en el sistema.
          </Typography>
        </Paper>

        {/* Sección de Información Básica */}
        <FormSection title="Información Básica">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="fecha_oficio_documento"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Fecha de oficio/documento"
                    disabled={readOnly}
                    value={parseDateSafely(field.value)}
                    onChange={(date) => field.onChange(formatDateSafely(date))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                        size: "medium",
                        required: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="fecha_ingreso_senaf"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Fecha de ingreso SENAF"
                    disabled={readOnly}
                    value={parseDateSafely(field.value)}
                    onChange={(date) => field.onChange(formatDateSafely(date))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                        size: "medium",
                        required: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="etiqueta"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.etiqueta || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.etiqueta?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Etiqueta"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="envio_de_respuesta"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.envio_de_respuesta_choices || []}
                      getOptionLabel={(option: any) => option.value || ""}
                      value={dropdownData.envio_de_respuesta_choices?.find((item: any) => item.key === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Envío de respuesta"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Datos del Remitente */}
        <FormSection title="Tipo de Organismo">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="bloque_datos_remitente"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.bloques_datos_remitente || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.bloques_datos_remitente?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo de Organismo"
                          required
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="tipo_institucion"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const filteredSubOrigins = dropdownData.tipo_institucion_demanda?.filter(
                    (subOrigen: any) => subOrigen.bloque_datos_remitente === selectedBloqueRemitente,
                  )

                  return (
                    <FormControl fullWidth error={!!error}>
                      <Autocomplete
                        disabled={readOnly}
                        options={filteredSubOrigins || []}
                        getOptionLabel={(option: any) => option.nombre || ""}
                        value={filteredSubOrigins?.find((item: any) => item.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Organismo"
                            required
                            error={!!error}
                            helperText={error?.message}
                            size="medium"
                          />
                        )}
                        size="medium"
                      />
                    </FormControl>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="institucion"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Nombre de la Institución"
                    required
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{ readOnly }}
                    size="medium"
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Códigos de Demanda */}
        <FormSection title="Códigos de Demanda">
          <Box>
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
                        name={`codigosDemanda.${index}.tipo`}
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            disabled={readOnly}
                            options={dropdownData.tipo_codigo_demanda || []}
                            getOptionLabel={(option: any) => option.nombre || ""}
                            value={dropdownData.tipo_codigo_demanda?.find((item: any) => item.id === field.value) || null}
                            onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                            renderInput={(params) => <TextField {...params} label="Tipo de Número" size="medium" />}
                            size="medium"
                          />
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
                          label="Número"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{ readOnly }}
                          size="medium"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ display: "flex", justifyContent: "center" }}>
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
              size="medium"
            >
              AGREGAR NÚMERO
            </Button>
          </Box>
        </FormSection>

        {/* Sección de Clasificación de la Demanda */}
        <FormSection title="Clasificación de la Demanda">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="ambito_vulneracion"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.ambito_vulneracion || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.ambito_vulneracion?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ámbito de Vulneración"
                          required
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>

            {/* NOTE: objetivo_de_demanda is now selected in Step 0 (ObjetivoSelectionStep) */}
            {/* CARGA_OFICIOS has its own specialized form (CargaOficiosForm) */}
          </Grid>
        </FormSection>

        {/* Sección de Motivos de Intervención */}
        <FormSection title="Principal Motivo de Intervención">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="motivo_ingreso"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.categoria_motivo || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.categoria_motivo?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Presunto motivo de Intervención"
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="submotivo_ingreso"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const filteredSubmotivos = dropdownData.categoria_submotivo?.filter(
                    (submotivo: any) => submotivo.motivo === selectedMotivo,
                  )

                  return (
                    <FormControl fullWidth error={!!error}>
                      <Autocomplete
                        disabled={readOnly}
                        options={filteredSubmotivos || []}
                        getOptionLabel={(option: any) => option.nombre || ""}
                        value={filteredSubmotivos?.find((item: any) => item.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Presunto submotivo de intervención"
                            error={!!error}
                            helperText={error?.message}
                            size="medium"
                          />
                        )}
                        size="medium"
                      />
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Zona de Asignación */}
        <FormSection title="Zona de asignación de la demanda">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="zona"
                rules={{ required: "Este campo es obligatorio" }}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={dropdownData.zonas || []}
                      getOptionLabel={(option: any) => option.nombre || ""}
                      value={dropdownData.zonas?.find((item: any) => item.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Zona a la cual se le asignará la demanda"
                          required
                          error={!!error}
                          helperText={error?.message}
                          size="medium"
                        />
                      )}
                      size="medium"
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Sección de Localización */}
        <FormSection title="Datos de Localización del grupo familiar">
          <LocalizacionFields control={control} prefix="localizacion" dropdownData={dropdownData} readOnly={readOnly} />
        </FormSection>

        {/* Sección de Archivos Adjuntos */}
        <FormSection title="Archivos Adjuntos">
          <FileUploadSection control={control} readOnly={readOnly} openPdfUrl={openPdfUrl} />
        </FormSection>

        {/* Sección de Observaciones */}
        <FormSection title="Observaciones" collapsible={true}>
          <Grid container spacing={3}>
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
                    size="medium"
                    placeholder="Ingrese cualquier información adicional relevante para esta demanda..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

      </Box>
      {/* REG-01: Notification for vinculacion results - now works globally with VinculosManager in MultiStepForm */}
      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
        onVincularLegajo={handleVincularLegajo}
      />

      {/* PDF Viewer Modal */}
      {PdfModal}
    </>
  )
}

export default Step1Form
