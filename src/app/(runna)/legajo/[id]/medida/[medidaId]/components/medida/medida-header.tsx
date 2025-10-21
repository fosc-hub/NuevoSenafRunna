"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

interface MedidaHeaderProps {
  medidaData: {
    tipo: string
    tipo_display?: string  // Display name for the tipo
    numero: string
    fecha_apertura: string
    origen_demanda?: string
    motivo?: string
    actores_intervinientes?: string
    equipos?: string
    articulacion?: string
    persona: {
      nombre: string
      dni: string
    }
    ubicacion: string
    direccion?: string
    juzgado?: string
    nro_sac?: string
    urgencia?: string
    estado_actual?: string
  }
  isActive: boolean
  onViewPersonalData?: () => void
}

export const MedidaHeader: React.FC<MedidaHeaderProps> = ({ medidaData, isActive, onViewPersonalData }) => {
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
          backgroundColor: "#2196f3",
        },
      }}
    >
      <Box sx={{ pl: 2, py: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {medidaData.tipo_display || medidaData.tipo}: {medidaData.numero}
              </Typography>
              <Chip
                label={isActive ? "ACTIVA" : "CERRADA"}
                color={isActive ? "primary" : "default"}
                size="small"
                sx={{ fontWeight: 500 }}
              />
              {medidaData.urgencia && (
                <Chip
                  label={`Urgencia: ${medidaData.urgencia}`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              )}
              {medidaData.estado_actual && (
                <Chip
                  label={medidaData.estado_actual}
                  color="info"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Fecha de apertura:
                </Typography>{" "}
                {medidaData.fecha_apertura}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Origen de la demanda:
                </Typography>{" "}
                {medidaData.origen_demanda || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Motivo:
                </Typography>{" "}
                {medidaData.motivo || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Actores intervinientes:
                </Typography>{" "}
                {medidaData.actores_intervinientes || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Equipos:
                </Typography>{" "}
                {medidaData.equipos || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Articulación:
                </Typography>{" "}
                {medidaData.articulacion || "No especificado"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { md: "right" } }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {medidaData.persona.nombre} | DNI {medidaData.persona.dni}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Ubicación del NNyA:
                </Typography>{" "}
                {medidaData.ubicacion}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Dirección:
                </Typography>{" "}
                {medidaData.direccion || "No especificada"}
              </Typography>

              {medidaData.juzgado && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Juzgado:
                  </Typography>{" "}
                  {medidaData.juzgado}
                </Typography>
              )}

              {medidaData.nro_sac && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Nro. SAC:
                  </Typography>{" "}
                  {medidaData.nro_sac}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                endIcon={<ArrowForwardIcon />}
                size="small"
                onClick={onViewPersonalData}
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                Ver todos los datos personales
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
