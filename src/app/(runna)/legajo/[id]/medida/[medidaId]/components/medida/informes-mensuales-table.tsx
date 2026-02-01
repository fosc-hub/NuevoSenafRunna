"use client"

/**
 * InformesMensualesTable Component - PLTM-03
 *
 * Displays monthly follow-up reports for a medida with real API data.
 *
 * Features:
 * - Fetches data from API using useInformesSeguimiento hook
 * - Color-coded estado badges
 * - Estado filter chips
 * - Download plantilla button
 * - Completar informe modal integration
 * - Loading and error states
 */

import type React from "react"
import { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
} from "@mui/material"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DownloadIcon from "@mui/icons-material/Download"
import FilterListIcon from "@mui/icons-material/FilterList"
import { CompletarInformeModal } from "./completar-informe-modal"
import { EstadoInformeBadge } from "./shared/estado-informe-badge"
import { useInformesSeguimiento, useDescargarPlantilla, usePlantillaInfo } from "../../hooks/useInformesSeguimiento"
import type { EstadoInformeSeguimiento, InformeSeguimientoListItem } from "../../types/informe-seguimiento-api"
import { canCompletarInforme, formatDiasVencimiento } from "../../types/informe-seguimiento-api"

// ============================================================================
// TYPES
// ============================================================================

interface InformesMensualesTableProps {
  /** ID of the medida */
  medidaId: number
}

type EstadoFilter = EstadoInformeSeguimiento | 'TODOS'

// ============================================================================
// FILTER CHIPS CONFIG
// ============================================================================

const ESTADO_FILTERS: { value: EstadoFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'VENCIDO', label: 'Vencidos' },
  { value: 'COMPLETADO', label: 'Completados' },
  { value: 'COMPLETADO_TARDIO', label: 'Tardíos' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date for display (DD/MM/YYYY)
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InformesMensualesTable: React.FC<InformesMensualesTableProps> = ({
  medidaId,
}) => {
  // State
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('TODOS')
  const [selectedInforme, setSelectedInforme] = useState<InformeSeguimientoListItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // API Hooks
  const {
    data: informes,
    isLoading,
    isError,
    error,
    refetch,
  } = useInformesSeguimiento({ medidaId })

  const { data: plantillaInfo } = usePlantillaInfo({ medidaId })
  const descargarPlantillaMutation = useDescargarPlantilla()

  // Filter informes by estado
  const filteredInformes = useMemo(() => {
    if (!informes) return []
    if (estadoFilter === 'TODOS') return informes
    return informes.filter((informe) => informe.estado === estadoFilter)
  }, [informes, estadoFilter])

  // Handlers
  const handleDescargarPlantilla = () => {
    descargarPlantillaMutation.mutate({
      medidaId,
      filename: plantillaInfo?.nombre || 'plantilla_informe_seguimiento.docx',
    })
  }

  const handleCompletarClick = (informe: InformeSeguimientoListItem) => {
    setSelectedInforme(informe)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedInforme(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    refetch()
  }

  // Loading state
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  // Error state
  if (isError) {
    return (
      <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }>
            Error al cargar los informes mensuales: {(error as Error)?.message || 'Error desconocido'}
          </Alert>
        </Box>
      </Paper>
    )
  }

  // Empty state
  if (!informes || informes.length === 0) {
    return (
      <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Informes mensuales requeridos
          </Typography>
          <Alert severity="info">
            No hay informes mensuales programados para esta medida.
          </Alert>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={2} sx={{ mt: 4, borderRadius: 2 }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Informes mensuales requeridos
          </Typography>

          {/* Download Plantilla Button */}
          {plantillaInfo?.disponible && (
            <Button
              variant="contained"
              startIcon={descargarPlantillaMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDescargarPlantilla}
              disabled={descargarPlantillaMutation.isPending}
              sx={{
                backgroundColor: '#36d6d0',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#2cc2bc' },
              }}
            >
              Descargar Plantilla
            </Button>
          )}
        </Box>

        {/* Estado Filter Chips */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
            {ESTADO_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                onClick={() => setEstadoFilter(filter.value)}
                variant={estadoFilter === filter.value ? 'filled' : 'outlined'}
                color={estadoFilter === filter.value ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: estadoFilter === filter.value ? 600 : 400 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>N° Informe</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Días</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha Completado</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Adjuntos</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInformes.map((informe) => (
                <TableRow key={informe.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Informe {informe.numero_informe}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(informe.fecha_vencimiento)}</TableCell>
                  <TableCell>
                    <EstadoInformeBadge
                      estado={informe.estado}
                      diasParaVencimiento={informe.dias_para_vencimiento}
                      entregaTardia={informe.entrega_tardia}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={formatDiasVencimiento(informe.dias_para_vencimiento)}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: informe.dias_para_vencimiento < 0 ? 'error.main' :
                            informe.dias_para_vencimiento <= 3 ? 'warning.main' : 'text.primary',
                        }}
                      >
                        {informe.dias_para_vencimiento > 0 ? `+${informe.dias_para_vencimiento}` : informe.dias_para_vencimiento}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {informe.fecha_completado ? (
                      <Box>
                        <Typography variant="body2">
                          {formatDate(informe.fecha_completado)}
                        </Typography>
                        {informe.entrega_tardia && (
                          <Typography variant="caption" color="warning.main">
                            (Tardío)
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {informe.adjuntos_count && informe.adjuntos_count > 0 ? (
                      <Tooltip title={`${informe.adjuntos_count} adjunto(s)`}>
                        <IconButton size="small" color="primary">
                          <AttachFileIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {canCompletarInforme(informe) ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          minWidth: 120,
                        }}
                        onClick={() => handleCompletarClick(informe)}
                      >
                        Completar
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* No results after filter */}
        {filteredInformes.length === 0 && informes.length > 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay informes con el estado seleccionado.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Completar Informe Modal */}
      {selectedInforme && (
        <CompletarInformeModal
          open={modalOpen}
          onClose={handleModalClose}
          medidaId={medidaId}
          informeId={selectedInforme.id}
          numeroInforme={selectedInforme.numero_informe}
          fechaVencimiento={selectedInforme.fecha_vencimiento}
          isVencido={selectedInforme.estado === 'VENCIDO'}
          onSuccess={handleModalSuccess}
        />
      )}
    </Paper>
  )
}
