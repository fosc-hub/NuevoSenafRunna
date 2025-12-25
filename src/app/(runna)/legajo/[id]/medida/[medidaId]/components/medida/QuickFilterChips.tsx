"use client"

import React from 'react'
import { Box, Chip } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import PersonIcon from '@mui/icons-material/Person'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import GavelIcon from '@mui/icons-material/Gavel'
import HomeIcon from '@mui/icons-material/Home'
import BusinessIcon from '@mui/icons-material/Business'
import type { ActividadFilters } from '../../types/actividades'

interface QuickFilterChipsProps {
  activeFilters: ActividadFilters
  onFilterChange: (filters: ActividadFilters) => void
  currentUserId?: number
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  activeFilters,
  onFilterChange,
  currentUserId
}) => {
  const quickFilters = [
    {
      id: 'todos',
      label: 'Todas',
      icon: <AllInclusiveIcon fontSize="small" />,
      filter: {},
      color: 'default' as const
    },
    // V3.0: Actor-based filters (team filters)
    {
      id: 'equipo_tecnico',
      label: 'Equipo Técnico',
      icon: <GroupWorkIcon fontSize="small" />,
      filter: { actor: 'EQUIPO_TECNICO' },
      color: 'primary' as const
    },
    {
      id: 'equipo_legal',
      label: 'Equipo Legal',
      icon: <GavelIcon fontSize="small" />,
      filter: { actor: 'EQUIPO_LEGAL' },
      color: 'secondary' as const
    },
    {
      id: 'equipos_residenciales',
      label: 'Equipos Residenciales',
      icon: <HomeIcon fontSize="small" />,
      filter: { actor: 'EQUIPOS_RESIDENCIALES' },
      color: 'success' as const
    },
    {
      id: 'adultos_institucion',
      label: 'Adultos/Institución',
      icon: <BusinessIcon fontSize="small" />,
      filter: { actor: 'ADULTOS_INSTITUCION' },
      color: 'warning' as const
    },
    // State-based filters
    {
      id: 'vencidas',
      label: 'Vencidas',
      icon: <ErrorIcon fontSize="small" />,
      filter: { estado: 'PENDIENTE', vencidas: 'true' },
      color: 'error' as const
    },
    {
      id: 'proximas',
      label: 'Próximas a vencer',
      icon: <WarningIcon fontSize="small" />,
      filter: { estado: 'PENDIENTE', dias_restantes_max: '7' },
      color: 'warning' as const
    },
    {
      id: 'mis_actividades',
      label: 'Mis Actividades',
      icon: <PersonIcon fontSize="small" />,
      filter: { responsable_principal: currentUserId },
      color: 'primary' as const,
      disabled: !currentUserId
    }
  ]

  const isFilterActive = (filterId: string) => {
    switch (filterId) {
      case 'todos':
        return !activeFilters.estado && !activeFilters.responsable_principal && !activeFilters.vencidas && !activeFilters.actor
      case 'equipo_tecnico':
        return activeFilters.actor === 'EQUIPO_TECNICO'
      case 'equipo_legal':
        return activeFilters.actor === 'EQUIPO_LEGAL'
      case 'equipos_residenciales':
        return activeFilters.actor === 'EQUIPOS_RESIDENCIALES'
      case 'adultos_institucion':
        return activeFilters.actor === 'ADULTOS_INSTITUCION'
      case 'vencidas':
        return activeFilters.vencidas === 'true'
      case 'proximas':
        return activeFilters.dias_restantes_max === '7'
      case 'mis_actividades':
        return activeFilters.responsable_principal === currentUserId
      default:
        return false
    }
  }

  const handleFilterClick = (filterId: string, filter: any) => {
    // If clicking the active filter (except 'todos'), clear it
    if (isFilterActive(filterId) && filterId !== 'todos') {
      onFilterChange({
        ...activeFilters,
        estado: '',
        responsable_principal: undefined,
        vencidas: undefined,
        dias_restantes_max: undefined,
        actor: undefined
      })
    } else {
      // Apply the selected filter
      onFilterChange({
        ...activeFilters,
        ...filter
      })
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {quickFilters.map((filter) => (
        <Chip
          key={filter.id}
          label={filter.label}
          icon={filter.icon}
          onClick={() => !filter.disabled && handleFilterClick(filter.id, filter.filter)}
          color={isFilterActive(filter.id) ? filter.color : 'default'}
          variant={isFilterActive(filter.id) ? 'filled' : 'outlined'}
          disabled={filter.disabled}
          sx={{
            fontWeight: isFilterActive(filter.id) ? 600 : 400,
            transition: 'all 0.2s',
            '&:hover': {
              transform: filter.disabled ? 'none' : 'scale(1.05)',
              boxShadow: filter.disabled ? 'none' : 1
            },
            cursor: filter.disabled ? 'not-allowed' : 'pointer'
          }}
        />
      ))}
    </Box>
  )
}
