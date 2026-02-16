"use client"

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Chip,
  alpha,
  Collapse
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import GavelIcon from '@mui/icons-material/Gavel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useQuery } from '@tanstack/react-query'
import { actividadService } from '../../services/actividadService'
import { extractArray } from '@/hooks/useApiQuery'
import type { TActividadPlanTrabajo, ActividadListResponse } from '../../types/actividades'
import { KanbanColumn } from './KanbanColumn'
import { ActividadDetailModal } from '../medida/ActividadDetailModal'
import {
  KANBAN_COLUMNS,
  categorizeActividades,
  getKanbanStats
} from './kanban-utils'

interface InformesControlLegalidadKanbanProps {
  planTrabajoId: number
  legajoId?: number
  medidaId?: number
}

export const InformesControlLegalidadKanban: React.FC<InformesControlLegalidadKanbanProps> = ({
  planTrabajoId,
  legajoId,
  medidaId
}) => {
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // Fetch activities for EQUIPO_LEGAL
  const {
    data: actividadesData,
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['actividades-legal-control', planTrabajoId],
    queryFn: () => actividadService.list(planTrabajoId, { actor: 'EQUIPO_LEGAL' }),
    enabled: !!planTrabajoId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  })

  // Extract array from paginated response if needed
  const actividades = useMemo(() => {
    if (!actividadesData) return []
    return extractArray(actividadesData as ActividadListResponse | TActividadPlanTrabajo[])
  }, [actividadesData])

  // Categorize activities into columns
  const categorized = useMemo(() => categorizeActividades(actividades), [actividades])
  const stats = useMemo(() => getKanbanStats(categorized), [categorized])

  // Handle card click
  const handleCardClick = (actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
  }

  // Handle modal close
  const handleModalClose = () => {
    setSelectedActividad(null)
  }

  // Handle activity update (refetch list)
  const handleActivityUpdate = () => {
    refetch()
  }

  // If no activities and not loading, don't render the section
  if (!isLoading && stats.total === 0) {
    return null
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: alpha('#7b1fa2', 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GavelIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Typography variant="h6" fontWeight={600}>
            Informes para control de legalidad
          </Typography>
          {stats.total > 0 && (
            <Chip
              label={`${stats.total} ${stats.total === 1 ? 'pendiente' : 'pendientes'}`}
              size="small"
              sx={{
                bgcolor: alpha('#7b1fa2', 0.1),
                color: '#7b1fa2',
                fontWeight: 600
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Statistics badges */}
          {stats.vencido > 0 && (
            <Chip
              label={`${stats.vencido} vencidos`}
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          )}
          {stats.proximoVencer > 0 && (
            <Chip
              label={`${stats.proximoVencer} por vencer`}
              size="small"
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          )}

          {/* Refresh button */}
          <Tooltip title="Actualizar">
            <IconButton
              onClick={() => refetch()}
              disabled={isRefetching}
              size="small"
              sx={{ ml: 1 }}
            >
              <RefreshIcon
                sx={{
                  animation: isRefetching ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Expand/Collapse button */}
          <Tooltip title={isExpanded ? 'Colapsar' : 'Expandir'}>
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Kanban Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Pendiente de Revisión Column */}
            <Grid item xs={12} md={4}>
              <KanbanColumn
                config={KANBAN_COLUMNS.PENDIENTE_REVISION}
                actividades={categorized.pendienteRevision}
                loading={isLoading}
                onCardClick={handleCardClick}
              />
            </Grid>

            {/* Próximo a Vencer Column */}
            <Grid item xs={12} md={4}>
              <KanbanColumn
                config={KANBAN_COLUMNS.PROXIMO_VENCER}
                actividades={categorized.proximoVencer}
                loading={isLoading}
                onCardClick={handleCardClick}
              />
            </Grid>

            {/* Vencido Column */}
            <Grid item xs={12} md={4}>
              <KanbanColumn
                config={KANBAN_COLUMNS.VENCIDO}
                actividades={categorized.vencido}
                loading={isLoading}
                onCardClick={handleCardClick}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Activity Detail Modal */}
      {selectedActividad && (
        <ActividadDetailModal
          open={!!selectedActividad}
          onClose={handleModalClose}
          actividad={selectedActividad}
          legajoId={legajoId}
          medidaId={medidaId}
          onUpdate={handleActivityUpdate}
        />
      )}
    </Paper>
  )
}
