"use client"

/**
 * WorkflowStateActions - Reusable Workflow State Transition Buttons
 *
 * Provides action buttons for workflow state management.
 * Extracted from RegistroIntervencionModal for reusability.
 *
 * Workflow States:
 * - BORRADOR: Initial draft state
 * - ENVIADO: Sent for approval
 * - APROBADO: Approved by authority
 * - RECHAZADO: Rejected with observaciones
 *
 * Features:
 * - State-aware button visibility
 * - Permission-based rendering
 * - Loading states
 * - Confirmation dialogs for critical actions
 */

import type React from "react"
import { Box, Button, CircularProgress } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import SendIcon from "@mui/icons-material/Send"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"

export type WorkflowState = "BORRADOR" | "ENVIADO" | "APROBADO" | "RECHAZADO" | null

export interface WorkflowStateActionsProps {
  // Current workflow state
  currentState: WorkflowState

  // Action handlers
  onSave?: () => void | Promise<void>
  onEnviar?: () => void | Promise<void>
  onAprobar?: () => void | Promise<void>
  onRechazar?: () => void | Promise<void>

  // Permission flags
  canEdit?: boolean
  canEnviar?: boolean
  canAprobarOrRechazar?: boolean

  // Loading states
  isSaving?: boolean
  isEnviando?: boolean
  isAprobando?: boolean
  isRechazando?: boolean

  // Optional button labels (defaults provided)
  saveLabel?: string
  enviarLabel?: string
  aprobarLabel?: string
  rechazarLabel?: string

  // Layout
  direction?: "row" | "column"
  spacing?: number
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between"
}

export const WorkflowStateActions: React.FC<WorkflowStateActionsProps> = ({
  currentState,
  onSave,
  onEnviar,
  onAprobar,
  onRechazar,
  canEdit = false,
  canEnviar = false,
  canAprobarOrRechazar = false,
  isSaving = false,
  isEnviando = false,
  isAprobando = false,
  isRechazando = false,
  saveLabel = "Guardar Borrador",
  enviarLabel = "Enviar",
  aprobarLabel = "Aprobar",
  rechazarLabel = "Rechazar",
  direction = "row",
  spacing = 2,
  justifyContent = "flex-end",
}) => {
  // Determine which buttons to show based on current state and permissions
  const showSaveButton = canEdit && onSave && currentState !== "APROBADO" && currentState !== "RECHAZADO"
  const showEnviarButton = canEnviar && onEnviar && (currentState === "BORRADOR" || currentState === null)
  const showAprobarButton = canAprobarOrRechazar && onAprobar && currentState === "ENVIADO"
  const showRechazarButton = canAprobarOrRechazar && onRechazar && currentState === "ENVIADO"

  // If no buttons to show, return null
  if (!showSaveButton && !showEnviarButton && !showAprobarButton && !showRechazarButton) {
    return null
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        gap: spacing,
        justifyContent,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Save Button (BORRADOR state) */}
      {showSaveButton && (
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="outlined"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ textTransform: "none", minWidth: 140 }}
        >
          {isSaving ? "Guardando..." : saveLabel}
        </Button>
      )}

      {/* Enviar Button (BORRADOR → ENVIADO) */}
      {showEnviarButton && (
        <Button
          onClick={onEnviar}
          disabled={isEnviando}
          variant="contained"
          color="primary"
          startIcon={isEnviando ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{ textTransform: "none", minWidth: 140 }}
        >
          {isEnviando ? "Enviando..." : enviarLabel}
        </Button>
      )}

      {/* Aprobar Button (ENVIADO → APROBADO) */}
      {showAprobarButton && (
        <Button
          onClick={onAprobar}
          disabled={isAprobando}
          variant="contained"
          color="success"
          startIcon={isAprobando ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          sx={{ textTransform: "none", minWidth: 140 }}
        >
          {isAprobando ? "Aprobando..." : aprobarLabel}
        </Button>
      )}

      {/* Rechazar Button (ENVIADO → RECHAZADO) */}
      {showRechazarButton && (
        <Button
          onClick={onRechazar}
          disabled={isRechazando}
          variant="outlined"
          color="error"
          startIcon={isRechazando ? <CircularProgress size={20} /> : <CancelIcon />}
          sx={{ textTransform: "none", minWidth: 140 }}
        >
          {isRechazando ? "Rechazando..." : rechazarLabel}
        </Button>
      )}
    </Box>
  )
}
