/**
 * API Service for SEGUIMIENTO EN DISPOSITIVO module
 * Handles both MPE and MPJ seguimiento data
 */

import type {
  SeguimientoDispositivoMPE,
  SeguimientoDispositivoMPJ,
  SituacionResidenciaMPE,
  SituacionInstitutoMPJ,
  InformacionEducativa,
  InformacionSalud,
  TallerRecreativo,
  CambioLugarResguardo,
  NotaSeguimiento,
  SituacionCritica,
  CreateSeguimientoRequest,
  UpdateSeguimientoRequest,
  SeguimientoResponse
} from '../types/seguimiento-dispositivo'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

class SeguimientoDispositivoApiService {

  /**
   * Get seguimiento data for a specific medida
   */
  async getSeguimiento(medidaId: number, tipoMedida: 'MPE' | 'MPJ'): Promise<SeguimientoResponse> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch seguimiento data: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create seguimiento data for a medida
   */
  async createSeguimiento(data: CreateSeguimientoRequest): Promise<SeguimientoResponse> {
    const response = await fetch(`${API_BASE_URL}/medidas/${data.medida_id}/seguimiento/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create seguimiento: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update seguimiento data
   */
  async updateSeguimiento(medidaId: number, data: UpdateSeguimientoRequest): Promise<SeguimientoResponse> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/${data.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data.data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update seguimiento: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * MPE - Add situación en residencia
   */
  async addSituacionResidencia(medidaId: number, data: SituacionResidenciaMPE): Promise<SituacionResidenciaMPE> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/situaciones-residencia/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add situación residencia: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * MPJ - Add situación en instituto
   */
  async addSituacionInstituto(medidaId: number, data: SituacionInstitutoMPJ): Promise<SituacionInstitutoMPJ> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/situaciones-instituto/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add situación instituto: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update información educativa
   */
  async updateInformacionEducativa(medidaId: number, data: InformacionEducativa): Promise<InformacionEducativa> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/informacion-educativa/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update información educativa: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update información de salud
   */
  async updateInformacionSalud(medidaId: number, data: InformacionSalud): Promise<InformacionSalud> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/informacion-salud/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update información salud: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Add taller recreativo
   */
  async addTaller(medidaId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/talleres/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add taller: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update taller recreativo
   */
  async updateTaller(medidaId: number, tallerId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/talleres/${tallerId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update taller: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Delete taller recreativo
   */
  async deleteTaller(medidaId: number, tallerId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/talleres/${tallerId}/`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete taller: ${response.statusText}`)
    }
  }

  /**
   * Add cambio de lugar de resguardo
   */
  async addCambioResguardo(medidaId: number, data: Omit<CambioLugarResguardo, 'id'>): Promise<CambioLugarResguardo> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/cambios-resguardo/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add cambio resguardo: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Add nota de seguimiento
   */
  async addNotaSeguimiento(medidaId: number, data: Omit<NotaSeguimiento, 'id'>): Promise<NotaSeguimiento> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/notas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add nota seguimiento: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * MPE - Add situación crítica
   */
  async addSituacionCritica(medidaId: number, data: Omit<SituacionCritica, 'id'>): Promise<SituacionCritica> {
    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/situaciones-criticas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to add situación crítica: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Upload adjunto for cambio resguardo
   */
  async uploadAdjuntoCambioResguardo(medidaId: number, cambioId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/cambios-resguardo/${cambioId}/adjunto/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload adjunto: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Upload adjunto for nota seguimiento
   */
  async uploadAdjuntoNota(medidaId: number, notaId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/medidas/${medidaId}/seguimiento/notas/${notaId}/adjunto/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload adjunto: ${response.statusText}`)
    }

    return response.json()
  }
}

export const seguimientoDispositivoService = new SeguimientoDispositivoApiService()
