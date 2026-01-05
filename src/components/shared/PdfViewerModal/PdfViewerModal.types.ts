/**
 * PdfViewerModal Types
 *
 * Type definitions for the PDF viewer modal component.
 * Part of the shared components library.
 */

import type { ReactElement } from "react"
import type { DialogProps } from "@mui/material"

// ============================================================================
// SOURCE TYPES
// ============================================================================

/**
 * PDF source from URL (backend API)
 */
export interface PdfSourceUrl {
  type: "url"
  url: string
}

/**
 * PDF source from Blob (client-generated)
 */
export interface PdfSourceBlob {
  type: "blob"
  blob: Blob
}

/**
 * PDF source from Base64 string
 */
export interface PdfSourceBase64 {
  type: "base64"
  data: string
  mimeType?: string
}

/**
 * Union type for all PDF source types
 */
export type PdfSource = PdfSourceUrl | PdfSourceBlob | PdfSourceBase64

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * PDF loading state
 */
export interface PdfLoadingState {
  isLoading: boolean
  progress: number
  error: string | null
}

/**
 * PDF document metadata
 */
export interface PdfMetadata {
  numPages: number
  title?: string
  author?: string
  creationDate?: Date
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Toolbar configuration options
 */
export interface PdfToolbarConfig {
  /** Show page navigation buttons */
  showNavigation?: boolean
  /** Show current page / total pages */
  showPageNumber?: boolean
  /** Show zoom controls */
  showZoom?: boolean
  /** Show fullscreen toggle */
  showFullscreen?: boolean
  /** Show download button */
  showDownload?: boolean
  /** Show print button */
  showPrint?: boolean
}

/**
 * Zoom configuration options
 */
export interface PdfZoomConfig {
  /** Default zoom level (1 = 100%) */
  defaultZoom?: number
  /** Minimum zoom level */
  minZoom?: number
  /** Maximum zoom level */
  maxZoom?: number
  /** Zoom step for buttons */
  zoomStep?: number
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Main PdfViewerModal component props
 */
export interface PdfViewerModalProps extends Omit<DialogProps, "children" | "title" | "onLoad" | "onError"> {
  /** Control modal visibility */
  open: boolean
  /** Close handler */
  onClose: () => void
  /** PDF source (URL, Blob, or Base64) */
  source: PdfSource | null
  /** Modal title */
  title?: string
  /** File name for download */
  fileName?: string
  /** Toolbar configuration */
  toolbar?: PdfToolbarConfig
  /** Zoom configuration */
  zoom?: PdfZoomConfig
  /** Initial page to display (1-based) */
  initialPage?: number
  /** Callback when PDF loads successfully */
  onLoad?: (metadata: PdfMetadata) => void
  /** Callback on error */
  onError?: (error: Error) => void
  /** Callback when page changes */
  onPageChange?: (page: number, totalPages: number) => void
  /** Callback when download is triggered */
  onDownload?: () => void
  /** Callback when print is triggered */
  onPrint?: () => void
}

/**
 * PdfViewerToolbar component props
 */
export interface PdfViewerToolbarProps {
  /** Toolbar configuration */
  config: Required<PdfToolbarConfig>
  /** Current page number (1-based) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Current zoom level */
  currentZoom: number
  /** Zoom configuration */
  zoomConfig: Required<PdfZoomConfig>
  /** Whether controls are disabled */
  disabled: boolean
  /** Is fullscreen mode active */
  isFullscreen: boolean
  /** Go to previous page */
  onPrevPage: () => void
  /** Go to next page */
  onNextPage: () => void
  /** Go to specific page */
  onGoToPage: (page: number) => void
  /** Zoom in */
  onZoomIn: () => void
  /** Zoom out */
  onZoomOut: () => void
  /** Reset zoom */
  onZoomReset: () => void
  /** Toggle fullscreen */
  onToggleFullscreen: () => void
  /** Trigger download */
  onDownload: () => void
  /** Trigger print */
  onPrint: () => void
}

/**
 * PdfViewerContent component props
 */
export interface PdfViewerContentProps {
  /** PDF data URL or blob URL */
  file: string
  /** Current page to display */
  currentPage: number
  /** Current zoom level */
  zoom: number
  /** Callback when document loads */
  onDocumentLoaded: (metadata: PdfMetadata) => void
  /** Callback on error */
  onError: (error: Error) => void
  /** Container width for responsive sizing */
  containerWidth?: number
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Options for opening a PDF
 */
export interface OpenPdfOptions {
  /** Modal title */
  title?: string
  /** File name for download */
  fileName?: string
  /** Initial page to display */
  initialPage?: number
  /** Callback when PDF loads */
  onLoad?: (metadata: PdfMetadata) => void
  /** Callback on error */
  onError?: (error: Error) => void
}

/**
 * Return type for usePdfViewer hook
 */
export interface UsePdfViewerReturn {
  // State
  /** Whether the modal is open */
  isOpen: boolean
  /** Current PDF source */
  source: PdfSource | null
  /** Current title */
  title: string
  /** Current file name */
  fileName: string

  // Actions
  /** Open a PDF from any source */
  openPdf: (source: PdfSource, options?: OpenPdfOptions) => void
  /** Open a PDF from URL */
  openUrl: (url: string, options?: OpenPdfOptions) => void
  /** Open a PDF from Blob */
  openBlob: (blob: Blob, options?: OpenPdfOptions) => void
  /** Open a PDF from Base64 */
  openBase64: (data: string, options?: OpenPdfOptions) => void
  /** Close the modal */
  close: () => void

  // Render helpers
  /** Pre-configured modal component */
  PdfViewerModal: React.FC<Partial<PdfViewerModalProps>>
  /** Pre-rendered modal element - use directly in JSX */
  PdfModal: React.ReactElement
}
