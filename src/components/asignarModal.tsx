"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Modal,
  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  FormControl,
  List,
  ListItem,
  ListItemText,
  TextField,
  Autocomplete,
  Chip,
} from "@mui/material"
import { get, create } from "@/app/api/apiService"
import { toast } from "react-toastify"

// Function to get the current user's ID
function getCurrentUserId(): number {
  // Replace this with your actual method of getting the current user's ID
  // This could be from a global state, context, or a custom hook
  return 1 // Temporary placeholder, replace with actual user ID
}

interface AsignarModalProps {
  open: boolean
  onClose: () => void
  demandaId: number | null
}

interface Zona {
  id: number
  nombre: string
}

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  zonas: Array<{ id: number; zona: number }>
  zonas_ids: number[]
}

interface DemandaZona {
  id: number
  zona: Zona
  user_responsable: User | null
  enviado_por: User | null
  recibido_por: User | null
  esta_activo: boolean
  comentarios: string
  objetivo?: string
}

const AsignarModal: React.FC<AsignarModalProps> = ({ open, onClose, demandaId }) => {
  const [value, setValue] = useState(0)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [selectedZona, setSelectedZona] = useState<number | null>(null)
  const [demandaZonas, setDemandaZonas] = useState<DemandaZona[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [comentarios, setComentarios] = useState("")
  const [auditHistory, setAuditHistory] = useState<
    Array<{
      id: number
      descripcion: string
      action: string
      timestamp: string
    }>
  >([])
  const [objetivo, setObjetivo] = useState<string>("peticion_informe")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Obtener la última demanda zona activa
  const lastActiveDemandaZona = useMemo(() => {
    // Filtrar las demandas activas y ordenarlas por ID (asumiendo que IDs más altos son más recientes)
    const activeDemandas = demandaZonas.filter((dz) => dz.esta_activo).sort((a, b) => b.id - a.id)

    return activeDemandas.length > 0 ? activeDemandas[0] : null
  }, [demandaZonas])

  // Actualizar los campos del formulario cuando cambia la última demanda activa
  useEffect(() => {
    if (lastActiveDemandaZona) {
      setSelectedZona(lastActiveDemandaZona.zona.id)
      // Convert single user to array for backward compatibility
      setSelectedUsers(lastActiveDemandaZona.user_responsable ? [lastActiveDemandaZona.user_responsable.id] : [])
      setObjetivo(lastActiveDemandaZona.objetivo || "peticion_informe")
    } else {
      // Si no hay demanda activa, resetear los campos
      setSelectedZona(null)
      setSelectedUsers([])
      setObjetivo("peticion_informe")
    }
  }, [lastActiveDemandaZona])

  useEffect(() => {
    if (open && demandaId) {
      fetchData()
      fetchAuditHistory()
    }
  }, [open, demandaId])

  useEffect(() => {
    if (value === 1 && demandaId) {
      fetchAuditHistory()
    }
  }, [value, demandaId])

  const fetchData = async () => {
    if (!demandaId) return

    setIsLoading(true)
    try {
      const response = await get<{
        zonas: Zona[]
        demanda_zonas: DemandaZona[]
        users: User[]
      }>(`gestion-demanda-zona/${demandaId}/`)

      setZonas(response.zonas)
      setDemandaZonas(response.demanda_zonas)
      setUsers(response.users)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAuditHistory = async () => {
    if (!demandaId) return

    try {
      const historyData = await get<any[]>(`auditoria-demanda-zona/${demandaId}`)
      setAuditHistory(historyData)
    } catch (error) {
      console.error("Error fetching audit history:", error)
      toast.error("Error al cargar el historial")
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleComentariosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComentarios(event.target.value)
  }

  const handleAsignar = async () => {
    if (!selectedZona) {
      toast.error("Por favor, seleccione una zona")
      return
    }

    // Verificar si hay cambios comparando con la demanda activa actual
    const hasChanges =
      !lastActiveDemandaZona ||
      lastActiveDemandaZona.zona.id !== selectedZona ||
      // Check if the selected users have changed
      (lastActiveDemandaZona.user_responsable
        ? ![lastActiveDemandaZona.user_responsable.id].every((id) => selectedUsers.includes(id)) ||
          selectedUsers.length !== 1
        : selectedUsers.length > 0) ||
      (lastActiveDemandaZona.objetivo || "peticion_informe") !== objetivo

    if (!hasChanges && comentarios.trim() === "") {
      toast.info("No se detectaron cambios para asignar")
      return
    }

    setIsLoading(true)
    try {
      await create(
        "demanda-zona",
        {
          fecha_recibido: new Date().toISOString(),
          esta_activo: true,
          recibido: true,
          comentarios: comentarios,
          enviado_por: getCurrentUserId(),
          recibido_por: null,
          zona: selectedZona,
          user_responsable: selectedUsers.length === 1 ? selectedUsers[0] : null,
          demanda: demandaId,
          objetivo: objetivo,
          users_responsables: selectedUsers,
        },
        true,
        "Demanda asignada exitosamente",
      )

      // Recargar los datos para obtener la última asignación
      await fetchData()
      setComentarios("")
    } catch (error) {
      console.error("Error assigning demanda:", error)
      toast.error("Error al asignar la demanda")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsersByZona = useMemo(() => {
    return (zonaId: number) => {
      return users.filter((user) => user.zonas_ids.includes(zonaId))
    }
  }, [users])

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="asignar-modal-title"
      aria-describedby="asignar-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          minHeight: 500,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
          overflow: "auto",
        }}
      >
        <Typography
          id="asignar-modal-title"
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            color: "text.primary",
            fontWeight: 500,
            mb: 3,
          }}
        >
          Derivar Demanda {demandaId}
        </Typography>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="asignar tabs"
            sx={{
              "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: 500,
                color: "text.primary",
                textTransform: "uppercase",
              },
              "& .Mui-selected": {
                color: "primary.main",
              },
            }}
            size="small"
          >
            <Tab label="Asignar" {...a11yProps(0)} />
            <Tab label="Historia" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Derivar a zona
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={zonas}
              getOptionLabel={(option) => option.nombre}
              value={zonas.find((zona) => zona.id === selectedZona) || null}
              onChange={(_, newValue) => {
                setSelectedZona(newValue ? newValue.id : null)
                setSelectedUsers([]) // Reset user selection when zone changes
              }}
              renderInput={(params) => <TextField {...params} label="Zona" size="small" />}
              PopperProps={{
                style: { width: "auto", maxWidth: "300px" },
              }}
              size="small"
              disabled={isLoading}
            />
          </FormControl>

          {selectedZona && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Autocomplete
                multiple
                options={filteredUsersByZona(selectedZona)}
                getOptionLabel={(option) => option.username}
                value={users.filter((user) => selectedUsers.includes(user.id))}
                onChange={(_, newValue) => setSelectedUsers(newValue.map((user) => user.id))}
                renderInput={(params) => <TextField {...params} label="Usuarios responsables" size="small" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.username} size="small" {...getTagProps({ index })} />
                  ))
                }
                PopperProps={{
                  style: { width: "auto", maxWidth: "300px" },
                }}
                size="small"
                disabled={isLoading}
              />
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={[
                { value: "peticion_informe", label: "Petición de informe" },
                { value: "proteccion", label: "Protección" },
              ]}
              getOptionLabel={(option) => option.label}
              value={
                objetivo === "peticion_informe"
                  ? { value: "peticion_informe", label: "Petición de informe" }
                  : { value: "proteccion", label: "Protección" }
              }
              onChange={(_, newValue) => setObjetivo(newValue ? newValue.value : "peticion_informe")}
              renderInput={(params) => <TextField {...params} label="Objetivo de la demanda" size="small" />}
              PopperProps={{
                style: { width: "auto", maxWidth: "300px" },
              }}
              size="small"
              disabled={isLoading}
            />
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Comentarios"
            value={comentarios}
            onChange={handleComentariosChange}
            sx={{ mb: 2 }}
            size="small"
            disabled={isLoading}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleAsignar}
            size="small"
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? "Asignando..." : "Asignar"}
          </Button>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Historial de derivaciones para esta demanda
          </Typography>
          {auditHistory.length > 0 ? (
            <List sx={{ maxHeight: "300px", overflow: "auto" }}>
              {auditHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((record) => (
                  <ListItem key={record.id} divider>
                    <ListItemText
                      primary={record.descripcion}
                      primaryTypographyProps={{
                        sx: { color: "text.primary", fontWeight: 600 },
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No hay registros de historial disponibles.
            </Typography>
          )}
        </TabPanel>
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            size="small"
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              px: 4,
            }}
            disabled={isLoading}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export default AsignarModal
