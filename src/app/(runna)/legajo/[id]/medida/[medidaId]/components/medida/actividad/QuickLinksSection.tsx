"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Stack
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import DescriptionIcon from '@mui/icons-material/Description'
import AssignmentIcon from '@mui/icons-material/Assignment'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface QuickLinksSectionProps {
  actividad: TActividadPlanTrabajo
  legajoId?: number
  medidaId?: number
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({
  actividad,
  legajoId,
  medidaId
}) => {
  const router = useRouter()

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Enlaces Rápidos
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Accede rápidamente a entidades relacionadas con esta actividad.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {/* Link to Medida */}
        {medidaId && legajoId && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => handleNavigate(`/legajo/${legajoId}/medida/${medidaId}`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DescriptionIcon color="primary" />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Medida Proteccional
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ver detalles de la medida proteccional
                </Typography>
              </Box>
            </Box>
            <OpenInNewIcon fontSize="small" color="action" />
          </Box>
        )}

        {/* Link to Legajo */}
        {legajoId && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => handleNavigate(`/legajo/${legajoId}`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FolderIcon color="secondary" />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Legajo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ver información completa del legajo
                </Typography>
              </Box>
            </Box>
            <OpenInNewIcon fontSize="small" color="action" />
          </Box>
        )}

        {/* Link to Plan de Trabajo */}
        {actividad.plan_trabajo_medida && medidaId && legajoId && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer'
              }
            }}
            onClick={() => handleNavigate(`/legajo/${legajoId}/medida/${medidaId}#plan-trabajo`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssignmentIcon color="info" />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Plan de Trabajo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ver todas las actividades del plan
                </Typography>
              </Box>
            </Box>
            <OpenInNewIcon fontSize="small" color="action" />
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Activity Context Information */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Contexto de la Actividad:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {actividad.origen && (
            <Chip
              label={`Origen: ${actividad.origen_display || actividad.origen}`}
              size="small"
              variant="outlined"
            />
          )}
          {actividad.tipo && (
            <Chip
              label={`Tipo: ${actividad.tipo_display || actividad.tipo}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
          {actividad.equipo_responsable_display && (
            <Chip
              label={`Equipo: ${actividad.equipo_responsable_display}`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {legajoId && medidaId && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => handleNavigate(`/legajo/${legajoId}/medida/${medidaId}`)}
            >
              Ir a Medida
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FolderIcon />}
              onClick={() => handleNavigate(`/legajo/${legajoId}`)}
            >
              Ir a Legajo
            </Button>
          </>
        )}
      </Box>
    </Paper>
  )
}
