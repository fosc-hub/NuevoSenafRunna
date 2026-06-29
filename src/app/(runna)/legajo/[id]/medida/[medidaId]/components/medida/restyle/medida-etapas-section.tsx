"use client"

/**
 * Restyled "Etapas" section (Phase 2 of the `medidas_interactivo` redesign).
 *
 * Faithful to the mockup: the medida's etapas are grouped by workflow phase and
 * listed as compact rows. Clicking a row opens a right slide-in **sidebar** with
 * the etapa detail in read mode (estado + flujo documental + documentos
 * adjuntos). A "Gestionar etapa" button in the sidebar opens the full
 * interactive workflow (`UnifiedWorkflowTab`) in a large **modal**, where every
 * step form (registro de intervención, nota de aval, informe jurídico,
 * ratificación, and for MPI seguimiento + informe de cierre) is fillable.
 *
 * Per tipo:
 *   - MPE: one row per phase present (apertura, innovación, prórroga, cese)
 *   - MPI: a single "Apertura" row whose workflow spans apertura → cierre
 *   - MPJ: no documentary flow — handled as activities under control de legalidad
 */
import { useMemo, useState } from "react"
import type React from "react"
import {
  Box,
  Paper,
  Typography,
  Chip,
  Drawer,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Skeleton,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import EditNoteIcon from "@mui/icons-material/EditNote"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { formatDateLocaleAR } from "@/utils/dateUtils"
import { MEDIDA_COLORS, type TipoMedidaKey } from "./medida-theme"
import { UnifiedWorkflowTab } from "../unified-workflow-tab"
import { useEtapaDetail } from "../../../hooks/useEtapaDetail"
import { tipoEtapaToWorkflowPhase, workflowPhaseToTipoEtapa } from "../../../utils/workflow-tipo-mapper"
import type { WorkflowPhase } from "../../../types/workflow"
import type { TipoEtapa } from "../../../types/estado-etapa"
import type { MedidaDetailResponse } from "../../../types/medida-api"

/** Minimal shape consumed from `MedidaDetailResponse.historial_etapas`. */
export interface EtapaLike {
  id: number
  nombre: string
  estado: string
  estado_display?: string
  tipo_etapa?: string
  fecha_inicio_estado?: string | null
  fecha_inicio?: string | null
  es_grupal?: boolean
}

/** medidaData shape forwarded to the interactive UnifiedWorkflowTab. */
export interface WorkflowMedidaData {
  id?: number
  tipo_medida: TipoMedidaKey
  numero_medida?: string
  estado?: string
  fecha_apertura?: string
  estado_vigencia?: string
  [key: string]: any
}

interface MedidaEtapasSectionProps {
  tipo: TipoMedidaKey
  etapas: EtapaLike[]
  etapaActualId?: number
  estadoVigencia?: string
  /** medidaData forwarded to UnifiedWorkflowTab when an etapa is managed. */
  workflowMedidaData?: WorkflowMedidaData
  medidaApiData?: MedidaDetailResponse
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  onMedidaRefetch?: () => void
}

const PHASE_LABEL: Record<WorkflowPhase, string> = {
  apertura: "Apertura",
  innovacion: "Innovación",
  prorroga: "Prórroga",
  cese: "Cese",
}

const PHASE_ORDER: WorkflowPhase[] = ["apertura", "innovacion", "prorroga", "cese"]

/* ── Flujo documental (read-only) ───────────────────────────────────────── */

const FLUJO_STEPS = [
  "Informe inicial",
  "Nota de aprobación",
  "Nota de aval",
  "Informe jurídico",
  "Ratificación",
] as const

const FLUJO_CODIGOS = [
  "PENDIENTE_REGISTRO_INTERVENCION",
  "PENDIENTE_APROBACION_REGISTRO",
  "PENDIENTE_NOTA_AVAL",
  "PENDIENTE_INFORME_JURIDICO",
  "PENDIENTE_RATIFICACION_JUDICIAL",
]

/** How many of the 5 steps apply per tipo. MPI uses only the first 2. */
const PASOS_APLICABLES: Record<TipoMedidaKey, number> = { MPE: 5, MPI: 2, MPJ: 0 }

type StepStatus = "done" | "active" | "pend" | "off"

const STATUS_TEXT: Record<StepStatus, string> = {
  done: "completado",
  active: "en curso",
  pend: "pendiente",
  off: "no aplica",
}

function computeFlujo(
  tipo: TipoMedidaKey,
  estado: string,
  isCurrent: boolean
): { label: string; status: StepStatus }[] {
  const aplicables = PASOS_APLICABLES[tipo]
  const currentOrden = FLUJO_CODIGOS.indexOf(estado) + 1 // 0 if not found
  return FLUJO_STEPS.map((label, i) => {
    const orden = i + 1
    let status: StepStatus
    if (orden > aplicables) status = "off"
    else if (!isCurrent) status = "done"
    else if (currentOrden === 0) status = "pend"
    else if (orden < currentOrden) status = "done"
    else if (orden === currentOrden) status = "active"
    else status = "pend"
    return { label, status }
  })
}

const SectionHeader: React.FC = () => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 600,
      color: MEDIDA_COLORS.text3,
      textTransform: "uppercase",
      letterSpacing: ".07em",
      mb: "12px",
    }}
  >
    Etapas
  </Typography>
)

