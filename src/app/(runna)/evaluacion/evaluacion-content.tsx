"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
} from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

// Assume these imports are available in your project
import { get, update } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface Activity {
  id?: number
  actividad: string
  fecha: string
  institucion: string
  observaciones: string
}

interface NnyaConviviente {
  id?: number
  apellido_nombre: string
  fecha_nacimiento: string
  dni: string
  vinculo: string
  legajo_runna: string
}

interface VulnerabilityIndicator {
  id: number
  nombre: string
  descripcion: string | null
  peso: number
  selected?: boolean
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function EvaluacionContent() {
  const searchParams = useSearchParams()
  const demandaId = searchParams.get("id")
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [editableDemanda, setEditableDemanda] = useState<Partial<TDemanda>>({})
  const [activities, setActivities] = useState<Activity[]>([])
  const [nnyaConvivientes, setNnyaConvivientes] = useState<NnyaConviviente[]>([])
  const [vulnerabilityIndicators, setVulnerabilityIndicators] = useState<VulnerabilityIndicator[]>([
    {
      id: 1,
      nombre: "Progenitores y/o adultos responsables con condición de discapacidad/consumo/adicción/salud mental",
      descripcion: null,
      peso: 1,
      selected: false,
    },
    {
      id: 2,
      nombre:
        "Sospecha de violencia sexual contra NNyA, previa denuncia ante los organismos judiciales correspondientes, si es que no se hubiere formulado con atenrioridad.",
      descripcion: null,
      peso: 1,
      selected: false,
    },
    {
      id: 3,
      nombre: "Evidencia física relacionada a la vulneración de la integridad personal",
      descripcion: null,
      peso: 5,
      selected: false,
    },
    {
      id: 4,
      nombre: "Cronicidad del maltrato y lesiones graves en el NNyA",
      descripcion: null,
      peso: 1,
      selected: false,
    },
    {
      id: 5,
      nombre: "Agresor/a del NNyA conviviente o con contacto",
      descripcion: null,
      peso: 2,
      selected: false,
    },
    {
      id: 6,
      nombre: "Inexistencia de figuras adultas convivientes que garanticen protección de derechos al NNyA",
      descripcion: null,
      peso: 4,
      selected: false,
    },
    {
      id: 7,
      nombre:
        "Inexistencia de redes familiares y comunitarias que aporten a la familia a garantizar el cuidado, ó con limitaciones graves en el cuidado personal que impiden al cuidador/a hacerse cargo del mismo/a, poniendo en riesgo la integridad psicofísica del niño",
      descripcion: null,
      peso: 2,
      selected: false,
    },
    {
      id: 8,
      nombre: "El NNA manifiesta posible vulneración de sus derechos",
      descripcion: null,
      peso: 5,
      selected: false,
    },
    {
      id: 9,
      nombre: "Negligencia en los cuidados",
      descripcion: null,
      peso: 4,
      selected: false,
    },
    {
      id: 10,
      nombre: "Trabajo infantil o posible explotación sexual/laboral infantil/adolescente desprotegido",
      descripcion: null,
      peso: 3,
      selected: false,
    },
    {
      id: 11,
      nombre:
        "Existen antecedentes de intervenciones previas -recientes o actuales- propias y/o de otros equipos provinciales, locales de otras instituciones u otras jurisdicciones provinciales",
      descripcion: null,
      peso: 1,
      selected: false,
    },
    {
      id: 12,
      nombre: "No se cumplen las medidas cautelares que protegen a NNA víctimas o se amenaza con incumplir",
      descripcion: null,
      peso: 3,
      selected: false,
    },
  ])

  // Fetch demanda details
  const {
    data: demanda,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["demanda", demandaId],
    queryFn: () => (demandaId ? get<TDemanda>(`registro-demanda-form/${demandaId}/`) : null),
    enabled: !!demandaId,
  })

