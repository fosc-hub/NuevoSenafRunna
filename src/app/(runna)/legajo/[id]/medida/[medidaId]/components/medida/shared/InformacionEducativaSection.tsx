"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, Button } from "@mui/material"
import { useState, useEffect } from "react"
import type { InformacionEducativa } from "../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"

interface InformacionEducativaSectionProps {
  medidaId?: number
  data?: InformacionEducativa
  onUpdate?: (data: InformacionEducativa) => void
  readOnly?: boolean
}

export const InformacionEducativaSection: React.FC<InformacionEducativaSectionProps> = ({
  medidaId,
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionEducativa>(data || {})
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
      const apiData = await seguimientoDispositivoService.getInformacionEducativa(medidaId)
      if (apiData) {
        setFormData(apiData)
      } else if (data) {
        // Fallback to demanda data if no API data exists
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching información educativa:', error)
      // Fallback to demanda data on error
      if (data) {
        setFormData(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: keyof InformacionEducativa, value: string) => {
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
      const updated = await seguimientoDispositivoService.updateInformacionEducativa(medidaId, formData)
      // Update local state with response instead of refetching
      setFormData(updated)
      onUpdate?.(updated)
    } catch (error) {
      console.error('Error saving información educativa:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando información educativa...</Typography>
      </Box>
    )
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
          {!readOnly && medidaId && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {saving ? 'Guardando...' : 'Guardar Información Educativa'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
