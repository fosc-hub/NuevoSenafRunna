"use client"
import { useState, useEffect, useMemo } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Grid } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useRouter } from "next/navigation"
import { MedidaData } from "./[medidaId]/types/medidas"
import { AddTaskDialog, NewTask } from "./[medidaId]/components/dialogs/add-task-dialog"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./[medidaId]/components/navigation-breadcrumbs"
import { MedidaHeader } from "./[medidaId]/components/medida/medida-header"
import { MPEHeader } from "./[medidaId]/components/medida/mpe-header"
import { MPJHeader } from "./[medidaId]/components/medida/mpj-header"
import { MPETabs } from "./[medidaId]/components/medida/mpe-tabs"
import { MPJTabs } from "./[medidaId]/components/medida/mpj-tabs"
import { AperturaSection } from "./[medidaId]/components/medida/apertura-section"
import { PlanTrabajoTab } from "./[medidaId]/components/medida/mpe-tabs/plan-trabajo-tab"
import { PlanEvaluacionSection } from "./[medidaId]/components/medida/plan-evaluacion-section"
import { EvaluacionFamiliarSection } from "./[medidaId]/components/medida/evaluacion-familiar-section"
import { LegajosAfectadosSection } from "./[medidaId]/components/medida/legajos-afectados-section"
import { InformesMensualesTable } from "./[medidaId]/components/medida/informes-mensuales-table"
import { HistorialTab } from "./[medidaId]/components/medida/historial/historial-tab"
import { CierreSection } from "./[medidaId]/components/medida/cierre-section"
import { UltimoInformeSection } from "./[medidaId]/components/medida/ultimo-informe-section"
import { AttachmentDialog } from "./[medidaId]/components/dialogs/attachement-dialog"
import { NotaAvalSection } from "./[medidaId]/components/medida/nota-aval-section"
import { InformeJuridicoSection } from "./[medidaId]/components/medida/informe-juridico-section"
import { RatificacionJudicialSection } from "./[medidaId]/components/medida/ratificacion-judicial-section"
import { UnifiedWorkflowTab } from "./[medidaId]/components/medida/unified-workflow-tab"
import { useUser } from "@/utils/auth/userZustand"
import { useMedidaDetail } from "./[medidaId]/hooks/useMedidaDetail"
import { formatDateLocaleAR } from "@/utils/dateUtils"

// API imports
import { fetchLegajoDetail } from "../../../legajo-mesa/api/legajos-api-service"
import { get } from "@/app/api/apiService"
import type { LegajoDetailResponse } from "../../../legajo-mesa/types/legajo-api"
import type { MedidaDetailResponse } from "../../../legajo-mesa/types/medida-api"

interface MedidaDetailProps {
  params: {
    id: string
    medidaId?: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

/**
 * Convert API medida response to MedidaData format for rendering
 */
const convertMedidaToMedidaData = (
  medida: MedidaDetailResponse,
  legajo: LegajoDetailResponse,
  demanda: any = null
): MedidaData => {
  // Helper function to safely extract string values
  const extractString = (value: any, fallback: string = ""): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'display' in value) return String(value.display)
    if (value && typeof value === 'object' && 'nombre' in value) return String(value.nombre)
    return fallback
  }

  // Extract tipo_medida safely (should be string but API might return object)
  const tipoMedida = typeof medida.tipo_medida === 'string'
    ? medida.tipo_medida
    : medida.tipo_medida_display || 'MPI'

  // Extract numero_medida safely
  const numeroMedida = extractString(medida.numero_medida, `M-${medida.id}`)

  // Extract estado from etapa_actual safely
  const estadoActual = medida.etapa_actual
    ? extractString(medida.etapa_actual.estado_display || medida.etapa_actual.estado, "")
    : ""

