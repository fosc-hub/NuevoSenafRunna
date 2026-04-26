/**
 * Etiqueta de Documento — catálogo unificado utilizado para clasificar
 * cualquier *Adjunto del sistema. Backend: TEtiquetaDocumento.
 */
export interface EtiquetaDocumento {
  id: number
  codigo: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  orden: number
}
