"use client"

import type React from "react"
import { Box, Typography, Grid, Paper, Button, FormControlLabel, Checkbox, Divider } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useRouter } from "next/navigation"

interface MedidaActiva {
  tipo: string
  estado: string
  fecha_apertura: string
  grupo_actuante: string
  juzgado: string
  nro_sac: string
  respuesta_enviada: boolean
}

interface SituacionesCriticas {
  BP: boolean
  RSA: boolean
  DCS: boolean
  SCP: boolean
}

interface Intervencion {
  fecha: string
  descripcion: string
  hora: string
}

interface MedidaActivaCardProps {
  legajoId: string
  medidaActiva: MedidaActiva
  situacionesCriticas: SituacionesCriticas
  intervenciones: Intervencion[]
  onViewLastReport: () => void
  onViewMoreInterventions: () => void
}

export const MedidaActivaCard: React.FC<MedidaActivaCardProps> = ({
  legajoId,
  medidaActiva,
  situacionesCriticas,
  intervenciones,
  onViewLastReport,
  onViewMoreInterventions,
}) => {
  const router = useRouter()

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 0,
        borderRadius: 2,
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Grid container>
        <Grid item xs={12} md={8} sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Medida:</strong> {medidaActiva.tipo}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Estado:</strong>{" "}
            <span
              style={{
                color:
                  medidaActiva.estado === "ACTIVA"
                    ? "#4caf50"
                    : medidaActiva.estado === "PENDIENTE"
                      ? "#ff9800"
                      : "#9e9e9e",
                fontWeight: 600,
              }}
            >
              {medidaActiva.estado}
            </span>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Fecha de apertura:</strong> {medidaActiva.fecha_apertura}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Grupo actuante:</strong> {medidaActiva.grupo_actuante}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Juzgado:</strong> {medidaActiva.juzgado}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Nro SAC:</strong> {medidaActiva.nro_sac}
          </Typography>

          <FormControlLabel
            control={<Checkbox checked={medidaActiva.respuesta_enviada} disabled />}
            label="Respuesta enviada a juzgado"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              size="small"
              color="primary"
              onClick={onViewLastReport}
              sx={{ textTransform: "none" }}
            >
              Último informe
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Situaciones Críticas
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={3}>
              <FormControlLabel control={<Checkbox checked={situacionesCriticas.BP} disabled />} label="BP" />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel control={<Checkbox checked={situacionesCriticas.RSA} disabled />} label="RSA" />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel control={<Checkbox checked={situacionesCriticas.DCS} disabled />} label="DCS" />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel control={<Checkbox checked={situacionesCriticas.SCP} disabled />} label="SCP" />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              size="small"
              color="primary"
              sx={{ textTransform: "none" }}
              onClick={() => router.push(`/legajo/${legajoId}/medida/active_${medidaActiva.tipo.replace(/\s+/g, "_")}`)}
            >
              Ver Detalles
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={{ bgcolor: "#f5f5f5", p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Últimas intervenciones
          </Typography>

          {intervenciones.map((intervencion, index) => (
            <IntervencionItem key={index} intervencion={intervencion} />
          ))}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              size="small"
              color="primary"
              onClick={onViewMoreInterventions}
              sx={{ textTransform: "none" }}
            >
              Ver más
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

interface IntervencionItemProps {
  intervencion: Intervencion
}

const IntervencionItem: React.FC<IntervencionItemProps> = ({ intervencion }) => {
  return (
    <Box
      sx={{
        mb: 2,
        pb: 2,
        borderLeft: "2px solid #2196f3",
        pl: 2,
        position: "relative",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {intervencion.fecha}
      </Typography>
      <Typography variant="body2">{intervencion.descripcion}</Typography>
      <Typography variant="caption" color="text.secondary">
        {intervencion.hora}
      </Typography>
    </Box>
  )
}
