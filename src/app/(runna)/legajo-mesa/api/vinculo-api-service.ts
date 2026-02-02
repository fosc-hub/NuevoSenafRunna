/**
 * API Service for Vinculación Justificada de Legajos
 * LEG-01 V2 - Explicit legajo-to-legajo/medida/demanda linking with justification
 * Based on RUNNA API (9).yaml specification
 *
 * API Endpoints:
 * - GET  /api/tipos-vinculo/           - List all link types
 * - GET  /api/vinculos-legajo/         - List vinculos with filters
 * - POST /api/vinculos-legajo/         - Create new vinculo
 * - GET  /api/vinculos-legajo/{id}/    - Get vinculo detail
 * - POST /api/vinculos-legajo/{id}/desvincular/ - Soft delete with justification
 */

import { get, getWithCustomParams, create } from "@/app/api/apiService"
import type {
  TTipoVinculo,
  TVinculoLegajoCreate,
  TVinculoLegajoDetail,
  TVinculoLegajoList,
  DesvincularVinculoRequest,
  DesvincularVinculoResponse,
  VinculosLegajoQueryParams,
  PaginatedResponse,
  TipoDestino,
  TipoVinculoCodigo,
} from "../types/vinculo-types"
import { MIN_CARACTERES_JUSTIFICACION_VINCULO } from "../types/vinculo-types"

// ============================================================================
// TIPO VINCULO (CATALOG)
// ============================================================================

/**
 * Obtiene todos los tipos de vínculo disponibles
 * GET /api/tipos-vinculo/
 *
 * @returns Array de tipos de vínculo
 *
 * @example
 * ```ts
 * const tipos = await getTiposVinculo()
 * console.log(`Tipos disponibles: ${tipos.length}`)
 * // Tipos: HERMANOS, MISMO_CASO_JUDICIAL, MEDIDAS_RELACIONADAS, TRANSFERENCIA
 * ```
 */
export const getTiposVinculo = async (): Promise<TTipoVinculo[]> => {
  try {
    console.log("Obteniendo tipos de vínculo...")

    const response = await get<TTipoVinculo[] | PaginatedResponse<TTipoVinculo>>("tipos-vinculo/?page_size=500")

    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      console.log(`Tipos de vínculo obtenidos: ${response.length} (array format)`)
      return response
    }

    // Handle paginated response
    if (response && 'results' in response && Array.isArray(response.results)) {
      console.log(`Tipos de vínculo obtenidos: ${response.results.length} de ${response.count} (paginated format)`)
      return response.results
    }

    console.warn("Respuesta inválida de tipos de vínculo:", response)
    return []
  } catch (error: any) {
    console.error("Error obteniendo tipos de vínculo:", error)

    if (error?.response?.status === 500) {
      throw new Error("Error del servidor. Por favor, intente nuevamente más tarde.")
    }

    throw error
  }
}

/**
 * Obtiene un tipo de vínculo específico por código
 * @param codigo Código del tipo de vínculo
 * @returns Tipo de vínculo o undefined
 */
export const getTipoVinculoByCodigo = async (
  codigo: TipoVinculoCodigo
): Promise<TTipoVinculo | undefined> => {
  const tipos = await getTiposVinculo()
  return tipos.find((tipo) => tipo.codigo === codigo)
}

// ============================================================================
// VINCULOS CRUD
// ============================================================================

/**
 * Lista vínculos de legajo con filtros opcionales
 * GET /api/vinculos-legajo/
 *
 * @param params Parámetros de filtrado y paginación
 * @returns Respuesta paginada con lista de vínculos
 *
 * @example
 * ```ts
 * // Obtener todos los vínculos activos de un legajo
 * const result = await getVinculos({
 *   legajo_origen: 1234,
 *   activo: true
 * })
 *
 * // Filtrar por tipo específico
 * const hermanos = await getVinculos({
 *   legajo_origen: 1234,
 *   tipo_vinculo: "HERMANOS"
 * })
 *
 * // Filtrar por tipo de destino
 * const vinculosAMedidas = await getVinculos({
 *   legajo_origen: 1234,
 *   tipo_destino: "medida"
 * })
 * ```
 */
