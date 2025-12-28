/**
 * API Service for SEGUIMIENTO EN DISPOSITIVO module
 * Handles both MPE and MPJ seguimiento data
 *
 * REFACTORED: Now uses centralized apiService for security and consistency
 */

import { get, create, put, remove } from '@/app/api/apiService'
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

class SeguimientoDispositivoApiService {

  /**
   * Get seguimiento data for a specific medida
   */
  async getSeguimiento(medidaId: number, tipoMedida: 'MPE' | 'MPJ'): Promise<SeguimientoResponse> {
    return get<SeguimientoResponse>(`medidas/${medidaId}/seguimiento/`)
  }

  /**
   * Create seguimiento data for a medida
   */
  async createSeguimiento(data: CreateSeguimientoRequest): Promise<SeguimientoResponse> {
    return create<SeguimientoResponse>(
      `medidas/${data.medida_id}/seguimiento/`,
      data,
      true,
      'Seguimiento creado exitosamente'
    )
  }

  /**
   * Update seguimiento data
   */
  async updateSeguimiento(medidaId: number, data: UpdateSeguimientoRequest): Promise<SeguimientoResponse> {
    return put<SeguimientoResponse>(
      `medidas/${medidaId}/seguimiento`,
      data.id,
      data.data,
      true,
      'Seguimiento actualizado exitosamente'
    )
  }

  /**
   * MPE - Add situación en residencia
   */
  async addSituacionResidencia(medidaId: number, data: SituacionResidenciaMPE): Promise<SituacionResidenciaMPE> {
    return create<SituacionResidenciaMPE>(
      `medidas/${medidaId}/seguimiento/situaciones-residencia/`,
      data,
      true,
      'Situación de residencia agregada'
    )
  }

  /**
   * MPJ - Add situación en instituto
   */
  async addSituacionInstituto(medidaId: number, data: SituacionInstitutoMPJ): Promise<SituacionInstitutoMPJ> {
    return create<SituacionInstitutoMPJ>(
      `medidas/${medidaId}/seguimiento/situaciones-instituto/`,
      data,
      true,
      'Situación de instituto agregada'
    )
  }

  /**
   * Update información educativa
   */
  async updateInformacionEducativa(medidaId: number, data: InformacionEducativa): Promise<InformacionEducativa> {
    return put<InformacionEducativa>(
      `medidas/${medidaId}/seguimiento/informacion-educativa`,
      medidaId,
      data,
      true,
      'Información educativa actualizada'
    )
  }

  /**
   * Update información de salud
   */
  async updateInformacionSalud(medidaId: number, data: InformacionSalud): Promise<InformacionSalud> {
    return put<InformacionSalud>(
      `medidas/${medidaId}/seguimiento/informacion-salud`,
      medidaId,
      data,
      true,
      'Información de salud actualizada'
    )
  }

  /**
   * Add taller recreativo
   */
  async addTaller(medidaId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    return create<TallerRecreativo>(
      `medidas/${medidaId}/seguimiento/talleres/`,
      data,
      true,
      'Taller agregado exitosamente'
    )
  }

  /**
   * Update taller recreativo
   */
  async updateTaller(medidaId: number, tallerId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    return put<TallerRecreativo>(
      `medidas/${medidaId}/seguimiento/talleres`,
      tallerId,
      data,
      true,
      'Taller actualizado exitosamente'
    )
  }

  /**
   * Delete taller recreativo
   */
  async deleteTaller(medidaId: number, tallerId: number): Promise<void> {
    return remove(`medidas/${medidaId}/seguimiento/talleres`, tallerId)
  }

  /**
   * Add cambio de lugar de resguardo
   */
  async addCambioResguardo(medidaId: number, data: Omit<CambioLugarResguardo, 'id'>): Promise<CambioLugarResguardo> {
    return create<CambioLugarResguardo>(
      `medidas/${medidaId}/seguimiento/cambios-resguardo/`,
      data,
      true,
      'Cambio de resguardo registrado'
    )
  }

  /**
   * Add nota de seguimiento
   */
  async addNotaSeguimiento(medidaId: number, data: Omit<NotaSeguimiento, 'id'>): Promise<NotaSeguimiento> {
    return create<NotaSeguimiento>(
      `medidas/${medidaId}/seguimiento/notas/`,
      data,
      true,
      'Nota de seguimiento agregada'
    )
  }

  /**
   * MPE - Add situación crítica
   */
  async addSituacionCritica(medidaId: number, data: Omit<SituacionCritica, 'id'>): Promise<SituacionCritica> {
    return create<SituacionCritica>(
      `medidas/${medidaId}/seguimiento/situaciones-criticas/`,
      data,
      true,
      'Situación crítica registrada'
    )
  }

  /**
   * Upload adjunto for cambio resguardo
   * Note: apiService.create() supports FormData automatically
   */
  async uploadAdjuntoCambioResguardo(medidaId: number, cambioId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return create<{ url: string }>(
      `medidas/${medidaId}/seguimiento/cambios-resguardo/${cambioId}/adjunto/`,
      formData,
      true,
      'Archivo adjuntado exitosamente'
    )
  }

  /**
   * Upload adjunto for nota seguimiento
   * Note: apiService.create() supports FormData automatically
   */
  async uploadAdjuntoNota(medidaId: number, notaId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return create<{ url: string }>(
      `medidas/${medidaId}/seguimiento/notas/${notaId}/adjunto/`,
      formData,
      true,
      'Archivo adjuntado exitosamente'
    )
  }
}

export const seguimientoDispositivoService = new SeguimientoDispositivoApiService()
