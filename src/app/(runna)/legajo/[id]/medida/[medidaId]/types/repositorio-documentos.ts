/**
 * Types for the unified document repository
 *
 * Represents documents from the /api/repositorio-documentos/ endpoint
 */

export interface UsuarioSubida {
  id: number
  username: string
  nombre_completo: string
}

export interface Documento {
  id: number
  tipo_modelo: string
  tipo_modelo_display: string
  categoria: CategoriaDocumento
  archivo_url: string | null
  nombre_archivo: string | null
  tamanio_bytes: number
  tamanio_mb: number
  extension: string | null
  fecha_subida: string | null
  usuario_subida: UsuarioSubida | null
  tipo_documento: string | null
  descripcion: string | null
  metadata: Record<string, unknown>
}

export type CategoriaDocumento = 'DEMANDA' | 'EVALUACION' | 'MEDIDA'

export interface RepositorioDocumentosResponse {
  demanda_id: number | null
  legajo_id: number | null
  medida_id: number | null
  total_documentos: number
  total_size_bytes: number
  total_size_mb: number
  categorias: Partial<Record<CategoriaDocumento, number>>
  documentos: Documento[]
}

export interface RepositorioDocumentosParams {
  demanda_id?: number
  legajo_id?: number
  medida_id?: number
  tipo_modelo?: string
  categoria?: CategoriaDocumento
}

export interface DocumentosFilterState {
  categoria: CategoriaDocumento | 'TODOS'
  tipoModelo: string | 'TODOS'
}
