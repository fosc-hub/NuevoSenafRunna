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
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Documentos Adjuntos ({adjuntos.length})
        </Typography>
      </Box>

      {/* Status chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          icon={tieneResolucion ? <CheckCircleIcon /> : <DescriptionIcon />}
          label={
            tieneResolucion
              ? "Resolución Judicial Cargada"
              : "Falta Resolución Judicial"
          }
          color={tieneResolucion ? "success" : "warning"}
          size="small"
        />
        {tieneCedula && (
          <Chip
            icon={<ArticleIcon />}
            label="Cédula de Notificación"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
        {tieneAcuse && (
          <Chip
            icon={<CheckCircleIcon />}
            label="Acuse de Recibo"
            color="info"
            variant="outlined"
            size="small"
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
        <Paper variant="outlined">
          <List disablePadding>
            {adjuntos.map((adjunto, index) => (
              <React.Fragment key={adjunto.id}>
                {index > 0 && <Box sx={{ borderTop: 1, borderColor: "divider" }} />}
                <ListItem
                  sx={{
                    py: 2,
                    backgroundColor: getAdjuntoBackground(adjunto.tipo_adjunto),
                  }}
                >
                  <ListItemIcon>
                    {getAdjuntoIcon(adjunto.tipo_adjunto)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {TIPO_ADJUNTO_LABELS[adjunto.tipo_adjunto]}
                        </Typography>
                        {adjunto.tipo_adjunto === TipoAdjuntoRatificacion.RESOLUCION_JUDICIAL && (
                          <Chip
                            label="Obligatorio"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Cargado: {formatDate(adjunto.fecha_carga)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Por: {adjunto.usuario_carga_nombre || extractUserName(String(adjunto.usuario_carga))}
                        </Typography>
                        {adjunto.descripcion && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ fontStyle: "italic", mt: 0.5 }}
                          >
                            {adjunto.descripcion}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Descargar documento">
                      <IconButton edge="end" onClick={() => handleDownload(adjunto)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Info footer */}
      <Box sx={{ mt: 2 }}>
        <Alert severity="info" variant="outlined">
          <Typography variant="caption">
            Los adjuntos se cargan durante el registro de la ratificación judicial.
            Para modificar los adjuntos, contacte al administrador del sistema.
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}

export default AdjuntosRatificacion
