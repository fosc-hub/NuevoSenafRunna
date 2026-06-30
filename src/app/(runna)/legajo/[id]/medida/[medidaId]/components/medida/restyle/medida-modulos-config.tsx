"use client"

/**
 * Shared builder for the "Módulos activos" pill row used by the restyled medida
 * views. Centralizes the per-tipo module set (plan de trabajo / historial /
 * control de legalidad / informes) so the new dashboard (medida-detail) and the
 * classic tab views (mpe-tabs, mpj-tabs) stay in sync instead of each
 * hard-coding the same list.
 *
 * Every module wraps an EXISTING feature component with the exact props it was
 * already receiving — this is composition, not a reimplementation.
 */
import type React from "react"
import { Paper, Typography } from "@mui/material"
import { PlanTrabajoTab } from "../mpe-tabs/plan-trabajo-tab"
import { HistorialTab } from "../historial/historial-tab"
import { InformesMensualesTable } from "../informes-mensuales-table"
import { InformesControlLegalidadKanban } from "../../legal-control"
import type { ModuloDef } from "./medida-modulos-row"
import type { TipoMedidaKey } from "./medida-theme"
import type { MedidaDetailResponse } from "../../../types/medida-api"

interface BuildMedidaModulosArgs {
  tipo: TipoMedidaKey
  medidaApiData?: MedidaDetailResponse
  planTrabajoId?: number | null
}

/** Normalizes the numero_medida field (string | { display } | undefined). */
function resolveNumeroMedida(medidaApiData?: MedidaDetailResponse): string {
  const numero = medidaApiData?.numero_medida as unknown
  if (typeof numero === "string") return numero
  if (numero && typeof numero === "object" && "display" in numero) {
    return String((numero as { display: unknown }).display)
  }
  return `M-${medidaApiData?.id ?? ""}`
}

/** Builds the medidaData shape expected by PlanTrabajoTab from the API payload. */
function buildPlanMedidaData(tipo: TipoMedidaKey, medidaApiData: MedidaDetailResponse) {
  return {
    id: medidaApiData.id,
    tipo_medida: tipo,
    numero_medida: resolveNumeroMedida(medidaApiData),
    estado:
      typeof medidaApiData.etapa_actual?.estado === "string"
        ? medidaApiData.etapa_actual.estado
        : medidaApiData.etapa_actual?.estado_display || "",
    fecha_apertura: medidaApiData.fecha_apertura,
    // Granularidad: scope selectors need legajo + adicionales
    legajo: (medidaApiData as any).legajo,
    legajos_adicionales: (medidaApiData as any).legajos_adicionales,
  }
}

function buildPlanModule(
  tipo: TipoMedidaKey,
  medidaApiData?: MedidaDetailResponse,
  planTrabajoId?: number | null
): ModuloDef {
  return {
    key: "plan",
    label: "Plan de trabajo",
    icon: "▦",
    variant: "blue",
    content:
      planTrabajoId && medidaApiData ? (
        <PlanTrabajoTab medidaData={buildPlanMedidaData(tipo, medidaApiData)} planTrabajoId={planTrabajoId} />
      ) : (
        <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }} elevation={0}>
          No hay Plan de Trabajo asociado a esta medida.
        </Paper>
      ),
  }
}

function buildHistorialModule(medidaApiData?: MedidaDetailResponse): ModuloDef {
  return {
    key: "historial",
    label: "Historial de seguimiento",
    icon: "⊘",
    variant: "teal",
    content: (
      <HistorialTab
        medidaId={medidaApiData?.id}
        numeroMedida={
          typeof medidaApiData?.numero_medida === "string"
            ? medidaApiData.numero_medida
            : `MED-${medidaApiData?.id}`
        }
      />
    ),
  }
}

function buildLegalidadModule(
  medidaApiData?: MedidaDetailResponse,
  planTrabajoId?: number | null,
  includeEtapasNote = false
): ModuloDef | null {
  if (!planTrabajoId) return null
  return {
    key: "legalidad",
    label: "Control de legalidad",
    icon: "⊘",
    variant: "teal",
    ...(includeEtapasNote ? { note: "incluye etapas" } : {}),
    content: (
      <InformesControlLegalidadKanban
        planTrabajoId={planTrabajoId}
        legajoId={(medidaApiData as any)?.legajo}
        medidaId={medidaApiData?.id}
      />
    ),
  }
}

function buildInformesModule(medidaApiData?: MedidaDetailResponse): ModuloDef | null {
  if (!medidaApiData?.id) return null
  const legajo = (medidaApiData as any)?.legajo
  return {
    key: "informes",
    label: "Informes mensuales",
    icon: "≡",
    variant: "pink",
    content: (
      <InformesMensualesTable
        medidaId={medidaApiData.id}
        legajoPrimario={
          legajo
            ? {
                id: legajo.id,
                numero: legajo.numero,
                nnya: {
                  nombre: legajo.nnya?.nombre ?? "",
                  apellido: legajo.nnya?.apellido ?? "",
                },
              }
            : undefined
        }
        legajosAdicionales={(medidaApiData as any)?.legajos_adicionales ?? []}
      />
    ),
  }
}

/**
 * Returns the always-on module set for a medida, by tipo:
 *   - MPI: plan · control de legalidad · historial · informes
 *   - MPE: plan · control de legalidad · informes
 *   - MPJ: control de legalidad (incluye etapas) · informes
 */
export function buildMedidaModulos({
  tipo,
  medidaApiData,
  planTrabajoId,
}: BuildMedidaModulosArgs): ModuloDef[] {
  const modules: (ModuloDef | null)[] = []

  if (tipo === "MPI") {
    modules.push(buildPlanModule(tipo, medidaApiData, planTrabajoId))
    modules.push(buildLegalidadModule(medidaApiData, planTrabajoId))
    modules.push(buildHistorialModule(medidaApiData))
    modules.push(buildInformesModule(medidaApiData))
  } else if (tipo === "MPE") {
    modules.push(buildPlanModule(tipo, medidaApiData, planTrabajoId))
    modules.push(buildLegalidadModule(medidaApiData, planTrabajoId))
    modules.push(buildInformesModule(medidaApiData))
  } else {
    // MPJ
    modules.push(buildLegalidadModule(medidaApiData, planTrabajoId, true))
    modules.push(buildInformesModule(medidaApiData))
  }

  return modules.filter((m): m is ModuloDef => m !== null)
}

/** Sensible default-open keys per tipo for the new dashboard view. */
export function defaultModulosOpen(tipo: TipoMedidaKey): string[] {
  if (tipo === "MPJ") return ["legalidad"]
  return ["plan"]
}
