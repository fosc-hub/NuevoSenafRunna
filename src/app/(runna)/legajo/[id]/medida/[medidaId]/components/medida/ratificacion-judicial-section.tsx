"use client"

/**
 * RatificacionJudicialSection Component (MED-05)
 * Sección principal para visualizar y gestionar Ratificación Judicial
 *
 * Características:
 * - Muestra ratificación judicial de la medida (decisión, fechas, observaciones)
 * - Estados visuales según decisión (RATIFICADA, NO_RATIFICADA, PENDIENTE)
 * - Documentos adjuntos (resolución judicial, cédula, acuse)
 * - Botón "Registrar Ratificación" (visible si estado = PENDIENTE_RATIFICACION_JUDICIAL y usuario autorizado)
 * - Vista de historial de ratificaciones (activas + inactivas)
 *
 * Permisos:
 * - Equipo Legal (nivel 3 o 4 con flag legal=true): pueden crear ratificación
 * - JZ (Jefe de Zona, nivel 3 o superior): pueden crear ratificación
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
  Grid,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
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
import type { CreateRatificacionJudicialRequest } from "../../types/ratificacion-judicial-api"
import { DecisionJudicial } from "../../types/ratificacion-judicial-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface RatificacionJudicialSectionProps {
  medidaId: number
  medidaNumero?: string
  estadoActual?: EstadoEtapa | string
  userRole?: string // Rol del usuario actual
  userLevel?: number // Nivel del usuario actual
  isEquipoLegal?: boolean // Si el usuario es Equipo Legal (nivel 3 o 4 con flag legal=true)
  isJZ?: boolean // Si el usuario es Jefe de Zona (nivel 3+)
  isSuperuser?: boolean // Si el usuario es superusuario
  onRatificacionRegistrada?: () => void // Callback al registrar ratificación exitosamente
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can manage Ratificación Judicial
 * - Equipo Legal (nivel 3 o 4 con flag legal=true) can manage
 * - JZ (Jefe de Zona, nivel 3+) can manage
 * - Superusers can manage
 */
const canManageRatificacionJudicial = (
  isEquipoLegal?: boolean,
  isJZ?: boolean,
  isSuperuser?: boolean
): boolean => {
  // Superuser always has access
  if (isSuperuser) return true

  // Equipo Legal has access
  if (isEquipoLegal) return true

  // JZ (Jefe de Zona) has access
  if (isJZ) return true

  return false
}

/**
 * Check if medida is in PENDIENTE_RATIFICACION_JUDICIAL state
 */
const isPendingRatificacionJudicial = (estadoActual?: string): boolean => {
  return estadoActual === "PENDIENTE_RATIFICACION_JUDICIAL"
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

/**
 * Get avatar icon for decision
 */
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

export const RatificacionJudicialSection: React.FC<
  RatificacionJudicialSectionProps
> = ({
  medidaId,
  medidaNumero,
  estadoActual,
  userRole,
  userLevel,
  isEquipoLegal,
  isJZ,
  isSuperuser,
  onRatificacionRegistrada,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [dialogOpen, setDialogOpen] = useState(false)

  // ============================================================================
  // HOOKS
  // ============================================================================

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
    tieneResolucionJudicial,
    createRatificacion,
    refetch,
  } = useRatificacionJudicial({ medidaId })

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  const canManage = canManageRatificacionJudicial(isEquipoLegal, isJZ, isSuperuser)
  const isPendingState = isPendingRatificacionJudicial(estadoActual)
  const canCreate = canManage && isPendingState && !hasRatificacion

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle create ratificación
   */
  const handleCreateRatificacion = async (
    data: CreateRatificacionJudicialRequest
  ) => {
    try {
      await createRatificacion(data)
      setDialogOpen(false)

      // Callback
      if (onRatificacionRegistrada) {
        onRatificacionRegistrada()
      }
    } catch (error) {
      console.error("Error creating ratificación:", error)
      // Error is already shown in dialog
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
      Error al cargar ratificación judicial: {error}
    </Alert>
  )

  /**
   * Render empty state (no ratificación yet)
   */
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
        <Alert severity="info" icon={<WarningIcon />}>
          <Typography variant="body2">
            Aún no se ha registrado la ratificación judicial para esta medida.
          </Typography>
          {!isPendingState && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Estado actual: <strong>{estadoActual}</strong> (se requiere estado
              PENDIENTE_RATIFICACION_JUDICIAL)
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
              Registrar Ratificación Judicial
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  /**
   * Render ratificación content
   */
  const renderRatificacion = () => {
    if (!ratificacion) return null

    const decisionColor = getDecisionColor(ratificacion.decision)
    const decisionIcon = getDecisionIcon(ratificacion.decision)

    return (
      <Card>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor:
                  decisionColor === "success"
                    ? "success.main"
                    : decisionColor === "error"
                    ? "error.main"
                    : "warning.main",
              }}
            >
              {decisionIcon}
            </Avatar>
          }
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Ratificación Judicial</Typography>
              <Chip
                label={DECISION_JUDICIAL_LABELS[ratificacion.decision]}
                color={decisionColor}
                size="small"
              />
              {isFinal && (
                <Chip
                  label="Estado Final"
                  color="default"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          }
          subheader={`Registrado por: ${extractUserName(ratificacion.usuario_registro_nombre)}`}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Información de Decisión */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Información de la Resolución Judicial
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Decisión Judicial */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <GavelIcon
                      sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }}
                    />
                    Decisión Judicial:
                  </Typography>
                  <Chip
                    label={DECISION_JUDICIAL_LABELS[ratificacion.decision]}
                    color={decisionColor}
                  />
                </Box>

                {/* Fechas */}
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <CalendarIcon
                        sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }}
                      />
                      Fecha de Resolución:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(ratificacion.fecha_resolucion)}
                    </Typography>
                  </Box>

                  {ratificacion.fecha_notificacion && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <CalendarIcon
                          sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }}
                        />
                        Fecha de Notificación:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(ratificacion.fecha_notificacion)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Fecha de Registro */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registrado el:
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(ratificacion.fecha_registro)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Observaciones */}
            {ratificacion.observaciones && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Observaciones
                </Typography>
                <Typography variant="body1">{ratificacion.observaciones}</Typography>
              </Grid>
            )}

            {/* Adjuntos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <AdjuntosRatificacion
                adjuntos={adjuntos}
                isLoading={false}
                error={null}
              />
            </Grid>

            {/* Estado Final Alert */}
            {isRatificada && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="body2">
                    <strong>Medida Ratificada Judicialmente</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    La medida ha sido ratificada por el Juzgado. El ciclo MED-01 →
                    MED-05 ha sido completado exitosamente.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {isNoRatificada && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Alert severity="error" icon={<CancelIcon />}>
                  <Typography variant="body2">
                    <strong>Medida No Ratificada</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    La medida no fue ratificada por el Juzgado. Se requiere revisión y
                    posible reformulación de la medida.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {isPendiente && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="body2">
                    <strong>Decisión Pendiente</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    La resolución judicial aún está pendiente de decisión final.
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

  if (isLoading) {
    return renderLoading()
  }

  if (error) {
    return renderError()
  }

  return (
    <Box>
      {hasRatificacion ? renderRatificacion() : renderEmpty()}

      {/* Create Dialog */}
      <RatificacionJudicialDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateRatificacion}
        isLoading={isLoading}
        medidaNumero={medidaNumero}
      />
    </Box>
  )
}

export default RatificacionJudicialSection
