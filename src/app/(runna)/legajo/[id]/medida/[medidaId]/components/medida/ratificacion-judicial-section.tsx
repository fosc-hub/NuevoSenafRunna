"use client"

/**
 * RatificacionJudicialSection Component (MED-05)
 * Sección principal para visualizar y gestionar Ratificación Judicial
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
  Grid,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  TaskAlt as TaskAltIcon,
} from "@mui/icons-material"
import { useRatificacionJudicial } from "../../hooks/useRatificacionJudicial"
import { RatificacionJudicialDialog } from "../dialogs/ratificacion-judicial-dialog"
import { AdjuntosRatificacion } from "../ratificacion-judicial/adjuntos-ratificacion"
import {
  extractUserName,
  DECISION_JUDICIAL_LABELS,
  getDecisionColor,
} from "../../types/ratificacion-judicial-api"
import type { EstadoEtapa } from "@/app/(runna)/legajo-mesa/types/medida-api"
import type {
  CreateRatificacionJudicialRequest,
  UpdateRatificacionJudicialRequest,
  RatificacionJudicial,
} from "../../types/ratificacion-judicial-api"
import { DecisionJudicial } from "../../types/ratificacion-judicial-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface RatificacionJudicialSectionProps {
  medidaId: number
  medidaNumero?: string
  estadoActual?: EstadoEtapa | string
  etapaId?: number
  /** Tipo de medida (MPI/MPE/MPJ) — usado para detectar el cierre directo de MPE-en-CESE */
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ' | string
  /** Tipo de etapa actual (APERTURA/INNOVACION/CESE/POST_CESE) */
  tipoEtapa?: 'APERTURA' | 'INNOVACION' | 'PRORROGA' | 'CESE' | 'POST_CESE' | string
  /** Estado de vigencia de la medida (VIGENTE/CERRADA/...) */
  estadoVigencia?: 'VIGENTE' | 'CERRADA' | 'ARCHIVADA' | 'NO_RATIFICADA' | string
  userRole?: string
  userLevel?: number
  isEquipoLegal?: boolean
  isJZ?: boolean
  isSuperuser?: boolean
  onRatificacionRegistrada?: () => void
  initialData?: RatificacionJudicial[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const canManageRatificacionJudicial = (
  isEquipoLegal?: boolean,
  isJZ?: boolean,
  isSuperuser?: boolean
): boolean => {
  if (isSuperuser) return true
  if (isEquipoLegal) return true
  if (isJZ) return true
  return false
}

const isPendingRatificacionJudicial = (estadoActual?: string): boolean => {
  return estadoActual === "PENDIENTE_RATIFICACION_JUDICIAL"
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

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

const getDecisionIcon = (decision: DecisionJudicial) => {
  switch (decision) {
    case DecisionJudicial.RATIFICADA:
      return <CheckCircleIcon />
    case DecisionJudicial.NO_RATIFICADA:
      return <CancelIcon />
    case DecisionJudicial.PENDIENTE:
      return <WarningIcon />
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RatificacionJudicialSection: React.FC<RatificacionJudicialSectionProps> = ({
  medidaId,
  medidaNumero,
  estadoActual,
  etapaId,
  tipoMedida,
  tipoEtapa,
  estadoVigencia,
  isEquipoLegal,
  isJZ,
  isSuperuser,
  onRatificacionRegistrada,
  initialData,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

  const {
    ratificacion,
    isLoading,
    error,
    adjuntos,
    hasRatificacion,
    isRatificada,
    isNoRatificada,
    isPendiente,
    isFinal,
    canModify,
    createRatificacion,
    updateRatificacion,
  } = useRatificacionJudicial({ medidaId, etapaId, initialData })

  const canManage = canManageRatificacionJudicial(isEquipoLegal, isJZ, isSuperuser)
  const isPendingState = isPendingRatificacionJudicial(estadoActual)

  // Sprint 4: si una MPE está en etapa CESE, el envío del informe jurídico
  // cierra la medida directamente sin pasar por ratificación. Si una medida
  // ya está CERRADA, o estamos en POST_CESE, tampoco corresponde registrar
  // ratificación. Mostrar un mensaje claro en lugar del error genérico.
  const ratificacionSkippedMpeCese =
    tipoMedida === "MPE" && tipoEtapa === "CESE"
  const isPostCese = tipoEtapa === "POST_CESE"
  const isMedidaCerrada = estadoVigencia === "CERRADA"
  const ratificacionNoRequerida =
    !hasRatificacion &&
    (ratificacionSkippedMpeCese || isPostCese || isMedidaCerrada)

  const canCreate =
    canManage && isPendingState && !hasRatificacion && !ratificacionNoRequerida

  const handleCreateRatificacion = async (data: CreateRatificacionJudicialRequest) => {
    try {
      await createRatificacion(data)
      setDialogOpen(false)
      if (onRatificacionRegistrada) onRatificacionRegistrada()
    } catch (error) {
      console.error("Error creating ratificación:", error)
    }
  }

  const handleUpdateRatificacion = async (data: UpdateRatificacionJudicialRequest) => {
    try {
      await updateRatificacion(data)
      setDialogOpen(false)
      if (onRatificacionRegistrada) onRatificacionRegistrada()
    } catch (error) {
      console.error("Error updating ratificación:", error)
    }
  }

  const handleSubmit = async (data: CreateRatificacionJudicialRequest | UpdateRatificacionJudicialRequest) => {
    if (dialogMode === "create") {
      await handleCreateRatificacion(data as CreateRatificacionJudicialRequest)
    } else {
      await handleUpdateRatificacion(data as UpdateRatificacionJudicialRequest)
    }
  }

  const handleOpenCreateDialog = () => {
    setDialogMode("create")
    setDialogOpen(true)
  }

  const handleOpenEditDialog = () => {
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const renderLoading = () => (
    <Card>
      <CardHeader title={<Skeleton width={200} />} subheader={<Skeleton width={150} />} />
      <CardContent>
        <Skeleton variant="rectangular" height={100} />
      </CardContent>
    </Card>
  )

  const renderError = () => (
    <Alert severity="error">Error al cargar ratificación judicial: {error}</Alert>
  )

  const renderEmpty = () => (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GavelIcon />
            <Typography variant="h6">Ratificación Judicial</Typography>
          </Box>
        }
        subheader="MED-05: Registro de Ratificación Judicial (Cierre del Ciclo)"
      />
      <CardContent>
        {ratificacionNoRequerida ? (
          <Alert severity="success" icon={<TaskAltIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              No corresponde registrar ratificación judicial en esta etapa.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {ratificacionSkippedMpeCese &&
                "MPE en etapa CESE: el cierre se realiza al enviar el informe jurídico. " +
                  "La medida ya quedó CERRADA y se abrió la etapa POST_CESE."}
              {!ratificacionSkippedMpeCese && isPostCese &&
                "La etapa POST_CESE es gestionada por el módulo PLTM y no requiere ratificación."}
              {!ratificacionSkippedMpeCese && !isPostCese && isMedidaCerrada &&
                "La medida está cerrada; no corresponde registrar ratificaciones adicionales."}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" icon={<WarningIcon />}>
            <Typography variant="body2">Aún no se ha registrado la ratificación judicial para esta medida.</Typography>
            {!isPendingState && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Estado actual: <strong>{estadoActual}</strong> (se requiere estado PENDIENTE_RATIFICACION_JUDICIAL)
              </Typography>
            )}
          </Alert>
        )}

        {canCreate && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ backgroundColor: "#4f3ff0", "&:hover": { backgroundColor: "#3a2cc2" } }}
            >
              Registrar Ratificación Judicial
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const renderRatificacion = () => {
    if (!ratificacion) return null

    const decisionColor = getDecisionColor(ratificacion.decision)
    const decisionIcon = getDecisionIcon(ratificacion.decision)

    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor:
                    decisionColor === "success"
                      ? "success.main"
                      : decisionColor === "error"
                        ? "error.main"
                        : "warning.main",
                }}
              >
                {React.cloneElement(decisionIcon as React.ReactElement, { sx: { fontSize: 18 } })}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Ratificación Judicial
                  </Typography>
                  <Chip
                    label={DECISION_JUDICIAL_LABELS[ratificacion.decision]}
                    color={decisionColor}
                    size="small"
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                  />
                  {isFinal && (
                    <Chip
                      label="Estado Final"
                      variant="outlined"
                      size="small"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Registrado por: {extractUserName(ratificacion.usuario_registro_nombre)}
                </Typography>
              </Box>
            </Box>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(0,0,0,0.01)", borderRadius: 2 }}>
            <Typography
              variant="overline"
              sx={{ fontWeight: 800, color: "text.disabled", letterSpacing: "0.5px", mb: 1.5, display: "block" }}
            >
              Información de la Resolución
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <GavelIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Decisión
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {DECISION_JUDICIAL_LABELS[ratificacion.decision]}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      F. Resolución
                    </Typography>
                  </Box>
                  <Typography variant="body2">{formatDate(ratificacion.fecha_resolucion)}</Typography>
                </Box>
              </Grid>

              {ratificacion.fecha_notificacion && (
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}
                      >
                        F. Notificación
                      </Typography>
                    </Box>
                    <Typography variant="body2">{formatDate(ratificacion.fecha_notificacion)}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Cargado el: {formatDateTime(ratificacion.fecha_registro)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {ratificacion.observaciones && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", mb: 0.5, display: "block" }}
              >
                Observaciones
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  bgcolor: "rgba(0,0,0,0.02)",
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {ratificacion.observaciones}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <AdjuntosRatificacion adjuntos={adjuntos} isLoading={false} error={null} />
          </Box>

          {ratificacion?.cese_completado && (
            <Box sx={{ mt: 2 }}>
              <Alert
                severity="info"
                icon={<TaskAltIcon sx={{ fontSize: 20 }} />}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "rgba(2, 136, 209, 0.05)",
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Medida Cerrada Automáticamente
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  La ratificación judicial ha provocado el cierre automático de la medida. Se ha iniciado la etapa
                  POST_CESE.
                </Typography>
                {ratificacion?.etapa_post_cese && (
                  <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 600, display: "block" }}>
                    Iniciado el: {new Date(ratificacion.etapa_post_cese.fecha_inicio).toLocaleDateString("es-AR")}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {isRatificada && !ratificacion?.cese_completado && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="body2">
                  <strong>Medida Ratificada Judicialmente</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  La medida ha sido ratificada por el Juzgado. El ciclo MED-01 → MED-05 ha sido completado exitosamente.
                </Typography>
              </Alert>
            </Box>
          )}

          {isNoRatificada && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Alert severity="error" icon={<CancelIcon />}>
                <Typography variant="body2">
                  <strong>Medida No Ratificada</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  La medida no fue ratificada por el Juzgado. Se requiere revisión y posible reformulación de la medida.
                </Typography>
              </Alert>
            </Box>
          )}

          {isPendiente && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1 }} />
              <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Decisión Pendiente
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  La resolución judicial aún está pendiente de decisión final.
                </Typography>
              </Alert>

              {canModify && canManage && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditDialog}
                    sx={{
                      borderColor: "#4f3ff0",
                      color: "#4f3ff0",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "#3a2cc2",
                        backgroundColor: "rgba(79, 63, 240, 0.04)",
                      },
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Editar Ratificación
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) return renderLoading()
  if (error) return renderError()

  return (
    <Box>
      {hasRatificacion ? renderRatificacion() : renderEmpty()}

      <RatificacionJudicialDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        medidaNumero={medidaNumero}
        mode={dialogMode}
        initialData={dialogMode === "edit" ? ratificacion : null}
        etapaId={etapaId}
      />
    </Box>
  )
}

export default RatificacionJudicialSection
