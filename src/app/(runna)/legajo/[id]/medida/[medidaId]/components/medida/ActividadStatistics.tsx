"use client"

import React, { useMemo } from 'react'
import { Box, Paper, Grid, Typography, LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CancelIcon from '@mui/icons-material/Cancel'
import type { TActividadPlanTrabajo } from '../../types/actividades'

interface ActividadStatisticsProps {
  actividades: TActividadPlanTrabajo[]
}

interface StatCard {
  label: string
  count: number
  percentage: number
  color: string
  icon: React.ReactNode
  bgColor: string
}

export const ActividadStatistics: React.FC<ActividadStatisticsProps> = ({ actividades }) => {
  const statistics = useMemo(() => {
    const total = actividades.length

    if (total === 0) {
      return {
        total: 0,
        pendientes: 0,
        enProgreso: 0,
        realizadas: 0,
        canceladas: 0,
        vencidas: 0,
        completionRate: 0
      }
    }

    const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length
    const enProgreso = actividades.filter(a => a.estado === 'EN_PROGRESO').length
    const realizadas = actividades.filter(a => a.estado === 'REALIZADA').length
    const canceladas = actividades.filter(a => a.estado === 'CANCELADA').length
    const vencidas = actividades.filter(a => a.esta_vencida && a.estado === 'PENDIENTE').length
    const completionRate = (realizadas / total) * 100

    return {
      total,
      pendientes,
      enProgreso,
      realizadas,
      canceladas,
      vencidas,
      completionRate
    }
  }, [actividades])

  const statCards: StatCard[] = [
    {
      label: 'Pendientes',
      count: statistics.pendientes,
      percentage: statistics.total > 0 ? (statistics.pendientes / statistics.total) * 100 : 0,
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      icon: <PendingIcon sx={{ fontSize: 28 }} />
    },
    {
      label: 'En Progreso',
      count: statistics.enProgreso,
      percentage: statistics.total > 0 ? (statistics.enProgreso / statistics.total) * 100 : 0,
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
      icon: <PlayCircleIcon sx={{ fontSize: 28 }} />
    },
    {
      label: 'Realizadas',
      count: statistics.realizadas,
      percentage: statistics.total > 0 ? (statistics.realizadas / statistics.total) * 100 : 0,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />
    },
    {
      label: 'Vencidas',
      count: statistics.vencidas,
      percentage: statistics.total > 0 ? (statistics.vencidas / statistics.total) * 100 : 0,
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.1)',
      icon: <ErrorIcon sx={{ fontSize: 28 }} />
    },
    {
      label: 'Canceladas',
      count: statistics.canceladas,
      percentage: statistics.total > 0 ? (statistics.canceladas / statistics.total) * 100 : 0,
      color: '#9e9e9e',
      bgColor: 'rgba(158, 158, 158, 0.1)',
      icon: <CancelIcon sx={{ fontSize: 28 }} />
    }
  ]

  return (
    <Box sx={{ mb: 3 }}>
      {/* Overall Progress */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Progreso del Plan de Trabajo
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
            {statistics.completionRate.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={statistics.completionRate}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: '#4caf50'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {statistics.realizadas} de {statistics.total} actividades completadas
          </Typography>
          {statistics.vencidas > 0 && (
            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
              ⚠️ {statistics.vencidas} vencidas
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={2}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: stat.bgColor,
                borderLeft: `4px solid ${stat.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ color: stat.color }}>
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: stat.color }}
                >
                  {stat.count}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.percentage.toFixed(1)}% del total
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
