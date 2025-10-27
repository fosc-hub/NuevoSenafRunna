"use client"

import React, { useState, useMemo } from "react"
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FolderIcon from "@mui/icons-material/Folder"
import { debounce } from "lodash"
import { get } from "@/app/api/apiService"

export interface MedidaActiva {
  id: number
  numero_medida: string
  tipo_medida: string
  estado_vigencia: string
  etapa_actual__nombre: string | null
  etapa_actual__estado: string | null
}

interface Legajo {
  id: number
  numero: string
  nnya: {
    id: number
    nombre: string
    apellido: string
    dni: number | null
  }
  medidas_activas?: MedidaActiva[]
}

export interface LegajoOption {
  id: number
  numero: string
  displayText: string
  subtitle: string
  medidas_activas?: MedidaActiva[]
}

interface LegajoSearchAutocompleteProps {
  value: LegajoOption | null
  onChange: (value: LegajoOption | null) => void
  label?: string
  placeholder?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  excludeLegajoId?: number // To prevent selecting the same legajo
}

export default function LegajoSearchAutocomplete({
  value,
  onChange,
  label = "Buscar Legajo",
  placeholder = "Buscar por número de legajo o nombre del NNyA...",
  error = false,
  helperText,
  disabled = false,
  excludeLegajoId,
}: LegajoSearchAutocompleteProps) {
  const [options, setOptions] = useState<LegajoOption[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const searchLegajos = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      // Search using the legajos list endpoint with search parameter
      const response = await get<{
        count: number
        results: Legajo[]
      }>("legajos/", {
        search: searchTerm,
        page_size: 20, // Limit results
      })

      // Transform legajos to options
      const legajoOptions: LegajoOption[] = response.results
        .filter((legajo) => {
          // Exclude the specified legajo if provided
          if (excludeLegajoId && legajo.id === excludeLegajoId) {
            return false
          }
          return true
        })
        .map((legajo) => ({
          id: legajo.id,
          numero: legajo.numero,
          displayText: `${legajo.numero} - ${legajo.nnya.nombre} ${legajo.nnya.apellido}`,
          subtitle: legajo.nnya.dni ? `DNI: ${legajo.nnya.dni}` : "Sin DNI",
          medidas_activas: legajo.medidas_activas || [],
        }))

      setOptions(legajoOptions)
    } catch (error) {
      console.error("Error searching legajos:", error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        searchLegajos(searchTerm)
      }, 500),
    [excludeLegajoId]
  )

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue)
    debouncedSearch(newInputValue)
  }

  const handleChange = (event: React.SyntheticEvent, newValue: LegajoOption | null) => {
    onChange(newValue)
  }

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option.displayText}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={
        inputValue.length < 2
          ? "Ingrese al menos 2 caracteres para buscar"
          : "No se encontraron legajos"
      }
      loadingText="Buscando legajos..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <FolderIcon sx={{ mr: 2, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.displayText}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.subtitle}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    />
  )
}
