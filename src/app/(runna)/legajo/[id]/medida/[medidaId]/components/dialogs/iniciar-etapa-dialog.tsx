"use client"

/**
 * Iniciar Etapa Dialog
 *
 * Dialog for confirming creation of a new etapa (Innovación, Prórroga, Cese).
 * Allows user to add optional initial observations.
 */

import React, { useState } from "react"
import {
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import type { TipoEtapa } from "../../types/estado-etapa"
import { getEtapaTipoLabel } from "../../api/etapa-api-service"
import BaseDialog from "@/components/shared/BaseDialog"

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
    <BaseDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      title={`Iniciar Etapa de ${etapaLabel}`}
      titleIcon={<PlayArrowIcon />}
      showCloseButton={!isLoading}
      info={`Se creará una nueva etapa de ${etapaLabel} para esta medida. La etapa comenzará en su estado inicial.`}
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "text",
          disabled: isLoading
        },
        {
          label: isLoading ? "Iniciando..." : `Iniciar Etapa de ${etapaLabel}`,
          onClick: handleConfirm,
          variant: "contained",
          color: "primary",
          disabled: isLoading,
          loading: isLoading
        }
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
    </BaseDialog>
  )
}
