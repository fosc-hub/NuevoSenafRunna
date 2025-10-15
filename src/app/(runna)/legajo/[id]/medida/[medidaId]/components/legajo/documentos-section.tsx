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
  IconButton,
  Box,
  Button,
  Tooltip,
} from "@mui/material"
import FolderIcon from "@mui/icons-material/Folder"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import AddIcon from "@mui/icons-material/Add"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface DocumentosSectionProps {
  legajoData: LegajoDetailResponse
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({ legajoData }) => {
  const documentos = legajoData.documentos || []
  const permisos = legajoData.permisos_usuario

  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return fecha
    }
  }

  const handleVerDocumento = (documento: any) => {
    console.log("Ver documento:", documento)
    // TODO: Implement document preview using AttachmentDialog
  }

  const handleDescargarDocumento = (documento: any) => {
    console.log("Descargar documento:", documento)
    // TODO: Implement document download
  }

  const handleAgregarDocumento = () => {
    console.log("Agregar nuevo documento")
    // TODO: Implement document upload modal
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FolderIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documentos Adjuntos
          </Typography>
          {documentos.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              ({documentos.length} documento{documentos.length !== 1 ? "s" : ""})
            </Typography>
          )}
        </Box>

        {permisos?.puede_agregar_documentos && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAgregarDocumento}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Agregar documento
          </Button>
        )}
      </Box>

      {documentos.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <FolderIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay documentos adjuntos para este legajo.
          </Typography>
          {permisos?.puede_agregar_documentos && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAgregarDocumento}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Agregar primer documento
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del archivo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subido por</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tamaño</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.map((documento, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {documento.nombre || "Documento sin nombre"}
                    </Typography>
                    {documento.descripcion && (
                      <Typography variant="caption" color="text.secondary">
                        {documento.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{documento.tipo || "N/A"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {documento.subido_por?.nombre_completo || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {documento.fecha_subida ? formatFecha(documento.fecha_subida) : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {documento.tamaño ? `${(documento.tamaño / 1024).toFixed(2)} KB` : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Tooltip title="Ver documento">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleVerDocumento(documento)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descargar">
                        <IconButton
                          size="small"
                          color="default"
                          onClick={() => handleDescargarDocumento(documento)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Información adicional */}
      {documentos.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Los documentos adjuntos son almacenados de forma segura y solo son accesibles por usuarios autorizados.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
