"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  type DialogProps,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

export interface BaseDialogAction {
  label: string
  onClick: () => void | Promise<void>
  variant?: "text" | "outlined" | "contained"
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning"
  disabled?: boolean
  loading?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export interface BaseDialogProps extends Omit<DialogProps, "title"> {
  /** Dialog title */
  title: string | React.ReactNode
  /** Optional icon to display before title */
  titleIcon?: React.ReactNode
  /** Dialog content */
  children: React.ReactNode
  /** Actions to display in footer */
  actions?: BaseDialogAction[]
  /** Show close button in header */
  showCloseButton?: boolean
  /** Error message to display at top of content */
  error?: string | null
  /** Loading state */
  loading?: boolean
  /** Custom loading message */
  loadingMessage?: string
  /** Warning message to display at bottom of content */
  warning?: string | null
  /** Info message to display */
  info?: string | null
  /** Success message to display */
  success?: string | null
  /** Center the title */
  centerTitle?: boolean
  /** Custom title sx */
  titleSx?: object
  /** Custom content sx */
  contentSx?: object
  /** Custom actions sx */
  actionsSx?: object
}

/**
 * Shared BaseDialog component for standardized dialogs
 *
 * Consolidates duplicate dialog patterns from:
 * - CancelActividadModal
 * - EditActividadModal
 * - DesvincularVinculoDialog
 * - CrearVinculoLegajoDialog
 * - And other dialog components
 *
 * @example
 * // Basic dialog with custom actions
 * <BaseDialog
 *   open={open}
 *   onClose={onClose}
 *   title="Confirm Action"
 *   actions={[
 *     { label: "Cancel", onClick: onClose, variant: "text" },
 *     { label: "Confirm", onClick: handleConfirm, variant: "contained", color: "primary" }
 *   ]}
 * >
 *   <Typography>Are you sure?</Typography>
 * </BaseDialog>
 *
 * @example
 * // With error and loading states
 * <BaseDialog
 *   open={open}
 *   onClose={onClose}
 *   title="Delete Item"
 *   titleIcon={<DeleteIcon />}
 *   error={errorMessage}
 *   loading={isDeleting}
 *   loadingMessage="Deleting..."
 *   warning="This action cannot be undone"
 *   actions={[
 *     { label: "Cancel", onClick: onClose },
 *     { label: "Delete", onClick: handleDelete, color: "error", disabled: isDeleting }
 *   ]}
 * >
 *   <Typography>Delete confirmation content</Typography>
 * </BaseDialog>
 */
const BaseDialog: React.FC<BaseDialogProps> = ({
  title,
  titleIcon,
  children,
  actions = [],
  showCloseButton = true,
  error,
  loading = false,
  loadingMessage = "Cargando...",
  warning,
  info,
  success,
  centerTitle = false,
  titleSx = {},
  contentSx = {},
  actionsSx = {},
  onClose,
  maxWidth = "sm",
  fullWidth = true,
  PaperProps = {},
  ...dialogProps
}) => {
  const handleActionClick = async (action: BaseDialogAction) => {
    if (action.onClick) {
      await action.onClick()
    }
  }

  return (
    <Dialog
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: 3, ...PaperProps.sx },
        ...PaperProps,
      }}
      {...dialogProps}
    >
      <DialogTitle
        sx={{
          textAlign: centerTitle ? "center" : "left",
          fontWeight: 600,
          fontSize: "1.25rem",
          position: "relative",
          pb: 1,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 1,
          ...titleSx,
        }}
      >
        {titleIcon}
        {typeof title === "string" ? <span>{title}</span> : title}
        {showCloseButton && onClose && (
          <IconButton
            onClick={(e) => onClose(e, "escapeKeyDown")}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
            aria-label="cerrar"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, ...contentSx }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              {loadingMessage}
            </Typography>
          </Box>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && !loading && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Info Alert */}
        {info && !loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        {/* Content */}
        {children}

        {/* Warning Alert */}
        {warning && !loading && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {warning}
          </Alert>
        )}
      </DialogContent>

      {/* Actions */}
      {actions.length > 0 && (
        <DialogActions sx={{ px: 4, pb: 3, pt: 2, gap: 1, ...actionsSx }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleActionClick(action)}
              variant={action.variant || "text"}
              color={action.color || "primary"}
              disabled={action.disabled || loading}
              startIcon={action.loading ? <CircularProgress size={16} /> : action.startIcon}
              endIcon={action.endIcon}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default BaseDialog
