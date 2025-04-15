"use client"
import { useState, useEffect } from "react"
import {
  CircularProgress,
  Typography,
  IconButton,
  Box,
  Alert,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import AddIcon from "@mui/icons-material/Add"
import DescriptionIcon from "@mui/icons-material/Description"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { useRouter } from "next/navigation"
import { getLegajoById, type Legajo } from "../../../legajo-mesa/mock-data/legajos-service"

interface MedidaDetailProps {
  params: {
    id: string
    medidaId?: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

// Mock data for the measure details
const getMedidaData = (legajoId: string, medidaId?: string) => {
  // In a real app, you would fetch this data from an API
  return {
    id: medidaId || "123456",
    tipo: "MPI",
    numero: "123456",
    persona: {
      nombre: "Martínez Alejandro",
      dni: "44890094",
    },
    fecha_apertura: "09/09/23",
    ubicacion: "Institución Nro. 1",
    direccion: "",
    juzgado: "",
    nro_sac: "",
    origen_demanda: "",
    motivo: "",
    actores_intervinientes: "",
    equipos: "",
    articulacion: "",
    etapas: {
      apertura: {
        fecha: "09/09/23",
        estado: "",
        equipo: "",
      },
      plan_accion: [
        {
          estado: true,
          tarea: "MPI",
          fecha: "12/08/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
        {
          estado: true,
          tarea: "MPI",
          fecha: "12/08/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
        {
          estado: false,
          tarea: "MPI",
          fecha: "12/09/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
      ],
      historial_seguimiento: [
        {
          fecha: "2 JUL 24",
          descripcion: "Se registra denuncia anónima",
          hora: "11:45 am",
        },
        {
          fecha: "3 JUL 24",
          descripcion: "Envío de respuesta",
          hora: "12:40 am",
        },
        {
          fecha: "4 JUL 24",
          descripcion: "Se adjunta FotoDNI.pdf",
          hora: "10:34 am",
        },
        {
          fecha: "4 JUL 24",
          descripcion: "Se adjunta PartidaNacimiento.pdf",
          hora: "12:45 am",
        },
      ],
      cierre: {
        fecha: "09/09/23",
        estado: "",
        equipo: "",
      },
    },
    ultimo_informe: {
      fecha: "12/09/21",
      autor: "Juzgado nro. 2, Córdoba",
      archivo: "Informe.pdf",
    },
  }
}

export default function MedidaDetail({ params, onClose, isFullPage = false }: MedidaDetailProps) {
  const [medidaData, setMedidaData] = useState<any>(null)
  const [legajoData, setLegajoData] = useState<Legajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = () => {
      if (params.id) {
        try {
          setIsLoading(true)
          // Load legajo data
          const legajo = getLegajoById(params.id)
          if (legajo) {
            setLegajoData(legajo)

            // Load medida data
            const medida = getMedidaData(params.id, params.medidaId)
            setMedidaData(medida)
          } else {
            setError(`No se encontró el legajo con ID ${params.id}`)
          }
        } catch (err) {
          console.error("Error loading data:", err)
          setError("Error al cargar los datos. Por favor, intente nuevamente.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [params.id, params.medidaId])

  const handleAddTask = () => {
    console.log("Add task clicked")
    // Implement the action for adding a task
  }

  const handleCloseMeasure = () => {
    console.log("Close measure clicked")
    // Implement the action for closing the measure
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!medidaData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información para esta medida.
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...(isFullPage && {
          display: "flex",
          justifyContent: "center",
        }),
      }}
    >
      <Box
        sx={{
          p: 3,
          ...(isFullPage && {
            maxWidth: "1200px",
            width: "100%",
          }),
        }}
      >
        {!isFullPage && onClose && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mb: 4,
            p: 3,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ display: "flex", borderLeft: "6px solid #2196f3", pl: 3, py: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {medidaData.tipo}: {medidaData.numero}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de apertura: {medidaData.fecha_apertura}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Origen de la demanda: {medidaData.origen_demanda || "No especificado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Motivo: {medidaData.motivo || "No especificado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actores intervinientes: {medidaData.actores_intervinientes || "No especificado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Equipos: {medidaData.equipos || "No especificado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Articulación: {medidaData.articulacion || "No especificado"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { md: "right" } }}>
                  <Typography variant="body2" color="text.secondary">
                    {medidaData.persona.nombre} | DNI {medidaData.persona.dni}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ubicación del NNyA: {medidaData.ubicacion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dirección: {medidaData.direccion || "No especificada"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Juzgado: {medidaData.juzgado || "No especificado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nro. SAC: {medidaData.nro_sac || "No especificado"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button endIcon={<ArrowForwardIcon />} size="small" sx={{ textTransform: "none" }}>
                    Ver todos los datos personales
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Etapas de la medida
        </Typography>

        <Grid container spacing={3}>
          {/* Apertura Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Apertura
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {medidaData.etapas.apertura.fecha}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Estado:</strong> {medidaData.etapas.apertura.estado || "No especificado"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Equipo:</strong> {medidaData.etapas.apertura.equipo || "No especificado"}
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<DescriptionIcon />}
                sx={{
                  borderRadius: 50,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Formulario
              </Button>
            </Paper>
          </Grid>

          {/* Plan de acción Section */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Plan de acción
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddTask}
                  sx={{
                    borderRadius: 50,
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  Añadir tarea
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Estado</TableCell>
                      <TableCell>Tarea</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Objetivo</TableCell>
                      <TableCell>Plazo</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medidaData.etapas.plan_accion.map((task: any, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          {task.estado ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell>{task.tarea}</TableCell>
                        <TableCell>{task.fecha}</TableCell>
                        <TableCell>{task.objetivo}</TableCell>
                        <TableCell>{task.plazo}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Historial de seguimiento Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Historial de seguimiento
              </Typography>

              <List sx={{ p: 0 }}>
                {medidaData.etapas.historial_seguimiento.slice(0, 4).map((item: any, index: number) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EventNoteIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.fecha}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {item.descripcion}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.hora}
                          </Typography>
                        </>
                      }
                    />
                    {item.descripcion.includes("adjunta") && (
                      <IconButton size="small" sx={{ color: "primary.main" }}>
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button endIcon={<ArrowForwardIcon />} size="small" color="primary" sx={{ textTransform: "none" }}>
                  Ver más
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Cierre Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Cierre
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {medidaData.etapas.cierre.fecha}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Estado:</strong> {medidaData.etapas.cierre.estado || "No especificado"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Equipo:</strong> {medidaData.etapas.cierre.equipo || "No especificado"}
              </Typography>

              <Button
                variant="contained"
                color="error"
                onClick={handleCloseMeasure}
                sx={{
                  borderRadius: 50,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Cerrar medida
              </Button>
            </Paper>
          </Grid>

          {/* Último informe Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Último informe
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {medidaData.ultimo_informe.fecha}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Autor:</strong> {medidaData.ultimo_informe.autor}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{medidaData.ultimo_informe.archivo}</Typography>
                <IconButton size="small" sx={{ ml: "auto" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
