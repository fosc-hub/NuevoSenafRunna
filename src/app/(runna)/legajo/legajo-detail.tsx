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
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArticleIcon from "@mui/icons-material/Article"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AddIcon from "@mui/icons-material/Add"
import DescriptionIcon from "@mui/icons-material/Description"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useRouter } from "next/navigation"
import { getLegajoById, type Legajo } from "../legajo-mesa/mock-data/legajos-service"
interface LegajoDetailProps {
  params: {
    id: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

export default function LegajoDetail({ params, onClose, isFullPage = false }: LegajoDetailProps) {
  const [legajoData, setLegajoData] = useState<Legajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadLegajoData = () => {
      if (params.id) {
        try {
          setIsLoading(true)
          const data = getLegajoById(params.id)
          if (data) {
            setLegajoData(data)
          } else {
            setError(`No se encontró el legajo con ID ${params.id}`)
          }
        } catch (err) {
          console.error("Error loading legajo data:", err)
          setError("Error al cargar los datos del legajo. Por favor, intente nuevamente.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadLegajoData()
  }, [params.id])

  const handleOpenInFullPage = () => {
    router.push(`/legajo/${params.id}`)
  }

  const handleTomarMedida = () => {
    console.log("Tomar medida clicked")
    // Implement the action for taking a measure
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

  if (!legajoData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información para este legajo.
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
        {!isFullPage && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton aria-label="Ver en página completa" onClick={handleOpenInFullPage} color="primary">
              <ArticleIcon />
            </IconButton>
            {onClose && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
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
          <Box sx={{ display: "flex", borderLeft: "6px solid #e53935", pl: 3, py: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Legajo número: {legajoData.numero_legajo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de apertura: {legajoData.fecha_apertura}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {legajoData.persona_principal.dni}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demanda asignada a: {legajoData.profesional_asignado?.nombre || "Sin asignar"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre: {`${legajoData.persona_principal.nombre} ${legajoData.persona_principal.apellido}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alias: {legajoData.persona_principal.alias || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Edad: {legajoData.persona_principal.edad} años
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ubicación: {legajoData.ubicacion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Localidad: {legajoData.localidad.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Último equipo interviniente: {legajoData.equipo_interviniente}
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

            <Box sx={{ ml: "auto", display: "flex", alignItems: "flex-start" }}>
              {legajoData.prioridad === "ALTA" && (
                <Chip
                  label="URGENTE"
                  color="error"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 600,
                    px: 1,
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Medida activa (1)
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleTomarMedida}>
            Tomar Medida
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mb: 4,
            p: 0,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          <Grid container>
            <Grid item xs={12} md={8} sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Medida:</strong> {legajoData.medida_activa.tipo}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Estado:</strong>{" "}
                <span
                  style={{
                    color:
                      legajoData.medida_activa.estado === "ACTIVA"
                        ? "#4caf50"
                        : legajoData.medida_activa.estado === "PENDIENTE"
                          ? "#ff9800"
                          : "#9e9e9e",
                    fontWeight: 600,
                  }}
                >
                  {legajoData.medida_activa.estado}
                </span>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha de apertura:</strong> {legajoData.medida_activa.fecha_apertura}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Grupo actuante:</strong> {legajoData.medida_activa.grupo_actuante}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Juzgado:</strong> {legajoData.medida_activa.juzgado}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Nro SAC:</strong> {legajoData.medida_activa.nro_sac}
              </Typography>

              <FormControlLabel
                control={<Checkbox checked={legajoData.medida_activa.respuesta_enviada} disabled />}
                label="Respuesta enviada a juzgado"
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button endIcon={<ArrowForwardIcon />} size="small" color="primary" sx={{ textTransform: "none" }}>
                  Último informe
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Situaciones Críticas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox checked={legajoData.situaciones_criticas.BP} disabled />}
                    label="BP"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox checked={legajoData.situaciones_criticas.RSA} disabled />}
                    label="RSA"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox checked={legajoData.situaciones_criticas.DCS} disabled />}
                    label="DCS"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox checked={legajoData.situaciones_criticas.SCP} disabled />}
                    label="SCP"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                  color="primary"
                  sx={{ textTransform: "none" }}
                  onClick={() =>
                    router.push(
                      `/legajo/${params.id}/medida/active_${legajoData.medida_activa.tipo.replace(/\s+/g, "_")}`,
                    )
                  }
                >
                  Ver Detalles
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ bgcolor: "#f5f5f5", p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Últimas intervenciones
              </Typography>

              {legajoData.intervenciones.map((intervencion, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderLeft: "2px solid #2196f3",
                    pl: 2,
                    position: "relative",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {intervencion.fecha}
                  </Typography>
                  <Typography variant="body2">{intervencion.descripcion}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {intervencion.hora}
                  </Typography>

                  {intervencion.descripcion.includes("adjunta") && (
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        color: "primary.main",
                      }}
                    >
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button endIcon={<ArrowForwardIcon />} size="small" color="primary" sx={{ textTransform: "none" }}>
                  Ver más
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Historial de Medidas Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Historial de Medidas
        </Typography>

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
          {/* MPI Section */}
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mpi-content"
              id="mpi-header"
              sx={{
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Chip label="MPI" color="primary" size="small" sx={{ mr: 2, fontWeight: "bold" }} />
                <Typography>Cantidad ({legajoData.historial_medidas.MPI.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>Medida</TableCell>
                      <TableCell>Fecha alta</TableCell>
                      <TableCell>Duración</TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell>Juzgado</TableCell>
                      <TableCell>Dispositivo</TableCell>
                      <TableCell>Fecha cierre</TableCell>
                      <TableCell>Informe</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {legajoData.historial_medidas.MPI.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.medida}</TableCell>
                        <TableCell>{item.fecha_alta}</TableCell>
                        <TableCell>{item.duracion}</TableCell>
                        <TableCell>{item.equipo}</TableCell>
                        <TableCell>{item.juzgado}</TableCell>
                        <TableCell>{item.dispositivo}</TableCell>
                        <TableCell>{item.fecha_cierre}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(
                                `/legajo/${params.id}/medida/${item.medida}_${item.fecha_alta.replace(/\//g, "-")}`,
                              )
                            }
                          >
                            <ChevronRightIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* MPE Section */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mpe-content"
              id="mpe-header"
              sx={{
                backgroundColor: "#e8f5e9",
                borderRadius: "4px",
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Chip label="MPE" color="success" size="small" sx={{ mr: 2, fontWeight: "bold" }} />
                <Typography>Cantidad ({legajoData.historial_medidas.MPE.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>Fecha alta</TableCell>
                      <TableCell>Duración</TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell>Juzgado</TableCell>
                      <TableCell>Dispositivo</TableCell>
                      <TableCell>Fecha cierre</TableCell>
                      <TableCell>Legajos afectado</TableCell>
                      <TableCell>Informe</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {legajoData.historial_medidas.MPE.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.fecha_alta}</TableCell>
                        <TableCell>{item.duracion}</TableCell>
                        <TableCell>{item.equipo}</TableCell>
                        <TableCell>{item.juzgado}</TableCell>
                        <TableCell>{item.dispositivo}</TableCell>
                        <TableCell>{item.fecha_cierre}</TableCell>
                        <TableCell>{item.legajos_afectado}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(`/legajo/${params.id}/medida/MPE_${item.fecha_alta.replace(/\//g, "-")}`)
                            }
                          >
                            <ChevronRightIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* MPJ Section */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mpj-content"
              id="mpj-header"
              sx={{
                backgroundColor: "#fff3e0",
                borderRadius: "4px",
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Chip label="MPJ" color="warning" size="small" sx={{ mr: 2, fontWeight: "bold" }} />
                <Typography>Cantidad ({legajoData.historial_medidas.MPJ.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>Medida</TableCell>
                      <TableCell>Fecha alta</TableCell>
                      <TableCell>Duración</TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell>Juzgado</TableCell>
                      <TableCell>Dispositivo</TableCell>
                      <TableCell>Fecha cierre</TableCell>
                      <TableCell>Informe</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {legajoData.historial_medidas.MPJ.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.medida}</TableCell>
                        <TableCell>{item.fecha_alta}</TableCell>
                        <TableCell>{item.duracion}</TableCell>
                        <TableCell>{item.equipo}</TableCell>
                        <TableCell>{item.juzgado}</TableCell>
                        <TableCell>{item.dispositivo}</TableCell>
                        <TableCell>{item.fecha_cierre}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(
                                `/legajo/${params.id}/medida/${item.medida}_${item.fecha_alta.replace(/\//g, "-")}`,
                              )
                            }
                          >
                            <ChevronRightIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Box>
    </Box>
  )
}
