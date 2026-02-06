/**
 * Constants for the unified document repository
 *
 * Category configurations, icons, colors, and labels
 */

import type { CategoriaDocumento } from '../../../types/repositorio-documentos'

// Category configuration with colors and labels
export const CATEGORY_CONFIG: Record<
  CategoriaDocumento,
  {
    label: string
    color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
    bgColor: string
    borderColor: string
    icon: string
  }
> = {
  DEMANDA: {
    label: 'Demanda',
    color: 'primary',
    bgColor: 'rgba(25, 118, 210, 0.08)',
    borderColor: '#1976d2',
    icon: 'description',
  },
  EVALUACION: {
    label: 'Evaluación',
    color: 'secondary',
    bgColor: 'rgba(156, 39, 176, 0.08)',
    borderColor: '#9c27b0',
    icon: 'assignment',
  },
  MEDIDA: {
    label: 'Medida',
    color: 'success',
    bgColor: 'rgba(46, 125, 50, 0.08)',
    borderColor: '#2e7d32',
    icon: 'gavel',
  },
}

// Category display order
export const CATEGORY_ORDER: CategoriaDocumento[] = ['DEMANDA', 'EVALUACION', 'MEDIDA']

// File extension to icon mapping
export const FILE_ICON_MAP: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  xls: '📊',
  xlsx: '📊',
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  webp: '🖼️',
  txt: '📃',
  csv: '📊',
  zip: '🗜️',
  rar: '🗜️',
  mp4: '🎬',
  mp3: '🎵',
  default: '📎',
}

/**
 * Get icon for file extension
 */
export const getFileIcon = (extension: string | null): string => {
  if (!extension) return FILE_ICON_MAP.default
  const ext = extension.toLowerCase().replace('.', '')
  return FILE_ICON_MAP[ext] || FILE_ICON_MAP.default
}

// Display labels for tipo_modelo values
export const TIPO_MODELO_LABELS: Record<string, string> = {
  EVALUACION: 'Evaluación',
  INFORME: 'Informe',
  ADJUNTO_DEMANDA: 'Adjunto de Demanda',
  ADJUNTO_ACTIVIDAD: 'Adjunto de Actividad',
  ACTA: 'Acta',
  RESOLUCION: 'Resolución',
  OFICIO: 'Oficio',
  DICTAMEN: 'Dictamen',
  INFORME_JURIDICO: 'Informe Jurídico',
  OTRO: 'Otro',
}

/**
 * Get display label for tipo_modelo
 */
export const getTipoModeloLabel = (tipoModelo: string): string => {
  return TIPO_MODELO_LABELS[tipoModelo] || tipoModelo
}
