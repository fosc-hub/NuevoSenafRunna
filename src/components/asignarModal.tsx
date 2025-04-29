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
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  FormHelperText,
} from "@mui/material"
import {
  History as HistoryIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { get, create } from "@/app/api/apiService"
import { toast } from "react-toastify"

// Function to get the current user's ID
function getCurrentUserId(): number {
  // Replace this with your actual method of getting the current user's ID
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
  const [isDataLoading, setIsDataLoading] = useState(false)

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

    setIsDataLoading(true)
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
      setIsDataLoading(false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="asignar-modal-title"
      aria-describedby="asignar-modal-description"
    >
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 700,
          minHeight: 500,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header with close button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            id="asignar-modal-title"
            variant="h5"
            component="h2"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AssignmentIcon /> Derivar Demanda {demandaId}
          </Typography>
          <Tooltip title="Cerrar">
            <IconButton onClick={onClose} size="small" aria-label="cerrar" disabled={isLoading}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="asignar tabs"
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.9rem",
                fontWeight: 500,
                textTransform: "none",
                minHeight: 48,
              },
            }}
          >
            <Tab icon={<SendIcon fontSize="small" />} iconPosition="start" label="Asignar" {...a11yProps(0)} />
            <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Historia" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Content area with scrolling */}
        <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
          {/* Loading indicator */}
          {isDataLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {!isDataLoading && (
            <>
              <TabPanel value={value} index={0}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Typography variant="subtitle1" color="primary" fontWeight={500} sx={{ mb: 1 }}>
                    Información de derivación
                  </Typography>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Zona
                    </Typography>
                    <Autocomplete
                      options={zonas}
                      getOptionLabel={(option) => option.nombre}
                      value={zonas.find((zona) => zona.id === selectedZona) || null}
                      onChange={(_, newValue) => {
                        setSelectedZona(newValue ? newValue.id : null)
                        setSelectedUsers([]) // Reset user selection when zone changes
                      }}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione una zona" size="small" fullWidth />
                      )}
                      disabled={isLoading}
                      disableClearable
                    />
                  </FormControl>

                  {selectedZona && (
                    <FormControl fullWidth>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Usuarios responsables
                      </Typography>
                      <Autocomplete
                        multiple
                        options={filteredUsersByZona(selectedZona)}
                        getOptionLabel={(option) => option.username}
                        value={users.filter((user) => selectedUsers.includes(user.id))}
                        onChange={(_, newValue) => setSelectedUsers(newValue.map((user) => user.id))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Seleccione usuarios responsables"
                            size="small"
                            fullWidth
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option.id}
                              label={option.username}
                              size="small"
                              {...getTagProps({ index })}
                              sx={{
                                bgcolor: "primary.light",
                                color: "primary.contrastText",
                                fontWeight: 500,
                              }}
                            />
                          ))
                        }
                        disabled={isLoading}
                      />
                      {selectedUsers.length === 0 && (
                        <FormHelperText>Seleccione al menos un usuario responsable</FormHelperText>
                      )}
                    </FormControl>
                  )}

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Objetivo de la demanda
                    </Typography>
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
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione un objetivo" size="small" fullWidth />
                      )}
                      disabled={isLoading}
                      disableClearable
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Añada comentarios sobre esta asignación..."
                      value={comentarios}
                      onChange={handleComentariosChange}
                      size="small"
                      disabled={isLoading}
                      sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.9rem" } }}
                    />
                  </FormControl>
                </Box>
              </TabPanel>

              <TabPanel value={value} index={1}>
                <Typography variant="subtitle1" color="primary" fontWeight={500} sx={{ mb: 2 }}>
                  Historial de derivaciones para esta demanda
                </Typography>

                {auditHistory.length > 0 ? (
                  <List
                    sx={{
                      maxHeight: "350px",
                      overflow: "auto",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 0,
                    }}
                  >
                    {auditHistory
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record, index) => (
                        <ListItem
                          key={record.id}
                          divider={index < auditHistory.length - 1}
                          sx={{
                            py: 1.5,
                            px: 2,
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <ListItemText
                            primary={record.descripcion}
                            secondary={formatDate(record.timestamp)}
                            primaryTypographyProps={{
                              sx: { color: "text.primary", fontWeight: 500, fontSize: "0.95rem" },
                            }}
                            secondaryTypographyProps={{
                              sx: { color: "text.secondary", fontSize: "0.8rem" },
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No hay registros de historial disponibles.
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </>
          )}
        </Box>

        {/* Footer with actions */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {value === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsignar}
              disabled={isLoading || !selectedZona}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ fontWeight: 500 }}
            >
              {isLoading ? "Asignando..." : "Asignar"}
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ ml: value === 1 ? 0 : "auto", fontWeight: 500 }}
            disabled={isLoading}
          >
            Cerrar
          </Button>
        </Box>
      </Paper>
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
      {value === index && children}
    </div>
  )
}

export default AsignarModal
