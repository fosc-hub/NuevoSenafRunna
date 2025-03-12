"use client"

import type React from "react"
import { useRef } from "react"
import { useState, useEffect } from "react"
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
  Tooltip,
  Autocomplete,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MessageIcon from "@mui/icons-material/Message"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { create, get, uploadFiles } from "@/app/api/apiService"

interface Respuesta {
  id: number
  fecha_y_hora: string
  mail: string
  mensaje: string
  asunto: string
  institucion: string
  demanda: number
  attachments?: string[] // URLs to attachments
  tags?: string[] // Optional tags
}

const respuestaSchema = z.object({
  mail: z.string().email({ message: "Correo electrónico inválido" }),
  institucion: z.string().min(1, { message: "Este campo es requerido" }),
  asunto: z.string().min(1, { message: "Este campo es requerido" }),
  mensaje: z.string().min(1, { message: "Este campo es requerido" }),
})

type RespuestaFormData = z.infer<typeof respuestaSchema>

interface EnviarRespuestaFormProps {
  demandaId: number
}

export function EnviarRespuestaForm({ demandaId }: EnviarRespuestaFormProps) {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Urgente",
    "Pendiente",
    "Completado",
    "Alta prioridad",
    "Baja prioridad",
    "Requiere seguimiento",
    "Documentación incompleta",
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filterSubject, setFilterSubject] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespuestaFormData>({
    resolver: zodResolver(respuestaSchema),
    defaultValues: {
      mail: "",
      institucion: "",
      asunto: "",
      mensaje: "",
    },
  })
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }
  useEffect(() => {
    fetchRespuestas()
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

  const onSubmit = async (data: RespuestaFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      // Handle file uploads first if there are any
      const attachmentUrls: string[] = []

      if (selectedFiles.length > 0) {
        try {
          // Upload files and get URLs
          const uploadedFiles = await uploadFiles(selectedFiles)
          attachmentUrls.push(...uploadedFiles.map((file) => file.url))
        } catch (uploadError) {
          console.error("Error uploading files:", uploadError)
          setError("Error al subir los archivos adjuntos")
          setSnackbar({
            open: true,
            message: "Error al subir los archivos. Por favor, intente nuevamente.",
            severity: "error",
          })
          setIsLoading(false)
          return
        }
      }

      await create<Respuesta>("respuesta", {
        ...data,
        demanda: demandaId,
        attachments: attachmentUrls,
        tags: tags,
      })

      reset()
      setSelectedFiles([])
      setTags([])
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

  return (
    <Box sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Controller
          name="mail"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Correo Electrónico"
              fullWidth
              error={!!errors.mail}
              helperText={errors.mail?.message}
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

        {/* Tags section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Etiquetas
          </Typography>
          <Autocomplete
            multiple
            id="tags-standard"
            options={availableTags}
            value={tags}
            onChange={(event, newValue) => {
              // Check if the last value is a string (new tag)
              if (newValue.length > 0 && typeof newValue[newValue.length - 1] === "string") {
                // It's a new tag
                const newTag = newValue[newValue.length - 1] as string
                // Add to available tags if it doesn't exist
                if (!availableTags.includes(newTag)) {
                  setAvailableTags([...availableTags, newTag])
                }
              }
              setTags(newValue)
            }}
            freeSolo
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Seleccionar etiquetas"
                placeholder="Buscar o crear etiquetas"
                helperText="Puedes buscar etiquetas existentes o crear nuevas"
              />
            )}
          />
        </Box>

        {/* File upload section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} ref={fileInputRef} />
          <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current?.click()}>
            Adjuntar Documentos
          </Button>
          {selectedFiles.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2">{selectedFiles.length} archivo(s) seleccionado(s):</Typography>
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
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Filtrar por asunto"
            variant="outlined"
            size="small"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            sx={{ width: 300 }}
          />
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
              rows={respuestas.filter((r) =>
                filterSubject ? r.asunto.toLowerCase().includes(filterSubject.toLowerCase()) : true,
              )}
              columns={[
                {
                  field: "fecha_y_hora",
                  headerName: "Fecha y Hora",
                  width: 180,
                  valueFormatter: (params) => {
                    try {
                      // Parse the ISO date string
                      const date = new Date(params.value)
                      // Check if date is valid
                      if (isNaN(date.getTime())) {
                        return "Fecha inválida"
                      }
                      // Format the date
                      return date.toLocaleString()
                    } catch (error) {
                      console.error("Error formatting date:", error)
                      return "Fecha inválida"
                    }
                  },
                },
                { field: "mail", headerName: "Correo", width: 200 },
                { field: "institucion", headerName: "Institución", width: 150 },
                { field: "asunto", headerName: "Asunto", width: 150 },
                { field: "mensaje", headerName: "Mensaje", width: 300 },
                {
                  field: "attachments",
                  headerName: "Adjuntos",
                  width: 150,
                  renderCell: (params) => {
                    const attachments = params.value as string[] | undefined
                    return attachments && attachments.length > 0 ? (
                      <Tooltip title={attachments.map((a) => a.split("/").pop()).join(", ")}>
                        <Chip icon={<AttachFileIcon />} label={attachments.length} size="small" variant="outlined" />
                      </Tooltip>
                    ) : null
                  },
                },
                {
                  field: "tags",
                  headerName: "Etiquetas",
                  width: 200,
                  renderCell: (params) => {
                    const tags = params.value as string[] | undefined
                    return tags && tags.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Box>
                    ) : null
                  },
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
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

