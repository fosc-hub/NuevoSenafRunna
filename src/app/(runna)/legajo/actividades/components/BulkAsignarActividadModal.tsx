"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Box,
  Typography,
  FormControl,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material"
import {
  Send as SendIcon,
  AssignmentInd as AssignmentIcon,
  CompareArrows as TransferIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import BaseModal from "@/components/shared/BaseModal"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"
import { actividadService } from "../../[id]/medida/[medidaId]/services/actividadService"
import type { TActividadPlanTrabajo, BulkOperationResponse } from "../../[id]/medida/[medidaId]/types/actividades"
import type { Usuario } from "@/app/(runna)/legajo-mesa/types/asignacion-types"

interface BulkAsignarActividadModalProps {
  open: boolean
  onClose: () => void
  selectedActividades: TActividadPlanTrabajo[]
  onSuccess?: () => void
}

const BulkAsignarActividadModal: React.FC<BulkAsignarActividadModalProps> = ({
  open,
  onClose,
  selectedActividades,
  onSuccess,
}) => {
  // Tab control
  const [tabValue, setTabValue] = useState(0)

  // Operation result state
  const [operationResult, setOperationResult] = useState<BulkOperationResponse | null>(null)

  // Fetch users
  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<Usuario[]>("users/")
  const usuarios = extractArray(usuariosData)

  // ===== TAB 1: BULK ASSIGN RESPONSABLES =====
  const [selectedResponsablePrincipal, setSelectedResponsablePrincipal] = useState<number | null>(null)
  const [selectedResponsablesSecundarios, setSelectedResponsablesSecundarios] = useState<number[]>([])

  // ===== TAB 2: BULK TRANSFER =====
  const [selectedResponsableNuevo, setSelectedResponsableNuevo] = useState<number | null>(null)
  const [motivoTransferencia, setMotivoTransferencia] = useState("")

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get activity IDs
  const actividadIds = useMemo(
    () => selectedActividades.map((a) => a.id),
    [selectedActividades]
  )

  // Get summary of selected activities
  const actividadesSummary = useMemo(() => {
    const estadoCounts: Record<string, number> = {}
    const actorCounts: Record<string, number> = {}

    selectedActividades.forEach((a) => {
      estadoCounts[a.estado_display || a.estado] = (estadoCounts[a.estado_display || a.estado] || 0) + 1
      actorCounts[a.actor_display || a.actor] = (actorCounts[a.actor_display || a.actor] || 0) + 1
    })

    return { estadoCounts, actorCounts }
  }, [selectedActividades])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setOperationResult(null) // Reset result when switching tabs
  }

  const getUserDisplayName = (user: Usuario | { id: number; username: string; nombre_completo?: string; full_name?: string }) => {
    if ('nombre_completo' in user && user.nombre_completo) return user.nombre_completo
    if ('full_name' in user && user.full_name) return user.full_name
    if ('first_name' in user && 'last_name' in user) {
      const fullName = `${user.first_name} ${user.last_name}`.trim()
      if (fullName) return fullName
    }
    return user.username
  }

  // Handler for Tab 1: Bulk Assign Responsables
  const handleBulkAssign = async () => {
    if (!selectedResponsablePrincipal && selectedResponsablesSecundarios.length === 0) {
      toast.error("Debe seleccionar al menos un responsable")
      return
    }

    setIsSubmitting(true)
    setOperationResult(null)

    try {
      const result = await actividadService.bulkUpdate({
        actividad_ids: actividadIds,
        updates: {
          ...(selectedResponsablePrincipal ? { responsable_principal: selectedResponsablePrincipal } : {}),
          ...(selectedResponsablesSecundarios.length > 0 ? { responsables_secundarios: selectedResponsablesSecundarios } : {}),
        },
      })

      setOperationResult(result)

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Operación parcial: ${result.updated_count} actualizadas, ${result.errors.length} errores`)
      } else {
        toast.success(`${result.updated_count} actividades actualizadas exitosamente`)
        onSuccess?.()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error al actualizar las actividades"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for Tab 2: Bulk Transfer
  const handleBulkTransfer = async () => {
    if (!selectedResponsableNuevo) {
      toast.error("Debe seleccionar un responsable nuevo")
      return
    }

    if (!motivoTransferencia || motivoTransferencia.trim().length < 10) {
      toast.error("El motivo es obligatorio (mínimo 10 caracteres)")
      return
    }

    setIsSubmitting(true)
    setOperationResult(null)

    try {
      const result = await actividadService.bulkTransfer({
        actividad_ids: actividadIds,
        responsable_nuevo: selectedResponsableNuevo,
        motivo: motivoTransferencia,
      })

      setOperationResult(result)

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Operación parcial: ${result.transferred_count} transferidas, ${result.errors.length} errores`)
      } else {
        toast.success(`${result.transferred_count} actividades transferidas exitosamente`)
        onSuccess?.()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error al transferir las actividades"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state on close
    setSelectedResponsablePrincipal(null)
    setSelectedResponsablesSecundarios([])
    setSelectedResponsableNuevo(null)
    setMotivoTransferencia("")
    setOperationResult(null)
    setTabValue(0)
    onClose()
  }

  const canAssign = selectedResponsablePrincipal !== null || selectedResponsablesSecundarios.length > 0
  const canTransfer = selectedResponsableNuevo !== null && motivoTransferencia.trim().length >= 10

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={`Asignación Masiva (${selectedActividades.length} actividades)`}
      titleIcon={<AssignmentIcon />}
      tabs={[
        { label: "Asignar Responsables", icon: <AssignmentIcon fontSize="small" /> },
        { label: "Transferir", icon: <TransferIcon fontSize="small" /> },
      ]}
      activeTab={tabValue}
      onTabChange={handleTabChange}
      loading={isLoadingUsuarios}
      loadingMessage="Cargando usuarios..."
      maxWidth={800}
      minHeight={600}
      actions={
        tabValue === 0
          ? [
              {
                label: "Asignar a Todas",
                onClick: handleBulkAssign,
                variant: "contained",
                color: "primary",
                disabled: isSubmitting || !canAssign,
                loading: isSubmitting,
                startIcon: <SendIcon />,
              },
              {
                label: "Cerrar",
                onClick: handleClose,
                variant: "outlined",
                disabled: isSubmitting,
              },
            ]
          : [
              {
                label: "Transferir Todas",
                onClick: handleBulkTransfer,
                variant: "contained",
                color: "primary",
                disabled: isSubmitting || !canTransfer,
                loading: isSubmitting,
                startIcon: <SendIcon />,
              },
              {
                label: "Cerrar",
                onClick: handleClose,
                variant: "outlined",
                disabled: isSubmitting,
              },
            ]
      }
    >
      {/* Summary of selected activities */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "primary.50",
          border: "1px solid",
          borderColor: "primary.200",
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 1, fontWeight: 600 }}>
          Actividades Seleccionadas: {selectedActividades.length}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Por Estado:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {Object.entries(actividadesSummary.estadoCounts).map(([estado, count]) => (
                <Chip key={estado} label={`${estado}: ${count}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Por Equipo:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {Object.entries(actividadesSummary.actorCounts).map(([actor, count]) => (
                <Chip key={actor} label={`${actor}: ${count}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Operation Result */}
      {operationResult && (
        <Box sx={{ mb: 3 }}>
          {operationResult.errors && operationResult.errors.length > 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Operación parcial completada
              </Typography>
              <Typography variant="body2">
                {tabValue === 0
                  ? `${operationResult.updated_count} actividades actualizadas`
                  : `${operationResult.transferred_count} actividades transferidas`}
                , {operationResult.errors.length} errores:
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {operationResult.errors.map((err, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Actividad #${err.actividad_id}: ${err.error}`}
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          ) : (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Operación completada exitosamente
              </Typography>
              <Typography variant="body2">
                {tabValue === 0
                  ? `${operationResult.updated_count} actividades actualizadas`
                  : `${operationResult.transferred_count} actividades transferidas`}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {!isLoadingUsuarios && (
        <>
          {/* TAB 1: BULK ASSIGN RESPONSABLES */}
          {tabValue === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Alert severity="info">
                Asigne responsables a las {selectedActividades.length} actividades seleccionadas.
                Los responsables actuales serán reemplazados.
              </Alert>

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
                <FormHelperText>
                  El responsable principal será asignado a todas las actividades seleccionadas
                </FormHelperText>
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
                  Los responsables secundarios serán agregados a todas las actividades seleccionadas
                </FormHelperText>
              </FormControl>

              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2">
                  <strong>Atención:</strong> Esta acción reemplazará los responsables actuales de las {selectedActividades.length} actividades seleccionadas.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* TAB 2: BULK TRANSFER */}
          {tabValue === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Alert severity="info">
                Transfiera las {selectedActividades.length} actividades seleccionadas a un nuevo responsable.
                Esta operación quedará registrada en el historial de cada actividad.
              </Alert>

              <FormControl fullWidth>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Nuevo Responsable *
                </Typography>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => getUserDisplayName(option)}
                  value={usuarios.find((u) => u.id === selectedResponsableNuevo) || null}
                  onChange={(_, newValue) => setSelectedResponsableNuevo(newValue?.id || null)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Seleccione el nuevo responsable" size="small" />
                  )}
                  disabled={isSubmitting}
                />
                <FormHelperText>
                  Todas las actividades serán transferidas a este usuario
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Motivo de la Transferencia * (mínimo 10 caracteres)
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  value={motivoTransferencia}
                  onChange={(e) => setMotivoTransferencia(e.target.value)}
                  placeholder="Describa el motivo de la transferencia..."
                  size="small"
                  disabled={isSubmitting}
                  error={motivoTransferencia.length > 0 && motivoTransferencia.length < 10}
                  helperText={
                    motivoTransferencia.length > 0 && motivoTransferencia.length < 10
                      ? `${motivoTransferencia.length}/10 caracteres`
                      : ""
                  }
                />
              </FormControl>

              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2">
                  <strong>Atención:</strong> Esta acción transferirá {selectedActividades.length} actividades al nuevo responsable.
                  Cada transferencia quedará registrada en el historial de la actividad.
                </Typography>
              </Alert>
            </Box>
          )}
        </>
      )}

      {/* List of selected activities */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Actividades a procesar:
      </Typography>
      <Box
        sx={{
          maxHeight: 200,
          overflow: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <List dense disablePadding>
          {selectedActividades.map((actividad, index) => (
            <ListItem
              key={actividad.id}
              divider={index < selectedActividades.length - 1}
              sx={{ py: 1 }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    #{actividad.id} - {actividad.tipo_actividad_info?.nombre || "Sin tipo"}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    {actividad.legajo_info && (
                      <Chip
                        label={`${actividad.legajo_info.nnya_apellido}, ${actividad.legajo_info.nnya_nombre}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                    <Chip
                      label={actividad.estado_display || actividad.estado}
                      size="small"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                    {actividad.responsable_principal_info && (
                      <Chip
                        label={`Resp: ${getUserDisplayName(actividad.responsable_principal_info)}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </BaseModal>
  )
}

export default BulkAsignarActividadModal
