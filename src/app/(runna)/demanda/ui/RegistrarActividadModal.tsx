"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material"
import { toast } from "react-toastify"
import { showErrorToast } from "@/utils/showErrorToast"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { AttachFile, Download, CloudUpload } from "@mui/icons-material"
import { create } from "@/app/api/apiService"
import { formatDateLocaleAR } from "@/utils/dateUtils"
import { FileUploadSection, type FileItem } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"
import { useCatalogData, useApiQuery, extractArray } from "@/hooks/useApiQuery"
import { usePdfViewer } from "@/hooks"
import { isPdfFile } from "@/utils/pdfUtils"
// Types defined locally since @/types/actividad doesn't exist

// Update the Actividad type to match the new API response structure
type Adjunto = {
  archivo: string
}

// Updated type definitions to match the new API response format
type TipoActividad = {
  id: number
  nombre: string
  modelos?: any[]
  remitir_a_jefe: boolean
}

type Institucion = {
  id: number
  nombre: string
}

// Update the Actividad interface to match the new API response structure
interface ActividadResponse {
  id: number
  adjuntos: Adjunto[]
  fecha_y_hora: string
  fecha_y_hora_manual: string
  descripcion: string
  demanda: number
  tipo: TipoActividad
  institucion: Institucion
}

// Define the missing types
type ActividadTipo = TipoActividad
type Actividad = ActividadResponse

