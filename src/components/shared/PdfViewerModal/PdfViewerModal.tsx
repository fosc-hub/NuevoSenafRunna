"use client"

/**
 * PdfViewerModal Component
 *
 * A reusable modal for viewing PDF documents.
 * Supports URL, Blob, and Base64 PDF sources.
 *
 * Part of the DRY refactoring initiative - centralizes PDF viewing
 * functionality across the application.
 */

import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { PdfViewerToolbar } from "./PdfViewerToolbar"
import { PdfViewerContent } from "./PdfViewerContent"
import type {
  PdfViewerModalProps,
  PdfMetadata,
  PdfToolbarConfig,
  PdfZoomConfig,
} from "./PdfViewerModal.types"
import {
  base64ToBlob,
  createBlobUrl,
  revokeBlobUrl,
  downloadFile,
  downloadFileWithFetch,
  printPdf,
  getFileNameFromUrl,
} from "@/utils/pdfUtils"

// Default configurations
const DEFAULT_TOOLBAR_CONFIG: Required<PdfToolbarConfig> = {
  showNavigation: true,
  showPageNumber: true,
  showZoom: true,
  showFullscreen: true,
  showDownload: true,
  showPrint: true,
}

const DEFAULT_ZOOM_CONFIG: Required<PdfZoomConfig> = {
  defaultZoom: 1,
  minZoom: 0.5,
  maxZoom: 2,
  zoomStep: 0.25,
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  open,
  onClose,
  source,
  title = "Visor de PDF",
  fileName,
  toolbar = {},
  zoom = {},
  initialPage = 1,
  onLoad,
  onError,
  onPageChange,
  onDownload,
  onPrint,
  ...dialogProps
}) => {
  // Merge configurations with defaults
  const toolbarConfig = useMemo(
    () => ({ ...DEFAULT_TOOLBAR_CONFIG, ...toolbar }),
    [toolbar]
  )

  const zoomConfig = useMemo(
    () => ({ ...DEFAULT_ZOOM_CONFIG, ...zoom }),
    [zoom]
  )

  // State
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [currentZoom, setCurrentZoom] = useState(zoomConfig.defaultZoom)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  // Reset state when source changes or modal opens
  useEffect(() => {
    if (open && source) {
      setCurrentPage(initialPage)
      setCurrentZoom(zoomConfig.defaultZoom)
      setIsLoading(true)
      setError(null)
      setTotalPages(0)

      // Convert source to URL for react-pdf
      let url: string

      switch (source.type) {
        case "url":
          url = source.url
          setFileUrl(url)
          break

        case "blob":
          url = createBlobUrl(source.blob)
          setBlobUrl(url)
          setFileUrl(url)
          break

        case "base64":
          const blob = base64ToBlob(source.data, source.mimeType)
          url = createBlobUrl(blob)
          setBlobUrl(url)
          setFileUrl(url)
          break
      }
    }

    return () => {
      // Cleanup blob URL when modal closes
      if (blobUrl) {
        revokeBlobUrl(blobUrl)
        setBlobUrl(null)
      }
    }
  }, [open, source, initialPage, zoomConfig.defaultZoom])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        revokeBlobUrl(blobUrl)
      }
    }
  }, [blobUrl])

  // Derive the file name
  const derivedFileName = useMemo(() => {
    if (fileName) return fileName
    if (source?.type === "url") {
      return getFileNameFromUrl(source.url)
    }
    return "documento.pdf"
  }, [fileName, source])

  // Navigation handlers
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      onPageChange?.(newPage, totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      onPageChange?.(newPage, totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  const handleGoToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        onPageChange?.(page, totalPages)
      }
    },
    [totalPages, onPageChange]
  )

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setCurrentZoom((prev) =>
      Math.min(prev + zoomConfig.zoomStep, zoomConfig.maxZoom)
    )
  }, [zoomConfig])

  const handleZoomOut = useCallback(() => {
    setCurrentZoom((prev) =>
      Math.max(prev - zoomConfig.zoomStep, zoomConfig.minZoom)
    )
  }, [zoomConfig])

  const handleZoomReset = useCallback(() => {
    setCurrentZoom(zoomConfig.defaultZoom)
  }, [zoomConfig.defaultZoom])

  // Fullscreen handler
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!source) return

    onDownload?.()

    switch (source.type) {
      case "url":
        await downloadFileWithFetch(source.url, derivedFileName)
        break

      case "blob":
        const blobDownloadUrl = createBlobUrl(source.blob)
        downloadFile(blobDownloadUrl, derivedFileName)
        setTimeout(() => revokeBlobUrl(blobDownloadUrl), 100)
        break

      case "base64":
        const downloadBlob = base64ToBlob(source.data, source.mimeType)
        const base64DownloadUrl = createBlobUrl(downloadBlob)
        downloadFile(base64DownloadUrl, derivedFileName)
        setTimeout(() => revokeBlobUrl(base64DownloadUrl), 100)
        break
    }
  }, [source, derivedFileName, onDownload])

  // Print handler
  const handlePrint = useCallback(() => {
    if (!fileUrl) return

    onPrint?.()
    printPdf(fileUrl)
  }, [fileUrl, onPrint])

  // Document load handler
  const handleDocumentLoaded = useCallback(
    (metadata: PdfMetadata) => {
      setTotalPages(metadata.numPages)
      setIsLoading(false)
      setError(null)
      onLoad?.(metadata)
    },
    [onLoad]
  )

  // Error handler
  const handleError = useCallback(
    (err: Error) => {
      setIsLoading(false)
      setError(err.message || "Error al cargar el documento PDF")
      onError?.(err)
    },
    [onError]
  )

  // Handle close
  const handleClose = useCallback(() => {
    // Cleanup blob URL
    if (blobUrl) {
      revokeBlobUrl(blobUrl)
      setBlobUrl(null)
    }
    setFileUrl(null)
    setIsFullscreen(false)
    onClose()
  }, [blobUrl, onClose])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isFullscreen ? false : "lg"}
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : 3,
          height: isFullscreen ? "100vh" : "90vh",
          maxHeight: isFullscreen ? "100vh" : "90vh",
        },
      }}
      {...dialogProps}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PictureAsPdfIcon color="error" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {derivedFileName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              - {derivedFileName}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="cerrar"
          sx={{ color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1,
          px: 2,
          bgcolor: "grey.50",
        }}
      >
        <PdfViewerToolbar
          config={toolbarConfig}
          currentPage={currentPage}
          totalPages={totalPages}
          currentZoom={currentZoom}
          zoomConfig={zoomConfig}
          disabled={isLoading || !!error}
          isFullscreen={isFullscreen}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onGoToPage={handleGoToPage}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onToggleFullscreen={handleToggleFullscreen}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "grey.200",
        }}
      >
        {fileUrl ? (
          <PdfViewerContent
            file={fileUrl}
            currentPage={currentPage}
            zoom={currentZoom}
            onDocumentLoaded={handleDocumentLoaded}
            onError={handleError}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography color="text.secondary">
              No hay documento para mostrar
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PdfViewerModal
