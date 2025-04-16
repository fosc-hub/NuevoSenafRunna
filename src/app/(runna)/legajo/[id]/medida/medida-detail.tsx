"use client"
import { useState, useEffect } from "react"
import type React from "react"
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
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import AddIcon from "@mui/icons-material/Add"
import DescriptionIcon from "@mui/icons-material/Description"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import HomeIcon from "@mui/icons-material/Home"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import DownloadIcon from "@mui/icons-material/Download"
import EditIcon from "@mui/icons-material/Edit"
import AssignmentIcon from "@mui/icons-material/Assignment"
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
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    tarea: "",
    objetivo: "",
    plazo: "",
  })
  const [activeStep, setActiveStep] = useState(1) // 0: Apertura, 1: Plan de acción, 2: Cierre
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState("")

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

            // Determine active step based on data
            if (medida.etapas.cierre.estado) {
              setActiveStep(2)
            } else if (medida.etapas.plan_accion.length > 0) {
              setActiveStep(1)
            } else {
              setActiveStep(0)
            }
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
    setOpenAddTaskDialog(true)
  }

  const handleCloseAddTaskDialog = () => {
    setOpenAddTaskDialog(false)
  }

  const handleSaveTask = () => {
    console.log("Saving new task:", newTask)
    // In a real app, you would save the task to the database
    // and then update the UI

    // Mock implementation: add task to the local state
    const updatedMedidaData = { ...medidaData }
    updatedMedidaData.etapas.plan_accion.push({
      estado: false,
      ...newTask,
      fecha: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }),
    })
    setMedidaData(updatedMedidaData)

    // Reset form and close dialog
    setNewTask({
      tarea: "",
      objetivo: "",
      plazo: "",
    })
    setOpenAddTaskDialog(false)
  }

  const handleCloseMeasure = () => {
    console.log("Close measure clicked")
    // Implement the action for closing the measure
  }

  const handleTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenAttachment = (fileName: string) => {
    setSelectedAttachment(fileName)
    setOpenAttachmentDialog(true)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando información de la medida...
        </Typography>
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
        {!isFullPage && onClose ? (
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
        ) : (
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
              <Link
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
                color="inherit"
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/")
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Inicio
              </Link>
              <Link
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
                color="inherit"
                href="/legajo-mesa"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/legajo-mesa")
                }}
              >
                Legajos
              </Link>
              <Link
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
                color="inherit"
                href={`/legajo/${params.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/legajo/${params.id}`)
                }}
              >
                Legajo {params.id}
              </Link>
              <Typography color="text.primary">
                Medida {medidaData.tipo} {medidaData.numero}
              </Typography>
            </Breadcrumbs>
          </Box>
        )}

        <Paper
          elevation={2}
          sx={{
            width: "100%",
            mb: 4,
            p: 3,
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "6px",
              backgroundColor: "#2196f3",
            },
          }}
        >
          <Box sx={{ pl: 2, py: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {medidaData.tipo}: {medidaData.numero}
                    </Typography>
                    <Chip
                      label={activeStep === 2 ? "CERRADA" : "ACTIVA"}
                      color={activeStep === 2 ? "default" : "primary"}
                      size="small"
                      sx={{ ml: 2, fontWeight: 500 }}
                    />
                  </Box>
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
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    sx={{
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
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
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                border: activeStep === 0 ? "2px solid #2196f3" : "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Apertura
                </Typography>
                {activeStep >= 0 && (
                  <Chip label="COMPLETADO" color="success" size="small" sx={{ ml: "auto", fontWeight: 500 }} />
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

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
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                Formulario
              </Button>
            </Paper>
          </Grid>

          {/* Plan de acción Section */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                border: activeStep === 1 ? "2px solid #2196f3" : "none",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Plan de acción
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddTask}
                  sx={{
                    borderRadius: 8,
                    textTransform: "none",
                    px: 2,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  Añadir tarea
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <TableContainer sx={{ maxHeight: "300px" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Estado</TableCell>
                      <TableCell>Tarea</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Objetivo</TableCell>
                      <TableCell>Plazo</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medidaData.etapas.plan_accion.map((task: any, index: number) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          backgroundColor: task.estado ? "rgba(76, 175, 80, 0.04)" : "inherit",
                        }}
                      >
                        <TableCell>
                          <Tooltip title={task.estado ? "Completada" : "Pendiente"}>
                            {task.estado ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>{task.tarea}</TableCell>
                        <TableCell>{task.fecha}</TableCell>
                        <TableCell>{task.objetivo}</TableCell>
                        <TableCell>{task.plazo}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary">
                                <DescriptionIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EventNoteIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Historial de seguimiento
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List sx={{ p: 0, maxHeight: "300px", overflow: "auto" }}>
                {medidaData.etapas.historial_seguimiento.map((item: any, index: number) => (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      py: 1,
                      borderLeft: "2px solid #2196f3",
                      pl: 2,
                      mb: 2,
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(33, 150, 243, 0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.fecha}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ backgroundColor: "#f5f5f5", px: 1, py: 0.5, borderRadius: 1 }}
                          >
                            {item.hora}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" component="span" sx={{ mt: 1, display: "block" }}>
                          {item.descripcion}
                        </Typography>
                      }
                    />
                    {item.descripcion.includes("adjunta") && (
                      <Tooltip title="Ver adjunto">
                        <IconButton
                          size="small"
                          sx={{ color: "primary.main", ml: 1 }}
                          onClick={() => handleOpenAttachment(item.descripcion.split("adjunta ")[1])}
                        >
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                ))}
              </List>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 8,
                  }}
                >
                  Agregar seguimiento
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Cierre Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                border: activeStep === 2 ? "2px solid #2196f3" : "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Cierre
                </Typography>
                {activeStep === 2 && (
                  <Chip label="COMPLETADO" color="success" size="small" sx={{ ml: "auto", fontWeight: 500 }} />
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

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
                disabled={activeStep === 2}
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {activeStep === 2 ? "Medida cerrada" : "Cerrar medida"}
              </Button>
            </Paper>
          </Grid>

          {/* Último informe Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Último informe
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {medidaData.ultimo_informe.fecha}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Autor:</strong> {medidaData.ultimo_informe.autor}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  border: "1px dashed #ccc",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    cursor: "pointer",
                  },
                }}
                onClick={() => handleOpenAttachment(medidaData.ultimo_informe.archivo)}
              >
                <DescriptionIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{medidaData.ultimo_informe.archivo}</Typography>
                <Box sx={{ ml: "auto", display: "flex" }}>
                  <Tooltip title="Descargar">
                    <IconButton size="small" color="primary">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={openAddTaskDialog} onClose={handleCloseAddTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Añadir nueva tarea</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="tarea"
              name="tarea"
              label="Tarea"
              type="text"
              fullWidth
              variant="outlined"
              value={newTask.tarea}
              onChange={handleTaskChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="objetivo"
              name="objetivo"
              label="Objetivo"
              type="text"
              fullWidth
              variant="outlined"
              value={newTask.objetivo}
              onChange={handleTaskChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel id="plazo-label">Plazo</InputLabel>
              <Select
                labelId="plazo-label"
                id="plazo"
                name="plazo"
                value={newTask.plazo}
                onChange={handleSelectChange}
                label="Plazo"
              >
                <MenuItem value="1 semana">1 semana</MenuItem>
                <MenuItem value="2 semanas">2 semanas</MenuItem>
                <MenuItem value="1 mes">1 mes</MenuItem>
                <MenuItem value="3 meses">3 meses</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTaskDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveTask}
            color="primary"
            variant="contained"
            sx={{
              borderRadius: 8,
              textTransform: "none",
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Dialog */}
      <Dialog open={openAttachmentDialog} onClose={() => setOpenAttachmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6">{selectedAttachment}</Typography>
            <IconButton onClick={() => setOpenAttachmentDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Vista previa del documento no disponible
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => setOpenAttachmentDialog(false)}
            color="primary"
            sx={{
              borderRadius: 8,
              textTransform: "none",
            }}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
