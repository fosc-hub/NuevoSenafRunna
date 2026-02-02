/**
 * API Service for Informe Jurídico (MED-04)
 * Connects to /api/medidas/{medida_pk}/informe-juridico/ endpoints
 *
 * MED-04: Carga de Informe Jurídico por Equipo Legal
 * - Equipo Legal elabora y carga informe jurídico
 * - Gestión de adjuntos (informe oficial + acuses de recibo)
 * - Envío de informe completo (transición Estado 4 → Estado 5)
 */

import { get, create, update, remove } from "@/app/api/apiService"
import type {
  CreateInformeJuridicoRequest,
  InformeJuridicoResponse,
  InformeJuridicoBasicResponse,
  InformeJuridicoQueryParams,
  CreateInformeJuridicoResponse,
  AdjuntoInformeJuridico,
  AdjuntosInformeJuridicoQueryParams,
  UploadAdjuntoInformeJuridicoResponse,
  EnviarInformeJuridicoResponse,
} from "../types/informe-juridico-api"

// ============================================================================
// CRUD OPERATIONS - INFORME JURÍDICO
// ============================================================================

/**
 * Get informes jurídicos of a medida (list)
 * GET /api/medidas/{medida_id}/informe-juridico/
 *
 * En general, habrá solo un informe jurídico por medida, pero el endpoint
 * puede retornar múltiples si se permitieron correcciones.
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de informes jurídicos
 */
