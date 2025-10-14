"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material"
import { DateRange as DateRangeIcon } from "@mui/icons-material"

interface DateRangeFilterProps {
  label?: string
  onApply: (startDate: string | null, endDate: string | null, preset?: string) => void
  startDate?: string | null
  endDate?: string | null
}

/**
 * Filtro de rango de fechas (LEG-03 CA-2)
 *
 * Características:
 * - Rango personalizado (desde/hasta)
 * - Presets: Últimos 7, 15, 30, 60, 90 días
 * - Formato ISO para API (YYYY-MM-DD)
 * - Validación de rango (desde < hasta)
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  label = "Fecha de Apertura",
  onApply,
  startDate = null,
  endDate = null,
}) => {
  const [localStartDate, setLocalStartDate] = useState<string>(startDate || "")
  const [localEndDate, setLocalEndDate] = useState<string>(endDate || "")
  const [preset, setPreset] = useState<string>("")

  const handlePresetChange = (days: number) => {
    const today = new Date()
    const startDateObj = new Date()
    startDateObj.setDate(today.getDate() - days)

    const startISO = startDateObj.toISOString().split("T")[0]
    const endISO = today.toISOString().split("T")[0]

    setLocalStartDate(startISO)
    setLocalEndDate(endISO)
    setPreset(`${days}`)
    onApply(startISO, endISO, `últimos ${days} días`)
  }

  const handleApply = () => {
    // Validate range
    if (localStartDate && localEndDate) {
      const start = new Date(localStartDate)
      const end = new Date(localEndDate)

      if (start > end) {
        alert("La fecha de inicio debe ser anterior a la fecha de fin")
        return
      }
    }

    onApply(localStartDate || null, localEndDate || null)
  }

  const handleClear = () => {
    setLocalStartDate("")
    setLocalEndDate("")
    setPreset("")
    onApply(null, null)
  }

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <DateRangeIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
      </Box>

      {/* Presets */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Atajos:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            size="small"
            variant={preset === "7" ? "contained" : "outlined"}
            onClick={() => handlePresetChange(7)}
            sx={{ textTransform: "none" }}
          >
            Últimos 7 días
          </Button>
          <Button
            size="small"
            variant={preset === "15" ? "contained" : "outlined"}
            onClick={() => handlePresetChange(15)}
            sx={{ textTransform: "none" }}
          >
            Últimos 15 días
          </Button>
          <Button
            size="small"
            variant={preset === "30" ? "contained" : "outlined"}
            onClick={() => handlePresetChange(30)}
            sx={{ textTransform: "none" }}
          >
            Últimos 30 días
          </Button>
          <Button
            size="small"
            variant={preset === "60" ? "contained" : "outlined"}
            onClick={() => handlePresetChange(60)}
            sx={{ textTransform: "none" }}
          >
            Últimos 60 días
          </Button>
          <Button
            size="small"
            variant={preset === "90" ? "contained" : "outlined"}
            onClick={() => handlePresetChange(90)}
            sx={{ textTransform: "none" }}
          >
            Últimos 90 días
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Custom Range */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Rango personalizado:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={localStartDate}
            onChange={(e) => {
              setLocalStartDate(e.target.value)
              setPreset("")
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={localEndDate}
            onChange={(e) => {
              setLocalEndDate(e.target.value)
              setPreset("")
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button size="small" onClick={handleClear} disabled={!localStartDate && !localEndDate}>
          Limpiar
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleApply}
          disabled={!localStartDate && !localEndDate}
        >
          Aplicar
        </Button>
      </Box>
    </Box>
  )
}

export default DateRangeFilter
