"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, FormControlLabel, Checkbox } from "@mui/material"
import { useState } from "react"
import type { InformacionSalud } from "../../../types/seguimiento-dispositivo"

interface InformacionSaludSectionProps {
  data?: InformacionSalud
  onUpdate?: (data: InformacionSalud) => void
  readOnly?: boolean
}

export const InformacionSaludSection: React.FC<InformacionSaludSectionProps> = ({
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionSalud>(data || {})

  const handleFieldChange = (field: keyof InformacionSalud, value: string | boolean) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate?.(updated)
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Información de Salud
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Obra Social"
              value={formData.obra_social || ''}
              onChange={(e) => handleFieldChange('obra_social', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Centro de Salud"
              value={formData.centro_salud || ''}
              onChange={(e) => handleFieldChange('centro_salud', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Médico de Cabecera"
              value={formData.medico_cabecera || ''}
              onChange={(e) => handleFieldChange('medico_cabecera', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Medicación Actual"
              value={formData.medicacion_actual || ''}
              onChange={(e) => handleFieldChange('medicacion_actual', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Alergias"
              value={formData.alergias || ''}
              onChange={(e) => handleFieldChange('alergias', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Condiciones Preexistentes"
              value={formData.condiciones_preexistentes || ''}
              onChange={(e) => handleFieldChange('condiciones_preexistentes', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Discapacidad"
              value={formData.discapacidad || ''}
              onChange={(e) => handleFieldChange('discapacidad', e.target.value)}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.cud || false}
                    onChange={(e) => handleFieldChange('cud', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="CUD (Certificado Único de Discapacidad)"
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
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
