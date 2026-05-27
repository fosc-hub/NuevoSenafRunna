"use client"

/**
 * Iniciar Etapa Dialog
 *
 * Dialog for confirming creation of a new etapa (Innovación, Prórroga, Cese).
 * Allows user to add optional initial observations and, in medidas compartidas,
 * to pick the alcance (legajos_alcance) — grupal por default.
 */

import React, { useState } from "react"
import {
  TextField,
  Typography,
  Box,
} from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import type { TipoEtapa } from "../../types/estado-etapa"
import { getEtapaTipoLabel } from "../../api/etapa-api-service"
import BaseDialog from "@/components/shared/BaseDialog"
import {
  LegajosAlcanceSelector,
  type LegajosAlcanceLegajoPrimario,
} from "../medida/shared/LegajosAlcanceSelector"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

interface IniciarEtapaDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (observaciones?: string, legajosAlcance?: number[]) => void
  tipoEtapa: TipoEtapa
  isLoading?: boolean
  /** Legajo primario de la medida (para mostrar selector de alcance). */
  legajoPrimario?: LegajosAlcanceLegajoPrimario
  /** Legajos adicionales vinculados a la medida (GAP-11). */
  legajosAdicionales?: LegajoAdicionalMedida[]
}

export default function IniciarEtapaDialog({
  open,
  onClose,
  onConfirm,
  tipoEtapa,
  isLoading = false,
  legajoPrimario,
  legajosAdicionales = [],
}: IniciarEtapaDialogProps) {
  const [observaciones, setObservaciones] = useState("")
  const [legajosAlcance, setLegajosAlcance] = useState<number[]>([])
  // El selector reporta su validez (mode="especifico" + value=[] = inválido).
  // Bloqueamos el botón Iniciar Etapa hasta que el usuario pickee o vuelva a Grupal.
  const [scopeValido, setScopeValido] = useState(true)

  const etapaLabel = getEtapaTipoLabel(tipoEtapa)

  const handleConfirm = () => {
    // Siempre enviamos `legajosAlcance` cuando el selector estuvo disponible
    // (medida con legajos adicionales). Vacío [] = grupal explícito, no-vacío = subgrupo.
    // Cuando no hay legajos adicionales pasamos undefined para que el caller omita el campo.
    const shouldSendScope = (legajosAdicionales?.length ?? 0) > 0 && !!legajoPrimario
    onConfirm(
      observaciones.trim() || undefined,
      shouldSendScope ? legajosAlcance : undefined,
    )
  }

  const handleClose = () => {
    if (!isLoading) {
      setObservaciones("")
      setLegajosAlcance([])
      setScopeValido(true)
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
          disabled: isLoading || !scopeValido,
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

        {legajoPrimario && (
          <LegajosAlcanceSelector
            legajoPrimario={legajoPrimario}
            legajosAdicionales={legajosAdicionales}
            value={legajosAlcance}
            onChange={setLegajosAlcance}
            disabled={isLoading}
            helperText="Si la medida está compartida, puede acotar la etapa solo a algunos NNyAs."
            onValidityChange={setScopeValido}
          />
        )}

        <Typography variant="caption" color="text.secondary">
          Puede agregar observaciones sobre el inicio de esta etapa. Este campo es opcional.
        </Typography>
      </Box>
    </BaseDialog>
  )
}
