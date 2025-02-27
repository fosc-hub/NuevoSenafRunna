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

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function EvaluacionPage() {
  const searchParams = useSearchParams()
  const demandaId = searchParams.get("id")
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [editableDemanda, setEditableDemanda] = useState<Partial<TDemanda>>({})
  const [activities, setActivities] = useState<Activity[]>([])

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

  const handleSave = () => {
    const updatedData = {
      ...editableDemanda,
      actividades: activities,
    }
    updateDemanda.mutate(updatedData)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
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
            position: "sticky",
            top: "64px",
            bgcolor: "#0EA5E9",
            zIndex: 1100,
            width: "100%",
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

        <Box>
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
                        onChange={handleInputChange}
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

          {/* Other tabs remain the same */}
          <CustomTabPanel value={tabValue} index={4}>
            <Typography variant="h6">NNYA Convivientes</Typography>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={5}>
            <Typography variant="h6">NNYA No Convivientes</Typography>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={6}>
            <Typography variant="h6">Adulto</Typography>
          </CustomTabPanel>
        </Box>

        {/* Save Button */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </main>
  )
}

