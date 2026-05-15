/**
 * API service for persona vulnerability CRUD operations.
 *
 * Backed by:
 *   - /api/persona-condiciones-vulnerabilidad/  (conditions tied to a persona)
 *   - /api/vulneracion/                         (rights-violation events tied to an nnya)
 */

import axiosInstance from "@/app/api/utils/axiosInstance"

export interface PersonaCondicionVulnerabilidadPayload {
  persona: number
  condicion_vulnerabilidad: number
  si_no: boolean
  demanda?: number | null
}

export interface VulneracionPayload {
  nnya: number
  categoria_motivo: number
  categoria_submotivo: number
  gravedad_vulneracion: number
  urgencia_vulneracion: number
  autor_dv?: number | null
  demanda?: number | null
  principal_demanda?: boolean
  transcurre_actualidad?: boolean
}

const CONDICION_ENDPOINT = "persona-condiciones-vulnerabilidad/"
const VULNERACION_ENDPOINT = "vulneracion/"

export const createPersonaCondicion = async (data: PersonaCondicionVulnerabilidadPayload) => {
  const response = await axiosInstance.post(CONDICION_ENDPOINT, data)
  return response.data
}

export const patchPersonaCondicion = async (
  id: number,
  data: Partial<PersonaCondicionVulnerabilidadPayload>,
) => {
  const response = await axiosInstance.patch(`${CONDICION_ENDPOINT}${id}/`, data)
  return response.data
}

export const deletePersonaCondicion = async (id: number) => {
  await axiosInstance.delete(`${CONDICION_ENDPOINT}${id}/`)
}

export const createVulneracion = async (data: VulneracionPayload) => {
  const response = await axiosInstance.post(VULNERACION_ENDPOINT, data)
  return response.data
}

export const patchVulneracion = async (id: number, data: Partial<VulneracionPayload>) => {
  const response = await axiosInstance.patch(`${VULNERACION_ENDPOINT}${id}/`, data)
  return response.data
}

export const deleteVulneracion = async (id: number) => {
  await axiosInstance.delete(`${VULNERACION_ENDPOINT}${id}/`)
}
