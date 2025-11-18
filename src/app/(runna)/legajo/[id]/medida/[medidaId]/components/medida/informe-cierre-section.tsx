"use client"

/**
 * Informe de Cierre Section - MED-MPI-CIERRE V2
 *
 * Main section component for MPI closure workflow
 * Displays in unified-workflow-tab when MPI is in Estados 3 or 4
 *
 * Simplified Workflow (V2):
 * - Estado 3 (PENDIENTE_DE_INFORME_DE_CIERRE): ET registers informe → auto-transition to Estado 4
 * - Estado 4 (INFORME_DE_CIERRE_REDACTADO): Terminal state, 100% completion, informe read-only
 *
 * Features:
 * - Conditional rendering based on estado
 * - Display informe observaciones and metadata
 * - Attachments list with download links
 * - Toast notifications for success/error
 *
 * NOTE: No approval/rejection workflow for MPI Cese.
 * Estado 4 is the final state (100% completion).
 */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
// RechazarCierreModal is deprecated for MPI V2 workflow
// import { RechazarCierreModal } from "../dialogs/rechazar-cierre-modal"
import {
  getInformeCierreActivo,
  // aprobarCierre is deprecated for MPI V2 workflow
  // aprobarCierre,
} from "../../api/informe-cierre-api-service"
import type { InformeCierre } from "../../types/informe-cierre-api"
import type { MedidaDetailResponse } from "../../types/medida-api"

// ============================================================================
// PROPS
// ============================================================================

interface InformeCierreSectionProps {
  medidaId: number
  medidaApiData: MedidaDetailResponse
  isJZ: boolean // Deprecated for MPI V2, keeping for backward compatibility
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
  // ========== Router ==========
  const router = useRouter()

  // ========== State ==========
  const [informe, setInforme] = useState<InformeCierre | null>(null)
  const [isLoadingInforme, setIsLoadingInforme] = useState(false)
  const [informeCierreModalOpen, setInformeCierreModalOpen] = useState(false)
  // Deprecated for MPI V2:
  // const [rechazarModalOpen, setRechazarModalOpen] = useState(false)
  // const [isApproving, setIsApproving] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error" | "warning" | "info"
  }>({ open: false, message: "", severity: "success" })

  // Helper to show snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  // Helper to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

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
      showSnackbar("Error al cargar el informe de cierre", "error")
    } finally {
      setIsLoadingInforme(false)
    }
  }

  useEffect(() => {
    loadInforme()
  }, [medidaId, estado])

  // ========== Handlers ==========
  const handleInformeCreated = (informeCreado: InformeCierre) => {
    showSnackbar(
      "Informe de cierre registrado exitosamente. Estado: 100% completado.",
      "success"
    )

    // Close modal first
    setInformeCierreModalOpen(false)

    // Soft reload: revalidate data from server
    router.refresh()

    // Also call parent refresh if provided
    if (onRefresh) {
      onRefresh()
    }
  }

  // Deprecated for MPI V2 workflow
  // const handleAprobar = async () => { ... }
  // const handleRechazarSuccess = () => { ... }

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

                    {/* Tipo de Cese */}
                    {informe.tipo_cese_display && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Tipo de Cese
                        </Typography>
                        <Alert severity="info" icon={false} sx={{ py: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {informe.tipo_cese_display}
                          </Typography>
                        </Alert>
                      </Box>
                    )}

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

                  {/* Estado 4 Completion Message */}
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      <Typography variant="subtitle2" gutterBottom>
                        ✅ Informe de Cierre Completado (100%)
                      </Typography>
                      <Typography variant="body2">
                        El informe de cierre ha sido registrado exitosamente.
                        Este es el estado final para MPI Cese.
                      </Typography>
                    </Alert>
                  </Box>
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

      {/* RechazarCierreModal deprecated for MPI V2 workflow */}
      {/*
      <RechazarCierreModal
        open={rechazarModalOpen}
        onClose={() => setRechazarModalOpen(false)}
        medidaId={medidaId}
        informe={informe}
        onSuccess={handleRechazarSuccess}
      />
      */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
