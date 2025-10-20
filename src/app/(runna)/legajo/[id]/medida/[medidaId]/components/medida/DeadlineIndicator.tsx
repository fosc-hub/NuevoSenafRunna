"use client"

import React from 'react'
import { Box, Chip, Tooltip, Typography } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'

interface DeadlineIndicatorProps {
  diasRestantes: number
  estaVencida: boolean
  estado: string
  fechaPlanificacion: string
}

export const DeadlineIndicator: React.FC<DeadlineIndicatorProps> = ({
  diasRestantes,
  estaVencida,
  estado,
  fechaPlanificacion
}) => {
  // Don't show deadline urgency for completed or cancelled activities
  const isCompleted = estado === 'REALIZADA' || estado === 'CANCELADA'

  const getDeadlineConfig = () => {
    if (isCompleted) {
      return {
        label: estado === 'REALIZADA' ? 'Completada' : 'Cancelada',
        color: estado === 'REALIZADA' ? 'success' : 'default',
        icon: estado === 'REALIZADA' ? <CheckCircleIcon fontSize="small" /> : null,
        bgColor: estado === 'REALIZADA' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
        borderColor: estado === 'REALIZADA' ? '#4caf50' : '#9e9e9e',
        tooltip: estado === 'REALIZADA' ? 'Actividad completada' : 'Actividad cancelada'
      }
    }

    if (estaVencida) {
      const diasVencidos = Math.abs(diasRestantes)
      return {
        label: `Vencida hace ${diasVencidos} ${diasVencidos === 1 ? 'día' : 'días'}`,
        color: 'error',
        icon: <ErrorIcon fontSize="small" />,
        bgColor: 'rgba(244, 67, 54, 0.15)',
        borderColor: '#f44336',
        tooltip: `Esta actividad venció el ${new Date(fechaPlanificacion).toLocaleDateString('es-ES')}`
      }
    }

    if (diasRestantes === 0) {
      return {
        label: '¡Hoy!',
        color: 'error',
        icon: <ErrorIcon fontSize="small" />,
        bgColor: 'rgba(244, 67, 54, 0.15)',
        borderColor: '#f44336',
        tooltip: 'Esta actividad debe completarse hoy'
      }
    }

    if (diasRestantes <= 3) {
      return {
        label: `${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`,
        color: 'warning',
        icon: <WarningIcon fontSize="small" />,
        bgColor: 'rgba(255, 152, 0, 0.15)',
        borderColor: '#ff9800',
        tooltip: '⚠️ Urgente: Vence pronto'
      }
    }

    if (diasRestantes <= 7) {
      return {
        label: `${diasRestantes} días`,
        color: 'info',
        icon: <ScheduleIcon fontSize="small" />,
        bgColor: 'rgba(33, 150, 243, 0.1)',
        borderColor: '#2196f3',
        tooltip: 'Planificada para la próxima semana'
      }
    }

    return {
      label: `${diasRestantes} días`,
      color: 'default',
      icon: <ScheduleIcon fontSize="small" />,
      bgColor: 'rgba(0, 0, 0, 0.04)',
      borderColor: 'transparent',
      tooltip: `Planificada para ${new Date(fechaPlanificacion).toLocaleDateString('es-ES')}`
    }
  }

  const config = getDeadlineConfig()

  return (
    <Tooltip title={config.tooltip} arrow>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: config.bgColor,
          border: `1.5px solid ${config.borderColor}`,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 1
          }
        }}
      >
        {config.icon}
        <Typography
          variant="caption"
          sx={{
            fontWeight: estaVencida || diasRestantes <= 3 ? 700 : 600,
            fontSize: '0.75rem'
          }}
        >
          {config.label}
        </Typography>
      </Box>
    </Tooltip>
  )
}
