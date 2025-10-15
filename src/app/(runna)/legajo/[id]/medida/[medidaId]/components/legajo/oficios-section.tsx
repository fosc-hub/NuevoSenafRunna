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
  Tooltip,
  IconButton,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import type { SemaforoEstado } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface OficiosSectionProps {
  legajoData: LegajoDetailResponse
}

export const OficiosSection: React.FC<OficiosSectionProps> = ({ legajoData }) => {
  const oficios = legajoData.oficios || []

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

  const getSemaforoColor = (semaforo: SemaforoEstado) => {
    switch (semaforo) {
      case "verde":
        return "#4caf50" // Green
      case "amarillo":
        return "#ff9800" // Orange
      case "rojo":
        return "#f44336" // Red
      default:
        return "#9e9e9e" // Grey
    }
  }

  const getSemaforoText = (semaforo: SemaforoEstado) => {
    switch (semaforo) {
      case "verde":
        return "A tiempo"
      case "amarillo":
        return "Próximo a vencer"
      case "rojo":
        return "Vencido"
      default:
        return semaforo
    }
  }

  // Group oficios by tipo
  const oficiosPorTipo = oficios.reduce<Record<string, typeof oficios>>((acc, oficio) => {
    const tipo = oficio.tipo || "Otros"
    if (!acc[tipo]) {
      acc[tipo] = []
    }
    acc[tipo].push(oficio)
    return acc
  }, {})

  // Get summary by semaforo
  const resumenSemaforo = oficios.reduce((acc, oficio) => {
    acc[oficio.semaforo] = (acc[oficio.semaforo] || 0) + 1
    return acc
  }, {} as Record<SemaforoEstado, number>)

  if (oficios.length === 0) {
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
          <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Oficios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay oficios registrados.
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Oficios
          </Typography>
          <Chip
            label={`${oficios.length} total${oficios.length !== 1 ? "es" : ""}`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Sistema de Semáforos:
                </Typography>
                <Typography variant="caption" display="block">
                  🟢 Verde: Más de 7 días para el vencimiento
                </Typography>
                <Typography variant="caption" display="block">
                  🟡 Amarillo: Próximo a vencer (7 días o menos)
                </Typography>
                <Typography variant="caption" display="block">
                  🔴 Rojo: Oficio vencido, requiere atención inmediata
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

        {/* Resumen de semáforos */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {(["verde", "amarillo", "rojo"] as SemaforoEstado[]).map((semaforo) => {
            const count = resumenSemaforo[semaforo] || 0
            if (count === 0) return null
            return (
              <Chip
                key={semaforo}
                icon={<FiberManualRecordIcon sx={{ color: getSemaforoColor(semaforo) + " !important" }} />}
                label={`${count} ${getSemaforoText(semaforo)}`}
                size="small"
                variant="outlined"
              />
            )
          })}
        </Box>
      </Box>

      {/* Resumen por tipo */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {Object.entries(oficiosPorTipo).map(([tipo, oficiosTipo]) => (
          <Chip
            key={tipo}
            label={`${tipo}: ${oficiosTipo.length}`}
            size="small"
            variant="outlined"
            color="default"
          />
        ))}
      </Box>

      {/* Tabla de oficios */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Semáforo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Número</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha Vencimiento</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Días restantes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oficios
              .sort((a, b) => {
                // Sort by semaforo priority: rojo > amarillo > verde
                const priority: Record<SemaforoEstado, number> = { rojo: 0, amarillo: 1, verde: 2 }
                return priority[a.semaforo] - priority[b.semaforo]
              })
              .map((oficio) => {
                // Calculate días restantes
                const diasRestantes = (() => {
                  try {
                    const today = new Date()
                    const vencimiento = new Date(oficio.vencimiento)
                    const diff = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    return diff
                  } catch {
                    return null
                  }
                })()

                return (
                  <TableRow
                    key={oficio.id}
                    hover
                    sx={{
                      backgroundColor: oficio.semaforo === "rojo" ? "rgba(244, 67, 54, 0.05)" : "transparent",
                    }}
                  >
                    <TableCell>
                      <Tooltip title={getSemaforoText(oficio.semaforo)}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FiberManualRecordIcon
                            sx={{
                              color: getSemaforoColor(oficio.semaforo),
                              fontSize: 24,
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={oficio.tipo}
                        size="small"
                        variant="outlined"
                        color={
                          oficio.tipo === "Ratificación"
                            ? "primary"
                            : oficio.tipo === "Pedido"
                              ? "secondary"
                              : oficio.tipo === "Orden"
                                ? "warning"
                                : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                        {oficio.numero || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{oficio.estado}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatFecha(oficio.vencimiento)}</Typography>
                    </TableCell>
                    <TableCell>
                      {diasRestantes !== null && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              diasRestantes < 0
                                ? "error.main"
                                : diasRestantes <= 7
                                  ? "warning.main"
                                  : "success.main",
                          }}
                        >
                          {diasRestantes < 0 ? `${Math.abs(diasRestantes)} días vencido` : `${diasRestantes} días`}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
