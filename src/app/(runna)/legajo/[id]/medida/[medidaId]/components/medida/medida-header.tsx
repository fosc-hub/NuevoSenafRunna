"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

interface MedidaHeaderProps {
  medidaData: {
    tipo: string
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {medidaData.tipo}: {medidaData.numero}
                </Typography>
                <Chip
                  label={isActive ? "ACTIVA" : "CERRADA"}
                  color={isActive ? "primary" : "default"}
                  size="small"
                  sx={{ ml: 2, fontWeight: 500 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Fecha de apertura: {medidaData.fecha_apertura}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Origen de la demanda: {medidaData.origen_demanda || "No especificado"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Motivo: {medidaData.motivo || "No especificado"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actores intervinientes: {medidaData.actores_intervinientes || "No especificado"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Equipos: {medidaData.equipos || "No especificado"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Articulación: {medidaData.articulacion || "No especificado"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { md: "right" } }}>
              <Typography variant="body2" color="text.secondary">
                {medidaData.persona.nombre} | DNI {medidaData.persona.dni}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ubicación del NNyA: {medidaData.ubicacion}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dirección: {medidaData.direccion || "No especificada"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Juzgado: {medidaData.juzgado || "No especificado"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nro. SAC: {medidaData.nro_sac || "No especificado"}
              </Typography>
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
