"use client"

import { Box, Button } from "@mui/material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"

// Dynamic import para evitar errores SSR con Next.js
const DownloadPDFButton = dynamic(() => import("./pdf/download-pdf-button"), {
  ssr: false,
  loading: () => (
    <Button variant="contained" color="primary" disabled>
      Cargando PDF...
    </Button>
  ),
})

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

  // Preparar los datos combinados para el PDF
  const combinedData = {
    ...data,
    // Asegurarse de que todos los datos necesarios estén disponibles
    // Esto se puede expandir según sea necesario
  }

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
      <DownloadPDFButton data={combinedData} />

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

