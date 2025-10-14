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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import { Numbers as NumbersIcon } from "@mui/icons-material"

type NumericFilterMode = "exact" | "greater" | "less" | "between"

interface NumericFilterProps {
  label?: string
  onApply: (mode: NumericFilterMode, value1: number | null, value2?: number | null) => void
  currentMode?: NumericFilterMode
  currentValue1?: number | null
  currentValue2?: number | null
  placeholder?: string
}

/**
 * Filtro numérico con múltiples modos (LEG-03 CA-2)
 *
 * Modos:
 * - Exacto: ID = valor
 * - Mayor que: ID > valor
 * - Menor que: ID < valor
 * - Entre: valor1 < ID < valor2
 */
const NumericFilter: React.FC<NumericFilterProps> = ({
  label = "ID de Legajo",
  onApply,
  currentMode = "exact",
  currentValue1 = null,
  currentValue2 = null,
  placeholder = "Ej: 100",
}) => {
  const [mode, setMode] = useState<NumericFilterMode>(currentMode)
  const [value1, setValue1] = useState<string>(currentValue1?.toString() || "")
  const [value2, setValue2] = useState<string>(currentValue2?.toString() || "")

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: NumericFilterMode | null) => {
    if (newMode !== null) {
      setMode(newMode)
    }
  }

  const handleApply = () => {
    const num1 = value1 ? parseFloat(value1) : null
    const num2 = value2 ? parseFloat(value2) : null

    // Validations
    if (!num1) {
      alert("Ingrese un valor")
      return
    }

    if (mode === "between" && !num2) {
      alert("Ingrese el segundo valor para el rango")
      return
    }

    if (mode === "between" && num1 && num2 && num1 >= num2) {
      alert("El primer valor debe ser menor que el segundo")
      return
    }

    onApply(mode, num1, num2)
  }

  const handleClear = () => {
    setValue1("")
    setValue2("")
    setMode("exact")
    onApply("exact", null, null)
  }

  const getModeLabel = () => {
    switch (mode) {
      case "exact":
        return "Igual a"
      case "greater":
        return "Mayor que"
      case "less":
        return "Menor que"
      case "between":
        return "Entre"
      default:
        return ""
    }
  }

  return (
    <Box sx={{ p: 2, minWidth: 320 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <NumbersIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
      </Box>

      {/* Mode Selection */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Tipo de filtro:
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          fullWidth
          sx={{ display: "flex", flexWrap: "wrap" }}
        >
          <ToggleButton value="exact" sx={{ flex: "1 1 45%", textTransform: "none" }}>
            Exacto
          </ToggleButton>
          <ToggleButton value="greater" sx={{ flex: "1 1 45%", textTransform: "none" }}>
            Mayor que
          </ToggleButton>
          <ToggleButton value="less" sx={{ flex: "1 1 45%", textTransform: "none" }}>
            Menor que
          </ToggleButton>
          <ToggleButton value="between" sx={{ flex: "1 1 45%", textTransform: "none" }}>
            Entre
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Value Inputs */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label={mode === "between" ? "Valor mínimo" : getModeLabel()}
          type="number"
          size="small"
          value={value1}
          onChange={(e) => setValue1(e.target.value)}
          placeholder={placeholder}
          fullWidth
          sx={{ mb: mode === "between" ? 2 : 0 }}
        />

        {mode === "between" && (
          <TextField
            label="Valor máximo"
            type="number"
            size="small"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            placeholder="Ej: 200"
            fullWidth
          />
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button size="small" onClick={handleClear} disabled={!value1 && !value2}>
          Limpiar
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleApply}
          disabled={!value1 || (mode === "between" && !value2)}
        >
          Aplicar
        </Button>
      </Box>

      {/* Helper text */}
      {value1 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {mode === "exact" && `Buscará legajos con ID = ${value1}`}
          {mode === "greater" && `Buscará legajos con ID &gt; ${value1}`}
          {mode === "less" && `Buscará legajos con ID &lt; ${value1}`}
          {mode === "between" && value2 && `Buscará legajos con ID entre ${value1} y ${value2}`}
        </Typography>
      )}
    </Box>
  )
}

export default NumericFilter
