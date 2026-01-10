"use client"

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import CreateIcon from '@mui/icons-material/Create'
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle'
import EditIcon from '@mui/icons-material/Edit'
import RestoreIcon from '@mui/icons-material/Restore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CommentIcon from '@mui/icons-material/Comment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import type { THistorialActividad } from '../../../types/actividades'

interface HistorialTabProps {
  actividadId: number
  onGetHistorial: () => Promise<THistorialActividad[] | null>
  loading: boolean
}

const getIconByTipoAccion = (tipo: string) => {
  const icons: Record<string, React.ReactNode> = {
    'CREACION': <CreateIcon />,
    'CAMBIO_ESTADO': <ChangeCircleIcon />,
    'EDICION_CAMPOS': <EditIcon />,
    'REAPERTURA': <RestoreIcon />,
    'ASIGNACION': <PersonAddIcon />,
    'ADJUNTO_AGREGADO': <AttachFileIcon />,
    'COMENTARIO': <CommentIcon />,
    'VISADO_APROBADO': <CheckCircleIcon />,
    'VISADO_RECHAZADO': <CancelIcon />,
    'TRANSFERENCIA': <SwapHorizIcon />,
  }
  return icons[tipo] || <ChangeCircleIcon />
}

const getColorByTipoAccion = (tipo: string): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const colors: Record<string, any> = {
    'CREACION': 'info',
    'CAMBIO_ESTADO': 'primary',
    'EDICION_CAMPOS': 'secondary',
    'REAPERTURA': 'warning',
    'ASIGNACION': 'info',
    'ADJUNTO_AGREGADO': 'secondary',
    'COMENTARIO': 'primary',
    'VISADO_APROBADO': 'success',
    'VISADO_RECHAZADO': 'error',
    'TRANSFERENCIA': 'warning',
  }
  return colors[tipo] || 'default'
}

export const HistorialTab: React.FC<HistorialTabProps> = ({
  actividadId,
  onGetHistorial,
  loading: initialLoading
}) => {
  const [historial, setHistorial] = useState<THistorialActividad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistorial()
  }, [actividadId])

  const loadHistorial = async () => {
    setLoading(true)
    setError(null)

    const result = await onGetHistorial()

    if (result) {
      // Ensure result is always an array
      setHistorial(Array.isArray(result) ? result : [])
    } else {
      setError('Error al cargar el historial')
    }

    setLoading(false)
  }

  if (loading || initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (historial.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay historial registrado para esta actividad.
      </Alert>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Cambios
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Auditoría completa e inmutable de todas las acciones realizadas sobre esta actividad.
      </Typography>

      <Timeline position="right">
        {historial.map((entrada, index) => (
          <TimelineItem key={entrada.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              <Typography variant="caption" display="block">
                {new Date(entrada.fecha_accion).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
              </Typography>
              <Typography variant="caption" display="block">
                {new Date(entrada.fecha_accion).toLocaleTimeString('es-ES', { timeStyle: 'short' })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getColorByTipoAccion(entrada.tipo_accion)}>
                {getIconByTipoAccion(entrada.tipo_accion)}
              </TimelineDot>
              {index < historial.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={entrada.tipo_accion.replace(/_/g, ' ')}
                    size="small"
                    color={getColorByTipoAccion(entrada.tipo_accion)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    por {entrada.usuario.nombre_completo}
                  </Typography>
                </Box>

                {/* State Change Details */}
                {entrada.tipo_accion === 'CAMBIO_ESTADO' && entrada.estado_anterior && entrada.estado_nuevo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Chip label={entrada.estado_anterior} size="small" variant="outlined" />
                    <Typography variant="body2">→</Typography>
                    <Chip label={entrada.estado_nuevo} size="small" color="primary" />
                  </Box>
                )}

                {/* Field Changes */}
                {entrada.campos_modificados && Object.keys(entrada.campos_modificados).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Campos modificados:
                    </Typography>
                    {Object.entries(entrada.campos_modificados).map(([campo, cambio]: [string, any]) => (
                      <Box key={campo} sx={{ pl: 2, my: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>
                          {campo}:
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ pl: 1 }}>
                          Antes: {JSON.stringify(cambio.antes)}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ pl: 1 }}>
                          Después: {JSON.stringify(cambio.despues)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Motivo/Observaciones */}
                {entrada.motivo && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Motivo:
                    </Typography>
                    <Typography variant="body2">
                      {entrada.motivo}
                    </Typography>
                  </Box>
                )}

                {entrada.observaciones && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Observaciones:
                    </Typography>
                    <Typography variant="body2">
                      {entrada.observaciones}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  )
}