const actividadSchema = z.object({
  fecha_y_hora: z.date().min(new Date(1900, 0, 1), "La fecha y hora es requerida"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.number().min(1, "El tipo de actividad es requerido"),
  institucion: z.number().optional(),
  archivos: z.array(z.instanceof(File)).optional(),
})

type ActividadFormData = z.infer<typeof actividadSchema>

interface RegistrarActividadFormProps {
  demandaId: number
}

export function RegistrarActividadForm({ demandaId }: RegistrarActividadFormProps) {
  // PDF Viewer hook
  const { openUrl: openPdfUrl, PdfModal } = usePdfViewer()

  // Fetch catalog data using TanStack Query
  const { data: actividadTiposData } = useCatalogData<ActividadTipo[]>("actividad-tipo/")
  const actividadTipos = extractArray(actividadTiposData)

  const { data: actividadesData, refetch: refetchActividades } = useApiQuery<ActividadResponse[]>(
    "actividad/",
    { demanda: demandaId }
  )
  const actividades = extractArray(actividadesData)

  const { data: institucionesResponse } = useCatalogData<{ instituciones_actividad: { id: number; nombre: string }[] }>(
    "actividad-dropdown/"
  )
  const instituciones = institucionesResponse?.instituciones_actividad || []

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ActividadFormData>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      fecha_y_hora: new Date(),
      tipo: 0,
      institucion: 0,
      descripcion: "",
      archivos: [],
    },
  })

  const selectedTipo = watch("tipo")
  const selectedTipoNombre = actividadTipos.find((tipo) => tipo.id === selectedTipo)?.nombre || ""

  // Convert File[] to FileItem[] for display in FileUploadSection
  const displayFiles: FileItem[] = selectedFiles.map((file, index) => ({
    id: index,
    nombre: file.name,
    tipo: file.type,
    tamano: file.size,
  }))

  // Handle file upload from FileUploadSection
  const handleFileUpload = (file: File) => {
    setSelectedFiles((prev) => [...prev, file])
  }

  // Handle file deletion from FileUploadSection
  const handleFileDelete = (fileId: number | string) => {
    const index = typeof fileId === 'number' ? fileId : Number.parseInt(fileId as string)
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDownloadTemplate = () => {
    if (!selectedTipoNombre) {
      toast.error("Por favor seleccione un tipo de actividad primero")
      return
    }

    const templateContent =
      `Modelo de ${selectedTipoNombre}\n\n` +
      `Fecha: ${formatDateLocaleAR(new Date())}\n` +
      `Tipo de Actividad: ${selectedTipoNombre}\n` +
      `Instrucciones:\n` +
      `1. ...\n` +
      `2. ...\n` +
      `3. ...`

    const blob = new Blob([templateContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `modelo_${selectedTipoNombre.toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const onSubmit = async (formData: ActividadFormData) => {
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fecha_y_hora_manual", formData.fecha_y_hora.toISOString())
      formDataToSend.append("descripcion", formData.descripcion)
      formDataToSend.append("demanda", demandaId.toString())
      formDataToSend.append("tipo", formData.tipo.toString())

      if (formData.institucion) {
        formDataToSend.append("institucion", formData.institucion.toString())
      }

      // Update file upload format to match new API structure
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`adjuntos[${index}]archivo`, file)
      })

      await create("actividad", formDataToSend)
      await refetchActividades()
      reset()
      setSelectedFiles([])
      toast.success("Actividad registrada con éxito")
    } catch (err: any) {
      console.error("Error creating activity:", err)
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([_, messages]) => `${messages}`)
          .join("\n")
        showErrorToast("Error al registrar la actividad", errorMessages || "Ocurrió un error inesperado")
      } else {
        toast.error("Error al registrar la actividad")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Controller
            name="fecha_y_hora"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Fecha y Hora"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            )}
          />
        </LocalizationProvider>

        <Controller
          name="descripcion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descripción"
              multiline
              rows={4}
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message}
            />
          )}
        />

        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.tipo}>
              <InputLabel>Tipo de Actividad</InputLabel>
              <Select {...field} label="Tipo de Actividad">
                {actividadTipos.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}{tipo.remitir_a_jefe ? " (Remitir a Jefe)" : ""}
                  </MenuItem>
                ))}
              </Select>
              {errors.tipo && <Typography color="error">{errors.tipo.message}</Typography>}
            </FormControl>
          )}
        />

        {selectedTipo > 0 && (
          <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadTemplate}>
            Descargar Modelo
          </Button>
        )}

        <Controller
          name="institucion"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.institucion}>
              <InputLabel>Institución</InputLabel>
              <Select {...field} label="Institución">
                {instituciones.map((institucion) => (
                  <MenuItem key={institucion.id} value={institucion.id}>
                    {institucion.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.institucion && <Typography color="error">{errors.institucion.message}</Typography>}
            </FormControl>
          )}
        />

        {/* File upload section */}
        <FileUploadSection
          files={displayFiles}
          onUpload={handleFileUpload}
          onDelete={handleFileDelete}
          title="Archivos Adjuntos"
          multiple={true}
          emptyMessage="No hay archivos seleccionados. Arrastra archivos o haz clic para seleccionar."
          dragDropMessage="Arrastra y suelta archivos aquí"
          uploadButtonLabel="Seleccionar archivos"
        />

        <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>
          Registrar Actividad
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Actividades Registradas
        </Typography>
        <List sx={{ width: "100%", bgcolor: "background.paper", maxHeight: "400px", overflow: "auto" }}>
          {actividades.map((actividad, index) => (
            <React.Fragment key={actividad.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1">
                      {actividad.descripcion}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {new Date(actividad.fecha_y_hora_manual).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        - {actividad.tipo?.nombre || "Sin tipo"}
                      </Typography>
                      {" — "}
                      {actividad.institucion?.nombre || "Sin institución"}
                      {actividad.adjuntos && actividad.adjuntos.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography component="span" variant="body2" color="text.primary">
                            Archivos adjuntos:
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {actividad.adjuntos.map((adjunto, idx) => (
                              <Box component="li" key={idx}>
                                <Button
                                  size="small"
                                  startIcon={<AttachFile />}
                                  onClick={() => {
                                    const fileName = adjunto.archivo.split("/").pop() || "archivo"
                                    const fileUrl = `https://web-runna-v2legajos.up.railway.app${adjunto.archivo}`
                                    if (isPdfFile(fileName)) {
                                      openPdfUrl(fileUrl, { title: "Adjunto de Actividad", fileName })
                                    } else {
                                      window.open(fileUrl, "_blank")
                                    }
                                  }}
                                  sx={{ textTransform: "none", justifyContent: "flex-start" }}
                                >
                                  {adjunto.archivo.split("/").pop()}
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < actividades.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* PDF Viewer Modal */}
      {PdfModal}
    </Box>
  )
}
