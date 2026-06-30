/**
 * Tipos TypeScript para gestión de asignación de legajos (BE-06)
 * Basado en RUNNA API endpoints /api/legajo/{id}/derivar, /asignar, etc.
 */

// Tipos de responsabilidad según BE-06
export type TipoResponsabilidad = "TRABAJO" | "CENTRO_VIDA" | "JUDICIAL"

// Tipos de acciones en historial
export type AccionHistorial = "DERIVACION" | "ASIGNACION" | "MODIFICACION" | "DESACTIVACION"

/**
 * Request para derivar legajo a zona
 * POST /api/legajo/{id}/derivar/
 */
export interface DerivacionLegajoRequest {
  zona_destino_id: number
  tipo_responsabilidad: TipoResponsabilidad
  comentarios?: string
  notificar_equipo?: boolean
}

/**
 * Request para asignar responsable específico
 * POST /api/legajo/{id}/asignar/
 */
export interface AsignacionLegajoRequest {
  tipo_responsabilidad: TipoResponsabilidad
  user_responsable_id: number
  local_centro_vida_id?: number // Obligatorio solo para CENTRO_VIDA
  comentarios?: string
  crear_actividad_pltm?: boolean // Fase futura
}

/**
 * Request para reasignar responsable existente
 * PATCH /api/legajo/{id}/reasignar/
 */
export interface ReasignacionLegajoRequest {
  tipo_responsabilidad: TipoResponsabilidad
  user_responsable_id: number // Nuevo responsable
  comentarios?: string
}

/**
 * Request para re-derivar a otra zona
 * POST /api/legajo/{id}/rederivar/
 */
export interface RederivacionLegajoRequest {
  tipo_responsabilidad: TipoResponsabilidad
  zona_destino_id: number
  comentarios?: string
}

/**
 * Zona básica
 */
export interface Zona {
  id: number
  nombre: string
  codigo?: string | null
}

/**
 * Usuario básico
 */
export interface Usuario {
  id: number
  username: string
  first_name: string
  last_name: string
  nombre_completo?: string
  email: string
}

/**
 * Local de Centro de Vida
 */
export interface LocalCentroVida {
  id: number
  nombre: string
  direccion?: string
  localidad?: {
    id: number
    nombre: string
  }
  zona?: Zona
  tipo: "HOGAR" | "INSTITUCION" | "FAMILIA_AMPLIADA" | "FAMILIA_ACOGEDORA" | "OTRO"
  activo: boolean
}

/**
 * Registro de historial de asignación
 * Response de GET /api/legajo/{id}/historial-asignaciones/
 */
export interface HistorialAsignacion {
  id: number
  legajo: number
  zona: number // ID de la zona
  zona_nombre: string // Nombre de la zona
  tipo_responsabilidad: TipoResponsabilidad
  user_responsable: number | null // ID del usuario responsable
  user_responsable_nombre: string | null // Nombre del usuario
  local_centro_vida: number | null // ID del local
  accion: AccionHistorial
  comentarios: string
  fecha_accion: string
  realizado_por: number // ID del usuario que realizó la acción
  realizado_por_nombre: string // Nombre del usuario
  legajo_zona_anterior: number | null
  legajo_zona_nuevo: number | null
}

/**
 * Estado actual de asignación por tipo
 * Para mostrar en el modal
 */
export interface AsignacionActual {
  tipo_responsabilidad: TipoResponsabilidad
  zona?: Zona
  user_responsable?: Usuario
  local_centro_vida?: LocalCentroVida
  esta_activo: boolean
  fecha_asignacion?: string
}

/**
 * Response del backend para asignaciones
 */
export interface AsignacionResponse {
  id: number
  legajo: number
  zona: Zona
  tipo_responsabilidad: TipoResponsabilidad
  user_responsable?: Usuario
  local_centro_vida?: LocalCentroVida
  esta_activo: boolean
  recibido: boolean
  comentarios?: string
  enviado_por?: Usuario
  recibido_por?: Usuario
  fecha_creacion: string
  fecha_actualizacion: string
}

// ============================================
// NUEVO CONTRATO (flujo único de asignaciones)
// ============================================

/**
 * Claves de las dos categorías de asignación.
 * Se elimina "judicial"/legales.
 */
export type CategoriaAsignacionKey = "trabajo" | "centro_vida"

/**
 * Referencia mínima de zona en la respuesta agrupada
 */
export interface ZonaRef {
  id: number
  nombre: string
}

/**
 * Referencia mínima de usuario en la respuesta agrupada
 */
export interface UsuarioRef {
  id: number
  nombre_completo: string
}

/**
 * Estado de una categoría tal como lo devuelve el backend
 * GET /api/legajo/{id}/
 */
export interface CategoriaAsignacionResponse {
  zonas: ZonaRef[]
  usuarios: UsuarioRef[]
}

/**
 * Bloque agrupado de asignaciones por categoría
 */
export interface AsignacionesAgrupadas {
  trabajo: CategoriaAsignacionResponse
  centro_vida: CategoriaAsignacionResponse
}

/**
 * Respuesta de GET /api/legajo/{id}/ (campos relevantes para asignación)
 */
export interface LegajoAsignacionesResponse {
  id: number
  numero?: string | number
  nnya?: any
  asignaciones: AsignacionesAgrupadas
  [key: string]: any
}

/**
 * Estado deseado de una categoría a enviar al backend (sólo IDs)
 */
export interface CategoriaAsignacion {
  zonas: number[]
  usuarios: number[]
}

/**
 * Request del flujo único.
 * PUT /api/legajo/{id}/asignaciones/
 * Cada categoría es opcional; enviar lista vacía desactiva todo lo de esa categoría.
 */
export interface SincronizarAsignacionesRequest {
  trabajo?: CategoriaAsignacion
  centro_vida?: CategoriaAsignacion
  comentarios?: string
}

/**
 * Respuesta del flujo único
 * PUT /api/legajo/{id}/asignaciones/
 */
export interface SincronizarAsignacionesResponse {
  cambios: Record<string, any>
  asignaciones: AsignacionesAgrupadas
}
