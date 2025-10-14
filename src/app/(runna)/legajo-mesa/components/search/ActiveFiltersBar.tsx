"use client"

import type React from "react"
import { Box, Chip, Typography, Button, Divider } from "@mui/material"
import { Clear as ClearIcon } from "@mui/icons-material"
import type { LegajoFiltersState } from "../../ui/legajos-filters"

interface ActiveFiltersBarProps {
  filters: LegajoFiltersState & { search: string | null }
  totalResults: number
  totalCount?: number
  onRemoveFilter: (filterKey: keyof (LegajoFiltersState & { search: string | null })) => void
  onClearAll: () => void
  zonaNames?: Record<number, string> // Map zona ID to zona name
  jefeZonalNames?: Record<number, string> // Map jefe zonal ID to name
  directorNames?: Record<number, string> // Map director ID to name
  equipoTrabajoNames?: Record<number, string> // Map equipo trabajo ID to name
  equipoCentroVidaNames?: Record<number, string> // Map equipo centro vida ID to name
}

/**
 * Barra de filtros activos con chips removibles (LEG-03 CA-5)
 *
 * Características:
 * - Muestra todos los filtros aplicados como chips
 * - Cada chip tiene botón X para remover filtro individual
 * - Botón "Limpiar todo" para remover todos los filtros
 * - Contador de resultados "N legajos encontrados (de M totales)"
 * - Se oculta automáticamente si no hay filtros activos
 */
const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  totalResults,
  totalCount,
  onRemoveFilter,
  onClearAll,
  zonaNames = {},
  jefeZonalNames = {},
  directorNames = {},
  equipoTrabajoNames = {},
  equipoCentroVidaNames = {},
}) => {
  // Build array of active filters for display
  const activeFilters: Array<{ key: string; label: string; value: string }> = []

  // Search filter
  if (filters.search) {
    activeFilters.push({
      key: "search",
      label: "Búsqueda",
      value: `"${filters.search}"`,
    })
  }

  // Zona filter
  if (filters.zona !== null) {
    activeFilters.push({
      key: "zona",
      label: "Zona",
      value: zonaNames[filters.zona] || `ID: ${filters.zona}`,
    })
  }

  // Urgencia/Prioridad filter
  if (filters.urgencia !== null) {
    const urgenciaLabels: Record<string, string> = {
      ALTA: "Alta",
      MEDIA: "Media",
      BAJA: "Baja",
    }
    activeFilters.push({
      key: "urgencia",
      label: "Prioridad",
      value: urgenciaLabels[filters.urgencia] || filters.urgencia,
    })
  }

  // Boolean filters
  if (filters.tiene_medidas_activas === true) {
    activeFilters.push({
      key: "tiene_medidas_activas",
      label: "Filtro",
      value: "Con Medidas Activas",
    })
  }

  if (filters.tiene_oficios === true) {
    activeFilters.push({
      key: "tiene_oficios",
      label: "Filtro",
      value: "Con Oficios",
    })
  }

  if (filters.tiene_plan_trabajo === true) {
    activeFilters.push({
      key: "tiene_plan_trabajo",
      label: "Filtro",
      value: "Con Plan de Trabajo",
    })
  }

  if (filters.tiene_alertas === true) {
    activeFilters.push({
      key: "tiene_alertas",
      label: "Filtro",
      value: "Con Alertas",
    })
  }

  if (filters.tiene_demanda_pi === true) {
    activeFilters.push({
      key: "tiene_demanda_pi",
      label: "Filtro",
      value: "Con Demanda (PI)",
    })
  }

  // Date filter
  if (filters.fecha_apertura__gte && filters.fecha_apertura__lte) {
    activeFilters.push({
      key: "fecha_apertura",
      label: "Fecha Apertura",
      value: `${filters.fecha_apertura__gte} a ${filters.fecha_apertura__lte}`,
    })
  } else if (filters.fecha_apertura__gte) {
    activeFilters.push({
      key: "fecha_apertura",
      label: "Fecha Apertura",
      value: `Desde ${filters.fecha_apertura__gte}`,
    })
  } else if (filters.fecha_apertura__lte) {
    activeFilters.push({
      key: "fecha_apertura",
      label: "Fecha Apertura",
      value: `Hasta ${filters.fecha_apertura__lte}`,
    })
  }

  // Numeric ID filter
  if (filters.id__gte && filters.id__lte && filters.id__gte === filters.id__lte) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `= ${filters.id__gte}`,
    })
  } else if (filters.id__gte && filters.id__lte) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `Entre ${filters.id__gte} y ${filters.id__lte}`,
    })
  } else if (filters.id__gt) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `> ${filters.id__gt}`,
    })
  } else if (filters.id__lt) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `< ${filters.id__lt}`,
    })
  } else if (filters.id__gte) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `>= ${filters.id__gte}`,
    })
  } else if (filters.id__lte) {
    activeFilters.push({
      key: "id_filter",
      label: "ID",
      value: `<= ${filters.id__lte}`,
    })
  }

  // Responsable filters
  if (filters.jefe_zonal !== null && filters.jefe_zonal !== undefined) {
    activeFilters.push({
      key: "jefe_zonal",
      label: "Jefe Zonal",
      value: jefeZonalNames[filters.jefe_zonal] || `ID: ${filters.jefe_zonal}`,
    })
  }

  if (filters.director !== null && filters.director !== undefined) {
    activeFilters.push({
      key: "director",
      label: "Director",
      value: directorNames[filters.director] || `ID: ${filters.director}`,
    })
  }

  if (filters.equipo_trabajo !== null && filters.equipo_trabajo !== undefined) {
    activeFilters.push({
      key: "equipo_trabajo",
      label: "Equipo de Trabajo",
      value: equipoTrabajoNames[filters.equipo_trabajo] || `ID: ${filters.equipo_trabajo}`,
    })
  }

  if (filters.equipo_centro_vida !== null && filters.equipo_centro_vida !== undefined) {
    activeFilters.push({
      key: "equipo_centro_vida",
      label: "Equipo Centro de Vida",
      value: equipoCentroVidaNames[filters.equipo_centro_vida] || `ID: ${filters.equipo_centro_vida}`,
    })
  }

  // Don't render if no filters are active
  if (activeFilters.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#f5f7fa",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      {/* Results Counter */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {totalResults}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalResults === 1 ? "legajo encontrado" : "legajos encontrados"}
          {totalCount !== undefined && totalCount !== totalResults && (
            <span> (de {totalCount} totales)</span>
          )}
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

      {/* Active Filters Chips */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          flex: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Filtros activos:
        </Typography>
        {activeFilters.map((filter) => (
          <Chip
            key={filter.key}
            label={
              <Box component="span">
                <Typography component="span" variant="caption" fontWeight={600} sx={{ mr: 0.5 }}>
                  {filter.label}:
                </Typography>
                <Typography component="span" variant="caption">
                  {filter.value}
                </Typography>
              </Box>
            }
            size="small"
            onDelete={() => onRemoveFilter(filter.key as any)}
            deleteIcon={<ClearIcon fontSize="small" />}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#f9f9f9",
              },
            }}
          />
        ))}
      </Box>

      {/* Clear All Button */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<ClearIcon fontSize="small" />}
        onClick={onClearAll}
        sx={{
          flexShrink: 0,
          textTransform: "none",
          borderColor: "#e0e0e0",
          color: "text.secondary",
          "&:hover": {
            borderColor: "error.main",
            color: "error.main",
            backgroundColor: "error.50",
          },
        }}
      >
        Limpiar todo
      </Button>
    </Box>
  )
}

export default ActiveFiltersBar
