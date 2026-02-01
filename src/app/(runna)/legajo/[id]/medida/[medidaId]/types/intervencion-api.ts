/**
 * API Types for Intervenciones de Medida
 * Based on RUNNA API (6).yaml - TIntervencionMedida schema
 *
 * MED-02: Registro de Intervención
 * - MED-02a: CRUD básico
 * - MED-02b: Transiciones de estado y aprobación
 * - MED-02c: Adjuntos y validaciones avanzadas
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/**
 * Estados posibles de una intervención
 * Estado 1: BORRADOR - ET está completando el registro
 * Estado 2: ENVIADO - ET envió a aprobación, esperando JZ
 * Estado 3: APROBADO - JZ aprobó
 * Estado 4: RECHAZADO - JZ rechazó, vuelve a borrador
 */
export type EstadoIntervencion = 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO'

/**
 * Tipos de adjuntos permitidos (MED-02c)
 */
export type TipoAdjuntoIntervencion = 'MODELO' | 'ACTA' | 'RESPALDO' | 'INFORME'

// ============================================================================
// INTERFACES DE CATÁLOGOS
// ============================================================================

/**
 * Tipo de Dispositivo - Catálogo
 */
export interface TipoDispositivo {
  id: number
  nombre: string
  descripcion?: string
  activo?: boolean
}

/**
 * Motivo de Intervención - Catálogo
 */
export interface MotivoIntervencion {
  id: number
  nombre: string
  descripcion?: string
  activo?: boolean
}

/**
 * Sub-Motivo de Intervención - Catálogo (depende de Motivo)
 */
export interface SubMotivoIntervencion {
  id: number
  motivo_id: number
  nombre: string
  descripcion?: string
  activo?: boolean
}

/**
 * Categoría de Intervención - Catálogo
 */
export interface CategoriaIntervencion {
  id: number
  nombre: string
  descripcion?: string
  activo?: boolean
}

/**
 * Response from /api/categorias/ endpoint
 * Returns both motivos and submotivos in a single call
 */
export interface CategoriasResponse {
  categorias_motivo: CategoriaMotivo[]
  categorias_submotivo: CategoriaSubMotivo[]
}

/**
 * Categoria Motivo from /api/categorias/ endpoint
 */
export interface CategoriaMotivo {
  id: number
  nombre: string
  peso?: number
}

/**
 * Categoria SubMotivo from /api/categorias/ endpoint
 */
export interface CategoriaSubMotivo {
  id: number
  nombre: string
  peso?: number
  motivo: number // ID del motivo al que pertenece
}

// ============================================================================
// ADJUNTOS
// ============================================================================

/**
 * Usuario detalle (usado en subido_por_detalle)
 */
export interface UsuarioDetalle {
  id: number
  nombre_completo: string
  username: string
}

/**
 * Adjunto de Intervención (MED-02c)
 */
export interface AdjuntoIntervencion {
  id: number
  intervencion: number
  tipo: TipoAdjuntoIntervencion
  tipo_display: string
  archivo: string // URL del archivo
  nombre_original: string
  tamaño_bytes: number
  tamaño_mb: number
  extension: string
  descripcion?: string
  url_descarga: string
  subido_por_detalle?: UsuarioDetalle
  fecha_subida: string // ISO datetime
}

/**
 * Request para subir adjunto
 */
export interface UploadAdjuntoRequest {
  tipo: TipoAdjuntoIntervencion
  archivo: File
}

// ============================================================================
// REQUEST (CREATE/UPDATE) - Solo campos que se pueden escribir
// ============================================================================

/**
 * Request para crear o actualizar una intervención
 * POST /api/medidas/{medida_id}/intervenciones/
 * PATCH /api/medidas/{medida_id}/intervenciones/{id}/
 */
export interface CreateIntervencionRequest {
  // Información básica
  medida: number
  fecha_intervencion: string // YYYY-MM-DD

  // Tipo de dispositivo (opcional)
  tipo_dispositivo_id?: number | null
  subtipo_dispositivo?: number | null // FK to TSubtipoDispositivo

  // Tipo de cese (opcional, solo para etapa CESE)
  tipo_cese?: string | null
  subtipo_cese?: string | null

  // Motivo y sub-motivo
  motivo_id: number
  sub_motivo_id?: number | null

  // Categoría e intervención específica
  categoria_intervencion_id: number
  intervencion_especifica: string

  // Descripciones adicionales
  descripcion_detallada?: string | null
  motivo_vulneraciones?: string | null

  // Configuración
  requiere_informes_ampliatorios: boolean
}

/**
 * Request para actualización parcial (PATCH)
 */
export interface UpdateIntervencionRequest extends Partial<CreateIntervencionRequest> { }

// ============================================================================
// RESPONSE (READ) - Todos los campos del backend
// ============================================================================

/**
 * Response completo de una intervención
 * GET /api/medidas/{medida_id}/intervenciones/{id}/
 * También usado en arrays para GET /api/medidas/{medida_id}/intervenciones/
 */
