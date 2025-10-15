"use client"

import type React from "react"
import {
  Typography,
  Paper,
  Box,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material"
import HistoryIcon from "@mui/icons-material/History"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import CancelIcon from "@mui/icons-material/Cancel"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface HistorialAsignacionesSectionProps {
  legajoData: LegajoDetailResponse
}

export const HistorialAsignacionesSection: React.FC<HistorialAsignacionesSectionProps> = ({ legajoData }) => {
  const historialAsignaciones = legajoData.historial_asignaciones || []

  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "N/A"
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return fecha
    }
  }

  const formatFechaHora = (fecha: string | null | undefined) => {
    if (!fecha) return "N/A"
    try {
      const date = new Date(fecha)
      return date.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return fecha
    }
  }

  const formatTipoResponsabilidad = (tipo: string | null | undefined) => {
    if (!tipo) return "N/A"
    return tipo
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getStatusIcon = (asignacion: any) => {
    if (asignacion.fecha_fin) {
      return <CancelIcon />
    }
    if (asignacion.recibido) {
      return <CheckCircleIcon />
    }
    return <PendingIcon />
  }

  const getStatusColor = (asignacion: any): "success" | "warning" | "error" | "grey" => {
    if (asignacion.fecha_fin) {
      return "grey"
    }
    if (asignacion.recibido) {
      return "success"
    }
    return "warning"
  }

  const getStatusText = (asignacion: any) => {
    if (asignacion.fecha_fin) {
      return "Finalizada"
    }
    if (asignacion.recibido) {
      return "Activa"
    }
    return "Pendiente de recepción"
  }

  // Calculate statistics
  const totalAsignaciones = historialAsignaciones.length
  const activas = historialAsignaciones.filter((a) => !a.fecha_fin && a.recibido).length
  const finalizadas = historialAsignaciones.filter((a) => a.fecha_fin).length
  const pendientes = historialAsignaciones.filter((a) => !a.fecha_fin && !a.recibido).length

  if (historialAsignaciones.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <HistoryIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Asignaciones
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <AssignmentIndIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay historial de asignaciones para este legajo.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <HistoryIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Historial de Asignaciones
        </Typography>
        <Chip label={`${totalAsignaciones} total${totalAsignaciones !== 1 ? "es" : ""}`} color="primary" size="small" sx={{ ml: 2 }} />
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Estados de asignación:
              </Typography>
              <Typography variant="caption" display="block">
                ✅ Activa: Asignación recibida y en curso
              </Typography>
              <Typography variant="caption" display="block">
                ⏳ Pendiente: Asignación creada, esperando recepción
              </Typography>
              <Typography variant="caption" display="block">
                ❌ Finalizada: Asignación completada o cerrada
              </Typography>
            </Box>
          }
          arrow
          placement="right"
        >
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ bgcolor: "success.light", borderLeft: "4px solid", borderLeftColor: "success.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                    {activas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Activas
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: "success.main", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ bgcolor: "warning.light", borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                    {pendientes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pendientes
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: "warning.main", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ bgcolor: "grey.200", borderLeft: "4px solid", borderLeftColor: "grey.500" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "grey.700" }}>
                    {finalizadas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Finalizadas
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, color: "grey.500", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timeline */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Línea de tiempo
      </Typography>

      <Timeline position="right">
        {historialAsignaciones
          .sort((a, b) => {
            // Sort by fecha_asignacion descending (most recent first)
            const dateA = new Date(a.fecha_asignacion || 0).getTime()
            const dateB = new Date(b.fecha_asignacion || 0).getTime()
            return dateB - dateA
          })
          .map((asignacion, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent sx={{ m: "auto 0", maxWidth: "120px" }} align="right" variant="body2" color="text.secondary">
                {formatFecha(asignacion.fecha_asignacion)}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: index === historialAsignaciones.length - 1 ? "transparent" : undefined }} />
                <TimelineDot color={getStatusColor(asignacion)} sx={{ boxShadow: 3 }}>
                  {getStatusIcon(asignacion)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>

              <TimelineContent sx={{ py: "12px", px: 2 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    bgcolor: asignacion.fecha_fin ? "grey.50" : "white",
                    borderLeft: "4px solid",
                    borderLeftColor: asignacion.fecha_fin ? "grey.300" : "primary.main",
                  }}
                >
                  {/* Status chip */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Chip
                      label={getStatusText(asignacion)}
                      color={getStatusColor(asignacion)}
                      size="small"
                      icon={getStatusIcon(asignacion)}
                    />
                    {asignacion.fecha_fin && (
                      <Typography variant="caption" color="text.secondary">
                        Finalizada: {formatFecha(asignacion.fecha_fin)}
                      </Typography>
                    )}
                  </Box>

                  {/* Tipo de responsabilidad */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {formatTipoResponsabilidad(asignacion.tipo_responsabilidad)}
                  </Typography>

                  <Grid container spacing={1}>
                    {/* Zona */}
                    {asignacion.zona && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Zona:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {asignacion.zona.nombre || "N/A"}
                        </Typography>
                        {asignacion.zona.descripcion && (
                          <Typography variant="caption" color="text.secondary">
                            {asignacion.zona.descripcion}
                          </Typography>
                        )}
                      </Grid>
                    )}

                    {/* Responsable */}
                    {asignacion.responsable && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Responsable:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {asignacion.responsable.nombre_completo || "N/A"}
                        </Typography>
                        {asignacion.responsable.nivel && (
                          <Typography variant="caption" color="text.secondary">
                            Nivel {asignacion.responsable.nivel}
                          </Typography>
                        )}
                      </Grid>
                    )}

                    {/* Asignado por */}
                    {asignacion.asignado_por && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Asignado por:
                        </Typography>
                        <Typography variant="body2">
                          {asignacion.asignado_por.nombre_completo || "N/A"}
                        </Typography>
                      </Grid>
                    )}

                    {/* Fecha recibido */}
                    {asignacion.recibido && asignacion.fecha_recibido && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Recibido:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 500 }}>
                          {formatFechaHora(asignacion.fecha_recibido)}
                        </Typography>
                      </Grid>
                    )}

                    {/* Comentarios */}
                    {asignacion.comentarios && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Comentarios:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                          "{asignacion.comentarios}"
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>

      {/* Info adicional */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este historial muestra todas las asignaciones del legajo a lo largo del tiempo, incluyendo asignaciones activas, pendientes y
          finalizadas.
        </Typography>
      </Box>
    </Paper>
  )
}
