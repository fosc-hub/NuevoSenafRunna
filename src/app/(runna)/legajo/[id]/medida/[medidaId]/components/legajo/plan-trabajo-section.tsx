"use client"

import type React from "react"
import {
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import ErrorIcon from "@mui/icons-material/Error"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { SectionCard } from "../medida/shared/section-card"

interface PlanTrabajoSectionProps {
  legajoData: LegajoDetailResponse
}

type EstadoActividad = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "VENCIDA"

export const PlanTrabajoSection: React.FC<PlanTrabajoSectionProps> = ({ legajoData }) => {
  const planTrabajo = legajoData.plan_trabajo

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

  const getEstadoColor = (estado: EstadoActividad) => {
    switch (estado) {
      case "COMPLETADA":
        return "success"
      case "EN_PROGRESO":
        return "info"
      case "PENDIENTE":
        return "warning"
      case "VENCIDA":
        return "error"
      default:
        return "default"
    }
  }

  const getEstadoIcon = (estado: EstadoActividad) => {
    switch (estado) {
      case "COMPLETADA":
        return <CheckCircleIcon fontSize="small" />
      case "EN_PROGRESO":
        return <PlayCircleIcon fontSize="small" />
      case "PENDIENTE":
        return <PendingIcon fontSize="small" />
      case "VENCIDA":
        return <ErrorIcon fontSize="small" />
      default:
        return null
    }
  }

  const formatEstado = (estado: EstadoActividad) => {
    switch (estado) {
      case "COMPLETADA":
        return "Completada"
      case "EN_PROGRESO":
        return "En Progreso"
      case "PENDIENTE":
        return "Pendiente"
      case "VENCIDA":
        return "Vencida"
      default:
        return estado
    }
  }

  // Check if plan_trabajo exists
  if (!planTrabajo) {
    return (
      <SectionCard title="Plan de Trabajo">
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay plan de trabajo asignado para este legajo.
          </Typography>
        </Box>
      </SectionCard>
    )
  }

  const actividades = planTrabajo.actividades || []

  // Calculate statistics
  const totalActividades = actividades.length
  const completadas = actividades.filter((a) => a.estado === "COMPLETADA").length
  const enProgreso = actividades.filter((a) => a.estado === "EN_PROGRESO").length
  const pendientes = actividades.filter((a) => a.estado === "PENDIENTE").length
  const vencidas = actividades.filter((a) => a.estado === "VENCIDA").length
  const porcentajeCompletado = totalActividades > 0 ? Math.round((completadas / totalActividades) * 100) : 0

  return (
    <SectionCard
      title="Plan de Trabajo"
      chips={[{
        label: `${porcentajeCompletado}% completado`,
        color: porcentajeCompletado === 100 ? "success" : "primary"
      }]}
      headerActions={
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Estados de actividades:
              </Typography>
              <Typography variant="caption" display="block">
                ✅ Completada: Actividad finalizada
              </Typography>
              <Typography variant="caption" display="block">
                ▶️ En Progreso: Actividad en curso
              </Typography>
              <Typography variant="caption" display="block">
                ⏳ Pendiente: Actividad sin iniciar
              </Typography>
              <Typography variant="caption" display="block">
                ❌ Vencida: Actividad pasada la fecha límite
              </Typography>
            </Box>
          }
          arrow
          placement="right"
        >
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >

      {/* Plan details */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">
            Fecha de creación:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatFecha(planTrabajo.fecha_creacion)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">
            Última modificación:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatFecha(planTrabajo.fecha_modificacion)}
          </Typography>
        </Grid>
        {planTrabajo.responsable && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Responsable:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {planTrabajo.responsable.nombre_completo || "N/A"}
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Progress bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progreso general
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {completadas}/{totalActividades} actividades
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={porcentajeCompletado}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              bgcolor: porcentajeCompletado === 100 ? "success.main" : "primary.main",
            },
          }}
        />
      </Box>

      {/* Statistics cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: "success.light", borderLeft: "4px solid", borderLeftColor: "success.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                {completadas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: "info.light", borderLeft: "4px solid", borderLeftColor: "info.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "info.main" }}>
                {enProgreso}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                En Progreso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: "warning.light", borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                {pendientes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ bgcolor: "error.light", borderLeft: "4px solid", borderLeftColor: "error.main" }}>
            <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "error.main" }}>
                {vencidas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vencidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Activities table */}
      {actividades.length > 0 ? (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Actividades
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha límite</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha completado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actividades
                  .sort((a, b) => {
                    // Sort by estado priority: VENCIDA > EN_PROGRESO > PENDIENTE > COMPLETADA
                    const priority: Record<EstadoActividad, number> = {
                      VENCIDA: 0,
                      EN_PROGRESO: 1,
                      PENDIENTE: 2,
                      COMPLETADA: 3,
                    }
                    return priority[a.estado] - priority[b.estado]
                  })
                  .map((actividad, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor:
                          actividad.estado === "VENCIDA"
                            ? "rgba(244, 67, 54, 0.05)"
                            : actividad.estado === "COMPLETADA"
                              ? "rgba(76, 175, 80, 0.05)"
                              : "transparent",
                      }}
                    >
                      <TableCell>
                        <Tooltip title={formatEstado(actividad.estado)}>
                          <Chip
                            icon={getEstadoIcon(actividad.estado)}
                            label={formatEstado(actividad.estado)}
                            color={getEstadoColor(actividad.estado)}
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {actividad.descripcion || "Sin descripción"}
                        </Typography>
                        {actividad.observaciones && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            {actividad.observaciones}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {actividad.responsable?.nombre_completo || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: actividad.estado === "VENCIDA" ? "error.main" : "text.primary",
                            fontWeight: actividad.estado === "VENCIDA" ? 600 : 400,
                          }}
                        >
                          {formatFecha(actividad.fecha_limite)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 500 }}>
                          {actividad.fecha_completado ? formatFecha(actividad.fecha_completado) : "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 4, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            No hay actividades registradas en este plan de trabajo.
          </Typography>
        </Box>
      )}

      {/* Info adicional */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          El plan de trabajo define las actividades y objetivos a cumplir para el seguimiento del legajo.
          Las actividades vencidas requieren atención inmediata.
        </Typography>
      </Box>
    </SectionCard>
  )
}
