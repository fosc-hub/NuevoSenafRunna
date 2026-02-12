"use client"

import React from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import ClearIcon from '@mui/icons-material/Clear'
import type { SelectChangeEvent } from '@mui/material'
import type { CategoriaDocumento, DocumentosFilterState } from '../../../types/repositorio-documentos'
import { CATEGORY_CONFIG, CATEGORY_ORDER, getTipoModeloLabel } from './constants'

interface FilterBarProps {
  filters: DocumentosFilterState
  onFilterChange: (filters: DocumentosFilterState) => void
  tipoModeloOptions: string[]
  medidasIds: number[]
  onExpandAll: () => void
  onCollapseAll: () => void
  hasActiveFilters: boolean
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  tipoModeloOptions,
  medidasIds,
  onExpandAll,
  onCollapseAll,
  hasActiveFilters,
}) => {
  const handleCategoriaChange = (event: SelectChangeEvent<CategoriaDocumento | 'TODOS'>) => {
    onFilterChange({
      ...filters,
      categoria: event.target.value as CategoriaDocumento | 'TODOS',
    })
  }

  const handleTipoModeloChange = (event: SelectChangeEvent<string>) => {
    onFilterChange({
      ...filters,
      tipoModelo: event.target.value,
    })
  }

  const handleMedidaIdChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    onFilterChange({
      ...filters,
      medidaId: value === 'TODOS' ? 'TODOS' : Number(value),
    })
  }

  const handleClearFilters = () => {
    onFilterChange({
      categoria: 'TODOS',
      tipoModelo: 'TODOS',
      medidaId: 'TODOS',
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      {/* Filters icon */}
      <FilterListIcon sx={{ color: 'text.secondary' }} />

      {/* Category filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="categoria-filter-label">Categoría</InputLabel>
        <Select
          labelId="categoria-filter-label"
          value={filters.categoria}
          label="Categoría"
          onChange={handleCategoriaChange}
        >
          <MenuItem value="TODOS">Todas</MenuItem>
          {CATEGORY_ORDER.map((categoria) => (
            <MenuItem key={categoria} value={categoria}>
              {CATEGORY_CONFIG[categoria].label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Type filter */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="tipo-filter-label">Tipo de documento</InputLabel>
        <Select
          labelId="tipo-filter-label"
          value={filters.tipoModelo}
          label="Tipo de documento"
          onChange={handleTipoModeloChange}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          {tipoModeloOptions.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>
              {getTipoModeloLabel(tipo)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Medida filter - only show if there are multiple medidas */}
      {medidasIds.length > 1 && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="medida-filter-label">Medida</InputLabel>
          <Select
            labelId="medida-filter-label"
            value={String(filters.medidaId)}
            label="Medida"
            onChange={handleMedidaIdChange}
          >
            <MenuItem value="TODOS">Todas</MenuItem>
            {medidasIds.map((medidaId) => (
              <MenuItem key={medidaId} value={String(medidaId)}>
                Medida #{medidaId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Tooltip title="Limpiar filtros">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            sx={{ textTransform: 'none' }}
          >
            Limpiar
          </Button>
        </Tooltip>
      )}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Expand/Collapse buttons */}
      <Tooltip title="Expandir todo">
        <Button
          size="small"
          variant="text"
          onClick={onExpandAll}
          startIcon={<UnfoldMoreIcon />}
          sx={{ textTransform: 'none' }}
        >
          Expandir
        </Button>
      </Tooltip>

      <Tooltip title="Contraer todo">
        <Button
          size="small"
          variant="text"
          onClick={onCollapseAll}
          startIcon={<UnfoldLessIcon />}
          sx={{ textTransform: 'none' }}
        >
          Contraer
        </Button>
      </Tooltip>
    </Box>
  )
}

export default FilterBar
