/**
 * API Service for Informe de Cierre (MPI)
 *
 * MED-MPI-CIERRE: Closure report workflow for MPI measures
 * Backend endpoints: /api/medidas/{medida_id}/informe-cierre/
 *
 * Simplified Workflow (V2):
 * 1. ET creates informe (Estado 3 → Estado 4 transition)
 * 2. Estado 4 (INFORME_DE_CIERRE_REDACTADO) = 100% progress (terminal state)
 *
 * NOTE: No approval/rejection workflow for MPI Cese.
 * Estado 4 is the final state (100% completion).
 */

import { get, create, put, remove } from "@/app/api/apiService"
import type {
  InformeCierre,
  InformeCierreAdjunto,
  CreateInformeCierreRequest,
  RechazarCierreRequest,
  TipoInformeCierreAdjunto,
  AprobarCierreResponse,
  RechazarCierreResponse,
  InformeCierreQueryParams,
} from "../types/informe-cierre-api"

// ============================================================================
// INFORME DE CIERRE CRUD
// ============================================================================

/**
 * Get informes de cierre for a medida
 * GET /api/medidas/{medida_id}/informe-cierre/
 *
 * @param medidaId ID de la medida MPI
 * @returns Array of informes de cierre (active and historical)
 */
export const getInformesCierre = async (
  medidaId: number
): Promise<InformeCierre[]> => {
  try {
    console.log(`Fetching informes cierre for medida ${medidaId}`)

    const response = await get<InformeCierre[]>(
      `medidas/${medidaId}/informe-cierre/`
    )

    console.log("Informes cierre retrieved:", response)
    return response
  } catch (error: any) {
    console.error(`Error fetching informes cierre for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Get active informe de cierre for a medida
 * Convenience function to get only the active informe
 *
 * @param medidaId ID de la medida MPI
 * @returns Active informe or null
 */
export const getInformeCierreActivo = async (
  medidaId: number
): Promise<InformeCierre | null> => {
  try {
    const informes = await getInformesCierre(medidaId)
    const informeActivo = informes.find((i) => i.activo)
    return informeActivo || null
  } catch (error) {
    console.error("Error getting active informe cierre:", error)
    throw error
  }
}

/**
 * Create informe de cierre
 * POST /api/medidas/{medida_id}/informe-cierre/
 *
 * IMPORTANT: This triggers automatic state transition Estado 3 → Estado 4
 * Estado 4 (INFORME_DE_CIERRE_REDACTADO) represents 100% completion for MPI Cese.
 *
 * Validations:
 * - Medida must be MPI
 * - Medida must be in Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE)
 * - Observaciones minimum 20 characters
 * - User must be EQUIPO_TECNICO
 *
 * @param medidaId ID de la medida MPI
 * @param data Observaciones del informe (min 20 chars)
 * @returns Created informe with estado updated to Estado 4 (100% complete)
 */
export const createInformeCierre = async (
  medidaId: number,
  data: CreateInformeCierreRequest
): Promise<InformeCierre> => {
  try {
    console.log(`Creating informe cierre for medida ${medidaId}:`, data)

    // Validate tipo_cese client-side
    if (!data.tipo_cese) {
      throw new Error("Debe seleccionar un tipo de cese")
    }

    // Validate observaciones client-side
    if (data.observaciones.trim().length < 20) {
      throw new Error("Las observaciones deben tener al menos 20 caracteres")
    }

    const response = await create<InformeCierre>(
      `medidas/${medidaId}/informe-cierre`,
      data as any
    )

    console.log("Informe cierre created successfully:", response)
    return response
  } catch (error: any) {
    console.error(`Error creating informe cierre for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// ============================================================================
// APPROVAL / REJECTION ACTIONS - DEPRECATED FOR MPI
// ============================================================================
// NOTE: These functions are deprecated for MPI workflow V2.
// MPI Cese no longer requires JZ approval. Estado 4 = 100% completion.
// Keeping functions for backward compatibility but they should not be used.
// ============================================================================

/**
 * @deprecated No longer used in MPI Cese workflow V2
 *
 * Aprobar cierre de medida (Jefe Zonal)
 * POST /api/medidas/{medida_id}/informe-cierre/aprobar-cierre/
 */
export const aprobarCierre = async (
  medidaId: number
): Promise<AprobarCierreResponse> => {
  console.warn('aprobarCierre is deprecated for MPI. Estado 4 is terminal state.')
  throw new Error('This function is deprecated for MPI Cese workflow V2')
}

/**
 * @deprecated No longer used in MPI Cese workflow V2
 *
 * Rechazar cierre de medida (Jefe Zonal)
 * POST /api/medidas/{medida_id}/informe-cierre/rechazar-cierre/
 */
export const rechazarCierre = async (
  medidaId: number,
  data: RechazarCierreRequest
): Promise<RechazarCierreResponse> => {
  console.warn('rechazarCierre is deprecated for MPI. Estado 4 is terminal state.')
  throw new Error('This function is deprecated for MPI Cese workflow V2')
}

// ============================================================================
// ADJUNTOS (ATTACHMENTS)
// ============================================================================

/**
 * Upload adjunto to informe de cierre
 * POST /api/medidas/{medida_id}/informe-cierre/adjuntos/
 *
 * Validations:
 * - File extension: .pdf, .doc, .docx, .jpg, .jpeg, .png
 * - Max size: 10 MB
 *
 * @param medidaId ID de la medida
 * @param informeCierreId ID del informe de cierre
 * @param file File to upload
 * @param tipo Type of document
 * @param descripcion Optional description
 * @returns Uploaded adjunto details
 */
export const uploadAdjuntoInformeCierre = async (
  medidaId: number,
  informeCierreId: number,
  file: File,
  tipo: TipoInformeCierreAdjunto,
  descripcion?: string
): Promise<InformeCierreAdjunto> => {
  try {
    console.log(`Uploading adjunto for informe ${informeCierreId}:`, {
      fileName: file.name,
      fileSize: file.size,
      tipo,
    })

    // Create FormData
    const formData = new FormData()
    formData.append("archivo", file)
    formData.append("informe_cierre_id", informeCierreId.toString())
    formData.append("tipo", tipo)
    if (descripcion) {
      formData.append("descripcion", descripcion)
    }

    // apiService.create() supports FormData automatically
    const response = await create<InformeCierreAdjunto>(
      `medidas/${medidaId}/informe-cierre/adjuntos/`,
      formData,
      true,
      'Adjunto subido exitosamente'
    )

    console.log("Adjunto uploaded successfully:", response)
    return response
  } catch (error: any) {
    console.error("Error uploading adjunto:", error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * List adjuntos for a medida's informes de cierre
 * GET /api/medidas/{medida_id}/informe-cierre/adjuntos/
 *
 * @param medidaId ID de la medida
 * @param params Optional query filters
 * @returns Array of adjuntos
 */
export const getAdjuntosInformeCierre = async (
  medidaId: number,
  params: InformeCierreQueryParams = {}
): Promise<InformeCierreAdjunto[]> => {
  try {
    const queryParams: Record<string, string> = {}

    if (params.informe_cierre_id) {
      queryParams.informe_cierre_id = String(params.informe_cierre_id)
    }

    if (params.tipo) {
      queryParams.tipo = params.tipo
    }

    console.log(`Fetching adjuntos for medida ${medidaId}:`, queryParams)

    const response = await get<InformeCierreAdjunto[]>(
      `medidas/${medidaId}/informe-cierre/adjuntos/`,
      queryParams
    )

    console.log("Adjuntos retrieved:", response)
    return response
  } catch (error: any) {
    console.error("Error fetching adjuntos:", error)
    throw error
  }
}

/**
 * Delete adjunto from informe de cierre
 * DELETE /api/medidas/{medida_id}/informe-cierre/adjuntos/{adjunto_id}/
 *
 * Permission: Only the user who uploaded the file or Admin
 *
 * @param medidaId ID de la medida
 * @param adjuntoId ID del adjunto to delete
 */
export const deleteAdjuntoInformeCierre = async (
  medidaId: number,
  adjuntoId: number
): Promise<void> => {
  try {
    console.log(`Deleting adjunto ${adjuntoId} from medida ${medidaId}`)

    // Use remove for DELETE request (endpoint format: base/id)
    // Need to construct the path without the adjunto ID at the end
    await remove(
      `medidas/${medidaId}/informe-cierre/adjuntos`,
      adjuntoId
    )

    console.log("Adjunto deleted successfully")
  } catch (error: any) {
    console.error("Error deleting adjunto:", error)
    throw error
  }
}