  const baseData = {
    id: String(medida.id),
    tipo: tipoMedida as 'MPI' | 'MPE' | 'MPJ',
    tipo_display: medida.tipo_medida_display,  // Add display name for proper header rendering
    numero: numeroMedida,
    persona: {
      nombre: legajo.persona ? `${legajo.persona.apellido} ${legajo.persona.nombre}` : "N/A",
      dni: legajo.persona?.dni ? String(legajo.persona.dni) : "N/A",
    },
    fecha_apertura: formatDateLocaleAR(medida.fecha_apertura),
    ubicacion: "", // TODO: Get from legajo location data
    direccion: "",
    juzgado: medida.juzgado?.nombre || undefined,
    nro_sac: medida.nro_sac || undefined,
    urgencia: medida.urgencia?.nombre || undefined,
    estado_actual: medida.etapa_actual?.estado_display || undefined,
    origen_demanda: demanda?.bloque_datos_remitente_info?.nombre || "",
    motivo: demanda?.motivo_ingreso_info?.nombre || demanda?.descripcion || "",
    actores_intervinientes: demanda?.institucion_info?.nombre || "",
    equipos: legajo.asignaciones_activas?.[0]?.user_responsable?.nombre_completo || "",
    articulacion: "",
    etapas: {
      apertura: {
        fecha: formatDateLocaleAR(medida.fecha_apertura),
        estado: estadoActual,
        equipo: "",
      },
      historial_seguimiento: [],
      cierre: {
        fecha: medida.fecha_cierre ? formatDateLocaleAR(medida.fecha_cierre) : "",
        estado: medida.estado_vigencia === "CERRADA" ? "Cerrado" : "",
        equipo: "",
      },
    },
    ultimo_informe: {
      fecha: "",
      autor: "",
      archivo: "",
    },
  }

  // Add type-specific data
  if (tipoMedida === "MPE") {
    // Get the raw ISO date for calculations (don't convert to local date string)
    const fechaCreacionRaw = (medida as any).fecha_creacion || medida.fecha_apertura;

    return {
      ...baseData,
      tipo: "MPE" as const,
      fecha: formatDateLocaleAR(medida.fecha_apertura),
      fecha_creacion_raw: fechaCreacionRaw, // Keep as ISO string for accurate calculations
      fecha_resguardo: "",
      lugar_resguardo: "",
      zona_trabajo: "",
      zona_centro_vida: "",
      articulacion_local: false,
      numero_sac: medida.nro_sac || "",
      articulacion_area_local: false,
      estados: {
        inicial: true,
        apertura: true,
        innovacion: 0,
        prorroga: 0,
        cambio_lugar: 0,
        seguimiento_intervencion: true,
        cese: false,
        post_cese: false,
      },
      progreso: {
        iniciada: 10,
        en_seguimiento: 80,
        cierre: 10,
        total: 65,
      },
      etapas: {
        ...baseData.etapas,
        plan_evaluacion: [],
        evaluacion_familiar: {
          estado: "En curso",
          fecha_inicio: formatDateLocaleAR(medida.fecha_apertura),
          fecha_finalizacion: "",
          equipo_evaluador: "",
          observaciones: "",
        },
        legajos_afectados: [],
      },
      familia_evaluada: {
        grupo_familiar: "",
        contexto_socioeconomico: "",
        dinamicas_familiares: "",
      },
    }
  } else if (tipoMedida === "MPJ") {
    return {
      ...baseData,
      tipo: "MPJ" as const,
      etapas: {
        ...baseData.etapas,
        plan_accion: [],
      },
    }
  } else {
    return {
      ...baseData,
      tipo: "MPI" as const,
      etapas: {
        ...baseData.etapas,
        plan_accion: [],
      },
    }
  }
}

