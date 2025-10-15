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
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import HistoryIcon from "@mui/icons-material/History"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface HistorialCambiosSectionProps {
  legajoData: LegajoDetailResponse
}

export const HistorialCambiosSection: React.FC<HistorialCambiosSectionProps> = ({ legajoData }) => {
  const historial = legajoData.historial_cambios || []
  const permisos = legajoData.permisos_usuario

  const formatFecha = (fecha: string | null) => {
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

  const getAccionColor = (accion: string | null) => {
    if (!accion) return "default"
    const accionLower = accion.toLowerCase()
    if (accionLower.includes("crear") || accionLower.includes("insert")) return "success"
    if (accionLower.includes("actualizar") || accionLower.includes("update")) return "info"
    if (accionLower.includes("eliminar") || accionLower.includes("delete")) return "error"
    return "default"
  }

  // Check if user has permission to view historial
  if (!permisos?.puede_ver_historial) {
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
          <HistoryIcon sx={{ mr: 1, color: "warning.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historial de Cambios
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            bgcolor: "warning.light",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No tienes permisos para ver el historial de cambios de este legajo.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Contacta con el administrador si necesitas acceso a esta información.
          </Typography>
        </Box>
      </Paper>
    )
  }

  if (historial.length === 0) {
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
            Historial de Cambios (Auditoría)
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay cambios registrados en el historial.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Nota: El historial requiere `include_history=true` en la llamada al API.
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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <HistoryIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Historial de Cambios (Auditoría)
        </Typography>
        <Chip
          label={`${historial.length} cambio${historial.length !== 1 ? "s" : ""}`}
          color="primary"
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este historial muestra todos los cambios realizados sobre el legajo y sus datos relacionados.
          Cada entrada registra qué campo fue modificado, quién realizó el cambio y cuándo.
        </Typography>
      </Box>

      {/* Tabla de historial */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Tabla</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Registro ID</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Acción</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.100" }}>Campos Modificados</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historial.map((cambio, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {formatFecha(cambio.fecha_cambio)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {cambio.usuario?.nombre_completo || "Sistema"}
                  </Typography>
                  {cambio.usuario?.nivel && (
                    <Typography variant="caption" color="text.secondary">
                      Nivel {cambio.usuario.nivel}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={cambio.tabla}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {cambio.registro_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={cambio.accion || "N/A"}
                    size="small"
                    color={getAccionColor(cambio.accion)}
                  />
                </TableCell>
                <TableCell>
                  {cambio.campos_modificados && cambio.campos_modificados.length > 0 ? (
                    <Accordion elevation={0}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ minHeight: "auto", "& .MuiAccordionSummary-content": { margin: "8px 0" } }}
                      >
                        <Typography variant="caption">
                          {cambio.campos_modificados.length} campo{cambio.campos_modificados.length !== 1 ? "s" : ""}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box component="pre" sx={{ fontSize: "0.75rem", overflow: "auto" }}>
                          {JSON.stringify(cambio.campos_modificados, null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin cambios
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
