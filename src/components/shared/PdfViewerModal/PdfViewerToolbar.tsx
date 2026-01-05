"use client"

/**
 * PdfViewerToolbar Component
 *
 * Toolbar with navigation, zoom, and action controls for the PDF viewer.
 * Part of the PdfViewerModal component family.
 */

import React, { useState } from "react"
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  TextField,
  Slider,
  Divider,
} from "@mui/material"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import FitScreenIcon from "@mui/icons-material/FitScreen"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import DownloadIcon from "@mui/icons-material/Download"
import PrintIcon from "@mui/icons-material/Print"
import type { PdfViewerToolbarProps } from "./PdfViewerModal.types"

export const PdfViewerToolbar: React.FC<PdfViewerToolbarProps> = ({
  config,
  currentPage,
  totalPages,
  currentZoom,
  zoomConfig,
  disabled,
  isFullscreen,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFullscreen,
  onDownload,
  onPrint,
}) => {
  const [pageInputValue, setPageInputValue] = useState(String(currentPage))

  // Sync input with current page
  React.useEffect(() => {
    setPageInputValue(String(currentPage))
  }, [currentPage])

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  const handlePageInputBlur = () => {
    const page = parseInt(pageInputValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onGoToPage(page)
    } else {
      setPageInputValue(String(currentPage))
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePageInputBlur()
    }
  }

  const zoomPercentage = Math.round(currentZoom * 100)

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {/* Navigation Controls */}
      {config.showNavigation && totalPages > 1 && (
        <>
          <Tooltip title="Página anterior">
            <span>
              <IconButton
                size="small"
                onClick={onPrevPage}
                disabled={disabled || currentPage <= 1}
              >
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>

          {config.showPageNumber && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: 0.5 }}>
              <TextField
                size="small"
                value={pageInputValue}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                onKeyDown={handlePageInputKeyDown}
                disabled={disabled}
                inputProps={{
                  style: {
                    width: 40,
                    textAlign: "center",
                    padding: "4px 8px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 32,
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                / {totalPages}
              </Typography>
            </Box>
          )}

          <Tooltip title="Página siguiente">
            <span>
              <IconButton
                size="small"
                onClick={onNextPage}
                disabled={disabled || currentPage >= totalPages}
              >
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        </>
      )}

      {/* Zoom Controls */}
      {config.showZoom && (
        <>
          <Tooltip title="Reducir zoom">
            <span>
              <IconButton
                size="small"
                onClick={onZoomOut}
                disabled={disabled || currentZoom <= zoomConfig.minZoom}
              >
                <ZoomOutIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ width: 100, mx: 1, display: { xs: "none", sm: "block" } }}>
            <Slider
              size="small"
              value={currentZoom}
              min={zoomConfig.minZoom}
              max={zoomConfig.maxZoom}
              step={zoomConfig.zoomStep}
              onChange={(_, value) => onZoomReset()}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 45, textAlign: "center" }}
          >
            {zoomPercentage}%
          </Typography>

          <Tooltip title="Aumentar zoom">
            <span>
              <IconButton
                size="small"
                onClick={onZoomIn}
                disabled={disabled || currentZoom >= zoomConfig.maxZoom}
              >
                <ZoomInIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Ajustar a pantalla">
            <span>
              <IconButton size="small" onClick={onZoomReset} disabled={disabled}>
                <FitScreenIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        </>
      )}

      {/* Action Buttons */}
      {config.showFullscreen && (
        <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
          <span>
            <IconButton size="small" onClick={onToggleFullscreen} disabled={disabled}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {config.showDownload && (
        <Tooltip title="Descargar">
          <span>
            <IconButton size="small" onClick={onDownload} disabled={disabled}>
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {config.showPrint && (
        <Tooltip title="Imprimir">
          <span>
            <IconButton size="small" onClick={onPrint} disabled={disabled}>
              <PrintIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  )
}

export default PdfViewerToolbar
