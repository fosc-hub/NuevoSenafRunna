"use client"

import type React from "react"
import { useState } from "react"
import {
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  ButtonGroup,
} from "@mui/material"
import AssessmentIcon from "@mui/icons-material/Assessment"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface DemandasSectionProps {
  legajoData: LegajoDetailResponse
}

export const DemandasSection: React.FC<DemandasSectionProps> = ({ legajoData }) => {
  const demandas = legajoData.demandas_relacionadas
  const [filtro, setFiltro] = useState<"todas" | "activas" | "cerradas">("todas")

  if (!demandas) {
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
          <AssessmentIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Demandas Relacionadas
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay información de demandas disponible.
        </Typography>
      </Paper>
    )
  }

  const resumen = demandas.resumen

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
        <AssessmentIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Demandas Relacionadas
        </Typography>
      </Box>

      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "primary.light",
              borderLeft: "4px solid",
              borderLeftColor: "primary.main",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
              {resumen.total_demandas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de demandas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "success.light",
              borderLeft: "4px solid",
              borderLeftColor: "success.main",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: "success.main" }}>
              {resumen.activas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Demandas activas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "grey.100",
              borderLeft: "4px solid",
              borderLeftColor: "grey.400",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: "grey.700" }}>
              {resumen.cerradas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Demandas cerradas
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtros */}
      {demandas.resultados.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={filtro === "todas" ? "contained" : "outlined"}
              onClick={() => setFiltro("todas")}
            >
              Todas ({resumen.total_demandas})
            </Button>
            <Button
              variant={filtro === "activas" ? "contained" : "outlined"}
              onClick={() => setFiltro("activas")}
              color="success"
            >
              Activas ({resumen.activas})
            </Button>
            <Button
              variant={filtro === "cerradas" ? "contained" : "outlined"}
              onClick={() => setFiltro("cerradas")}
            >
              Cerradas ({resumen.cerradas})
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {/* Listado de demandas */}
      {demandas.resultados.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No hay demandas registradas para este legajo.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {demandas.resultados
            .filter((demanda) => {
              if (filtro === "activas") return demanda.estado === "activa"
              if (filtro === "cerradas") return demanda.estado === "cerrada"
              return true
            })
            .map((demanda, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  borderLeft: "4px solid",
                  borderLeftColor: demanda.estado === "activa" ? "success.main" : "grey.400",
                  transition: "all 0.2s",
                  "&:hover": {
                    elevation: 3,
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
                        {demanda.tipo || "Demanda"}
                      </Typography>
                      <Chip
                        label={demanda.estado || "N/A"}
                        color={demanda.estado === "activa" ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    {demanda.descripcion && (
                      <Typography variant="body2" color="text.secondary">
                        {demanda.descripcion}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {demanda.fecha_creacion && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Creada:</strong> {new Date(demanda.fecha_creacion).toLocaleDateString("es-AR")}
                      </Typography>
                    )}
                    {demanda.fecha_cierre && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Cerrada:</strong> {new Date(demanda.fecha_cierre).toLocaleDateString("es-AR")}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
        </Box>
      )}
    </Paper>
  )
}
