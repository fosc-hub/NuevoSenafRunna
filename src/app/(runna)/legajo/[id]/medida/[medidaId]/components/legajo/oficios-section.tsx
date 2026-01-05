"use client"

import type React from "react"
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { SectionCard } from "../medida/shared/section-card"
import { usePdfViewer } from "@/hooks"
import { isPdfFile, getFileNameFromUrl } from "@/utils/pdfUtils"

interface OficiosSectionProps {
  legajoData: LegajoDetailResponse
}

export const OficiosSection: React.FC<OficiosSectionProps> = ({ legajoData }) => {
  const oficios = legajoData.oficios || []
  const { openUrl, PdfModal } = usePdfViewer()

  const extractFileName = (url: string): string => {
    return getFileNameFromUrl(url, "documento.pdf")
  }

  const handleViewFile = (url: string) => {
    const fileName = extractFileName(url)
    if (isPdfFile(fileName)) {
      openUrl(url, { title: fileName, fileName })
    } else {
      window.open(url, "_blank")
    }
  }

  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  if (oficios.length === 0) {
    return (
      <SectionCard title="Oficios">
        <Typography variant="body1" color="text.secondary">
          No hay oficios registrados.
        </Typography>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Oficios"
      chips={[{
        label: `${oficios.length} total${oficios.length !== 1 ? "es" : ""}`,
        color: "primary"
      }]}
    >

      {/* Tabla de oficios */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Archivo</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oficios.map((oficio) => (
              <TableRow key={oficio.id} hover>
                <TableCell>
                  {oficio.archivo_url ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <InsertDriveFileIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {extractFileName(oficio.archivo_url)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin archivo
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {oficio.archivo_url ? (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Tooltip title="Ver documento">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewFile(oficio.archivo_url!)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descargar">
                        <IconButton
                          size="small"
                          color="default"
                          onClick={() =>
                            handleDownloadFile(oficio.archivo_url!, extractFileName(oficio.archivo_url!))
                          }
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                      N/A
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PDF Viewer Modal */}
      {PdfModal}
    </SectionCard>
  )
}
