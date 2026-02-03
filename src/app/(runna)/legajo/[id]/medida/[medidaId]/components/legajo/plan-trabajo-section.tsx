"use client"

import type React from "react"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"

interface PlanTrabajoSectionProps {
  legajoData: LegajoDetailResponse
  onRefresh?: () => void
}

export const PlanTrabajoSection: React.FC<PlanTrabajoSectionProps> = ({ legajoData, onRefresh }) => {
  const planTrabajo = legajoData.plan_trabajo

  return (
    <UnifiedActividadesTable
      variant="legajo"
      actividades={planTrabajo?.actividades || []}
      onRefresh={onRefresh}
    />
  )
}
