"use client"

import { useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Typography, Chip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { extractArray } from '@/hooks/useApiQuery'
import type { TSubtipoActividadPlanTrabajo } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'
import { actividadService } from '../../services/actividadService'

interface ActividadEspecificaSelectorProps {
  derechoId: number | null
  value: number | null
  onChange: (actividadId: number | null) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
  label?: string
}

/**
 * PLTM V4.0: Actividad Específica Selector (Child - Cascading)
 *
 * Hierarchical Activity Selection - Step 2 of 2:
 * 1. Select Derecho Principal (7 primary rights) ← DerechoPrincipalSelector
 * 2. Select Actividad Específica (36 specific activities) ← This component
 *
 * Endpoint: GET /api/subtipos-actividad-plan-trabajo/?derecho={derechoId}
 * Cascading: Fetches activities filtered by selected Derecho Principal
 */
export const ActividadEspecificaSelector: React.FC<ActividadEspecificaSelectorProps> = ({
  derechoId,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = '2. Seleccione Actividad Específica'
}) => {
  // Fetch specific activities filtered by Derecho Principal (cascading)
  const { data: actividadesData, isLoading: loading } = useQuery<TSubtipoActividadPlanTrabajo[]>({
    queryKey: ['subtipos-actividad-plan-trabajo', derechoId],
    queryFn: () => actividadService.getSubtipos({ derecho: derechoId! }),
    enabled: !!derechoId, // Only fetch when derecho is selected
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  })

  const actividades = extractArray(actividadesData)

  // Reset selection when derecho changes
  useEffect(() => {
    if (!derechoId) {
      onChange(null)
    }
  }, [derechoId, onChange])

  // Find selected actividad for metadata display
  const selectedActividad = actividades.find(a => a.id === value)

  return (
    <FormControl fullWidth error={error} disabled={!derechoId || loading || disabled} required>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        label={label}
      >
        {loading ? (
          <MenuItem disabled>Cargando actividades...</MenuItem>
        ) : !derechoId ? (
          <MenuItem disabled>-- Primero seleccione un derecho --</MenuItem>
        ) : actividades.length === 0 ? (
          <MenuItem disabled>No hay actividades disponibles para este derecho</MenuItem>
        ) : (
          actividades.map((actividad) => (
            <MenuItem key={actividad.id} value={actividad.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span style={{ flex: 1 }}>{actividad.nombre}</span>

                {/* Evidence required indicator */}
                {actividad.requiere_evidencia && (
                  <Typography component="span" sx={{ fontSize: '0.9rem' }}>
                    📎
                  </Typography>
                )}

                {/* Legal approval required indicator */}
                {actividad.requiere_visado_legales && (
                  <Typography component="span" sx={{ fontSize: '0.9rem' }}>
                    ⚖️
                  </Typography>
                )}

                {/* Deadline indicator */}
                {actividad.plazo_dias && (
                  <Chip
                    label={`${actividad.plazo_dias}d`}
                    size="small"
                    sx={{
                      fontSize: '0.6rem',
                      height: '18px',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      color: 'warning.main',
                      fontWeight: 600
                    }}
                  />
                )}

                {/* Actor chip */}
                <Chip
                  label={actividad.actor_display}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: '18px',
                    backgroundColor: getActorColor(actividad.actor),
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              </Box>
            </MenuItem>
          ))
        )}
      </Select>

      {/* Metadata display for selected activity */}
      {selectedActividad && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {selectedActividad.descripcion && (
            <Typography variant="caption" color="text.secondary">
              {selectedActividad.descripcion}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {selectedActividad.requiere_evidencia && (
              <Typography variant="caption" color="primary.main" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                📎 Requiere evidencia
              </Typography>
            )}
            {selectedActividad.requiere_visado_legales && (
              <Typography variant="caption" color="secondary.main" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                ⚖️ Requiere visado legal
              </Typography>
            )}
            {selectedActividad.plazo_dias && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                ⏱️ Plazo: {selectedActividad.plazo_dias} días
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {error && !helperText && <FormHelperText>Debe seleccionar una actividad específica</FormHelperText>}
    </FormControl>
  )
}
