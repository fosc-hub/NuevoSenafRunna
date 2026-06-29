/**
 * Fetches a plan de trabajo's activities and derives the summary counts used by
 * the restyled medida summary card (Pendientes / En Progreso / Realizadas /
 * Vencidas / Canceladas + completion rate).
 *
 * Mirrors the query key + filters used by `UnifiedActividadesTable` (medida
 * variant) so the cache is shared and no duplicate request is issued when the
 * plan table is also mounted.
 */
import { useMemo } from "react"
import { useApiQuery, extractArray } from "@/hooks/useApiQuery"
import { actividadService } from "../services/actividadService"
import type { TActividadPlanTrabajo } from "../types/actividades"

export interface ActividadStats {
  total: number
  pendientes: number
  enProgreso: number
  realizadas: number
  vencidas: number
  canceladas: number
  completionRate: number
}

const EMPTY_STATS: ActividadStats = {
  total: 0,
  pendientes: 0,
  enProgreso: 0,
  realizadas: 0,
  vencidas: 0,
  canceladas: 0,
  completionRate: 0,
}

/**
 * Pure computation of the stat buckets from a list of activities.
 *
 * Note: the current API `estado` enum emits `COMPLETADA` for finished
 * activities; we also accept the legacy `REALIZADA` value (and `VISADO_APROBADO`,
 * which is terminal-approved) so the count is correct regardless of backend version.
 */
export function computeActividadStats(actividades: TActividadPlanTrabajo[]): ActividadStats {
  const total = actividades.length
  if (total === 0) return EMPTY_STATS

  const isRealizada = (e: string) =>
    e === "COMPLETADA" || e === "REALIZADA" || e === "VISADO_APROBADO"

  const pendientes = actividades.filter((a) => a.estado === "PENDIENTE").length
  const enProgreso = actividades.filter((a) => a.estado === "EN_PROGRESO").length
  const realizadas = actividades.filter((a) => isRealizada(a.estado)).length
  const canceladas = actividades.filter((a) => a.estado === "CANCELADA").length
  const vencidas = actividades.filter(
    (a) => a.estado === "VENCIDA" || (a.esta_vencida && a.estado === "PENDIENTE")
  ).length
  const completionRate = (realizadas / total) * 100

  return { total, pendientes, enProgreso, realizadas, vencidas, canceladas, completionRate }
}

export function useActividadStats(
  planTrabajoId?: number | null,
  legajoId?: number
): { stats: ActividadStats; actividades: TActividadPlanTrabajo[]; isLoading: boolean } {
  const filters = {
    ordering: "-fecha_creacion",
    ...(legajoId != null && { legajo_id: legajoId }),
  }

  const { data, isLoading } = useApiQuery<any>(
    `actividades-plan/${planTrabajoId}`,
    filters,
    {
      queryFn: () => actividadService.list(planTrabajoId!, filters),
      enabled: !!planTrabajoId,
    } as any
  )

  const actividades = useMemo(
    () => extractArray<TActividadPlanTrabajo>(data),
    [data]
  )
  const stats = useMemo(() => computeActividadStats(actividades), [actividades])

  return { stats, actividades, isLoading: !!planTrabajoId && isLoading }
}
