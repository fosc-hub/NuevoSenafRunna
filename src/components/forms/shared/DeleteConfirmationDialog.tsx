import React from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material"
import { Delete as DeleteIcon } from "@mui/icons-material"

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
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
        >
          <DeleteIcon color="error" sx={{ mr: 1 }} /> Confirmar eliminación
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          ¿Está seguro de que desea eliminar este {itemName}? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" size="medium" disabled={isProcessing}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          size="medium"
          startIcon={<DeleteIcon />}
          disabled={isProcessing}
        >
          {isProcessing ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmationDialog
