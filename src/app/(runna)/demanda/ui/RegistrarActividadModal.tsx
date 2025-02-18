"use client"

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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import CloseIcon from "@mui/icons-material/Close"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { create, get } from "@/app/api/apiService"
import type { Actividad, ActividadTipo } from "@/types/actividad"

interface RegistrarActividadModalProps {
  isOpen: boolean
  onClose: () => void
  demandaId: number
}

const actividadSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.number().min(1, "El tipo de actividad es requerido"),
  institucion: z.number().min(1, "La institución es requerida"),
})

type ActividadFormData = z.infer<typeof actividadSchema>

const columns: GridColDef[] = [
  {
    field: "fecha_y_hora",
    headerName: "Fecha y Hora",
    width: 200,
    valueFormatter: (params) => new Date(params.value).toLocaleString("es-ES"),
  },
  { field: "descripcion", headerName: "Descripción", width: 300 },
  {
    field: "tipo",
    headerName: "Tipo",
    width: 150,
    valueGetter: (params) => params.row?.tipoNombre || "Desconocido",
  },
  {
    field: "institucion",
    headerName: "Institución",
    width: 200,
    valueGetter: (params) => params.row?.institucionNombre || "Desconocida",
  },
]

export function RegistrarActividadModal({ isOpen, onClose, demandaId }: RegistrarActividadModalProps) {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [actividadTipos, setActividadTipos] = useState<ActividadTipo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActividadFormData>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toISOString().split("T")[1].substring(0, 5),
      tipo: 0,
      institucion: 0,
      descripcion: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchActividadTipos()
      fetchActividades()
    }
  }, [isOpen])

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
      const data = await get<Actividad[]>(`actividad/?demanda=${demandaId}`)
      setActividades(data)
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("Error al cargar las actividades")
    }
  }

  const onSubmit = async (formData: ActividadFormData) => {
    setIsLoading(true)
    setError(null)

    // Ensure proper date format with timezone
    const fecha_y_hora = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString()

    console.log("Submitting data:", {
      fecha_y_hora,
      descripcion: formData.descripcion,
      demanda: demandaId,
      tipo: formData.tipo,
      institucion: formData.institucion,
    })

    if (!formData.descripcion || !fecha_y_hora || !demandaId) {
      console.error("Missing required fields:", formData)
      return
    }

    try {
      await create<Actividad>("actividad/", {
        fecha_y_hora,
        descripcion: formData.descripcion,
        demanda: demandaId,
        tipo: formData.tipo,
        institucion: formData.institucion,
      })

      await fetchActividades()
      reset()
      setSnackbar({ open: true, message: "Actividad registrada con éxito", severity: "success" })
    } catch (err: any) {
      console.error("Error creating activity:", err)
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data).map(([_, messages]) => `${messages}`).join("\n")
        setSnackbar({ open: true, message: errorMessages || "Error al registrar la actividad", severity: "error" })
      } else {
        setSnackbar({ open: true, message: "Error al registrar la actividad", severity: "error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Registrar Actividad</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Controller
                name="fecha"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Fecha"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString().split("T")[0] || "")}
                  />
                )}
              />
              <Controller
                name="hora"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Hora"
                    value={field.value ? new Date(`2000-01-01T${field.value}`) : null}
                    onChange={(time) => field.onChange(time?.toISOString().split("T")[1].substring(0, 5) || "")}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isLoading}>Registrar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  )
}
