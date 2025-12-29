"use client"

/**
 * Rechazar Cierre Modal - MED-MPI-CIERRE
 *
 * Modal for Jefe Zonal to reject closure report and return to Estado 3
 *
 * REFACTORED: Uses BaseDialog + useFormSubmission hook
 * Previous implementation: ~70 lines of form logic
 * Current implementation: ~40 lines with hook
 * Savings: ~30 lines of duplicate boilerplate
 */

import React, { useState } from "react"
import {
  TextField,
  Typography,
  Alert,
  Paper,
  Divider,
} from "@mui/material"
import WarningIcon from "@mui/icons-material/Warning"
import CancelIcon from "@mui/icons-material/Cancel"
import { rechazarCierre } from "../../api/informe-cierre-api-service"
import type { InformeCierre } from "../../types/informe-cierre-api"
import BaseDialog from "@/components/shared/BaseDialog"
import { formatDateLocaleAR } from "@/utils/dateUtils"
import { useFormSubmission } from "@/hooks"

// ============================================================================
// PROPS
// ============================================================================

interface RechazarCierreModalProps {
  open: boolean
  onClose: () => void
  medidaId: number
  informe: InformeCierre | null
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RechazarCierreModal: React.FC<RechazarCierreModalProps> = ({
  open,
  onClose,
  medidaId,
  informe,
  onSuccess,
}) => {
  const [observaciones, setObservaciones] = useState("")

  const { submit, isLoading, error, close } = useFormSubmission({
    onSubmit: async () => {
      await rechazarCierre(medidaId, {
        observaciones: observaciones.trim(),
      })
    },
    validate: () => !observaciones.trim() ? "Las observaciones son obligatorias al rechazar un informe de cierre" : undefined,
    showSuccessToast: false,
    showErrorToast: false, // BaseDialog handles error display
    onSuccess: () => onSuccess?.(),
    onReset: () => setObservaciones(""),
    onClose,
  })

  const handleSubmit = () => submit({})
  const handleClose = () => close()

  // ========== Render ==========
  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      title="Rechazar Informe de Cierre"
      titleIcon={<CancelIcon />}
      showCloseButton={!isLoading}
      error={error}
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "text",
          disabled: isLoading
        },
        {
          label: isLoading ? "Rechazando..." : "Rechazar Informe",
          onClick: handleSubmit,
          variant: "contained",
          color: "error",
          disabled: isLoading || !observaciones.trim(),
          loading: isLoading
        }
      ]}
    >
      {/* Warning Alert */}
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Consecuencias del rechazo:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>La medida volverá a Estado 3 (Pendiente de informe de cierre)</li>
          <li>El Equipo Técnico será notificado para realizar correcciones</li>
          <li>El informe actual se marcará como rechazado</li>
        </ul>
      </Alert>

      {/* Current Informe Context */}
      {informe && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Informe Actual (Para Referencia)
          </Typography>
          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" color="text.secondary" display="block">
            Elaborado por: {informe.elaborado_por_detalle.nombre_completo}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Fecha: {formatDateLocaleAR(informe.fecha_registro)}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {informe.observaciones}
          </Typography>

          {informe.adjuntos.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Adjuntos: {informe.adjuntos.length} archivo(s)
            </Typography>
          )}
        </Paper>
      )}

      {/* Observaciones de Rechazo */}
      <TextField
        label="Observaciones de Rechazo *"
        multiline
        rows={5}
        fullWidth
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Especifique qué aspectos deben corregirse o mejorarse en el informe..."
        helperText="Explique detalladamente las razones del rechazo y qué correcciones debe realizar el Equipo Técnico"
        error={!!error && !observaciones.trim()}
        disabled={isLoading}
      />
    </BaseDialog>
  )
}
