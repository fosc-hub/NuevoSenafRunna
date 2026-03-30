"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, FormControlLabel, Checkbox, Button } from "@mui/material"
import { useState, useEffect } from "react"
import type { InformacionSalud } from "../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"

interface InformacionSaludSectionProps {
  medidaId?: number
  data?: InformacionSalud
  onUpdate?: (data: InformacionSalud) => void
  readOnly?: boolean
}

export const InformacionSaludSection: React.FC<InformacionSaludSectionProps> = ({
  medidaId,
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionSalud>(data || {})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch data from API on mount
  useEffect(() => {
    if (medidaId) {
      fetchData()
    }
  }, [medidaId])

  const fetchData = async () => {
    if (!medidaId) return

    setLoading(true)
    try {
      const apiData = await seguimientoDispositivoService.getInformacionSalud(medidaId)
      if (apiData) {
        setFormData(apiData)
      } else if (data) {
        // Fallback to demanda data if no API data exists
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching información de salud:', error)
      // Fallback to demanda data on error
      if (data) {
        setFormData(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: keyof InformacionSalud, value: string | boolean) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
  }

  const handleSave = async () => {
    if (!medidaId) {
      toast.error('Error: medidaId no disponible')
      return
    }

    setSaving(true)
    try {
      const updated = await seguimientoDispositivoService.updateInformacionSalud(medidaId, formData)
      // Update local state with response instead of refetching
      setFormData(updated)
      onUpdate?.(updated)
    } catch (error) {
      console.error('Error saving información de salud:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando información de salud...</Typography>
      </Box>
    )
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
          {!readOnly && medidaId && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {saving ? 'Guardando...' : 'Guardar Información de Salud'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
