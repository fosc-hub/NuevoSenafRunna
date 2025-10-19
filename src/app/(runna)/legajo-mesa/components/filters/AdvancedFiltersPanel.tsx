"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Divider,
} from "@mui/material"
import { FileText, AlertTriangle, Scale, FileCheck } from "lucide-react"

// Type imports from parent
type DemandaEstado = "ACTIVA" | "CERRADA" | "DERIVADA" | null
type EtapaMedida = "Intervención" | "Aval" | "Informe Jurídico" | "Ratificación" | null

export interface AdvancedFiltersState {
  demanda_estado?: DemandaEstado
  medida_tipo?: string[]
  oficio_tipo?: string[]
  oficios_proximos_vencer?: number | null
  oficios_vencidos?: boolean | null
  pt_pendientes?: boolean | null
  pt_en_progreso?: boolean | null
  pt_vencidas?: boolean | null
  etapa_medida?: EtapaMedida
}

interface AdvancedFiltersPanelProps {
  filters: AdvancedFiltersState
  onApply: (filters: AdvancedFiltersState) => void
  onClose: () => void
}

// Constants for filter options
const DEMANDA_ESTADOS: DemandaEstado[] = ["ACTIVA", "CERRADA", "DERIVADA"]

const MEDIDA_TIPOS = [
  { value: "MPI", label: "Medida de Protección Integral" },
  { value: "MPE", label: "Medida de Protección Excepcional" },
  { value: "MPJ", label: "Medida de Protección Judicial" },
]

const OFICIO_TIPOS = [
  { value: "Ratificación", label: "Ratificación" },
  { value: "Pedido", label: "Pedido" },
  { value: "Orden", label: "Orden" },
  { value: "Otros", label: "Otros" },
]

const ETAPA_MEDIDAS: EtapaMedida[] = ["Intervención", "Aval", "Informe Jurídico", "Ratificación"]

