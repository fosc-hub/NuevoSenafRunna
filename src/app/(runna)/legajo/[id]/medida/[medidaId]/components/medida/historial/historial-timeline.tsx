"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Pagination,
  Alert,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import RefreshIcon from "@mui/icons-material/Refresh"
import HistoryIcon from "@mui/icons-material/History"
import {
  useHistorialSeguimiento,
  useHistorialResumen,
  useExportHistorial,
} from "../../../hooks/useHistorialSeguimiento"
import type { HistorialSeguimientoQueryParams } from "../../../types/historial-seguimiento-api"
import { HistorialEventCard } from "./historial-event-card"
import { HistorialFilters } from "./historial-filters"
import { HistorialResumenCards, CategoriaBreakdown } from "./historial-resumen-cards"

interface HistorialTimelineProps {
  medidaId: number
  numeroMedida?: string
}

const PAGE_SIZE = 20

export const HistorialTimeline: React.FC<HistorialTimelineProps> = ({
  medidaId,
  numeroMedida = '',
}) => {
  const [filters, setFilters] = useState<HistorialSeguimientoQueryParams>({
    page: 1,
    page_size: PAGE_SIZE,
  })

  const {
    data: historialData,
    isLoading: isLoadingHistorial,
    error: historialError,
    refetch: refetchHistorial,
  } = useHistorialSeguimiento({
    medidaId,
    params: filters,
    enabled: !!medidaId,
  })

  const {
    data: resumenData,
    isLoading: isLoadingResumen,
  } = useHistorialResumen(medidaId, !!medidaId)

  const exportMutation = useExportHistorial()

  const handleFiltersChange = useCallback((newFilters: HistorialSeguimientoQueryParams) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }))
  }, [])

  const handleSearch = useCallback(() => {
    refetchHistorial()
  }, [refetchHistorial])

  const handleReset = useCallback(() => {
    setFilters({
      page: 1,
      page_size: PAGE_SIZE,
    })
  }, [])

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      medidaId,
      numeroMedida,
      params: filters,
    })
  }, [medidaId, numeroMedida, filters, exportMutation])

  const handleDeepLinkClick = useCallback((url: string) => {
    console.log('Deep link clicked:', url)
  }, [])

  const totalPages = historialData
    ? Math.ceil(historialData.count / PAGE_SIZE)
    : 0

  return (
    <Box>
      {/* Summary cards */}
      <HistorialResumenCards resumen={resumenData} loading={isLoadingResumen} />

      {/* Category breakdown */}
      {resumenData && <CategoriaBreakdown porCategoria={resumenData.por_categoria} />}

      {/* Main timeline card */}
      <Paper elevation={1} sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Timeline de Eventos
            </Typography>
            {historialData && (
              <Typography variant="body2" color="text.secondary">
                ({historialData.count} eventos)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetchHistorial()}
              disabled={isLoadingHistorial}
            >
              Actualizar
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={exportMutation.isPending || !historialData?.count}
            >
              {exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <HistorialFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={isLoadingHistorial}
        />

        {/* Error state */}
        {historialError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar el historial: {historialError.message}
          </Alert>
        )}

        {/* Loading state */}
        {isLoadingHistorial && (
          <Box>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton variant="rounded" height={100} />
              </Box>
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!isLoadingHistorial && historialData?.results.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'text.secondary',
            }}
          >
            <HistoryIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography variant="body1">
              No se encontraron eventos con los filtros aplicados.
            </Typography>
            <Button
              variant="text"
              onClick={handleReset}
              sx={{ mt: 1 }}
            >
              Limpiar filtros
            </Button>
          </Box>
        )}

        {/* Events list */}
        {!isLoadingHistorial && historialData && historialData.results.length > 0 && (
          <>
            <Box>
              {historialData.results.map((evento) => (
                <HistorialEventCard
                  key={evento.id}
                  evento={evento}
                  onDeepLinkClick={handleDeepLinkClick}
                />
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Pagination
                  count={totalPages}
                  page={filters.page || 1}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* Export loading overlay */}
        {exportMutation.isPending && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              zIndex: 9999,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Generando exportación...</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
