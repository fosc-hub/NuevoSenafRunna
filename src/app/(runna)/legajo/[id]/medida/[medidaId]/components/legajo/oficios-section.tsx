"use client"

import type React from "react"
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface OficiosSectionProps {
  legajoData: LegajoDetailResponse
}

export const OficiosSection: React.FC<OficiosSectionProps> = ({ legajoData }) => {
  const oficios = legajoData.oficios || []

  const extractFileName = (url: string): string => {
    try {
      const urlParts = url.split("/")
      const fileName = urlParts[urlParts.length - 1]
      return decodeURIComponent(fileName)
    } catch {
      return "documento.pdf"
    }
  }

  const handleViewFile = (url: string) => {
    window.open(url, "_blank")
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
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Oficios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay oficios registrados.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Oficios
        </Typography>
        <Chip
          label={`${oficios.length} total${oficios.length !== 1 ? "es" : ""}`}
          color="primary"
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

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
    </Paper>
  )
}