  // Update demanda mutation
  const updateDemanda = useMutation({
    mutationFn: async (data: Partial<TDemanda>) => {
      if (!demandaId) throw new Error("Demanda ID is required")
      return update<TDemanda>("registro-demanda-form", demandaId, data, true, "Demanda actualizada con éxito")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demanda", demandaId] })
      toast.success("Demanda actualizada correctamente", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      })
    },
    onError: (error) => {
      console.error("Error al actualizar la demanda:", error)
      toast.error("Error al actualizar la demanda", {
        position: "top-center",
        autoClose: 3000,
      })
    },
  })

  useEffect(() => {
    if (demanda) {
      setEditableDemanda(demanda)
      setActivities(demanda.actividades || [])
      setNnyaConvivientes(demanda.nnya_convivientes || [])
    }
  }, [demanda])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditableDemanda((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditableDemanda((prev) => ({
      ...prev,
      localizacion: {
        ...prev.localizacion,
        [name]: value,
      },
    }))
  }

  const handleActivityChange = (index: number, field: keyof Activity, value: string) => {
    const newActivities = [...activities]
    newActivities[index] = {
      ...newActivities[index],
      [field]: value,
    }
    setActivities(newActivities)
  }

  const handleAddActivity = () => {
    setActivities([...activities, { actividad: "", fecha: "", institucion: "", observaciones: "" }])
  }

  const handleDeleteActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const handleNnyaConvivienteChange = (index: number, field: keyof NnyaConviviente, value: string) => {
    const newNnyaConvivientes = [...nnyaConvivientes]
    newNnyaConvivientes[index] = {
      ...newNnyaConvivientes[index],
      [field]: value,
    }
    setNnyaConvivientes(newNnyaConvivientes)
  }

  const handleAddNnyaConviviente = () => {
    setNnyaConvivientes([
      ...nnyaConvivientes,
      { apellido_nombre: "", fecha_nacimiento: "", dni: "", vinculo: "", legajo_runna: "" },
    ])
  }

  const handleDeleteNnyaConviviente = (index: number) => {
    setNnyaConvivientes(nnyaConvivientes.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const updatedData = {
      ...editableDemanda,
      actividades: activities,
      nnya_convivientes: nnyaConvivientes,
    }
    updateDemanda.mutate(updatedData)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const generatePDF = async (data: any) => {
    try {
      // Here you would implement the actual PDF generation
      // You might want to use a library like jsPDF or make an API call
      // to generate the PDF server-side
      console.log("Generating PDF with data:", data)
      toast.success("Generando PDF...", {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Error al generar el PDF", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  const handleAuthorizationAction = async (action: string) => {
    if (!demandaId) return

    try {
      const updatedData = await update(
        "registro-demanda-form",
        demandaId,
        { estado_demanda: "PENDIENTE_AUTORIZACION" },
        true,
        `Demanda enviada para ${action} exitosamente`,
      )

      // Update local state to reflect the change
      setEditableDemanda((prev) => ({
        ...prev,
        estado_demanda: "PENDIENTE_AUTORIZACION",
      }))

      queryClient.invalidateQueries({ queryKey: ["demanda", demandaId] })
    } catch (err) {
      console.error(`Error updating case status for ${action}:`, err)
      // Error toast is handled by the API service
    }
  }

  const handleIndicatorChange = (id: number, value: boolean) => {
    setVulnerabilityIndicators(
      vulnerabilityIndicators.map((indicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)),
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !demanda) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">Error al cargar los datos de la demanda</Typography>
      </Box>
    )
  }

  return (
    <main className="max-w-[1200px] mx-auto p-5">
      <Box>
        <Box
          sx={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bgcolor: "#0EA5E9",
            zIndex: 1100,
            p: 0,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="evaluacion tabs"
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-selected": {
                  color: "white",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "white",
              },
            }}
          >
            <Tab label="INFORMACIÓN GENERAL" />
            <Tab label="DATOS DE LOCALIZACIÓN" />
            <Tab label="DESCRIPCIÓN DE LA SITUACIÓN INICIAL" />
            <Tab label="ACTIVIDADES" />
            <Tab label="NNYA CONVIVIENTES" />
            <Tab label="NNYA NO CONVIVIENTES" />
            <Tab label="ADULTO" />
          </Tabs>
        </Box>

        <Box sx={{ pt: "48px" }}>
          {/* Tab 1: Información General */}
          <CustomTabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} sx={{ mt: 0, borderRadius: 0 }}>
              <Table sx={{ minWidth: 650 }} aria-label="información general table">
                <TableHead>
                  <TableRow>
                    <TableCell>Localidad</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Cargo/Función</TableCell>
                    <TableCell>Institución</TableCell>
                    <TableCell>N° de Sticker SUAC</TableCell>
                    <TableCell>N° de Sticker sac</TableCell>
                    <TableCell>N° de Oficio Web</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Suborigen</TableCell>
                    <TableCell>Estado Demanda</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField
                        name="localidad"
                        value={editableDemanda.localizacion?.localidad || ""}
                        onChange={handleLocationInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="fecha_ingreso_senaf"
                        value={editableDemanda.fecha_ingreso_senaf || ""}
                        onChange={handleInputChange}
                        variant="standard"
                        type="date"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="cargo_funcion"
                        value={editableDemanda.registrado_por_user?.username || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="institucion"
                        value={editableDemanda.institucion?.nombre || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="sticker_suac"
                        value={
                          editableDemanda.relacion_demanda?.codigos_demanda.find((c) => c.tipo_codigo === 3)?.codigo ||
                          ""
                        }
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="sticker_sac"
                        value={
                          editableDemanda.relacion_demanda?.codigos_demanda.find((c) => c.tipo_codigo === 1)?.codigo ||
                          ""
                        }
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="oficio_web"
                        value={editableDemanda.oficio_web || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="tipo_demanda"
                        value={editableDemanda.tipo_demanda || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="submotivo_ingreso"
                        value={editableDemanda.submotivo_ingreso || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="estado_demanda"
                        value={editableDemanda.estado_demanda || ""}
                        onChange={handleInputChange}
                        variant="standard"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>

          {/* Tab 2: Datos de Localización */}
          <CustomTabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Datos de Localización
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                <TextField
                  label="Calle"
                  name="calle"
                  value={editableDemanda.localizacion?.calle || ""}
                  onChange={handleLocationInputChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Tipo de Calle"
                  name="tipo_calle"
                  value={editableDemanda.localizacion?.tipo_calle || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Piso/Depto"
                  name="piso_depto"
                  value={editableDemanda.localizacion?.piso_depto || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Lote"
                  name="lote"
                  value={editableDemanda.localizacion?.lote || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Manzana"
                  name="mza"
                  value={editableDemanda.localizacion?.mza || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Número de Casa"
                  name="casa_nro"
                  value={editableDemanda.localizacion?.casa_nro || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Referencia Geográfica"
                  name="referencia_geo"
                  value={editableDemanda.localizacion?.referencia_geo || ""}
                  onChange={handleLocationInputChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Barrio"
                  name="barrio"
                  value={editableDemanda.localizacion?.barrio || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
                <TextField
                  label="Localidad"
                  name="localidad"
                  value={editableDemanda.localizacion?.localidad || ""}
                  onChange={handleLocationInputChange}
                  required
                  fullWidth
                />
                <TextField
                  label="CPC"
                  name="cpc"
                  value={editableDemanda.localizacion?.cpc || ""}
                  onChange={handleLocationInputChange}
                  fullWidth
                />
              </Box>
            </Paper>
          </CustomTabPanel>

          {/* Tab 3: Descripción de la Situación Inicial */}
          <CustomTabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Descripción de la Situación Inicial
              </Typography>
              <TextField
                name="descripcion"
                value={editableDemanda.descripcion || ""}
                onChange={handleInputChange}
                multiline
                rows={6}
                fullWidth
                variant="outlined"
              />
            </Paper>
          </CustomTabPanel>

          {/* Tab 4: Actividades */}
          <CustomTabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actividades
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Actividad</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Institución</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={activity.actividad}
                            onChange={(e) => handleActivityChange(index, "actividad", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={activity.fecha}
                            onChange={(e) => handleActivityChange(index, "fecha", e.target.value)}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={activity.institucion}
                            onChange={(e) => handleActivityChange(index, "institucion", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={activity.observaciones}
                            onChange={(e) => handleActivityChange(index, "observaciones", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDeleteActivity(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddActivity}
                sx={{ mt: 2 }}
                variant="outlined"
                color="primary"
              >
                AGREGAR FILA
              </Button>
            </Paper>
          </CustomTabPanel>

          {/* Tab 5: NNYA Convivientes */}
          <CustomTabPanel value={tabValue} index={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                NNYA Convivientes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Apellido y Nombre</TableCell>
                      <TableCell>Fecha de Nacimiento</TableCell>
                      <TableCell>N° de DNI</TableCell>
                      <TableCell>Vínculo con NNyA principal</TableCell>
                      <TableCell>N° de Legajo RUNNA</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nnyaConvivientes.map((nnya, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={nnya.apellido_nombre}
                            onChange={(e) => handleNnyaConvivienteChange(index, "apellido_nombre", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={nnya.fecha_nacimiento}
                            onChange={(e) => handleNnyaConvivienteChange(index, "fecha_nacimiento", e.target.value)}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={nnya.dni}
                            onChange={(e) => handleNnyaConvivienteChange(index, "dni", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={nnya.vinculo}
                            onChange={(e) => handleNnyaConvivienteChange(index, "vinculo", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={nnya.legajo_runna}
                            onChange={(e) => handleNnyaConvivienteChange(index, "legajo_runna", e.target.value)}
                            variant="standard"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDeleteNnyaConviviente(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddNnyaConviviente}
                sx={{ mt: 2 }}
                variant="outlined"
                color="primary"
              >
                AGREGAR FILA
              </Button>
            </Paper>
          </CustomTabPanel>

          {/* Other tabs remain the same */}
          <CustomTabPanel value={tabValue} index={5}>
            <Typography variant="h6">NNYA No Convivientes</Typography>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={6}>
            <Typography variant="h6">Adulto</Typography>
          </CustomTabPanel>
        </Box>

        {/* Decision Box */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
              DECISIÓN SUGERIDA
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", minWidth: 120 }}>
                  Decisión:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
                  APERTURA DE LEGAJO
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Motivo:
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Dado el alto score del nnya (433.0), y el alto score de la demanda (73.0), la decision sugerida es
                  APERTURA DE LEGAJO.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mt: 2 }}>
                {/* Vulnerability Indicators - Left Side */}
                <Box sx={{ flex: "1 1 55%", minWidth: 400 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                    Indicadores de Vulneración:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: "400px", overflow: "auto" }}>
                    {vulnerabilityIndicators.map((indicator) => (
                      <Box key={indicator.id} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
                        <Box sx={{ display: "flex", mb: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {indicator.nombre}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: "bold", ml: 2 }}>
                            Peso: {indicator.peso}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <input
                              type="radio"
                              id={`indicator-${indicator.id}-yes`}
                              name={`indicator-${indicator.id}`}
                              checked={indicator.selected === true}
                              onChange={() => handleIndicatorChange(indicator.id, true)}
                            />
                            <label htmlFor={`indicator-${indicator.id}-yes`} style={{ marginLeft: "4px" }}>
                              Sí
                            </label>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <input
                              type="radio"
                              id={`indicator-${indicator.id}-no`}
                              name={`indicator-${indicator.id}`}
                              checked={indicator.selected === false}
                              onChange={() => handleIndicatorChange(indicator.id, false)}
                            />
                            <label htmlFor={`indicator-${indicator.id}-no`} style={{ marginLeft: "4px" }}>
                              No
                            </label>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Box>

                {/* Scores - Right Side */}
                <Box sx={{ flex: "1 1 40%", minWidth: 300 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                    Scores:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Demanda Scores:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                              <TableCell align="right">73</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                              <TableCell align="right">0</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                              <TableCell align="right">67</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score motivos intervención</TableCell>
                              <TableCell align="right">0</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score indicadores valoración</TableCell>
                              <TableCell align="right">6</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        NNyA Scores:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                              <TableCell align="right">433</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                              <TableCell align="right">0</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                              <TableCell align="right">433</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Score motivos intervención</TableCell>
                              <TableCell align="right">-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
        {/* Replace the Save Button with Generate PDF */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Here you would implement the PDF generation logic
              // using the data from all tabs
              const data = {
                informacionGeneral: editableDemanda,
                localizacion: editableDemanda.localizacion,
                descripcion: editableDemanda.descripcion,
                actividades: activities,
                nnyaConvivientes: nnyaConvivientes,
                vulnerabilityIndicators,
              }

              // You would need to implement this function
              generatePDF(data)
            }}
          >
            Generar PDF
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleAuthorizationAction("autorizar archivar")}>
            Autorizar archivar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAuthorizationAction("autorizar abrir legajo")}
          >
            Autorizar abrir legajo
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAuthorizationAction("autorizar tomar medida")}
          >
            Autorizar tomar medida
          </Button>
          <Button variant="contained" color="primary" onClick={() => handleAuthorizationAction("autorizar")}>
            Autorizar
          </Button>
          <Button variant="contained" color="error" onClick={() => handleAuthorizationAction("no autorizar")}>
            No autorizar
          </Button>
        </Box>
      </Box>
    </main>
  )
}

