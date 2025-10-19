"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Button,
  Popover,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Checkbox,
  Divider,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import FilterList from "@mui/icons-material/FilterList"
import { Check, AlertCircle, FileText, Clock, Shield, Calendar, Hash, Users, Filter } from "lucide-react"
import { get } from "@/app/api/apiService"
import DateRangeFilter from "../components/filters/DateRangeFilter"
import NumericFilter from "../components/filters/NumericFilter"
import ResponsableFilter from "../components/filters/ResponsableFilter"
import AdvancedFiltersPanel from "../components/filters/AdvancedFiltersPanel"
import { useFilterOptions } from "../hooks/useFilterOptions"

// Interfaz para los filtros de legajos
export interface LegajoFiltersState {
  zona: number | null
  urgencia: "ALTA" | "MEDIA" | "BAJA" | null
  tiene_medidas_activas: boolean | null
  tiene_oficios: boolean | null
  tiene_plan_trabajo: boolean | null
  tiene_alertas: boolean | null
  tiene_demanda_pi: boolean | null
  // Filtros numéricos
  id__gt?: number | null
  id__lt?: number | null
  id__gte?: number | null
  id__lte?: number | null
  // Filtros de fecha
  fecha_apertura__gte?: string | null
  fecha_apertura__lte?: string | null
  fecha_apertura__ultimos_dias?: number | null
  // Filtros de responsables
  jefe_zonal?: number | null
  director?: number | null
  equipo_trabajo?: number | null
  equipo_centro_vida?: number | null
  // Advanced filters (LEG-03 CA-3)
  demanda_estado?: "ACTIVA" | "CERRADA" | "DERIVADA" | null
  medida_tipo?: string[]
  oficio_tipo?: string[]
  oficios_proximos_vencer?: number | null
  oficios_vencidos?: boolean | null
  pt_pendientes?: boolean | null
  pt_en_progreso?: boolean | null
  pt_vencidas?: boolean | null
  etapa_medida?: "Intervención" | "Aval" | "Informe Jurídico" | "Ratificación" | null
}

interface LegajoFiltersProps {
  onFilterChange: (filters: LegajoFiltersState) => void
}

interface Zona {
  id: number
  nombre: string
  codigo: string | null
}

