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
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { AttachFile, Download, CloudUpload } from "@mui/icons-material"
import { create, get } from "@/app/api/apiService"
import type { Actividad, ActividadTipo } from "@/types/actividad"

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
  const [actividades, setActividades] = useState<ActividadResponse[]>([])
  const [actividadTipos, setActividadTipos] = useState<ActividadTipo[]>([])
  const [instituciones, setInstituciones] = useState<{ id: number; nombre: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    fetchActividadTipos()
    fetchActividades()
    fetchInstituciones()
  }, [])

  const fetchActividadTipos = async () => {
    try {
      const data = await get<ActividadTipo[]>("actividad-tipo/")
      setActividadTipos(data)
    } catch (err) {
      console.error("Error fetching activity types:", err)
      setError("Error al cargar los tipos de actividad")
    }
  }

  const fetchActividades = async () => {
    try {
      // Get activities with the new response format
      const actividadesData = await get<ActividadResponse[]>(`actividad/?demanda=${demandaId}`)
      setActividades(actividadesData)
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("Error al cargar las actividades")
    }
  }

  const fetchInstituciones = async () => {
    try {
      const data = await get<{ id: number; nombre: string }[]>("actividad-dropdown/")
      setInstituciones(data.instituciones_actividad)
    } catch (err) {
      console.error("Error fetching instituciones:", err)
      setError("Error al cargar las instituciones")
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files)])
    }
  }

  const handleFileDrop = (files: FileList) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(files)])
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set isDragging to false if we're leaving the drop area (not a child element)
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDownloadTemplate = () => {
    if (!selectedTipoNombre) {
      setSnackbar({
        open: true,
        message: "Por favor seleccione un tipo de actividad primero",
        severity: "error",
      })
      return
    }

    const templateContent =
      `Modelo de ${selectedTipoNombre}\n\n` +
      `Fecha: ${new Date().toLocaleDateString()}\n` +
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
    setError(null)

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

      await create<Actividad>("actividad", formDataToSend)
      await fetchActividades()
      reset()
      setSelectedFiles([])
      setSnackbar({ open: true, message: "Actividad registrada con éxito", severity: "success" })
    } catch (err: any) {
      console.error("Error creating activity:", err)
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([_, messages]) => `${messages}`)
          .join("\n")
        setSnackbar({ open: true, message: errorMessages || "Error al registrar la actividad", severity: "error" })
      } else {
        setSnackbar({ open: true, message: "Error al registrar la actividad", severity: "error" })
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
                renderInput={(params) => <TextField {...params} fullWidth />}
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
                    {tipo.nombre} {tipo.remitir_a_jefe && " (Remitir a Jefe)"}
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

        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
            accept="*/*"
          />

          <Paper
            ref={dropAreaRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              p: 3,
              border: "2px dashed",
              borderColor: isDragging ? "primary.main" : "divider",
              borderRadius: 2,
              backgroundColor: isDragging ? "rgba(25, 118, 210, 0.04)" : "background.paper",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.light",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Arrastra y suelta archivos aquí
            </Typography>
            <Typography variant="body2" color="text.secondary">
              o haz clic para seleccionar archivos
            </Typography>
          </Paper>
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {selectedFiles.length} archivo(s) seleccionado(s):
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {selectedFiles.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.5,
                    "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <AttachFile sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }} />
                    <Typography variant="body2" noWrap title={file.name}>
                      {file.name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                  >
                    Eliminar
                  </Button>
                </Box>
              ))}
            </Paper>
          </Box>
        )}

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
                        - {actividad.tipo.nombre}
                      </Typography>
                      {" — "}
                      {actividad.institucion.nombre}
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
                                  onClick={() =>
                                    window.open(
                                      `https://web-production-c6370.up.railway.app${adjunto.archivo}`,
                                      "_blank",
                                    )
                                  }
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
