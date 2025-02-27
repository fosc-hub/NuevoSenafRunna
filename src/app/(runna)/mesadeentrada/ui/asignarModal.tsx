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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material"
import { Person, PersonOutline, Delete } from "@mui/icons-material"
import { get, create, update } from "@/app/api/apiService"
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
}

const AsignarModal: React.FC<AsignarModalProps> = ({ open, onClose, demandaId }) => {
  const [value, setValue] = useState(0)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [selectedZona, setSelectedZona] = useState<number | "">("")
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

  useEffect(() => {
    if (open && demandaId) {
      fetchData()
      fetchAuditHistory()
    }
  }, [open, demandaId])

  useEffect(() => {
    if (value === 2 && demandaId) {
      fetchAuditHistory()
    }
  }, [value, demandaId])

  const fetchData = async () => {
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

  const handleZonaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedZona(event.target.value as number)
  }

  const handleComentariosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComentarios(event.target.value)
  }

  const handleAsignar = async () => {
    if (!selectedZona) {
      toast.error("Por favor, seleccione una zona")
      return
    }

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
          user_responsable: null,
          demanda: demandaId,
        },
        true,
        "Demanda asignada exitosamente",
      )

      fetchData()
      setSelectedZona("")
      setComentarios("")
    } catch (error) {
      console.error("Error assigning demanda:", error)
      toast.error("Error al asignar la demanda")
    }
  }

  const handleChangeResponsable = async (demandaZonaId: number, userId: number | null) => {
    try {
      await update("demanda-zona", demandaZonaId, {
        user_responsable: userId,
      })
      toast.success("Usuario responsable actualizado exitosamente")
      fetchData()
    } catch (error) {
      console.error("Error updating user responsable:", error)
      toast.error("Error al actualizar el usuario responsable")
    }
  }

  const handleDeleteDemandaZona = async (demandaZonaId: number) => {
    if (window.confirm("¿Está seguro que desea eliminar esta asignación?")) {
      try {
        await update("demanda-zona", demandaZonaId, {
          esta_activo: false,
        })
        toast.success("Asignación eliminada exitosamente")
        fetchData()
      } catch (error) {
        console.error("Error deleting demanda zona:", error)
        toast.error("Error al eliminar la asignación")
      }
    }
  }

  const activeDemandaZonas = useMemo(() => demandaZonas.filter((dz) => dz.esta_activo), [demandaZonas])

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
          >
            <Tab label="Asignar" {...a11yProps(0)} />
            <Tab label="Ver asignados" {...a11yProps(1)} />
            <Tab label="Historia" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Derivar a zona
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="zona-select-label">Zona</InputLabel>
            <Select
              labelId="zona-select-label"
              id="zona-select"
              value={selectedZona}
              label="Zona"
              onChange={handleZonaChange}
            >
              {zonas.map((zona) => (
                <MenuItem key={zona.id} value={zona.id}>
                  {zona.nombre}
                </MenuItem>
              ))}
            </Select>
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
          />
          <Button variant="contained" color="primary" onClick={handleAsignar}>
            Asignar
          </Button>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Usuarios asignados a esta demanda (Derivaciones activas)
          </Typography>
          {activeDemandaZonas.length > 0 ? (
            <List>
              {activeDemandaZonas.map((demandaZona) => (
                <ListItem
                  key={demandaZona.id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    py: 2,
                    "& .MuiListItemSecondaryAction-root": {
                      position: "static",
                      transform: "none",
                      marginTop: { xs: 2, sm: 0 },
                    },
                  }}
                >
                  <ListItemText
                    primary={`Zona: ${demandaZona.zona.nombre}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                          Enviado por: {demandaZona.enviado_por?.username || "No especificado"}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                          Recibido por: {demandaZona.recibido_por?.username || "No recibido"}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{
                      sx: { color: "text.primary", fontWeight: 600 },
                    }}
                    sx={{ flex: 1, mr: { xs: 0, sm: 2 } }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Select
                      value={demandaZona.user_responsable?.id || ""}
                      onChange={(e) =>
                        handleChangeResponsable(demandaZona.id, e.target.value ? Number(e.target.value) : null)
                      }
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Person sx={{ mr: 1, color: "primary.main" }} />
                          {users.find((user) => user.id === selected)?.username || "No asignado"}
                        </Box>
                      )}
                      sx={{ mr: 1, minWidth: 200 }}
                    >
                      <MenuItem value="">
                        <em>Ninguno</em>
                      </MenuItem>
                      {filteredUsersByZona(demandaZona.zona.id).map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.id === demandaZona.user_responsable?.id ? (
                            <Person sx={{ mr: 1, color: "primary.main" }} />
                          ) : (
                            <PersonOutline sx={{ mr: 1 }} />
                          )}
                          {user.username}
                        </MenuItem>
                      ))}
                    </Select>
                    <Button onClick={() => handleDeleteDemandaZona(demandaZona.id)} color="error" size="small">
                      <Delete />
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No hay derivaciones activas para esta demanda.
            </Typography>
          )}
        </TabPanel>
        <TabPanel value={value} index={2}>
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
                      secondary={new Date(record.timestamp).toLocaleString()}
                      primaryTypographyProps={{
                        sx: { color: "text.primary", fontWeight: 500 },
                      }}
                      secondaryTypographyProps={{
                        sx: { color: "text.primary" },
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
            size="large"
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              px: 4,
            }}
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

