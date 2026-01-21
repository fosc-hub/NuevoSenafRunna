"use client"

import type React from "react"
import {
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Alert,
} from "@mui/material"
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"
import type { DisplayTabProps } from "../types/persona-completa.types"

// Helper to format enum values
const formatEnumValue = (value: string | null | undefined): string => {
  if (!value) return "N/A"
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

interface InfoFieldProps {
  label: string
  value: string | null | undefined
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value || "N/A"}
    </Typography>
  </Paper>
)

const EducationDisplay: React.FC<DisplayTabProps> = ({ persona }) => {
  const educacion = persona.educacion

  if (!educacion) {
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Información Educativa
          </Typography>
        </Box>
        <Alert severity="info">
          No hay información educativa registrada para esta persona.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <SchoolIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Información Educativa
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Institución Educativa */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SchoolIcon color="primary" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Institución Educativa
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {educacion.institucion_educativa?.nombre || "No especificada"}
            </Typography>
          </Paper>
        </Grid>

        {/* Estado de escolarización */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Estado de Escolarización
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {educacion.esta_escolarizado ? (
                <>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Chip
                    label="Escolarizado"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </>
              ) : (
                <>
                  <CancelIcon color="error" fontSize="small" />
                  <Chip
                    label="No escolarizado"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Nivel Alcanzado */}
        <Grid item xs={12} md={6}>
          <InfoField
            label="Nivel Alcanzado"
            value={formatEnumValue(educacion.nivel_alcanzado)}
          />
        </Grid>

        {/* Último Cursado */}
        {educacion.ultimo_cursado && (
          <Grid item xs={12} md={6}>
            <InfoField
              label="Último Cursado"
              value={formatEnumValue(educacion.ultimo_cursado)}
            />
          </Grid>
        )}

        {/* Tipo de Escuela */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Tipo de Escuela
            </Typography>
            <Chip
              label={formatEnumValue(educacion.tipo_escuela) || "N/A"}
              size="small"
              color={educacion.tipo_escuela === "PUBLICA" ? "primary" : "secondary"}
              variant="outlined"
            />
          </Paper>
        </Grid>

        {/* Comentarios Educativos */}
        {educacion.comentarios_educativos && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Comentarios Educativos
              </Typography>
              <Typography variant="body2">
                {educacion.comentarios_educativos}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default EducationDisplay
