"use client"
import { Dialog, DialogContent, Typography, Box, Button, IconButton, Paper } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

interface NotificationModalProps {
  open: boolean
  onClose: () => void
  medidaId: string
}

export default function NotificationModal({ open, onClose, medidaId }: NotificationModalProps) {
  // Format the medidaId to display a clean number
  const formatMedidaId = (id: string): string => {
    // If it starts with "active_" or contains URL encoding, return a fixed number
    if (id.startsWith("active_") || id.includes("%")) {
      return "123456" // Fixed MPI number for demonstration
    }

    // If it contains an underscore, take the first part
    if (id.includes("_")) {
      return id.split("_")[0]
    }

    return id
  }

  const displayMedidaId = formatMedidaId(medidaId)

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose()
        }
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ position: "absolute", right: 8, top: 8 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <ErrorOutlineIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" color="error" sx={{ fontWeight: 500 }}>
            Atención
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
          MPI: {displayMedidaId}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          La presente medida ha sido recientemente vinculada con una demanda.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Puede ver los detalles a continuación:
        </Typography>

        <Paper variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
          <Box sx={{ p: 2, position: "relative" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              15 ABR 25
            </Typography>
            <Typography variant="body2">Se registra denuncia anónima</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Equipo: Legales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                12:45 am
              </Typography>
            </Box>
            <IconButton size="small" sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        <Typography variant="body2" sx={{ mb: 3 }}>
          Para continuar, debe enviar una confirmación de lectura.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{
              borderRadius: 50,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Confirmar lectura
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
