"use client"

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Chip,
  alpha,
  Collapse,
  Button
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import GavelIcon from '@mui/icons-material/Gavel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { useQuery } from '@tanstack/react-query'
import { actividadService } from '../../services/actividadService'
import { extractArray } from '@/hooks/useApiQuery'
import type { TActividadPlanTrabajo, ActividadListResponse } from '../../types/actividades'
import { KanbanColumn } from './KanbanColumn'
import { ActividadDetailModal } from '../medida/ActividadDetailModal'
import BulkAsignarActividadModal from '@/app/(runna)/legajo/actividades/components/BulkAsignarActividadModal'
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

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

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

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      if (prev) {
        // Exiting selection mode - clear selections
        setSelectedIds(new Set())
      }
      return !prev
    })
  }, [])

  // Handle single activity selection change
  const handleSelectionChange = useCallback((actividad: TActividadPlanTrabajo, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(actividad.id)
      } else {
        newSet.delete(actividad.id)
      }
      return newSet
    })
  }, [])

  // Handle select all for a column
  const handleSelectAll = useCallback((columnActividades: TActividadPlanTrabajo[], selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      columnActividades.forEach(a => {
        if (selected) {
          newSet.add(a.id)
        } else {
          newSet.delete(a.id)
        }
      })
      return newSet
    })
  }, [])

  // Get selected activities for bulk modal
  const selectedActividades = useMemo(() => {
    return actividades.filter(a => selectedIds.has(a.id))
  }, [actividades, selectedIds])

  // Handle bulk operation success
  const handleBulkSuccess = useCallback(() => {
    setSelectedIds(new Set())
    setBulkModalOpen(false)
    setSelectionMode(false)
    refetch()
  }, [refetch])

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

          {/* Selection mode toggle */}
          <Tooltip title={selectionMode ? 'Salir de selección' : 'Seleccionar para asignar'}>
            <IconButton
              onClick={toggleSelectionMode}
              size="small"
              sx={{
                ml: 1,
                color: selectionMode ? 'primary.main' : 'inherit',
                bgcolor: selectionMode ? alpha('#9c27b0', 0.1) : 'transparent'
              }}
            >
              {selectionMode ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </IconButton>
          </Tooltip>

          {/* Refresh button */}
          <Tooltip title="Actualizar">
            <IconButton
              onClick={() => refetch()}
              disabled={isRefetching}
              size="small"
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

      {/* Bulk Actions Toolbar */}
      <Collapse in={selectionMode && selectedIds.size > 0}>
        <Box
          sx={{
            p: 2,
            mx: 2,
            mt: 2,
            borderRadius: 2,
            bgcolor: alpha('#9c27b0', 0.05),
            border: '1px solid',
            borderColor: alpha('#9c27b0', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckBoxIcon sx={{ color: '#9c27b0' }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#9c27b0' }}>
              {selectedIds.size} {selectedIds.size === 1 ? 'informe seleccionado' : 'informes seleccionados'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={() => setBulkModalOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Asignar Responsables
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setSelectedIds(new Set())}
              sx={{ textTransform: 'none' }}
            >
              Cancelar Selección
            </Button>
          </Box>
        </Box>
      </Collapse>

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
                selectionEnabled={selectionMode}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
              />
            </Grid>

            {/* Próximo a Vencer Column */}
            <Grid item xs={12} md={4}>
              <KanbanColumn
                config={KANBAN_COLUMNS.PROXIMO_VENCER}
                actividades={categorized.proximoVencer}
                loading={isLoading}
                onCardClick={handleCardClick}
                selectionEnabled={selectionMode}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
              />
            </Grid>

            {/* Vencido Column */}
            <Grid item xs={12} md={4}>
              <KanbanColumn
                config={KANBAN_COLUMNS.VENCIDO}
                actividades={categorized.vencido}
                loading={isLoading}
                onCardClick={handleCardClick}
                selectionEnabled={selectionMode}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
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

      {/* Bulk Assign Modal */}
      <BulkAsignarActividadModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedActividades={selectedActividades}
        onSuccess={handleBulkSuccess}
      />
    </Paper>
  )
}
