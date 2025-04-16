"use client"

import type React from "react"
import { Box, Typography, Grid, Button, Paper, Chip } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

interface Persona {
  nombre: string
  apellido: string
  dni: string
  edad: number
  alias?: string
}

interface Profesional {
  nombre: string
}

interface Localidad {
  nombre: string
}

interface LegajoHeaderProps {
  legajoData: {
    numero_legajo: string
    fecha_apertura: string
    persona_principal: Persona
    profesional_asignado?: Profesional
    ubicacion: string
    localidad: Localidad
    equipo_interviniente: string
    prioridad: string
  }
  onViewAllPersonalData: () => void
}

export const LegajoHeader: React.FC<LegajoHeaderProps> = ({ legajoData, onViewAllPersonalData }) => {
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
                Legajo número: {legajoData.numero_legajo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha de apertura: {legajoData.fecha_apertura}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                DNI: {legajoData.persona_principal.dni}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Demanda asignada a: {legajoData.profesional_asignado?.nombre || "Sin asignar"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nombre: {`${legajoData.persona_principal.nombre} ${legajoData.persona_principal.apellido}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alias: {legajoData.persona_principal.alias || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edad: {legajoData.persona_principal.edad} años
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ubicación: {legajoData.ubicacion}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Localidad: {legajoData.localidad.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Último equipo interviniente: {legajoData.equipo_interviniente}
              </Typography>
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
          {legajoData.prioridad === "ALTA" && (
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
