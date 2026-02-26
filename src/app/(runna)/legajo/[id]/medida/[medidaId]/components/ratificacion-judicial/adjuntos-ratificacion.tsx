"use client"

/**
 * AdjuntosRatificacion Component (MED-05)
 * Componente para visualizar adjuntos de Ratificación Judicial
 *
 * Características:
 * - Lista de adjuntos (RESOLUCION_JUDICIAL + CEDULA_NOTIFICACION + ACUSE_RECIBO)
 * - Download de archivos PDF
 * - Vista de documentos con distinción visual por tipo
 * - Solo lectura (adjuntos se suben con el POST de ratificación)
 *
 * Nota: Los adjuntos se cargan durante la creación de la ratificación (multipart/form-data).
 * No hay funcionalidad de upload/delete independiente en esta versión.
 */

import React from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from "@mui/material"
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Gavel as GavelIcon,
  Article as ArticleIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import {
  extractUserName,
  TIPO_ADJUNTO_LABELS,
  TipoAdjuntoRatificacion,
} from "../../types/ratificacion-judicial-api"
import type { RatificacionAdjunto } from "../../types/ratificacion-judicial-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface AdjuntosRatificacionProps {
  adjuntos: RatificacionAdjunto[]
  isLoading: boolean
  error: string | null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon for adjunto type
 */
const getAdjuntoIcon = (tipo: TipoAdjuntoRatificacion) => {
  switch (tipo) {
    case TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL:
      return <GavelIcon color="success" />
    case TipoAdjuntoRatificacion.CEDULA_NOTIFICACION:
      return <ArticleIcon color="primary" />
    case TipoAdjuntoRatificacion.ACUSE_RECIBO:
      return <CheckCircleIcon color="info" />
    default:
      return <PdfIcon color="action" />
  }
}

/**
 * Get background color for adjunto type
 */
const getAdjuntoBackground = (tipo: TipoAdjuntoRatificacion): string => {
  switch (tipo) {
    case TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL:
      return "rgba(76, 175, 80, 0.05)" // green tint for official resolution
    default:
      return "transparent"
  }
}

/**
 * Format date to local string
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdjuntosRatificacion: React.FC<AdjuntosRatificacionProps> = ({
  adjuntos,
  isLoading,
  error,
}) => {
  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const hasAdjuntos = adjuntos.length > 0

  // Categorize adjuntos
  const resolucionJudicial = adjuntos.find(
    (adj) => adj.tipo_adjunto === TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL
  )
  const cedulaNotificacion = adjuntos.find(
    (adj) => adj.tipo_adjunto === TipoAdjuntoRatificacion.CEDULA_NOTIFICACION
  )
  const acuseRecibo = adjuntos.find(
    (adj) => adj.tipo_adjunto === TipoAdjuntoRatificacion.ACUSE_RECIBO
  )

  const tieneResolucion = !!resolucionJudicial
  const tieneCedula = !!cedulaNotificacion
  const tieneAcuse = !!acuseRecibo

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle file download
   */
  const handleDownload = (adjunto: RatificacionAdjunto) => {
    // Use archivo_url if available, fallback to archivo
    const url = adjunto.archivo_url || adjunto.archivo
    window.open(url, "_blank")
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar adjuntos: {error}
      </Alert>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Documentos Adjuntos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({adjuntos.length})
          </Typography>
        </Box>
      </Box>

      {/* Status chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          icon={tieneResolucion ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <DescriptionIcon sx={{ fontSize: '14px !important' }} />}
          label={tieneResolucion ? "Resolución Cargada" : "Falta Resolución"}
          color={tieneResolucion ? "success" : "warning"}
          size="small"
          sx={{ height: 24, fontSize: '0.75rem' }}
        />
        {tieneCedula && (
          <Chip
            icon={<ArticleIcon sx={{ fontSize: '14px !important' }} />}
            label="Cédula"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ height: 24, fontSize: '0.75rem' }}
          />
        )}
        {tieneAcuse && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
            label="Acuse"
            color="info"
            variant="outlined"
            size="small"
            sx={{ height: 24, fontSize: '0.75rem' }}
          />
        )}
      </Box>

      {/* Adjuntos list */}
      {!hasAdjuntos ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay documentos adjuntos disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Los adjuntos se cargan al registrar la ratificación judicial
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <List disablePadding>
            {adjuntos.map((adjunto, index) => (
              <ListItem
                key={adjunto.id}
                sx={{
                  py: 1.25,
                  px: 2,
                  borderBottom: index < adjuntos.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  backgroundColor: getAdjuntoBackground(adjunto.tipo_adjunto),
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar sx={{
                    width: 32,
                    height: 32,
                    bgcolor: adjunto.tipo_adjunto === TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL ? 'success.50' : 'grey.50',
                    color: adjunto.tipo_adjunto === TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL ? 'success.main' : 'grey.600'
                  }}>
                    {React.cloneElement(getAdjuntoIcon(adjunto.tipo_adjunto) as React.ReactElement, { sx: { fontSize: 18 } })}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {TIPO_ADJUNTO_LABELS[adjunto.tipo_adjunto]}
                      </Typography>
                      {adjunto.tipo_adjunto === TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL && (
                        <Chip
                          label="Principal"
                          size="small"
                          color="success"
                          sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                        {formatDate(adjunto.fecha_carga)} • Por: {adjunto.usuario_carga_nombre || extractUserName(String(adjunto.usuario_carga))}
                      </Typography>
                      {adjunto.descripcion && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ fontStyle: "italic", mt: 0.2, color: 'text.disabled', fontSize: '0.65rem' }}
                        >
                          {adjunto.descripcion}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <IconButton size="small" onClick={() => handleDownload(adjunto)} color="primary">
                  <DownloadIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Info footer - Compact */}
      <Box sx={{ mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'rgba(2, 136, 209, 0.03)', borderRadius: 1.5, border: '1px solid', borderColor: 'rgba(2, 136, 209, 0.1)' }}>
          <DescriptionIcon sx={{ fontSize: 16, color: 'info.main' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Los adjuntos no son modificables desde aquí. Contacte al administrador si requiere cambios.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default AdjuntosRatificacion
