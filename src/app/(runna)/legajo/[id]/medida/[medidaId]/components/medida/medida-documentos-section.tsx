"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material"
import FolderIcon from "@mui/icons-material/Folder"
import DescriptionIcon from "@mui/icons-material/Description"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import InfoIcon from "@mui/icons-material/Info"
import { extractDemandaIdFromMedida } from "@/app/(runna)/legajo-mesa/utils/extract-demanda-from-observaciones"
import { fetchDemandaFullDetail } from "@/app/(runna)/legajo-mesa/api/demanda-api-service"
import { processDemandaAdjuntos } from "@/app/(runna)/legajo-mesa/utils/demanda-adjuntos-processor"
import type { MedidaDetailResponse } from "../../types/medida-api"
import type { ProcessedOficio, ProcessedDocumento } from "@/app/(runna)/legajo-mesa/utils/demanda-adjuntos-processor"

interface MedidaDocumentosSectionProps {
  medidaApiData: MedidaDetailResponse
}

export const MedidaDocumentosSection: React.FC<MedidaDocumentosSectionProps> = ({ medidaApiData }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demandaId, setDemandaId] = useState<number | null>(null)
  const [oficios, setOficios] = useState<ProcessedOficio[]>([])
  const [documentos, setDocumentos] = useState<ProcessedDocumento[]>([])
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const loadDemandaDocumentos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Extract demanda ID from observaciones
        const extractedDemandaId = extractDemandaIdFromMedida(medidaApiData)

        if (!extractedDemandaId) {
          setError("No se encontró información de demanda asociada a esta medida")
          setIsLoading(false)
          return
        }

        setDemandaId(extractedDemandaId)

        // Fetch demanda full details
        const demandaDetail = await fetchDemandaFullDetail(extractedDemandaId)

        // Process adjuntos
        const { oficios: processedOficios, documentos: processedDocumentos } = processDemandaAdjuntos([
          demandaDetail,
        ])

        setOficios(processedOficios)
        setDocumentos(processedDocumentos)
      } catch (err) {
        console.error("Error loading demanda documentos:", err)
        setError("Error al cargar los documentos de la demanda")
      } finally {
        setIsLoading(false)
      }
    }

    loadDemandaDocumentos()
  }, [medidaApiData])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  const totalArchivos = oficios.length + documentos.length

  if (totalArchivos === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <FolderIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay documentos adjuntos en la demanda {demandaId}
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={2} sx={{ borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FolderIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documentos de Demanda {demandaId}
          </Typography>
          <Chip label={`${totalArchivos} archivo${totalArchivos !== 1 ? "s" : ""}`} color="primary" size="small" sx={{ ml: 2 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Documentos adjuntos de la demanda que originó esta medida
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Oficios (${oficios.length})`} />
          <Tab label={`Evaluaciones (${documentos.length})`} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 3 }}>
        {/* Oficios Tab */}
        {activeTab === 0 && (
          <>
            {oficios.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No hay oficios adjuntos
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Archivo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oficios.map((oficio) => (
                      <TableRow key={oficio.id} hover>
                        <TableCell>
                          <Chip
                            label={oficio.tipo_oficio || oficio.tipo}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
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
                          <Typography variant="body2">{oficio.estado}</Typography>
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
            )}
          </>
        )}

        {/* Documentos Tab */}
        {activeTab === 1 && (
          <>
            {documentos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No hay documentos de evaluaciones
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Archivo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Subido por</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documentos.map((documento) => (
                      <TableRow key={documento.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <InsertDriveFileIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                              {documento.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                            {documento.descripcion || "Sin descripción"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={documento.tipo} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{documento.subido_por?.nombre_completo || "N/A"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {documento.fecha_subida
                              ? new Date(documento.fecha_subida).toLocaleDateString("es-AR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                            <Tooltip title="Ver documento">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewFile(documento.archivo_url)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Descargar">
                              <IconButton
                                size="small"
                                color="default"
                                onClick={() => handleDownloadFile(documento.archivo_url, documento.nombre)}
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
          </>
        )}
      </Box>
    </Paper>
  )
}
