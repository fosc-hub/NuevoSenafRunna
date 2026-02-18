"use client"

/**
 * PlaceholderField - Disabled field with "Próximamente" tooltip
 *
 * Used for fields that are not yet supported by the backend.
 * Shows a disabled input with a tooltip explaining the feature is coming soon.
 */

import type React from "react"
import {
  TextField,
  Tooltip,
  InputAdornment,
  Box,
  Typography,
  Chip,
  alpha,
} from "@mui/material"
import { Schedule as ScheduleIcon } from "@mui/icons-material"
import type { PlaceholderFieldProps } from "../types/carga-oficios.types"

const PlaceholderField: React.FC<PlaceholderFieldProps> = ({
  label,
  tooltip = "Esta funcionalidad estará disponible próximamente",
  fullWidth = true,
  size = "medium",
}) => {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Próximamente
            </Typography>
          </Box>
          <Typography variant="caption">{tooltip}</Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <TextField
        label={label}
        placeholder="Próximamente..."
        fullWidth={fullWidth}
        size={size}
        disabled
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Chip
                label="Próximamente"
                size="small"
                icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                sx={{
                  height: 24,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                  color: "info.main",
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
                  "& .MuiChip-icon": {
                    color: "info.main",
                  },
                }}
              />
            </InputAdornment>
          ),
          sx: {
            bgcolor: (theme) => alpha(theme.palette.action.disabledBackground, 0.5),
            "& .MuiInputBase-input": {
              cursor: "not-allowed",
            },
          },
        }}
        InputLabelProps={{
          sx: {
            color: "text.secondary",
          },
        }}
      />
    </Tooltip>
  )
}

/**
 * PlaceholderAutocomplete - Disabled autocomplete with "Próximamente" indicator
 *
 * Similar to PlaceholderField but styled as an Autocomplete/Select component.
 */
export const PlaceholderAutocomplete: React.FC<PlaceholderFieldProps> = ({
  label,
  tooltip = "Esta funcionalidad estará disponible próximamente",
  fullWidth = true,
  size = "medium",
}) => {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Próximamente
            </Typography>
          </Box>
          <Typography variant="caption">{tooltip}</Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <TextField
        label={label}
        placeholder="Seleccionar..."
        fullWidth={fullWidth}
        size={size}
        disabled
        select
        SelectProps={{
          native: true,
          IconComponent: () => (
            <Box
              sx={{
                mr: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Chip
                label="Próximamente"
                size="small"
                icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                  color: "info.main",
                  "& .MuiChip-icon": {
                    color: "info.main",
                    fontSize: 12,
                  },
                }}
              />
            </Box>
          ),
        }}
        InputProps={{
          sx: {
            bgcolor: (theme) => alpha(theme.palette.action.disabledBackground, 0.5),
            "& .MuiInputBase-input": {
              cursor: "not-allowed",
            },
          },
        }}
        InputLabelProps={{
          sx: {
            color: "text.secondary",
          },
        }}
      >
        <option value="">Próximamente...</option>
      </TextField>
    </Tooltip>
  )
}

/**
 * PlaceholderMultiSelect - Disabled multi-select with "Próximamente" indicator
 *
 * For fields like "Delitos" that would be a multi-select chip input.
 */
export const PlaceholderMultiSelect: React.FC<PlaceholderFieldProps> = ({
  label,
  tooltip = "Esta funcionalidad estará disponible próximamente",
  fullWidth = true,
}) => {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Próximamente
            </Typography>
          </Box>
          <Typography variant="caption">{tooltip}</Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <Box
        sx={{
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.action.disabled, 0.5),
          borderRadius: 1,
          p: 1.5,
          minHeight: 56,
          bgcolor: (theme) => alpha(theme.palette.action.disabledBackground, 0.5),
          cursor: "not-allowed",
          display: "flex",
          flexDirection: "column",
          width: fullWidth ? "100%" : "auto",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="Próximamente"
            size="small"
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            sx={{
              height: 24,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
              color: "info.main",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
              "& .MuiChip-icon": {
                color: "info.main",
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>
            Buscar y seleccionar...
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

export default PlaceholderField
