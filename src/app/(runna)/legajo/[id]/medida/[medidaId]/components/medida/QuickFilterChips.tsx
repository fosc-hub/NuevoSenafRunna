"use client"

import React from 'react'
import { Box, Chip } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import PersonIcon from '@mui/icons-material/Person'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
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
        return !activeFilters.estado && !activeFilters.responsable_principal && !activeFilters.vencidas
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
        dias_restantes_max: undefined
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
