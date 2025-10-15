"use client"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Grid } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useRouter } from "next/navigation"
import { MedidaData } from "./[medidaId]/types/medidas"
import { AddTaskDialog, NewTask } from "./[medidaId]/components/dialogs/add-task-dialog"
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from "./[medidaId]/components/navigation-breadcrumbs"
import { MedidaHeader } from "./[medidaId]/components/medida/medida-header"
import { MPEHeader } from "./[medidaId]/components/medida/mpe-header"
import { MPETabs } from "./[medidaId]/components/medida/mpe-tabs"
import { AperturaSection } from "./[medidaId]/components/medida/apertura-section"
import { PlanAccionSection } from "./[medidaId]/components/medida/plan-accion-section"
import { PlanEvaluacionSection } from "./[medidaId]/components/medida/plan-evaluacion-section"
import { EvaluacionFamiliarSection } from "./[medidaId]/components/medida/evaluacion-familiar-section"
import { LegajosAfectadosSection } from "./[medidaId]/components/medida/legajos-afectados-section"
import { HistorialSeguimientoSection } from "./[medidaId]/components/medida/historial-seguimiento-section"
import { CierreSection } from "./[medidaId]/components/medida/cierre-section"
import { UltimoInformeSection } from "./[medidaId]/components/medida/ultimo-informe-section"
import { AttachmentDialog } from "./[medidaId]/components/dialogs/attachement-dialog"
import { NotaAvalSection } from "./[medidaId]/components/medida/nota-aval-section"

