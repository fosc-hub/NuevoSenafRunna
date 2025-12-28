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
  Stack,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AssessmentIcon from "@mui/icons-material/Assessment"
import LabelIcon from "@mui/icons-material/Label"
import GavelIcon from "@mui/icons-material/Gavel"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import DescriptionIcon from "@mui/icons-material/Description"
import LinkIcon from "@mui/icons-material/Link"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { SectionCard } from "../medida/shared/section-card"

interface DemandasSectionProps {
  legajoData: LegajoDetailResponse
}

export const DemandasSection: React.FC<DemandasSectionProps> = ({ legajoData }) => {
  const demandas = legajoData.demandas_relacionadas
  const [filtro, setFiltro] = useState<"todas" | "activas" | "cerradas">("todas")

  if (!demandas) {
    return (
      <SectionCard title="Demandas Relacionadas">
        <Typography variant="body1" color="text.secondary">
          No hay información de demandas disponible.
        </Typography>
      </SectionCard>
    )
  }

  const resumen = demandas.resumen

  return (
    <SectionCard title="Demandas Relacionadas">

      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: "primary.main",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
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
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: "primary.main",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
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
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: "grey.400",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {demandas.resultados
            .filter((demanda) => {
              if (filtro === "activas") return demanda.estado_demanda === "ADMITIDA" || demanda.estado_demanda === "EN_EVALUACION"
              if (filtro === "cerradas") return demanda.estado_demanda === "CERRADA" || demanda.estado_demanda === "RECHAZADA"
              return true
            })
            .map((demanda: any) => (
              <Paper
                key={demanda.id}
                elevation={0}
                sx={{
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  borderLeft: "4px solid",
                  borderLeftColor: demanda.estado_demanda === "ADMITIDA" ? "primary.main" :
                                   demanda.estado_demanda === "EN_EVALUACION" ? "info.main" :
                                   demanda.estado_demanda === "RECHAZADA" ? "error.main" : "grey.400",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 1,
                    borderColor: demanda.estado_demanda === "ADMITIDA" ? "primary.light" :
                                 demanda.estado_demanda === "EN_EVALUACION" ? "info.light" :
                                 demanda.estado_demanda === "RECHAZADA" ? "error.light" : "grey.300",
                  },
                }}
              >
                {/* Header */}
                <Box sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderBottomColor: "divider"
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <AssessmentIcon sx={{
                        color: demanda.estado_demanda === "ADMITIDA" ? "primary.main" :
                               demanda.estado_demanda === "EN_EVALUACION" ? "info.main" :
                               demanda.estado_demanda === "RECHAZADA" ? "error.main" : "grey.600"
                      }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {demanda.codigo_demanda}
                      </Typography>
                      <Chip
                        label={demanda.estado_demanda?.replace(/_/g, " ")}
                        color={
                          demanda.estado_demanda === "ADMITIDA" ? "primary" :
                          demanda.estado_demanda === "EN_EVALUACION" ? "info" :
                          demanda.estado_demanda === "RECHAZADA" ? "error" : "default"
                        }
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {demanda.medida_creada && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Medida Creada"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Creada: {new Date(demanda.fecha_creacion).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Main Info */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        {/* Etiqueta */}
                        {demanda.etiqueta && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <LabelIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                ETIQUETA
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, pl: 3.5 }}>
                              {demanda.etiqueta}
                            </Typography>
                          </Box>
                        )}

                        {/* Objetivo */}
                        {demanda.objetivo_de_demanda && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <GavelIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                OBJETIVO
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5, fontWeight: 500 }}>
                              {demanda.objetivo_de_demanda}
                            </Typography>
                          </Box>
                        )}

                        {/* Motivo */}
                        {demanda.motivo && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <DescriptionIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                MOTIVO
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5, color: "text.secondary" }}>
                              {demanda.motivo.replace(/_/g, " ")}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>

                    {/* Additional Info */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        {/* Origen */}
                        {demanda.origen_demanda && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                ORIGEN
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5 }}>
                              {demanda.origen_demanda}
                            </Typography>
                          </Box>
                        )}

                        {/* Zona Registrada */}
                        {demanda.zona_registrada && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                ZONA REGISTRADA
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5 }}>
                              {demanda.zona_registrada}
                            </Typography>
                          </Box>
                        )}

                        {/* Tipo de Medida Evaluado */}
                        {demanda.tipo_medida_evaluado && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <GavelIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                TIPO DE MEDIDA EVALUADO
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5, fontWeight: 500 }}>
                              {demanda.tipo_medida_evaluado}
                            </Typography>
                          </Box>
                        )}

                        {/* Vínculo con NNyA */}
                        {demanda.vinculo_con_nnya_principal && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <LinkIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                VÍNCULO CON NNyA PRINCIPAL
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3.5 }}>
                              {demanda.vinculo_con_nnya_principal}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            ))}
        </Box>
      )}
    </SectionCard>
  )
}
