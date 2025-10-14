"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { TextField, InputAdornment, IconButton, Box, CircularProgress } from "@mui/material"
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material"

interface LegajoSearchBarProps {
  onSearch: (searchTerm: string) => void
  placeholder?: string
  debounceMs?: number
  initialValue?: string
}

/**
 * Barra de búsqueda general para legajos (LEG-03 CA-1)
 *
 * Características:
 * - Búsqueda multi-campo (ID, Número, DNI, Nombre, Apellido, Zona)
 * - Debounce configurable (default 500ms)
 * - Case-insensitive
 * - Búsqueda parcial
 * - Loading indicator
 * - Clear button
 */
const LegajoSearchBar: React.FC<LegajoSearchBarProps> = ({
  onSearch,
  placeholder = "Buscar por ID, Número, DNI, Nombre, Apellido o Zona...",
  debounceMs = 500,
  initialValue = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchTerm)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
    }
  }, [searchTerm, debounceMs])

  // Trigger search when debounced value changes
  useEffect(() => {
    setIsSearching(true)
    onSearch(debouncedValue)
    // Simulate async search completion
    const timer = setTimeout(() => {
      setIsSearching(false)
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleClear = () => {
    setSearchTerm("")
    onSearch("")
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setDebouncedValue(searchTerm)
      onSearch(searchTerm)
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      <TextField
        fullWidth
        size="small"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "action.active" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSearching && <CircularProgress size={20} sx={{ mr: 1 }} />}
              {searchTerm && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  aria-label="Limpiar búsqueda"
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
            },
          },
        }}
        aria-label="Búsqueda de legajos"
      />
      {searchTerm && (
        <Box
          sx={{
            mt: 0.5,
            fontSize: "0.75rem",
            color: "text.secondary",
            px: 1,
          }}
        >
          Buscando en: ID, Número de Legajo, DNI, Nombre, Apellido, Zona, Demandas, Medidas y Oficios
        </Box>
      )}
    </Box>
  )
}

export default LegajoSearchBar
