"use client"

/**
 * Iniciar Etapa Dialog
 *
 * Dialog for confirming creation of a new etapa (Innovación, Prórroga, Cese).
 * Allows user to add optional initial observations.
 */

import React, { useState } from "react"
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
} from "@mui/material"
import type { TipoEtapa } from "../../types/estado-etapa"
import { getEtapaTipoLabel } from "../../api/etapa-api-service"

interface IniciarEtapaDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (observaciones?: string) => void
  tipoEtapa: TipoEtapa
  isLoading?: boolean
}

export default function IniciarEtapaDialog({
  open,
  onClose,
  onConfirm,
  tipoEtapa,
  isLoading = false,
}: IniciarEtapaDialogProps) {
  const [observaciones, setObservaciones] = useState("")

  const etapaLabel = getEtapaTipoLabel(tipoEtapa)

  const handleConfirm = () => {
    onConfirm(observaciones.trim() || undefined)
  }

  const handleClose = () => {
    if (!isLoading) {
      setObservaciones("")
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>Iniciar Etapa de {etapaLabel}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Alert severity="info">
            Se creará una nueva etapa de <strong>{etapaLabel}</strong> para esta medida.
            La etapa comenzará en su estado inicial.
          </Alert>

          <TextField
            label="Observaciones (opcional)"
            multiline
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder={`Ingrese observaciones iniciales para la etapa de ${etapaLabel}...`}
            disabled={isLoading}
            fullWidth
          />

          <Typography variant="caption" color="text.secondary">
            Puede agregar observaciones sobre el inicio de esta etapa. Este campo es opcional.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isLoading}
          color="primary"
        >
          {isLoading ? "Iniciando..." : `Iniciar Etapa de ${etapaLabel}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
