"use client"

import dynamic from "next/dynamic"
import { Button } from "@mui/material"
import { PictureAsPdf as PdfIcon } from "@mui/icons-material"
import InformePDF from "./informe-pdf"

// Dynamic import para evitar errores SSR con Next.js
const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), { ssr: false })

interface DownloadPDFButtonProps {
  data: any
  label?: string
}

export default function DownloadPDFButton({ data, label = "Generar PDF" }: DownloadPDFButtonProps) {
  return (
    <PDFDownloadLink document={<InformePDF data={data} />} fileName="informe_valoracion.pdf">
      {({ loading, error }) => (
        <Button variant="contained" color="primary" startIcon={<PdfIcon />} disabled={loading}>
          {loading ? "Generando PDF..." : label}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

