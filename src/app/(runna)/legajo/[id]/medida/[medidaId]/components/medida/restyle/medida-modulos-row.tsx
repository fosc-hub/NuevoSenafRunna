"use client"

/**
 * Restyled "Módulos activos" row (Phase 3 of the `medidas_interactivo` redesign).
 *
 * Reproduces the mockup's pill-button bar that toggles inline module panels.
 * Each module wraps an EXISTING feature component (plan de trabajo, historial,
 * informes…) so no functionality is lost — this is chrome, not a reimplementation
 * of the underlying tables.
 *
 * Content is only mounted while its panel is open, so collapsed modules don't
 * fire their data fetches.
 */
import { useState } from "react"
import type React from "react"
import { Box, Paper, Typography, Collapse } from "@mui/material"
import { MEDIDA_COLORS } from "./medida-theme"

export type ModuloVariant = "blue" | "teal" | "pink"

export interface ModuloDef {
  key: string
  label: string
  /** Short glyph rendered before the label (e.g. "▦", "⊘", "≡"). */
  icon?: string
  variant: ModuloVariant
  /** Optional small note pill after the label (e.g. "incluye etapas"). */
  note?: string
  content: React.ReactNode
}

interface MedidaModulosRowProps {
  modules: ModuloDef[]
  /** Keys of modules expanded on first render. */
  defaultOpen?: string[]
}

const VARIANT_STYLES: Record<ModuloVariant, { border: string; bg: string; color: string }> = {
  blue: { border: "#93C5FD", bg: "#EFF6FF", color: "#1E40AF" },
  teal: { border: "#99F6E4", bg: "#F0FDFA", color: "#134E4A" },
  pink: { border: "#F9A8D4", bg: "#FDF2F8", color: "#831843" },
}

export const MedidaModulosRow: React.FC<MedidaModulosRowProps> = ({ modules, defaultOpen = [] }) => {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(defaultOpen))

  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <Paper
      elevation={0}
      sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${MEDIDA_COLORS.border}`, overflow: "hidden" }}
    >
      <Box sx={{ p: "14px 20px" }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: MEDIDA_COLORS.text4,
            textTransform: "uppercase",
            letterSpacing: ".07em",
            mb: "10px",
          }}
        >
          Módulos activos
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {modules.map((m) => {
            const v = VARIANT_STYLES[m.variant]
            const isOpen = openKeys.has(m.key)
            return (
              <Box
                key={m.key}
                role="button"
                tabIndex={0}
                onClick={() => toggle(m.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggle(m.key)
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  p: "8px 14px",
                  borderRadius: "8px",
                  border: `1.5px solid ${v.border}`,
                  bgcolor: v.bg,
                  color: v.color,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  userSelect: "none",
                  transition: "all .15s",
                  ...(isOpen && { outline: `2px solid ${v.color}`, outlineOffset: 1 }),
                }}
              >
                {m.icon && <span style={{ fontSize: 14 }}>{m.icon}</span>}
                {m.label}
                {m.note && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: 9,
                      px: "5px",
                      py: "1px",
                      borderRadius: "4px",
                      bgcolor: "rgba(0,0,0,.07)",
                    }}
                  >
                    {m.note}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>

      {modules.map((m) => {
        const isOpen = openKeys.has(m.key)
        return (
          <Collapse key={m.key} in={isOpen} unmountOnExit>
            <Box sx={{ borderTop: `1px solid ${MEDIDA_COLORS.border}`, p: "16px 20px" }}>
              {isOpen ? m.content : null}
            </Box>
          </Collapse>
        )
      })}
    </Paper>
  )
}