export interface IntervencionResponse {
  // IDs y códigos
  id: number
  codigo_intervencion: string // INT-MED-YYYY-NNNNNN (autogenerado)
  medida: number

  // Estado
  estado: EstadoIntervencion
  estado_display: string

  // Fecha de intervención
  fecha_intervencion: string // YYYY-MM-DD

  // Información del legajo (autocompletada)
  legajo_numero: string
  persona_nombre: string
  persona_apellido: string
  persona_dni: string | null
  zona_nombre: string

  // Tipo de dispositivo (write + read)
  tipo_dispositivo_id?: number | null // writeOnly - para enviar
  tipo_dispositivo_detalle: { id: number; nombre: string } | null // readOnly - lo que retorna
  subtipo_dispositivo?: number | null // FK to TSubtipoDispositivo

  // Motivo (write + read)
  motivo_id: number // writeOnly - para enviar
  motivo_detalle: { id: number; nombre: string } // readOnly - lo que retorna

  // Sub-motivo (write + read)
  sub_motivo_id?: number | null // writeOnly - para enviar
  sub_motivo_detalle: { id: number; nombre: string } | null // readOnly - lo que retorna

  // Categoría (write + read)
  categoria_intervencion_id: number // writeOnly - para enviar
  categoria_intervencion_detalle: { id: number; nombre: string } // readOnly - lo que retorna

  // Intervención específica
  intervencion_especifica: string
  descripcion_detallada: string | null
  motivo_vulneraciones: string | null
  requiere_informes_ampliatorios: boolean

  // Fechas de transición (MED-02b)
  fecha_envio: string | null // ISO datetime
  fecha_aprobacion: string | null // ISO datetime
  fecha_rechazo: string | null // ISO datetime

  // Usuarios que realizaron acciones
  registrado_por_detalle: { id: number; nombre_completo: string; username: string } | null
  aprobado_por_detalle: { id: number; nombre_completo: string; username: string } | null
  rechazado_por_detalle: { id: number; nombre_completo: string; username: string } | null

  // Observaciones del JZ (MED-02b)
  observaciones_jz: string | null

  // Metadatos
  fecha_creacion: string // ISO datetime
  fecha_modificacion: string // ISO datetime

  // Adjuntos (MED-02c) - URL o referencia
  adjuntos: string
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

/**
 * Query parameters para filtrar intervenciones
 * GET /api/medidas/{medida_id}/intervenciones/?estado=BORRADOR&ordering=-fecha_creacion
 */
export interface IntervencionesQueryParams {
  estado?: EstadoIntervencion
  tipo_dispositivo?: number
  motivo?: number
  categoria_intervencion?: number
  fecha_desde?: string // YYYY-MM-DD
  fecha_hasta?: string // YYYY-MM-DD
  ordering?: string // ej: '-fecha_creacion', 'fecha_intervencion'
  limit?: number
  offset?: number
}

/**
 * Query parameters para filtrar adjuntos
 * GET /api/medidas/{medida_id}/intervenciones/{id}/adjuntos-list/?tipo=MODELO
 */
export interface AdjuntosQueryParams {
  tipo?: TipoAdjuntoIntervencion
}

// ============================================================================
// TRANSICIONES DE ESTADO (MED-02b)
// ============================================================================

/**
 * Request para enviar intervención a aprobación
 * PATCH /api/medidas/{medida_id}/intervenciones/{id}/enviar/
 * Estado 1 → Estado 2 (BORRADOR → ENVIADO)
 */
export interface EnviarIntervencionRequest {
  // No requiere body, solo el ID en la URL
}

/**
 * Response de enviar intervención
 */
export interface EnviarIntervencionResponse {
  message: string
  intervencion: IntervencionResponse
}

/**
 * Request para aprobar intervención (JZ)
 * POST /api/medidas/{medida_id}/intervenciones/{id}/aprobar/
 * Estado 2 → Estado 3 (ENVIADO → APROBADO)
 */
export interface AprobarIntervencionRequest {
  // No requiere body adicional
}

/**
 * Response de aprobar intervención
 */
export interface AprobarIntervencionResponse {
  message: string
  intervencion: IntervencionResponse
}

/**
 * Request para rechazar intervención (JZ)
 * POST /api/medidas/{medida_id}/intervenciones/{id}/rechazar/
 * Estado 2 → Estado 1 (ENVIADO → RECHAZADO → BORRADOR)
 */
export interface RechazarIntervencionRequest {
  observaciones_jz: string // Obligatorio: motivo del rechazo
}

/**
 * Response de rechazar intervención
 */
export interface RechazarIntervencionResponse {
  message: string
  intervencion: IntervencionResponse
}

// ============================================================================
// ERRORES Y VALIDACIONES
// ============================================================================

/**
 * Errores de validación del backend
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Response de error del API
 */
export interface ApiErrorResponse {
  detail?: string
  errors?: ValidationError[]
  message?: string
}
