"use client"

import type React from "react"
import { Box, Typography } from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import DescriptionIcon from "@mui/icons-material/Description"
import BaseDialog from "@/components/shared/BaseDialog"

interface AttachmentDialogProps {
  open: boolean
  fileName: string
  onClose: () => void
  onDownload: () => void
}

export const AttachmentDialog: React.FC<AttachmentDialogProps> = ({ open, fileName, onClose, onDownload }) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      title={fileName}
      titleIcon={<DescriptionIcon />}
      showCloseButton
      actions={[
        {
          label: "Descargar",
          onClick: onDownload,
          variant: "contained",
          color: "primary",
          startIcon: <DownloadIcon />
        }
      ]}
    >
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
    </BaseDialog>
  )
}
