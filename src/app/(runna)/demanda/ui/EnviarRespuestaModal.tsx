"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Chip,
  Autocomplete,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MessageIcon from "@mui/icons-material/Message"
import { get, create } from "@/app/api/apiService"
import { CloudUpload } from "@mui/icons-material"

// URL base para los archivos
const BASE_URL = "https://web-runna-v2legajos.up.railway.app"

interface Respuesta {
  id: number
  fecha_y_hora: string
  to: string[]
  mensaje: string
  asunto: string
  institucion: string
  demanda: number
  adjuntos?: Array<{ archivo: string }>
  etiqueta?: number
}

interface RespuestaEtiqueta {
  id: number
  nombre: string
}

const respuestaSchema = z.object({
  to: z.string().min(1, { message: "Este campo es requerido" }),
  institucion: z.string().min(1, { message: "Este campo es requerido" }),
  asunto: z.string().min(1, { message: "Este campo es requerido" }),
  mensaje: z.string().min(1, { message: "Este campo es requerido" }),
  etiqueta: z.number().optional(),
})

type RespuestaFormData = z.infer<typeof respuestaSchema>

interface EnviarRespuestaFormProps {
  demandaId: number
}

export function EnviarRespuestaForm({ demandaId }: EnviarRespuestaFormProps) {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [etiquetas, setEtiquetas] = useState<RespuestaEtiqueta[]>([])
  const [selectedEtiqueta, setSelectedEtiqueta] = useState<RespuestaEtiqueta | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filterSubject, setFilterSubject] = useState("")
  const [filterEtiqueta, setFilterEtiqueta] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
      e.dataTransfer.clearData()
    }
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespuestaFormData>({
    resolver: zodResolver(respuestaSchema),
    defaultValues: {
      to: "",
      institucion: "",
      asunto: "",
      mensaje: "",
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
      // Reset the input value so the same file can be selected again if removed
      event.target.value = ""
    }
  }

  useEffect(() => {
    fetchRespuestas()
    fetchEtiquetas()
  }, [])

  const fetchRespuestas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await get<Respuesta[]>(`respuesta/?demanda=${demandaId}`)
      setRespuestas(data)
    } catch (err) {
      console.error("Error fetching respuestas:", err)
      setError("Error al cargar las respuestas")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEtiquetas = async () => {
    try {
      const data = await get<RespuestaEtiqueta[]>("respuesta-etiqueta/")
      setEtiquetas(data)
    } catch (err) {
      console.error("Error fetching etiquetas:", err)
    }
  }

  const onSubmit = async (data: RespuestaFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData()

      // Parse email fields as arrays
      const toEmails = data.to
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== "")

      // Add all form fields
      formData.append("to", JSON.stringify(toEmails))
      formData.append("asunto", data.asunto)
      formData.append("mensaje", data.mensaje)
      formData.append("institucion", data.institucion)
      formData.append("demanda", demandaId.toString())

      if (selectedEtiqueta) {
        formData.append("etiqueta", selectedEtiqueta.id.toString())
      }

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append(`adjuntos[${index}]archivo`, file)
      })

      // Use the create method from apiService instead of axios directly
      await create<Respuesta>("respuesta", formData as any, true, "Respuesta enviada con éxito")

      reset()
      setSelectedFiles([])
      setSelectedEtiqueta(null)
      await fetchRespuestas()
      setSnackbar({ open: true, message: "Respuesta enviada con éxito", severity: "success" })
    } catch (err) {
      console.error("Error submitting respuesta:", err)
      setError("Error al enviar la respuesta")
      setSnackbar({
        open: true,
        message: "Error al enviar la respuesta. Por favor, intente nuevamente.",
        severity: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener la URL completa de un archivo
  const getFullFileUrl = (filePath: string) => {
    if (filePath.startsWith("http")) {
      return filePath
    }
    return `${BASE_URL}${filePath}`
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Controller
          name="to"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Para (To)"
              fullWidth
              error={!!errors.to}
              helperText={errors.to?.message || "Ingrese correos separados por comas"}
            />
          )}
        />
        <Controller
          name="institucion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Institución"
              fullWidth
              error={!!errors.institucion}
              helperText={errors.institucion?.message}
            />
          )}
        />
        <Controller
          name="asunto"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Asunto"
              fullWidth
              error={!!errors.asunto}
              helperText={errors.asunto?.message}
            />
          )}
        />
        <Controller
          name="mensaje"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mensaje"
              multiline
              rows={4}
              fullWidth
              error={!!errors.mensaje}
              helperText={errors.mensaje?.message}
            />
          )}
        />

        {/* Etiquetas section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Etiqueta
          </Typography>
          <Autocomplete
            id="etiqueta-select"
            options={etiquetas}
            getOptionLabel={(option) => option.nombre}
            value={selectedEtiqueta}
            onChange={(_, newValue) => {
              setSelectedEtiqueta(newValue)
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Seleccionar etiqueta" placeholder="Buscar etiqueta" />
            )}
          />
        </Box>

        {/* File upload section with drag and drop */}
        <Box sx={{ mb: 2 }}>
          <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} ref={fileInputRef} />

          <Paper
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
              mb: 2,
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {selectedFiles.length} archivo(s) seleccionado(s):
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newFiles = [...selectedFiles]
                      newFiles.splice(index, 1)
                      setSelectedFiles(newFiles)
                    }}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Button type="submit" variant="contained" startIcon={<MessageIcon />} disabled={isLoading} sx={{ mt: 2 }}>
          Enviar Respuesta
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Historial de Respuestas
        </Typography>

        {/* Filter by subject */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por asunto"
            variant="outlined"
            size="small"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            sx={{ width: 300 }}
          />

          <Autocomplete
            id="filter-etiqueta"
            options={etiquetas}
            getOptionLabel={(option) => option.nombre}
            value={etiquetas.find((e) => e.id === filterEtiqueta) || null}
            onChange={(_, newValue) => {
              setFilterEtiqueta(newValue ? newValue.id : null)
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" size="small" label="Filtrar por etiqueta" sx={{ width: 250 }} />
            )}
            sx={{ flexShrink: 0 }}
          />

          {(filterSubject || filterEtiqueta) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setFilterSubject("")
                setFilterEtiqueta(null)
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={respuestas.filter((r) => {
                const matchesSubject = filterSubject
                  ? r.asunto.toLowerCase().includes(filterSubject.toLowerCase())
                  : true
                const matchesEtiqueta = filterEtiqueta ? r.etiqueta === filterEtiqueta : true
                return matchesSubject && matchesEtiqueta
              })}
              columns={[
                {
                  field: "fecha_y_hora",
                  headerName: "Fecha y Hora",
                  width: 180,
                  valueFormatter: (params) => {
                    if (!params.value || typeof params.value !== "string") return "Fecha inválida"

                    let dateString = params.value

                    // Si viene con microsegundos extra, recortarlos a 3 dígitos
                    // Esto convierte, por ejemplo, 2025-03-19T18:06:55.787656Z -> 2025-03-19T18:06:55.787Z
                    // de modo que new Date(...) funcione en cualquier entorno.
                    const match = dateString.match(/^(.+\.\d{3})\d*(Z)$/)
                    if (match) {
                      dateString = match[1] + match[2] // recorta a 3 dígitos
                    }

                    try {
                      const date = new Date(dateString)
                      if (isNaN(date.getTime())) {
                        console.error("Fecha inválida:", params.value)
                        return "Fecha inválida"
                      }
                      // Formatear en español
                      return date.toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    } catch (error) {
                      console.error("Error al formatear fecha:", error, params.value)
                      return "Fecha inválida"
                    }
                  },
                },
                {
                  field: "to",
                  headerName: "Para",
                  width: 200,
                  align: "center",
                  headerAlign: "center",
                  renderCell: (params) => {
                    const emails = params.value
                    if (!emails || !Array.isArray(emails) || emails.length === 0) {
                      return "-"
                    }
                    return (
                      <Box
                        sx={{
                          width: "100%",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {emails.join(", ")}
                        </Typography>
                      </Box>
                    )
                  },
                },

                { field: "institucion", headerName: "Institución", width: 150 },
                { field: "asunto", headerName: "Asunto", width: 150 },
                { field: "mensaje", headerName: "Mensaje", width: 300 },
                {
                  field: "adjuntos",
                  headerName: "Adjuntos",
                  width: 180,
                  align: "center",
                  headerAlign: "center",
                  renderCell: (params) => {
                    const adjuntos = params.value as Array<{ archivo: string }> | undefined
                    if (!adjuntos || adjuntos.length === 0) return null

                    return (
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center", // Para centrar horizontalmente
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {adjuntos.map((adjunto, idx) => {
                          const fileName = adjunto.archivo.split("/").pop() || "archivo"
                          return (
                            <Chip
                              key={idx}
                              label={fileName}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(getFullFileUrl(adjunto.archivo), "_blank")
                              }}
                            />
                          )
                        })}
                      </Box>
                    )
                  },
                },

                {
                  field: "etiqueta",
                  headerName: "Etiqueta",
                  width: 150,
                  valueGetter: (params) => {
                    const etiquetaId = params.value as number | undefined
                    if (!etiquetaId) return ""
                    const etiqueta = etiquetas.find((e) => e.id === etiquetaId)
                    return etiqueta ? etiqueta.nombre : `ID: ${etiquetaId}`
                  },
                  renderCell: (params) => {
                    const etiquetaId = params.row.etiqueta as number | undefined
                    if (!etiquetaId) return null
                    const etiqueta = etiquetas.find((e) => e.id === etiquetaId)
                    return etiqueta ? (
                      <Chip label={etiqueta.nombre} size="small" />
                    ) : (
                      <Chip label={`ID: ${etiquetaId}`} size="small" />
                    )
                  },
                },
              ]}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 },
                },
              }}
              disableRowSelectionOnClick
              autoHeight
            />
          </Paper>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

