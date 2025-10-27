"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { MIN_CARACTERES_JUSTIFICACION_VINCULO } from "@/app/(runna)/legajo-mesa/types/vinculo-types"
import { useVinculos } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useVinculos"

// Type matching actual API response for demanda vinculos
interface VinculoLegajoDemanda {
  id: number
  legajo_origen: number
  legajo_origen_numero: string
  tipo_vinculo: {
    id: number
    codigo: string
    nombre: string
    descripcion: string
    activo: boolean
  }
  tipo_destino: string
  destino_info: {
    tipo: string
    id: number
    objetivo?: string
    fecha_ingreso?: string
  }
  justificacion: string
  activo: boolean
  creado_por: number
  creado_por_username: string
  creado_en: string
  desvinculado_por: number | null
  desvinculado_en: string | null
  justificacion_desvincular: string | null
}

interface DesvincularVinculoDialogProps {
  open: boolean
  onClose: () => void
  vinculo: VinculoLegajoDemanda | null
  onVinculoDesvinculado?: () => void
}

export default function DesvincularVinculoDialog({
  open,
  onClose,
  vinculo,
  onVinculoDesvinculado,
}: DesvincularVinculoDialogProps) {
  const theme = useTheme()
  const { desvincular, loading, error, clearError } = useVinculos()

  const [justificacion, setJustificacion] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  // Helper to format destino info
  const formatDestinoInfo = (vinculo: VinculoLegajoDemanda) => {
    const { tipo_destino, destino_info } = vinculo
    if (tipo_destino === "demanda") {
      return `Demanda #${destino_info.id}${destino_info.objetivo ? ` - ${destino_info.objetivo}` : ""}`
    } else if (tipo_destino === "legajo") {
      return `Legajo #${destino_info.id}`
    } else if (tipo_destino === "medida") {
      return `Medida #${destino_info.id}`
    }
    return `${tipo_destino} #${destino_info.id}`
  }

  // Reset form when dialog closes or vinculo changes
  useEffect(() => {
    if (!open) {
      setJustificacion("")
      setValidationError(null)
      clearError()
    }
  }, [open, clearError])

  const validateJustificacion = (): boolean => {
    if (!justificacion.trim()) {
      setValidationError("La justificación es obligatoria")
      return false
    }

    if (justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO) {
      setValidationError(
        `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
      )
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!vinculo) return

    if (!validateJustificacion()) {
      return
    }

    const result = await desvincular(vinculo.id, {
      justificacion_desvincular: justificacion.trim(),
    })

    if (result) {
      // Success - close dialog and notify parent
      onClose()
      if (onVinculoDesvinculado) {
        onVinculoDesvinculado()
      }
    }
    // Error handling is done by the hook and displayed in the dialog
  }

  const handleCancel = () => {
    onClose()
  }

  const caracteresFaltantes = Math.max(
    0,
    MIN_CARACTERES_JUSTIFICACION_VINCULO - justificacion.length
  )
  const isJustificacionValid = justificacion.length >= MIN_CARACTERES_JUSTIFICACION_VINCULO

  if (!vinculo) {
    return null
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkOffIcon color="error" />
            <Typography variant="h6">Desvincular Legajo</Typography>
          </Box>
          <IconButton aria-label="cerrar" onClick={handleCancel} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Warning Alert */}
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            <Typography variant="body2" fontWeight={500}>
              ¿Está seguro que desea desvincular este legajo?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Esta acción no se puede deshacer. El vínculo quedará inactivo pero se preservará
              en el historial con fines de auditoría.
            </Typography>
          </Alert>

          {/* Vinculo Details */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Detalles del Vínculo
            </Typography>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
              {/* Tipo Vínculo */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tipo de Vínculo
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={vinculo.tipo_vinculo.nombre}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Destino */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Vinculado a
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formatDestinoInfo(vinculo)}
                </Typography>
              </Box>

              {/* Justificación Original */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Justificación Original
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontStyle: "italic",
                    color: "text.secondary",
                    maxHeight: "100px",
                    overflowY: "auto",
                  }}
                >
                  &ldquo;{vinculo.justificacion}&rdquo;
                </Typography>
              </Box>

              {/* Creado por */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Creado por
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {vinculo.creado_por_username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(vinculo.creado_en).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Justificación del Desvínculo */}
          <Box>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Justificación para Desvincular"
              placeholder={`Explique detalladamente el motivo del desvínculo (mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres)...`}
              value={justificacion}
              onChange={(e) => {
                setJustificacion(e.target.value)
                setValidationError(null)
              }}
              error={Boolean(validationError)}
              helperText={validationError}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography
                variant="caption"
                color={isJustificacionValid ? "success.main" : "text.secondary"}
              >
                {justificacion.length} / {MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres
              </Typography>
              {!isJustificacionValid && caracteresFaltantes > 0 && (
                <Typography variant="caption" color="warning.main">
                  Faltan {caracteresFaltantes} caracteres
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <LinkOffIcon />}
        >
          {loading ? "Desvinculando..." : "Desvincular"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