export default function MedidaDetail({ params, onClose, isFullPage = false }: MedidaDetailProps) {
  // Validate params
  const medidaIdNum = params.medidaId ? Number(params.medidaId) : null
  const legajoIdNum = params.id ? Number(params.id) : null
  const isValidMedidaId = medidaIdNum !== null && !isNaN(medidaIdNum)

  // Use React Query for medida data
  const {
    data: medidaApiData,
    isLoading: isMedidaLoading,
    error: medidaError,
    refetch: refetchMedida,
  } = useMedidaDetail(medidaIdNum!, {
    enabled: isValidMedidaId,
  })

  // State for legajo data (could also be migrated to React Query in the future)
  const [legajoData, setLegajoData] = useState<LegajoDetailResponse | null>(null)
  const [isLegajoLoading, setIsLegajoLoading] = useState(true)
  const [legajoError, setLegajoError] = useState<string | null>(null)

  // State for demanda data (for seguimiento dispositivo)
  const [demandaData, setDemandaData] = useState<any>(null)

  // UI state
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [newTask, setNewTask] = useState<NewTask>({
    tarea: "",
    objetivo: "",
    plazo: "",
  })
  const [activeStep, setActiveStep] = useState(1)
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState("")

  const router = useRouter()

  // Get user data from Zustand store
  const { user } = useUser()

  // Calculate user permissions
  const isSuperuser = user?.is_superuser || false
  const isDirector = user?.zonas?.some(z => z.director) || false
  const userLevel = isDirector ? 3 : undefined
  const isJZ = user?.zonas?.some(z => z.jefe) || false
  const isEquipoLegal = user?.groups?.some(
    (g: any) => ["legal", "legales", "equipo legal"].includes(g.name.toLowerCase())
  ) || false

  // Load legajo data
  useEffect(() => {
    const loadLegajo = async () => {
      if (!legajoIdNum || isNaN(legajoIdNum)) {
        setLegajoError("ID de legajo inválido")
        setIsLegajoLoading(false)
        return
      }

      try {
        setIsLegajoLoading(true)
        setLegajoError(null)
        const legajo = await fetchLegajoDetail(legajoIdNum)
        setLegajoData(legajo)
      } catch (err: any) {
        console.error("Error loading legajo:", err)
        setLegajoError(err?.message || "Error al cargar el legajo")
      } finally {
        setIsLegajoLoading(false)
      }
    }

    loadLegajo()
  }, [legajoIdNum])

  // Load demanda full-detail data for seguimiento dispositivo
  useEffect(() => {
    const loadDemanda = async () => {
      if (!legajoData?.demandas_relacionadas?.resultados) return

      // Get the first active demanda or the first demanda if no active ones
      const demandas = legajoData.demandas_relacionadas.resultados
      if (demandas.length === 0) return

      const activeDemanda = demandas.find((d: any) => d.estado === 'ACTIVA') || demandas[0]
      if (!activeDemanda?.id) return

      try {
        const fullDemanda = await get<any>(`registro-demanda-form/${activeDemanda.id}/full-detail/`)
        setDemandaData(fullDemanda)
      } catch (err: any) {
        console.error('Error loading demanda full-detail:', err)
      }
    }

    loadDemanda()
  }, [legajoData])

  // Convert medida API data to MedidaData format
  const medidaData = useMemo(() => {
    if (!medidaApiData || !legajoData) return null
    return convertMedidaToMedidaData(medidaApiData, legajoData, demandaData)
  }, [medidaApiData, legajoData, demandaData])

  // Update active step based on medida estado
  useEffect(() => {
    if (!medidaApiData) return

    if (medidaApiData.estado_vigencia === "CERRADA") {
      setActiveStep(2)
    } else if (medidaApiData.etapa_actual) {
      // Map estado to step
      const estadoMap: Record<string, number> = {
        PENDIENTE_REGISTRO_INTERVENCION: 0,
        PENDIENTE_APROBACION_REGISTRO: 1,
        PENDIENTE_NOTA_AVAL: 1,
        PENDIENTE_INFORME_JURIDICO: 1,
        PENDIENTE_RATIFICACION_JUDICIAL: 1,
      }
      setActiveStep(estadoMap[medidaApiData.etapa_actual.estado] ?? 1)
    } else {
      setActiveStep(0)
    }
  }, [medidaApiData])

  // Combined loading and error states
  const isLoading = isMedidaLoading || isLegajoLoading
  const error = (() => {
    if (!params.id || !params.medidaId) {
      return "Faltan parámetros requeridos"
    }
    if (!isValidMedidaId) {
      return `ID de medida inválido: "${params.medidaId}". Debe ser un número, no el tipo de medida (MPI, MPE, MPJ).`
    }
    if (medidaError) {
      if ((medidaError as any)?.response?.status === 404) {
        return `No se encontró la medida con ID ${params.medidaId} para el legajo ${params.id}`
      }
      return `Error al cargar la medida: ${medidaError.message}`
    }
    if (legajoError) {
      return `Error al cargar el legajo: ${legajoError}`
    }
    return null
  })()

  // Handlers for task management
  const handleAddTask = () => {
    setEditingTaskIndex(null)
    setNewTask({
      tarea: "",
      objetivo: "",
      plazo: "",
    })
    setOpenAddTaskDialog(true)
  }

  const handleEditTask = (index: number) => {
    if (medidaData) {
      let task
      if (medidaData.tipo === "MPI" && "plan_accion" in medidaData.etapas) {
        task = medidaData.etapas.plan_accion[index]
      } else if (medidaData.tipo === "MPE" && "plan_evaluacion" in medidaData.etapas) {
        task = medidaData.etapas.plan_evaluacion[index]
      }

      if (task) {
        setNewTask({
          tarea: task.tarea,
          objetivo: task.objetivo,
          plazo: task.plazo,
        })
        setEditingTaskIndex(index)
        setOpenAddTaskDialog(true)
      }
    }
  }

  const handleCloseAddTaskDialog = () => {
    setOpenAddTaskDialog(false)
  }

  const handleSaveTask = (task: NewTask) => {
    if (!medidaData) return

    const updatedMedidaData = { ...medidaData } as MedidaData

    if (editingTaskIndex !== null) {
      // Update existing task
      if (medidaData.tipo === "MPI" && "plan_accion" in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_accion[editingTaskIndex] = {
          ...updatedMedidaData.etapas.plan_accion[editingTaskIndex],
          ...task,
        }
      } else if (medidaData.tipo === "MPE" && "plan_evaluacion" in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_evaluacion[editingTaskIndex] = {
          ...updatedMedidaData.etapas.plan_evaluacion[editingTaskIndex],
          ...task,
        }
      }
    } else {
      // Add new task
      const newTask = {
        estado: false,
        ...task,
        fecha: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      }

      if (medidaData.tipo === "MPI" && "plan_accion" in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_accion.push(newTask)
      } else if (medidaData.tipo === "MPE" && "plan_evaluacion" in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_evaluacion.push(newTask)
      }
    }

    // TODO: These local task updates don't persist to API
    // This functionality should be migrated to use API mutations
    // setMedidaData(updatedMedidaData)
    setOpenAddTaskDialog(false)
  }

  // Handlers for attachments
  const handleOpenAttachment = (fileName: string) => {
    setSelectedAttachment(fileName)
    setOpenAttachmentDialog(true)
  }

  const handleDownloadAttachment = (fileName: string) => {
    console.log(`Downloading ${fileName}...`)
    // Implement download functionality
  }

  // Other handlers
  const handleCloseMeasure = () => {
    console.log("Close measure clicked")
    // TODO: This should call an API endpoint to close the medida
    // The medida detail will automatically refresh via React Query
    setActiveStep(2)
  }

  const handleViewForm = () => {
    console.log("View form clicked")
    // Implement the action for viewing the form
  }

  const handleAddSeguimiento = () => {
    console.log("Add seguimiento clicked")
    // Implement the action for adding a seguimiento
  }

  const handleViewPersonalData = () => {
    console.log("View personal data clicked")
    // Implement the action for viewing personal data
  }

  // Loading and error states
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando información de la medida...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ m: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Asegúrate de que:
        </Typography>
        <ul>
          <li>
            <Typography variant="body2">El ID de la medida sea numérico (no &quot;mpe&quot;, &quot;mpi&quot; o &quot;mpj&quot;)</Typography>
          </li>
          <li>
            <Typography variant="body2">La medida exista en el sistema</Typography>
          </li>
          <li>
            <Typography variant="body2">La medida pertenezca al legajo {params.id}</Typography>
          </li>
        </ul>
      </Box>
    )
  }

  if (!medidaData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información para esta medida.
      </Alert>
    )
  }

  // Prepare breadcrumb items
  const breadcrumbItems = [
    ...getDefaultBreadcrumbs(),
    {
      label: `Legajo ${params.id}`,
      path: `/legajo/${params.id}`,
    },
  ]

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...(isFullPage && {
          display: "flex",
          justifyContent: "center",
        }),
      }}
    >
      <Box
        sx={{
          p: 3,
          ...(isFullPage && {
            maxWidth: "1200px",
            width: "100%",
          }),
        }}
      >
        {!isFullPage && onClose ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <NavigationBreadcrumbs
              items={breadcrumbItems}
              currentPage={`Medida ${medidaData.tipo} ${medidaData.numero}`}
            />
          </Box>
        )}

        {medidaData.tipo === "MPE" ? (
          <>
            <MPEHeader
              medidaData={medidaData}
              medidaId={medidaApiData?.id}
              estadoVigencia={medidaApiData?.estado_vigencia}
              etapaActual={medidaApiData?.etapa_actual}
              demandaData={demandaData}
              estados={medidaData.estados}
              progreso={medidaData.progreso}
              onMedidaRefetch={refetchMedida}
              configuracionDispositivoMpe={medidaApiData?.configuracion_dispositivo_mpe}
            />
            <MPETabs
              medidaData={{
                ...medidaData,
                tipo_medida: medidaData.tipo,
                estado: medidaApiData?.etapa_actual?.estado,
                numero_medida: typeof medidaApiData?.numero_medida === 'string'
                  ? medidaApiData.numero_medida
                  : (medidaApiData?.numero_medida && typeof medidaApiData.numero_medida === 'object' && 'display' in medidaApiData.numero_medida)
                    ? String(medidaApiData.numero_medida.display)
                    : `M-${medidaData.id}`,
                plan_trabajo_id: medidaApiData?.plan_trabajo_id
              }}
              medidaApiData={medidaApiData || undefined}
              legajoData={legajoData ? {
                numero: legajoData.legajo?.numero || "",
                persona_nombre: legajoData.persona?.nombre || "",
                persona_apellido: legajoData.persona?.apellido || "",
                zona_nombre: legajoData.asignaciones_activas?.[0]?.zona?.nombre || ""
              } : undefined}
              planTrabajoId={medidaApiData?.plan_trabajo_id}
              onMedidaRefetch={refetchMedida}
            />
          </>
        ) : medidaData.tipo === "MPJ" ? (
          <>
            <MPJHeader
              medidaData={medidaData}
              demandaData={demandaData}
              estados={{ apertura: true, proceso: false, cese: false }}
            />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Etapas de la medida
            </Typography>

            <MPJTabs
              medidaData={{
                ...medidaData,
                tipo_medida: medidaData.tipo,
                estado: medidaApiData?.etapa_actual?.estado,
                numero_medida: typeof medidaApiData?.numero_medida === 'string'
                  ? medidaApiData.numero_medida
                  : (medidaApiData?.numero_medida && typeof medidaApiData.numero_medida === 'object' && 'display' in medidaApiData.numero_medida)
                    ? String(medidaApiData.numero_medida.display)
                    : `M-${medidaData.id}`,
                plan_trabajo_id: medidaApiData?.plan_trabajo_id
              }}
              medidaApiData={medidaApiData}
              legajoData={legajoData ? {
                numero: legajoData.legajo?.numero || "",
                persona_nombre: legajoData.persona?.nombre || "",
                persona_apellido: legajoData.persona?.apellido || "",
                zona_nombre: legajoData.asignaciones_activas?.[0]?.zona?.nombre || ""
              } : undefined}
              planTrabajoId={medidaApiData?.plan_trabajo_id}
            />
          </>
        ) : (
          <>
            <MedidaHeader
              medidaData={medidaData}
              medidaId={medidaApiData?.id}
              estadoVigencia={medidaApiData?.estado_vigencia}
              etapaActual={medidaApiData?.etapa_actual}
              isActive={activeStep !== 2}
              onViewPersonalData={handleViewPersonalData}
              onMedidaRefetch={refetchMedida}
            />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Etapas de la medida
            </Typography>

            {/* Use UnifiedWorkflowTab for MPI workflow stepper */}
            {medidaApiData && (
              <UnifiedWorkflowTab
                medidaData={{
                  id: medidaApiData.id,
                  tipo_medida: medidaData.tipo,
                  numero_medida: typeof medidaApiData.numero_medida === 'string'
                    ? medidaApiData.numero_medida
                    : (medidaApiData.numero_medida && typeof medidaApiData.numero_medida === 'object' && 'display' in medidaApiData.numero_medida)
                      ? String(medidaApiData.numero_medida.display)
                      : `M-${params.medidaId}`,
                  estado: typeof medidaApiData.etapa_actual?.estado === 'string'
                    ? medidaApiData.etapa_actual.estado
                    : undefined,
                  fecha_apertura: medidaApiData.fecha_apertura,
                }}
                medidaApiData={medidaApiData}
                legajoData={legajoData ? {
                  numero: legajoData.legajo?.numero || "",
                  persona_nombre: legajoData.persona?.nombre || "",
                  persona_apellido: legajoData.persona?.apellido || "",
                  zona_nombre: legajoData.asignaciones_activas?.[0]?.zona?.nombre || ""
                } : undefined}
                workflowPhase="apertura"
                onMedidaRefetch={refetchMedida}
              />
            )}

            {/* Plan de acción/trabajo Section - For both MPI and MPE (outside stepper) */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12}>
                {medidaData.tipo === "MPI" && medidaApiData?.plan_trabajo_id && (
                  <PlanTrabajoTab
                    medidaData={{
                      id: medidaApiData.id,
                      tipo_medida: medidaData.tipo,
                      numero_medida: typeof medidaApiData.numero_medida === 'string'
                        ? medidaApiData.numero_medida
                        : (medidaApiData.numero_medida && typeof medidaApiData.numero_medida === 'object' && 'display' in medidaApiData.numero_medida)
                          ? String(medidaApiData.numero_medida.display)
                          : `M-${medidaApiData.id}`,
                      estado: typeof medidaApiData.etapa_actual?.estado === 'string'
                        ? medidaApiData.etapa_actual.estado
                        : medidaApiData.etapa_actual?.estado_display || "",
                      fecha_apertura: medidaApiData.fecha_apertura,
                    }}
                    planTrabajoId={medidaApiData.plan_trabajo_id}
                  />
                )}
              </Grid>

              {/* Historial de seguimiento - Unified Timeline */}
              <Grid item xs={12}>
                <HistorialTab
                  medidaId={medidaApiData?.id}
                  numeroMedida={typeof medidaApiData?.numero_medida === 'string'
                    ? medidaApiData.numero_medida
                    : `MED-${medidaApiData?.id}`}
                />
              </Grid>

              {/* Informes Mensuales - Detailed Table */}
              <Grid item xs={12}>
                {medidaApiData?.id && <InformesMensualesTable medidaId={medidaApiData.id} />}
              </Grid>
            </Grid>
          </>
        )}
      </Box>

      {/* Dialogs */}
      <AddTaskDialog
        open={openAddTaskDialog}
        initialTask={newTask}
        onClose={handleCloseAddTaskDialog}
        onSave={handleSaveTask}
        isEditing={editingTaskIndex !== null}
      />

      <AttachmentDialog
        open={openAttachmentDialog}
        fileName={selectedAttachment}
        onClose={() => setOpenAttachmentDialog(false)}
        onDownload={() => handleDownloadAttachment(selectedAttachment)}
      />
    </Box>
  )
}
