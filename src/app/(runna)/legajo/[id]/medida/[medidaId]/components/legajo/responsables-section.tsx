"use client"

import type React from "react"
import { Typography, Paper, Grid, Box, Chip, Divider } from "@mui/material"
import GroupIcon from "@mui/icons-material/Group"
import PersonIcon from "@mui/icons-material/Person"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface ResponsablesSectionProps {
  legajoData: LegajoDetailResponse
}

export const ResponsablesSection: React.FC<ResponsablesSectionProps> = ({ legajoData }) => {
  const responsables = legajoData.responsables

  if (!responsables || Object.keys(responsables).length === 0) {
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
          <GroupIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Responsables
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay responsables asignados.
        </Typography>
      </Paper>
    )
  }

  const formatTipoResponsabilidad = (tipo: string) => {
    return tipo.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")
  }

  // Extract all responsable entries
  const responsablesEntries = Object.entries(responsables)

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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <GroupIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Responsables
        </Typography>
        <Chip
          label={`${responsablesEntries.length} tipo${responsablesEntries.length !== 1 ? "s" : ""}`}
          color="primary"
          size="small"
          variant="outlined"
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {responsablesEntries.map(([key, responsable], index) => {
          // Handle different responsable structures
          const isEquipoTecnico = key === "equipo_tecnico_centro_vida"

          return (
            <Grid item xs={12} key={key}>
              {index > 0 && <Divider sx={{ mb: 3 }} />}

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
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <PersonIcon sx={{ mr: 2, color: "text.secondary", mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {formatTipoResponsabilidad(key)}
                    </Typography>

                    {isEquipoTecnico && responsable.user_id ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Nombre:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {responsable.nombre_completo || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            ID Usuario:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {responsable.user_id}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Tipo de responsabilidad:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatTipoResponsabilidad(responsable.tipo_responsabilidad || "")}
                          </Typography>
                        </Grid>

                        {responsable.local && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Local:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {responsable.local.nombre || "N/A"}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      // Generic responsable display
                      <Grid container spacing={2}>
                        {Object.entries(responsable).map(([field, value]) => {
                          if (typeof value === "object" && value !== null) {
                            return (
                              <Grid item xs={12} key={field}>
                                <Typography variant="body2" color="text.secondary">
                                  {formatTipoResponsabilidad(field)}:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {JSON.stringify(value, null, 2)}
                                </Typography>
                              </Grid>
                            )
                          }
                          return (
                            <Grid item xs={12} sm={6} key={field}>
                              <Typography variant="body2" color="text.secondary">
                                {formatTipoResponsabilidad(field)}:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {String(value)}
                              </Typography>
                            </Grid>
                          )
                        })}
                      </Grid>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Info adicional */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Los responsables tienen distintos niveles de acceso y permisos sobre este legajo según su tipo de responsabilidad.
        </Typography>
      </Box>
    </Paper>
  )
}
