/**
 * API Service for Nota de Aval (MED-03)
 * Connects to /api/medidas/{medida_pk}/nota-aval/ endpoints
 *
 * MED-03: Redacción de Nota de Aval por Director
 * - Director revisa intervención y emite decisión (aprobar u observar)
 * - Gestión de adjuntos (documentos firmados por Director)
 */

import { get, create, remove } from "@/app/api/apiService"
import type {
  CreateNotaAvalRequest,
  NotaAvalResponse,
  NotaAvalBasicResponse,
  NotaAvalQueryParams,
  CreateNotaAvalResponse,
  AdjuntoNotaAval,
  AdjuntosNotaAvalQueryParams,
  UploadAdjuntoResponse,
} from "../types/nota-aval-api"

// ============================================================================
// CRUD OPERATIONS - NOTA DE AVAL
// ============================================================================

/**
 * Get notas de aval of a medida (list)
 * GET /api/medidas/{medida_id}/nota-aval/
 *
 * Puede haber múltiples notas de aval si la medida fue observada y corregida varias veces.
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de notas de aval
 */
export const getNotasAvalByMedida = async (
  medidaId: number,
  params: NotaAvalQueryParams = {}
): Promise<NotaAvalBasicResponse[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.decision) {
      queryParams.decision = params.decision
    }

    if (params.fecha_desde) {
      queryParams.fecha_desde = params.fecha_desde
    }

    if (params.fecha_hasta) {
      queryParams.fecha_hasta = params.fecha_hasta
    }

    if (params.ordering) {
      queryParams.ordering = params.ordering
    }

    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit)
    }

    if (params.offset !== undefined) {
      queryParams.offset = String(params.offset)
    }

    console.log(`Fetching notas de aval for medida ${medidaId} with params:`, queryParams)

    // Make API call - Backend returns array directly
    const response = await get<NotaAvalBasicResponse[]>(
      `medidas/${medidaId}/nota-aval/`,
      queryParams
    )

    console.log("Notas de aval retrieved:", response)
    console.log("First nota structure:", response[0])
    console.log("emitido_por_detalle type:", typeof response[0]?.emitido_por_detalle)
    console.log("emitido_por_detalle value:", response[0]?.emitido_por_detalle)

    return response
  } catch (error: any) {
    console.error(`Error fetching notas de aval for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get nota de aval detail (complete info)
 * GET /api/medidas/{medida_id}/nota-aval/{id}/
 *
 * @param medidaId ID de la medida
 * @param notaAvalId ID de la nota de aval
 * @returns Nota de aval con detalle completo
 */
export const getNotaAvalDetail = async (
  medidaId: number,
  notaAvalId: number
): Promise<NotaAvalResponse> => {
  try {
    console.log(`Fetching nota de aval detail: medida ${medidaId}, nota ${notaAvalId}`)

    // Make API call - Django requires trailing slash
    const response = await get<NotaAvalResponse>(
      `medidas/${medidaId}/nota-aval/${notaAvalId}/`
    )

    console.log("Nota de aval detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching nota de aval detail: medida ${medidaId}, nota ${notaAvalId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Create a new nota de aval (emitir decisión del Director)
 * POST /api/medidas/{medida_id}/nota-aval/
 *
 * Validaciones del backend:
 * - Medida debe estar en Estado 3 (PENDIENTE_NOTA_AVAL)
 * - Usuario debe ser Director (via TCustomUserZona)
 * - Comentarios obligatorios si OBSERVADO (mínimo 10 caracteres)
 *
 * Proceso:
 * 1. Validar estado de medida (debe ser Estado 3)
 * 2. Validar permisos (solo Director)
 * 3. Crear registro de Nota de Aval
 * 4. Transicionar estado de medida según decisión:
 *    - APROBAR: Estado 3 → Estado 4 (PENDIENTE_INFORME_JURIDICO)
 *    - OBSERVAR: Estado 3 → Estado 2 (PENDIENTE_APROBACION_REGISTRO)
 * 5. Notificar a roles correspondientes
 *
 * @param medidaId ID de la medida
 * @param data Datos de la nota de aval a crear
 * @returns Nota de aval creada con información de transición
 */
export const createNotaAval = async (
  medidaId: number,
  data: CreateNotaAvalRequest
): Promise<CreateNotaAvalResponse> => {
  try {
    console.log(`Creating nota de aval for medida ${medidaId}:`, data)

    // Ensure medida_id is set
    const requestData = {
      ...data,
      medida_id: medidaId,
    }

    // Make API call - create() already adds trailing slash
    const response = await create<CreateNotaAvalResponse>(
      `medidas/${medidaId}/nota-aval`,
      requestData as Partial<CreateNotaAvalResponse>
    )

    console.log("Nota de aval created successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error creating nota de aval for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// ADJUNTOS MANAGEMENT
// ============================================================================

/**
 * Upload adjunto to nota de aval
 * POST /api/medidas/{medida_id}/nota-aval/adjuntos/
 *
 * Validaciones:
 * - Solo archivos PDF
 * - Tamaño máximo: 10MB
 * - Solo Director puede subir adjuntos
 *
 * @param medidaId ID de la medida
 * @param file Archivo a subir (PDF)
 * @returns Adjunto creado
 */
export const uploadAdjuntoNotaAval = async (
  medidaId: number,
  file: File
): Promise<AdjuntoNotaAval> => {
  try {
    console.log(`Uploading adjunto to nota de aval: medida ${medidaId}`)

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Solo se permiten archivos PDF')
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new Error('El archivo excede el tamaño máximo de 10MB')
    }

    // Create FormData for multipart/form-data
    const formData = new FormData()
    formData.append("archivo", file)

    // Make API call using fetch directly (apiService may not support FormData)
    // Get the base URL from environment or config
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
    const url = `${baseURL}/medidas/${medidaId}/nota-aval/adjuntos/`

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: 'include', // Include cookies for authentication
      // Don't set Content-Type header - browser will set it with boundary
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("Adjunto uploaded successfully:", data)

    return data
  } catch (error: any) {
    console.error(`Error uploading adjunto: medida ${medidaId}`, error)
    console.error("Error details:", {
      message: error?.message,
    })
    throw error
  }
}

/**
 * Get adjuntos list of nota de aval
 * GET /api/medidas/{medida_id}/nota-aval/adjuntos-list/
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de adjuntos
 */
export const getAdjuntosNotaAval = async (
  medidaId: number,
  params: AdjuntosNotaAvalQueryParams = {}
): Promise<AdjuntoNotaAval[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.nota_aval !== undefined) {
      queryParams.nota_aval = String(params.nota_aval)
    }

    console.log(`Fetching adjuntos nota de aval: medida ${medidaId} with params:`, queryParams)

    // Make API call
    const response = await get<AdjuntoNotaAval[]>(
      `medidas/${medidaId}/nota-aval/adjuntos-list/`,
      queryParams
    )

    console.log("Adjuntos nota de aval retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching adjuntos nota de aval: medida ${medidaId}`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Delete adjunto from nota de aval
 * DELETE /api/medidas/{medida_id}/nota-aval/adjuntos/{adjunto_id}/
 *
 * Solo Director puede eliminar adjuntos.
 *
 * @param medidaId ID de la medida
 * @param adjuntoId ID del adjunto
 */
export const deleteAdjuntoNotaAval = async (
  medidaId: number,
  adjuntoId: number
): Promise<void> => {
  try {
    console.log(`Deleting adjunto nota de aval: medida ${medidaId}, adjunto ${adjuntoId}`)

    // Make API call using custom endpoint structure
    // The remove() function expects endpoint and id separately, but here we need custom path
    // We'll use fetch directly for more control
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
    const url = `${baseURL}/medidas/${medidaId}/nota-aval/adjuntos/${adjuntoId}/`

    const response = await fetch(url, {
      method: "DELETE",
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    console.log("Adjunto nota de aval deleted successfully")
  } catch (error: any) {
    console.error(
      `Error deleting adjunto nota de aval: medida ${medidaId}, adjunto ${adjuntoId}`,
      error
    )
    console.error("Error details:", {
      message: error?.message,
    })
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the most recent nota de aval for a medida
 *
 * @param medidaId ID de la medida
 * @returns Most recent nota de aval or null if none exist
 */
export const getMostRecentNotaAval = async (
  medidaId: number
): Promise<NotaAvalBasicResponse | null> => {
  try {
    const notas = await getNotasAvalByMedida(medidaId, {
      ordering: '-fecha_emision',
      limit: 1,
    })

    return notas.length > 0 ? notas[0] : null
  } catch (error) {
    console.error(`Error getting most recent nota de aval for medida ${medidaId}:`, error)
    return null
  }
}

/**
 * Check if a medida has any notas de aval
 *
 * @param medidaId ID de la medida
 * @returns true if medida has at least one nota de aval
 */
export const hasNotasAval = async (medidaId: number): Promise<boolean> => {
  try {
    const notas = await getNotasAvalByMedida(medidaId, { limit: 1 })
    return notas.length > 0
  } catch (error) {
    console.error(`Error checking if medida ${medidaId} has notas de aval:`, error)
    return false
  }
}
