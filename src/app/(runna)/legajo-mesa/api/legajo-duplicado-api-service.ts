/**
 * API Service for Legajo Duplicate Detection
 * Connects to duplicate detection endpoints from LEG-01
 * Based on RUNNA API (6).yaml specification
 */

import { get, create } from "@/app/api/apiService"
import type {
  DuplicateSearchRequest,
  DuplicateSearchResponse,
  VincularDemandaRequest,
  VincularDemandaResponse,
  CrearConDuplicadoRequest,
  CrearConDuplicadoResponse,
} from "../types/legajo-duplicado-types"
import { DUPLICATE_THRESHOLDS } from "@/components/forms/constants/duplicate-thresholds"

/**
 * Busca duplicados de legajo basándose en datos del NNyA
 * POST /api/legajos/buscar-duplicados/
 *
 * @param data Datos del NNyA para buscar
 * @returns Respuesta con matches encontrados y scores
 *
 * @example
 * ```ts
 * const result = await buscarDuplicados({
 *   dni: 12345678,
 *   nombre: "Juan",
 *   apellido: "Pérez",
 *   fecha_nacimiento: "2010-03-15"
 * })
 *
 * if (result.duplicados_encontrados) {
 *   console.log(`Encontrados ${result.total_matches} matches`)
 *   console.log(`Match más alto: ${result.matches[0].score}`)
 * }
 * ```
 */
export const buscarDuplicados = async (
  data: DuplicateSearchRequest
): Promise<DuplicateSearchResponse> => {
  try {
    // Validación básica de datos requeridos
    if (!data.nombre || !data.apellido) {
      throw new Error("Se requiere al menos nombre y apellido para buscar duplicados")
    }

    console.log("Buscando duplicados con datos:", data)

    // Preparar payload limpio (remover valores null/undefined)
    const payload: Record<string, any> = {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
    }

    if (data.dni) {
      payload.dni = data.dni
    }

    if (data.fecha_nacimiento) {
      payload.fecha_nacimiento = data.fecha_nacimiento
    }

    if (data.genero) {
      payload.genero = data.genero
    }

    if (data.nombre_autopercibido) {
      payload.nombre_autopercibido = data.nombre_autopercibido.trim()
    }

    // Make API call - Using 'create' since it's a POST endpoint
    const response = await create<DuplicateSearchResponse>(
      "legajos/buscar-duplicados",
      payload
    )

    console.log("Duplicados encontrados:", response)

    return response
  } catch (error: any) {
    console.error("Error buscando duplicados:", error)

    // Handle specific error cases
    if (error?.response?.status === 400) {
      console.error("Datos insuficientes para búsqueda")
      throw new Error("Se requieren más datos para realizar la búsqueda de duplicados")
    }

    if (error?.response?.status === 500) {
      console.error("Error del servidor")
      throw new Error("Error en el servidor. Por favor, intente nuevamente más tarde.")
    }

    throw error
  }
}

/**
 * Vincula una demanda a un legajo existente
 * POST /api/legajos/{legajo_id}/vincular-demanda/
 *
 * @param legajoId ID del legajo al que se vinculará la demanda
 * @param data Datos de vinculación
 * @returns Respuesta de vinculación exitosa
 *
 * @example
 * ```ts
 * const result = await vincularDemandaALegajo(1234, {
 *   demanda_id: 9876,
 *   actualizar_datos_nnya: true,
 *   campos_actualizar: ["telefono", "localidad"]
 * })
 *
 * if (result.vinculacion_exitosa) {
 *   console.log("Demanda vinculada exitosamente")
 * }
 * ```
 */
export const vincularDemandaALegajo = async (
  legajoId: number,
  data: VincularDemandaRequest
): Promise<VincularDemandaResponse> => {
  try {
    console.log(`Vinculando demanda ${data.demanda_id} a legajo ${legajoId}`)

    // Make API call
    const response = await create<VincularDemandaResponse>(
      `legajos/${legajoId}/vincular-demanda`,
      data
    )

    console.log("Vinculación exitosa:", response)

    return response
  } catch (error: any) {
    console.error("Error vinculando demanda:", error)

    // Handle specific error cases
    if (error?.response?.status === 403) {
      const errorData = error.response.data
      throw new Error(
        errorData?.error || "No tiene permisos para vincular a este legajo"
      )
    }

    if (error?.response?.status === 404) {
      throw new Error("Legajo no encontrado")
    }

    throw error
  }
}

