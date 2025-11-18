"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper } from "@mui/material"
import { useState } from "react"
import type { InformacionEducativa } from "../../../types/seguimiento-dispositivo"

interface InformacionEducativaSectionProps {
  data?: InformacionEducativa
  onUpdate?: (data: InformacionEducativa) => void
  readOnly?: boolean
}

export const InformacionEducativaSection: React.FC<InformacionEducativaSectionProps> = ({
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionEducativa>(data || {})

  const handleFieldChange = (field: keyof InformacionEducativa, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate?.(updated)
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Información Educativa
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nivel Educativo"
              value={formData.nivel_educativo || ''}
              onChange={(e) => handleFieldChange('nivel_educativo', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Establecimiento"
              value={formData.establecimiento || ''}
              onChange={(e) => handleFieldChange('establecimiento', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Grado/Curso"
              value={formData.grado_curso || ''}
              onChange={(e) => handleFieldChange('grado_curso', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Turno"
              value={formData.turno || ''}
              onChange={(e) => handleFieldChange('turno', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rendimiento"
              value={formData.rendimiento || ''}
              onChange={(e) => handleFieldChange('rendimiento', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asistencia"
              value={formData.asistencia || ''}
              onChange={(e) => handleFieldChange('asistencia', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Actualización"
              value={formData.fecha_actualizacion || ''}
              onChange={(e) => handleFieldChange('fecha_actualizacion', e.target.value)}
              size="small"
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={formData.observaciones || ''}
              onChange={(e) => handleFieldChange('observaciones', e.target.value)}
              disabled={readOnly}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
