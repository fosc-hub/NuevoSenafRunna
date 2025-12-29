"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Typography,
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
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import InfoIcon from "@mui/icons-material/Info"
import { useApiQuery } from "@/hooks/useApiQuery"
import { extractDemandaIdFromMedida } from "@/app/(runna)/legajo-mesa/utils/extract-demanda-from-observaciones"
import { fetchDemandaFullDetail } from "@/app/(runna)/legajo-mesa/api/demanda-api-service"
import { processDemandaAdjuntos } from "@/app/(runna)/legajo-mesa/utils/demanda-adjuntos-processor"
import { SectionCard } from "./shared/section-card"
import type { MedidaDetailResponse } from "../../types/medida-api"
import type { ProcessedOficio, ProcessedDocumento } from "@/app/(runna)/legajo-mesa/utils/demanda-adjuntos-processor"

interface MedidaDocumentosSectionProps {
  medidaApiData: MedidaDetailResponse
}

export const MedidaDocumentosSection: React.FC<MedidaDocumentosSectionProps> = ({ medidaApiData }) => {
  const [activeTab, setActiveTab] = useState(0)

  // Extract demanda ID from medida data
  const demandaId = useMemo(() => extractDemandaIdFromMedida(medidaApiData), [medidaApiData])

  // Fetch demanda full details using TanStack Query
  const { data: demandaDetail, isLoading, error: queryError } = useApiQuery<any>(
    `demanda/${demandaId}/full-detail`,
    undefined,
    {
      queryFn: () => fetchDemandaFullDetail(demandaId!),
      enabled: !!demandaId,
    }
  )

  // Process adjuntos from demanda detail
  const { oficios, documentos } = useMemo(() => {
    if (!demandaDetail) {
      return { oficios: [], documentos: [] }
    }
    return processDemandaAdjuntos([demandaDetail])
  }, [demandaDetail])

  const error = !demandaId
    ? "No se encontró información de demanda asociada a esta medida"
    : queryError
    ? "Error al cargar los documentos de la demanda"
    : null

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

  // Loading state
  if (isLoading) {
    return (
      <SectionCard
        title={`Documentos de Demanda ${demandaId || ''}`}
        chips={[{ label: "Cargando...", color: "info" }]}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </SectionCard>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  const totalArchivos = oficios.length + documentos.length

  // Empty state
  if (totalArchivos === 0) {
    return (
      <SectionCard
        title={`Documentos de Demanda ${demandaId}`}
        chips={[{ label: "0 archivos", color: "secondary" }]}
      >
        <Box sx={{ textAlign: "center", py: 4 }}>
          <FolderIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay documentos adjuntos en la demanda {demandaId}
          </Typography>
        </Box>
      </SectionCard>
    )
  }

  // Main content
  return (
    <SectionCard
      title={`Documentos de Demanda ${demandaId}`}
      chips={[{ label: `${totalArchivos} archivo${totalArchivos !== 1 ? "s" : ""}`, color: "primary" }]}
      additionalInfo={["Documentos adjuntos de la demanda que originó esta medida"]}
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mx: -3, px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Oficios (${oficios.length})`} />
          <Tab label={`Evaluaciones (${documentos.length})`} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ pt: 3 }}>
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
    </SectionCard>
  )
}
