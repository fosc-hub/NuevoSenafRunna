"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  FormControl,
  TextField,
  Autocomplete,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  FormHelperText,
} from "@mui/material"
import {
  Send as SendIcon,
  History as HistoryIcon,
  AssignmentInd as AssignmentIcon,
  CompareArrows as TransferIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import BaseModal from "@/components/shared/BaseModal"
import { useFormSubmission } from "@/hooks"
import { actividadService } from "../../services/actividadService"
import { useCatalogData, useConditionalData, extractArray } from "@/hooks/useApiQuery"
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

  // Fetch data using TanStack Query - React Query will parallelize these automatically
  const { data: actividad, isLoading: isLoadingActividad } = useConditionalData<TActividadPlanTrabajo>(
    `actividades/${actividadId}`,
    open && !!actividadId,
    undefined,
    {
      queryFn: () => actividadService.get(actividadId!),
    }
  )

  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<Usuario[]>(
    "users/"
  )
  const usuarios = extractArray(usuariosData)

  const { data: zonasData, isLoading: isLoadingZonas } = useCatalogData<Zona[]>(
    "zonas/"
  )
  const zonas = extractArray(zonasData)

  const { data: userZonasData, isLoading: isLoadingUserZonas } = useCatalogData<Array<{ id: number; user: number; zona: number }>>(
    "users-zonas/"
  )
  const userZonas = extractArray(userZonasData)

  const { data: historialData, isLoading: isLoadingHistorial } = useConditionalData<THistorialActividad[]>(
    `actividades/${actividadId}/historial`,
    open && !!actividadId,
    undefined,
    {
      queryFn: () => actividadService.getHistorial(actividadId!),
    }
  )

  // Filter historial for relevant actions
  const historial = useMemo(() => {
    const historialArray = extractArray(historialData)
    return historialArray.filter(
      (h) =>
        h.tipo_accion === "ASIGNACION" ||
        h.tipo_accion === "TRANSFERENCIA" ||
        h.tipo_accion === "MODIFICACION"
    )
  }, [historialData])

  // Combine loading states
  const isLoading = isLoadingActividad || isLoadingUsuarios || isLoadingZonas || isLoadingUserZonas || isLoadingHistorial

  // ===== TAB 1: ASIGNAR RESPONSABLE =====
  const [selectedResponsablePrincipal, setSelectedResponsablePrincipal] = useState<number | null>(
    actividad?.responsable_principal || null
  )
  const [selectedResponsablesSecundarios, setSelectedResponsablesSecundarios] = useState<number[]>(
    actividad?.responsables_secundarios?.map((r) => r.id) || []
  )
  const [comentariosAsignacion, setComentariosAsignacion] = useState("")

  // ===== TAB 2: TRANSFERIR ENTRE EQUIPOS =====
  const [selectedEquipoDestino, setSelectedEquipoDestino] = useState<number | null>(null)
  const [selectedResponsableNuevo, setSelectedResponsableNuevo] = useState<number | null>(null)
  const [comentariosTransferencia, setComentariosTransferencia] = useState("")

  // Filter users by selected zone for transfer tab
  const usuariosFiltrados = useMemo(() => {
    if (!selectedEquipoDestino) return []

    const userIds = userZonas
      .filter((uz) => uz.zona === selectedEquipoDestino)
      .map((uz) => uz.user)

    return usuarios.filter((u) => userIds.includes(u.id))
  }, [selectedEquipoDestino, usuarios, userZonas])

  // ========== Form Submission Hooks ==========

  // Handler for Tab 1: Asignar Responsable
  const { submit: submitAsignar, isLoading: isLoadingAsignar } = useFormSubmission({
    onSubmit: async () => {
      await actividadService.update(actividadId!, {
        responsable_principal: selectedResponsablePrincipal || undefined,
        responsables_secundarios: selectedResponsablesSecundarios,
      })
    },
    validate: () => {
      if (!actividadId || !actividad) return "No hay actividad seleccionada"
      if (!selectedResponsablePrincipal && selectedResponsablesSecundarios.length === 0) {
        return "Debe seleccionar al menos un responsable"
      }
      return undefined
    },
    showSuccessToast: true,
    successMessage: "Responsables actualizados exitosamente",
    showErrorToast: true,
    onSuccess: () => {
      setComentariosAsignacion("")
      onSuccess?.()
    },
  })

  // Handler for Tab 2: Transferir entre Equipos
  const { submit: submitTransferir, isLoading: isLoadingTransferir } = useFormSubmission({
    onSubmit: async () => {
      await actividadService.transferir(actividadId!, {
        equipo_destino: selectedEquipoDestino!,
        responsable_nuevo_id: selectedResponsableNuevo || undefined,
        motivo: comentariosTransferencia,
      })
    },
    validate: () => {
      if (!actividadId) return "No hay actividad seleccionada"
      if (!selectedEquipoDestino) return "Debe seleccionar un equipo de destino"
      if (!comentariosTransferencia || comentariosTransferencia.trim().length < 15) {
        return "Los comentarios son obligatorios (mínimo 15 caracteres)"
      }
      return undefined
    },
    showSuccessToast: true,
    successMessage: "Actividad transferida exitosamente",
    showErrorToast: true,
    onSuccess: () => {
      setComentariosTransferencia("")
      setSelectedEquipoDestino(null)
      setSelectedResponsableNuevo(null)
      onSuccess?.()
    },
  })

  // Combine submission loading states
  const isSubmitting = isLoadingAsignar || isLoadingTransferir

  const handleAsignarResponsable = () => submitAsignar({})
  const handleTransferir = () => submitTransferir({})

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
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Asignar Actividad #${actividadId}`}
      titleIcon={<AssignmentIcon />}
      tabs={[
        { label: "Asignar Responsable", icon: <AssignmentIcon fontSize="small" /> },
        { label: "Transferir Equipo", icon: <TransferIcon fontSize="small" /> },
        { label: "Historial", icon: <HistoryIcon fontSize="small" /> },
      ]}
      activeTab={tabValue}
      onTabChange={handleTabChange}
      loading={isLoading}
      loadingMessage="Cargando actividad..."
      maxWidth={800}
      actions={
        tabValue === 0
          ? [
              {
                label: "Actualizar Asignación",
                onClick: handleAsignarResponsable,
                variant: "contained",
                color: "primary",
                disabled:
                  isSubmitting ||
                  (!selectedResponsablePrincipal && selectedResponsablesSecundarios.length === 0),
                loading: isSubmitting,
                startIcon: <SendIcon />,
              },
              {
                label: "Cerrar",
                onClick: onClose,
                variant: "outlined",
                disabled: isSubmitting,
              },
            ]
          : tabValue === 1
            ? [
                {
                  label: "Transferir",
                  onClick: handleTransferir,
                  variant: "contained",
                  color: "primary",
                  disabled:
                    isSubmitting ||
                    !selectedEquipoDestino ||
                    !comentariosTransferencia ||
                    comentariosTransferencia.trim().length < 15,
                  loading: isSubmitting,
                  startIcon: <SendIcon />,
                },
                {
                  label: "Cerrar",
                  onClick: onClose,
                  variant: "outlined",
                  disabled: isSubmitting,
                },
              ]
            : [
                {
                  label: "Cerrar",
                  onClick: onClose,
                  variant: "outlined",
                  disabled: isSubmitting,
                },
              ]
      }
    >
      {!isLoading && (
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
    </BaseModal>
  )
}

export default AsignarActividadModal
