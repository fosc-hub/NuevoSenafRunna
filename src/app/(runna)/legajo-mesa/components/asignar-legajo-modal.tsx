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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
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
  CompareArrows as DerivacionIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import {
  derivarLegajo,
  asignarLegajo,
  reasignarLegajo,
  rederivarLegajo,
  fetchHistorialAsignaciones,
  fetchZonas,
  fetchLocalesCentroVida,
  fetchUsuarios,
  fetchUsersZonas,
  fetchLegajoParaAsignacion,
} from "../api/legajo-asignacion-api-service"
import type {
  TipoResponsabilidad,
  Zona,
  Usuario,
  LocalCentroVida,
  HistorialAsignacion,
  AsignacionActual,
} from "../types/asignacion-types"

interface AsignarLegajoModalProps {
  open: boolean
  onClose: () => void
  legajoId: number | null
  onAsignacionComplete?: () => void
}

const AsignarLegajoModal: React.FC<AsignarLegajoModalProps> = ({
  open,
  onClose,
  legajoId,
  onAsignacionComplete,
}) => {
  // Tab control
  const [tabValue, setTabValue] = useState(0)

  // Data cargada
  const [zonas, setZonas] = useState<Zona[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [localesCentroVida, setLocalesCentroVida] = useState<LocalCentroVida[]>([])
  const [historial, setHistorial] = useState<HistorialAsignacion[]>([])
  const [userZonas, setUserZonas] = useState<Array<{ user: number; zona: number }>>([])
  const [legajoData, setLegajoData] = useState<any>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== TAB 1: DERIVAR A ZONA =====
  const [selectedZonaDerivacion, setSelectedZonaDerivacion] = useState<number | null>(null)
  const [tipoResponsabilidadDerivacion, setTipoResponsabilidadDerivacion] =
    useState<TipoResponsabilidad>("TRABAJO")
  const [comentariosDerivacion, setComentariosDerivacion] = useState("")
  const [notificarEquipo, setNotificarEquipo] = useState(true)

  // ===== TAB 2: ASIGNAR RESPONSABLE =====
  const [tipoResponsabilidadAsignacion, setTipoResponsabilidadAsignacion] =
    useState<TipoResponsabilidad>("TRABAJO")
  const [selectedZonaAsignacion, setSelectedZonaAsignacion] = useState<number | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<number | null>(null)
  const [selectedLocalCentroVida, setSelectedLocalCentroVida] = useState<number | null>(null)
  const [comentariosAsignacion, setComentariosAsignacion] = useState("")

  // Estado actual de derivaciones y asignaciones
  const [derivacionesActuales, setDerivacionesActuales] = useState<AsignacionActual[]>([])
  const [asignacionesActuales, setAsignacionesActuales] = useState<AsignacionActual[]>([])

  // Cargar datos iniciales y limpiar estado al cambiar legajo
  useEffect(() => {
    if (open && legajoId) {
      // Limpiar estado anterior
      setHistorial([])
      setDerivacionesActuales([])
      setAsignacionesActuales([])
      setSelectedZonaDerivacion(null)
      setSelectedZonaAsignacion(null)
      setSelectedUsuario(null)
      setSelectedLocalCentroVida(null)
      setComentariosDerivacion("")
      setComentariosAsignacion("")

      // Cargar datos nuevos
      loadData()
    }
  }, [open, legajoId])

  const loadData = async () => {
    if (!legajoId) return

    setIsLoading(true)
    try {
      const [zonasData, usuariosData, localesData, userZonasData, historialData, legajoInfo] = await Promise.all([
        fetchZonas(),
        fetchUsuarios(),
        fetchLocalesCentroVida(),
        fetchUsersZonas(),
        fetchHistorialAsignaciones(legajoId),
        fetchLegajoParaAsignacion(legajoId), // Cargar info del legajo
      ])

      setZonas(zonasData)
      setUsuarios(usuariosData)
      setLocalesCentroVida(localesData)
      setUserZonas(userZonasData)
      setHistorial(historialData)
      setLegajoData(legajoInfo)

      // Extraer derivaciones y asignaciones actuales del historial
      const derivacionesActivas = extractDerivacionesActuales(historialData)
      const asignacionesActivas = extractAsignacionesActuales(historialData)
      setDerivacionesActuales(derivacionesActivas)
      setAsignacionesActuales(asignacionesActivas)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const loadHistorial = async () => {
    if (!legajoId) return

    try {
      const historialData = await fetchHistorialAsignaciones(legajoId)
      setHistorial(historialData)

      // Actualizar derivaciones y asignaciones actuales
      const derivacionesActivas = extractDerivacionesActuales(historialData)
      const asignacionesActivas = extractAsignacionesActuales(historialData)
      setDerivacionesActuales(derivacionesActivas)
      setAsignacionesActuales(asignacionesActivas)
    } catch (error) {
      console.error("Error loading historial:", error)
      toast.error("Error al cargar el historial")
    }
  }

  /**
   * Extrae las derivaciones actuales del historial (para Tab 1 - Derivar)
   * Una derivación asigna el legajo a una ZONA (con o sin usuario específico)
   * NOTA: Para re-derivar necesitamos saber si existe CUALQUIER asignación activa del tipo,
   * independientemente de si tiene usuario asignado o no.
   */
  const extractDerivacionesActuales = (historialData: HistorialAsignacion[]): AsignacionActual[] => {
    const derivacionesPorTipo: Record<TipoResponsabilidad, HistorialAsignacion | null> = {
      TRABAJO: null,
      CENTRO_VIDA: null,
      JUDICIAL: null,
    }

    const sortedHistorial = [...historialData].sort(
      (a, b) => new Date(b.fecha_accion).getTime() - new Date(a.fecha_accion).getTime()
    )

    for (const record of sortedHistorial) {
      const tipo = record.tipo_responsabilidad

      if (derivacionesPorTipo[tipo] !== null) {
        continue
      }

      if (record.accion === "DESACTIVACION") {
        derivacionesPorTipo[tipo] = null
        continue
      }

      // Contar CUALQUIER asignación activa (DERIVACION, ASIGNACION, MODIFICACION)
      // porque necesitamos saber si existe una asignación del tipo para usar /rederivar/
      if (record.accion === "DERIVACION" || record.accion === "ASIGNACION" || record.accion === "MODIFICACION") {
        derivacionesPorTipo[tipo] = record
      }
    }

    const derivacionesActuales: AsignacionActual[] = []

    for (const [tipo, record] of Object.entries(derivacionesPorTipo) as [TipoResponsabilidad, HistorialAsignacion | null][]) {
      if (record) {
        derivacionesActuales.push({
          tipo_responsabilidad: tipo,
          zona: {
            id: record.zona,
            nombre: record.zona_nombre,
          },
          user_responsable: record.user_responsable ? {
            id: record.user_responsable,
            nombre_completo: record.user_responsable_nombre || undefined,
            username: record.user_responsable_nombre || "",
            first_name: "",
            last_name: "",
            email: "",
          } : undefined,
          local_centro_vida: undefined,
          esta_activo: true,
          fecha_asignacion: record.fecha_accion,
        })
      }
    }

    return derivacionesActuales
  }

  /**
   * Extrae las asignaciones activas actuales del historial (para Tab 2 - Asignar)
   * Una asignación asigna un USUARIO RESPONSABLE específico
   */
  const extractAsignacionesActuales = (historialData: HistorialAsignacion[]): AsignacionActual[] => {
    const asignacionesPorTipo: Record<TipoResponsabilidad, HistorialAsignacion | null> = {
      TRABAJO: null,
      CENTRO_VIDA: null,
      JUDICIAL: null,
    }

    const sortedHistorial = [...historialData].sort(
      (a, b) => new Date(b.fecha_accion).getTime() - new Date(a.fecha_accion).getTime()
    )

    for (const record of sortedHistorial) {
      const tipo = record.tipo_responsabilidad

      if (asignacionesPorTipo[tipo] !== null) {
        continue
      }

      if (record.accion === "DESACTIVACION") {
        asignacionesPorTipo[tipo] = null
        continue
      }

      // Solo contar ASIGNACION o MODIFICACION (con usuario responsable)
      if ((record.accion === "ASIGNACION" || record.accion === "MODIFICACION") && record.user_responsable) {
        asignacionesPorTipo[tipo] = record
      }
    }

    const asignacionesActuales: AsignacionActual[] = []

    for (const [tipo, record] of Object.entries(asignacionesPorTipo) as [TipoResponsabilidad, HistorialAsignacion | null][]) {
      if (record) {
        asignacionesActuales.push({
          tipo_responsabilidad: tipo,
          zona: {
            id: record.zona,
            nombre: record.zona_nombre,
          },
          user_responsable: record.user_responsable ? {
            id: record.user_responsable,
            nombre_completo: record.user_responsable_nombre || undefined,
            username: record.user_responsable_nombre || "",
            first_name: "",
            last_name: "",
            email: "",
          } : undefined,
          local_centro_vida: undefined,
          esta_activo: true,
          fecha_asignacion: record.fecha_accion,
        })
      }
    }

    return asignacionesActuales
  }

  // Filtrar usuarios por zona seleccionada
  const usuariosFiltrados = useMemo(() => {
    if (!selectedZonaAsignacion) return []

    const userIds = userZonas
      .filter((uz) => uz.zona === selectedZonaAsignacion)
      .map((uz) => uz.user)

    return usuarios.filter((u) => userIds.includes(u.id))
  }, [selectedZonaAsignacion, usuarios, userZonas])

  // Handler para derivar
  const handleDerivar = async () => {
    if (!legajoId || !selectedZonaDerivacion) {
      toast.error("Seleccione una zona de destino")
      return
    }

    // Validar comentarios para re-derivación
    const asignacionActivaEnLegajo = legajoData?.asignaciones_activas?.find(
      (a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion
    )
    const derivacionExistentePrevia = derivacionesActuales.find(
      (d) => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo
    )

    if ((derivacionExistentePrevia || asignacionActivaEnLegajo) && !comentariosDerivacion.trim()) {
      toast.error("Los comentarios son obligatorios para re-derivar")
      return
    }

    setIsSubmitting(true)
    try {
      // Determinar si es derivación nueva o re-derivación
      // 1. Buscar en el historial de asignaciones
      const derivacionExistente = derivacionesActuales.find(
        (d) => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo
      )

      // 2. Buscar en asignaciones_activas del legajo
      const asignacionActivaEnLegajo = legajoData?.asignaciones_activas?.find(
        (a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion
      )

      if (derivacionExistente || asignacionActivaEnLegajo) {
        // Re-derivar a otra zona (desactiva asignación actual + crea nueva)
        await rederivarLegajo(legajoId, {
          tipo_responsabilidad: tipoResponsabilidadDerivacion,
          zona_destino_id: selectedZonaDerivacion,
          comentarios: comentariosDerivacion,
        })
        toast.success("Legajo re-derivado exitosamente a nueva zona")
      } else {
        // Derivar por primera vez
        await derivarLegajo(legajoId, {
          zona_destino_id: selectedZonaDerivacion,
          tipo_responsabilidad: tipoResponsabilidadDerivacion,
          comentarios: comentariosDerivacion,
          notificar_equipo: notificarEquipo,
        })
        toast.success("Legajo derivado exitosamente")
      }

      setComentariosDerivacion("")
      await loadHistorial()
      onAsignacionComplete?.()
    } catch (error) {
      console.error("Error derivando legajo:", error)
      toast.error("Error al derivar el legajo")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler para asignar/reasignar
  const handleAsignar = async () => {
    if (!legajoId || !selectedZonaAsignacion || !selectedUsuario) {
      toast.error("Complete todos los campos obligatorios")
      return
    }

    // Validar local_centro_vida obligatorio para CENTRO_VIDA
    if (tipoResponsabilidadAsignacion === "CENTRO_VIDA" && !selectedLocalCentroVida) {
      toast.error("Debe seleccionar un local de centro de vida")
      return
    }

    setIsSubmitting(true)
    try {
      // Determinar si es asignación nueva o reasignación
      const asignacionExistente = asignacionesActuales.find(
        (a) => a.tipo_responsabilidad === tipoResponsabilidadAsignacion && a.esta_activo
      )

      if (asignacionExistente) {
        // Reasignar
        await reasignarLegajo(legajoId, {
          tipo_responsabilidad: tipoResponsabilidadAsignacion,
          user_responsable_id: selectedUsuario,
          comentarios: comentariosAsignacion,
        })
        toast.success("Responsable reasignado exitosamente")
      } else {
        // Asignar nuevo
        await asignarLegajo(legajoId, {
          tipo_responsabilidad: tipoResponsabilidadAsignacion,
          user_responsable_id: selectedUsuario,
          local_centro_vida_id: selectedLocalCentroVida || undefined,
          comentarios: comentariosAsignacion,
        })
        toast.success("Responsable asignado exitosamente")
      }

      setComentariosAsignacion("")
      await loadHistorial()
      onAsignacionComplete?.()
    } catch (error) {
      console.error("Error asignando legajo:", error)
      toast.error("Error al asignar el responsable")
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

  const getTipoLabel = (tipo: TipoResponsabilidad) => {
    switch (tipo) {
      case "TRABAJO":
        return "Trabajo"
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
            sx={{
              color: "primary.main",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
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
            <Tab icon={<DerivacionIcon fontSize="small" />} iconPosition="start" label="Derivar" />
            <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Asignar" />
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
              {/* TAB 1: DERIVAR */}
              {tabValue === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Alert severity="info">
                    Derivar el legajo a una zona específica para su gestión.
                  </Alert>

                  {/* Advertencia de re-derivación */}
                  {(derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                    legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion)) && (
                    <Alert severity="warning">
                      <strong>Re-derivación:</strong> El legajo ya tiene una asignación activa de tipo{" "}
                      <strong>{getTipoLabel(tipoResponsabilidadDerivacion)}</strong>. Al continuar, la asignación actual será
                      desactivada y se creará una nueva en la zona seleccionada.
                    </Alert>
                  )}

                  {/* Mostrar asignaciones activas del legajo (si existen) */}
                  {legajoData?.asignaciones_activas?.length > 0 && (
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
                        Asignaciones Activas del Legajo:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {legajoData.asignaciones_activas.map((asig: any) => (
                            <Box
                              key={asig.tipo_responsabilidad}
                              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                            >
                              <Chip label={getTipoLabel(asig.tipo_responsabilidad)} size="small" color="primary" />
                              <Typography variant="body2">
                                {asig.zona?.nombre || `Zona ID: ${asig.zona}`}
                                {asig.user_responsable && (
                                  <> → {asig.user_responsable.nombre_completo || asig.user_responsable.username || `Usuario ID: ${asig.user_responsable}`}</>
                                )}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}

                  {/* Mostrar derivaciones actuales del historial si existen */}
                  {derivacionesActuales.length > 0 && (
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
                        Derivaciones Actuales:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {derivacionesActuales.map((deriv) => (
                          <Box
                            key={deriv.tipo_responsabilidad}
                            sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip label={getTipoLabel(deriv.tipo_responsabilidad)} size="small" color="primary" />
                            <Typography variant="body2">
                              {deriv.zona?.nombre}
                              {deriv.user_responsable && (
                                <> → {deriv.user_responsable.nombre_completo || deriv.user_responsable.username}</>
                              )}
                            </Typography>
                            {!deriv.user_responsable && (
                              <Typography variant="caption" color="text.secondary">
                                (Sin usuario responsable asignado)
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  <FormControl component="fieldset">
                    <FormLabel component="legend">Tipo de Responsabilidad</FormLabel>
                    <RadioGroup
                      row
                      value={tipoResponsabilidadDerivacion}
                      onChange={(e) => setTipoResponsabilidadDerivacion(e.target.value as TipoResponsabilidad)}
                    >
                      <FormControlLabel value="TRABAJO" control={<Radio />} label="Trabajo" />
                      <FormControlLabel value="CENTRO_VIDA" control={<Radio />} label="Centro de Vida" />
                      <FormControlLabel value="JUDICIAL" control={<Radio />} label="Judicial" />
                    </RadioGroup>
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Zona de Destino *
                    </Typography>
                    <Autocomplete
                      options={zonas}
                      getOptionLabel={(option) => option.nombre}
                      value={zonas.find((z) => z.id === selectedZonaDerivacion) || null}
                      onChange={(_, newValue) => setSelectedZonaDerivacion(newValue?.id || null)}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione una zona" size="small" />
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios
                      {(derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                        legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion)) && (
                        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                          *
                        </Typography>
                      )}
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      value={comentariosDerivacion}
                      onChange={(e) => setComentariosDerivacion(e.target.value)}
                      placeholder={
                        (derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                         legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion))
                          ? "Comentarios obligatorios para re-derivación..."
                          : "Añada comentarios sobre esta derivación..."
                      }
                      size="small"
                      disabled={isSubmitting}
                      error={
                        (derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                         legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion)) &&
                        !comentariosDerivacion.trim()
                      }
                      helperText={
                        (derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                         legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion)) &&
                        !comentariosDerivacion.trim()
                          ? "Este campo es obligatorio para re-derivación"
                          : ""
                      }
                    />
                  </FormControl>
                </Box>
              )}

              {/* TAB 2: ASIGNAR */}
              {tabValue === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Alert severity="info">
                    Asignar un responsable específico para este tipo de intervención.
                  </Alert>

                  {/* Mostrar asignaciones actuales si existen */}
                  {asignacionesActuales.length > 0 && (
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
                        Responsables Actuales:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {asignacionesActuales.map((asig) => (
                          <Box
                            key={asig.tipo_responsabilidad}
                            sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip label={getTipoLabel(asig.tipo_responsabilidad)} size="small" color="secondary" />
                            <Typography variant="body2">
                              {asig.zona?.nombre} →{" "}
                              {asig.user_responsable?.nombre_completo || asig.user_responsable?.username || "Sin asignar"}
                            </Typography>
                            {asig.local_centro_vida && (
                              <Typography variant="caption" color="text.secondary">
                                ({asig.local_centro_vida.nombre})
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  <FormControl component="fieldset">
                    <FormLabel component="legend">Tipo de Responsabilidad</FormLabel>
                    <RadioGroup
                      row
                      value={tipoResponsabilidadAsignacion}
                      onChange={(e) => {
                        setTipoResponsabilidadAsignacion(e.target.value as TipoResponsabilidad)
                        // Reset usuario seleccionado al cambiar tipo
                        setSelectedUsuario(null)
                        setSelectedLocalCentroVida(null)
                      }}
                    >
                      <FormControlLabel value="TRABAJO" control={<Radio />} label="Trabajo" />
                      <FormControlLabel value="CENTRO_VIDA" control={<Radio />} label="Centro de Vida" />
                      <FormControlLabel value="JUDICIAL" control={<Radio />} label="Judicial" />
                    </RadioGroup>
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Zona *
                    </Typography>
                    <Autocomplete
                      options={zonas}
                      getOptionLabel={(option) => option.nombre}
                      value={zonas.find((z) => z.id === selectedZonaAsignacion) || null}
                      onChange={(_, newValue) => {
                        setSelectedZonaAsignacion(newValue?.id || null)
                        setSelectedUsuario(null) // Reset usuario al cambiar zona
                      }}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Seleccione una zona" size="small" />
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  {selectedZonaAsignacion && (
                    <FormControl fullWidth>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Usuario Responsable *
                      </Typography>
                      <Autocomplete
                        options={usuariosFiltrados}
                        getOptionLabel={(option) =>
                          option.nombre_completo || `${option.first_name} ${option.last_name}`.trim() || option.username
                        }
                        value={usuariosFiltrados.find((u) => u.id === selectedUsuario) || null}
                        onChange={(_, newValue) => setSelectedUsuario(newValue?.id || null)}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Seleccione un usuario" size="small" />
                        )}
                        disabled={isSubmitting}
                        noOptionsText="No hay usuarios en esta zona"
                      />
                    </FormControl>
                  )}

                  {tipoResponsabilidadAsignacion === "CENTRO_VIDA" && (
                    <FormControl fullWidth>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Local de Centro de Vida * (obligatorio para Centro de Vida)
                      </Typography>
                      <Autocomplete
                        options={localesCentroVida.filter((l) => l.activo)}
                        getOptionLabel={(option) => option.nombre}
                        value={localesCentroVida.find((l) => l.id === selectedLocalCentroVida) || null}
                        onChange={(_, newValue) => setSelectedLocalCentroVida(newValue?.id || null)}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Seleccione un local de centro de vida" size="small" />
                        )}
                        disabled={isSubmitting}
                      />
                      <FormHelperText>
                        Este campo es obligatorio para asignaciones de tipo Centro de Vida
                      </FormHelperText>
                    </FormControl>
                  )}

                  <FormControl fullWidth>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Comentarios
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

              {/* TAB 3: HISTORIAL */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle1" color="primary" fontWeight={500} sx={{ mb: 2 }}>
                    Historial de asignaciones para este legajo
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
                              <Chip label={getAccionLabel(record.accion)} size="small" color="primary" variant="filled" />
                              <Chip label={getTipoLabel(record.tipo_responsabilidad)} size="small" color="secondary" variant="outlined" />
                              <Chip label={`ID: ${record.id}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                            </Box>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Zona: {record.zona_nombre}
                                    {record.user_responsable_nombre && ` → Responsable: ${record.user_responsable_nombre}`}
                                  </Typography>
                                  {!record.user_responsable_nombre && record.accion === "DERIVACION" && (
                                    <Typography variant="caption" color="warning.main" sx={{ fontStyle: "italic" }}>
                                      (Sin responsable asignado - solo derivación a zona)
                                    </Typography>
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" component="div" color="text.secondary" sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                    <strong>Fecha:</strong> {formatDate(record.fecha_accion)}
                                    {record.realizado_por_nombre && (
                                      <>
                                        <span>•</span>
                                        <strong>Realizado por:</strong> {record.realizado_por_nombre || `ID ${record.realizado_por}`}
                                      </>
                                    )}
                                  </Typography>
                                  {record.legajo_zona_anterior && (
                                    <Typography variant="caption" component="div" color="info.main" sx={{ mt: 0.3 }}>
                                      <strong>Cambio desde:</strong> Legajo-Zona ID {record.legajo_zona_anterior} → {record.legajo_zona_nuevo}
                                    </Typography>
                                  )}
                                  {record.comentarios && record.comentarios.trim() !== "" && (
                                    <Typography variant="caption" component="div" sx={{ mt: 0.5, p: 1, bgcolor: "grey.50", borderRadius: 1, fontStyle: "italic" }}>
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
              onClick={handleDerivar}
              disabled={
                isSubmitting ||
                !selectedZonaDerivacion ||
                // Comentarios obligatorios para re-derivación
                ((derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                  legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion)) &&
                 !comentariosDerivacion.trim())
              }
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isSubmitting
                ? "Procesando..."
                : (derivacionesActuales.find(d => d.tipo_responsabilidad === tipoResponsabilidadDerivacion && d.esta_activo) ||
                   legajoData?.asignaciones_activas?.find((a: any) => a.tipo_responsabilidad === tipoResponsabilidadDerivacion))
                  ? "Re-derivar a Nueva Zona"
                  : "Derivar"
              }
            </Button>
          )}

          {tabValue === 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsignar}
              disabled={
                isSubmitting ||
                !selectedZonaAsignacion ||
                !selectedUsuario ||
                (tipoResponsabilidadAsignacion === "CENTRO_VIDA" && !selectedLocalCentroVida)
              }
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isSubmitting
                ? "Procesando..."
                : asignacionesActuales.find(a => a.tipo_responsabilidad === tipoResponsabilidadAsignacion)
                  ? "Reasignar"
                  : "Asignar"
              }
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