export const getVinculos = async (
  params?: VinculosLegajoQueryParams
): Promise<PaginatedResponse<TVinculoLegajoList>> => {
  try {
    console.log("Obteniendo vínculos con filtros:", params)

    // Build query parameters
    const queryParams: Record<string, string> = {}

    if (params?.legajo_origen) {
      queryParams.legajo_origen = params.legajo_origen.toString()
    }

    if (params?.legajo_destino) {
      queryParams.legajo_destino = params.legajo_destino.toString()
    }

    if (params?.medida_destino) {
      queryParams.medida_destino = params.medida_destino.toString()
    }

    if (params?.demanda_destino) {
      queryParams.demanda_destino = params.demanda_destino.toString()
    }

    if (params?.tipo_vinculo) {
      queryParams.tipo_vinculo = params.tipo_vinculo
    }

    if (params?.tipo_destino) {
      queryParams.tipo_destino = params.tipo_destino
    }

    if (params?.activo !== undefined) {
      queryParams.activo = params.activo.toString()
    }

    if (params?.page) {
      queryParams.page = params.page.toString()
    }

    if (params?.page_size) {
      queryParams.page_size = params.page_size.toString()
    }

    console.log('Query params being sent:', queryParams)

    const response = await get<PaginatedResponse<TVinculoLegajoList> | TVinculoLegajoList[]>(
      "vinculos-legajo/",
      queryParams
    )

    console.log('Raw response:', response)
    console.log('Response type:', Array.isArray(response) ? 'array' : 'object')

    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      // Backend returned plain array, convert to paginated format
      console.log(`Vínculos obtenidos: ${response.length} (array format)`)
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      }
    }

    if (!response) {
      console.warn("Respuesta inválida de vínculos:", response)
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      }
    }

    // Backend returned paginated response
    console.log(`Vínculos obtenidos: ${response.results?.length || 0} de ${response.count || 0}`)
    console.log('Response results:', response.results)

    return response
  } catch (error: any) {
    console.error("Error obteniendo vínculos:", error)

    if (error?.response?.status === 400) {
      const errorData = error.response.data
      throw new Error(errorData?.detail || "Parámetros de búsqueda inválidos")
    }

    if (error?.response?.status === 500) {
      throw new Error("Error del servidor. Por favor, intente nuevamente más tarde.")
    }

    throw error
  }
}

/**
 * Obtiene el detalle completo de un vínculo específico
 * GET /api/vinculos-legajo/{id}/
 *
 * @param vinculoId ID del vínculo
 * @returns Detalle completo del vínculo con audit trail
 *
 * @example
 * ```ts
 * const vinculo = await getVinculoDetail(123)
 * console.log(`Vínculo ${vinculo.tipo_vinculo.nombre}`)
 * console.log(`Creado por: ${vinculo.creado_por_info}`)
 * console.log(`Estado: ${vinculo.activo ? 'Activo' : 'Desvinculado'}`)
 * ```
 */
export const getVinculoDetail = async (vinculoId: number): Promise<TVinculoLegajoDetail> => {
  try {
    console.log(`Obteniendo detalle de vínculo ${vinculoId}`)

    const response = await get<TVinculoLegajoDetail>(`vinculos-legajo/${vinculoId}/`)

    console.log("Detalle de vínculo obtenido:", response)

    return response
  } catch (error: any) {
    console.error("Error obteniendo detalle de vínculo:", error)

    if (error?.response?.status === 404) {
      throw new Error("Vínculo no encontrado")
    }

    if (error?.response?.status === 403) {
      throw new Error("No tiene permisos para ver este vínculo")
    }

    if (error?.response?.status === 500) {
      throw new Error("Error del servidor. Por favor, intente nuevamente más tarde.")
    }

    throw error
  }
}

