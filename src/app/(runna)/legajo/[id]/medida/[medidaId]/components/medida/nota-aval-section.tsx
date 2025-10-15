"use client"

/**
 * NotaAvalSection Component (MED-03)
 * Sección principal para visualizar y gestionar Notas de Aval
 *
 * Características:
 * - Muestra historial de notas de aval (en caso de observaciones múltiples)
 * - Información del Director que emitió cada decisión
 * - Fecha de emisión y comentarios
 * - Adjuntos descargables
 * - Botón "Emitir Nota de Aval" (visible si estado = PENDIENTE_NOTA_AVAL y usuario = Director o Superusuario)
 * - Estados visuales según decisión (aprobado/observado)
 *
 * Permisos:
 * - Directores (nivel 3 o 4): pueden emitir notas de aval
 * - Superusuarios: tienen acceso completo
 * - Otros usuarios: solo visualización del historial
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
  Collapse,
  IconButton,
} from "@mui/material"
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab"
import {
  CheckCircle as ApprovedIcon,
  Warning as ObservedIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import { useNotaAval } from "../../hooks/useNotaAval"
import { NotaAvalDialog } from "../dialogs/nota-aval-dialog"
import { AdjuntosNotaAval } from "../nota-aval/adjuntos-nota-aval"
import { extractUserName } from "../../types/nota-aval-api"
import type { EstadoEtapa } from "@/app/(runna)/legajo-mesa/types/medida-api"

// ============================================================================
// INTERFACES
// ============================================================================

interface NotaAvalSectionProps {
  medidaId: number
  medidaNumero?: string
  estadoActual?: EstadoEtapa | string
  userRole?: string // Rol del usuario actual
  userLevel?: number // Nivel del usuario actual (3 o 4 para Director)
  isSuperuser?: boolean // Si el usuario es superusuario (tiene acceso completo)
  onNotaAvalCreated?: () => void // Callback al crear una nota de aval exitosamente
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can manage Nota de Aval
 * - Directors (nivel 3 o 4) can manage
 * - Superusers can manage
 */
const canManageNotaAval = (userLevel?: number, isSuperuser?: boolean): boolean => {
  // Superuser always has access
  if (isSuperuser) return true

  // Directors (nivel 3 o 4) have access
  return userLevel === 3 || userLevel === 4
}

/**
 * Check if medida is in PENDIENTE_NOTA_AVAL state
 */
