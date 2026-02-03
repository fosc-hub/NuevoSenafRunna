"use client"

import type React from "react"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"

interface PlanTrabajoTabProps {
  medidaData: any
  planTrabajoId: number
  filterEtapa?: "APERTURA" | "PROCESO" | "CESE"
}

export const PlanTrabajoTab: React.FC<PlanTrabajoTabProps> = ({ medidaData, planTrabajoId, filterEtapa }) => {
  return (
    <UnifiedActividadesTable
      variant="medida"
      planTrabajoId={planTrabajoId}
      medidaData={medidaData}
      filterEtapa={filterEtapa}
      showWrapper={false}
    />
  )
}
