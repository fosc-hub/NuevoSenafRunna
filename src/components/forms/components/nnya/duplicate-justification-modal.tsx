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
  LinearProgress,
} from "@mui/material"
import { Warning as WarningIcon } from "@mui/icons-material"
import { MIN_CARACTERES_JUSTIFICACION } from "@/components/forms/constants/duplicate-thresholds"

interface DuplicateJustificationModalProps {
  /** Si el modal está abierto */
  open: boolean

  /** Callback al cerrar */
  onClose: () => void

  /** Callback al confirmar con justificación válida */
  onConfirm: (justification: string) => void

  /** Score del duplicado que se está ignorando */
  duplicateScore: number

  /** Número del legajo duplicado */
  legajoNumero: string

  /** Si está procesando la creación */
  isCreating?: boolean
}

/**
 * Modal para justificar la creación de un nuevo legajo
 * a pesar de encontrar un duplicado
 *
 * Características:
 * - Validación de longitud mínima (20 caracteres)
 * - Contador de caracteres
 * - Advertencia sobre auditoría
 * - Confirmación de doble paso
 *
 * @example
 * ```tsx
 * <DuplicateJustificationModal
 *   open={showJustification}
 *   onClose={() => setShowJustification(false)}
 *   onConfirm={(text) => handleCreateWithJustification(text)}
 *   duplicateScore={0.95}
 *   legajoNumero="2024-1234"
 * />
 * ```
 */
const DuplicateJustificationModal: React.FC<DuplicateJustificationModalProps> = ({
  open,
  onClose,
  onConfirm,
  duplicateScore,
  legajoNumero,
  isCreating = false,
}) => {
  const [justification, setJustification] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const percentage = Math.round(duplicateScore * 100)
  const isValid = justification.trim().length >= MIN_CARACTERES_JUSTIFICACION
  const charactersLeft = MIN_CARACTERES_JUSTIFICACION - justification.trim().length

  /**
   * Maneja el cambio en el textarea
   */
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJustification(event.target.value)
    setError(null)
  }

  /**
   * Primera confirmación: muestra advertencia
   */
  const handleFirstConfirm = () => {
    if (!isValid) {
      setError(`La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION} caracteres`)
      return
    }
    setShowConfirmation(true)
  }

  /**
   * Segunda confirmación: ejecuta la creación
   */
  const handleFinalConfirm = () => {
    onConfirm(justification.trim())
  }

  /**
   * Cancela la operación
   */
  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false)
    } else {
      setJustification("")
      setError(null)
      setShowConfirmation(false)
      onClose()
    }
  }

  /**
   * Renderiza el contenido según el paso
   */
  const renderContent = () => {
    if (showConfirmation) {
      // Paso 2: Confirmación final
      return (
        <>
          <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ÚLTIMA CONFIRMACIÓN
            </Typography>
            <Typography variant="body2">
              Estás a punto de crear un nuevo legajo ignorando un duplicado con{" "}
              <strong>{percentage}%</strong> de coincidencia.
            </Typography>
          </Alert>

          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Legajo que se ignorará:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {legajoNumero}
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tu justificación:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {justification}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Importante:</strong>
            </Typography>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Esta acción quedará registrada en la auditoría del sistema</li>
              <li>Tu supervisor será notificado de esta creación forzada</li>
              <li>La justificación será revisada por el equipo de supervisión</li>
            </ul>
          </Alert>
        </>
      )
    }

    // Paso 1: Ingresar justificación
    return (
      <>
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            CONFIRMACIÓN REQUERIDA
          </Typography>
          <Typography variant="body2">
            Estás a punto de crear un NUEVO legajo a pesar de existir uno con{" "}
            <strong>{percentage}%</strong> de coincidencia (Legajo {legajoNumero}).
          </Typography>
        </Alert>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ IMPORTANTE:</strong>
          </Typography>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>Esto podría generar un duplicado en el sistema</li>
            <li>Se registrará esta acción en la auditoría</li>
            <li>Deberás justificar la creación del nuevo legajo</li>
          </ul>
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Motivo para crear nuevo legajo (obligatorio):
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={6}
          value={justification}
          onChange={handleChange}
          placeholder="Ej: Se trata de hermanos con el mismo apellido pero diferentes DNI. Confirmado por el equipo social que son dos personas distintas..."
          error={!!error}
          helperText={
            error ||
            (charactersLeft > 0
              ? `Faltan ${charactersLeft} caracteres`
              : `${justification.trim().length} caracteres`)
          }
          disabled={isCreating}
          sx={{ mb: 2 }}
        />

        {/* Barra de progreso de caracteres */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min((justification.trim().length / MIN_CARACTERES_JUSTIFICACION) * 100, 100)}
            color={isValid ? "success" : "warning"}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      </>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={isCreating ? undefined : handleCancel}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isCreating}
    >
      <DialogTitle>
        {showConfirmation ? "Confirmar Creación de Nuevo Legajo" : "Justificar Creación de Nuevo Legajo"}
      </DialogTitle>

      <DialogContent>{renderContent()}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isCreating} variant="outlined">
          {showConfirmation ? "Volver" : "Cancelar"}
        </Button>

        <Button
          onClick={showConfirmation ? handleFinalConfirm : handleFirstConfirm}
          variant="contained"
          color={showConfirmation ? "error" : "primary"}
          disabled={!isValid || isCreating}
        >
          {isCreating ? "Creando..." : showConfirmation ? "✅ Confirmar Creación" : "Continuar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DuplicateJustificationModal
