"use client"

import type React from "react"
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from "@mui/material"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
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
      })
    } catch {
      return fecha
    }
  }

  const formatTipoResponsabilidad = (tipo: string) => {
    return tipo.split("_").join(" ")
  }

  if (asignaciones.length === 0) {
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
          <AssignmentIndIcon sx={{ mr: 1, color: "primary.main" }} />
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
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AssignmentIndIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Asignaciones Activas
        </Typography>
        <Chip
          label={`${asignaciones.length} activa${asignaciones.length !== 1 ? "s" : ""}`}
          color="primary"
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tipo de Responsabilidad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Zona</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nivel</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha Asignación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Enviado por</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Recibido por</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignaciones.map((asignacion) => (
              <TableRow key={asignacion.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatTipoResponsabilidad(asignacion.tipo_responsabilidad)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {asignacion.zona?.nombre || "N/A"}
                    </Typography>
                    {asignacion.zona?.codigo && (
                      <Typography variant="caption" color="text.secondary">
                        Código: {asignacion.zona.codigo}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {asignacion.user_responsable?.nombre_completo || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {asignacion.user_responsable?.nivel && (
                    <Chip
                      label={`Nivel ${asignacion.user_responsable.nivel}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatFecha(asignacion.fecha_asignacion)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {asignacion.recibido ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Recibido"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<PendingIcon />}
                      label="Pendiente"
                      color="warning"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {asignacion.enviado_por?.nombre_completo || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {asignacion.recibido_por?.nombre_completo || "N/A"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comentarios */}
      {asignaciones.some(a => a.comentarios) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Comentarios:
          </Typography>
          {asignaciones.filter(a => a.comentarios).map((asignacion) => (
            <Paper
              key={`comentario-${asignacion.id}`}
              elevation={0}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: "grey.50",
                borderLeft: "3px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                {asignacion.comentarios}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                - {asignacion.user_responsable?.nombre_completo}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  )
}
