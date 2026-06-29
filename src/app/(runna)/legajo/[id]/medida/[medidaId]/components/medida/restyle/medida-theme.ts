/**
 * Design tokens ported from the `medidas_interactivo` mockup.
 *
 * Centralizes the visual language (navy headers, stat-card palette, per-tipo
 * badges) so the restyled medida components stay consistent. Kept as plain
 * constants instead of MUI theme overrides to avoid touching the global theme.
 */

export const MEDIDA_COLORS = {
  navy: "#1B2A4A",
  navy2: "#243352",
  surface: "#FFFFFF",
  surface2: "#F8F9FB",
  border: "#E4E7EC",
  border2: "#D0D5DD",
  text: "#101828",
  text2: "#344054",
  text3: "#667085",
  text4: "#98A2B3",
  accent: "#2563EB",
  statusActive: "#12B76A",
  statusClosed: "#98A2B3",
} as const

export type TipoMedidaKey = "MPI" | "MPE" | "MPJ"

/** Per-tipo badge colors used in the navy card header. */
export const TIPO_BADGE: Record<TipoMedidaKey, { bg: string; color: string }> = {
  MPE: { bg: "#1D9E75", color: "#FFFFFF" },
  MPI: { bg: "#D4960F", color: "#FFFFFF" },
  MPJ: { bg: "#7C3AED", color: "#FFFFFF" },
}

/** Visual style for each stat-card category (matches mockup `.stat-*`). */
export interface StatStyle {
  bg: string
  border: string
  text: string
  pct: string
}

export const STAT_STYLES: Record<
  "pendientes" | "enProgreso" | "realizadas" | "vencidas" | "canceladas",
  StatStyle
> = {
  pendientes: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", pct: "#B45309" },
  enProgreso: { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF", pct: "#3B82F6" },
  realizadas: { bg: "#ECFDF3", border: "#A9EFC5", text: "#027A48", pct: "#059669" },
  vencidas: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", pct: "#DC2626" },
  canceladas: { bg: "#F9FAFB", border: "#E5E7EB", text: "#374151", pct: "#6B7280" },
}
