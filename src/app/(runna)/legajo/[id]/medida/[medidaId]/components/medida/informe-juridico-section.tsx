"use client"

/**
 * InformeJuridicoSection Component (MED-04)
 * Sección principal para visualizar y gestionar Informe Jurídico
 *
 * Características:
 * - Muestra informe jurídico de la medida
 * - Información del Equipo Legal que elaboró el informe
 * - Notificaciones institucionales (instituciones, fecha, medio, destinatarios)
 * - Adjuntos (informe oficial + acuses de recibo)
 * - Botón "Cargar Informe Jurídico" (visible si estado = PENDIENTE_INFORME_JURIDICO y usuario = Equipo Legal)
 * - Botón "Enviar Informe" (visible si informe completo y no enviado)
 * - Estados visuales según estado de envío
 *
 * Permisos:
 * - Equipo Legal (nivel 3 o 4 con flag legal=true): pueden crear y enviar
 * - Superusuarios: tienen acceso completo
 * - Otros usuarios: solo visualización
 */

import React, { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Alert,
  Skeleton,
  CircularProgress,
  Grid,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Send as SendIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { useInformeJuridico } from "../../hooks/useInformeJuridico"
import { InformeJuridicoDialog } from "../dialogs/informe-juridico-dialog"
import { AdjuntosInformeJuridico } from "../informe-juridico/adjuntos-informe-juridico"
import {
  extractUserName,
  MEDIO_NOTIFICACION_LABELS,
  canEnviarInforme,
  canModificarInforme,
} from "../../types/informe-juridico-api"
import type { EstadoEtapa } from "@/app/(runna)/legajo-mesa/types/medida-api"
import type { CreateInformeJuridicoRequest } from "../../types/informe-juridico-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface InformeJuridicoSectionProps {
  medidaId: number
  medidaNumero?: string
  estadoActual?: EstadoEtapa | string
  userRole?: string // Rol del usuario actual
  userLevel?: number // Nivel del usuario actual (3 o 4 para Equipo Legal)
  isEquipoLegal?: boolean // Si el usuario es Equipo Legal (nivel 3 o 4 con flag legal=true)
  isSuperuser?: boolean // Si el usuario es superusuario (tiene acceso completo)
  onInformeEnviado?: () => void // Callback al enviar informe exitosamente
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can manage Informe Jurídico
 * - Equipo Legal (nivel 3 o 4 con flag legal=true) can manage
 * - Superusers can manage
 */
const canManageInformeJuridico = (
  isEquipoLegal?: boolean,
  isSuperuser?: boolean
): boolean => {
  // Superuser always has access
  if (isSuperuser) return true

  // Equipo Legal has access
  return isEquipoLegal === true
}

/**
 * Check if medida is in PENDIENTE_INFORME_JURIDICO state
 */
const isPendingInformeJuridico = (estadoActual?: string): boolean => {
  return estadoActual === "PENDIENTE_INFORME_JURIDICO"
}

/**
 * Format date in Spanish
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

/**
 * Format datetime in Spanish
 */
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InformeJuridicoSection: React.FC<InformeJuridicoSectionProps> = ({
  medidaId,
  medidaNumero,
  estadoActual,
  userRole,
  userLevel,
  isEquipoLegal,
  isSuperuser,
  onInformeEnviado,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [dialogOpen, setDialogOpen] = useState(false)
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    informeJuridico,
    isLoadingInforme,
    informeError,
    adjuntos,
    isLoadingAdjuntos,
    adjuntosError,
    hasInforme,
    canSend,
    isEnviado,
    tieneInformeOficial,
    cantidadAcuses,
    createNewInforme,
    uploadAdjunto,
    deleteAdjunto,
    sendInforme,
    refetchInforme,
  } = useInformeJuridico({ medidaId })

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  const canManage = canManageInformeJuridico(isEquipoLegal, isSuperuser)
  const isPendingState = isPendingInformeJuridico(estadoActual)
  const canCreate = canManage && isPendingState && !hasInforme
  const canModify = canManage && canModificarInforme(informeJuridico)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle create informe
   */
  const handleCreateInforme = async (data: CreateInformeJuridicoRequest) => {
    try {
      await createNewInforme(data)
      setDialogOpen(false)
    } catch (error) {
      console.error("Error creating informe:", error)
      // Error is already shown in dialog
    }
  }

  /**
   * Handle send informe
   */
  const handleSendInforme = async () => {
    if (!canSend) {
      alert("No se puede enviar el informe. Verifique que exista un informe oficial adjunto.")
      return
    }

    try {
      await sendInforme()
      setSendConfirmOpen(false)

      // Callback
      if (onInformeEnviado) {
        onInformeEnviado()
      }
    } catch (error: any) {
      console.error("Error sending informe:", error)
      alert(error.message || "Error al enviar informe jurídico")
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render loading skeleton
   */
  const renderLoading = () => (
    <Card>
      <CardHeader
        title={<Skeleton width={200} />}
        subheader={<Skeleton width={150} />}
      />
      <CardContent>
        <Skeleton variant="rectangular" height={100} />
      </CardContent>
    </Card>
  )

  /**
   * Render error state
   */
  const renderError = () => (
    <Alert severity="error">
      Error al cargar informe jurídico: {informeError}
    </Alert>
  )

  /**
   * Render empty state (no informe yet)
   */
  const renderEmpty = () => (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionIcon />
            <Typography variant="h6">Informe Jurídico</Typography>
          </Box>
        }
        subheader="MED-04: Carga de Informe Jurídico por Equipo Legal"
      />
      <CardContent>
        <Alert severity="info" icon={<WarningIcon />}>
          <Typography variant="body2">
            Aún no se ha cargado el informe jurídico para esta medida.
          </Typography>
          {!isPendingState && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Estado actual: <strong>{estadoActual}</strong> (se requiere estado
              PENDIENTE_INFORME_JURIDICO)
            </Typography>
          )}
        </Alert>

        {canCreate && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                backgroundColor: "#4f3ff0",
                "&:hover": { backgroundColor: "#3a2cc2" },
              }}
            >
              Cargar Informe Jurídico
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  /**
   * Render informe content
   */
  const renderInforme = () => {
    if (!informeJuridico) return null

    return (
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: isEnviado ? "success.main" : "warning.main" }}>
              {isEnviado ? <CheckCircleIcon /> : <WarningIcon />}
            </Avatar>
          }
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Informe Jurídico</Typography>
              <Chip
                label={isEnviado ? "Enviado" : "Pendiente de Envío"}
                color={isEnviado ? "success" : "warning"}
                size="small"
              />
            </Box>
          }
          subheader={`Elaborado por: ${extractUserName(informeJuridico.elaborado_por_detalle)}`}
          action={
            canModify &&
            canSend && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={() => setSendConfirmOpen(true)}
                sx={{
                  backgroundColor: "#4f3ff0",
                  "&:hover": { backgroundColor: "#3a2cc2" },
                }}
              >
                Enviar Informe
              </Button>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Notificaciones Institucionales */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Notificaciones Institucionales
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Instituciones */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Instituciones Notificadas:
                  </Typography>
                  <Typography variant="body1">
                    {informeJuridico.instituciones_notificadas}
                  </Typography>
                </Box>

                {/* Fecha y Medio */}
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <CalendarIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }} />
                      Fecha de Notificaciones:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(informeJuridico.fecha_notificaciones)}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <EmailIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }} />
                      Medio de Notificación:
                    </Typography>
                    <Typography variant="body1">
                      {MEDIO_NOTIFICACION_LABELS[informeJuridico.medio_notificacion]}
                    </Typography>
                  </Box>
                </Box>

                {/* Destinatarios */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Destinatarios:
                  </Typography>
                  <Typography variant="body1">{informeJuridico.destinatarios}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Observaciones */}
            {informeJuridico.observaciones && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Observaciones
                </Typography>
                <Typography variant="body1">{informeJuridico.observaciones}</Typography>
              </Grid>
            )}

            {/* Adjuntos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <AdjuntosInformeJuridico
                medidaId={medidaId}
                adjuntos={adjuntos}
                isLoading={isLoadingAdjuntos}
                error={adjuntosError}
                canModify={canModify}
                onUpload={uploadAdjunto}
                onDelete={deleteAdjunto}
              />
            </Grid>

            {/* Estado de Envío */}
            {isEnviado && informeJuridico.fecha_envio && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="body2">
                    <strong>Informe Enviado</strong> el {formatDateTime(informeJuridico.fecha_envio)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    La medida avanzó al estado PENDIENTE_RATIFICACION_JUDICIAL (Estado 5)
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoadingInforme) {
    return renderLoading()
  }

  if (informeError) {
    return renderError()
  }

  return (
    <Box>
      {hasInforme ? renderInforme() : renderEmpty()}

      {/* Create Dialog */}
      <InformeJuridicoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateInforme}
        isLoading={isLoadingInforme}
        medidaNumero={medidaNumero}
      />

      {/* Send Confirmation Dialog */}
      {sendConfirmOpen && (
        <Alert
          severity="warning"
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" onClick={() => setSendConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleSendInforme}
                disabled={isLoadingInforme}
              >
                {isLoadingInforme ? <CircularProgress size={16} /> : "Confirmar Envío"}
              </Button>
            </Box>
          }
        >
          <Typography variant="body2">
            ¿Está seguro que desea enviar el informe jurídico? Una vez enviado, no podrá modificarlo ni eliminar adjuntos.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            La medida avanzará al estado PENDIENTE_RATIFICACION_JUDICIAL (Estado 5).
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
