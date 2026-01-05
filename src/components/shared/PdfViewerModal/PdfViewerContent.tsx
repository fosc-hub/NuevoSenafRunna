"use client"

/**
 * PdfViewerContent Component
 *
 * Renders PDF documents using Google Docs Viewer for external URLs
 * or direct iframe for blob URLs. This approach works with cross-origin
 * PDFs that have restrictive X-Frame-Options headers.
 */

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material"
import type { PdfViewerContentProps, PdfMetadata } from "./PdfViewerModal.types"

/**
 * Check if a URL is a blob URL (local)
 */
const isBlobUrl = (url: string): boolean => {
  return url.startsWith("blob:")
}

/**
 * Get the viewer URL - uses Google Docs Viewer for external URLs
 */
const getViewerUrl = (fileUrl: string): string => {
  if (isBlobUrl(fileUrl)) {
    // Blob URLs can be displayed directly
    return fileUrl
  }
  // Use Google Docs Viewer for external URLs to bypass X-Frame-Options
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
}

export const PdfViewerContent: React.FC<PdfViewerContentProps> = ({
  file,
  currentPage,
  zoom,
  onDocumentLoaded,
  onError,
  containerWidth,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get the appropriate viewer URL
  const viewerUrl = useMemo(() => getViewerUrl(file), [file])

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false)
    setLoadError(null)
    onDocumentLoaded({ numPages: 1 })
  }

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false)
    const error = new Error("Error al cargar el documento PDF")
    setLoadError(error.message)
    onError(error)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setLoadError(null)
    if (iframeRef.current) {
      iframeRef.current.src = viewerUrl
    }
  }

  // Open in new tab as fallback
  const handleOpenInNewTab = () => {
    window.open(file, "_blank", "noopener,noreferrer")
  }

  // Reset loading state when file changes
  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
  }, [file])

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.200",
        position: "relative",
      }}
    >
      {/* Error State */}
      {loadError && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {loadError}
          </Alert>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={handleRetry}>
              Reintentar
            </Button>
            <Button variant="contained" onClick={handleOpenInNewTab}>
              Abrir en nueva pestaña
            </Button>
          </Box>
        </Box>
      )}

      {/* PDF Viewer */}
      {!loadError && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title="PDF Viewer"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </Box>
      )}

      {/* Loading indicator */}
      {isLoading && !loadError && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 255, 255, 0.9)",
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary">
            Cargando documento...
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PdfViewerContent
