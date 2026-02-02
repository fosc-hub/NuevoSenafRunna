"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  FormControl,
  List,
  ListItem,
  ListItemText,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
  FormHelperText,
} from "@mui/material"
import TabPanel from "@/components/shared/TabPanel"
import BaseModal from "@/components/shared/BaseModal"
import {
  History as HistoryIcon,
  Send as SendIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { create, get } from "@/app/api/apiService"
import { useConditionalData, extractArray } from "@/hooks/useApiQuery"
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
  zonas?: Array<{ id: number; zona: number }>
  zonas_ids?: number[]
}

interface UserZona {
  id: number
  director: boolean
  jefe: boolean
  legal: boolean
  user: number
  zona: number
  localidad: number
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
  const [selectedZona, setSelectedZona] = useState<number | null>(null)
  const [comentarios, setComentarios] = useState("")
  const [objetivo, setObjetivo] = useState<string>("peticion_informe")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [usersForSelectedZona, setUsersForSelectedZona] = useState<User[]>([])
  const [isLoadingUsersForZona, setIsLoadingUsersForZona] = useState(false)

  // Fetch main data using TanStack Query (only when modal is open)
  const { data: mainData, isLoading: isDataLoading, refetch: refetchMainData } = useConditionalData<{
    zonas: Zona[]
    demanda_zonas: DemandaZona[]
    users: User[]
  }>(`gestion-demanda-zona/${demandaId}/`, open && !!demandaId)

  // Fetch audit history using TanStack Query (only when modal is open)
  const { data: auditHistoryData } = useConditionalData<
    Array<{
      id: number
      descripcion: string
      action: string
      timestamp: string
    }>
  >(`auditoria-demanda-zona/${demandaId}`, open && !!demandaId)
  const auditHistory = extractArray(auditHistoryData)

  // Extract data from response
  const zonas = mainData?.zonas || []
  const demandaZonas = mainData?.demanda_zonas || []
  const users = mainData?.users || []

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

  // Fetch users for selected zona using the users-zonas endpoint
  useEffect(() => {
    const fetchUsersForZona = async () => {
      if (!selectedZona) {
        setUsersForSelectedZona([])
        return
      }

      setIsLoadingUsersForZona(true)
      try {
        const response = await get<{ count: number; results: UserZona[] }>(
          `users-zonas/?zona=${selectedZona}&page_size=500`
        )

        // Map user IDs from users-zonas to actual user objects from the main users list
        const userIds = response.results?.map((uz) => uz.user) || []
        const filteredUsers = users.filter((user) => userIds.includes(user.id))
        setUsersForSelectedZona(filteredUsers)
      } catch (error) {
        console.error("Error fetching users for zona:", error)
        setUsersForSelectedZona([])
      } finally {
        setIsLoadingUsersForZona(false)
      }
    }

    fetchUsersForZona()
  }, [selectedZona, users])

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
      await refetchMainData()
      setComentarios("")
    } catch (error) {
      console.error("Error assigning demanda:", error)
      toast.error("Error al asignar la demanda")
    } finally {
      setIsLoading(false)
    }
  }

  // Get users for selected zona (now fetched via useEffect above)
  const filteredUsersByZona = useMemo(() => {
    return usersForSelectedZona
  }, [usersForSelectedZona])

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
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Derivar Demanda ${demandaId}`}
      titleIcon={<AssignmentIcon />}
      tabs={[
        { label: "Asignar", icon: <SendIcon fontSize="small" /> },
        { label: "Historia", icon: <HistoryIcon fontSize="small" /> },
      ]}
      activeTab={value}
      onTabChange={handleChange}
      loading={isDataLoading}
      loadingMessage="Cargando datos..."
      maxWidth={700}
      actions={
        value === 0
          ? [
              {
                label: "Asignar",
                onClick: handleAsignar,
                variant: "contained",
                color: "primary",
                disabled: isLoading || !selectedZona,
                loading: isLoading,
                startIcon: <SendIcon />,
              },
              {
                label: "Cerrar",
                onClick: onClose,
                variant: "outlined",
                disabled: isLoading,
              },
            ]
          : [
              {
                label: "Cerrar",
                onClick: onClose,
                variant: "outlined",
                disabled: isLoading,
              },
            ]
      }
    >
      {!isDataLoading && (
        <>
              <TabPanel value={value} index={0} idPrefix="simple-tabpanel" wrapInBox={false}>
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
                        options={filteredUsersByZona}
                        getOptionLabel={(option) => option.username}
                        value={filteredUsersByZona.filter((user) => selectedUsers.includes(user.id))}
                        onChange={(_, newValue) => setSelectedUsers(newValue.map((user) => user.id))}
                        loading={isLoadingUsersForZona}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={isLoadingUsersForZona ? "Cargando usuarios..." : "Seleccione usuarios responsables"}
                            size="small"
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingUsersForZona ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
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
                        disabled={isLoading || isLoadingUsersForZona}
                        noOptionsText={isLoadingUsersForZona ? "Cargando..." : "No hay usuarios en esta zona"}
                      />
                      {selectedUsers.length === 0 && !isLoadingUsersForZona && (
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

              <TabPanel value={value} index={1} idPrefix="simple-tabpanel" wrapInBox={false}>
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
    </BaseModal>
  )
}

export default AsignarModal
