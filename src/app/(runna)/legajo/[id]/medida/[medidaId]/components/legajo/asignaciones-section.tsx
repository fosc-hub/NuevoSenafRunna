"use client"

import type React from "react"
import {
  Typography,
  Paper,
  Chip,
  Box,
  Grid,
  Avatar,
  Stack,
  Divider,
} from "@mui/material"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import PersonIcon from "@mui/icons-material/Person"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import SendIcon from "@mui/icons-material/Send"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface AsignacionesSectionProps {
  legajoData: LegajoDetailResponse
}

export const AsignacionesSection: React.FC<AsignacionesSectionProps> = ({ legajoData }) => {
  const asignaciones = legajoData.asignaciones_activas || []

  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return fecha
    }
  }

  const formatTipoResponsabilidad = (tipo: string) => {
    const tipos: Record<string, string> = {
      'TRABAJO': 'Equipo de Trabajo',
      'CENTRO_VIDA': 'Centro de Vida',
      'JEFE_ZONAL': 'Jefe Zonal',
      'DIRECTOR': 'Director',
    }
    return tipos[tipo] || tipo.split("_").join(" ")
  }

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'TRABAJO':
        return <AssignmentIndIcon />
      case 'CENTRO_VIDA':
        return <HomeWorkIcon />
      default:
        return <PersonIcon />
    }
  }

  if (asignaciones.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AssignmentIndIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Asignaciones Activas
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay asignaciones activas registradas.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AssignmentIndIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Asignaciones Activas
        </Typography>
        <Chip
          label={`${asignaciones.length} activa${asignaciones.length !== 1 ? "s" : ""}`}
          color="primary"
          size="small"
          variant="outlined"
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {asignaciones.map((asignacion) => (
          <Grid item xs={12} key={asignacion.id}>
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid",
                borderLeftColor: asignacion.recibido ? "primary.main" : "info.main",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 1,
                  borderColor: asignacion.recibido ? "primary.light" : "info.light",
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderBottomColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "grey.100",
                        color: "text.secondary",
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getIconForTipo(asignacion.tipo_responsabilidad)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatTipoResponsabilidad(asignacion.tipo_responsabilidad)}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={asignacion.recibido ? <CheckCircleIcon /> : <PendingIcon />}
                          label={asignacion.recibido ? "Recibido" : "Pendiente"}
                          color={asignacion.recibido ? "primary" : "info"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        {asignacion.esta_activo && (
                          <Chip
                            label="Activo"
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatFecha(asignacion.fecha_asignacion)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Información de Zona y Responsable */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      {/* Zona */}
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            ZONA
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, pl: 3.5 }}>
                          {asignacion.zona?.nombre || "N/A"}
                        </Typography>
                        {asignacion.zona?.codigo && (
                          <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                            Código: {asignacion.zona.codigo}
                          </Typography>
                        )}
                      </Box>

                      {/* Responsable */}
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            RESPONSABLE
                          </Typography>
                        </Box>
                        <Box sx={{ pl: 3.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {asignacion.user_responsable?.nombre_completo || "N/A"}
                          </Typography>
                          {asignacion.user_responsable?.nivel && (
                            <Chip
                              label={`Nivel ${asignacion.user_responsable.nivel}`}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Local Centro de Vida */}
                      {asignacion.local_centro_vida && (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                            <HomeWorkIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              LOCAL CENTRO DE VIDA
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ pl: 3.5 }}>
                            {asignacion.local_centro_vida}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  {/* Información de Envío y Recepción */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      {/* Enviado por */}
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <SendIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            ENVIADO POR
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ pl: 3.5 }}>
                          {asignacion.enviado_por?.nombre_completo || "Sistema"}
                        </Typography>
                      </Box>

                      {/* Recibido por */}
                      {asignacion.recibido && asignacion.recibido_por && (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              RECIBIDO POR
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ pl: 3.5 }}>
                            {asignacion.recibido_por.nombre_completo}
                          </Typography>
                        </Box>
                      )}

                      {!asignacion.recibido && (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                            <PendingIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              ESTADO
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ pl: 3.5, fontWeight: 500 }}>
                            Pendiente de recepción
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                {/* Comentarios */}
                {asignacion.comentarios && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
                        COMENTARIOS
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderLeft: "3px solid",
                          borderLeftColor: "primary.main",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          {asignacion.comentarios}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
