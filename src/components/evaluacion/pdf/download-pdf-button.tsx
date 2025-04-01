"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@mui/material"
import { PictureAsPdf as PdfIcon } from "@mui/icons-material"
import InformePDF from "./informe-pdf"
import { pdf } from "@react-pdf/renderer"

// Dynamic import para evitar errores SSR con Next.js
const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), { ssr: false })

interface DownloadPDFButtonProps {
  data: any
  label?: string
  onGenerate?: (blob: Blob, fileName: string) => void
}

export default function DownloadPDFButton({ data, label = "Generar PDF", onGenerate }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const fileName = `informe_valoracion_${data.InformacionGeneral?.NumerosDemanda?.replace(/\//g, "-") || "nuevo"}_${new Date().toISOString().slice(0, 10)}.pdf`

  // Function to handle PDF generation and saving
  const handleGeneratePDF = async () => {
    if (onGenerate) {
      try {
        setIsGenerating(true)
        // Generate the PDF blob
        const blob = await pdf(<InformePDF data={data} />).toBlob()
        // Call the callback with the blob
        onGenerate(blob, fileName)
      } catch (error) {
        console.error("Error generating PDF:", error)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  return (
    <>
      {/* This is the visible button that both downloads and saves to the file system */}
      <PDFDownloadLink document={<InformePDF data={data} />} fileName={fileName}>
        {({ loading, error }) => (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PdfIcon />}
            disabled={loading || isGenerating}
            onClick={() => {
              // We need to call this after a slight delay to ensure the download starts first
              setTimeout(() => {
                handleGeneratePDF()
              }, 100)
            }}
          >
            {loading || isGenerating ? "Generando PDF..." : label}
          </Button>
        )}
      </PDFDownloadLink>
    </>
  )
}

