"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, Button, IconButton } from "@mui/material"
import { useState } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import type { TallerRecreativo } from "../../../types/seguimiento-dispositivo"

interface TalleresSectionProps {
  data?: TallerRecreativo[]
  onUpdate?: (data: TallerRecreativo[]) => void
  readOnly?: boolean
  maxTalleres?: number
}

export const TalleresSection: React.FC<TalleresSectionProps> = ({
  data,
  onUpdate,
  readOnly = false,
  maxTalleres = 5
}) => {
  const [talleres, setTalleres] = useState<TallerRecreativo[]>(
    data || [{ orden: 1, nombre_taller: '' }]
  )

  const handleTallerChange = (index: number, field: keyof TallerRecreativo, value: string) => {
    const updated = talleres.map((taller, i) =>
      i === index ? { ...taller, [field]: value } : taller
    )
    setTalleres(updated)
    onUpdate?.(updated)
  }

  const addTaller = () => {
    if (talleres.length < maxTalleres) {
      const newTaller: TallerRecreativo = {
        orden: talleres.length + 1,
        nombre_taller: ''
      }
      const updated = [...talleres, newTaller]
      setTalleres(updated)
      onUpdate?.(updated)
    }
  }

  const removeTaller = (index: number) => {
    if (talleres.length > 1) {
      const updated = talleres
        .filter((_, i) => i !== index)
        .map((taller, i) => ({ ...taller, orden: i + 1 }))
      setTalleres(updated)
      onUpdate?.(updated)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Talleres Recreativos y Sociolaborales
        </Typography>
        {!readOnly && talleres.length < maxTalleres && (
          <Button
            startIcon={<AddIcon />}
            onClick={addTaller}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Agregar Taller
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {talleres.map((taller, index) => (
          <Paper key={index} elevation={2} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                Taller {index + 1}
              </Typography>
              {!readOnly && talleres.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeTaller(index)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Taller"
                  value={taller.nombre_taller || ''}
                  onChange={(e) => handleTallerChange(index, 'nombre_taller', e.target.value)}
                  size="small"
                  disabled={readOnly}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institución"
                  value={taller.institucion || ''}
                  onChange={(e) => handleTallerChange(index, 'institucion', e.target.value)}
                  size="small"
                  disabled={readOnly}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Días y Horarios"
                  value={taller.dias_horarios || ''}
                  onChange={(e) => handleTallerChange(index, 'dias_horarios', e.target.value)}
                  size="small"
                  disabled={readOnly}
                  placeholder="Ej: Lunes y Miércoles 14-16hs"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Referente"
                  value={taller.referente || ''}
                  onChange={(e) => handleTallerChange(index, 'referente', e.target.value)}
                  size="small"
                  disabled={readOnly}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Inicio"
                  value={taller.fecha_inicio || ''}
                  onChange={(e) => handleTallerChange(index, 'fecha_inicio', e.target.value)}
                  size="small"
                  disabled={readOnly}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Fin"
                  value={taller.fecha_fin || ''}
                  onChange={(e) => handleTallerChange(index, 'fecha_fin', e.target.value)}
                  size="small"
                  disabled={readOnly}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observaciones"
                  value={taller.observaciones || ''}
                  onChange={(e) => handleTallerChange(index, 'observaciones', e.target.value)}
                  disabled={readOnly}
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {talleres.length === 0 && (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No hay talleres registrados. Haga clic en "Agregar Taller" para comenzar.
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