export const getInformesJuridicosByMedida = async (
  medidaId: number,
  params: InformeJuridicoQueryParams = {}
): Promise<InformeJuridicoBasicResponse[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.enviado !== undefined) {
      queryParams.enviado = String(params.enviado)
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

    console.log(`Fetching informes jurídicos for medida ${medidaId} with params:`, queryParams)

    // Make API call - Backend returns array directly
    const response = await get<InformeJuridicoBasicResponse[]>(
      `medidas/${medidaId}/informe-juridico/`,
      queryParams
    )

    console.log("Informes jurídicos retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching informes jurídicos for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get informe jurídico detail (complete info)
 * GET /api/medidas/{medida_id}/informe-juridico/{id}/
 *
 * @param medidaId ID de la medida
 * @param informeJuridicoId ID del informe jurídico
 * @returns Informe jurídico con detalle completo
 */
export const getInformeJuridicoDetail = async (
  medidaId: number,
  informeJuridicoId: number
): Promise<InformeJuridicoResponse> => {
  try {
    console.log(
      `Fetching informe jurídico detail: medida ${medidaId}, informe ${informeJuridicoId}`
    )

    // Make API call - Django requires trailing slash
    const response = await get<InformeJuridicoResponse>(
      `medidas/${medidaId}/informe-juridico/${informeJuridicoId}/`
    )

    console.log("Informe jurídico detail retrieved:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error fetching informe jurídico detail: medida ${medidaId}, informe ${informeJuridicoId}`,
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
 * Create a new informe jurídico
 * POST /api/medidas/{medida_id}/informe-juridico/
 *
 * Validaciones del backend:
 * - Medida debe estar en Estado 4 (PENDIENTE_INFORME_JURIDICO)
 * - Usuario debe ser Equipo Legal (nivel 3 o 4 con flag legal=true)
 * - Instituciones notificadas obligatorio
 * - Destinatarios obligatorio
 * - Fecha de notificaciones no puede ser futura
 *
 * Proceso:
 * 1. Validar estado de medida (debe ser Estado 4)
 * 2. Validar permisos (solo Equipo Legal)
 * 3. Crear registro de Informe Jurídico
 * 4. El informe queda en estado "no enviado" hasta que se adjunte informe oficial y se envíe
 *
 * @param medidaId ID de la medida
 * @param data Datos del informe jurídico a crear
 * @returns Informe jurídico creado
 */
export const createInformeJuridico = async (
  medidaId: number,
  data: CreateInformeJuridicoRequest
): Promise<CreateInformeJuridicoResponse> => {
  try {
    console.log(`Creating informe jurídico for medida ${medidaId}:`, data)

    // Make API call - create() already adds trailing slash
    const response = await create<CreateInformeJuridicoResponse>(
      `medidas/${medidaId}/informe-juridico`,
      data as Partial<CreateInformeJuridicoResponse>
    )

    console.log("Informe jurídico created successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error creating informe jurídico for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Update an existing informe jurídico
 * PATCH /api/medidas/{medida_id}/informe-juridico/{id}/
 *
 * Validaciones:
 * - Solo Equipo Legal puede actualizar
 * - Solo se puede actualizar si el informe no ha sido enviado (enviado=False)
 * - Campos actualizables: observaciones, instituciones_notificadas, fecha_notificaciones, medio_notificacion, destinatarios
 *
 * @param medidaId ID de la medida
 * @param informeJuridicoId ID del informe jurídico
 * @param data Datos a actualizar (parcial)
 * @returns Informe jurídico actualizado
 */
export const updateInformeJuridico = async (
  medidaId: number,
  informeJuridicoId: number,
  data: Partial<CreateInformeJuridicoRequest>
): Promise<InformeJuridicoResponse> => {
  try {
    console.log(`Updating informe jurídico: medida ${medidaId}, informe ${informeJuridicoId}`, data)

    // Uses update() which sends PATCH request
    // update(endpoint, id, data) - pass informeJuridicoId as the ID parameter
    const response = await update<InformeJuridicoResponse>(
      `medidas/${medidaId}/informe-juridico`,
      informeJuridicoId,
      data as Partial<InformeJuridicoResponse>
    )

    console.log("Informe jurídico updated successfully:", response)

    return response
  } catch (error: any) {
    console.error(
      `Error updating informe jurídico: medida ${medidaId}, informe ${informeJuridicoId}`,
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

// ============================================================================
// ENVIAR INFORME JURÍDICO (Transición Estado 4 → 5)
// ============================================================================

/**
 * Enviar informe jurídico completo
 * POST /api/medidas/{medida_id}/informe-juridico/enviar/
 *
 * Validaciones:
 * - Informe jurídico debe existir
 * - Debe tener al menos un adjunto tipo INFORME (informe oficial)
 * - Usuario debe ser Equipo Legal
 *
 * Proceso:
 * 1. Validar que existe informe oficial adjunto
 * 2. Marcar informe como enviado (enviado=True, fecha_envio=now)
 * 3. Transicionar estado de medida: Estado 4 → Estado 5 (PENDIENTE_RATIFICACION_JUDICIAL)
 * 4. Notificar a roles correspondientes
 * 5. Informe se vuelve inmutable (no se puede modificar ni eliminar adjuntos)
 *
 * @param medidaId ID de la medida
 * @returns Response con información de transición
 */
export const enviarInformeJuridico = async (
  medidaId: number
): Promise<EnviarInformeJuridicoResponse> => {
  try {
    console.log(`Enviando informe jurídico for medida ${medidaId}`)

    // POST to custom action endpoint (urls.py line 243: {'post': 'enviar_informe'})
    const response = await create<EnviarInformeJuridicoResponse>(
      `medidas/${medidaId}/informe-juridico/enviar/`,
      {},
      true,
      'Informe jurídico enviado exitosamente'
    )

    console.log("Informe jurídico enviado successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error enviando informe jurídico for medida ${medidaId}:`, error)
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
 * Upload adjunto to informe jurídico
 * POST /api/medidas/{medida_id}/informe-juridico/adjuntos/
 *
 * Validaciones:
 * - Solo archivos PDF
 * - Tamaño máximo: 10MB
 * - Solo Equipo Legal puede subir adjuntos
 * - tipo_adjunto debe ser INFORME o ACUSE
 * - Solo se permite un adjunto tipo INFORME
 * - Solo se pueden subir adjuntos si informe no ha sido enviado
 *
 * @param medidaId ID de la medida
 * @param file Archivo a subir (PDF)
 * @param tipoAdjunto Tipo de adjunto (INFORME o ACUSE)
 * @param descripcion Descripción opcional (útil para acuses)
 * @returns Adjunto creado
 */
export const uploadAdjuntoInformeJuridico = async (
  medidaId: number,
  file: File,
  tipoAdjunto: 'INFORME' | 'ACUSE',
  descripcion?: string
): Promise<AdjuntoInformeJuridico> => {
  try {
    console.log(
      `Uploading adjunto to informe jurídico: medida ${medidaId}, tipo ${tipoAdjunto}`
    )

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
    formData.append("tipo_adjunto", tipoAdjunto)
    if (descripcion) {
      formData.append("descripcion", descripcion)
    }

    // apiService.create() supports FormData automatically
    const response = await create<AdjuntoInformeJuridico>(
      `medidas/${medidaId}/informe-juridico/adjuntos/`,
      formData,
      true,
      'Adjunto subido exitosamente'
    )

    console.log("Adjunto uploaded successfully:", response)

    return response
  } catch (error: any) {
    console.error(`Error uploading adjunto: medida ${medidaId}`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get adjuntos list of informe jurídico
 * GET /api/medidas/{medida_id}/informe-juridico/adjuntos-list/
 *
 * @param medidaId ID de la medida
 * @param params Query parameters para filtrar
 * @returns Array de adjuntos
 */
export const getAdjuntosInformeJuridico = async (
  medidaId: number,
  params: AdjuntosInformeJuridicoQueryParams = {}
): Promise<AdjuntoInformeJuridico[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params.informe_juridico !== undefined) {
      queryParams.informe_juridico = String(params.informe_juridico)
    }

    if (params.tipo_adjunto) {
      queryParams.tipo_adjunto = params.tipo_adjunto
    }

    console.log(
      `Fetching adjuntos informe jurídico: medida ${medidaId} with params:`,
      queryParams
    )

    // Make API call
    const response = await get<AdjuntoInformeJuridico[]>(
      `medidas/${medidaId}/informe-juridico/adjuntos-list/`,
      queryParams
    )

    console.log("Adjuntos informe jurídico retrieved:", response)

    return response
  } catch (error: any) {
    console.error(`Error fetching adjuntos informe jurídico: medida ${medidaId}`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Delete adjunto from informe jurídico
 * DELETE /api/medidas/{medida_id}/informe-juridico/adjuntos/{adjunto_id}/
 *
 * Validaciones:
 * - Solo Equipo Legal puede eliminar adjuntos
 * - Solo se pueden eliminar adjuntos si informe no ha sido enviado
 *
 * @param medidaId ID de la medida
 * @param adjuntoId ID del adjunto
 */
export const deleteAdjuntoInformeJuridico = async (
  medidaId: number,
  adjuntoId: number
): Promise<void> => {
  try {
    console.log(
      `Deleting adjunto informe jurídico: medida ${medidaId}, adjunto ${adjuntoId}`
    )

    // Uses remove() for DELETE request
    await remove(`medidas/${medidaId}/informe-juridico/adjuntos`, adjuntoId)

    console.log("Adjunto informe jurídico deleted successfully")
  } catch (error: any) {
    console.error(
      `Error deleting adjunto informe jurídico: medida ${medidaId}, adjunto ${adjuntoId}`,
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the informe jurídico for a medida (should be only one active)
 *
 * @param medidaId ID de la medida
 * @returns Informe jurídico or null if none exist
 */
export const getInformeJuridicoByMedida = async (
  medidaId: number
): Promise<InformeJuridicoBasicResponse | null> => {
  try {
    const informes = await getInformesJuridicosByMedida(medidaId, {
      ordering: '-fecha_creacion',
      limit: 1,
    })

    return informes.length > 0 ? informes[0] : null
  } catch (error) {
    console.error(`Error getting informe jurídico for medida ${medidaId}:`, error)
    return null
  }
}

/**
 * Check if a medida has informe jurídico
 *
 * @param medidaId ID de la medida
 * @returns true if medida has informe jurídico
 */
export const hasInformeJuridico = async (medidaId: number): Promise<boolean> => {
  try {
    const informes = await getInformesJuridicosByMedida(medidaId, { limit: 1 })
    return informes.length > 0
  } catch (error) {
    console.error(`Error checking if medida ${medidaId} has informe jurídico:`, error)
    return false
  }
}

/**
 * Check if informe jurídico can be sent (has informe oficial and not already sent)
 *
 * @param medidaId ID de la medida
 * @returns true if informe can be sent
 */
export const canSendInformeJuridico = async (medidaId: number): Promise<boolean> => {
  try {
    const informe = await getInformeJuridicoByMedida(medidaId)
    if (!informe) return false
    if (informe.enviado) return false
    if (!informe.tiene_informe_oficial) return false
    return true
  } catch (error) {
    console.error(`Error checking if informe jurídico can be sent for medida ${medidaId}:`, error)
    return false
  }
}
