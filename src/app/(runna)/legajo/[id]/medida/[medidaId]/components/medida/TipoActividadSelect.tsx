"use client"

import { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'
import { actividadService } from '../../services/actividadService'
import type { TTipoActividad } from '../../types/actividades'

interface TipoActividadSelectProps {
  value: number
  onChange: (value: number) => void
  actor?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export const TipoActividadSelect: React.FC<TipoActividadSelectProps> = ({
  value,
  onChange,
  actor,
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
        ) : tipos.length === 0 ? (
          <MenuItem disabled>No hay tipos disponibles</MenuItem>
        ) : (
          tipos.map((tipo) => (
            <MenuItem key={tipo.id} value={tipo.id}>
              {tipo.nombre}
              {tipo.requiere_evidencia && ' 📎'}
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
