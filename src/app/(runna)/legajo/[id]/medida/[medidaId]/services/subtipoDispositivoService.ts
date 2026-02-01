// API Service for Subtipo Dispositivo (Técnico Residencial feature)
// Backend API: GET /api/subtipos-dispositivo/

import axiosInstance from '@/app/api/utils/axiosInstance'

export interface TSubtipoDispositivo {
  id: number
  tipo_dispositivo: number
  tipo_dispositivo_nombre: string
  tipo_dispositivo_categoria: string
  nombre: string
  capacidad_maxima: number | null
  descripcion: string | null
  activo: boolean
}

export const subtipoDispositivoService = {
  /**
   * Fetch list of subtipo dispositivo
   * Endpoint: GET /api/subtipos-dispositivo/
   *
   * @param tipoDispositivoId - Optional: Filter by tipo_dispositivo
   * @param categoria - Optional: Filter by categoria (MPE, MPJ, MPI)
   * @returns List of active subtipos
   */
  async list(tipoDispositivoId?: number, categoria?: string): Promise<TSubtipoDispositivo[]> {
    const params: Record<string, any> = {}
    if (tipoDispositivoId) {
      params.tipo_dispositivo = tipoDispositivoId
    }
    if (categoria) {
      params.categoria = categoria
    }
    const response = await axiosInstance.get<TSubtipoDispositivo[]>('/api/subtipos-dispositivo/', { params })
    return response.data
  },

  /**
   * Fetch single subtipo dispositivo by ID
   * Endpoint: GET /api/subtipos-dispositivo/{id}/
   *
   * @param id - Subtipo ID
   * @returns Single subtipo
   */
  async get(id: number): Promise<TSubtipoDispositivo> {
    const response = await axiosInstance.get<TSubtipoDispositivo>(`/api/subtipos-dispositivo/${id}/`)
    return response.data
  }
}
