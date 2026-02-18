"use client"

/**
 * InformeJuridicoSection Component (MED-04)
 * Sección principal para visualizar y gestionar Informe Jurídico
 *
 * Características:
 * - SectionCard component for consistent UI
 * - Timeline for status progression
 * - Info cards for notification details
 * - Enhanced empty state
 * - Botón "Cargar Informe Jurídico" (visible si estado = PENDIENTE_INFORME_JURIDICO y usuario = Equipo Legal)
 * - Botón "Enviar Informe" (visible si informe completo y no enviado)
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
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material"
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab"
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Send as SendIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  LocalPostOffice as LocalPostOfficeIcon,
  Person as PersonIcon,
  Shuffle as ShuffleIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  Create as CreateIcon,
} from "@mui/icons-material"
import { useInformeJuridico } from "../../hooks/useInformeJuridico"
import { InformeJuridicoDialog } from "../dialogs/informe-juridico-dialog"
import { AdjuntosInformeJuridico } from "../informe-juridico/adjuntos-informe-juridico"
import {
  extractUserName,
  MEDIO_NOTIFICACION_LABELS,
  canModificarInforme,
} from "../../types/informe-juridico-api"
import type { MedioNotificacion, InformeJuridicoBasicResponse } from "../../types/informe-juridico-api"
import type { EstadoEtapa } from "@/app/(runna)/legajo-mesa/types/medida-api"
import type { CrearYEnviarInformeJuridicoRequest } from "../../types/informe-juridico-api"
import { SectionCard } from "./shared/section-card"

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
  /**
   * Etapa ID for state isolation.
   * Prevents data mixing between different etapas (Apertura, Prórroga, etc.)
   */
  etapaId?: number
  /**
   * Initial data from unified etapa endpoint.
   * When provided, the hook skips API calls and uses this data instead.
   * Optimizes performance by reusing data fetched via:
   * GET /api/medidas/{id}/etapa/{tipo_etapa}/
   */
  initialData?: InformeJuridicoBasicResponse[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MEDIO_ICONS: Record<MedioNotificacion, React.ReactNode> = {
  EMAIL: <EmailIcon />,
  POSTAL: <LocalPostOfficeIcon />,
  PRESENCIAL: <PersonIcon />,
  MIXTO: <ShuffleIcon />,
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
  etapaId,
  initialData,
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
    createAndSendInforme,
    uploadAdjunto,
    deleteAdjunto,
    sendInforme,
    refetchInforme,
  } = useInformeJuridico({ medidaId, etapaId, initialData })

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
   * Handle create and send informe (unified flow)
   */
  const handleCreateAndSendInforme = async (data: CrearYEnviarInformeJuridicoRequest) => {
    try {
      await createAndSendInforme(data)
      setDialogOpen(false)

      // Callback
      if (onInformeEnviado) {
        onInformeEnviado()
      }
    } catch (error) {
      console.error("Error creating and sending informe:", error)
      // Error is already shown in dialog
    }
  }

  /**
   * Handle send existing informe (legacy flow - for already created informes)
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
  // DERIVED STATE
  // ============================================================================

  // Determine status chip
  const getStatusChip = (): { label: string; color: "primary" | "secondary" | "success" | "error" | "warning" | "info" } => {
    if (hasInforme && isEnviado) {
      return { label: "Enviado", color: "success" }
    }
    if (hasInforme && !isEnviado) {
      return { label: "Pendiente de Envío", color: "warning" }
    }
    if (isPendingState) {
      return { label: "Pendiente", color: "warning" }
    }
    return { label: "Sin Informe", color: "info" }
  }

  const statusChip = getStatusChip()

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <SectionCard
      title="Informe Jurídico"
      chips={[{ label: "Cargando...", color: "info" }]}
    >
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    </SectionCard>
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
   * Render enhanced empty state
   */
  const renderEmpty = () => (
    <SectionCard
      title="Informe Jurídico"
      chips={[statusChip]}
      additionalInfo={["MED-04: Carga de Informe Jurídico por Equipo Legal"]}
      headerActions={
        canCreate ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: "#4f3ff0",
              "&:hover": { backgroundColor: "#3a2cc2" },
              textTransform: "none",
            }}
          >
            Cargar Informe
          </Button>
        ) : undefined
      }
    >
      <Box sx={{ textAlign: "center", py: 6 }}>
        <GavelIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sin Informe Jurídico
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
          El Equipo Legal debe cargar el informe jurídico para esta medida.
          {!isPendingState && (
            <>
              <br />
              Estado actual: <strong>{estadoActual}</strong>
            </>
          )}
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: "#4f3ff0",
              "&:hover": { backgroundColor: "#3a2cc2" },
              textTransform: "none",
            }}
          >
            Cargar Informe Jurídico
          </Button>
        )}
      </Box>
    </SectionCard>
  )

  /**
   * Render Timeline for status progression
   */
  const renderTimeline = () => {
    if (!informeJuridico) return null

    return (
      <Timeline position="alternate" sx={{ p: 0, m: 0 }}>
        {/* Created */}
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color="success">
              <CreateIcon fontSize="small" />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Informe Creado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(informeJuridico.fecha_creacion || informeJuridico.fecha_notificaciones)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por: {extractUserName(informeJuridico.elaborado_por_detalle)}
            </Typography>
          </TimelineContent>
        </TimelineItem>

        {/* Sent */}
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color={isEnviado ? "success" : "grey"} variant={isEnviado ? "filled" : "outlined"}>
              <SendIcon fontSize="small" />
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isEnviado ? "text.primary" : "text.disabled" }}>
              Informe Enviado
            </Typography>
            {isEnviado && informeJuridico.fecha_envio ? (
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(informeJuridico.fecha_envio)}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                Pendiente
              </Typography>
            )}
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    )
  }

  /**
   * Render info cards for notification details
   */
  const renderInfoCards = () => {
    if (!informeJuridico) return null

    return (
      <Grid container spacing={2}>
        {/* Instituciones Notificadas */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BusinessIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Instituciones Notificadas
              </Typography>
            </Box>
            <Typography variant="body1">
              {informeJuridico.instituciones_notificadas}
            </Typography>
          </Paper>
        </Grid>

        {/* Fecha de Notificaciones */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Fecha de Notificaciones
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(informeJuridico.fecha_notificaciones)}
            </Typography>
          </Paper>
        </Grid>

        {/* Medio de Notificación */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ color: "primary.main" }}>
                {MEDIO_ICONS[informeJuridico.medio_notificacion]}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Medio de Notificación
              </Typography>
            </Box>
            <Typography variant="body1">
              {MEDIO_NOTIFICACION_LABELS[informeJuridico.medio_notificacion]}
            </Typography>
          </Paper>
        </Grid>

        {/* Destinatarios */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PeopleIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Destinatarios
              </Typography>
            </Box>
            <Typography variant="body1">
              {informeJuridico.destinatarios}
            </Typography>
          </Paper>
        </Grid>

        {/* Observaciones */}
        {informeJuridico.observaciones && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Observaciones
              </Typography>
              <Typography variant="body1">
                {informeJuridico.observaciones}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    )
  }

  /**
   * Render informe content
   */
  const renderInforme = () => {
    if (!informeJuridico) return null

    return (
      <SectionCard
        title="Informe Jurídico"
        chips={[statusChip]}
        date={`Elaborado por: ${extractUserName(informeJuridico.elaborado_por_detalle)}`}
        showCheckIcon={isEnviado}
        headerActions={
          canModify && !isEnviado ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SendIcon />}
              onClick={() => setSendConfirmOpen(true)}
              disabled={!canSend}
              sx={{
                backgroundColor: "#4f3ff0",
                "&:hover": { backgroundColor: "#3a2cc2" },
                textTransform: "none",
              }}
              title={
                !tieneInformeOficial
                  ? "Debe adjuntar el informe oficial antes de enviar"
                  : ""
              }
            >
              Enviar Informe
            </Button>
          ) : undefined
        }
      >
        {/* Warning if missing informe oficial */}
        {!isEnviado && !tieneInformeOficial && canModify && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Falta adjuntar el informe oficial</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Debe adjuntar el documento de informe jurídico oficial (tipo INFORME) antes de poder enviar.
            </Typography>
          </Alert>
        )}

        {/* Timeline for status progression */}
        {isEnviado && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Estado del Informe
            </Typography>
            {renderTimeline()}
          </Box>
        )}

        {/* Notificaciones Institucionales - Info Cards */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Notificaciones Institucionales
          </Typography>
          {renderInfoCards()}
        </Box>

        {/* Adjuntos */}
        <AdjuntosInformeJuridico
          medidaId={medidaId}
          adjuntos={adjuntos}
          isLoading={isLoadingAdjuntos}
          error={adjuntosError}
          canModify={canModify}
          onUpload={uploadAdjunto}
          onDelete={deleteAdjunto}
        />

        {/* Estado de Envío - Success Alert */}
        {isEnviado && informeJuridico.fecha_envio && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Informe Enviado</strong> el {formatDateTime(informeJuridico.fecha_envio)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              La medida avanzó al estado PENDIENTE_RATIFICACION_JUDICIAL (Estado 5)
            </Typography>
          </Alert>
        )}
      </SectionCard>
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

      {/* Create and Send Dialog (Unified Flow) */}
      <InformeJuridicoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateAndSendInforme}
        isLoading={isLoadingInforme}
        medidaNumero={medidaNumero}
      />

      {/* Send Confirmation Dialog */}
      {sendConfirmOpen && (
        <Box sx={{ mt: 2 }}>
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
        </Box>
      )}
    </Box>
  )
}
