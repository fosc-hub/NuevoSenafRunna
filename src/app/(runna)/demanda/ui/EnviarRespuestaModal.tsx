"use client"

import React, { useRef } from "react"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material"
import MessageIcon from "@mui/icons-material/Message"
import { create, get } from "@/app/api/apiService"
import { Upload } from "lucide-react"

interface Respuesta {
  id: number
  fecha_y_hora: string
  mail: string
  mensaje: string
  asunto: string
  institucion: string
  demanda: number
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      await create<Respuesta>("respuesta", {
        ...data,
        demanda: demandaId,
      })
      reset()
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} ref={fileInputRef} />
          <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
            Subir Archivos
          </Button>
          {selectedFiles.length > 0 && (
            <Typography variant="body2">{selectedFiles.length} archivo(s) seleccionado(s)</Typography>
          )}
        </Box>
        <Button type="submit" variant="contained" startIcon={<MessageIcon />} disabled={isLoading}>
          Enviar Respuesta
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Historial de Respuestas
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <List sx={{ width: "100%", bgcolor: "background.paper", maxHeight: "400px", overflow: "auto" }}>
            {respuestas.map((respuesta, index) => (
              <React.Fragment key={respuesta.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={respuesta.mail}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {new Date(respuesta.fecha_y_hora).toLocaleString()} - {respuesta.institucion}
                        </Typography>
                        {" — " + respuesta.mensaje}
                      </>
                    }
                  />
                </ListItem>
                {index < respuestas.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
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

