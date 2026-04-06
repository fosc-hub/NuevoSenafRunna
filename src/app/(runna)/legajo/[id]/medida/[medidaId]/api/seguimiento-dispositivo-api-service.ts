/**
 * API Service for SEGUIMIENTO EN DISPOSITIVO module
 * Handles both MPE and MPJ seguimiento data
 *
 * REFACTORED: Now uses centralized apiService for security and consistency
 */

import { get, create, put, patch, remove, update } from '@/app/api/apiService'
import axiosInstance from '@/app/api/utils/axiosInstance'
import { toast } from 'react-toastify'
import type {
  SeguimientoDispositivoMPE,
  SeguimientoDispositivoMPJ,
  SituacionResidenciaMPE,
  SituacionInstitutoMPJ,
  SituacionNNyA,
  InformacionEducativa,
  InformacionSalud,
  TallerRecreativo,
  CambioLugarResguardo,
  NotaSeguimiento,
  SituacionCritica,
  TLocalCentroVida,
  CreateSeguimientoRequest,
  UpdateSeguimientoRequest,
  SeguimientoResponse
} from '../types/seguimiento-dispositivo'

class SeguimientoDispositivoApiService {

  /**
   * Get seguimiento data for a specific medida
   */
  async getSeguimiento(medidaId: number, tipoMedida: 'MPI' | 'MPE' | 'MPJ'): Promise<SeguimientoResponse> {
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

  // ========================================
  // API v2.0 - Unified Situación Methods
  // ========================================

  /**
   * Add situación del NNyA en dispositivo (unified for MPE and MPJ)
   * @version 2.0.0
   * @param medidaId - ID of the medida
   * @param data - Situación data with tipo_situacion, fecha, observaciones
   */
  async addSituacionDispositivo(
    medidaId: number,
    data: Omit<SituacionNNyA, 'id' | 'fecha_registro' | 'tipo_situacion_display'>
  ): Promise<SituacionNNyA> {
    // Backend expects medida field in request body
    const requestData = {
      ...data,
      medida: medidaId
    }

    return create<SituacionNNyA>(
      `medidas/${medidaId}/situacion-dispositivo/`,
      requestData,
      true,
      'Situación registrada exitosamente'
    )
  }

  /**
   * Get most recent situación del NNyA
   * @version 2.0.0
   * @param medidaId - ID of the medida
   * @returns Most recent situación or null if none exists
   */
  async getSituacionActual(medidaId: number): Promise<SituacionNNyA | null> {
    try {
      return await get<SituacionNNyA>(`medidas/${medidaId}/situacion-dispositivo/actual/`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No situación registered yet
      }
      throw error
    }
  }

  /**
   * List all situaciones del NNyA for a medida
   * @version 2.0.0
   * @param medidaId - ID of the medida
   * @returns Array of situaciones ordered by fecha DESC
   */
  async listSituaciones(medidaId: number): Promise<SituacionNNyA[]> {
    try {
      const response = await get<any>(`medidas/${medidaId}/situacion-dispositivo/`)

      // Backend returns paginated data: { count, next, previous, results: [...] }
      // Extract results array
      const backendData = response.results || response
      const dataArray = Array.isArray(backendData) ? backendData : []

      return dataArray
    } catch (error) {
      console.error('Error fetching situaciones:', error)
      return []
    }
  }

  // ========================================
  // API v1.0 - Deprecated Methods (kept for backward compatibility)
  // ========================================

  /**
   * MPE - Add situación en residencia
   * @deprecated Use addSituacionDispositivo() instead (API v2.0)
   */
  async addSituacionResidencia(medidaId: number, data: SituacionResidenciaMPE): Promise<SituacionResidenciaMPE> {
    console.warn('addSituacionResidencia is deprecated, use addSituacionDispositivo instead')
    const newData = {
      tipo_situacion: data.tipo_situacion,
      fecha: data.fecha,
      observaciones: data.observaciones
    }
    return this.addSituacionDispositivo(medidaId, newData) as any
  }

  /**
   * MPJ - Add situación en instituto
   * @deprecated Use addSituacionDispositivo() instead (API v2.0)
   */
  async addSituacionInstituto(medidaId: number, data: SituacionInstitutoMPJ): Promise<SituacionInstitutoMPJ> {
    console.warn('addSituacionInstituto is deprecated, use addSituacionDispositivo instead')
    // Map old MPJ structure to new unified structure
    const newData = {
      tipo_situacion: data.tipo_situacion,
      fecha: data.fecha,
      observaciones: data.observaciones
    }
    return this.addSituacionDispositivo(medidaId, newData) as any
  }

  /**
   * Get información educativa for a medida
   * @version 2.0.0
   */
  async getInformacionEducativa(medidaId: number): Promise<InformacionEducativa | null> {
    try {
      const apiData = await get<any>(`medidas/${medidaId}/info-educativa/`)

      // Transform API field names to frontend interface
      return {
        id: apiData.id,
        nivel_educativo: apiData.nivel_alcanzado,
        institucion_educativa_id: apiData.institucion_educativa_id,
        establecimiento: apiData.institucion_educativa_nombre,
        grado_curso: apiData.ultimo_cursado,
        turno: apiData.turno,
        rendimiento: apiData.rendimiento,
        asistencia: apiData.asistencia,
        observaciones: apiData.comentarios_educativos,
        fecha_actualizacion: apiData.fecha_actualizacion
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No info educativa yet
      }
      throw error
    }
  }

  /**
   * Create información educativa (first time)
   * @version 2.0.0 - POST to /api/educacion/ to create base TEducacion record
   *
   * Flow:
   * 1. GET /api/medidas/{id}/ to extract persona_id
   * 2. POST /api/educacion/ with persona_id to create base record
   * 3. PATCH /api/medidas/{id}/info-educativa/ to update with user data
   */
  async createInformacionEducativa(medidaId: number, personaId: number, data: Partial<InformacionEducativa>): Promise<InformacionEducativa> {
    // Step 1: Create base TEducacion record via /api/educacion/
    const baseEducacionData = {
      persona: personaId,
      nivel_alcanzado: data.nivel_educativo || 'PRIMARIO_INCOMPLETO',
      esta_escolarizado: true,
      ultimo_cursado: data.grado_curso || '',
      tipo_escuela: 'PUBLICA',
      comentarios_educativos: data.observaciones || 'Registro inicial'
    }

    await create<any>(
      'educacion/',
      baseEducacionData,
      false // No toast for intermediate step
    )

    // Step 2: Transform frontend data to API format for PATCH
    const apiData = {
      nivel_alcanzado: data.nivel_educativo,
      institucion_educativa_id: data.institucion_educativa_id, // Send ID, not nombre
      ultimo_cursado: data.grado_curso,
      turno: data.turno,
      rendimiento: data.rendimiento,
      asistencia: data.asistencia,
      comentarios_educativos: data.observaciones,
      fecha_actualizacion: data.fecha_actualizacion
    }

    const response = await axiosInstance.patch<any>(
      `medidas/${medidaId}/info-educativa/`,
      apiData
    )

    toast.success('Información educativa creada exitosamente')

    // Transform response back to frontend format
    return {
      id: response.data.id,
      nivel_educativo: response.data.nivel_alcanzado,
      establecimiento: response.data.institucion_educativa_nombre,
      grado_curso: response.data.ultimo_cursado,
      turno: response.data.turno,
      rendimiento: response.data.rendimiento,
      asistencia: response.data.asistencia,
      observaciones: response.data.comentarios_educativos,
      fecha_actualizacion: response.data.fecha_actualizacion
    }
  }

  /**
   * Update información educativa (partial update)
   * @version 2.0.0 - Now uses PATCH method and updated endpoint
   * Note: Endpoint is /medidas/{id}/info-educativa/ (no separate record ID)
   */
  async updateInformacionEducativa(medidaId: number, data: Partial<InformacionEducativa>): Promise<InformacionEducativa> {
    // Transform frontend data to API format
    const apiData = {
      nivel_alcanzado: data.nivel_educativo,
      institucion_educativa_id: data.institucion_educativa_id, // Send ID, not nombre
      ultimo_cursado: data.grado_curso,
      turno: data.turno,
      rendimiento: data.rendimiento,
      asistencia: data.asistencia,
      comentarios_educativos: data.observaciones,
      fecha_actualizacion: data.fecha_actualizacion
    }

    const response = await axiosInstance.patch<any>(
      `medidas/${medidaId}/info-educativa/`,
      apiData
    )

    toast.success('Información educativa actualizada')

    // Transform response back to frontend format
    return {
      id: response.data.id,
      nivel_educativo: response.data.nivel_alcanzado,
      institucion_educativa_id: response.data.institucion_educativa_id,
      establecimiento: response.data.institucion_educativa_nombre,
      grado_curso: response.data.ultimo_cursado,
      turno: response.data.turno,
      rendimiento: response.data.rendimiento,
      asistencia: response.data.asistencia,
      observaciones: response.data.comentarios_educativos,
      fecha_actualizacion: response.data.fecha_actualizacion
    }
  }

  /**
   * Get información de salud for a medida
   * @version 2.0.0
   */
  async getInformacionSalud(medidaId: number): Promise<InformacionSalud | null> {
    try {
      const apiData = await get<any>(`medidas/${medidaId}/info-salud/`)

      // Transform API field names to frontend interface
      // API returns cobertura_medica model fields
      return {
        id: apiData.id,
        obra_social: apiData.obra_social,
        intervencion: apiData.intervencion,
        auh: apiData.auh,
        institucion_sanitaria_id: apiData.institucion_sanitaria_id,
        centro_salud: apiData.institucion_sanitaria_nombre,
        observaciones: apiData.observaciones
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No info salud yet
      }
      throw error
    }
  }

  /**
   * Create información de salud (first time)
   * @version 2.0.0 - POST to /api/cobertura-medica/ to create base record
   *
   * Flow:
   * 1. GET /api/medidas/{id}/ to extract persona_id
   * 2. POST /api/cobertura-medica/ with persona_id to create base record
   * 3. PATCH /api/medidas/{id}/info-salud/ to update with user data
   */
  async createInformacionSalud(medidaId: number, personaId: number, data: Partial<InformacionSalud>): Promise<InformacionSalud> {
    // Step 1: Create base cobertura médica record
    const baseSaludData = {
      persona: personaId,
      obra_social: data.obra_social || 'NO_POSEE',
      observaciones: data.observaciones || 'Registro inicial'
    }

    await create<any>(
      'cobertura-medica/',
      baseSaludData,
      false // No toast for intermediate step
    )

    // Step 2: Transform frontend data to API format for PATCH
    // Only send fields that exist in cobertura_medica model
    const apiData = {
      obra_social: data.obra_social,
      intervencion: data.intervencion,
      auh: data.auh,
      institucion_sanitaria_id: data.institucion_sanitaria_id, // Send ID, not nombre
      observaciones: data.observaciones
    }

    const response = await axiosInstance.patch<any>(
      `medidas/${medidaId}/info-salud/`,
      apiData
    )

    toast.success('Información de salud creada exitosamente')

    // Transform response back to frontend format
    return {
      id: response.data.id,
      obra_social: response.data.obra_social,
      intervencion: response.data.intervencion,
      auh: response.data.auh,
      institucion_sanitaria_id: response.data.institucion_sanitaria_id,
      centro_salud: response.data.institucion_sanitaria_nombre,
      observaciones: response.data.observaciones
    }
  }

  /**
   * Update información de salud (partial update)
   * @version 2.0.0 - Now uses PATCH method and updated endpoint
   * Note: Endpoint is /medidas/{id}/info-salud/ (no separate record ID)
   */
  async updateInformacionSalud(medidaId: number, data: Partial<InformacionSalud>): Promise<InformacionSalud> {
    // Transform frontend data to API format
    // Only send fields that exist in cobertura_medica model
    const apiData = {
      obra_social: data.obra_social,
      intervencion: data.intervencion,
      auh: data.auh,
      institucion_sanitaria_id: data.institucion_sanitaria_id, // Send ID, not nombre
      observaciones: data.observaciones
    }

    const response = await axiosInstance.patch<any>(
      `medidas/${medidaId}/info-salud/`,
      apiData
    )

    toast.success('Información de salud actualizada')

    // Transform response back to frontend format
    return {
      id: response.data.id,
      obra_social: response.data.obra_social,
      intervencion: response.data.intervencion,
      auh: response.data.auh,
      institucion_sanitaria_id: response.data.institucion_sanitaria_id,
      centro_salud: response.data.institucion_sanitaria_nombre,
      observaciones: response.data.observaciones
    }
  }

  /**
   * Get all talleres for a medida
   * @version 2.0.0
   */
  async listTalleres(medidaId: number): Promise<TallerRecreativo[]> {
    try {
      const response = await get<any>(`medidas/${medidaId}/talleres/`)

      // Backend returns paginated data: { count, next, previous, results: [...] }
      // Extract results array
      const backendData = response.results || response
      const dataArray = Array.isArray(backendData) ? backendData : []

      // Transform backend field names to match frontend types
      // Backend uses 'nombre', frontend expects 'nombre_taller'
      return dataArray.map((taller: any) => ({
        id: taller.id,
        orden: taller.orden || 1,
        nombre_taller: taller.nombre, // Transform nombre → nombre_taller
        institucion: taller.institucion,
        dias_horarios: taller.dias_horarios,
        referente: taller.referente,
        fecha_inicio: taller.fecha_inicio,
        fecha_fin: taller.fecha_fin,
        observaciones: taller.observaciones
      }))
    } catch (error) {
      console.error('Error fetching talleres:', error)
      return []
    }
  }

  /**
   * Add taller recreativo
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/talleres/
   */
  async addTaller(medidaId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    // Backend expects medida field and nombre (not nombre_taller)
    const requestData = {
      medida: medidaId,
      nombre: data.nombre_taller,
      orden: data.orden,
      institucion: data.institucion,
      dias_horarios: data.dias_horarios,
      referente: data.referente,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      observaciones: data.observaciones
    }

    return create<TallerRecreativo>(
      `medidas/${medidaId}/talleres/`,
      requestData,
      true,
      'Taller agregado exitosamente'
    )
  }

  /**
   * Update taller recreativo
   * @version 2.0.0 - Endpoint: PATCH /api/medidas/{id}/talleres/{pk}/
   */
  async updateTaller(medidaId: number, tallerId: number, data: TallerRecreativo): Promise<TallerRecreativo> {
    // Backend expects medida field and nombre (not nombre_taller)
    const requestData = {
      medida: medidaId,
      nombre: data.nombre_taller,
      orden: data.orden,
      institucion: data.institucion,
      dias_horarios: data.dias_horarios,
      referente: data.referente,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      observaciones: data.observaciones
    }

    // Use update function (which uses PATCH) with toast support
    const response = await update<any>(
      `medidas/${medidaId}/talleres`,
      tallerId,
      requestData,
      true,
      'Taller actualizado exitosamente'
    )

    // Transform response back to frontend format
    return {
      id: response.id,
      orden: response.orden || 1,
      nombre_taller: response.nombre,
      institucion: response.institucion,
      dias_horarios: response.dias_horarios,
      referente: response.referente,
      fecha_inicio: response.fecha_inicio,
      fecha_fin: response.fecha_fin,
      observaciones: response.observaciones
    }
  }

  /**
   * Delete taller recreativo
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/talleres/{pk}/
   */
  async deleteTaller(medidaId: number, tallerId: number): Promise<void> {
    return remove(`medidas/${medidaId}/talleres`, tallerId)
  }

  /**
   * Add cambio de lugar de resguardo
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/cambio-lugar/
   */
  async addCambioResguardo(medidaId: number, data: Omit<CambioLugarResguardo, 'id'>): Promise<CambioLugarResguardo> {
    return create<CambioLugarResguardo>(
      `medidas/${medidaId}/cambio-lugar/`,
      {
        medida: medidaId,
        ...data
      },
      true,
      'Cambio de resguardo registrado'
    )
  }

  /**
   * Get all cambios de lugar for a medida
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/cambio-lugar/
   */
  async listCambiosLugar(medidaId: number): Promise<CambioLugarResguardo[]> {
    try {
      const response = await get<any>(`medidas/${medidaId}/cambio-lugar/`)

      // Backend returns paginated data: { count, next, previous, results: [...] }
      const backendData = response.results || response
      return Array.isArray(backendData) ? backendData : []
    } catch (error) {
      console.error('Error fetching cambios de lugar:', error)
      return []
    }
  }

  /**
   * Get cambio lugar history
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/cambio-lugar/historial/
   */
  async getCambioLugarHistorial(medidaId: number): Promise<CambioLugarResguardo[]> {
    try {
      const response = await get<any>(`medidas/${medidaId}/cambio-lugar/historial/`)

      // Backend returns paginated data: { count, next, previous, results: [...] }
      const backendData = response.results || response
      return Array.isArray(backendData) ? backendData : []
    } catch (error) {
      console.error('Error fetching cambio lugar historial:', error)
      return []
    }
  }

  /**
   * Add nota de seguimiento
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/notas-seguimiento/
   */
  async addNotaSeguimiento(medidaId: number, data: Omit<NotaSeguimiento, 'id'>): Promise<NotaSeguimiento> {
    return create<NotaSeguimiento>(
      `medidas/${medidaId}/notas-seguimiento/`,
      {
        medida: medidaId,
        ...data
      },
      true,
      'Nota de seguimiento agregada'
    )
  }

  /**
   * Get all notas de seguimiento for a medida
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/notas-seguimiento/
   */
  async listNotasSeguimiento(medidaId: number): Promise<NotaSeguimiento[]> {
    try {
      const response = await get<any>(`medidas/${medidaId}/notas-seguimiento/`)

      // Backend returns paginated data: { count, next, previous, results: [...] }
      const backendData = response.results || response
      return Array.isArray(backendData) ? backendData : []
    } catch (error) {
      console.error('Error fetching notas de seguimiento:', error)
      return []
    }
  }

  /**
   * Get single nota de seguimiento
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/notas-seguimiento/{pk}/
   */
  async getNotaSeguimiento(medidaId: number, notaId: number): Promise<NotaSeguimiento | null> {
    try {
      return await get<NotaSeguimiento>(`medidas/${medidaId}/notas-seguimiento/${notaId}/`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Delete nota de seguimiento
   * @version 2.0.0 - Endpoint: /api/medidas/{id}/notas-seguimiento/{pk}/
   */
  async deleteNotaSeguimiento(medidaId: number, notaId: number): Promise<void> {
    return remove(`medidas/${medidaId}/notas-seguimiento`, notaId)
  }

  /**
   * MPE - Add situación crítica (legacy endpoint, may be removed in future)
   * @deprecated Check with backend if this is still used or replaced by situacion-dispositivo
   */
  async addSituacionCritica(medidaId: number, data: Omit<SituacionCritica, 'id'>): Promise<SituacionCritica> {
    console.warn('addSituacionCritica may be deprecated - verify with backend team')
    return create<SituacionCritica>(
      `medidas/${medidaId}/situaciones-criticas/`,
      data,
      true,
      'Situación crítica registrada'
    )
  }

  /**
   * Upload adjunto for cambio resguardo
   * Note: apiService.create() supports FormData automatically
   * @version 2.0.0 - Endpoint path updated
   */
  async uploadAdjuntoCambioResguardo(medidaId: number, cambioId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return create<{ url: string }>(
      `medidas/${medidaId}/cambio-lugar/${cambioId}/adjunto/`,
      formData,
      true,
      'Archivo adjuntado exitosamente'
    )
  }

  /**
   * Upload adjunto for nota seguimiento
   * Note: apiService.create() supports FormData automatically
   * @version 2.0.0 - Endpoint path updated
   */
  async uploadAdjuntoNota(medidaId: number, notaId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return create<{ url: string }>(
      `medidas/${medidaId}/notas-seguimiento/${notaId}/adjunto/`,
      formData,
      true,
      'Archivo adjuntado exitosamente'
    )
  }

  /**
   * Get all locales-centro-vida (for lugar_origen and lugar_destino dropdowns)
   * @version 2.0.0 - Endpoint: /api/locales-centro-vida/
   */
  async listLocalesCentroVida(): Promise<TLocalCentroVida[]> {
    const response = await get<{ results: TLocalCentroVida[] }>('locales-centro-vida/')
    return response.results || []
  }
}

export const seguimientoDispositivoService = new SeguimientoDispositivoApiService()
