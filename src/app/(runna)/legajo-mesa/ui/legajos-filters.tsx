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
import { Check, AlertCircle, FileText, Clock, Shield } from "lucide-react"
import { get } from "@/app/api/apiService"

// Interfaz para los filtros de legajos
export interface LegajoFiltersState {
  zona: number | null
  urgencia: "ALTA" | "MEDIA" | "BAJA" | null
  tiene_medidas_activas: boolean | null
  tiene_oficios: boolean | null
  tiene_plan_trabajo: boolean | null
  tiene_alertas: boolean | null
  tiene_demanda_pi: boolean | null
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
  const [zonas, setZonas] = useState<Zona[]>([])
  const [filterState, setFilterState] = useState<LegajoFiltersState>({
    zona: null,
    urgencia: null,
    tiene_medidas_activas: null,
    tiene_oficios: null,
    tiene_plan_trabajo: null,
    tiene_alertas: null,
    tiene_demanda_pi: null,
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
    </>
  )
}

export default LegajoFilters
