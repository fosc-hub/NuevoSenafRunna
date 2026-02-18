"use client"

/**
 * CircuitoSelector - Toggle button group for selecting MPI/MPE/MPJ circuit type
 *
 * Used in the CARGA_OFICIOS form to classify the type of judicial measure.
 */

import type React from "react"
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  FormHelperText,
  Tooltip,
  alpha,
} from "@mui/material"
import type { CircuitoType, CircuitoSelectorProps } from "../types/carga-oficios.types"
import { CIRCUITO_OPTIONS } from "../types/carga-oficios.types"

const CircuitoSelector: React.FC<CircuitoSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: CircuitoType | null
  ) => {
    // Only allow selection, not deselection
    if (newValue !== null) {
      onChange(newValue)
    }
  }

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: error ? "error.main" : "text.secondary",
        }}
      >
        Circuito <span style={{ color: "#d32f2f" }}>*</span>
      </Typography>

      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="Circuito selector"
        disabled={disabled}
        fullWidth
        sx={{
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid",
            borderColor: error ? "error.main" : "divider",
            "&:not(:first-of-type)": {
              borderLeft: "1px solid",
              borderLeftColor: error ? "error.main" : "divider",
              marginLeft: 0,
            },
            "&:first-of-type": {
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
            },
            "&:last-of-type": {
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
            },
          },
        }}
      >
        {CIRCUITO_OPTIONS.map((option) => (
          <Tooltip
            key={option.key}
            title={option.description}
            placement="top"
            arrow
          >
            <ToggleButton
              value={option.key}
              sx={{
                py: 1.5,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {option.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    opacity: 0.8,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {option.description.split(" ").slice(0, 2).join(" ")}
                </Typography>
              </Box>
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>

      {helperText && (
        <FormHelperText error={error} sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  )
}

export default CircuitoSelector
