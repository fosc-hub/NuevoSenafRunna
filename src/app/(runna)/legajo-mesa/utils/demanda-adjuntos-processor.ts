/**
 * Utility to process demanda adjuntos and route them to oficios and documentos
 */

import type { DemandaFullDetailResponse } from "../types/demanda-api"

// Oficio structure expected by OficiosSection
export interface ProcessedOficio {
  id: number | string
  tipo: string
  numero?: string
  estado: string
  vencimiento: string
  semaforo: "verde" | "amarillo" | "rojo"
  archivo_url?: string
  demanda_id?: number
  tipo_oficio?: string
}

// Documento structure expected by DocumentosSection
export interface ProcessedDocumento {
  id: number | string
  nombre: string
  descripcion?: string
  tipo: string
  subido_por?: {
    nombre_completo: string
  }
  fecha_subida: string
  tamaño?: number
  archivo_url: string
  demanda_id?: number
  evaluacion_id?: number
}

/**
 * Calculate semaforo status based on vencimiento date
 * @param vencimiento ISO date string
 * @returns Semaforo status
 */
const calculateSemaforo = (vencimiento: string): "verde" | "amarillo" | "rojo" => {
  try {
    const today = new Date()
    const vencimientoDate = new Date(vencimiento)
    const diffDays = Math.ceil(
      (vencimientoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays < 0) return "rojo" // Vencido
    if (diffDays <= 7) return "amarillo" // Próximo a vencer
    return "verde" // A tiempo
  } catch {
    return "verde" // Default to verde if date parsing fails
  }
}

/**
 * Extract file name from URL
 * @param url File URL
 * @returns File name
 */
const extractFileName = (url: string): string => {
  try {
    const urlParts = url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    return decodeURIComponent(fileName)
  } catch {
    return "documento.pdf"
  }
}

/**
 * Process root-level adjuntos and convert them to oficios
 * @param demandaDetail Full demanda detail response
 * @returns Array of processed oficios
 */
export const processAdjuntosToOficios = (
  demandaDetail: DemandaFullDetailResponse
): ProcessedOficio[] => {
  const oficios: ProcessedOficio[] = []

  // Process root-level adjuntos
  demandaDetail.adjuntos.forEach((adjunto, index) => {
    const oficio: ProcessedOficio = {
      id: `demanda-${demandaDetail.id}-oficio-${index}`,
      tipo: demandaDetail.tipo_oficio?.nombre || "Oficio",
      tipo_oficio: demandaDetail.tipo_oficio?.nombre || "Oficio",
      numero: demandaDetail.id.toString(),
      estado: demandaDetail.estado_demanda || "ACTIVO",
      // Use fecha_oficio_documento as vencimiento, or calculate 90 days from fecha_ingreso_senaf
      vencimiento: demandaDetail.fecha_oficio_documento || demandaDetail.fecha_ingreso_senaf,
      semaforo: calculateSemaforo(
        demandaDetail.fecha_oficio_documento || demandaDetail.fecha_ingreso_senaf
      ),
      archivo_url: adjunto.archivo,
      demanda_id: demandaDetail.id,
    }

    oficios.push(oficio)
  })

  return oficios
}

/**
 * Process evaluaciones adjuntos and convert them to documentos
 * @param demandaDetail Full demanda detail response
 * @returns Array of processed documentos
 */
export const processAdjuntosToDocumentos = (
  demandaDetail: DemandaFullDetailResponse
): ProcessedDocumento[] => {
  const documentos: ProcessedDocumento[] = []

  // Process adjuntos nested in evaluaciones
  demandaDetail.evaluaciones.forEach((evaluacion) => {
    evaluacion.adjuntos.forEach((adjunto, index) => {
      const fileName = extractFileName(adjunto.archivo)

      const documento: ProcessedDocumento = {
        id: `demanda-${demandaDetail.id}-evaluacion-${evaluacion.id}-doc-${index}`,
        nombre: fileName,
        descripcion: `Evaluación por ${evaluacion.rol_usuario} - ${evaluacion.solicitud_tecnico}`,
        tipo: "Evaluación",
        subido_por: {
          nombre_completo: evaluacion.nombre_usuario || "Usuario desconocido",
        },
        fecha_subida: evaluacion.fecha_y_hora,
        archivo_url: adjunto.archivo,
        demanda_id: demandaDetail.id,
        evaluacion_id: evaluacion.id,
      }

      documentos.push(documento)
    })
  })

  return documentos
}

/**
 * Process all demandas and extract oficios and documentos
 * @param demandasDetails Array of full demanda details
 * @returns Object with oficios and documentos arrays
 */
export const processDemandaAdjuntos = (
  demandasDetails: DemandaFullDetailResponse[]
): {
  oficios: ProcessedOficio[]
  documentos: ProcessedDocumento[]
} => {
  const allOficios: ProcessedOficio[] = []
  const allDocumentos: ProcessedDocumento[] = []

  demandasDetails.forEach((demandaDetail) => {
    // Process root-level adjuntos to oficios
    const oficios = processAdjuntosToOficios(demandaDetail)
    allOficios.push(...oficios)

    // Process evaluaciones adjuntos to documentos
    const documentos = processAdjuntosToDocumentos(demandaDetail)
    allDocumentos.push(...documentos)
  })

  return {
    oficios: allOficios,
    documentos: allDocumentos,
  }
}
