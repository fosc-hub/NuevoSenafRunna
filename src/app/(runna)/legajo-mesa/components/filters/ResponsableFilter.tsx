"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material"
import type { LegajoFiltersState } from "../../ui/legajos-filters"
import type { FilterOption } from "../../hooks/useFilterOptions"

interface ResponsableFilterProps {
  filters: LegajoFiltersState
  onApply: (filters: Partial<LegajoFiltersState>) => void
  onClose: () => void
  filterOptions: {
    jefesZonales: FilterOption[]
    directores: FilterOption[]
    equiposTrabajo: FilterOption[]
    equiposCentroVida: FilterOption[]
    isLoading: boolean
    error: string | null
  }
}

/**
 * Filtro de Responsables (LEG-03 FASE 4)
 *
 * Características:
 * - Selección de Jefe Zonal
 * - Selección de Director
 * - Selección de Equipo de Trabajo
 * - Selección de Equipo de Centro de Vida
 * - Opciones cargadas dinámicamente desde API
 * - Botones Aplicar y Limpiar
 */
const ResponsableFilter: React.FC<ResponsableFilterProps> = ({
  filters,
  onApply,
  onClose,
  filterOptions,
}) => {
  const [jefeZonal, setJefeZonal] = useState<number | "">(filters.jefe_zonal ?? "")
  const [director, setDirector] = useState<number | "">(filters.director ?? "")
  const [equipoTrabajo, setEquipoTrabajo] = useState<number | "">(filters.equipo_trabajo ?? "")
  const [equipoCentroVida, setEquipoCentroVida] = useState<number | "">(
    filters.equipo_centro_vida ?? ""
  )

  const handleApply = () => {
    const newFilters: Partial<LegajoFiltersState> = {}

    if (jefeZonal !== "") {
      newFilters.jefe_zonal = jefeZonal as number
    }
    if (director !== "") {
      newFilters.director = director as number
    }
    if (equipoTrabajo !== "") {
      newFilters.equipo_trabajo = equipoTrabajo as number
    }
    if (equipoCentroVida !== "") {
      newFilters.equipo_centro_vida = equipoCentroVida as number
    }

    onApply(newFilters)
    onClose()
  }

  const handleClear = () => {
    setJefeZonal("")
    setDirector("")
    setEquipoTrabajo("")
    setEquipoCentroVida("")

    onApply({
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
    })
    onClose()
  }

  const hasActiveFilters =
    jefeZonal !== "" || director !== "" || equipoTrabajo !== "" || equipoCentroVida !== ""

  if (filterOptions.isLoading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Cargando opciones...
        </Typography>
      </Box>
    )
  }

  if (filterOptions.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{filterOptions.error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minWidth: 350 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Filtrar por Responsables
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Jefe Zonal */}
        <FormControl fullWidth size="small">
          <InputLabel id="jefe-zonal-label">Jefe Zonal</InputLabel>
          <Select
            labelId="jefe-zonal-label"
            value={jefeZonal}
            onChange={(e) => setJefeZonal(e.target.value as number | "")}
            label="Jefe Zonal"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {filterOptions.jefesZonales.map((jefe) => (
              <MenuItem key={jefe.id} value={jefe.id}>
                {jefe.nombre_completo || jefe.nombre || `ID: ${jefe.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Director */}
        <FormControl fullWidth size="small">
          <InputLabel id="director-label">Director</InputLabel>
          <Select
            labelId="director-label"
            value={director}
            onChange={(e) => setDirector(e.target.value as number | "")}
            label="Director"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {filterOptions.directores.map((dir) => (
              <MenuItem key={dir.id} value={dir.id}>
                {dir.nombre_completo || dir.nombre || `ID: ${dir.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Equipo de Trabajo */}
        <FormControl fullWidth size="small">
          <InputLabel id="equipo-trabajo-label">Equipo de Trabajo</InputLabel>
          <Select
            labelId="equipo-trabajo-label"
            value={equipoTrabajo}
            onChange={(e) => setEquipoTrabajo(e.target.value as number | "")}
            label="Equipo de Trabajo"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {filterOptions.equiposTrabajo.map((equipo) => (
              <MenuItem key={equipo.id} value={equipo.id}>
                {equipo.nombre || equipo.codigo || `ID: ${equipo.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Equipo de Centro de Vida */}
        <FormControl fullWidth size="small">
          <InputLabel id="equipo-centro-vida-label">Equipo Centro de Vida</InputLabel>
          <Select
            labelId="equipo-centro-vida-label"
            value={equipoCentroVida}
            onChange={(e) => setEquipoCentroVida(e.target.value as number | "")}
            label="Equipo Centro de Vida"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {filterOptions.equiposCentroVida.map((equipo) => (
              <MenuItem key={equipo.id} value={equipo.id}>
                {equipo.nombre || equipo.codigo || `ID: ${equipo.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            sx={{ flex: 1, textTransform: "none" }}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleApply}
            sx={{ flex: 1, textTransform: "none" }}
          >
            Aplicar
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ResponsableFilter
