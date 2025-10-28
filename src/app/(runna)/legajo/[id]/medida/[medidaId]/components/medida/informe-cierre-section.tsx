"use client"

/**
 * Informe de Cierre Section - MED-MPI-CIERRE
 *
 * Main section component for MPI closure workflow
 * Displays in unified-workflow-tab when MPI is in Estados 3 or 4
 *
 * Estados:
 * - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE): Show "Registrar Informe" button for ET
 * - Estado 4 (INFORME_DE_CIERRE_REDACTADO): Show informe details + approve/reject for JZ
 *
 * Features:
 * - Conditional rendering based on estado and user role
 * - Display informe observaciones and metadata
 * - Attachments list with download links
 * - Approve button (JZ only, Estado 4)
 * - Reject button (JZ only, Estado 4)
 * - Integration with modals
 * - Toast notifications for success/error
 */

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Snackbar,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import PersonIcon from "@mui/icons-material/Person"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import { InformeCierreModal } from "../dialogs/informe-cierre-modal"
import { RechazarCierreModal } from "../dialogs/rechazar-cierre-modal"
import {
  getInformeCierreActivo,
  aprobarCierre,
} from "../../api/informe-cierre-api-service"
import type { InformeCierre } from "../../types/informe-cierre-api"
import type { MedidaDetailResponse } from "../../types/medida-api"

// ============================================================================
// PROPS
// ============================================================================

interface InformeCierreSectionProps {
  medidaId: number
  medidaApiData: MedidaDetailResponse
  isJZ: boolean
  onRefresh?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InformeCierreSection: React.FC<InformeCierreSectionProps> = ({
  medidaId,
  medidaApiData,
  isJZ,
  onRefresh,
}) => {
  // ========== State ==========
  const [informe, setInforme] = useState<InformeCierre | null>(null)
  const [isLoadingInforme, setIsLoadingInforme] = useState(false)
  const [informeCierreModalOpen, setInformeCierreModalOpen] = useState(false)
  const [rechazarModalOpen, setRechazarModalOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error" | "warning" | "info"
  }>({ open: false, message: "", severity: "success" })

  // ========== Estado Detection ==========
  const etapaActual = medidaApiData.etapa_actual
  const estado = etapaActual?.estado || ""
  const isEstado3 = estado === "PENDIENTE_DE_INFORME_DE_CIERRE"
  const isEstado4 = estado === "INFORME_DE_CIERRE_REDACTADO"

  // ========== Load Informe ==========
  const loadInforme = async () => {
    if (!isEstado4) {
      // Only load informe if in Estado 4
      setInforme(null)
      return
    }

    setIsLoadingInforme(true)
    try {
      const informeActivo = await getInformeCierreActivo(medidaId)
      setInforme(informeActivo)
    } catch (error) {
      console.error("Error loading informe cierre:", error)
      enqueueSnackbar("Error al cargar el informe de cierre", {
        variant: "error",
      })
    } finally {
      setIsLoadingInforme(false)
    }
  }

  useEffect(() => {
    loadInforme()
  }, [medidaId, estado])

  // ========== Handlers ==========
  const handleInformeCreated = (informeCreado: InformeCierre) => {
    enqueueSnackbar(
      "Informe de cierre registrado. Estado actualizado a 'Informe de cierre redactado'",
      { variant: "success" }
    )

    // Refresh medida data to get new estado
    if (onRefresh) {
      onRefresh()
    }

    // Close modal
    setInformeCierreModalOpen(false)
  }

  const handleAprobar = async () => {
    if (!confirm("¿Está seguro de aprobar este informe y cerrar la medida?")) {
      return
    }

    setIsApproving(true)
    try {
      await aprobarCierre(medidaId)

      enqueueSnackbar("Medida cerrada exitosamente", {
        variant: "success",
      })

      // Refresh medida data
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      console.error("Error aprobando cierre:", error)
      enqueueSnackbar(
        error?.response?.data?.detalle || "Error al aprobar el cierre",
        { variant: "error" }
      )
    } finally {
      setIsApproving(false)
    }
  }

  const handleRechazarSuccess = () => {
    enqueueSnackbar(
      "Informe rechazado. Estado vuelto a 'Pendiente de informe de cierre'",
      { variant: "info" }
    )

    // Refresh medida data
    if (onRefresh) {
      onRefresh()
    }

    // Close modal
    setRechazarModalOpen(false)
  }

  // ========== Render ==========

  // Don't render if not in Estados 3 or 4
  if (!isEstado3 && !isEstado4) {
    return null
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Informe de Cierre"
          titleTypographyProps={{ variant: "h6" }}
          action={
            estado === "PENDIENTE_DE_INFORME_DE_CIERRE" ? (
              <Chip label="Estado 3" color="info" size="small" />
            ) : estado === "INFORME_DE_CIERRE_REDACTADO" ? (
              <Chip label="Estado 4" color="warning" size="small" />
            ) : null
          }
        />
        <CardContent>
          {/* Estado 3: Registrar Informe Button */}
          {isEstado3 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta medida está lista para cierre. Registre el informe de cierre
                para continuar con el proceso.
              </Alert>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setInformeCierreModalOpen(true)}
              >
                Registrar Informe de Cierre
              </Button>
            </Box>
          )}

          {/* Estado 4: Show Informe Details */}
          {isEstado4 && (
            <Box>
              {isLoadingInforme ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : informe ? (
                <>
                  {/* Informe Metadata */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Chip
                        icon={<PersonIcon />}
                        label={`Elaborado por: ${informe.elaborado_por_detalle.nombre_completo}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarTodayIcon />}
                        label={new Date(informe.fecha_registro).toLocaleDateString(
                          "es-AR"
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {informe.rechazado && informe.observaciones_rechazo && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Observaciones de Rechazo Anterior:
                        </Typography>
                        <Typography variant="body2">
                          {informe.observaciones_rechazo}
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Observaciones */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Observaciones del Informe
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {informe.observaciones}
                    </Typography>
                  </Box>

                  {/* Adjuntos */}
                  {informe.adjuntos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Adjuntos ({informe.adjuntos.length})
                      </Typography>
                      <List dense>
                        {informe.adjuntos.map((adjunto) => (
                          <ListItem
                            key={adjunto.id}
                            component="a"
                            href={adjunto.url}
                            target="_blank"
                            sx={{
                              borderRadius: 1,
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <ListItemIcon>
                              <AttachFileIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={adjunto.nombre_original}
                              secondary={`${adjunto.tipo_display} - ${(
                                adjunto.tamaño_bytes /
                                1024 /
                                1024
                              ).toFixed(2)} MB`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* JZ Actions */}
                  {isJZ && (
                    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={
                          isApproving ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CheckCircleIcon />
                          )
                        }
                        onClick={handleAprobar}
                        disabled={isApproving}
                      >
                        Aprobar Cierre
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ErrorIcon />}
                        onClick={() => setRechazarModalOpen(true)}
                        disabled={isApproving}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="warning">
                  No se encontró un informe de cierre activo para esta medida.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InformeCierreModal
        open={informeCierreModalOpen}
        onClose={() => setInformeCierreModalOpen(false)}
        medidaId={medidaId}
        onSuccess={handleInformeCreated}
      />

      <RechazarCierreModal
        open={rechazarModalOpen}
        onClose={() => setRechazarModalOpen(false)}
        medidaId={medidaId}
        informe={informe}
        onSuccess={handleRechazarSuccess}
      />
    </>
  )
}
