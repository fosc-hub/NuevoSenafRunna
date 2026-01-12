"use client"

import { useMemo } from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { extractArray } from '@/hooks/useApiQuery'
import type { TTipoActividad } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'
import { actividadService } from '../../services/actividadService'

interface TipoActividadSelectProps {
  value: number
  onChange: (value: number) => void
  actor?: string
  /** MPI = Protección Integral, MPE = Protección Excepcional, MPJ = Penal Juvenil */
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ'
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
  // Only actor is used as API filter - tipoMedida and etapa are filtered client-side
  // This ensures we get all types including those with null (universal)
  const { data: tiposData, isLoading: loading } = useQuery<TTipoActividad[]>({
    queryKey: ['tipos-actividad-plan-trabajo', actor],
    queryFn: () => actividadService.getTipos({ actor }),
    staleTime: 10 * 60 * 1000, // 10 minutes for catalogs
  })

  // Handle both direct array and paginated response { results: [...] }
  const allTipos = extractArray(tiposData)

  // Client-side filtering:
  // - NO filtrar por tipoMedida - mostrar TODAS las actividades del actor
  // - Solo filtrar por etapa si se especifica (incluyendo null = todas las etapas)
  // El usuario puede ver qué tipo de medida aplica cada actividad gracias al chip
  const filteredTipos = useMemo(() => {
    return allTipos.filter(tipo => {
      // Include if etapa_medida_aplicable matches OR is null (universal)
      const matchesEtapa = !filterEtapa || 
        tipo.etapa_medida_aplicable === filterEtapa || 
        tipo.etapa_medida_aplicable === null

      return matchesEtapa
    })
  }, [allTipos, filterEtapa])

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

                {/* Tipo Medida chip - shows which measure type this applies to */}
                <Chip
                  label={tipo.tipo_medida_aplicable || 'Todas'}
                  size="small"
                  sx={{
                    fontSize: '0.6rem',
                    height: '18px',
                    backgroundColor: tipo.tipo_medida_aplicable 
                      ? 'rgba(156, 39, 176, 0.1)' 
                      : 'rgba(76, 175, 80, 0.1)',
                    color: tipo.tipo_medida_aplicable 
                      ? 'secondary.main' 
                      : 'success.main',
                    fontWeight: 600
                  }}
                />

                {/* Etapa chip */}
                <Chip
                  label={tipo.etapa_medida_aplicable_display || 'Todas las etapas'}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    backgroundColor: tipo.etapa_medida_aplicable 
                      ? 'rgba(25, 118, 210, 0.08)' 
                      : 'rgba(76, 175, 80, 0.08)',
                    color: tipo.etapa_medida_aplicable 
                      ? 'primary.main' 
                      : 'success.main'
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
