"use client"

/**
 * CategoriaInfoSection - Categoria dropdown section
 *
 * Shows only the Categoría de Información dropdown.
 * tipo_informacion_judicial is deprecated - tipo_oficio is now filtered by categoria
 * and shown separately in the parent form.
 */

import type React from "react"
import { useMemo } from "react"
import {
  Box,
  FormControl,
  Autocomplete,
  TextField,
  Typography,
  alpha,
} from "@mui/material"
import { Category as CategoryIcon } from "@mui/icons-material"
import type { CategoriaInfoSectionProps } from "../types/carga-oficios.types"

const CategoriaInfoSection: React.FC<CategoriaInfoSectionProps> = ({
  categorias,
  selectedCategoria,
  onCategoriaChange,
  readOnly = false,
  errors,
}) => {
  // Find selected categoria object
  const selectedCategoriaObj = useMemo(() => {
    return categorias.find((c) => c.id === selectedCategoria) || null
  }, [categorias, selectedCategoria])

  return (
    <Box>
      <FormControl fullWidth error={!!errors?.categoria}>
        <Autocomplete
          disabled={readOnly}
          options={categorias}
          getOptionLabel={(option) => option.nombre}
          value={selectedCategoriaObj}
          onChange={(_, newValue) => onCategoriaChange(newValue?.id || null)}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoría de Información *"
              required
              error={!!errors?.categoria}
              helperText={errors?.categoria || "Seleccione la categoría para filtrar los tipos de oficio"}
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
    </Box>
  )
}

export default CategoriaInfoSection
