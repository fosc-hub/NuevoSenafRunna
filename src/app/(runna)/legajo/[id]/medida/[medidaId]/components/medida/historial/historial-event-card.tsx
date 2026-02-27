"use client"

import type React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import DescriptionIcon from "@mui/icons-material/Description"
import TimelineIcon from "@mui/icons-material/Timeline"
import AssessmentIcon from "@mui/icons-material/Assessment"
import VisibilityIcon from "@mui/icons-material/Visibility"
import GavelIcon from "@mui/icons-material/Gavel"
import MailIcon from "@mui/icons-material/Mail"
import EditIcon from "@mui/icons-material/Edit"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import PersonIcon from "@mui/icons-material/Person"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SettingsIcon from "@mui/icons-material/Settings"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import type {
  HistorialEventoItem,
  CategoriaEvento,
  DatosEventoDispositivoCambio,
} from "../../../types/historial-seguimiento-api"
import {
  CATEGORIA_CONFIGS,
  getCategoriaFromTipoEvento,
  formatFechaEvento,
  getRelativeTime,
} from "../../../types/historial-seguimiento-api"

interface HistorialEventCardProps {
  evento: HistorialEventoItem
  onDeepLinkClick?: (url: string) => void
}

const getCategoryIcon = (categoria: CategoriaEvento, tipoEvento?: string): React.ReactNode => {
  const iconProps = { fontSize: "small" as const }

  // Special icon for device configuration changes
  if (tipoEvento === 'INTERVENCION_DISPOSITIVO_CAMBIO') {
    return <SettingsIcon {...iconProps} />
  }

  switch (categoria) {
    case 'ACTIVIDAD':
      return <AssignmentIcon {...iconProps} />
    case 'INTERVENCION':
      return <DescriptionIcon {...iconProps} />
    case 'ETAPA':
      return <TimelineIcon {...iconProps} />
    case 'INFORME':
      return <AssessmentIcon {...iconProps} />
    case 'SEGUIMIENTO':
      return <VisibilityIcon {...iconProps} />
    case 'MEDIDA':
      return <GavelIcon {...iconProps} />
    case 'OFICIO':
      return <MailIcon {...iconProps} />
    case 'MANUAL':
      return <EditIcon {...iconProps} />
    default:
      return <AssignmentIcon {...iconProps} />
  }
}

/**
 * Helper to check if datos_evento contains device change data
 */
const isDispositivoCambioData = (datos: unknown): datos is DatosEventoDispositivoCambio => {
  if (!datos || typeof datos !== 'object') return false
  const d = datos as Record<string, unknown>
  return 'tipo_dispositivo' in d || 'subtipo_dispositivo' in d
}

/**
 * Renders the device configuration change details in "antes → después" format
 */
const DispositivoCambioDetails: React.FC<{ datos: DatosEventoDispositivoCambio }> = ({ datos }) => {
  const renderCambio = (
    label: string,
    cambio?: { antes: { id: number; nombre: string } | null; despues: { id: number; nombre: string } | null }
  ) => {
    if (!cambio) return null

    const antesNombre = cambio.antes?.nombre || 'Sin asignar'
    const despuesNombre = cambio.despues?.nombre || 'Sin asignar'

    // Skip if no actual change
    if (antesNombre === despuesNombre) return null

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 50 }}
        >
          {label}:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: cambio.antes ? 'text.secondary' : 'warning.main',
              fontStyle: cambio.antes ? 'normal' : 'italic',
            }}
          >
            {antesNombre}
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
          <Typography
            variant="caption"
            sx={{
              color: cambio.despues ? 'success.main' : 'warning.main',
              fontWeight: 500,
            }}
          >
            {despuesNombre}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: 'action.hover',
        borderRadius: 1,
        borderLeft: 2,
        borderColor: 'info.main',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <SettingsIcon sx={{ fontSize: 14, color: 'info.main' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
          Cambios de Configuración
        </Typography>
      </Box>
      {renderCambio('Tipo', datos.tipo_dispositivo)}
      {renderCambio('Subtipo', datos.subtipo_dispositivo)}
    </Box>
  )
}

export const HistorialEventCard: React.FC<HistorialEventCardProps> = ({
  evento,
  onDeepLinkClick,
}) => {
  const categoria = getCategoriaFromTipoEvento(evento.tipo_evento)
  const config = CATEGORIA_CONFIGS[categoria]

  const handleDeepLinkClick = () => {
    if (evento.deep_link?.url && onDeepLinkClick) {
      onDeepLinkClick(evento.deep_link.url)
    }
  }

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: config.color,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Category Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: config.backgroundColor,
              color: config.color,
              flexShrink: 0,
            }}
          >
            {getCategoryIcon(categoria, evento.tipo_evento)}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={config.label}
                  size="small"
                  sx={{
                    backgroundColor: config.backgroundColor,
                    color: config.color,
                    fontWeight: 500,
                    height: 24,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    backgroundColor: 'action.hover',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  {evento.tipo_evento_display}
                </Typography>
              </Box>

              {/* Deep link button */}
              {evento.deep_link && (
                <Tooltip title="Ver detalle">
                  <IconButton
                    size="small"
                    onClick={handleDeepLinkClick}
                    sx={{ color: config.color }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                mb: 1,
              }}
            >
              {evento.descripcion_automatica}
            </Typography>

            {/* Device configuration change details */}
            {evento.tipo_evento === 'INTERVENCION_DISPOSITIVO_CAMBIO' &&
              evento.datos_evento &&
              isDispositivoCambioData(evento.datos_evento) && (
                <DispositivoCambioDetails datos={evento.datos_evento} />
              )}

            {/* Footer row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {/* Time */}
              <Tooltip title={formatFechaEvento(evento.fecha_evento)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(evento.fecha_evento)}
                  </Typography>
                </Box>
              </Tooltip>

              {/* User */}
              {evento.usuario && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {evento.usuario.nombre_completo || evento.usuario.username}
                  </Typography>
                </Box>
              )}

              {/* Stage */}
              {evento.etapa && (
                <Chip
                  label={evento.etapa.tipo_etapa_display}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
