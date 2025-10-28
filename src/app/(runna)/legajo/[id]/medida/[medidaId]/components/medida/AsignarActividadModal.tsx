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
  TextField,
  Autocomplete,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  FormHelperText,
} from "@mui/material"
import {
  Close as CloseIcon,
  Send as SendIcon,
  History as HistoryIcon,
  AssignmentInd as AssignmentIcon,
  CompareArrows as TransferIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import { actividadService } from "../../services/actividadService"
import {
  fetchUsuarios,
  fetchZonas,
  fetchUsersZonas,
} from "@/app/(runna)/legajo-mesa/api/legajo-asignacion-api-service"
import type { TActividadPlanTrabajo, THistorialActividad } from "../../types/actividades"
import type { Usuario, Zona } from "@/app/(runna)/legajo-mesa/types/asignacion-types"

interface AsignarActividadModalProps {
  open: boolean
  onClose: () => void
  actividadId: number | null
  onSuccess?: () => void
}

const AsignarActividadModal: React.FC<AsignarActividadModalProps> = ({
  open,
  onClose,
  actividadId,
  onSuccess,
}) => {
  // Tab control
  const [tabValue, setTabValue] = useState(0)

  // Data loaded
  const [actividad, setActividad] = useState<TActividadPlanTrabajo | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])
  const [userZonas, setUserZonas] = useState<Array<{ user: number; zona: number }>>([])
  const [historial, setHistorial] = useState<THistorialActividad[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== TAB 1: ASIGNAR RESPONSABLE =====
  const [selectedResponsablePrincipal, setSelectedResponsablePrincipal] = useState<number | null>(null)
  const [selectedResponsablesSecundarios, setSelectedResponsablesSecundarios] = useState<number[]>([])
  const [comentariosAsignacion, setComentariosAsignacion] = useState("")

  // ===== TAB 2: TRANSFERIR ENTRE EQUIPOS =====
  const [selectedEquipoDestino, setSelectedEquipoDestino] = useState<number | null>(null)
  const [selectedResponsableNuevo, setSelectedResponsableNuevo] = useState<number | null>(null)
  const [comentariosTransferencia, setComentariosTransferencia] = useState("")

  // Load data when modal opens or actividadId changes
  useEffect(() => {
    if (open && actividadId) {
      // Clear previous state
      setActividad(null)
      setHistorial([])
      setSelectedResponsablePrincipal(null)
      setSelectedResponsablesSecundarios([])
      setSelectedEquipoDestino(null)
      setSelectedResponsableNuevo(null)
      setComentariosAsignacion("")
      setComentariosTransferencia("")
      setTabValue(0)

      // Load data
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, actividadId])

  const loadData = async () => {
    if (!actividadId) return

    setIsLoading(true)
    try {
      const [actividadData, usuariosData, zonasData, userZonasData] = await Promise.all([
        actividadService.get(actividadId),
        fetchUsuarios(),
        fetchZonas(),
        fetchUsersZonas(),
      ])

      setActividad(actividadData)
      setUsuarios(usuariosData)
      setZonas(zonasData)
      setUserZonas(userZonasData)

      // Set current values in form
      setSelectedResponsablePrincipal(actividadData.responsable_principal || null)
      setSelectedResponsablesSecundarios(
        actividadData.responsables_secundarios?.map((r) => r.id) || []
      )

      // Load history for Tab 3
      await loadHistorial()
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const loadHistorial = async () => {
    if (!actividadId) return

    try {
      const historialData = await actividadService.getHistorial(actividadId)
      // Filter for assignment and transfer actions
      const filtered = historialData.filter(
        (h) =>
          h.tipo_accion === "ASIGNACION" ||
          h.tipo_accion === "TRANSFERENCIA" ||
          h.tipo_accion === "MODIFICACION"
      )
      setHistorial(filtered)
    } catch (error) {
      console.error("Error loading historial:", error)
      toast.error("Error al cargar el historial")
    }
  }

  // Filter users by selected zone for transfer tab
  const usuariosFiltrados = useMemo(() => {
    if (!selectedEquipoDestino) return []

    const userIds = userZonas
      .filter((uz) => uz.zona === selectedEquipoDestino)
      .map((uz) => uz.user)

    return usuarios.filter((u) => userIds.includes(u.id))
  }, [selectedEquipoDestino, usuarios, userZonas])

  // Handler for Tab 1: Asignar Responsable
  const handleAsignarResponsable = async () => {
    if (!actividadId || !actividad) {
      toast.error("No hay actividad seleccionada")
      return
    }

    // Validation: at least one responsable must be selected
    if (!selectedResponsablePrincipal && selectedResponsablesSecundarios.length === 0) {
      toast.error("Debe seleccionar al menos un responsable")
      return
    }

    setIsSubmitting(true)
    try {
      await actividadService.update(actividadId, {
        responsable_principal: selectedResponsablePrincipal || undefined,
        responsables_secundarios: selectedResponsablesSecundarios,
      })

      toast.success("Responsables actualizados exitosamente")
      setComentariosAsignacion("")
      await loadData()
      onSuccess?.()
    } catch (error) {
      console.error("Error asignando responsables:", error)
      toast.error("Error al asignar responsables")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for Tab 2: Transferir entre Equipos
  const handleTransferir = async () => {
    if (!actividadId) {
      toast.error("No hay actividad seleccionada")
      return
    }

    if (!selectedEquipoDestino) {
      toast.error("Debe seleccionar un equipo de destino")
      return
    }

    // Validation per PLTM-02: comentarios required, min 15 chars
    if (!comentariosTransferencia || comentariosTransferencia.trim().length < 15) {
      toast.error("Los comentarios son obligatorios (mínimo 15 caracteres)")
      return
    }

    setIsSubmitting(true)
    try {
      await actividadService.transferir(actividadId, {
        equipo_destino: selectedEquipoDestino,
        responsable_nuevo_id: selectedResponsableNuevo || undefined,
        motivo: comentariosTransferencia,
      })

      toast.success("Actividad transferida exitosamente")
      setComentariosTransferencia("")
      setSelectedEquipoDestino(null)
      setSelectedResponsableNuevo(null)
      await loadData()
      onSuccess?.()
    } catch (error) {
      console.error("Error transfiriendo actividad:", error)
      toast.error("Error al transferir la actividad")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case "ASIGNACION":
        return "Asignación"
      case "TRANSFERENCIA":
        return "Transferencia"
      case "MODIFICACION":
        return "Modificación"
      default:
        return accion
    }
  }

  const getUserDisplayName = (user: Usuario) => {
    return user.nombre_completo || `${user.first_name} ${user.last_name}`.trim() || user.username
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="asignar-actividad-modal">
      <Paper
        elevation={5}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
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
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
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
            <AssignmentIcon /> Asignar Actividad #{actividadId}
          </Typography>
          <Tooltip title="Cerrar">
            <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="asignar actividad tabs">
            <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Asignar Responsable" />
            <Tab icon={<TransferIcon fontSize="small" />} iconPosition="start" label="Transferir Equipo" />
            <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Historial" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {/* TAB 1: ASIGNAR RESPONSABLE */}
              {tabValue === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Alert severity="info">
                    Asignar o modificar los responsables de esta actividad.
                  </Alert>

                  {/* Show current responsables */}
                  {actividad && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.50",
                        border: "1px solid",
                        borderColor: "success.200",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="success.dark" sx={{ mb: 1, fontWeight: 600 }}>
                        Asignación Actual:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Principal:
                          </Typography>
                          {actividad.responsable_principal_info ? (
                            <Chip
                              label={getUserDisplayName(actividad.responsable_principal_info)}
                              size="small"
                              color="primary"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin asignar
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Secundarios:
                          </Typography>
                          {actividad.responsables_secundarios && actividad.responsables_secundarios.length > 0 ? (
                            actividad.responsables_secundarios.map((r) => (
                              <Chip
                                key={r.id}
                                label={getUserDisplayName(r)}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin asignar
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Responsable Principal
                    </Typography>
                    <Autocomplete
                      options={usuarios}
                      getOptionLabel={(option) => getUserDisplayName(option)}
                      value={usuarios.find((u) => u.id === selectedResponsablePrincipal) || null}
                      onChange={(_, newValue) => setSelectedResponsablePrincipal(newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione un responsable principal" size="small" />
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Responsables Secundarios
                    </Typography>
                    <Autocomplete
                      multiple
                      options={usuarios}
                      getOptionLabel={(option) => getUserDisplayName(option)}
                      value={usuarios.filter((u) => selectedResponsablesSecundarios.includes(u.id))}
                      onChange={(_, newValue) => setSelectedResponsablesSecundarios(newValue.map((u) => u.id))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Seleccione responsables secundarios"
                          size="small"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option.id}
                            label={getUserDisplayName(option)}
                            size="small"
                            {...getTagProps({ index })}
                            sx={{
                              bgcolor: "secondary.light",
                              color: "secondary.contrastText",
                              fontWeight: 500,
                            }}
                          />
                        ))
                      }
                      disabled={isSubmitting}
                    />
                    <FormHelperText>
                      Al menos uno (principal o secundario) es requerido
                    </FormHelperText>
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios (opcional)
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      value={comentariosAsignacion}
                      onChange={(e) => setComentariosAsignacion(e.target.value)}
                      placeholder="Añada comentarios sobre esta asignación..."
                      size="small"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </Box>
              )}

              {/* TAB 2: TRANSFERIR ENTRE EQUIPOS */}
              {tabValue === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Alert severity="warning">
                    Transferir esta actividad a otro equipo/zona. Esta operación quedará registrada en el historial.
                  </Alert>

                  {/* Show current team */}
                  {actividad && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "info.50",
                        border: "1px solid",
                        borderColor: "info.200",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="info.dark" sx={{ mb: 1, fontWeight: 600 }}>
                        Equipo Actual:
                      </Typography>
                      <Typography variant="body2">
                        {actividad.equipo_info?.nombre || "No especificado"}
                      </Typography>
                    </Box>
                  )}

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Equipo Destino *
                    </Typography>
                    <Autocomplete
                      options={zonas}
                      getOptionLabel={(option) => option.nombre}
                      value={zonas.find((z) => z.id === selectedEquipoDestino) || null}
                      onChange={(_, newValue) => {
                        setSelectedEquipoDestino(newValue?.id || null)
                        setSelectedResponsableNuevo(null) // Reset user when zone changes
                      }}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione un equipo destino" size="small" />
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  {selectedEquipoDestino && (
                    <FormControl fullWidth>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Responsable Nuevo (opcional)
                      </Typography>
                      <Autocomplete
                        options={usuariosFiltrados}
                        getOptionLabel={(option) => getUserDisplayName(option)}
                        value={usuariosFiltrados.find((u) => u.id === selectedResponsableNuevo) || null}
                        onChange={(_, newValue) => setSelectedResponsableNuevo(newValue?.id || null)}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Seleccione un responsable" size="small" />
                        )}
                        disabled={isSubmitting}
                        noOptionsText="No hay usuarios en este equipo"
                      />
                      <FormHelperText>
                        Si no selecciona, la actividad quedará sin responsable asignado en el nuevo equipo
                      </FormHelperText>
                    </FormControl>
                  )}

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios * (mínimo 15 caracteres)
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      value={comentariosTransferencia}
                      onChange={(e) => setComentariosTransferencia(e.target.value)}
                      placeholder="Motivo de la transferencia (obligatorio, mín. 15 caracteres)..."
                      size="small"
                      disabled={isSubmitting}
                      error={comentariosTransferencia.length > 0 && comentariosTransferencia.length < 15}
                      helperText={
                        comentariosTransferencia.length > 0 && comentariosTransferencia.length < 15
                          ? `${comentariosTransferencia.length}/15 caracteres`
                          : ""
                      }
                    />
                  </FormControl>
                </Box>
              )}

              {/* TAB 3: HISTORIAL */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={500} sx={{ mb: 2 }}>
                    Historial de asignaciones y transferencias
                  </Typography>

                  {historial.length > 0 ? (
                    <List
                      sx={{
                        maxHeight: "400px",
                        overflow: "auto",
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 0,
                      }}
                    >
                      {historial
                        .sort((a, b) => new Date(b.fecha_accion).getTime() - new Date(a.fecha_accion).getTime())
                        .map((record, index) => (
                          <ListItem
                            key={record.id}
                            divider={index < historial.length - 1}
                            sx={{
                              py: 1.5,
                              px: 2,
                              flexDirection: "column",
                              alignItems: "flex-start",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap", alignItems: "center" }}>
                              <Chip
                                label={getAccionLabel(record.tipo_accion)}
                                size="small"
                                color="primary"
                                variant="filled"
                              />
                              <Chip
                                label={`ID: ${record.id}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {record.descripcion}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                    sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                                  >
                                    <strong>Fecha:</strong> {formatDate(record.fecha_accion)}
                                    {record.usuario_nombre && (
                                      <>
                                        <span>•</span>
                                        <strong>Usuario:</strong> {record.usuario_nombre}
                                      </>
                                    )}
                                  </Typography>
                                  {record.comentarios && record.comentarios.trim() !== "" && (
                                    <Typography
                                      variant="caption"
                                      component="div"
                                      sx={{
                                        mt: 0.5,
                                        p: 1,
                                        bgcolor: "grey.50",
                                        borderRadius: 1,
                                        fontStyle: "italic",
                                      }}
                                    >
                                      <strong>Comentarios:</strong> {record.comentarios}
                                    </Typography>
                                  )}
                                </Box>
                              }
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
                        No hay registros de asignaciones o transferencias.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Footer */}
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
          {tabValue === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsignarResponsable}
              disabled={
                isSubmitting ||
                (!selectedResponsablePrincipal && selectedResponsablesSecundarios.length === 0)
              }
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isSubmitting ? "Procesando..." : "Actualizar Asignación"}
            </Button>
          )}

          {tabValue === 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleTransferir}
              disabled={
                isSubmitting ||
                !selectedEquipoDestino ||
                !comentariosTransferencia ||
                comentariosTransferencia.trim().length < 15
              }
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isSubmitting ? "Procesando..." : "Transferir"}
            </Button>
          )}

          <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ ml: "auto" }}>
            Cerrar
          </Button>
        </Box>
      </Paper>
    </Modal>
  )
}

export default AsignarActividadModal