/**
 * Crea un nuevo legajo confirmando que se ignora un duplicado existente
 * POST /api/legajos/crear-con-duplicado-confirmado/
 *
 * @param data Datos para creación con justificación
 * @returns Respuesta de creación exitosa con auditoría
 *
 * @example
 * ```ts
 * const result = await crearLegajoConDuplicado({
 *   demanda_id: 9876,
 *   legajo_duplicado_ignorado: 1234,
 *   score_duplicado_ignorado: 0.95,
 *   justificacion: "Son hermanos con mismo apellido pero DNI diferente...",
 *   confirmacion_usuario: true,
 *   nnya_data: {
 *     nombre: "Santiago",
 *     apellido: "Morales",
 *     dni: 48765432
 *   }
 * })
 *
 * if (result.legajo_creado) {
 *   console.log(`Nuevo legajo creado: ${result.legajo_numero}`)
 * }
 * ```
 */
export const crearLegajoConDuplicado = async (
  data: CrearConDuplicadoRequest
): Promise<CrearConDuplicadoResponse> => {
  try {
    // Validación de justificación
    if (!data.justificacion || data.justificacion.trim().length < 20) {
      throw new Error("La justificación debe tener al menos 20 caracteres")
    }

    console.log("Creando legajo con confirmación de duplicado:", {
      demanda_id: data.demanda_id,
      legajo_ignorado: data.legajo_duplicado_ignorado,
      score: data.score_duplicado_ignorado,
    })

    // Make API call
    const response = await create<CrearConDuplicadoResponse>(
      "legajos/crear-con-duplicado-confirmado",
      data
    )

    console.log("Legajo creado con auditoría:", response)

    return response
  } catch (error: any) {
    console.error("Error creando legajo con duplicado:", error)

    // Handle specific error cases
    if (error?.response?.status === 403) {
      const errorData = error.response.data
      throw new Error(
        errorData?.error || "Sin permisos suficientes para forzar creación de legajo"
      )
    }

    if (error?.response?.status === 400) {
      const errorData = error.response.data
      if (errorData?.error?.includes("Justificación")) {
        throw new Error("Justificación insuficiente. Debe tener al menos 20 caracteres.")
      }
      throw new Error(errorData?.error || "Datos inválidos para creación de legajo")
    }

    throw error
  }
}

/**
 * Valida que los datos sean suficientes para realizar búsqueda
 * @param data Datos del NNyA
 * @returns true si los datos son válidos
 */
export const validarDatosParaBusqueda = (data: Partial<DuplicateSearchRequest>): boolean => {
  // Mínimo requerido: nombre Y apellido
  if (!data.nombre || !data.apellido) {
    return false
  }

  // Nombre y apellido no pueden ser solo espacios
  if (data.nombre.trim().length === 0 || data.apellido.trim().length === 0) {
    return false
  }

  return true
}

/**
 * Valida que el DNI tenga el formato correcto (8 dígitos)
 * @param dni DNI a validar
 * @returns true si el DNI es válido
 */
export const validarDNI = (dni: number | null | undefined): boolean => {
  if (!dni) return false

  const dniStr = dni.toString()
  return dniStr.length === 8 && /^\d{8}$/.test(dniStr)
}

/**
 * Determina si se debe ejecutar una búsqueda de duplicados
 * basándose en los datos disponibles
 *
 * @param data Datos del NNyA
 * @returns true si se debe buscar
 */
export const debeEjecutarBusqueda = (data: Partial<DuplicateSearchRequest>): boolean => {
  // Si hay DNI válido, siempre buscar
  if (validarDNI(data.dni)) {
    return true
  }

  // Si no hay DNI, verificar que haya al menos nombre + apellido
  return validarDatosParaBusqueda(data)
}

/**
 * Obtiene el color de alerta según el score
 * @param score Score de coincidencia (0.0 - 1.0)
 * @returns Color en formato hex
 */
export const getAlertColor = (score: number): string => {
  if (score >= DUPLICATE_THRESHOLDS.CRITICA) {
    return "#f44336" // red
  }
  if (score >= DUPLICATE_THRESHOLDS.ALTA) {
    return "#ff9800" // orange
  }
  if (score >= DUPLICATE_THRESHOLDS.MEDIA) {
    return "#ffc107" // yellow
  }
  return "#9e9e9e" // grey (no debería llegar aquí)
}

/**
 * Obtiene el nivel de alerta según el score
 * @param score Score de coincidencia (0.0 - 1.0)
 * @returns Nivel de alerta
 */
export const getAlertLevel = (score: number): "CRITICA" | "ALTA" | "MEDIA" | "NINGUNA" => {
  if (score >= DUPLICATE_THRESHOLDS.CRITICA) {
    return "CRITICA"
  }
  if (score >= DUPLICATE_THRESHOLDS.ALTA) {
    return "ALTA"
  }
  if (score >= DUPLICATE_THRESHOLDS.MEDIA) {
    return "MEDIA"
  }
  return "NINGUNA"
}
