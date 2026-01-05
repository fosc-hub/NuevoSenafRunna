"use client"

/**
 * usePdfViewer Hook
 *
 * A reusable hook for managing PDF viewer state.
 * Provides easy methods to open PDFs from URLs, Blobs, or Base64 data.
 *
 * Part of the DRY refactoring initiative - provides a consistent way
 * to open PDF viewers across the application.
 *
 * @example
 * // Basic usage
 * const { openUrl, PdfModal } = usePdfViewer()
 *
 * // Open a PDF from URL
 * openUrl("https://api.example.com/documents/123.pdf", {
 *   title: "My Document",
 *   fileName: "document.pdf"
 * })
 *
 * // Render the modal
 * return <>{PdfModal}</>
 *
 * @example
 * // With blob from fetch response
 * const { openBlob, PdfModal } = usePdfViewer()
 *
 * const response = await fetch(url)
 * const blob = await response.blob()
 * openBlob(blob, { title: "Downloaded PDF" })
 */

import { useState, useCallback, useMemo } from "react"
import { PdfViewerModal } from "@/components/shared/PdfViewerModal"
import type {
  PdfSource,
  OpenPdfOptions,
  UsePdfViewerReturn,
  PdfViewerModalProps,
} from "@/components/shared/PdfViewerModal/PdfViewerModal.types"
import { getFileNameFromUrl } from "@/utils/pdfUtils"

interface PdfViewerState {
  isOpen: boolean
  source: PdfSource | null
  title: string
  fileName: string
  initialPage?: number
  onLoad?: OpenPdfOptions["onLoad"]
  onError?: OpenPdfOptions["onError"]
}

const DEFAULT_STATE: PdfViewerState = {
  isOpen: false,
  source: null,
  title: "Visor de PDF",
  fileName: "documento.pdf",
}

/**
 * Hook for managing PDF viewer state
 *
 * @returns Object with state, actions, and pre-configured modal component
 */
export function usePdfViewer(): UsePdfViewerReturn {
  const [state, setState] = useState<PdfViewerState>(DEFAULT_STATE)

  /**
   * Close the PDF viewer and reset state
   */
  const close = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  /**
   * Open a PDF from any source type
   */
  const openPdf = useCallback(
    (source: PdfSource, options?: OpenPdfOptions) => {
      let defaultFileName = "documento.pdf"

      // Try to derive filename from source
      if (source.type === "url") {
        defaultFileName = getFileNameFromUrl(source.url)
      }

      setState({
        isOpen: true,
        source,
        title: options?.title || "Visor de PDF",
        fileName: options?.fileName || defaultFileName,
        initialPage: options?.initialPage,
        onLoad: options?.onLoad,
        onError: options?.onError,
      })
    },
    []
  )

  /**
   * Open a PDF from URL
   */
  const openUrl = useCallback(
    (url: string, options?: OpenPdfOptions) => {
      openPdf({ type: "url", url }, options)
    },
    [openPdf]
  )

  /**
   * Open a PDF from Blob
   */
  const openBlob = useCallback(
    (blob: Blob, options?: OpenPdfOptions) => {
      openPdf({ type: "blob", blob }, options)
    },
    [openPdf]
  )

  /**
   * Open a PDF from Base64 string
   */
  const openBase64 = useCallback(
    (data: string, options?: OpenPdfOptions) => {
      openPdf(
        {
          type: "base64",
          data,
          mimeType: "application/pdf",
        },
        options
      )
    },
    [openPdf]
  )

  /**
   * Pre-configured PdfViewerModal component
   * Accepts partial props to override defaults
   */
  const PdfViewerModalComponent: React.FC<Partial<PdfViewerModalProps>> =
    useCallback(
      (props) => (
        <PdfViewerModal
          open={state.isOpen}
          onClose={close}
          source={state.source}
          title={state.title}
          fileName={state.fileName}
          initialPage={state.initialPage}
          onLoad={state.onLoad}
          onError={state.onError}
          {...props}
        />
      ),
      [state, close]
    )

  /**
   * Render prop for the modal - can be used directly in JSX
   */
  const PdfModal = useMemo(
    () => (
      <PdfViewerModal
        open={state.isOpen}
        onClose={close}
        source={state.source}
        title={state.title}
        fileName={state.fileName}
        initialPage={state.initialPage}
        onLoad={state.onLoad}
        onError={state.onError}
      />
    ),
    [state, close]
  )

  return {
    // State
    isOpen: state.isOpen,
    source: state.source,
    title: state.title,
    fileName: state.fileName,

    // Actions
    openPdf,
    openUrl,
    openBlob,
    openBase64,
    close,

    // Render helpers
    PdfViewerModal: PdfViewerModalComponent,
    /** @deprecated Use PdfModal instead for simpler usage */
    PdfModal,
  }
}

/**
 * Simplified hook that just returns the modal and open function
 *
 * @example
 * const { openPdfUrl, PdfModal } = useSimplePdfViewer()
 *
 * <button onClick={() => openPdfUrl(url)}>Ver PDF</button>
 * {PdfModal}
 */
export function useSimplePdfViewer() {
  const { openUrl, PdfModal } = usePdfViewer()

  return {
    openPdfUrl: openUrl,
    PdfModal,
  }
}

export default usePdfViewer
