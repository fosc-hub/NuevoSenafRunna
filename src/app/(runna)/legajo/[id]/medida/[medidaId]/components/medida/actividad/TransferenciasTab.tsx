"use client"

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import type { TTransferenciaActividad } from '../../../types/actividades'

interface TransferenciasTabProps {
  actividadId: number
  onGetTransferencias: () => Promise<TTransferenciaActividad[] | null>
  loading: boolean
}

export const TransferenciasTab: React.FC<TransferenciasTabProps> = ({
  actividadId,
  onGetTransferencias,
  loading: initialLoading
}) => {
  const [transferencias, setTransferencias] = useState<TTransferenciaActividad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTransferencias()
  }, [actividadId])

  const loadTransferencias = async () => {
    setLoading(true)
    setError(null)

    const result = await onGetTransferencias()

    if (result) {
      setTransferencias(result)
    } else {
      setError('Error al cargar el historial de transferencias')
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

  if (transferencias.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Esta actividad no ha sido transferida entre equipos.
      </Alert>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Transferencias
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Registro completo de todas las transferencias de esta actividad entre equipos.
      </Typography>

      <Timeline position="right">
        {transferencias.map((transferencia, index) => (
          <TimelineItem key={transferencia.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              <Typography variant="caption" display="block">
                {new Date(transferencia.fecha_transferencia).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
              </Typography>
              <Typography variant="caption" display="block">
                {new Date(transferencia.fecha_transferencia).toLocaleTimeString('es-ES', { timeStyle: 'short' })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color="warning">
                <SwapHorizIcon />
              </TimelineDot>
              {index < transferencias.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                    {transferencia.transferido_por_info?.nombre_completo?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {transferencia.transferido_por_info?.nombre_completo || 'Usuario desconocido'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Realizó la transferencia
                    </Typography>
                  </Box>
                </Box>

                {/* Transfer Details: Origin → Destination */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                  <Chip
                    label={`Equipo ${transferencia.equipo_origen_info?.id || transferencia.equipo_origen} - Zona ${transferencia.equipo_origen_info?.zona || ''}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                  <Typography variant="h6" color="text.secondary">
                    →
                  </Typography>
                  <Chip
                    label={`Equipo ${transferencia.equipo_destino_info?.id || transferencia.equipo_destino} - Zona ${transferencia.equipo_destino_info?.zona || ''}`}
                    size="small"
                    color="warning"
                  />
                </Box>

                {/* Responsable Change (if applicable) */}
                {transferencia.responsable_anterior_info && transferencia.responsable_nuevo_info && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Cambio de Responsable:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                      <Typography variant="body2">
                        {transferencia.responsable_anterior_info.nombre_completo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        →
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {transferencia.responsable_nuevo_info.nombre_completo}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Motivo */}
                {transferencia.motivo && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Motivo de la Transferencia:
                    </Typography>
                    <Typography variant="body2">
                      {transferencia.motivo}
                    </Typography>
                  </Box>
                )}

                {/* Estado at transfer */}
                {transferencia.estado_al_momento && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Estado al momento de la transferencia:
                    </Typography>
                    <Chip
                      label={transferencia.estado_al_momento}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Summary */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Resumen:
        </Typography>
        <Typography variant="body2">
          Esta actividad ha sido transferida <strong>{transferencias.length}</strong> {transferencias.length === 1 ? 'vez' : 'veces'} entre equipos.
        </Typography>
      </Paper>
    </Box>
  )
}