const isPendingNotaAval = (estadoActual?: string): boolean => {
  return estadoActual === "PENDIENTE_NOTA_AVAL"
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NotaAvalSection: React.FC<NotaAvalSectionProps> = ({
  medidaId,
  medidaNumero,
  estadoActual,
  userRole,
  userLevel,
  isSuperuser,
  onNotaAvalCreated,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    notasAval,
    isLoadingNotasAval,
    notasAvalError,
    hasNotasAval,
    notasAvalCount,
    mostRecentNotaAval,
    refetchNotasAval,
  } = useNotaAval(medidaId)

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const hasPermission = canManageNotaAval(userLevel, isSuperuser)
  const canEmitNotaAval = hasPermission && isPendingNotaAval(estadoActual)
  const shouldShowEmitButton = canEmitNotaAval

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle dialog open
   */
  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  /**
   * Handle dialog close
   */
  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  /**
   * Handle nota de aval created successfully
   */
  const handleNotaAvalCreated = () => {
    refetchNotasAval()
    onNotaAvalCreated?.()
    setDialogOpen(false)
  }

  /**
   * Toggle item expansion
   */
  const toggleItemExpansion = (notaId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(notaId)) {
        newSet.delete(notaId)
      } else {
        newSet.add(notaId)
      }
      return newSet
    })
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingNotasAval) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="text" sx={{ mt: 2 }} />
        <Skeleton variant="text" />
      </Paper>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (notasAvalError) {
    return (
      <Alert severity="error">
        Error al cargar notas de aval: {notasAvalError.message}
      </Alert>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Nota de Aval del Director
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisión y decisión del Director sobre la intervención cargada
          </Typography>
        </Box>

        {/* EMIT BUTTON */}
        {shouldShowEmitButton && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ textTransform: "none" }}
          >
            Emitir Nota de Aval
          </Button>
        )}
      </Box>

      {/* ESTADO INFO */}
      {isPendingNotaAval(estadoActual) && !shouldShowEmitButton && (
        <Alert severity="info" sx={{ mb: 2 }}>
          La medida está pendiente de Nota de Aval del Director. Solo el Director o Superusuario puede emitir la decisión.
        </Alert>
      )}

      {/* NO NOTAS MESSAGE */}
      {!hasNotasAval ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <DescriptionIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sin Notas de Aval
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aún no se ha emitido ninguna Nota de Aval para esta medida
          </Typography>
          {shouldShowEmitButton && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Emitir Primera Nota de Aval
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {/* TIMELINE OF NOTAS */}
          <Timeline position="alternate">
            {notasAval?.map((nota, index) => {
              const isExpanded = expandedItems.has(nota.id)
              const isAprobado = nota.fue_aprobado
              const isObservado = nota.fue_observado

              return (
                <TimelineItem key={nota.id}>
                  {/* OPPOSITE CONTENT (Date) */}
                  <TimelineOppositeContent color="text.secondary">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarIcon fontSize="small" />
                      <Typography variant="caption">
                        {formatDate(nota.fecha_emision)}
                      </Typography>
                    </Box>
                  </TimelineOppositeContent>

                  {/* SEPARATOR */}
                  <TimelineSeparator>
                    <TimelineDot
                      color={isAprobado ? "success" : "warning"}
                      variant={index === 0 ? "filled" : "outlined"}
                    >
                      {isAprobado ? <ApprovedIcon /> : <ObservedIcon />}
                    </TimelineDot>
                    {index < (notasAval?.length || 0) - 1 && <TimelineConnector />}
                  </TimelineSeparator>

                  {/* CONTENT */}
                  <TimelineContent>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: isAprobado ? "success.main" : "warning.main",
                        borderWidth: index === 0 ? 2 : 1,
                      }}
                    >
                      {/* HEADER */}
                      <CardHeader
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: isAprobado ? "success.main" : "warning.main",
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        }
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1">
                              {extractUserName(nota.emitido_por_detalle)}
                            </Typography>
                            <Chip
                              label={nota.decision_display}
                              size="small"
                              color={isAprobado ? "success" : "warning"}
                              icon={isAprobado ? <ApprovedIcon /> : <ObservedIcon />}
                            />
                          </Box>
                        }
                        action={
                          <IconButton
                            onClick={() => toggleItemExpansion(nota.id)}
                            size="small"
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        }
                        sx={{ pb: 1 }}
                      />

                      <Divider />

                      {/* CONTENT */}
                      <CardContent>
                        {/* COMENTARIOS */}
                        {nota.comentarios && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                              <CommentIcon fontSize="small" color="action" />
                              <Typography variant="caption" fontWeight="bold">
                                Comentarios:
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 3 }}>
                              {nota.comentarios}
                            </Typography>
                          </Box>
                        )}

                        {/* EXPANDABLE CONTENT */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Divider sx={{ my: 2 }} />
                          {/* ADJUNTOS */}
                          <AdjuntosNotaAval
                            medidaId={medidaId}
                            canDelete={false}
                            canUpload={false}
                            dense
                          />
                        </Collapse>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>

          {/* INFO: Multiple observaciones */}
          {notasAvalCount > 1 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Esta medida ha tenido {notasAvalCount} revisiones del Director.
              {mostRecentNotaAval?.fue_observado &&
                " La última revisión fue observada y se solicitaron correcciones."}
            </Alert>
          )}
        </Box>
      )}

      {/* DIALOG */}
      <NotaAvalDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        medidaId={medidaId}
        medidaNumero={medidaNumero}
        onSuccess={handleNotaAvalCreated}
      />
    </Box>
  )
}
