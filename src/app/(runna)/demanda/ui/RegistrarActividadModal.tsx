"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { create, get } from "@/app/api/apiService"
import type { Actividad, ActividadTipo } from "@/types/actividad"
import { AttachFile, Download, Upload } from "@mui/icons-material"

interface RegistrarActividadModalProps {
  isOpen: boolean
  onClose: () => void
  demandaId: number
}

const actividadSchema = z.object({
  fecha_y_hora: z.date().min(new Date(1900, 0, 1), "La fecha y hora es requerida"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.number().min(1, "El tipo de actividad es requerido"),
  institucion: z.number().min(1, "La institución es requerida"),
  archivos: z.array(z.instanceof(File)).optional(),
})

type ActividadFormData = z.infer<typeof actividadSchema>

const columns: GridColDef[] = [
  {
    field: "fecha_y_hora_manual",
    headerName: "Fecha y Hora",
    width: 200,
    valueFormatter: (params) => {
      try {
        return new Date(params.value).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      } catch (e) {
        return "Fecha inválida"
      }
    },
  },
  {
    field: "descripcion",
    headerName: "Descripción",
    width: 300,
  },
  {
    field: "tipoNombre",
    headerName: "Tipo",
    width: 150,
  },
  {
    field: "institucionNombre",
    headerName: "Institución",
    width: 200,
  },
  {
    field: "archivos",
    headerName: "Archivos",
    width: 150,
    renderCell: (params) => {
      if (params.row.archivos?.length > 0) {
        return (
          <IconButton size="small" onClick={() => window.open(params.row.archivos[0].url, "_blank")}>
            <AttachFile />
          </IconButton>
        )
      }
      return null
    },
  },
]

export function RegistrarActividadModal({ isOpen, onClose, demandaId }: RegistrarActividadModalProps) {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [actividadTipos, setActividadTipos] = useState<ActividadTipo[]>([])
  const [instituciones, setInstituciones] = useState<{ id: number; nombre: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (isOpen) {
      fetchActividadTipos()
      fetchActividades()
      fetchInstituciones()
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
      const [actividadesData, dropdownData] = await Promise.all([
        get<Actividad[]>(`actividad/?demanda=${demandaId}`),
        get<any>("actividad-dropdown/"),
      ])

      const activitiesWithNames = actividadesData.map((actividad) => {
        const tipo = dropdownData.tipos_actividad.find((t) => t.id === actividad.tipo)
        const institucion = dropdownData.instituciones_actividad.find((i) => i.id === actividad.institucion)

        return {
          ...actividad,
          tipoNombre: tipo?.nombre || "Desconocido",
          institucionNombre: institucion?.nombre || "Desconocida",
        }
      })

      setActividades(activitiesWithNames)
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
      setSelectedFiles(Array.from(event.target.files))
    }
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

    // Create a template file based on the selected activity type
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
      formDataToSend.append("institucion", formData.institucion.toString())

      selectedFiles.forEach((file) => {
        formDataToSend.append("archivos", file)
      })

      await create<Actividad>("actividad/", formDataToSend)
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
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Registrar Actividad</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
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
                        {tipo.nombre}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} ref={fileInputRef} />
              <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
                Subir Archivos
              </Button>
              {selectedFiles.length > 0 && (
                <Typography variant="body2">{selectedFiles.length} archivo(s) seleccionado(s)</Typography>
              )}
            </Box>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
          <Typography variant="h6" gutterBottom>
            Actividades Registradas
          </Typography>
          <DataGrid
            rows={actividades}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 100, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            autoHeight
            disableSelectionOnClick
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading} variant="contained">
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

