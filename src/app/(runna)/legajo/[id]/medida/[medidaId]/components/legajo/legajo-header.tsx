"use client"

import type React from "react"
import { Box, Typography, Grid, Button, Paper, Chip } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface LegajoHeaderProps {
  legajoData: LegajoDetailResponse
  onViewAllPersonalData: () => void
}

export const LegajoHeader: React.FC<LegajoHeaderProps> = ({ legajoData, onViewAllPersonalData }) => {
  // Extract needed data from the backend response
  const persona = legajoData.persona
  const legajo = legajoData.legajo
  const localizacion = legajoData.localizacion_actual?.localizacion
  const asignacion = legajoData.asignaciones_activas?.[0]

  // Build address string
  const buildAddress = () => {
    if (!localizacion) return "N/A"
    const addressParts: string[] = []
    if (localizacion.tipo_calle && localizacion.calle) {
      addressParts.push(`${localizacion.tipo_calle} ${localizacion.calle}`)
    }
    if (localizacion.casa_nro) addressParts.push(`N° ${localizacion.casa_nro}`)
    if (localizacion.piso_depto) addressParts.push(`Piso ${localizacion.piso_depto}`)
    if (localizacion.barrio_nombre) addressParts.push(localizacion.barrio_nombre)
    return addressParts.length > 0 ? addressParts.join(", ") : "N/A"
  }

  const formatFecha = (fecha: string | undefined) => {
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

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          backgroundColor: "#e53935",
        },
      }}
    >
      <Box sx={{ pl: 2, py: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Legajo número: {legajo?.numero || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha de apertura: {formatFecha(legajo?.fecha_apertura)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "flex-end" } }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                DNI: {persona?.dni || "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Profesional asignado: {asignacion?.user_responsable?.nombre_completo || "Sin asignar"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "60px" }}>
                  Nombre:
                </Typography>
                <Typography variant="body2">
                  {persona?.nombre} {persona?.apellido}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "60px" }}>
                  Alias:
                </Typography>
                <Typography variant="body2">{persona?.nombre_autopercibido || "N/A"}</Typography>
              </Box>
              <Box sx={{ display: "flex" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "60px" }}>
                  Edad:
                </Typography>
                <Typography variant="body2">
                  {persona?.edad_aproximada || persona?.edad_calculada || "N/A"} años
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "90px" }}>
                  Ubicación:
                </Typography>
                <Typography variant="body2">{buildAddress()}</Typography>
              </Box>
              <Box sx={{ display: "flex", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "90px" }}>
                  Localidad:
                </Typography>
                <Typography variant="body2">{localizacion?.localidad_nombre || "N/A"}</Typography>
              </Box>
              <Box sx={{ display: "flex" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "90px" }}>
                  Equipo:
                </Typography>
                <Typography variant="body2">{asignacion?.user_responsable?.nombre_completo || "N/A"}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                endIcon={<ArrowForwardIcon />}
                size="small"
                onClick={onViewAllPersonalData}
                sx={{ textTransform: "none" }}
              >
                Ver todos los datos personales
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "flex-start" }}>
          {legajo?.urgencia === "ALTA" && (
            <Chip
              label="URGENTE"
              color="error"
              size="small"
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                px: 1,
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  )
}
