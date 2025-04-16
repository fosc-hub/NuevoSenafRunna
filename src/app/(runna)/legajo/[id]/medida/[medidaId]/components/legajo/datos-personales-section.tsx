"use client"

import type React from "react"
import { Typography, Paper, Grid, Divider, Chip } from "@mui/material"

interface Persona {
  nombre: string
  apellido: string
  dni: string
  edad: number
  alias?: string
  telefono?: string
  email?: string
}

interface Profesional {
  nombre: string
}

interface Localidad {
  nombre: string
}

interface DatosPersonalesSectionProps {
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
}

export const DatosPersonalesSection: React.FC<DatosPersonalesSectionProps> = ({ legajoData }) => {
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Información Personal
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Nombre completo:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{`${legajoData.persona_principal.nombre} ${legajoData.persona_principal.apellido}`}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                DNI:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.persona_principal.dni}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Edad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.persona_principal.edad} años</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Alias:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.persona_principal.alias || "N/A"}</Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Ubicación y Contacto
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Ubicación:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.ubicacion}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Localidad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.localidad.nombre}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Teléfono:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.persona_principal.telefono || "No registrado"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{legajoData.persona_principal.email || "No registrado"}</Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Información del Legajo
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Número de legajo:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {legajoData.numero_legajo}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Fecha de apertura:
              </Typography>
              <Typography variant="body1">{legajoData.fecha_apertura}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Profesional asignado:
              </Typography>
              <Typography variant="body1">{legajoData.profesional_asignado?.nombre || "Sin asignar"}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Equipo interviniente:
              </Typography>
              <Typography variant="body1">{legajoData.equipo_interviniente}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Prioridad:
              </Typography>
              <Chip
                label={legajoData.prioridad}
                color={legajoData.prioridad === "ALTA" ? "error" : "default"}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}
