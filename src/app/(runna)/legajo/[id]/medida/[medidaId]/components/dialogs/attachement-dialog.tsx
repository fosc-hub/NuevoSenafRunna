"use client"

import type React from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"

interface AttachmentDialogProps {
  open: boolean
  fileName: string
  onClose: () => void
  onDownload: () => void
}

export const AttachmentDialog: React.FC<AttachmentDialogProps> = ({ open, fileName, onClose, onDownload }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{fileName}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            height: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Vista previa del documento no disponible
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DownloadIcon />}
          onClick={onDownload}
          color="primary"
          sx={{
            borderRadius: 8,
            textTransform: "none",
          }}
        >
          Descargar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
