"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Stack,
} from "@mui/material"
import WorkIcon from "@mui/icons-material/Work"
import PersonIcon from "@mui/icons-material/Person"
import { useQuery } from "@tanstack/react-query"
import type { LegajoDetailResponse, MedidaInfo } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { globalActividadService } from "@/app/(runna)/legajo/actividades/services/globalActividadService"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"
import { extractArray } from "@/hooks/useApiQuery"
import type { TActividadPlanTrabajo } from "../../types/actividades"
import { useUser } from "@/utils/auth/userZustand"

// ============================================================================
// Filtros de actor disponibles
// ============================================================================
type ActorFilter = "" | "EQUIPO_TECNICO" | "EQUIPOS_RESIDENCIALES" | "EQUIPO_LEGAL"

const ACTOR_CHIP_OPTIONS: { value: ActorFilter; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "EQUIPO_TECNICO", label: "Equipo Técnico" },
  { value: "EQUIPOS_RESIDENCIALES", label: "Equipo Residencial" },
  { value: "EQUIPO_LEGAL", label: "Equipo Legal" },
]

// ============================================================================
// Props
// ============================================================================
interface PlanTrabajoSectionProps {
  legajoData: LegajoDetailResponse
  onRefresh?: () => void
}

// ============================================================================
// Helpers
// ============================================================================

function esVigente(estado: string): boolean {
  const e = (estado || "").toUpperCase()
  return e.includes("VIGENTE") || (e !== "CESADA" && e !== "ARCHIVADA" && e !== "INACTIVA")
}

function formatMedidaLabel(m: MedidaInfo): string {
  const tipo = m.tipo_medida || ""
  const numero = m.numero || `#${m.id}`
  const estado = esVigente(m.estado) ? "✓ Vigente" : m.estado
  const fecha = m.fecha_apertura ? new Date(m.fecha_apertura).toLocaleDateString("es-AR") : ""
  return `${tipo} ${numero} — ${estado}${fecha ? ` (${fecha})` : ""}`
}

// ============================================================================
// Component
// ============================================================================

export const PlanTrabajoSection: React.FC<PlanTrabajoSectionProps> = ({
  legajoData,
  onRefresh,
}) => {
  const { user } = useUser()
  const [actorFilter, setActorFilter] = useState<ActorFilter>("")
  const [filterByMe, setFilterByMe] = useState<boolean>(false)

  // ─── Construir lista completa de medidas (activas + históricas, deduplicadas) ──
  const todasLasMedidas = useMemo<MedidaInfo[]>(() => {
    const activas = legajoData.medidas_activas || []
    const historicas = legajoData.historial_medidas || []

    // Deduplicar por ID
    const seen = new Set<number>()
    const all: MedidaInfo[] = []
    for (const m of [...activas, ...historicas]) {
      if (!seen.has(m.id)) {
        seen.add(m.id)
        all.push(m)
      }
    }

    // Ordenar: vigentes primero, luego por fecha desc
    return all.sort((a, b) => {
      const aVigente = esVigente(a.estado) ? 1 : 0
      const bVigente = esVigente(b.estado) ? 1 : 0
      if (bVigente !== aVigente) return bVigente - aVigente
      return new Date(b.fecha_apertura || 0).getTime() - new Date(a.fecha_apertura || 0).getTime()
    })
  }, [legajoData.medidas_activas, legajoData.historial_medidas])

  // ─── Selección de medida: default = primer vigente (o primera disponible) ──
  const defaultMedidaId = useMemo(() => {
    const vigente = todasLasMedidas.find((m) => esVigente(m.estado))
    return vigente?.id ?? todasLasMedidas[0]?.id ?? null
  }, [todasLasMedidas])

  const [selectedMedidaId, setSelectedMedidaId] = useState<number | null>(null)

  // Medida efectiva: usa el estado local si fue seleccionada, sino el default
  const medidaId = selectedMedidaId ?? defaultMedidaId
  const medidaSeleccionada = todasLasMedidas.find((m) => m.id === medidaId) ?? null

  const legajoId = legajoData.legajo?.id

  // ─── Fetch actividades desde la API ─────────────────────────────────────
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["plan-trabajo-legajo", legajoId, medidaId, actorFilter, filterByMe, user?.id],
    queryFn: () =>
      globalActividadService.list({
        legajo: legajoId!,
        ...(medidaId ? { medida: medidaId } : {}),
        ...(actorFilter ? { actor: actorFilter } : {}),
        ...(filterByMe && user?.id ? { responsable: user.id } : {}),
        ordering: "-fecha_planificacion,-fecha_creacion",
        page_size: 200,
      }),
    enabled: !!legajoId,
    staleTime: 2 * 60 * 1000,
  })

  const actividades: TActividadPlanTrabajo[] = useMemo(() => {
    if (!data) return []
    return extractArray<TActividadPlanTrabajo>(data as any)
  }, [data])

  // ─── Render ──────────────────────────────────────────────────────────────
  if (!legajoId) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />

      {/* Header con título, selector de medida y chips de actor */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        {/* Izquierda: título + badge de estado medida */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <WorkIcon fontSize="small" color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Plan de Trabajo
          </Typography>
          {medidaSeleccionada && (
            <Chip
              label={esVigente(medidaSeleccionada.estado) ? "Vigente" : medidaSeleccionada.estado}
              size="small"
              color={esVigente(medidaSeleccionada.estado) ? "success" : "default"}
              variant="filled"
            />
          )}
          {isLoading ? (
            <CircularProgress size={16} />
          ) : (
            <Chip
              label={`${actividades.length} actividad${actividades.length !== 1 ? "es" : ""}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Centro-Derecha: selector de medida + filtros actor */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
          {/* Selector de medida */}
          {todasLasMedidas.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="medida-select-label">Medida</InputLabel>
              <Select
                labelId="medida-select-label"
                label="Medida"
                value={medidaId ?? ""}
                onChange={(e: SelectChangeEvent<number | "">) => {
                  const val = e.target.value
                  setSelectedMedidaId(val === "" ? null : Number(val))
                }}
              >
                {todasLasMedidas.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={m.tipo_medida || "—"}
                        size="small"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                        color={esVigente(m.estado) ? "primary" : "default"}
                        variant={esVigente(m.estado) ? "filled" : "outlined"}
                      />
                      <Typography variant="body2">
                        {m.numero || `#${m.id}`}
                        {esVigente(m.estado) && (
                          <Typography component="span" variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                            ✓ vigente
                          </Typography>
                        )}
                      </Typography>
                      {m.fecha_apertura && (
                        <Typography variant="caption" color="text.secondary">
                          ({new Date(m.fecha_apertura).toLocaleDateString("es-AR")})
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Chips de filtro por equipo/actor */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
            {ACTOR_CHIP_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                size="small"
                clickable
                variant={actorFilter === opt.value ? "filled" : "outlined"}
                color={actorFilter === opt.value ? "primary" : "default"}
                onClick={() => setActorFilter(opt.value)}
              />
            ))}
          </Box>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar el plan de trabajo. Por favor, intente nuevamente.
        </Alert>
      )}

      {todasLasMedidas.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Este legajo no tiene medidas registradas.
        </Alert>
      )}

      <UnifiedActividadesTable
        variant="legajo"
        actividades={actividades}
        onRefresh={() => {
          refetch()
          onRefresh?.()
        }}
        showWrapper={false}
      />
    </Box>
  )
}
