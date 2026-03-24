"use client"

import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { extractArray } from '@/hooks/useApiQuery'
import type { TTipoActividad } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'
import { actividadService } from '../../services/actividadService'

interface DerechoPrincipalSelectorProps {
  value: number | null
  onChange: (derechoId: number | null) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
  label?: string
}

/**
 * PLTM V4.1: Derecho Principal Selector (Parent Category) - EQUIPO_TECNICO Only
 *
 * Hierarchical Activity Selection - Step 1 of 2:
 * 1. Select Derecho Principal (7 primary rights) ← This component
 * 2. Select Actividad Específica (36 specific activities) ← ActividadEspecificaSelector
 *
 * Endpoint: GET /api/tipos-actividad-plan-trabajo/?actor=EQUIPO_TECNICO
 * Returns: 7 Derechos Principales (Primary Rights) for EQUIPO_TECNICO only
 */
export const DerechoPrincipalSelector: React.FC<DerechoPrincipalSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = '1. Seleccione Derecho Principal'
}) => {
  // Fetch Derechos Principales (7 primary rights) - filtered by EQUIPO_TECNICO
  const { data: derechosData, isLoading: loading } = useQuery<TTipoActividad[]>({
    queryKey: ['tipos-actividad-plan-trabajo', 'EQUIPO_TECNICO'],
    queryFn: () => actividadService.getTipos({ actor: 'EQUIPO_TECNICO' }),
    staleTime: 10 * 60 * 1000, // 10 minutes cache for catalogs
  })

  const derechos = extractArray(derechosData)

  // Find selected derecho for description display
  const selectedDerecho = derechos.find(d => d.id === value)

  return (
    <FormControl fullWidth error={error} disabled={disabled} required>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        label={label}
      >
        {loading ? (
          <MenuItem disabled>Cargando derechos principales...</MenuItem>
        ) : derechos.length === 0 ? (
          <MenuItem disabled>No hay derechos disponibles</MenuItem>
        ) : (
          derechos.map((derecho) => (
            <MenuItem key={derecho.id} value={derecho.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span style={{ flex: 1 }}>{derecho.nombre}</span>

                {/* Actor chip - shows team responsible */}
                <Chip
                  label={derecho.actor_display}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: '18px',
                    backgroundColor: getActorColor(derecho.actor),
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              </Box>
            </MenuItem>
          ))
        )}
      </Select>

      {/* Description of selected derecho */}
      {selectedDerecho?.descripcion && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {selectedDerecho.descripcion}
        </Typography>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
