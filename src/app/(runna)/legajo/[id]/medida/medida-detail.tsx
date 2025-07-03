"use client"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Grid } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useRouter } from "next/navigation"
import { getLegajoById, type Legajo } from "../../../legajo-mesa/mock-data/legajos-service"
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

// Importar tipos

interface MedidaDetailProps {
  params: {
    id: string
    medidaId?: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

// Mock data for the measure details
const getMedidaData = (legajoId: string, medidaId?: string, tipo: 'MPI' | 'MPE' = 'MPI'): MedidaData => {
  if (tipo === 'MPE') {
    return getMPEMedidaData(legajoId, medidaId)
  }
  return getMPIMedidaData(legajoId, medidaId)
}

const getMPIMedidaData = (legajoId: string, medidaId?: string): MedidaData => {
  return {
    id: medidaId || "123456",
    tipo: "MPI" as const,
    numero: "123456",
    persona: {
      nombre: "Martínez Alejandro",
      dni: "44890094",
    },
    fecha_apertura: "09/09/23",
    ubicacion: "Institución Nro. 1",
    direccion: "",
    juzgado: "",
    nro_sac: "",
    origen_demanda: "",
    motivo: "",
    actores_intervinientes: "",
    equipos: "",
    articulacion: "",
    etapas: {
      apertura: {
        fecha: "09/09/23",
        estado: "",
        equipo: "",
      },
      plan_accion: [
        {
          estado: true,
          tarea: "MPI",
          fecha: "12/08/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
        {
          estado: true,
          tarea: "MPI",
          fecha: "12/08/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
        {
          estado: false,
          tarea: "MPI",
          fecha: "12/09/21",
          objetivo: "Dato 2",
          plazo: "Dato3",
        },
      ],
      historial_seguimiento: [
        {
          fecha: "2 JUL 24",
          descripcion: "Se registra denuncia anónima",
          hora: "11:45 am",
        },
        {
          fecha: "3 JUL 24",
          descripcion: "Envío de respuesta",
          hora: "12:40 am",
        },
        {
          fecha: "4 JUL 24",
          descripcion: "Se adjunta FotoDNI.pdf",
          hora: "10:34 am",
        },
        {
          fecha: "4 JUL 24",
          descripcion: "Se adjunta PartidaNacimiento.pdf",
          hora: "12:45 am",
        },
      ],
      cierre: {
        fecha: "09/09/23",
        estado: "",
        equipo: "",
      },
    },
    ultimo_informe: {
      fecha: "12/09/21",
      autor: "Juzgado nro. 2, Córdoba",
      archivo: "Informe.pdf",
    },
  }
}

const getMPEMedidaData = (legajoId: string, medidaId?: string): MedidaData => {
  return {
    id: medidaId || "654321",
    tipo: "MPE" as const,
    numero: "654321",
    persona: {
      nombre: "Juan Martín Perez",
      dni: "33445566",
    },
    fecha_apertura: "15/10/23",
    ubicacion: "Residencia 1",
    direccion: "Av. Colón 1234, Córdoba",
    juzgado: "juzgado 1",
    nro_sac: "345",
    origen_demanda: "educacion",
    motivo: "Evaluación de competencias parentales",
    actores_intervinientes: "Familia González, Equipo interdisciplinario",
    equipos: "Zona 1",
    articulacion: "Juzgado, SENAF, Centro de Salud",
    // MPE specific fields
    fecha: "22/12/2024",
    fecha_resguardo: "12/12/2025",
    lugar_resguardo: "Residencia",
    zona_trabajo: "Zona 1",
    zona_centro_vida: "Zona 1",
    articulacion_local: true,
    numero_sac: "345",
    articulacion_area_local: true,
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
      apertura: {
        fecha: "15/10/23",
        estado: "Completada",
        equipo: "Equipo de Evaluación Familiar",
      },
      plan_evaluacion: [
        {
          estado: true,
          tarea: "Entrevista inicial familiar",
          fecha: "20/10/23",
          objetivo: "Establecer rapport y recopilar información inicial",
          plazo: "30 días",
        },
        {
          estado: true,
          tarea: "Evaluación psicológica de adultos",
          fecha: "25/10/23",
          objetivo: "Evaluar competencias parentales",
          plazo: "45 días",
        },
        {
          estado: false,
          tarea: "Visita domiciliaria",
          fecha: "01/11/23",
          objetivo: "Evaluar condiciones del hogar",
          plazo: "60 días",
        },
      ],
      evaluacion_familiar: {
        estado: "En curso",
        fecha_inicio: "15/10/23",
        fecha_finalizacion: "",
        equipo_evaluador: "Lic. Ana Rodríguez, Dr. Carlos López",
        observaciones: "Familia colaborativa, muestra interés en el proceso de evaluación",
      },
      legajos_afectados: [
        {
          numero_legajo: "789012",
          nombre_nnya: "González Sofía",
          relacion: "Hija",
        },
        {
          numero_legajo: "789013",
          nombre_nnya: "González Mateo",
          relacion: "Hijo",
        },
      ],
      historial_seguimiento: [
        {
          fecha: "15 OCT 23",
          descripcion: "Inicio de evaluación familiar",
          hora: "09:00 am",
        },
        {
          fecha: "20 OCT 23",
          descripcion: "Primera entrevista familiar realizada",
          hora: "14:30 pm",
        },
        {
          fecha: "25 OCT 23",
          descripcion: "Evaluación psicológica completada",
          hora: "10:15 am",
        },
      ],
      cierre: {
        fecha: "",
        estado: "",
        equipo: "",
      },
    },
    familia_evaluada: {
      grupo_familiar: "Familia nuclear compuesta por madre, padre y dos hijos menores",
      contexto_socioeconomico: "Nivel socioeconómico medio, ambos padres trabajan",
      dinamicas_familiares: "Relaciones familiares estables, comunicación abierta",
    },
    ultimo_informe: {
      fecha: "25/10/23",
      autor: "Equipo de Evaluación Familiar",
      archivo: "Informe_Evaluacion_Parcial.pdf",
    },
  }
}

export default function MedidaDetail({ params, onClose, isFullPage = false }: MedidaDetailProps) {
  const [medidaData, setMedidaData] = useState<MedidaData | null>(null)
  const [legajoData, setLegajoData] = useState<Legajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [newTask, setNewTask] = useState<NewTask>({
    tarea: "",
    objetivo: "",
    plazo: "",
  })
  const [activeStep, setActiveStep] = useState(1) // 0: Apertura, 1: Plan de acción, 2: Cierre
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState("")

  const router = useRouter()

  useEffect(() => {
    const loadData = () => {
      if (params.id) {
        try {
          setIsLoading(true)
          // Load legajo data
          const legajo = getLegajoById(params.id)
          if (legajo) {
            setLegajoData(legajo)

            // Load medida data - for now default to MPI, later we'll determine from legajo
            const medidaTipo = params.medidaId === 'mpe' ? 'MPE' : 'MPI'
            const medida = getMedidaData(params.id, params.medidaId, medidaTipo)
            setMedidaData(medida)

            // Determine active step based on data
            if (medida.etapas.cierre.estado) {
              setActiveStep(2)
            } else if (medida.tipo === 'MPI' && 'plan_accion' in medida.etapas && medida.etapas.plan_accion.length > 0) {
              setActiveStep(1)
            } else if (medida.tipo === 'MPE' && 'plan_evaluacion' in medida.etapas && medida.etapas.plan_evaluacion.length > 0) {
              setActiveStep(1)
            } else {
              setActiveStep(0)
            }
          } else {
            setError(`No se encontró el legajo con ID ${params.id}`)
          }
        } catch (err) {
          console.error("Error loading data:", err)
          setError("Error al cargar los datos. Por favor, intente nuevamente.")
        } finally {
          setIsLoading(false)
        }
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
      let task;
      if (medidaData.tipo === 'MPI' && 'plan_accion' in medidaData.etapas) {
        task = medidaData.etapas.plan_accion[index]
      } else if (medidaData.tipo === 'MPE' && 'plan_evaluacion' in medidaData.etapas) {
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
      if (medidaData.tipo === 'MPI' && 'plan_accion' in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_accion[editingTaskIndex] = {
          ...updatedMedidaData.etapas.plan_accion[editingTaskIndex],
          ...task,
        }
      } else if (medidaData.tipo === 'MPE' && 'plan_evaluacion' in updatedMedidaData.etapas) {
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

      if (medidaData.tipo === 'MPI' && 'plan_accion' in updatedMedidaData.etapas) {
        updatedMedidaData.etapas.plan_accion.push(newTask)
      } else if (medidaData.tipo === 'MPE' && 'plan_evaluacion' in updatedMedidaData.etapas) {
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
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
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

        {medidaData.tipo === 'MPE' ? (
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
                {medidaData.tipo === 'MPI' && 'plan_accion' in medidaData.etapas && (
                  <PlanAccionSection
                    tasks={medidaData.etapas.plan_accion}
                    isActive={activeStep === 1}
                    onAddTask={handleAddTask}
                    onViewTaskDetails={(index) => console.log(`View task details for index ${index}`)}
                    onEditTask={handleEditTask}
                  />
                )}
              </Grid>

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