/* ── Sidebar (read-only etapa detail) ───────────────────────────────────── */

interface EtapaDetailPanelProps {
  tipo: TipoMedidaKey
  phase: WorkflowPhase
  medidaId?: number
  fallbackEstado: string
  isCurrent: boolean
  onClose: () => void
  onGestionar: () => void
}

/** Flat adjunto descriptor collected from the etapa documents. */
interface AdjuntoLike {
  nombre: string
  paso: string
}

function collectAdjuntos(documentos: any): AdjuntoLike[] {
  if (!documentos) return []
  const out: AdjuntoLike[] = []
  const push = (paso: string, docs: any[]) => {
    for (const d of docs ?? []) {
      const adjuntos = d?.adjuntos ?? d?.archivos ?? []
      if (Array.isArray(adjuntos) && adjuntos.length) {
        for (const a of adjuntos) {
          out.push({ paso, nombre: a?.nombre || a?.archivo_nombre || a?.nombre_archivo || "Documento" })
        }
      } else {
        // No explicit attachments, but the document itself exists.
        out.push({ paso, nombre: d?.titulo || d?.nombre || paso })
      }
    }
  }
  push("Registro de intervención", documentos.intervenciones)
  push("Nota de aval", documentos.notas_aval)
  push("Informe jurídico", documentos.informes_juridicos)
  push("Ratificación judicial", documentos.ratificaciones)
  return out
}

const PanelLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      fontSize: 10,
      fontWeight: 700,
      color: MEDIDA_COLORS.text4,
      textTransform: "uppercase",
      letterSpacing: ".08em",
      mb: "10px",
      pb: "8px",
      borderBottom: `1px solid ${MEDIDA_COLORS.border}`,
    }}
  >
    {children}
  </Typography>
)

