"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Chip,
  IconButton,
  Paper,
  Grid,
} from "@mui/material"
import {
  Warning as WarningIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import type {
  LegajoMatch,
  AlertLevel,
  VincularDemandaRequest,
  CrearConDuplicadoRequest,
} from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"
import { ALERT_COLORS, ALERT_MESSAGES } from "@/components/forms/constants/duplicate-thresholds"
import ScoringProgressBar from "./scoring-progress-bar"
import LegajoComparisonView from "./legajo-comparison-view"
import DuplicateJustificationModal from "./duplicate-justification-modal"
import PermisosSolicitudModal from "./permisos-solicitud-modal"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface DuplicateDetectionModalProps {
  /** Si el modal está abierto */
  open: boolean

  /** Callback al cerrar */
  onClose: () => void

  /** Matches encontrados (ordenados por score desc) */
  matches: LegajoMatch[]

  /** Nivel de alerta máximo */
  maxAlertLevel: AlertLevel

  /** Callback al vincular demanda a legajo existente */
  onVincular: (legajoId: number, data: VincularDemandaRequest) => Promise<void>

  /** Callback al crear nuevo legajo con duplicado confirmado */
  onCrearNuevo: (data: CrearConDuplicadoRequest) => Promise<void>

  /** Callback al solicitar permisos */
  onSolicitarPermisos?: (
    legajoId: number,
    data: { tipo: "acceso_temporal" | "transferencia"; motivo: string }
  ) => Promise<void>

  /** Si está procesando alguna acción */
  isProcessing?: boolean

  /** Datos de la demanda a vincular */
  demandaData?: {
    tipo_demanda: string
    descripcion?: string
  }
}

/**
 * Modal principal de detección de duplicados
 *
 * Características:
 * - Muestra matches encontrados con scoring visual
 * - Comparación detallada lado a lado
 * - 4 acciones: Ver Detalle, Vincular, Crear Nuevo, Cancelar
 * - Manejo de permisos para legajos de otras zonas
 * - Color-coded según nivel de alerta
 * - Soporte para múltiples matches (muestra top 5)
 *
 * @example
 * ```tsx
 * <DuplicateDetectionModal
 *   open={hasDuplicates}
 *   onClose={() => setShowModal(false)}
 *   matches={duplicatesFound}
 *   maxAlertLevel="CRITICA"
 *   onVincular={handleVincular}
 *   onCrearNuevo={handleCrearNuevo}
 * />
 * ```
 */
const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  open,
  onClose,
  matches,
  maxAlertLevel,
  onVincular,
  onCrearNuevo,
  onSolicitarPermisos,
  isProcessing = false,
  demandaData,
}) => {
  // Estado de match seleccionado para ver detalle
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  // Estado de modales hijos
  const [showJustificationModal, setShowJustificationModal] = useState(false)
  const [showPermisosModal, setShowPermisosModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: "vincular" | "crear"
    legajoId?: number
  } | null>(null)

  // Ordenar matches por score (descendente)
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => b.score - a.score).slice(0, 5) // Top 5
  }, [matches])

  // Match principal (mayor score)
  const primaryMatch = sortedMatches[0]

  // Tiene matches adicionales
  const hasMultipleMatches = sortedMatches.length > 1

  /**
   * Obtiene el color del borde según nivel de alerta
   */
  const getBorderColor = (): string => {
    return ALERT_COLORS[maxAlertLevel]
  }

  /**
   * Formatea fecha para mostrar
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No disponible"
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  /**
   * Toggle de expansión de detalle de match
   */
  const handleToggleDetail = (matchId: number) => {
    setSelectedMatchId(selectedMatchId === matchId ? null : matchId)
  }

  /**
   * Acción: Vincular demanda
   */
  const handleVincularClick = (match: LegajoMatch) => {
    // Si no tiene permisos, mostrar modal de solicitud
    if (!match.tiene_permisos) {
      setPendingAction({ type: "vincular", legajoId: match.legajo_id })
      setShowPermisosModal(true)
      return
    }

    // Si no puede vincular (por estado del legajo), mostrar error
    if (!match.puede_vincular) {
      alert(
        "No se puede vincular a este legajo. El legajo está cerrado o no permite vinculaciones."
      )
      return
    }

    // Ejecutar vinculación
    const vincularData: VincularDemandaRequest = {
      tipo_demanda: demandaData?.tipo_demanda || "",
      descripcion: demandaData?.descripcion,
      confirmacion_duplicado: true,
      score_similitud: match.score,
    }

    onVincular(match.legajo_id, vincularData)
  }

  /**
   * Acción: Crear nuevo legajo (requiere justificación)
   */
  const handleCrearNuevoClick = () => {
    setPendingAction({ type: "crear" })
    setShowJustificationModal(true)
  }

  /**
   * Confirmación de justificación para crear nuevo
   */
  const handleJustificationConfirm = (justification: string) => {
    if (!primaryMatch) return

    const crearData: CrearConDuplicadoRequest = {
      duplicado_ignorado_legajo_id: primaryMatch.legajo_id,
      score_similitud: primaryMatch.score,
      justificacion: justification,
    }

    onCrearNuevo(crearData)
    setShowJustificationModal(false)
  }

  /**
   * Confirmación de solicitud de permisos
   */
  const handlePermisosConfirm = (requestData: {
    tipo: "acceso_temporal" | "transferencia"
    motivo: string
  }) => {
    if (!pendingAction?.legajoId || !onSolicitarPermisos) return

    onSolicitarPermisos(pendingAction.legajoId, requestData)
    setShowPermisosModal(false)
    setPendingAction(null)
  }

  /**
   * Cierre de modal (solo si no está procesando)
   */
  const handleClose = () => {
    if (isProcessing) return
    setSelectedMatchId(null)
    onClose()
  }

  /**
   * Renderiza la información resumida de un legajo match
   */
  const renderMatchSummary = (match: LegajoMatch, isPrimary: boolean = false) => {
    const isExpanded = selectedMatchId === match.legajo_id

    return (
      <Paper
        key={match.legajo_id}
        variant="outlined"
        sx={{
          mb: 2,
          borderColor: isPrimary ? getBorderColor() : "grey.300",
          borderWidth: isPrimary ? 2 : 1,
          borderLeftWidth: 4,
          borderLeftColor: getBorderColor(),
        }}
      >
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleToggleDetail(match.legajo_id)}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Legajo {match.legajo_numero}
                  </Typography>
                  {isPrimary && (
                    <Chip label="Mayor coincidencia" size="small" color="primary" />
                  )}
                  {!match.tiene_permisos && (
                    <Chip
                      icon={<LockIcon fontSize="small" />}
                      label="Sin permisos"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  {/* Scoring progress bar */}
                  <Box sx={{ mb: 1 }}>
                    <ScoringProgressBar
                      score={match.score}
                      alertLevel={match.nivel_alerta}
                      showPercentage={true}
                      size="medium"
                      showTooltip={true}
                    />
                  </Box>

                  {/* Info del legajo */}
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        NNyA:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {match.nnya.nombre} {match.nnya.apellido}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        DNI:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {match.nnya.dni ? match.nnya.dni.toString().padStart(8, "0") : "S/D"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Zona:
                      </Typography>
                      <Typography variant="body2">{match.legajo_info.zona.nombre}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Apertura:
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(match.legajo_info.fecha_apertura)}
                      </Typography>
                    </Grid>
                    {match.legajo_info.urgencia_actual && (
                      <Grid item xs={12}>
                        <Chip
                          label={`Urgencia: ${match.legajo_info.urgencia_actual}`}
                          size="small"
                          color={
                            match.legajo_info.urgencia_actual === "ALTA"
                              ? "error"
                              : match.legajo_info.urgencia_actual === "MEDIA"
                                ? "warning"
                                : "default"
                          }
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              }
            />
            <IconButton edge="end">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </ListItemButton>
        </ListItem>

        {/* Comparación detallada (colapsable) */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            <LegajoComparisonView comparison={match.comparacion} showLevenshtein={true} />

            {/* Botón de vincular en detalle */}
            {isExpanded && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={match.tiene_permisos ? <LinkIcon /> : <PersonAddIcon />}
                  onClick={() => handleVincularClick(match)}
                  disabled={isProcessing}
                >
                  {match.tiene_permisos ? "Vincular a este Legajo" : "Solicitar Acceso"}
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    )
  }

  if (!primaryMatch) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={isProcessing}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon sx={{ color: getBorderColor() }} />
              <Typography variant="h6">
                {ALERT_MESSAGES[maxAlertLevel]?.title || "Posible Duplicado Detectado"}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isProcessing} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Alerta principal */}
          <Alert
            severity={
              maxAlertLevel === "CRITICA" ? "error" : maxAlertLevel === "ALTA" ? "warning" : "info"
            }
            icon={<WarningIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {ALERT_MESSAGES[maxAlertLevel]?.subtitle}
            </Typography>
            <Typography variant="body2">
              Se encontró{sortedMatches.length > 1 ? "n" : ""}{" "}
              <strong>{sortedMatches.length}</strong> legajo
              {sortedMatches.length > 1 ? "s" : ""} con datos similares. Se recomienda{" "}
              <strong>{ALERT_MESSAGES[maxAlertLevel]?.recommendation}</strong>.
            </Typography>
          </Alert>

          {/* Información de coincidencias */}
          {hasMultipleMatches && (
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2">
                Se muestran los <strong>{sortedMatches.length}</strong> legajos con mayor
                coincidencia. Haz clic en cada uno para ver el detalle completo.
              </Typography>
            </Alert>
          )}

          {/* Lista de matches */}
          <List disablePadding>
            {sortedMatches.map((match, index) => renderMatchSummary(match, index === 0))}
          </List>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: "wrap" }}>
          {/* Cancelar */}
          <Button onClick={handleClose} disabled={isProcessing} variant="outlined">
            Cancelar
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* Ver detalle del principal */}
          {selectedMatchId !== primaryMatch.legajo_id && (
            <Button
              startIcon={<VisibilityIcon />}
              onClick={() => handleToggleDetail(primaryMatch.legajo_id)}
              disabled={isProcessing}
              variant="outlined"
            >
              Ver Detalle
            </Button>
          )}

          {/* Crear Nuevo (siempre habilitado con justificación) */}
          <Button
            startIcon={<AddIcon />}
            onClick={handleCrearNuevoClick}
            disabled={isProcessing}
            variant="outlined"
            color="warning"
          >
            Crear Nuevo
          </Button>

          {/* Vincular al principal */}
          <Button
            startIcon={primaryMatch.tiene_permisos ? <LinkIcon /> : <PersonAddIcon />}
            onClick={() => handleVincularClick(primaryMatch)}
            disabled={isProcessing}
            variant="contained"
            color="primary"
          >
            {primaryMatch.tiene_permisos ? "Vincular Demanda" : "Solicitar Acceso"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de justificación para crear nuevo */}
      <DuplicateJustificationModal
        open={showJustificationModal}
        onClose={() => setShowJustificationModal(false)}
        onConfirm={handleJustificationConfirm}
        duplicateScore={primaryMatch.score}
        legajoNumero={primaryMatch.legajo_numero}
        isCreating={isProcessing}
      />

      {/* Modal de solicitud de permisos */}
      {showPermisosModal && primaryMatch && (
        <PermisosSolicitudModal
          open={showPermisosModal}
          onClose={() => {
            setShowPermisosModal(false)
            setPendingAction(null)
          }}
          onSubmit={handlePermisosConfirm}
          legajoInfo={{
            numero: primaryMatch.legajo_numero,
            zona: primaryMatch.legajo_info.zona.nombre,
            responsable: {
              nombre: primaryMatch.legajo_info.responsable.nombre_completo,
              email: primaryMatch.legajo_info.responsable.email,
            },
          }}
          isSubmitting={isProcessing}
        />
      )}
    </>
  )
}

export default DuplicateDetectionModal
