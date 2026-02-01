"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Skeleton,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DownloadIcon from "@mui/icons-material/Download"
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"
import TimelineIcon from "@mui/icons-material/Timeline"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import EditIcon from "@mui/icons-material/Edit"
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"
import {
  useTrazabilidadEtapas,
  useExportTrazabilidad,
} from "../../../hooks/useHistorialSeguimiento"
import type {
  TransicionEstado,
  VigenciaTimeline,
  EtapaTimeline,
} from "../../../types/historial-seguimiento-api"
import { formatFechaEvento } from "../../../types/historial-seguimiento-api"

interface TrazabilidadDetalleProps {
  medidaId: number
  numeroMedida?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
)

const getCambioIcon = (tipoCambio: string): React.ReactNode => {
  switch (tipoCambio) {
    case '+':
      return <AddCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20 }} />
    case '~':
      return <EditIcon sx={{ color: 'warning.main', fontSize: 20 }} />
    case '-':
      return <RemoveCircleOutlineIcon sx={{ color: 'error.main', fontSize: 20 }} />
    default:
      return <CompareArrowsIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
  }
}

const getCambioLabel = (tipoCambio: string): string => {
  switch (tipoCambio) {
    case '+':
      return 'Creación'
    case '~':
      return 'Modificación'
    case '-':
      return 'Eliminación'
    default:
      return 'Cambio'
  }
}

interface TransicionesTableProps {
  transiciones: TransicionEstado[]
}

const TransicionesTable: React.FC<TransicionesTableProps> = ({ transiciones }) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Cambios</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transiciones.map((t, index) => (
          <TableRow key={index} hover>
            <TableCell>
              <Typography variant="caption">
                {formatFechaEvento(t.fecha)}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getCambioIcon(t.tipo_cambio)}
                <Typography variant="caption">
                  {getCambioLabel(t.tipo_cambio)}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Chip
                label={t.estado_display}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
            </TableCell>
            <TableCell>
              {t.cambios?.estado && (
                <Typography variant="caption" color="text.secondary">
                  {t.cambios.estado.anterior_display} → {t.cambios.estado.nuevo_display}
                </Typography>
              )}
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="text.secondary">
                {t.usuario}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

interface EtapaAccordionProps {
  etapa: EtapaTimeline
  defaultExpanded?: boolean
}

const EtapaAccordion: React.FC<EtapaAccordionProps> = ({
  etapa,
  defaultExpanded = false,
}) => (
  <Accordion defaultExpanded={defaultExpanded}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          pr: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
          {etapa.tipo_etapa_display}
        </Typography>
        <Chip
          label={etapa.estado_display}
          size="small"
          color={etapa.esta_activa ? 'primary' : 'default'}
          sx={{ height: 24 }}
        />
        {etapa.esta_activa && (
          <Chip
            label="Activa"
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {etapa.transiciones_estado.length} transiciones
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      {etapa.transiciones_estado.length > 0 ? (
        <TransicionesTable transiciones={etapa.transiciones_estado} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay transiciones registradas
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
)

interface VigenciaTableProps {
  timeline: VigenciaTimeline[]
}

const VigenciaTable: React.FC<VigenciaTableProps> = ({ timeline }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Estado Anterior</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {timeline.map((v, index) => (
          <TableRow key={index} hover>
            <TableCell>
              <Typography variant="caption">
                {formatFechaEvento(v.fecha)}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getCambioIcon(v.tipo_cambio)}
                <Typography variant="caption">
                  {getCambioLabel(v.tipo_cambio)}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Chip
                label={v.estado_vigencia_display}
                size="small"
                color={v.estado_vigencia === 'VIGENTE' ? 'success' : 'default'}
                sx={{ height: 24 }}
              />
            </TableCell>
            <TableCell>
              {v.estado_anterior_display && (
                <Typography variant="caption" color="text.secondary">
                  {v.estado_anterior_display}
                </Typography>
              )}
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="text.secondary">
                {v.usuario}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export const TrazabilidadDetalle: React.FC<TrazabilidadDetalleProps> = ({
  medidaId,
  numeroMedida = '',
}) => {
  const [tab, setTab] = useState(0)

  const {
    data: trazabilidad,
    isLoading,
    error,
  } = useTrazabilidadEtapas({
    medidaId,
    enabled: !!medidaId,
  })

  const exportMutation = useExportTrazabilidad()

  const handleExport = () => {
    exportMutation.mutate({
      medidaId,
      numeroMedida,
    })
  }

  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ mb: 2 }} />
        ))}
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar la trazabilidad: {error.message}
      </Alert>
    )
  }

  if (!trazabilidad) {
    return null
  }

  return (
    <Box>
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
          <TimelineIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detalle de Transiciones
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          Exportar CSV
        </Button>
      </Box>

      {/* Summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Etapas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {trazabilidad.resumen.total_etapas}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Activas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {trazabilidad.resumen.etapas_activas}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Cerradas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {trazabilidad.resumen.etapas_cerradas}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Duración Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {trazabilidad.resumen.duracion_total_dias} días
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Etapas" />
          <Tab label="Vigencia" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={tab} index={0}>
            {trazabilidad.etapas_timeline.length > 0 ? (
              trazabilidad.etapas_timeline.map((etapa, index) => (
                <EtapaAccordion
                  key={etapa.id}
                  etapa={etapa}
                  defaultExpanded={etapa.esta_activa || index === 0}
                />
              ))
            ) : (
              <Typography color="text.secondary">
                No hay etapas registradas
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            {trazabilidad.vigencia_timeline.length > 0 ? (
              <VigenciaTable timeline={trazabilidad.vigencia_timeline} />
            ) : (
              <Typography color="text.secondary">
                No hay cambios de vigencia registrados
              </Typography>
            )}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  )
}
