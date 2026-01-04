"use client"

import React, { useMemo } from 'react'
import { Box, Chip } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import PersonIcon from '@mui/icons-material/Person'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import GavelIcon from '@mui/icons-material/Gavel'
import HomeIcon from '@mui/icons-material/Home'
import BusinessIcon from '@mui/icons-material/Business'
import type { ActividadFilters, ActorEnum } from '../../types/actividades'
import { useActorVisibility } from '../../hooks/useActorVisibility'

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
  // Get actor visibility to filter which actor chips to show
  const { isActorAllowed, canSeeAllActors } = useActorVisibility()

  // Common type for all quick filter chips
  interface QuickFilterChip {
    id: string
    label: string
    icon: React.ReactElement
    filter: Partial<ActividadFilters>
    color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    disabled?: boolean
    actorValue?: ActorEnum
  }

  // Define actor filter chips with their associated actor
  const actorFilters: QuickFilterChip[] = [
    {
      id: 'equipo_tecnico',
      label: 'Equipo Técnico',
      icon: <GroupWorkIcon fontSize="small" />,
      filter: { actor: 'EQUIPO_TECNICO' },
      color: 'primary',
      actorValue: 'EQUIPO_TECNICO'
    },
    {
      id: 'equipo_legal',
      label: 'Equipo Legal',
      icon: <GavelIcon fontSize="small" />,
      filter: { actor: 'EQUIPO_LEGAL' },
      color: 'secondary',
      actorValue: 'EQUIPO_LEGAL'
    },
    {
      id: 'equipos_residenciales',
      label: 'Equipos Residenciales',
      icon: <HomeIcon fontSize="small" />,
      filter: { actor: 'EQUIPOS_RESIDENCIALES' },
      color: 'success',
      actorValue: 'EQUIPOS_RESIDENCIALES'
    },
    {
      id: 'adultos_institucion',
      label: 'Adultos/Institución',
      icon: <BusinessIcon fontSize="small" />,
      filter: { actor: 'ADULTOS_INSTITUCION' },
      color: 'warning',
      actorValue: 'ADULTOS_INSTITUCION'
    }
  ]

  // Filter actor chips based on user permissions
  // Only show actor filter chips if user can see all actors (supervisors/admins)
  // Regular users already have their view filtered by their actor, so they don't need these chips
  const visibleActorFilters = useMemo(() => {
    if (!canSeeAllActors) {
      // Non-supervisors don't see actor filter chips - their view is already filtered
      return []
    }
    return actorFilters
  }, [canSeeAllActors])

  const quickFilters: QuickFilterChip[] = useMemo(() => [
    {
      id: 'todos',
      label: 'Todas',
      icon: <AllInclusiveIcon fontSize="small" />,
      filter: {},
      color: 'default'
    },
    // Actor filters (only visible to supervisors/admins)
    ...visibleActorFilters,
    // State-based filters (visible to all)
    {
      id: 'vencidas',
      label: 'Vencidas',
      icon: <ErrorIcon fontSize="small" />,
      filter: { estado: 'PENDIENTE', vencidas: 'true' },
      color: 'error'
    },
    {
      id: 'proximas',
      label: 'Próximas a vencer',
      icon: <WarningIcon fontSize="small" />,
      filter: { estado: 'PENDIENTE', dias_restantes_max: '7' },
      color: 'warning'
    },
    {
      id: 'mis_actividades',
      label: 'Mis Actividades',
      icon: <PersonIcon fontSize="small" />,
      filter: { responsable_principal: currentUserId },
      color: 'primary',
      disabled: !currentUserId
    }
  ], [visibleActorFilters, currentUserId])

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
