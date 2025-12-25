"use client"

import { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Box } from '@mui/material'
import { actividadService } from '../../services/actividadService'
import type { TTipoActividad } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'

interface TipoActividadSelectProps {
  value: number
  onChange: (value: number) => void
  actor?: string
  filterEtapa?: 'APERTURA' | 'PROCESO' | 'CESE'
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export const TipoActividadSelect: React.FC<TipoActividadSelectProps> = ({
  value,
  onChange,
  actor,
  filterEtapa,
  error,
  helperText,
  disabled
}) => {
  const [tipos, setTipos] = useState<TTipoActividad[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTipos()
  }, [actor])

  const loadTipos = async () => {
    setLoading(true)
    try {
      const data = await actividadService.getTipos(actor)
      setTipos(data)
    } catch (error) {
      console.error('Error loading activity types:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter activity types by etapa if filterEtapa is provided (for MPJ)
  const filteredTipos = filterEtapa
    ? tipos.filter(tipo => tipo.etapa_medida_aplicable === filterEtapa)
    : tipos

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <InputLabel>Tipo de Actividad</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        label="Tipo de Actividad"
      >
        {loading ? (
          <MenuItem disabled>Cargando...</MenuItem>
        ) : filteredTipos.length === 0 ? (
          <MenuItem disabled>No hay tipos disponibles para esta etapa</MenuItem>
        ) : (
          filteredTipos.map((tipo) => (
            <MenuItem key={tipo.id} value={tipo.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span style={{ flex: 1 }}>{tipo.nombre}</span>
                {tipo.requiere_evidencia && <span>📎</span>}

                {/* V3.0: Actor chip - shows team responsible */}
                <Chip
                  label={tipo.actor_display}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: '18px',
                    backgroundColor: getActorColor(tipo.actor),
                    color: 'white',
                    fontWeight: 500
                  }}
                />

                {/* Etapa chip */}
                <Chip
                  label={tipo.etapa_medida_aplicable_display}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main'
                  }}
                />
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
