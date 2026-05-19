/**
 * GAP-11 Fase 1: Vinculación de legajos adicionales a una medida (junction TMedidaLegajo).
 *
 * Cuando un oficio MPJ involucra a varios hermanos, una sola medida MPJ vincula
 * a todos los NNyAs como participantes (1 informe jurídico, 1 ratificación,
 * 1 plan de trabajo).
 *
 * Endpoints:
 * - POST   /api/medidas/{medida_id}/legajos/                  → vincular legajo adicional
 * - DELETE /api/medidas/{medida_id}/legajos/{legajo_id}/      → desvincular (no aplica al primario)
 */

import { toast } from "react-toastify"
import { create, remove } from "@/app/api/apiService"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

export interface VincularLegajoAdicionalRequest {
  legajo_id: number
  motivo?: string
}

/**
 * Vincular un legajo adicional a una medida existente.
 */
export const vincularLegajoAdicional = async (
  medidaId: number,
  data: VincularLegajoAdicionalRequest
): Promise<LegajoAdicionalMedida> => {
  return create<LegajoAdicionalMedida>(
    `medidas/${medidaId}/legajos/`,
    data,
    true,
    "Legajo vinculado a la medida"
  )
}

/**
 * Desvincular un legajo adicional. No se puede eliminar el legajo primario.
 */
export const desvincularLegajoAdicional = async (
  medidaId: number,
  legajoId: number
): Promise<void> => {
  await remove(`medidas/${medidaId}/legajos`, legajoId)
  toast.success("Legajo desvinculado de la medida")
}
