"use client"

/**
 * View-mode toggle for the medida detail: switches between the new restyled
 * dashboard ("Vista nueva") and the classic header + tabs layout
 * ("Vista clásica"). Defaults to the new view and persists the choice in
 * localStorage so it sticks across navigations.
 */
import { useCallback, useEffect, useState } from "react"
import type React from "react"
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import ViewListIcon from "@mui/icons-material/ViewList"

export type MedidaViewMode = "nuevo" | "clasico"

const STORAGE_KEY = "medida-view-mode"

/** Reads/persists the medida view-mode preference (default "nuevo"). */
export function useMedidaViewMode(): [MedidaViewMode, (mode: MedidaViewMode) => void] {
  const [mode, setMode] = useState<MedidaViewMode>("nuevo")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "nuevo" || stored === "clasico") setMode(stored)
    } catch {
      // localStorage unavailable (SSR / privacy mode) → keep default
    }
  }, [])

  const update = useCallback((next: MedidaViewMode) => {
    setMode(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore persistence failures
    }
  }, [])

  return [mode, update]
}

interface MedidaViewToggleProps {
  mode: MedidaViewMode
  onChange: (mode: MedidaViewMode) => void
}

export const MedidaViewToggle: React.FC<MedidaViewToggleProps> = ({ mode, onChange }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        size="small"
        onChange={(_, next: MedidaViewMode | null) => {
          if (next) onChange(next)
        }}
        sx={{
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 1.5,
            gap: 0.75,
          },
        }}
      >
        <ToggleButton value="nuevo">
          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
          Vista nueva
        </ToggleButton>
        <Tooltip title="Acciones de flujo de trabajo (apertura, prórroga, cese)">
          <ToggleButton value="clasico">
            <ViewListIcon sx={{ fontSize: 16 }} />
            Vista clásica
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  )
}
