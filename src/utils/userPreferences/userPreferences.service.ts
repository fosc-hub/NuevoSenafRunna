/**
 * GAP-09: Preferencias UI del usuario en DB.
 *
 * Endpoints:
 * - GET   /api/user/preferences/   → retorna { configuracion, fecha_modificacion }
 * - PATCH /api/user/preferences/   → deep-merge con la configuración existente
 *
 * Las preferencias son un objeto libre (JSON) cuyo schema es decidido por el
 * frontend. Convenciones recomendadas:
 *   {
 *     bandeja_legajos: { columnas_visibles: string[], orden: string },
 *     bandeja_demandas: { filtros_default: object },
 *     ...
 *   }
 */

import axiosInstance from "@/app/api/utils/axiosInstance"

export interface UserPreferencesPayload {
  configuracion: Record<string, unknown>
  fecha_modificacion: string
}

/**
 * Obtener la configuración actual del usuario.
 */
export const getUserPreferences = async (): Promise<UserPreferencesPayload> => {
  const response = await axiosInstance.get<UserPreferencesPayload>(
    "user/preferences/"
  )
  return response.data
}

/**
 * Actualizar configuración con deep-merge.
 * Sólo las claves enviadas se sobrescriben; el resto permanece intacto.
 *
 * Ejemplo:
 *   await patchUserPreferences({ bandeja_legajos: { orden: "-fecha" } })
 *   // sólo actualiza bandeja_legajos.orden, sin tocar otras claves.
 */
export const patchUserPreferences = async (
  partial: Record<string, unknown>
): Promise<UserPreferencesPayload> => {
  const response = await axiosInstance.patch<UserPreferencesPayload>(
    "user/preferences/",
    partial
  )
  return response.data
}
