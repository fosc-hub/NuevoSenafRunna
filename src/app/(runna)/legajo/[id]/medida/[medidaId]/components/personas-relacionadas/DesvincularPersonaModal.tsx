"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Warning as WarningIcon } from "@mui/icons-material"
import { useDesvincularPersonaRelacionada } from "../../hooks/usePersonasRelacionadas"
import {
  validateJustificacionDesvincular,
  MIN_CARACTERES_JUSTIFICACION_DESVINCULAR,
  type PersonaVinculo,
} from "../../types/personas-relacionadas-api"

interface DesvincularPersonaModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  legajoId: number
  persona: PersonaVinculo
}

export default function DesvincularPersonaModal({
  open,
  onClose,
  onSuccess,
  legajoId,
  persona,
}: DesvincularPersonaModalProps) {
  const [justificacion, setJustificacion] = useState("")
  const [error, setError] = useState<string | null>(null)

  const desvincularMutation = useDesvincularPersonaRelacionada(legajoId)

  const { persona_destino_info: info } = persona

  const handleSubmit = async () => {
    // Validate
    const validationError = validateJustificacionDesvincular(justificacion)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    try {
      await desvincularMutation.mutateAsync({
        vinculoId: persona.id,
        justificacion: justificacion.trim(),
      })
      // Reset state
      setJustificacion("")
      onSuccess()
    } catch (err) {
      // Error is handled by the mutation hook (toast)
      console.error("Error desvincular:", err)
    }
  }

  const handleClose = () => {
    if (desvincularMutation.isPending) return
    setJustificacion("")
    setError(null)
    onClose()
  }

  const charCount = justificacion.trim().length
  const isValidLength = charCount >= MIN_CARACTERES_JUSTIFICACION_DESVINCULAR

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Desvincular Persona</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Esta accion desvinculara a <strong>{info.nombre} {info.apellido}</strong> como{" "}
            <strong>{persona.tipo_vinculo_nombre}</strong> del NNyA.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Informacion del vinculo:
          </Typography>
          <Box sx={{ pl: 2, color: "text.secondary" }}>
            <Typography variant="body2">
              <strong>Nombre:</strong> {info.nombre} {info.apellido}
            </Typography>
            <Typography variant="body2">
              <strong>DNI:</strong> {info.dni || "Sin DNI"}
            </Typography>
            <Typography variant="body2">
              <strong>Tipo de Vinculo:</strong> {persona.tipo_vinculo_nombre}
            </Typography>
            {persona.conviviente && (
              <Typography variant="body2">
                <strong>Conviviente:</strong> Si
              </Typography>
            )}
            {persona.legalmente_responsable && (
              <Typography variant="body2">
                <strong>Legalmente Responsable:</strong> Si
              </Typography>
            )}
          </Box>
        </Box>

        <TextField
          label="Justificacion (obligatoria)"
          placeholder="Explique el motivo de la desvinculacion..."
          multiline
          rows={4}
          fullWidth
          value={justificacion}
          onChange={(e) => {
            setJustificacion(e.target.value)
            setError(null)
          }}
          error={!!error || (charCount > 0 && !isValidLength)}
          helperText={
            error ||
            `${charCount}/${MIN_CARACTERES_JUSTIFICACION_DESVINCULAR} caracteres minimos`
          }
          disabled={desvincularMutation.isPending}
          sx={{ mt: 2 }}
        />

        <Alert severity="info" sx={{ mt: 2 }} icon={false}>
          <Typography variant="caption">
            Nota: El vinculo quedara registrado en el historial con fecha, usuario y
            justificacion para trazabilidad.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={desvincularMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!isValidLength || desvincularMutation.isPending}
          startIcon={
            desvincularMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {desvincularMutation.isPending ? "Desvinculando..." : "Confirmar Desvinculacion"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
