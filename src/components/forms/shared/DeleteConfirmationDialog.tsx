import React from "react"
import { Typography } from "@mui/material"
import { Delete as DeleteIcon } from "@mui/icons-material"
import BaseDialog from "@/components/shared/BaseDialog"

interface DeleteConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  isProcessing?: boolean
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  itemName,
  isProcessing = false,
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      title="Confirmar eliminación"
      titleIcon={<DeleteIcon color="error" />}
      warning={`¿Está seguro de que desea eliminar este ${itemName}? Esta acción no se puede deshacer.`}
      actions={[
        {
          label: "Cancelar",
          onClick: onClose,
          variant: "outlined",
          disabled: isProcessing
        },
        {
          label: isProcessing ? "Eliminando..." : "Eliminar",
          onClick: onConfirm,
          variant: "contained",
          color: "error",
          startIcon: <DeleteIcon />,
          disabled: isProcessing,
          loading: isProcessing
        }
      ]}
    >
      {/* Content is handled by warning prop */}
    </BaseDialog>
  )
}

export default DeleteConfirmationDialog
