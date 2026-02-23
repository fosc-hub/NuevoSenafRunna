"use client"

/**
 * LegalActividadesKanbanInline - Inline Kanban for EQUIPO_LEGAL activities
 *
 * A simplified version of InformesControlLegalidadKanban that takes actividades
 * as props instead of fetching from API. Used in the DemandaSuccessModal.
 */

import React, { useState, useMemo, useCallback } from "react"
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  alpha,
  Button,
  Collapse,
} from "@mui/material"
import BalanceIcon from "@mui/icons-material/Balance"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"

import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"
import { KanbanColumn } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/legal-control/KanbanColumn"
import { ActividadDetailModal } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/ActividadDetailModal"
import BulkAsignarActividadModal from "@/app/(runna)/legajo/actividades/components/BulkAsignarActividadModal"
import {
  KANBAN_COLUMNS,
  categorizeActividades,
  getKanbanStats,
} from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/legal-control/kanban-utils"

interface LegalActividadesKanbanInlineProps {
  actividades: TActividadPlanTrabajo[]
  onActividadesUpdate?: (updatedActividades: TActividadPlanTrabajo[]) => void
}

export const LegalActividadesKanbanInline: React.FC<LegalActividadesKanbanInlineProps> = ({
  actividades,
  onActividadesUpdate,
}) => {
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  // Categorize activities into columns
  const categorized = useMemo(() => categorizeActividades(actividades), [actividades])
  const stats = useMemo(() => getKanbanStats(categorized), [categorized])

  // Handle card click
  const handleCardClick = (actividad: TActividadPlanTrabajo) => {
    if (!selectionMode) {
      setSelectedActividad(actividad)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setSelectedActividad(null)
  }

  // Handle activity update
  const handleActivityUpdate = () => {
    // In the success modal context, we don't refetch - parent handles state
  }

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedIds(new Set())
      }
      return !prev
    })
  }, [])

  // Handle single activity selection change
  const handleSelectionChange = useCallback((actividad: TActividadPlanTrabajo, selected: boolean) => {
    setSelectedIds((prev) => {
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
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      columnActividades.forEach((a) => {
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
    return actividades.filter((a) => selectedIds.has(a.id))
  }, [actividades, selectedIds])

  // Handle bulk operation success
  const handleBulkSuccess = useCallback(
    (updatedActividades?: TActividadPlanTrabajo[]) => {
      setSelectedIds(new Set())
      setBulkModalOpen(false)
      setSelectionMode(false)

      // If we have updated activities, notify parent
      if (updatedActividades && onActividadesUpdate) {
        // Merge updated activities with existing ones
        const updatedIds = new Set(updatedActividades.map((a) => a.id))
        const unchangedActividades = actividades.filter((a) => !updatedIds.has(a.id))
        onActividadesUpdate([...unchangedActividades, ...updatedActividades])
      }
    },
    [actividades, onActividadesUpdate]
  )

  // If no activities, don't render
  if (stats.total === 0) {
    return null
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: alpha("#7b1fa2", 0.05),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <BalanceIcon sx={{ color: "#7b1fa2", fontSize: 24 }} />
          <Typography variant="h6" fontWeight={600}>
            Informes para Control de Legalidad
          </Typography>
          <Chip
            label={`${stats.total} ${stats.total === 1 ? "actividad" : "actividades"}`}
            size="small"
            sx={{
              bgcolor: alpha("#7b1fa2", 0.1),
              color: "#7b1fa2",
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Statistics badges */}
          {stats.vencido > 0 && (
            <Chip label={`${stats.vencido} vencidos`} size="small" color="error" sx={{ fontWeight: 600 }} />
          )}
          {stats.proximoVencer > 0 && (
            <Chip label={`${stats.proximoVencer} por vencer`} size="small" color="warning" sx={{ fontWeight: 600 }} />
          )}

          {/* Selection mode toggle */}
          <Button
            size="small"
            variant={selectionMode ? "contained" : "outlined"}
            color={selectionMode ? "primary" : "inherit"}
            startIcon={selectionMode ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            onClick={toggleSelectionMode}
            sx={{ textTransform: "none" }}
          >
            {selectionMode ? "Cancelar" : "Seleccionar"}
          </Button>
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
            bgcolor: alpha("#9c27b0", 0.05),
            border: "1px solid",
            borderColor: alpha("#9c27b0", 0.2),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CheckBoxIcon sx={{ color: "#9c27b0" }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#9c27b0" }}>
              {selectedIds.size} {selectedIds.size === 1 ? "actividad seleccionada" : "actividades seleccionadas"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={() => setBulkModalOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Asignar Responsables
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setSelectedIds(new Set())}
              sx={{ textTransform: "none" }}
            >
              Limpiar Seleccion
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Kanban Content */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Pendiente de Revision Column */}
          <Grid item xs={12} md={4}>
            <KanbanColumn
              config={KANBAN_COLUMNS.PENDIENTE_REVISION}
              actividades={categorized.pendienteRevision}
              loading={false}
              onCardClick={handleCardClick}
              selectionEnabled={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
            />
          </Grid>

          {/* Proximo a Vencer Column */}
          <Grid item xs={12} md={4}>
            <KanbanColumn
              config={KANBAN_COLUMNS.PROXIMO_VENCER}
              actividades={categorized.proximoVencer}
              loading={false}
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
              loading={false}
              onCardClick={handleCardClick}
              selectionEnabled={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Activity Detail Modal */}
      {selectedActividad && (
        <ActividadDetailModal
          open={!!selectedActividad}
          onClose={handleModalClose}
          actividad={selectedActividad}
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

export default LegalActividadesKanbanInline
