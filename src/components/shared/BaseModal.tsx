"use client"

import React from "react"
import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  type ModalProps,
  type PaperProps,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

export interface BaseModalAction {
  label: string
  onClick: () => void | Promise<void>
  variant?: "text" | "outlined" | "contained"
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning"
  disabled?: boolean
  loading?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
}

export interface BaseModalTab {
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface BaseModalProps extends Omit<ModalProps, "children"> {
  /** Modal title */
  title: string | React.ReactNode
  /** Optional icon to display before title */
  titleIcon?: React.ReactNode
  /** Modal content */
  children: React.ReactNode
  /** Actions to display in footer */
  actions?: BaseModalAction[]
  /** Tabs configuration (optional) */
  tabs?: BaseModalTab[]
  /** Active tab index (when using tabs) */
  activeTab?: number
  /** Tab change handler (when using tabs) */
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void
  /** Show close button in header */
  showCloseButton?: boolean
  /** Show divider after header */
  showHeaderDivider?: boolean
  /** Show divider before footer */
  showFooterDivider?: boolean
  /** Error message to display at top of content */
  error?: string | null
  /** Loading state */
  loading?: boolean
  /** Custom loading message */
  loadingMessage?: string
  /** Warning message to display */
  warning?: string | null
  /** Info message to display */
  info?: string | null
  /** Success message to display */
  success?: string | null
  /** Paper width */
  width?: string | number
  /** Paper maxWidth */
  maxWidth?: string | number
  /** Paper minHeight */
  minHeight?: string | number
  /** Paper maxHeight */
  maxHeight?: string | number
  /** Custom title sx */
  titleSx?: object
  /** Custom content sx */
  contentSx?: object
  /** Custom footer sx */
  footerSx?: object
  /** Custom Paper props */
  PaperProps?: Partial<PaperProps>
  /** Disable content scroll */
  disableContentScroll?: boolean
}

/**
 * Shared BaseModal component for standardized modals (Modal + Paper pattern)
 *
 * Consolidates duplicate modal patterns from:
 * - asignarModal.tsx
 * - AsignarActividadModal.tsx
 * - And other large modal components
 *
 * Key differences from BaseDialog:
 * - Uses Modal + Paper (not Dialog)
 * - Centered with absolute positioning
 * - Optional tabs support
 * - Flexible layout with custom dimensions
 *
 * @example
 * // Basic modal with tabs and actions
 * <BaseModal
 *   open={open}
 *   onClose={onClose}
 *   title="Derivar Demanda"
 *   titleIcon={<AssignmentIcon />}
 *   tabs={[
 *     { label: "Asignar", icon: <SendIcon /> },
 *     { label: "Historial", icon: <HistoryIcon /> }
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={handleTabChange}
 *   actions={[
 *     { label: "Cancelar", onClick: onClose, variant: "outlined" },
 *     { label: "Asignar", onClick: handleSubmit, variant: "contained", color: "primary" }
 *   ]}
 * >
 *   <TabPanel value={activeTab} index={0}>Content 1</TabPanel>
 *   <TabPanel value={activeTab} index={1}>Content 2</TabPanel>
 * </BaseModal>
 *
 * @example
 * // With error and loading states
 * <BaseModal
 *   open={open}
 *   onClose={onClose}
 *   title="Procesar Datos"
 *   error={errorMessage}
 *   loading={isProcessing}
 *   loadingMessage="Procesando..."
 *   actions={[
 *     { label: "Cerrar", onClick: onClose },
 *     { label: "Procesar", onClick: handleProcess, disabled: isProcessing, loading: isProcessing }
 *   ]}
 * >
 *   <Typography>Contenido del modal</Typography>
 * </BaseModal>
 */
const BaseModal: React.FC<BaseModalProps> = ({
  title,
  titleIcon,
  children,
  actions = [],
  tabs,
  activeTab,
  onTabChange,
  showCloseButton = true,
  showHeaderDivider = true,
  showFooterDivider = true,
  error,
  loading = false,
  loadingMessage = "Cargando...",
  warning,
  info,
  success,
  width = "90%",
  maxWidth = 700,
  minHeight = 500,
  maxHeight = "90vh",
  titleSx = {},
  contentSx = {},
  footerSx = {},
  PaperProps = {},
  disableContentScroll = false,
  onClose,
  ...modalProps
}) => {
  const handleActionClick = async (action: BaseModalAction) => {
    if (action.onClick) {
      await action.onClick()
    }
  }

  return (
    <Modal onClose={onClose} {...modalProps}>
      <Paper
        elevation={5}
        {...PaperProps}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width,
          maxWidth,
          minHeight,
          maxHeight,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...PaperProps.sx,
        }}
      >
        {/* Header with close button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              ...titleSx,
            }}
          >
            {titleIcon}
            {typeof title === "string" ? <span>{title}</span> : title}
          </Typography>
          {showCloseButton && onClose && (
            <Tooltip title="Cerrar">
              <IconButton onClick={(e) => onClose(e, "escapeKeyDown")} size="small" aria-label="cerrar">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {showHeaderDivider && <Divider sx={{ mb: 2 }} />}

        {/* Tabs (optional) */}
        {tabs && tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={activeTab} onChange={onTabChange} aria-label="modal tabs">
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  disabled={tab.disabled}
                  id={`modal-tab-${index}`}
                  aria-controls={`modal-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: disableContentScroll ? "visible" : "auto",
            ...contentSx,
          }}
        >
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

          {/* Warning Alert */}
          {warning && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning}
            </Alert>
          )}

          {/* Content */}
          {children}
        </Box>

        {/* Footer Actions */}
        {actions.length > 0 && (
          <>
            {showFooterDivider && <Divider sx={{ mt: 2 }} />}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                ...footerSx,
              }}
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  variant={action.variant || "text"}
                  color={action.color || "primary"}
                  disabled={action.disabled || loading}
                  startIcon={action.loading ? <CircularProgress size={16} /> : action.startIcon}
                  endIcon={action.endIcon}
                  fullWidth={action.fullWidth}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  )
}

export default BaseModal