const EtapaDetailPanel: React.FC<EtapaDetailPanelProps> = ({
  tipo,
  phase,
  medidaId,
  fallbackEstado,
  isCurrent,
  onClose,
  onGestionar,
}) => {
  const tipoEtapa = workflowPhaseToTipoEtapa(phase)
  const { etapaDetail, documentos, isLoading } = useEtapaDetail(medidaId ?? 0, tipoEtapa, {
    enabled: !!medidaId,
  })

  const estado = etapaDetail?.etapa.estado_actual?.codigo || fallbackEstado || ""
  const estadoDisplay = etapaDetail?.etapa.estado_actual?.nombre_display
  const steps = computeFlujo(tipo, estado, isCurrent)
  const adjuntos = useMemo(() => collectAdjuntos(documentos), [documentos])
  const fecha = etapaDetail?.etapa.fecha_inicio
    ? formatDateLocaleAR(etapaDetail.etapa.fecha_inicio)
    : null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Navy header (mockup) */}
      <Box
        sx={{
          bgcolor: MEDIDA_COLORS.navy2,
          px: "18px",
          py: "14px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              px: "8px",
              py: "2px",
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,.15)",
              color: "rgba(255,255,255,.8)",
              fontWeight: 600,
              letterSpacing: ".04em",
              display: "inline-block",
              mb: "6px",
            }}
          >
            Etapa
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
            {PHASE_LABEL[phase]}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            ml: "auto",
            color: "#fff",
            bgcolor: "rgba(255,255,255,.1)",
            borderRadius: "6px",
            "&:hover": { bgcolor: "rgba(255,255,255,.2)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: "18px" }}>
        {/* Estado */}
        <Box sx={{ mb: "20px" }}>
          <PanelLabel>Estado</PanelLabel>
          {isLoading ? (
            <Skeleton variant="rounded" width={140} height={22} />
          ) : (
            <Chip
              label={estadoDisplay || estado || (isCurrent ? "En curso" : "Sin iniciar")}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: isCurrent ? "#EFF6FF" : "#ECFDF3",
                color: isCurrent ? "#1E40AF" : "#027A48",
                border: `1px solid ${isCurrent ? "#93C5FD" : "#A9EFC5"}`,
              }}
            />
          )}
        </Box>

        {/* Flujo documental (read-only) */}
        <Box sx={{ mb: "20px" }}>
          <PanelLabel>Flujo documental</PanelLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {steps.map((st, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  p: "7px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${MEDIDA_COLORS.border}`,
                  bgcolor: MEDIDA_COLORS.surface2,
                  fontSize: 12,
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor:
                      st.status === "done" ? "#12B76A" : st.status === "active" ? "#2563EB" : MEDIDA_COLORS.border,
                    color: st.status === "done" || st.status === "active" ? "#fff" : MEDIDA_COLORS.text4,
                  }}
                >
                  {st.status === "done" ? <CheckIcon sx={{ fontSize: 13 }} /> : i + 1}
                </Box>
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: 12,
                    color: st.status === "off" ? MEDIDA_COLORS.text4 : MEDIDA_COLORS.text2,
                    textDecoration: st.status === "off" ? "line-through" : "none",
                  }}
                >
                  {st.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color:
                      st.status === "done"
                        ? "#027A48"
                        : st.status === "active"
                        ? "#1E40AF"
                        : MEDIDA_COLORS.text4,
                  }}
                >
                  {STATUS_TEXT[st.status]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Acción: gestionar la etapa (abre el flujo editable) */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<EditNoteIcon />}
          onClick={onGestionar}
          sx={{ mb: "20px", textTransform: "none", fontWeight: 600, bgcolor: MEDIDA_COLORS.accent }}
        >
          {isCurrent ? "Cargar / gestionar paso" : "Gestionar etapa"}
        </Button>

        {/* Documentos adjuntos */}
        <Box>
          <PanelLabel>Documentos de la etapa</PanelLabel>
          {isLoading ? (
            <Skeleton variant="rounded" height={48} />
          ) : adjuntos.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: MEDIDA_COLORS.text3 }}>
              Sin documentos cargados todavía.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {adjuntos.map((a, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    p: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${MEDIDA_COLORS.border}`,
                    bgcolor: MEDIDA_COLORS.surface2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#EFF6FF",
                      color: MEDIDA_COLORS.accent,
                      flexShrink: 0,
                    }}
                  >
                    <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: MEDIDA_COLORS.text2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.nombre}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: MEDIDA_COLORS.text4 }}>{a.paso}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {fecha && (
          <Typography sx={{ fontSize: 11, color: MEDIDA_COLORS.text4, mt: "16px" }}>
            Inicio de la etapa: {fecha}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

/* ── Compact phase row ──────────────────────────────────────────────────── */

interface PhaseRowProps {
  phase: WorkflowPhase
  etapasOfPhase: EtapaLike[]
  isCurrent: boolean
  onOpen: () => void
}

const PhaseRow: React.FC<PhaseRowProps> = ({ phase, etapasOfPhase, isCurrent, onOpen }) => {
  const latest = [...etapasOfPhase].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
  const rawFecha = latest?.fecha_inicio ?? latest?.fecha_inicio_estado
  const fecha = rawFecha ? formatDateLocaleAR(rawFecha) : ""
  const count = etapasOfPhase.length
  const estadoLabel = isCurrent ? latest?.estado_display || "En curso" : count > 0 ? "Registrada" : "Pendiente"

  return (
    <Box
      onClick={onOpen}
      sx={{
        border: `1px solid ${MEDIDA_COLORS.border}`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        p: "10px 14px",
        cursor: "pointer",
        userSelect: "none",
        transition: "background .12s, border-color .12s",
        "&:hover": { bgcolor: MEDIDA_COLORS.surface2, borderColor: MEDIDA_COLORS.border2 },
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          bgcolor: "#FFFBEB",
          color: "#92400E",
          flexShrink: 0,
        }}
      >
        ◆
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: MEDIDA_COLORS.text }}>
        {PHASE_LABEL[phase]}
      </Typography>
      {count > 1 && (
        <Chip
          label={`${count}`}
          size="small"
          sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: MEDIDA_COLORS.surface2, color: MEDIDA_COLORS.text3 }}
        />
      )}
      {fecha && <Typography sx={{ fontSize: 11, color: MEDIDA_COLORS.text3 }}>{fecha}</Typography>}
      <Box sx={{ display: "flex", gap: "8px", ml: "auto", alignItems: "center" }}>
        <Chip
          label={estadoLabel}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 600,
            maxWidth: 200,
            bgcolor: isCurrent ? "#F0F9FF" : count > 0 ? "#F0FDF4" : MEDIDA_COLORS.surface2,
            color: isCurrent ? "#075985" : count > 0 ? "#166534" : MEDIDA_COLORS.text3,
            border: `1px solid ${isCurrent ? "#7DD3FC" : count > 0 ? "#86EFAC" : MEDIDA_COLORS.border}`,
          }}
        />
        <ChevronRightIcon sx={{ fontSize: 18, color: MEDIDA_COLORS.text4 }} />
      </Box>
    </Box>
  )
}

/* ── Section ────────────────────────────────────────────────────────────── */

export const MedidaEtapasSection: React.FC<MedidaEtapasSectionProps> = ({
  tipo,
  etapas,
  etapaActualId,
  estadoVigencia,
  workflowMedidaData,
  medidaApiData,
  legajoData,
  onMedidaRefetch,
}) => {
  const isClosed = estadoVigencia === "CERRADA"
  // Sidebar (detail) and modal (editable workflow) are keyed by phase.
  const [panelPhase, setPanelPhase] = useState<WorkflowPhase | null>(null)
  const [modalPhase, setModalPhase] = useState<WorkflowPhase | null>(null)

  const paperSx = {
    mb: 3,
    p: "16px 20px",
    borderRadius: "12px",
    border: `1px solid ${MEDIDA_COLORS.border}`,
  } as const

  // Group etapas by workflow phase (declared before any early return so hooks/order stay stable).
  const byPhase = new Map<WorkflowPhase, EtapaLike[]>()
  for (const e of etapas ?? []) {
    const phase = e.tipo_etapa ? tipoEtapaToWorkflowPhase(e.tipo_etapa as TipoEtapa) : null
    if (!phase) continue
    const arr = byPhase.get(phase) ?? []
    arr.push(e)
    byPhase.set(phase, arr)
  }

  // MPJ: no documentary flow — etapas live in control de legalidad.
  if (tipo === "MPJ") {
    return (
      <Paper elevation={0} sx={paperSx}>
        <SectionHeader />
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            p: "11px 14px",
            borderRadius: "8px",
            border: "1px solid #C4B5FD",
            bgcolor: "#F5F3FF",
            color: "#4C1D95",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          <span>★</span>
          <span>
            En MPJ las etapas (apertura, seguimiento y cese) se gestionan como actividades dentro del{" "}
            <strong>control de legalidad</strong>. No tienen flujo documental propio.
          </span>
        </Box>
      </Paper>
    )
  }

  // MPI drives its whole lifecycle from the apertura phase → single row.
  let phases: WorkflowPhase[]
  if (tipo === "MPI") {
    phases = ["apertura"]
  } else {
    phases = PHASE_ORDER.filter((p) => byPhase.has(p))
    if (phases.length === 0) phases = ["apertura"]
  }

  const phaseIsCurrent = (p: WorkflowPhase) =>
    (byPhase.get(p) ?? []).some((e) => !isClosed && e.id === etapaActualId)

  const fallbackEstadoFor = (p: WorkflowPhase) => {
    const list = byPhase.get(p) ?? []
    const latest = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
    return latest?.estado || workflowMedidaData?.estado || ""
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      <SectionHeader />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {phases.map((phase) => (
          <PhaseRow
            key={phase}
            phase={phase}
            etapasOfPhase={byPhase.get(phase) ?? []}
            isCurrent={phaseIsCurrent(phase)}
            onOpen={() => setPanelPhase(phase)}
          />
        ))}
      </Box>

      {/* Slide-in sidebar with the etapa detail (read mode). */}
      <Drawer
        anchor="right"
        open={!!panelPhase}
        onClose={() => setPanelPhase(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
      >
        {panelPhase && (
          <EtapaDetailPanel
            tipo={tipo}
            phase={panelPhase}
            medidaId={workflowMedidaData?.id}
            fallbackEstado={fallbackEstadoFor(panelPhase)}
            isCurrent={phaseIsCurrent(panelPhase)}
            onClose={() => setPanelPhase(null)}
            onGestionar={() => {
              // Cerrar la sidebar al abrir el modal: evita tener Drawer + Dialog
              // abiertos a la vez (scroll-lock / backdrops apilados de MUI).
              setModalPhase(panelPhase)
              setPanelPhase(null)
            }}
          />
        )}
      </Drawer>

      {/* Large modal hosting the full interactive workflow. */}
      <Dialog
        open={!!modalPhase}
        onClose={() => setModalPhase(null)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <Box
          sx={{
            bgcolor: MEDIDA_COLORS.navy,
            px: "20px",
            py: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
            {modalPhase ? PHASE_LABEL[modalPhase] : ""} · Gestión de la etapa
          </Typography>
          <IconButton
            onClick={() => setModalPhase(null)}
            size="small"
            sx={{
              ml: "auto",
              color: "#fff",
              bgcolor: "rgba(255,255,255,.1)",
              borderRadius: "6px",
              "&:hover": { bgcolor: "rgba(255,255,255,.2)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: "20px" }}>
          {modalPhase && workflowMedidaData?.id ? (
            <UnifiedWorkflowTab
              medidaData={workflowMedidaData as WorkflowMedidaData & { id: number }}
              medidaApiData={medidaApiData}
              legajoData={legajoData}
              workflowPhase={modalPhase}
              onMedidaRefetch={onMedidaRefetch}
            />
          ) : (
            <Typography sx={{ fontSize: 13, color: MEDIDA_COLORS.text3 }}>
              No se pudo cargar el flujo de trabajo de esta etapa.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  )
}
