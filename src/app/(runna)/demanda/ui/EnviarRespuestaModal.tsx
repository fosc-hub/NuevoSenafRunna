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
  Tooltip,
  Autocomplete,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import MessageIcon from "@mui/icons-material/Message"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { get } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"

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
      to: "",
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

      // Send the request
      await axiosInstance.post("respuesta/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

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
                      const date = new Date(params.value)
                      return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleString()
                    } catch (error) {
                      return "Fecha inválida"
                    }
                  },
                },
                {
                  field: "to",
                  headerName: "Para",
                  width: 200,
                  valueFormatter: (params) => {
                    const emails = params.value as string[] | undefined
                    return emails ? emails.join(", ") : ""
                  },
                },
                { field: "institucion", headerName: "Institución", width: 150 },
                { field: "asunto", headerName: "Asunto", width: 150 },
                { field: "mensaje", headerName: "Mensaje", width: 300 },
                {
                  field: "adjuntos",
                  headerName: "Adjuntos",
                  width: 150,
                  renderCell: (params) => {
                    const adjuntos = params.value as Array<{ archivo: string }> | undefined
                    return adjuntos && adjuntos.length > 0 ? (
                      <Tooltip title={adjuntos.map((a) => a.archivo.split("/").pop()).join(", ")}>
                        <Chip icon={<AttachFileIcon />} label={adjuntos.length} size="small" variant="outlined" />
                      </Tooltip>
                    ) : null
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