const VENCIMIENTO_PRESETS = [
  { value: 3, label: "Próximos 3 días" },
  { value: 7, label: "Próximos 7 días" },
  { value: 15, label: "Próximos 15 días" },
  { value: 30, label: "Próximos 30 días" },
]

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({ filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFiltersState>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleDemandaEstadoChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as DemandaEstado
    setLocalFilters({
      ...localFilters,
      demanda_estado: value || null,
    })
  }

  const handleMedidaTipoChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setLocalFilters({
      ...localFilters,
      medida_tipo: typeof value === "string" ? value.split(",") : value,
    })
  }

  const handleOficioTipoChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setLocalFilters({
      ...localFilters,
      oficio_tipo: typeof value === "string" ? value.split(",") : value,
    })
  }

  const handleEtapaMedidaChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as EtapaMedida
    setLocalFilters({
      ...localFilters,
      etapa_medida: value || null,
    })
  }

  const handleVencimientoPresetChange = (dias: number) => {
    setLocalFilters({
      ...localFilters,
      oficios_proximos_vencer: dias,
      oficios_vencidos: null, // Clear vencidos when setting preset
    })
  }

  const handleCustomVencimientoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : null
    setLocalFilters({
      ...localFilters,
      oficios_proximos_vencer: value,
    })
  }

  const handleOficiosVencidosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({
      ...localFilters,
      oficios_vencidos: event.target.checked || null,
      oficios_proximos_vencer: event.target.checked ? null : localFilters.oficios_proximos_vencer, // Clear preset when checking vencidos
    })
  }

  const handlePTFilterChange = (key: "pt_pendientes" | "pt_en_progreso" | "pt_vencidas", checked: boolean) => {
    setLocalFilters({
      ...localFilters,
      [key]: checked || null,
    })
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleClear = () => {
    const clearedFilters: AdvancedFiltersState = {
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
    setLocalFilters(clearedFilters)
    onApply(clearedFilters)
  }

  const hasActiveFilters =
    localFilters.demanda_estado ||
    (localFilters.medida_tipo && localFilters.medida_tipo.length > 0) ||
    (localFilters.oficio_tipo && localFilters.oficio_tipo.length > 0) ||
    localFilters.oficios_proximos_vencer ||
    localFilters.oficios_vencidos ||
    localFilters.pt_pendientes ||
    localFilters.pt_en_progreso ||
    localFilters.pt_vencidas ||
    localFilters.etapa_medida

  return (
    <Box sx={{ p: 3, width: 420, maxHeight: "70vh", overflow: "auto" }}>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" fontWeight="bold">
          Filtros Avanzados
        </Typography>
        <Button size="small" onClick={handleClear} disabled={!hasActiveFilters}>
          Limpiar
        </Button>
      </div>

      {/* Demanda Estado Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <FileText className="h-4 w-4" />
          Estado de Demanda
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Estado de Demanda (PI)</InputLabel>
          <Select
            value={localFilters.demanda_estado || ""}
            onChange={handleDemandaEstadoChange}
            label="Estado de Demanda (PI)"
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {DEMANDA_ESTADOS.map((estado) => (
              <MenuItem key={estado} value={estado}>
                {estado}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Medida Tipo Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Scale className="h-4 w-4" />
          Tipo de Medida
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Tipos de Medida</InputLabel>
          <Select
            multiple
            value={localFilters.medida_tipo || []}
            onChange={handleMedidaTipoChange}
            input={<OutlinedInput label="Tipos de Medida" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => {
                  const tipo = MEDIDA_TIPOS.find((t) => t.value === value)
                  return <Chip key={value} label={tipo?.value || value} size="small" />
                })}
              </Box>
            )}
          >
            {MEDIDA_TIPOS.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                {tipo.label} ({tipo.value})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Etapa Medida Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
          Etapa de Medida (Andarivel)
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Etapa del Andarivel</InputLabel>
          <Select
            value={localFilters.etapa_medida || ""}
            onChange={handleEtapaMedidaChange}
            label="Etapa del Andarivel"
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {ETAPA_MEDIDAS.map((etapa) => (
              <MenuItem key={etapa} value={etapa}>
                {etapa}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Oficio Tipo Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <FileCheck className="h-4 w-4" />
          Tipos de Oficio
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Tipos de Oficio</InputLabel>
          <Select
            multiple
            value={localFilters.oficio_tipo || []}
            onChange={handleOficioTipoChange}
            input={<OutlinedInput label="Tipos de Oficio" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {OFICIO_TIPOS.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Oficios Vencimientos Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <AlertTriangle className="h-4 w-4" />
          Vencimiento de Oficios
        </Typography>

        {/* Presets */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Presets rápidos:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {VENCIMIENTO_PRESETS.map((preset) => (
              <Chip
                key={preset.value}
                label={preset.label}
                size="small"
                onClick={() => handleVencimientoPresetChange(preset.value)}
                color={localFilters.oficios_proximos_vencer === preset.value ? "primary" : "default"}
                variant={localFilters.oficios_proximos_vencer === preset.value ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>

        {/* Custom days input */}
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Días personalizados"
          value={localFilters.oficios_proximos_vencer || ""}
          onChange={handleCustomVencimientoChange}
          InputProps={{ inputProps: { min: 1, max: 365 } }}
          sx={{ mb: 1.5 }}
        />

        {/* Vencidos checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.oficios_vencidos === true}
              onChange={handleOficiosVencidosChange}
              size="small"
            />
          }
          label={<Typography variant="body2">Mostrar solo oficios vencidos</Typography>}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Plan de Trabajo (PT) Filters Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
          Estado de Actividades PT
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.pt_pendientes === true}
              onChange={(e) => handlePTFilterChange("pt_pendientes", e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Con actividades pendientes</Typography>}
          sx={{ display: "block", mb: 0.5 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.pt_en_progreso === true}
              onChange={(e) => handlePTFilterChange("pt_en_progreso", e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Con actividades en progreso</Typography>}
          sx={{ display: "block", mb: 0.5 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.pt_vencidas === true}
              onChange={(e) => handlePTFilterChange("pt_vencidas", e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Con actividades vencidas</Typography>}
          sx={{ display: "block" }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Aplicar Filtros
        </Button>
      </Box>
    </Box>
  )
}

export default AdvancedFiltersPanel