/**
 * Crea un nuevo vínculo entre legajo y otra entidad
 * POST /api/vinculos-legajo/
 *
 * @param data Datos del vínculo a crear
 * @returns Vínculo creado con ID asignado
 *
 * Business Rules:
 * 1. Must specify ONE destination entity (legajo_destino, medida_destino, or demanda_destino)
 * 2. justificacion is REQUIRED with minimum 20 characters
 * 3. legajo_origen and tipo_vinculo are REQUIRED
 * 4. Cannot link a legajo to itself
 *
 * @example
 * ```ts
 * // Vincular hermanos
 * const vinculo = await createVinculo({
 *   legajo_origen: 1234,
 *   legajo_destino: 5678,
 *   tipo_vinculo: 1, // HERMANOS
 *   justificacion: "Son hermanos confirmados por documentación judicial. Caso #ABC-123."
 * })
 *
 * // Vincular a medida
 * const vinculoMedida = await createVinculo({
 *   legajo_origen: 1234,
 *   medida_destino: 9876,
 *   tipo_vinculo: 3, // MEDIDAS_RELACIONADAS
 *   justificacion: "Medida relacionada al mismo caso judicial. Expediente #XYZ-456."
 * })
 * ```
 */
export const createVinculo = async (
  data: TVinculoLegajoCreate
): Promise<TVinculoLegajoDetail> => {
  try {
    // Validación de justificación
    if (!data.justificacion || data.justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO) {
      throw new Error(
        `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
      )
    }

    // Validación de destino único
    const destinosProvided = [
      data.legajo_destino,
      data.medida_destino,
      data.demanda_destino,
    ].filter((d) => d !== null && d !== undefined)

    if (destinosProvided.length === 0) {
      throw new Error(
        "Debe especificar un destino: legajo_destino, medida_destino o demanda_destino"
      )
    }

    if (destinosProvided.length > 1) {
      throw new Error("Solo puede especificar UN destino por vínculo")
    }

    // Validación de no vincular a sí mismo
    if (data.legajo_destino && data.legajo_destino === data.legajo_origen) {
      throw new Error("No se puede vincular un legajo a sí mismo")
    }

    console.log("Creando vínculo:", {
      legajo_origen: data.legajo_origen,
      tipo_vinculo: data.tipo_vinculo,
      destino: data.legajo_destino || data.medida_destino || data.demanda_destino,
    })

    // Make API call
    const response = await create<TVinculoLegajoDetail>("vinculos-legajo", data, true, "¡Vínculo creado exitosamente!")

    console.log("Vínculo creado:", response)

    return response
  } catch (error: any) {
    console.error("Error creando vínculo:", error)

    // Handle specific error cases
    if (error?.response?.status === 400) {
      const errorData = error.response.data
      if (errorData?.justificacion) {
        throw new Error(
          `Justificación: ${errorData.justificacion[0] || "Justificación insuficiente (mínimo 20 caracteres)"}`
        )
      }
      if (errorData?.detail) {
        throw new Error(errorData.detail)
      }
      throw new Error("Datos inválidos para crear vínculo")
    }

    if (error?.response?.status === 403) {
      throw new Error("No tiene permisos para crear vínculos")
    }

    if (error?.response?.status === 404) {
      throw new Error("Legajo origen o destino no encontrado")
    }

    if (error?.response?.status === 409) {
      throw new Error("El vínculo ya existe o hay un conflicto con vínculos existentes")
    }

    throw error
  }
}

/**
 * Desvincula (soft delete) un vínculo existente
 * POST /api/vinculos-legajo/{id}/desvincular/
 *
 * @param vinculoId ID del vínculo a desvincular
 * @param data Justificación del desvínculo (min 20 chars)
 * @returns Vínculo actualizado con datos de desvínculo
 *
 * Business Rule: justificacion_desvincular is REQUIRED with minimum 20 characters
 *
 * @example
 * ```ts
 * const vinculo = await desvincularVinculo(123, {
 *   justificacion_desvincular: "Error en vinculación. Revisión de expediente judicial determinó que no son hermanos."
 * })
 *
 * console.log(`Vínculo desvinculado por: ${vinculo.vinculo.desvinculado_por_info}`)
 * console.log(`Fecha: ${vinculo.vinculo.desvinculado_en}`)
 * ```
 */
export const desvincularVinculo = async (
  vinculoId: number,
  data: DesvincularVinculoRequest
): Promise<DesvincularVinculoResponse> => {
  try {
    // Validación de justificación
    if (
      !data.justificacion_desvincular ||
      data.justificacion_desvincular.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO
    ) {
      throw new Error(
        `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
      )
    }

    console.log(`Desvinculando vínculo ${vinculoId}`)

    // Make API call - Using 'create' since it's a POST endpoint
    const response = await create<DesvincularVinculoResponse>(
      `vinculos-legajo/${vinculoId}/desvincular`,
      data,
      true,
      "¡Vínculo desvinculado exitosamente!"
    )

    console.log("Vínculo desvinculado:", response)

    return response
  } catch (error: any) {
    console.error("Error desvinculando vínculo:", error)

    // Handle specific error cases
    if (error?.response?.status === 400) {
      const errorData = error.response.data
      if (errorData?.justificacion_desvincular) {
        throw new Error(
          `Justificación: ${errorData.justificacion_desvincular[0] || "Justificación insuficiente (mínimo 20 caracteres)"}`
        )
      }
      if (errorData?.detail) {
        throw new Error(errorData.detail)
      }
      throw new Error("Vínculo ya desvinculado o datos inválidos")
    }

    if (error?.response?.status === 403) {
      throw new Error("No tiene permisos para desvincular este vínculo")
    }

    if (error?.response?.status === 404) {
      throw new Error("Vínculo no encontrado")
    }

    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Valida que la justificación tenga el largo mínimo
 * @param justificacion Texto de justificación
 * @returns true si la justificación es válida
 */
export const validarJustificacion = (justificacion: string | null | undefined): boolean => {
  if (!justificacion) return false
  return justificacion.trim().length >= MIN_CARACTERES_JUSTIFICACION_VINCULO
}

/**
 * Determina el tipo de destino basándose en los campos provistos
 * @param data Datos del vínculo
 * @returns Tipo de destino o null
 */
export const getTipoDestinoFromData = (
  data: TVinculoLegajoCreate
): TipoDestino | null => {
  if (data.legajo_destino) return "legajo"
  if (data.medida_destino) return "medida"
  if (data.demanda_destino) return "demanda"
  return null
}

/**
 * Valida que los datos de creación sean completos y correctos
 * @param data Datos del vínculo
 * @returns Mensajes de error o array vacío si es válido
 */
export const validateVinculoData = (data: Partial<TVinculoLegajoCreate>): string[] => {
  const errors: string[] = []

  // Validar campos requeridos
  if (!data.legajo_origen) {
    errors.push("Legajo origen es requerido")
  }

  if (!data.tipo_vinculo) {
    errors.push("Tipo de vínculo es requerido")
  }

  if (!data.justificacion) {
    errors.push("Justificación es requerida")
  } else if (!validarJustificacion(data.justificacion)) {
    errors.push(
      `Justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
    )
  }

  // Validar destino único
  const destinosProvided = [
    data.legajo_destino,
    data.medida_destino,
    data.demanda_destino,
  ].filter((d) => d !== null && d !== undefined)

  if (destinosProvided.length === 0) {
    errors.push("Debe especificar un destino")
  }

  if (destinosProvided.length > 1) {
    errors.push("Solo puede especificar UN destino")
  }

  // Validar no vincular a sí mismo
  if (data.legajo_destino && data.legajo_destino === data.legajo_origen) {
    errors.push("No se puede vincular un legajo a sí mismo")
  }

  return errors
}

/**
 * Obtiene vínculos activos de un legajo específico
 * @param legajoId ID del legajo
 * @returns Array de vínculos activos
 */
export const getVinculosActivosByLegajo = async (
  legajoId: number
): Promise<TVinculoLegajoList[]> => {
  const response = await getVinculos({
    legajo_origen: legajoId,
    activo: true,
  })
  return response.results
}

/**
 * Obtiene vínculos de tipo HERMANOS para un legajo
 * @param legajoId ID del legajo
 * @returns Array de vínculos de hermanos
 */
export const getHermanosByLegajo = async (legajoId: number): Promise<TVinculoLegajoList[]> => {
  const response = await getVinculos({
    legajo_origen: legajoId,
    tipo_vinculo: "HERMANOS",
    activo: true,
  })
  return response.results
}

/**
 * Cuenta el número de vínculos activos de un legajo
 * @param legajoId ID del legajo
 * @returns Número de vínculos activos
 */
export const countVinculosActivos = async (legajoId: number): Promise<number> => {
  const response = await getVinculos({
    legajo_origen: legajoId,
    activo: true,
    page_size: 1, // Solo necesitamos el count
  })
  return response.count
}
