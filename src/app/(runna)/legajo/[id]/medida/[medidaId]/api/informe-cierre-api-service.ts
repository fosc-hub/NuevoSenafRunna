/**
 * API Service for Informe de Cierre (MPI)
 *
 * MED-MPI-CIERRE: Closure report workflow for MPI measures
 * Backend endpoints: /api/medidas/{medida_id}/informe-cierre/
 *
 * Workflow:
 * 1. ET creates informe (Estado 3 → Estado 4 transition)
 * 2. JZ approves → medida closes (CERRADA)
 * 3. JZ rejects → back to Estado 3 for corrections
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
 *
 * Validations:
 * - Medida must be MPI
 * - Medida must be in Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE)
 * - Observaciones minimum 20 characters
 * - User must be EQUIPO_TECNICO
 *
 * @param medidaId ID de la medida MPI
 * @param data Observaciones del informe (min 20 chars)
 * @returns Created informe with estado updated to Estado 4
 */
export const createInformeCierre = async (
  medidaId: number,
  data: CreateInformeCierreRequest
): Promise<InformeCierre> => {
  try {
    console.log(`Creating informe cierre for medida ${medidaId}:`, data)

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
// APPROVAL / REJECTION ACTIONS
// ============================================================================

/**
 * Aprobar cierre de medida (Jefe Zonal)
 * POST /api/medidas/{medida_id}/informe-cierre/aprobar-cierre/
 *
 * IMPORTANT: This closes the medida permanently (estado_vigencia = 'CERRADA')
 *
 * Validations:
 * - Medida must be in Estado 4 (INFORME_DE_CIERRE_REDACTADO)
 * - Active informe must exist
 * - User must be Jefe Zonal of the zone
 *
 * Result:
 * - medida.estado_vigencia = 'CERRADA'
 * - medida.fecha_cierre = now()
 * - informe.aprobado_por_jz = true
 * - Last etapa finalized
 *
 * @param medidaId ID de la medida MPI
 * @returns Closed medida details
 */
export const aprobarCierre = async (
  medidaId: number
): Promise<AprobarCierreResponse> => {
  try {
    console.log(`Aprobando cierre for medida ${medidaId}`)

    // Import axiosInstance for custom action endpoint
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // POST to custom action endpoint
    const response = await axiosInstance.post<AprobarCierreResponse>(
      `medidas/${medidaId}/informe-cierre/aprobar-cierre/`,
      {}
    )

    console.log("Cierre aprobado successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error(`Error aprobando cierre for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

/**
 * Rechazar cierre de medida (Jefe Zonal)
 * POST /api/medidas/{medida_id}/informe-cierre/rechazar-cierre/
 *
 * IMPORTANT: This returns medida to Estado 3 for corrections
 *
 * Validations:
 * - Observaciones are required
 * - Medida must be in Estado 4
 * - User must be Jefe Zonal
 *
 * Result:
 * - Medida returns to Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE)
 * - Current informe marked as rechazado and activo=false
 * - New etapa created with observaciones_rechazo
 * - ET notified to make corrections
 *
 * @param medidaId ID de la medida MPI
 * @param data Observaciones explaining rejection reason
 * @returns Updated medida back in Estado 3
 */
export const rechazarCierre = async (
  medidaId: number,
  data: RechazarCierreRequest
): Promise<RechazarCierreResponse> => {
  try {
    console.log(`Rechazando cierre for medida ${medidaId}:`, data)

    // Validate observaciones client-side
    if (!data.observaciones || data.observaciones.trim().length === 0) {
      throw new Error(
        "Las observaciones son obligatorias al rechazar un informe de cierre"
      )
    }

    // Import axiosInstance for custom action endpoint
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // POST to custom action endpoint
    const response = await axiosInstance.post<RechazarCierreResponse>(
      `medidas/${medidaId}/informe-cierre/rechazar-cierre/`,
      data
    )

    console.log("Cierre rechazado successfully:", response.data)
    return response.data
  } catch (error: any) {
    console.error(`Error rechazando cierre for medida ${medidaId}:`, error)
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
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

    // Import axiosInstance to use Django backend API
    const axiosInstance = (await import("@/app/api/utils/axiosInstance")).default

    // Make API call using axiosInstance (goes to Django backend)
    const response = await axiosInstance.post<InformeCierreAdjunto>(
      `medidas/${medidaId}/informe-cierre/adjuntos/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    console.log("Adjunto uploaded successfully:", response.data)
    return response.data
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
