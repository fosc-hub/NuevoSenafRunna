"use client"

/**
 * Restyled medida summary card (Phase 1 of the `medidas_interactivo` redesign).
 *
 * Reproduces the mockup's per-medida chrome: a navy header with the tipo badge +
 * número + vigencia status, a row of 5 stat cards, and a completion progress bar.
 * Data is bound to the real plan de trabajo activities via `useActividadStats`.
 */
import type React from "react"
import { Box, Paper, Typography, Skeleton } from "@mui/material"
import { MEDIDA_COLORS, TIPO_BADGE, STAT_STYLES, type TipoMedidaKey } from "./medida-theme"
import { useActividadStats, type ActividadStats } from "../../../hooks/useActividadStats"

interface MedidaSummaryCardProps {
  tipo: TipoMedidaKey
  /** Display name for the tipo (falls back to the raw key). */
  tipoDisplay?: string
  numero: string
  estadoVigencia?: string
  estadoVigenciaDisplay?: string
  /** Formatted apertura date (e.g. "10/01/2025"). */
  fechaApertura?: string
  /** Plan de trabajo id used to fetch activities for the stat cards. */
  planTrabajoId?: number | null
  /** Current legajo id (filters activities in a shared medida). */
  legajoId?: number
}

interface StatDef {
  key: keyof typeof STAT_STYLES
  label: string
  count: number
}

const StatCard: React.FC<{ def: StatDef; total: number }> = ({ def, total }) => {
  const s = STAT_STYLES[def.key]
  const pct = total > 0 ? Math.round((def.count / total) * 100) : 0
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 100,
        borderRadius: "8px",
        border: `1px solid ${s.border}`,
        backgroundColor: s.bg,
        p: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: s.text }}>
        {def.count}
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: s.text }}>
        {def.label}
      </Typography>
      <Typography sx={{ fontSize: 10, color: s.pct }}>{pct}% del total</Typography>
    </Box>
  )
}

export const MedidaSummaryCard: React.FC<MedidaSummaryCardProps> = ({
  tipo,
  tipoDisplay,
  numero,
  estadoVigencia,
  estadoVigenciaDisplay,
  fechaApertura,
  planTrabajoId,
  legajoId,
}) => {
  const { stats, isLoading } = useActividadStats(planTrabajoId, legajoId)
  const badge = TIPO_BADGE[tipo] ?? TIPO_BADGE.MPI
  const isActive = estadoVigencia === "VIGENTE"

  const statDefs: StatDef[] = [
    { key: "pendientes", label: "Pendientes", count: stats.pendientes },
    { key: "enProgreso", label: "En Progreso", count: stats.enProgreso },
    { key: "realizadas", label: "Realizadas", count: stats.realizadas },
    { key: "vencidas", label: "Vencidas", count: stats.vencidas },
    { key: "canceladas", label: "Canceladas", count: stats.canceladas },
  ]

  const progress = Math.round(stats.completionRate)
  const estadoLabel = estadoVigenciaDisplay || (isActive ? "Activa" : "Cerrada")

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${MEDIDA_COLORS.border}`,
      }}
    >
      {/* Navy header */}
      <Box
        sx={{
          backgroundColor: MEDIDA_COLORS.navy,
          px: "20px",
          py: "14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".04em",
            px: "10px",
            py: "3px",
            borderRadius: "999px",
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {(tipoDisplay || tipo).toUpperCase()}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{numero}</Typography>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: isActive ? MEDIDA_COLORS.statusActive : MEDIDA_COLORS.statusClosed,
            }}
          />
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,.8)" }}>
            {estadoLabel}
            {fechaApertura ? ` desde ${fechaApertura}` : ""}
          </Typography>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          p: "16px 20px",
          borderBottom: `1px solid ${MEDIDA_COLORS.border}`,
          flexWrap: "wrap",
        }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{ flex: 1, minWidth: 100, height: 78, borderRadius: "8px" }}
              />
            ))
          : statDefs.map((def) => <StatCard key={def.key} def={def} total={stats.total} />)}
      </Box>

      {/* Progress bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", p: "12px 20px" }}>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: MEDIDA_COLORS.text2, whiteSpace: "nowrap" }}
        >
          Progreso del plan
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: 8,
            backgroundColor: MEDIDA_COLORS.border,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: "4px",
              backgroundColor: MEDIDA_COLORS.accent,
              transition: "width .5s ease",
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: MEDIDA_COLORS.accent,
            minWidth: 36,
            textAlign: "right",
          }}
        >
          {progress}%
        </Typography>
        <Typography sx={{ fontSize: 11, color: MEDIDA_COLORS.text3, whiteSpace: "nowrap" }}>
          {stats.realizadas} de {stats.total} actividades completadas
        </Typography>
      </Box>
    </Paper>
  )
}