const LegajoFilters: React.FC<LegajoFiltersProps> = ({ onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null)
  const [numericAnchorEl, setNumericAnchorEl] = useState<null | HTMLElement>(null)
  const [responsableAnchorEl, setResponsableAnchorEl] = useState<null | HTMLElement>(null)
  const [advancedAnchorEl, setAdvancedAnchorEl] = useState<null | HTMLElement>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const filterOptions = useFilterOptions()
  const [filterState, setFilterState] = useState<LegajoFiltersState>({
    zona: null,
    urgencia: null,
    tiene_medidas_activas: null,
    tiene_oficios: null,
    tiene_plan_trabajo: null,
    tiene_alertas: null,
    tiene_demanda_pi: null,
    id__gt: null,
    id__lt: null,
    id__gte: null,
    id__lte: null,
    fecha_apertura__gte: null,
    fecha_apertura__lte: null,
    fecha_apertura__ultimos_dias: null,
    jefe_zonal: null,
    director: null,
    equipo_trabajo: null,
    equipo_centro_vida: null,
    demanda_estado: null,
    medida_tipo: [],
    oficio_tipo: [],
    oficios_proximos_vencer: null,
    oficios_vencidos: null,
    pt_pendientes: null,
    pt_en_progreso: null,
    pt_vencidas: null,
    etapa_medida: null,
  })

  // Fetch zonas on component mount
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await get<Zona[]>("zona/")
        setZonas(Array.isArray(response) ? response : [])
      } catch (error) {
        console.error("Error fetching zonas:", error)
        setZonas([])
      }
    }

    fetchZonas()
  }, [])

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  const handleZonaChange = (zonaId: number | null) => {
    const newState = {
      ...filterState,
      zona: filterState.zona === zonaId ? null : zonaId,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const handleUrgenciaChange = (urgencia: "ALTA" | "MEDIA" | "BAJA" | null) => {
    const newState = {
      ...filterState,
      urgencia: filterState.urgencia === urgencia ? null : urgencia,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const handleBooleanFilterChange = (
    key: keyof Omit<LegajoFiltersState, "zona" | "urgencia">,
    value: boolean
  ) => {
    const currentValue = filterState[key]
    const newValue = currentValue === value ? null : value

    const newState = {
      ...filterState,
      [key]: newValue,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const clearFilters = () => {
    const newState: LegajoFiltersState = {
      zona: null,
      urgencia: null,
      tiene_medidas_activas: null,
      tiene_oficios: null,
      tiene_plan_trabajo: null,
      tiene_alertas: null,
      tiene_demanda_pi: null,
      id__gt: null,
      id__lt: null,
      id__gte: null,
      id__lte: null,
      fecha_apertura__gte: null,
      fecha_apertura__lte: null,
      fecha_apertura__ultimos_dias: null,
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
      demanda_estado: null,
      medida_tipo: [],
      oficio_tipo: [],
      oficios_proximos_vencer: null,
      oficios_vencidos: null,
      pt_pendientes: null,
      pt_en_progreso: null,
      pt_vencidas: null,
      etapa_medida: null,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const handleAdvancedFilter = (advancedFilters: Partial<LegajoFiltersState>) => {
    const newState = {
      ...filterState,
      ...advancedFilters,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const handleDateFilter = (startDate: string | null, endDate: string | null, preset?: string) => {
    const newState = {
      ...filterState,
      fecha_apertura__gte: startDate,
      fecha_apertura__lte: endDate,
      fecha_apertura__ultimos_dias: preset ? null : filterState.fecha_apertura__ultimos_dias,
    }
    setFilterState(newState)
    onFilterChange(newState)
    setDateAnchorEl(null)
  }

  const handleNumericFilter = (mode: string, value1: number | null, value2?: number | null) => {
    const newState: LegajoFiltersState = {
      ...filterState,
      id__gt: null,
      id__lt: null,
      id__gte: null,
      id__lte: null,
    }

    if (mode === "exact" && value1 !== null) {
      newState.id__gte = value1
      newState.id__lte = value1
    } else if (mode === "greater" && value1 !== null) {
      newState.id__gt = value1
    } else if (mode === "less" && value1 !== null) {
      newState.id__lt = value1
    } else if (mode === "between" && value1 !== null && value2 !== null) {
      newState.id__gte = value1
      newState.id__lte = value2
    }

    setFilterState(newState)
    onFilterChange(newState)
    setNumericAnchorEl(null)
  }

  const handleResponsableFilter = (filters: Partial<LegajoFiltersState>) => {
    const newState = {
      ...filterState,
      ...filters,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  const hasActiveFilters = Object.values(filterState).some((value) => value !== null)

  return (
    <>
      <Button
        onClick={handleFilterClick}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...(hasActiveFilters && {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
          }),
        }}
      >
        <FilterList className="h-4 w-4" />
        <span>Filtros</span>
        {hasActiveFilters && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {Object.values(filterState).filter((v) => v !== null).length}
          </Box>
        )}
      </Button>

      {/* Date Filter Button */}
      <Button
        onClick={(e) => setDateAnchorEl(e.currentTarget)}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...((filterState.fecha_apertura__gte || filterState.fecha_apertura__lte) && {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
          }),
        }}
      >
        <Calendar className="h-4 w-4" />
        <span>Fecha</span>
        {(filterState.fecha_apertura__gte || filterState.fecha_apertura__lte) && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            1
          </Box>
        )}
      </Button>

      {/* Numeric Filter Button */}
      <Button
        onClick={(e) => setNumericAnchorEl(e.currentTarget)}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...((filterState.id__gt || filterState.id__lt || filterState.id__gte || filterState.id__lte) && {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
          }),
        }}
      >
        <Hash className="h-4 w-4" />
        <span>ID</span>
        {(filterState.id__gt || filterState.id__lt || filterState.id__gte || filterState.id__lte) && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            1
          </Box>
        )}
      </Button>

      {/* Responsables Filter Button */}
      <Button
        onClick={(e) => setResponsableAnchorEl(e.currentTarget)}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...((filterState.jefe_zonal ||
            filterState.director ||
            filterState.equipo_trabajo ||
            filterState.equipo_centro_vida) && {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
          }),
        }}
      >
        <Users className="h-4 w-4" />
        <span>Responsables</span>
        {(filterState.jefe_zonal ||
          filterState.director ||
          filterState.equipo_trabajo ||
          filterState.equipo_centro_vida) && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {[
              filterState.jefe_zonal,
              filterState.director,
              filterState.equipo_trabajo,
              filterState.equipo_centro_vida,
            ].filter((v) => v !== null).length}
          </Box>
        )}
      </Button>

      {/* Advanced Filters Button */}
      <Button
        onClick={(e) => setAdvancedAnchorEl(e.currentTarget)}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...((filterState.demanda_estado ||
            (filterState.medida_tipo && filterState.medida_tipo.length > 0) ||
            (filterState.oficio_tipo && filterState.oficio_tipo.length > 0) ||
            filterState.oficios_proximos_vencer ||
            filterState.oficios_vencidos ||
            filterState.pt_pendientes ||
            filterState.pt_en_progreso ||
            filterState.pt_vencidas ||
            filterState.etapa_medida) && {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
          }),
        }}
      >
        <Filter className="h-4 w-4" />
        <span>Avanzados</span>
        {(filterState.demanda_estado ||
          (filterState.medida_tipo && filterState.medida_tipo.length > 0) ||
          (filterState.oficio_tipo && filterState.oficio_tipo.length > 0) ||
          filterState.oficios_proximos_vencer ||
          filterState.oficios_vencidos ||
          filterState.pt_pendientes ||
          filterState.pt_en_progreso ||
          filterState.pt_vencidas ||
          filterState.etapa_medida) && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {[
              filterState.demanda_estado,
              filterState.medida_tipo && filterState.medida_tipo.length > 0,
              filterState.oficio_tipo && filterState.oficio_tipo.length > 0,
              filterState.oficios_proximos_vencer,
              filterState.oficios_vencidos,
              filterState.pt_pendientes,
              filterState.pt_en_progreso,
              filterState.pt_vencidas,
              filterState.etapa_medida,
            ].filter((v) => v).length}
          </Box>
        )}
      </Button>

      <Popover
        id="filter-menu"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        elevation={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            width: 320,
            maxHeight: 500,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="subtitle1" fontWeight="bold">
              Filtros de Legajos
            </Typography>
            <Button size="small" onClick={clearFilters} disabled={!hasActiveFilters}>
              Limpiar
            </Button>
          </div>

          <List disablePadding>
            {/* Zona Section */}
            <ListItem sx={{ py: 1.5, px: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Zona
              </Typography>
            </ListItem>

            <ListItem sx={{ py: 1, px: 0 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Seleccionar Zona</InputLabel>
                <Select
                  value={filterState.zona || ""}
                  onChange={(e) => handleZonaChange(e.target.value ? Number(e.target.value) : null)}
                  label="Seleccionar Zona"
                >
                  <MenuItem value="">
                    <em>Todas las zonas</em>
                  </MenuItem>
                  {zonas.map((zona) => (
                    <MenuItem key={zona.id} value={zona.id}>
                      {zona.nombre} {zona.codigo ? `(${zona.codigo})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>

            <Divider sx={{ my: 1.5 }} />

            {/* Urgencia/Prioridad Section */}
            <ListItem sx={{ py: 1.5, px: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Prioridad
              </Typography>
            </ListItem>

            <ListItem
              onClick={() => handleUrgenciaChange("ALTA")}
              sx={{ py: 1, px: 2, cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </ListItemIcon>
              <ListItemText primary="Alta" />
              {filterState.urgencia === "ALTA" && <Check className="h-4 w-4 text-primary" />}
            </ListItem>

            <ListItem
              onClick={() => handleUrgenciaChange("MEDIA")}
              sx={{ py: 1, px: 2, cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Clock className="h-4 w-4 text-yellow-500" />
              </ListItemIcon>
              <ListItemText primary="Media" />
              {filterState.urgencia === "MEDIA" && <Check className="h-4 w-4 text-primary" />}
            </ListItem>

            <ListItem
              onClick={() => handleUrgenciaChange("BAJA")}
              sx={{ py: 1, px: 2, cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FileText className="h-4 w-4 text-green-500" />
              </ListItemIcon>
              <ListItemText primary="Baja" />
              {filterState.urgencia === "BAJA" && <Check className="h-4 w-4 text-primary" />}
            </ListItem>

            <Divider sx={{ my: 1.5 }} />

            {/* Filtros Booleanos Section */}
            <ListItem sx={{ py: 1.5, px: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Características
              </Typography>
            </ListItem>

            <ListItem sx={{ py: 0.5, px: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.tiene_medidas_activas === true}
                    onChange={(e) => handleBooleanFilterChange("tiene_medidas_activas", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Con Medidas Activas</Typography>}
              />
            </ListItem>

            <ListItem sx={{ py: 0.5, px: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.tiene_oficios === true}
                    onChange={(e) => handleBooleanFilterChange("tiene_oficios", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Con Oficios</Typography>}
              />
            </ListItem>

            <ListItem sx={{ py: 0.5, px: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.tiene_plan_trabajo === true}
                    onChange={(e) => handleBooleanFilterChange("tiene_plan_trabajo", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Con Plan de Trabajo</Typography>}
              />
            </ListItem>

            <ListItem sx={{ py: 0.5, px: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.tiene_alertas === true}
                    onChange={(e) => handleBooleanFilterChange("tiene_alertas", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Con Alertas</Typography>}
              />
            </ListItem>

            <ListItem sx={{ py: 0.5, px: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterState.tiene_demanda_pi === true}
                    onChange={(e) => handleBooleanFilterChange("tiene_demanda_pi", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Con Demanda (PI)</Typography>}
              />
            </ListItem>
          </List>
        </Box>
      </Popover>

      {/* Date Filter Popover */}
      <Popover
        id="date-filter-menu"
        open={Boolean(dateAnchorEl)}
        anchorEl={dateAnchorEl}
        onClose={() => setDateAnchorEl(null)}
        elevation={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
          },
        }}
      >
        <DateRangeFilter
          onApply={handleDateFilter}
          startDate={filterState.fecha_apertura__gte || null}
          endDate={filterState.fecha_apertura__lte || null}
        />
      </Popover>

      {/* Numeric Filter Popover */}
      <Popover
        id="numeric-filter-menu"
        open={Boolean(numericAnchorEl)}
        anchorEl={numericAnchorEl}
        onClose={() => setNumericAnchorEl(null)}
        elevation={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
          },
        }}
      >
        <NumericFilter
          onApply={handleNumericFilter}
          currentValue1={filterState.id__gte || filterState.id__gt || null}
          currentValue2={filterState.id__lte || null}
        />
      </Popover>

      {/* Responsables Filter Popover */}
      <Popover
        id="responsable-filter-menu"
        open={Boolean(responsableAnchorEl)}
        anchorEl={responsableAnchorEl}
        onClose={() => setResponsableAnchorEl(null)}
        elevation={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
          },
        }}
      >
        <ResponsableFilter
          filters={filterState}
          onApply={handleResponsableFilter}
          onClose={() => setResponsableAnchorEl(null)}
          filterOptions={filterOptions}
        />
      </Popover>

      {/* Advanced Filters Popover */}
      <Popover
        id="advanced-filter-menu"
        open={Boolean(advancedAnchorEl)}
        anchorEl={advancedAnchorEl}
        onClose={() => setAdvancedAnchorEl(null)}
        elevation={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
          },
        }}
      >
        <AdvancedFiltersPanel
          filters={{
            demanda_estado: filterState.demanda_estado || null,
            medida_tipo: filterState.medida_tipo || [],
            oficio_tipo: filterState.oficio_tipo || [],
            oficios_proximos_vencer: filterState.oficios_proximos_vencer || null,
            oficios_vencidos: filterState.oficios_vencidos || null,
            pt_pendientes: filterState.pt_pendientes || null,
            pt_en_progreso: filterState.pt_en_progreso || null,
            pt_vencidas: filterState.pt_vencidas || null,
            etapa_medida: filterState.etapa_medida || null,
          }}
          onApply={handleAdvancedFilter}
          onClose={() => setAdvancedAnchorEl(null)}
        />
      </Popover>
    </>
  )
}

export default LegajoFilters
