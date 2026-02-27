"use client"

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  alpha,
  Checkbox
} from '@mui/material'
import GavelIcon from '@mui/icons-material/Gavel'
import FolderIcon from '@mui/icons-material/Folder'
import type { TActividadPlanTrabajo } from '../../types/actividades'
import { DeadlineIndicator } from '../medida/DeadlineIndicator'

interface KanbanCardProps {
  actividad: TActividadPlanTrabajo
  onClick: (actividad: TActividadPlanTrabajo) => void
  /** Whether selection mode is enabled */
  selectionEnabled?: boolean
  /** Whether this card is selected */
  isSelected?: boolean
  /** Callback when selection changes */
  onSelectionChange?: (actividad: TActividadPlanTrabajo, selected: boolean) => void
}

// Helper function to get initials from a full name
function getInitials(fullName?: string | null): string {
  if (!fullName || fullName.trim().length === 0) {
    return '?'
  }
  const names = fullName.trim().split(' ')
  if (names.length === 0) return '?'
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

// Helper function to generate color from string
function stringToColor(string?: string | null): string {
  if (!string || string.length === 0) {
    return '#9e9e9e'
  }
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

// Helper to get full name from user info
function getFullName(user: TActividadPlanTrabajo['responsable_principal_info']): string {
  return user.nombre_completo || user.full_name || user.username || 'Usuario'
}

// Estado display mapping for chips
const getEstadoChipConfig = (estado: string) => {
  const configs: Record<string, { label: string; color: string; bgColor: string }> = {
    PENDIENTE_VISADO_JZ: {
      label: 'Pend. Visado JZ',
      color: '#ed6c02',
      bgColor: 'rgba(237, 108, 2, 0.1)'
    },
    PENDIENTE_VISADO: {
      label: 'Pend. Visado Legal',
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)'
    }
  }
  return configs[estado] || { label: estado, color: '#757575', bgColor: 'rgba(117, 117, 117, 0.1)' }
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  actividad,
  onClick,
  selectionEnabled = false,
  isSelected = false,
  onSelectionChange
}) => {
  const estadoConfig = getEstadoChipConfig(actividad.estado)
  const responsableNombre = getFullName(actividad.responsable_principal_info)

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange?.(actividad, !isSelected)
  }

  const handleCardClick = () => {
    if (selectionEnabled) {
      onSelectionChange?.(actividad, !isSelected)
    } else {
      onClick(actividad)
    }
  }

  return (
    <Paper
      elevation={0}
      onClick={handleCardClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        backgroundColor: isSelected ? alpha('#9c27b0', 0.05) : 'background.paper',
        borderLeft: isSelected ? '4px solid #9c27b0' : '4px solid transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header: Activity type name with optional checkbox */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          {selectionEnabled && (
            <Checkbox
              checked={isSelected}
              onClick={handleCheckboxClick}
              size="small"
              color="primary"
              sx={{
                p: 0,
                flexShrink: 0,
                '&.Mui-checked': { color: '#9c27b0' }
              }}
            />
          )}
          <GavelIcon sx={{ color: '#7b1fa2', fontSize: 18, flexShrink: 0 }} />
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.2
            }}
          >
            {actividad.tipo_actividad_info?.nombre || 'Actividad'}
          </Typography>
        </Box>
      </Box>

      {/* Subactividad */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 1.5
        }}
      >
        {actividad.subactividad}
      </Typography>

      {/* Legajo info (if available) */}
      {actividad.legajo_info && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1.5,
            p: 0.75,
            bgcolor: alpha('#1976d2', 0.05),
            borderRadius: 1
          }}
        >
          <FolderIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {actividad.legajo_info.numero} - {actividad.legajo_info.nnya_nombre} {actividad.legajo_info.nnya_apellido}
          </Typography>
        </Box>
      )}

      {/* Estado chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          label={estadoConfig.label}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 600,
            color: estadoConfig.color,
            bgcolor: estadoConfig.bgColor,
            border: `1px solid ${alpha(estadoConfig.color, 0.3)}`
          }}
        />
      </Box>

      {/* Footer: Deadline + Responsable */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        {/* Deadline indicator */}
        <DeadlineIndicator
          diasRestantes={actividad.dias_restantes}
          estaVencida={actividad.esta_vencida}
          estado={actividad.estado}
          fechaPlanificacion={actividad.fecha_planificacion}
        />

        {/* Responsable avatar */}
        <Tooltip title={`Responsable: ${responsableNombre}`} arrow>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: stringToColor(responsableNombre),
              border: '2px solid #fff',
              boxShadow: 1
            }}
          >
            {getInitials(responsableNombre)}
          </Avatar>
        </Tooltip>
      </Box>
    </Paper>
  )
}
