// Type definitions for POST /api/registro-demanda-form/ response
// Source: claudedocs/REGISTRO_DEMANDA_RESPONSE_COMPLETO.md

import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"

/**
 * Response from POST /api/registro-demanda-form/
 * Contains all objects created during the demanda registration process
 */
export interface DemandaCreatedResponse {
  demanda: {
    id: number
    estado_demanda: string
    objetivo_de_demanda: "PROTECCION" | "PETICION_DE_INFORME" | "CARGA_OFICIOS"
    envio_de_respuesta: string
    fecha_ingreso_senaf: string | null
  }
  localizacion: {
    id: number
  }
  demanda_score: {
    id: number
  } | null
  demanda_zona: {
    id: number
    zona_id: number
    zona_nombre: string | null
    user_responsable_id: number | null
    esta_activo: boolean
  } | null
  demanda_zona_history: {
    id: number
  } | null
  adjuntos: Array<{
    id: number
    adjunto: string | null
  }>
  personas: Array<{
    id: number
    nombre: string
    apellido: string
    dni: number | null
  }>
  demanda_personas: Array<{
    id: number
    persona_id: number
    vinculo_demanda: string
    vinculo_demanda_display?: string
    conviviente: boolean
    legalmente_responsable: boolean
  }>
  codigos_demanda: Array<{
    id: number
    codigo: string
  }>
  vinculos_legajo: Array<{
    id: number
    legajo_origen_id: number
    legajo_numero: string | null
    medida_destino_id: number | null
    tipo_vinculo_id: number
  }>
  /**
   * Medidas created automatically (only for CARGA_OFICIOS with vinculos)
   */
  medidas_creadas: Array<{
    id: number
    tipo_medida: "MPI" | "MPE" | "MPJ"
    numero_medida: string
    estado_vigencia: string
  }>
  /**
   * Planes de trabajo created automatically (only for CARGA_OFICIOS with vinculos)
   */
  planes_trabajo_creados: Array<{
    id: number
    medida_id: number
  }>
  /**
   * Actividades created automatically (only for CARGA_OFICIOS with vinculos)
   * Uses the full TActividadPlanTrabajo type with all nested info
   */
  actividades_creadas: TActividadPlanTrabajo[]
}

/**
 * Helper to get the count of NNyA (children) from the personas list
 */
export const getNnyaCount = (response: DemandaCreatedResponse): number => {
  return response.demanda_personas.filter(
    (dp) => dp.vinculo_demanda === "NNYA_PRINCIPAL" || dp.vinculo_demanda === "NNYA"
  ).length
}

/**
 * Helper to get the count of adults from the personas list
 */
export const getAdultosCount = (response: DemandaCreatedResponse): number => {
  return response.demanda_personas.filter(
    (dp) => dp.vinculo_demanda !== "NNYA_PRINCIPAL" && dp.vinculo_demanda !== "NNYA"
  ).length
}

/**
 * Objective labels for display
 */
export const OBJETIVO_LABELS: Record<DemandaCreatedResponse["demanda"]["objetivo_de_demanda"], string> = {
  PROTECCION: "Proteccion",
  PETICION_DE_INFORME: "Peticion de Informe",
  CARGA_OFICIOS: "Carga de Oficios",
}
