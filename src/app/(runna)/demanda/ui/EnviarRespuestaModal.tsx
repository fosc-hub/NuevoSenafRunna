"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import MessageIcon from "@mui/icons-material/Message"
import { create, get } from "@/app/api/apiService"

interface Respuesta {
  id: number
  fecha_y_hora: string
  mail: string
  mensaje: string
  institucion: string
  demanda: number
}

interface EnviarRespuestaModalProps {
  isOpen: boolean
  onClose: () => void
  demandaId: number
}

const respuestaSchema = z.object({
  mail: z.string().email({ message: "Correo electrónico inválido" }),
  institucion: z.string().min(1, { message: "Este campo es requerido" }),
  mensaje: z.string().min(1, { message: "Este campo es requerido" }),
})

type RespuestaFormData = z.infer<typeof respuestaSchema>

export function EnviarRespuestaModal({ isOpen, onClose, demandaId }: EnviarRespuestaModalProps) {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
      mensaje: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchRespuestas()
    }
  }, [isOpen])

  const fetchRespuestas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await get<Respuesta[]>(`respuesta/?demanda=${demandaId}`)
      setRespuestas(data)
    } catch (err) {
      console.error("Error fetching respuestas:", err)
      setError("Error al cargar las respuestas. Por favor, intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: RespuestaFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await create<Respuesta>("respuesta/", {
        ...data,
        demanda: demandaId,
      })
      reset()
      await fetchRespuestas() // Refresh the list after successful submission
      setSnackbar({ open: true, message: "Respuesta enviada con éxito", severity: "success" })
    } catch (err) {
      console.error("Error submitting respuesta:", err)
      setError("Error al enviar la respuesta. La respuesta podría haberse guardado. Actualizando la lista...")
      await fetchRespuestas() // Attempt to refresh the list even if there was an error
      setSnackbar({
        open: true,
        message: "Error al enviar la respuesta. Por favor, verifique si se guardó.",
        severity: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Enviar Respuesta
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}
          >
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
          </Box>
          <Typography variant="h6" gutterBottom>
            Historial de Respuestas
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <List sx={{ overflowY: "auto", maxHeight: "40vh" }}>
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} startIcon={<MessageIcon />} disabled={isLoading}>
            Enviar Respuesta
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

