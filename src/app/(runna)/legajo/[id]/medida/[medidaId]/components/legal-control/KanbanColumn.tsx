"use client"

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Badge,
  Skeleton,
  alpha
} from '@mui/material'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { TActividadPlanTrabajo } from '../../types/actividades'
import type { KanbanColumnConfig } from './kanban-utils'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  config: KanbanColumnConfig
  actividades: TActividadPlanTrabajo[]
  loading?: boolean
  onCardClick: (actividad: TActividadPlanTrabajo) => void
}

// Map icon names to components
const iconComponents = {
  PendingActions: PendingActionsIcon,
  WarningAmber: WarningAmberIcon,
  ErrorOutline: ErrorOutlineIcon
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  config,
  actividades,
  loading = false,
  onCardClick
}) => {
  const IconComponent = iconComponents[config.iconName]
  const count = actividades.length

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 400,
        maxHeight: 600,
        bgcolor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `2px solid ${config.color}`,
          bgcolor: alpha(config.color, 0.1)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconComponent sx={{ color: config.color, fontSize: 22 }} />
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ color: config.color }}
          >
            {config.label}
          </Typography>
        </Box>
        <Badge
          badgeContent={count}
          color={
            config.id === 'VENCIDO'
              ? 'error'
              : config.id === 'PROXIMO_VENCER'
              ? 'warning'
              : 'primary'
          }
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.8rem',
              fontWeight: 700,
              minWidth: 24,
              height: 24,
              borderRadius: '12px'
            }
          }}
        />
      </Box>

      {/* Column Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={120}
              sx={{ borderRadius: 2 }}
            />
          ))
        ) : actividades.length === 0 ? (
          // Empty state
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center',
              color: 'text.secondary',
              height: '100%',
              minHeight: 200
            }}
          >
            <IconComponent
              sx={{
                fontSize: 48,
                color: alpha(config.color, 0.3),
                mb: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {config.emptyMessage}
            </Typography>
          </Box>
        ) : (
          // Activity cards
          actividades.map((actividad) => (
            <KanbanCard
              key={actividad.id}
              actividad={actividad}
              onClick={onCardClick}
            />
          ))
        )}
      </Box>

      {/* Column Footer - Total count */}
      {!loading && actividades.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(config.color, 0.05)
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {count} {count === 1 ? 'informe' : 'informes'}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
