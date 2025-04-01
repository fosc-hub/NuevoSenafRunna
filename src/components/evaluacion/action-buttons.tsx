"use client"

import { Box, Button } from "@mui/material"
import { toast } from "react-toastify"

interface ActionButtonsProps {
  generatePDF: (data: any) => Promise<void>
  data: any
}

export default function ActionButtons({ generatePDF, data }: ActionButtonsProps) {
  const handleAuthorizationAction = async (action: string) => {
    toast.success(`Demanda enviada para ${action} exitosamente`, {
      position: "top-center",
      autoClose: 3000,
    })
  }

  const handleGeneratePDF = () => {
    generatePDF(data)
  }

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
      <Button variant="contained" color="primary" onClick={handleGeneratePDF}>
        Generar PDF
      </Button>
      <Button variant="contained" color="secondary" onClick={() => handleAuthorizationAction("autorizar archivar")}>
        Autorizar archivar
      </Button>
      <Button variant="contained" color="secondary" onClick={() => handleAuthorizationAction("autorizar abrir legajo")}>
        Autorizar abrir legajo
      </Button>
      <Button variant="contained" color="secondary" onClick={() => handleAuthorizationAction("autorizar tomar medida")}>
        Autorizar tomar medida
      </Button>
      <Button variant="contained" color="primary" onClick={() => handleAuthorizationAction("autorizar")}>
        Autorizar
      </Button>
      <Button variant="contained" color="error" onClick={() => handleAuthorizationAction("no autorizar")}>
        No autorizar
      </Button>
    </Box>
  )
}

