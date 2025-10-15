"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
} from "@mui/material"
import {
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  SwapHoriz as TransferIcon,
  Email as EmailIcon,
} from "@mui/icons-material"

interface PermisosSolicitudModalProps {
  /** Si el modal está abierto */
  open: boolean

  /** Callback al cerrar */
  onClose: () => void

  /** Callback al enviar solicitud */
  onSubmit: (requestData: {
    tipo: "acceso_temporal" | "transferencia"
    motivo: string
  }) => void

  /** Datos del legajo al que se solicita acceso */
  legajoInfo: {
    numero: string
    zona: string
    responsable: {
      nombre: string
      email?: string
    }
  }

  /** Si está enviando la solicitud */
  isSubmitting?: boolean
}

/**
 * Modal para solicitar permisos sobre un legajo de otra zona
 *
 * Características:
 * - Opción de acceso temporal o transferencia
 * - Campo de motivo obligatorio
 * - Información del responsable del legajo
 * - Envío de notificación al responsable
 *
 * @example
 * ```tsx
 * <PermisosSolicitudModal
 *   open={showPermisos}
 *   onClose={() => setShowPermisos(false)}
 *   onSubmit={(data) => handleSolicitarPermiso(data)}
 *   legajoInfo={{
 *     numero: "2024-1234",
 *     zona: "Zona Norte",
 *     responsable: { nombre: "Juan Director", email: "juan@senaf.gob.ar" }
 *   }}
 * />
 * ```
 */
const PermisosSolicitudModal: React.FC<PermisosSolicitudModalProps> = ({
  open,
  onClose,
  onSubmit,
  legajoInfo,
  isSubmitting = false,
}) => {
  const [tipoSolicitud, setTipoSolicitud] = useState<"acceso_temporal" | "transferencia">(
    "acceso_temporal"
  )
  const [motivo, setMotivo] = useState("")
  const [error, setError] = useState<string | null>(null)

  const isValid = motivo.trim().length >= 10

  /**
   * Maneja el cambio de tipo de solicitud
   */
  const handleTipoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTipoSolicitud(event.target.value as "acceso_temporal" | "transferencia")
    setError(null)
  }

  /**
   * Maneja el cambio en el motivo
   */
  const handleMotivoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMotivo(event.target.value)
    setError(null)
  }

  /**
   * Envía la solicitud
   */
  const handleSubmit = () => {
    if (!isValid) {
      setError("El motivo debe tener al menos 10 caracteres")
      return
    }

    onSubmit({
      tipo: tipoSolicitud,
      motivo: motivo.trim(),
    })
  }

  /**
   * Cancela y cierra
   */
  const handleCancel = () => {
    setTipoSolicitud("acceso_temporal")
    setMotivo("")
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockIcon color="warning" />
          Solicitar Acceso al Legajo
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ No tienes permisos para acceder a este legajo</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            El legajo pertenece a otra zona. Puedes solicitar acceso temporal o transferencia del
            legajo.
          </Typography>
        </Alert>

        {/* Información del legajo y responsable */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Información del Legajo:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Número de Legajo:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {legajoInfo.numero}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Zona:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {legajoInfo.zona}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Responsable:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {legajoInfo.responsable.nombre}
              </Typography>
              {legajoInfo.responsable.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <EmailIcon fontSize="small" sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {legajoInfo.responsable.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Tipo de solicitud */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Tipo de solicitud:</FormLabel>
          <RadioGroup value={tipoSolicitud} onChange={handleTipoChange}>
            <FormControlLabel
              value="acceso_temporal"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonAddIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Acceso Temporal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Solicitar permiso temporal para consultar y vincular demanda
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={isSubmitting}
            />
            <FormControlLabel
              value="transferencia"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TransferIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Transferencia de Legajo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Solicitar transferencia permanente del legajo a tu zona
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={isSubmitting}
            />
          </RadioGroup>
        </FormControl>

        {/* Motivo */}
        <Typography variant="subtitle2" gutterBottom>
          Motivo de la solicitud (obligatorio):
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={motivo}
          onChange={handleMotivoChange}
          placeholder={
            tipoSolicitud === "acceso_temporal"
              ? "Ej: Se recibió nueva demanda relacionada al mismo NNyA. Necesito vincularla al legajo existente..."
              : "Ej: El NNyA se mudó a nuestra zona. Solicitamos transferencia del legajo para continuar seguimiento..."
          }
          error={!!error}
          helperText={
            error ||
            (motivo.trim().length < 10
              ? `Mínimo 10 caracteres (actual: ${motivo.trim().length})`
              : `${motivo.trim().length} caracteres`)
          }
          disabled={isSubmitting}
        />

        {/* Información adicional */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            Tu solicitud será enviada al responsable del legajo. Recibirás una notificación cuando
            sea procesada.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isSubmitting} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || isSubmitting}
          startIcon={tipoSolicitud === "acceso_temporal" ? <PersonAddIcon /> : <TransferIcon />}
        >
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermisosSolicitudModal
