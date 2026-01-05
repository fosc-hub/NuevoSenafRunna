/**
 * PdfViewerModal Component Exports
 *
 * Centralized PDF viewing component for the application.
 * Part of the DRY refactoring initiative.
 *
 * @example
 * // Using the modal directly
 * import { PdfViewerModal } from '@/components/shared/PdfViewerModal'
 *
 * <PdfViewerModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   source={{ type: 'url', url: pdfUrl }}
 *   title="Document Preview"
 * />
 *
 * @example
 * // Using the hook for easier state management
 * import { usePdfViewer } from '@/hooks'
 *
 * const { openUrl, PdfModal } = usePdfViewer()
 * openUrl(pdfUrl, { title: "Document" })
 * return <>{PdfModal}</>
 */

// Main component
export { PdfViewerModal, default } from "./PdfViewerModal"

// Subcomponents (for advanced usage)
// Note: PdfViewerContent is NOT exported here because it contains pdfjs-dist
// which has SSR issues. It should only be used via dynamic import in PdfViewerModal.
export { PdfViewerToolbar } from "./PdfViewerToolbar"

// Types
export type {
  // Source types
  PdfSource,
  PdfSourceUrl,
  PdfSourceBlob,
  PdfSourceBase64,
  // State types
  PdfLoadingState,
  PdfMetadata,
  // Configuration types
  PdfToolbarConfig,
  PdfZoomConfig,
  // Component props
  PdfViewerModalProps,
  PdfViewerToolbarProps,
  PdfViewerContentProps,
  // Hook types
  OpenPdfOptions,
  UsePdfViewerReturn,
} from "./PdfViewerModal.types"
