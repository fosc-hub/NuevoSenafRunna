"use client"

import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import DescriptionIcon from '@mui/icons-material/Description'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface EditableFieldsProps {
  actividad: TActividadPlanTrabajo
  canEdit: boolean
  onSave: (updatedFields: Partial<TActividadPlanTrabajo>) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

/**
 * EditableFields - Read-only view of activity details
 *
 * NOTE: This component only displays information.
 * To edit an activity, use the Edit button in the table which opens EditActividadModal.
 *
 * EditActividadModal provides the complete editing functionality with:
 * - tipo_actividad
 * - subactividad
 * - fecha_planificacion
 * - descripcion
 * - responsable_principal
 * - responsables_secundarios
 * - referentes_externos
 */
export const EditableFields: React.FC<EditableFieldsProps> = ({
  actividad
}) => {
  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'No especificada'
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return fecha
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <InfoIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Información de la Actividad
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Tipo de Actividad */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Tipo de Actividad:
            </Typography>
          </Box>
          <Chip
            label={actividad.tipo_actividad_info.nombre}
            color="primary"
            size="medium"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Divider />

        {/* Subactividad */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <DescriptionIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Subactividad (detalle):
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ pl: 3.5 }}>
            {actividad.subactividad || 'Sin especificar'}
          </Typography>
        </Box>

        {/* Descripción */}
        {actividad.descripcion && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <DescriptionIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Descripción adicional:
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5, fontStyle: 'italic' }}>
              {actividad.descripcion}
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Fecha de Planificación */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Fecha Planificada:
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ pl: 3.5 }}>
            {formatFecha(actividad.fecha_planificacion)}
          </Typography>
        </Box>

        {/* Responsable Principal */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Responsable Principal:
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ pl: 3.5 }}>
            {actividad.responsable_principal_info?.nombre_completo || 'No asignado'}
          </Typography>
        </Box>

        {/* Responsables Secundarios */}
        {actividad.responsables_secundarios_info && actividad.responsables_secundarios_info.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Responsables Secundarios:
              </Typography>
            </Box>
            <Box sx={{ pl: 3.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {actividad.responsables_secundarios_info.map((resp) => (
                <Chip
                  key={resp.id}
                  label={resp.nombre_completo}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Referentes Externos */}
        {actividad.referentes_externos && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Referentes Externos:
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
              {actividad.referentes_externos}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info box */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, display: 'flex', gap: 1 }}>
        <InfoIcon fontSize="small" color="info" />
        <Typography variant="caption" color="info.dark">
          Para editar esta actividad, utiliza el botón de edición en la tabla del plan de trabajo.
        </Typography>
      </Box>
    </Paper>
  )
}
