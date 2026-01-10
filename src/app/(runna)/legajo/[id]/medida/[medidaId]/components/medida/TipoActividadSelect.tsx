"use client"

import { useMemo } from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Box } from '@mui/material'
import { useCatalogData, extractArray } from '@/hooks/useApiQuery'
import type { TTipoActividad } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'

interface TipoActividadSelectProps {
  value: number
  onChange: (value: number) => void
  actor?: string
  tipoMedida?: 'MPE' | 'MPJ'
  filterEtapa?: 'APERTURA' | 'PROCESO' | 'CESE'
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export const TipoActividadSelect: React.FC<TipoActividadSelectProps> = ({
  value,
  onChange,
  actor,
  tipoMedida,
  filterEtapa,
  error,
  helperText,
  disabled
}) => {
  // Fetch activity types using TanStack Query
  const { data: allTiposData, isLoading: loading } = useCatalogData<TTipoActividad[]>(
    'actividad-tipos/',
    {
      queryFn: () => import('../../services/actividadService').then(m => m.actividadService.getTipos(actor)),
    }
  )
  // Handle both direct array and paginated response { results: [...] }
  const allTipos = extractArray(allTiposData)

  // Filter by tipoMedida first (MPE vs MPJ)
  // Include types where tipo_medida_aplicable is null (applies to all measure types)
  const tiposByMedida = useMemo(() => {
    if (!tipoMedida) return allTipos
    return allTipos.filter(tipo => 
      tipo.tipo_medida_aplicable === tipoMedida || 
      tipo.tipo_medida_aplicable === null
    )
  }, [allTipos, tipoMedida])

  // Filter by actor if provided
  const tipos = useMemo(() => {
    if (!actor) return tiposByMedida
    return tiposByMedida.filter(tipo => tipo.actor === actor)
  }, [tiposByMedida, actor])

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
