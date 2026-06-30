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
} from "@mui/material"
import {
  Close as CloseIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  AssignmentInd as AssignmentIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import { useCatalogData, useConditionalData, extractArray } from "@/hooks/useApiQuery"
import { sincronizarAsignaciones } from "../api/legajo-asignacion-api-service"
import type {
  Zona,
  HistorialAsignacion,
  LegajoAsignacionesResponse,
  TipoResponsabilidad,
} from "../types/asignacion-types"

interface AsignarLegajoModalProps {
  open: boolean
  onClose: () => void
  legajoId: number | null
  onAsignacionComplete?: () => void
}

// Usuario tal como lo devuelve GET /api/users/
interface RawUsuario {
  id: number
  username: string
  first_name: string
  last_name: string
  email?: string
  is_active?: boolean
}

interface UsuarioOption {
  id: number
  nombre_completo: string
}

const toNombreCompleto = (u: RawUsuario): string =>
  `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username

const AsignarLegajoModal: React.FC<AsignarLegajoModalProps> = ({
  open,
  onClose,
  legajoId,
  onAsignacionComplete,
}) => {
  // Tab control: 0 = Asignaciones (editor), 1 = Historial
  const [tabValue, setTabValue] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== Estado del editor (selecciones por categoría) =====
  const [trabajoZonas, setTrabajoZonas] = useState<number[]>([])
  const [trabajoUsuarios, setTrabajoUsuarios] = useState<number[]>([])
  const [centroVidaZonas, setCentroVidaZonas] = useState<number[]>([])
  const [centroVidaUsuarios, setCentroVidaUsuarios] = useState<number[]>([])
  const [comentarios, setComentarios] = useState("")

  // ===== Catálogos =====
  const { data: zonasData, isLoading: isLoadingZonas } = useCatalogData<Zona[]>("zonas/")
  const zonas = extractArray(zonasData)

  // TODOS los usuarios (sin filtrar por zona)
  const { data: usuariosData, isLoading: isLoadingUsuarios } = useCatalogData<RawUsuario[]>(
    "users/?page_size=500"
  )
  const usuarios = useMemo<UsuarioOption[]>(
    () =>
      extractArray(usuariosData).map((u) => ({
        id: u.id,
        nombre_completo: toNombreCompleto(u),
      })),
    [usuariosData]
  )

  // ===== Estado actual del legajo =====
  const {
    data: legajoData,
    isLoading: isLoadingLegajo,
    refetch: refetchLegajo,
  } = useConditionalData<LegajoAsignacionesResponse>(`legajo/${legajoId}/`, open && !!legajoId)

  // ===== Historial =====
  const {
    data: historialData,
    isLoading: isLoadingHistorial,
    refetch: refetchHistorial,
  } = useConditionalData<HistorialAsignacion[]>(
    `legajo/${legajoId}/historial-asignaciones/`,
    open && !!legajoId
  )
  const historial = extractArray(historialData)

  const isLoading = isLoadingZonas || isLoadingUsuarios || isLoadingLegajo

  // Prefill desde el estado actual del legajo cuando carga / se refresca
  useEffect(() => {
    const asignaciones = legajoData?.asignaciones
    if (!asignaciones) return
    setTrabajoZonas((asignaciones.trabajo?.zonas ?? []).map((z) => z.id))
    setTrabajoUsuarios((asignaciones.trabajo?.usuarios ?? []).map((u) => u.id))
    setCentroVidaZonas((asignaciones.centro_vida?.zonas ?? []).map((z) => z.id))
    setCentroVidaUsuarios((asignaciones.centro_vida?.usuarios ?? []).map((u) => u.id))
  }, [legajoData])

  // Reset de tab al abrir
  useEffect(() => {
    if (open) setTabValue(0)
  }, [open])

  const handleGuardar = async () => {
    if (!legajoId) return

    setIsSubmitting(true)
    try {
      await sincronizarAsignaciones(legajoId, {
        trabajo: { zonas: trabajoZonas, usuarios: trabajoUsuarios },
        centro_vida: { zonas: centroVidaZonas, usuarios: centroVidaUsuarios },
        ...(comentarios.trim() ? { comentarios: comentarios.trim() } : {}),
      })

      toast.success("Asignaciones guardadas correctamente")
      setComentarios("")
      await Promise.all([refetchLegajo(), refetchHistorial()])
      onAsignacionComplete?.()
    } catch (error) {
      console.error("Error guardando asignaciones:", error)
      toast.error("Error al guardar las asignaciones")
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

  const getTipoLabel = (tipo: TipoResponsabilidad | string) => {
    switch (tipo) {
      case "TRABAJO":
        return "Equipo de Trabajo"
      case "CENTRO_VIDA":
        return "Centro de Vida"
      case "JUDICIAL":
        return "Judicial"
      default:
        return tipo
    }
  }

  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case "DERIVACION":
        return "Derivación"
      case "ASIGNACION":
        return "Asignación"
      case "MODIFICACION":
        return "Modificación"
      case "DESACTIVACION":
        return "Desactivación"
      default:
        return accion
    }
  }

  // Sección reutilizable para una categoría
  const CategoriaSection = ({
    title,
    icon,
    zonasSeleccionadas,
    usuariosSeleccionados,
    onZonasChange,
    onUsuariosChange,
  }: {
    title: string
    icon: React.ReactNode
    zonasSeleccionadas: number[]
    usuariosSeleccionados: number[]
    onZonasChange: (ids: number[]) => void
    onUsuariosChange: (ids: number[]) => void
  }) => (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1, mb: 2, color: "primary.main" }}
      >
        {icon} {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Zonas / Equipos
          </Typography>
          <Autocomplete
            multiple
            options={zonas}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={zonas.filter((z) => zonasSeleccionadas.includes(z.id))}
            onChange={(_, newValue) => onZonasChange(newValue.map((z) => z.id))}
            renderInput={(params) => (
              <TextField {...params} placeholder="Seleccione zonas" size="small" />
            )}
            disabled={isSubmitting}
          />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Usuarios responsables
          </Typography>
          <Autocomplete
            multiple
            options={usuarios}
            getOptionLabel={(option) => option.nombre_completo}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={usuarios.filter((u) => usuariosSeleccionados.includes(u.id))}
            onChange={(_, newValue) => onUsuariosChange(newValue.map((u) => u.id))}
            renderInput={(params) => (
              <TextField {...params} placeholder="Seleccione usuarios" size="small" />
            )}
            disabled={isSubmitting}
          />
        </Box>
      </Box>
    </Paper>
  )

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="asignar-legajo-modal">
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
            sx={{ color: "primary.main", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
          >
            <AssignmentIcon /> Asignar Legajo #{legajoId}
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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="asignar legajo tabs">
            <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Asignaciones" />
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
              {/* TAB 0: ASIGNACIONES (editor de un paso) */}
              {tabValue === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Alert severity="info">
                    Defina las zonas/equipos y los usuarios responsables para cada categoría. Al guardar, el
                    sistema dará de alta lo agregado y de baja lo quitado.
                  </Alert>

                  <CategoriaSection
                    title="Equipo de Trabajo"
                    icon={<GroupsIcon fontSize="small" />}
                    zonasSeleccionadas={trabajoZonas}
                    usuariosSeleccionados={trabajoUsuarios}
                    onZonasChange={setTrabajoZonas}
                    onUsuariosChange={setTrabajoUsuarios}
                  />

                  <CategoriaSection
                    title="Centro de Vida"
                    icon={<HomeIcon fontSize="small" />}
                    zonasSeleccionadas={centroVidaZonas}
                    usuariosSeleccionados={centroVidaUsuarios}
                    onZonasChange={setCentroVidaZonas}
                    onUsuariosChange={setCentroVidaUsuarios}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios (opcional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="Añada comentarios sobre estos cambios..."
                      size="small"
                      disabled={isSubmitting}
                    />
                  </Box>
                </Box>
              )}

              {/* TAB 1: HISTORIAL */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={500} sx={{ mb: 2 }}>
                    Historial de asignaciones para este legajo
                  </Typography>

                  {isLoadingHistorial ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                      <CircularProgress size={32} />
                    </Box>
                  ) : historial.length > 0 ? (
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
                        .slice()
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
                              <Chip label={getAccionLabel(record.accion)} size="small" color="primary" variant="filled" />
                              <Chip
                                label={getTipoLabel(record.tipo_responsabilidad)}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                              <Chip label={`ID: ${record.id}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                            </Box>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Zona: {record.zona_nombre}
                                    {record.user_responsable_nombre && ` → Responsable: ${record.user_responsable_nombre}`}
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
                                    {record.realizado_por_nombre && (
                                      <>
                                        <span>•</span>
                                        <strong>Realizado por:</strong> {record.realizado_por_nombre || `ID ${record.realizado_por}`}
                                      </>
                                    )}
                                  </Typography>
                                  {record.comentarios && record.comentarios.trim() !== "" && (
                                    <Typography
                                      variant="caption"
                                      component="div"
                                      sx={{ mt: 0.5, p: 1, bgcolor: "grey.50", borderRadius: 1, fontStyle: "italic" }}
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
                        No hay registros de historial disponibles.
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
              onClick={handleGuardar}
              disabled={isSubmitting || !legajoId}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
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

export default AsignarLegajoModal
