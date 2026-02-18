"use client"

/**
 * CategoriaInfoSection - Hierarchical categoria/tipo dropdown section
 *
 * Provides two linked dropdowns:
 * 1. Categoría de Información - Parent category
 * 2. Tipo de Información - Child type (filtered by selected categoria)
 */

import type React from "react"
import { useMemo } from "react"
import {
  Box,
  Grid,
  FormControl,
  Autocomplete,
  TextField,
  Typography,
  Chip,
  alpha,
} from "@mui/material"
import { Category as CategoryIcon, Label as LabelIcon } from "@mui/icons-material"
import type { CategoriaInfoSectionProps } from "../types/carga-oficios.types"

const CategoriaInfoSection: React.FC<CategoriaInfoSectionProps> = ({
  categorias,
  tipos,
  selectedCategoria,
  selectedTipo,
  onCategoriaChange,
  onTipoChange,
  readOnly = false,
  errors,
}) => {
  // Filter tipos by selected categoria
  const filteredTipos = useMemo(() => {
    if (!selectedCategoria) return []
    return tipos.filter((tipo) => tipo.categoria === selectedCategoria)
  }, [tipos, selectedCategoria])

  // Find selected categoria object
  const selectedCategoriaObj = useMemo(() => {
    return categorias.find((c) => c.id === selectedCategoria) || null
  }, [categorias, selectedCategoria])

  // Find selected tipo object
  const selectedTipoObj = useMemo(() => {
    return tipos.find((t) => t.id === selectedTipo) || null
  }, [tipos, selectedTipo])

  // Handle categoria change - clear tipo when categoria changes
  const handleCategoriaChange = (newValue: { id: number } | null) => {
    onCategoriaChange(newValue?.id || null)
    // Clear tipo when categoria changes
    if (newValue?.id !== selectedCategoria) {
      onTipoChange(null)
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Categoría de Información */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors?.categoria}>
            <Autocomplete
              disabled={readOnly}
              options={categorias}
              getOptionLabel={(option) => option.nombre}
              value={selectedCategoriaObj}
              onChange={(_, newValue) => handleCategoriaChange(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoría de Información"
                  required
                  error={!!errors?.categoria}
                  helperText={errors?.categoria}
                  size="medium"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <CategoryIcon
                          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.descripcion && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        {option.descripcion}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText="No se encontraron categorías"
              loadingText="Cargando categorías..."
              size="medium"
            />
          </FormControl>
        </Grid>

        {/* Tipo de Información */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors?.tipo}>
            <Autocomplete
              disabled={readOnly || !selectedCategoria}
              options={filteredTipos}
              getOptionLabel={(option) => option.nombre}
              value={selectedTipoObj}
              onChange={(_, newValue) => onTipoChange(newValue?.id || null)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo de Información"
                  required
                  error={!!errors?.tipo}
                  helperText={
                    errors?.tipo ||
                    (!selectedCategoria
                      ? "Seleccione primero una categoría"
                      : undefined)
                  }
                  size="medium"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <LabelIcon
                          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.nombre}
                    </Typography>
                    {option.descripcion && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        {option.descripcion}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                selectedCategoria
                  ? "No se encontraron tipos para esta categoría"
                  : "Seleccione una categoría primero"
              }
              loadingText="Cargando tipos..."
              size="medium"
            />
          </FormControl>
        </Grid>
      </Grid>

      {/* Selected summary */}
      {selectedCategoriaObj && selectedTipoObj && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
            borderRadius: 1,
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block" }}>
            Clasificación seleccionada:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<CategoryIcon sx={{ fontSize: 16 }} />}
              label={selectedCategoriaObj.nombre}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 600,
              }}
            />
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              →
            </Typography>
            <Chip
              icon={<LabelIcon sx={{ fontSize: 16 }} />}
              label={selectedTipoObj.nombre}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                color: "secondary.main",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default CategoriaInfoSection