// API imports
import { fetchLegajoDetail } from "../../../legajo-mesa/api/legajos-api-service"
import { getMedidaDetail } from "../../../legajo-mesa/api/medidas-api-service"
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
  legajo: LegajoDetailResponse
): MedidaData => {
  const baseData = {
    id: String(medida.id),
    tipo: medida.tipo_medida,
    numero: medida.numero_medida,
    persona: {
      nombre: legajo.nnya ? `${legajo.nnya.apellido} ${legajo.nnya.nombre}` : "N/A",
      dni: legajo.nnya?.dni || "N/A",
    },
    fecha_apertura: new Date(medida.fecha_apertura).toLocaleDateString("es-AR"),
    ubicacion: "", // TODO: Get from legajo location data
    direccion: "",
    juzgado: medida.juzgado?.nombre || "",
    nro_sac: medida.nro_sac || "",
    origen_demanda: "",
    motivo: "",
    actores_intervinientes: "",
    equipos: "",
    articulacion: "",
    etapas: {
      apertura: {
        fecha: new Date(medida.fecha_apertura).toLocaleDateString("es-AR"),
        estado: medida.etapa_actual?.estado_display || "",
        equipo: "",
      },
      historial_seguimiento: [],
      cierre: {
        fecha: medida.fecha_cierre ? new Date(medida.fecha_cierre).toLocaleDateString("es-AR") : "",
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
  if (medida.tipo_medida === "MPE") {
    return {
      ...baseData,
      tipo: "MPE" as const,
      fecha: new Date(medida.fecha_apertura).toLocaleDateString("es-AR"),
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
          fecha_inicio: new Date(medida.fecha_apertura).toLocaleDateString("es-AR"),
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
  const [medidaData, setMedidaData] = useState<MedidaData | null>(null)
  const [medidaApiData, setMedidaApiData] = useState<MedidaDetailResponse | null>(null)
  const [legajoData, setLegajoData] = useState<LegajoDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    const loadData = async () => {
      if (!params.id || !params.medidaId) {
        setError("Faltan parámetros requeridos")
        setIsLoading(false)
        return
      }

      // Validate medidaId is numeric
      const medidaIdNum = Number(params.medidaId)
      if (isNaN(medidaIdNum)) {
        setError(
          `ID de medida inválido: "${params.medidaId}". Debe ser un número, no el tipo de medida (MPI, MPE, MPJ).`
        )
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch legajo data from API
        const legajoIdNum = Number(params.id)
        const legajo = await fetchLegajoDetail(legajoIdNum)
        setLegajoData(legajo)

        // Fetch medida data from API
        const medida = await getMedidaDetail(medidaIdNum)

        // Debug: Log the etapa_actual structure
        console.log('medida.etapa_actual:', medida.etapa_actual)
        console.log('medida.etapa_actual.estado type:', typeof medida.etapa_actual?.estado)
        console.log('medida.etapa_actual.estado value:', medida.etapa_actual?.estado)

        // Store the API response
        setMedidaApiData(medida)

        // Convert to MedidaData format
        const convertedData = convertMedidaToMedidaData(medida, legajo)
        setMedidaData(convertedData)

        // Determine active step based on data
        if (medida.estado_vigencia === "CERRADA") {
          setActiveStep(2)
        } else if (medida.etapa_actual) {
          // Map estado to step
          const estadoMap: Record<string, number> = {
            PENDIENTE_REGISTRO_INTERVENCION: 0,
            PENDIENTE_APROBACION_REGISTRO: 1,
            PENDIENTE_NOTA_AVAL: 1,
            PENDIENTE_INFORME_JURIDICO: 1,
            PENDIENTE_RATIFICACION_JUDICIAL: 1,
          }
          setActiveStep(estadoMap[medida.etapa_actual.estado] ?? 1)
        } else {
          setActiveStep(0)
        }
      } catch (err: any) {
        console.error("Error loading data:", err)

        // Better error messages
        if (err?.response?.status === 404) {
          setError(`No se encontró la medida con ID ${params.medidaId} para el legajo ${params.id}`)
        } else if (err?.message) {
          setError(`Error al cargar los datos: ${err.message}`)
        } else {
          setError("Error al cargar los datos. Por favor, intente nuevamente.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, params.medidaId])

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

    setMedidaData(updatedMedidaData)
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
    // Implement the action for closing the measure
    if (medidaData) {
      const updatedMedidaData = { ...medidaData }
      updatedMedidaData.etapas.cierre.estado = "Cerrado"
      updatedMedidaData.etapas.cierre.fecha = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      setMedidaData(updatedMedidaData)
      setActiveStep(2)
    }
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
              estados={medidaData.estados}
              progreso={medidaData.progreso}
            />
            <MPETabs medidaData={medidaData} />
          </>
        ) : (
          <>
            <MedidaHeader medidaData={medidaData} isActive={activeStep !== 2} onViewPersonalData={handleViewPersonalData} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Etapas de la medida
            </Typography>

            <Grid container spacing={3}>
              {/* Apertura Section */}
              <Grid item xs={12} md={4}>
                <AperturaSection
                  data={medidaData.etapas.apertura}
                  isActive={activeStep === 0}
                  isCompleted={activeStep >= 0}
                  onViewForm={handleViewForm}
                />
              </Grid>

              {/* Plan de acción Section - Only for MPI */}
              <Grid item xs={12} md={8}>
                {medidaData.tipo === "MPI" && "plan_accion" in medidaData.etapas && (
                  <PlanAccionSection
                    tasks={medidaData.etapas.plan_accion}
                    isActive={activeStep === 1}
                    onAddTask={handleAddTask}
                    onViewTaskDetails={(index) => console.log(`View task details for index ${index}`)}
                    onEditTask={handleEditTask}
                  />
                )}
              </Grid>

              {/* Nota de Aval Section (MED-03) - TEMPORALMENTE DESHABILITADO PARA DEBUG */}
              {false && medidaApiData && (() => {
                // Extract estado safely as a string
                const estado = medidaApiData.etapa_actual?.estado
                const estadoString = typeof estado === 'string' ? estado : undefined

                return (
                  <Grid item xs={12}>
                    <NotaAvalSection
                      medidaId={Number(params.medidaId)}
                      medidaNumero={medidaApiData.numero_medida}
                      estadoActual={estadoString}
                      userLevel={3} // TODO: Get from actual user context (3 or 4 for Director)
                      isSuperuser={true} // TODO: Get from actual user context (user.is_superuser)
                      onNotaAvalCreated={() => {
                        // Refetch medida data to update estado
                        window.location.reload() // Simple reload for now, can be improved with proper refetch
                      }}
                    />
                  </Grid>
                )
              })()}

              {/* Historial de seguimiento Section */}
              <Grid item xs={12} md={4}>
                <HistorialSeguimientoSection
                  items={medidaData.etapas.historial_seguimiento}
                  onAddSeguimiento={handleAddSeguimiento}
                  onViewAttachment={handleOpenAttachment}
                />
              </Grid>

              {/* Último informe Section */}
              <Grid item xs={12} md={4}>
                <UltimoInformeSection
                  data={medidaData.ultimo_informe}
                  onViewAttachment={handleOpenAttachment}
                  onDownload={handleDownloadAttachment}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CierreSection
                  data={medidaData.etapas.cierre}
                  isActive={activeStep === 2}
                  isCompleted={activeStep === 2}
                  onCloseMeasure={handleCloseMeasure}
                />
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
