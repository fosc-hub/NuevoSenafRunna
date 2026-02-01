"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  Box,
  TextField,
  Chip,
  InputAdornment,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import ClearIcon from "@mui/icons-material/Clear"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import type {
  CategoriaEvento,
  HistorialSeguimientoQueryParams,
} from "../../../types/historial-seguimiento-api"
import { CATEGORIA_CONFIGS } from "../../../types/historial-seguimiento-api"

interface HistorialFiltersProps {
  filters: HistorialSeguimientoQueryParams
  onFiltersChange: (filters: HistorialSeguimientoQueryParams) => void
  onSearch: () => void
  onReset: () => void
  loading?: boolean
}

const CATEGORIAS: CategoriaEvento[] = [
  'ACTIVIDAD',
  'INTERVENCION',
  'ETAPA',
  'INFORME',
  'SEGUIMIENTO',
  'MEDIDA',
  'OFICIO',
  'MANUAL',
]

export const HistorialFilters: React.FC<HistorialFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: event.target.value })
    },
    [filters, onFiltersChange]
  )

  const handleCategoriaClick = useCallback(
    (categoria: CategoriaEvento) => {
      if (filters.categoria === categoria) {
        // Deselect if already selected
        const { categoria: _, ...rest } = filters
        onFiltersChange(rest)
      } else {
        onFiltersChange({ ...filters, categoria })
      }
    },
    [filters, onFiltersChange]
  )

  const handleFechaDesdeChange = useCallback(
    (date: Date | null) => {
      if (date) {
        onFiltersChange({ ...filters, fecha_desde: format(date, 'yyyy-MM-dd') })
      } else {
        const { fecha_desde: _, ...rest } = filters
        onFiltersChange(rest)
      }
    },
    [filters, onFiltersChange]
  )

  const handleFechaHastaChange = useCallback(
    (date: Date | null) => {
      if (date) {
        onFiltersChange({ ...filters, fecha_hasta: format(date, 'yyyy-MM-dd') })
      } else {
        const { fecha_hasta: _, ...rest } = filters
        onFiltersChange(rest)
      }
    },
    [filters, onFiltersChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        onSearch()
      }
    },
    [onSearch]
  )

  const hasActiveFilters =
    !!filters.search ||
    !!filters.categoria ||
    !!filters.fecha_desde ||
    !!filters.fecha_hasta ||
    !!filters.etapa

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ mb: 3 }}>
        {/* Search and toggle row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar en el historial..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const { search: _, ...rest } = filters
                      onFiltersChange(rest)
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title={showAdvanced ? 'Ocultar filtros' : 'Más filtros'}>
            <Button
              variant={showAdvanced ? 'contained' : 'outlined'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={<FilterListIcon />}
              endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filtros
            </Button>
          </Tooltip>
        </Box>

        {/* Category chips */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
          {CATEGORIAS.map((categoria) => {
            const config = CATEGORIA_CONFIGS[categoria]
            const isSelected = filters.categoria === categoria

            return (
              <Chip
                key={categoria}
                label={config.label}
                onClick={() => handleCategoriaClick(categoria)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: isSelected ? config.backgroundColor : 'transparent',
                  borderColor: config.color,
                  color: isSelected ? config.color : 'text.secondary',
                  fontWeight: isSelected ? 600 : 400,
                  '&:hover': {
                    backgroundColor: config.backgroundColor,
                  },
                }}
              />
            )
          })}
        </Box>

        {/* Advanced filters */}
        <Collapse in={showAdvanced}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <DatePicker
              label="Fecha desde"
              value={filters.fecha_desde ? new Date(filters.fecha_desde) : null}
              onChange={handleFechaDesdeChange}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 180 },
                },
              }}
              disabled={loading}
            />

            <DatePicker
              label="Fecha hasta"
              value={filters.fecha_hasta ? new Date(filters.fecha_hasta) : null}
              onChange={handleFechaHastaChange}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 180 },
                },
              }}
              disabled={loading}
            />

            <Box sx={{ flex: 1 }} />

            <Button
              variant="outlined"
              onClick={onReset}
              disabled={!hasActiveFilters || loading}
              startIcon={<ClearIcon />}
            >
              Limpiar
            </Button>

            <Button
              variant="contained"
              onClick={onSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
            >
              Buscar
            </Button>
          </Box>
        </Collapse>

        {/* Active filters summary */}
        {hasActiveFilters && !showAdvanced && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Filtros activos:
            </Typography>

            {filters.fecha_desde && (
              <Chip
                size="small"
                label={`Desde: ${filters.fecha_desde}`}
                onDelete={() => {
                  const { fecha_desde: _, ...rest } = filters
                  onFiltersChange(rest)
                }}
              />
            )}

            {filters.fecha_hasta && (
              <Chip
                size="small"
                label={`Hasta: ${filters.fecha_hasta}`}
                onDelete={() => {
                  const { fecha_hasta: _, ...rest } = filters
                  onFiltersChange(rest)
                }}
              />
            )}

            <Button
              size="small"
              onClick={onReset}
              sx={{ ml: 'auto' }}
            >
              Limpiar todo
            </Button>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  )
}
