"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, IconButton, Box, Alert, Tabs, Tab, Paper, Button } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
import ArticleIcon from "@mui/icons-material/Article"
import GavelIcon from "@mui/icons-material/Gavel"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import LinkIcon from "@mui/icons-material/Link"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import { create, update } from "@/app/api/apiService"
import type { FormData } from "@/components/forms/types/formTypes"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { EnviarRespuestaForm } from "./ui/EnviarRespuestaModal"
import { RegistrarActividadForm } from "./ui/RegistrarActividadModal"
import { ConexionesDemandaTab } from "./ui/ConexionesDemandaTab"
import { DemandaSuccessModal } from "@/app/(runna)/nuevoingreso/components/DemandaSuccessModal"
import type { DemandaCreatedResponse } from "@/app/(runna)/nuevoingreso/types/demanda-response"
import { useRouter } from "next/navigation"
import { fetchCaseData } from "@/components/forms/utils/apiToFormData"
import { useUser } from "@/utils/auth/userZustand"
import { hasVinculacionAccess } from "@/utils/auth/permissionUtils"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  disabled?: boolean
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, disabled = false, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demanda-tabpanel-${index}`}
      aria-labelledby={`demanda-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, opacity: disabled ? 0.7 : 1, pointerEvents: disabled ? "none" : "auto" }}>{children}</Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `demanda-tab-${index}`,
    "aria-controls": `demanda-tabpanel-${index}`,
  }
}

interface DemandaDetailProps {
  params: {
    id: string
  }
  onClose?: () => void
  isFullPage?: boolean
}

export default function DemandaDetail({ params, onClose, isFullPage = false }: DemandaDetailProps) {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMarkingSubido, setIsMarkingSubido] = useState(false)
  // Modal de éxito reutilizado de nuevoingreso para mostrar actividades
  // creadas automáticamente cuando Rosa setea tipo_oficio (post-creación).
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successResponse, setSuccessResponse] = useState<DemandaCreatedResponse | null>(null)
  const router = useRouter()
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = hasVinculacionAccess(user)

  useEffect(() => {
    const loadCaseData = async () => {
      if (params.id) {
        try {
          setIsLoading(true)
          const data = await fetchCaseData(params.id)
          setFormData(data)
        } catch (err) {
          console.error("Error loading case data:", err)
          setError("Error loading case data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCaseData()
  }, [params.id])

  const isEvaluacionDisabled = formData?.estado_demanda === "EVALUACION"

  const isPeticionDeInforme = formData?.objetivo_de_demanda === "PETICION_DE_INFORME"

  // Flujo "Oficio judicial de MPE/MPI vigente":
  // - PENDIENTE_SUBIR_PJ: el signal del BE detectó que todas las actividades originadas
  //   por esta demanda están COMPLETADA/VISADO_APROBADO → Dani tiene que entrar al SAC.
  // - SUBIDO_A_PODER_JUDICIAL: estado terminal — Dani ya confirmó la carga al SAC.
  const isPendienteSubirPJ = formData?.estado_demanda === "PENDIENTE_SUBIR_PJ"
  const isSubidoAPoderJudicial = formData?.estado_demanda === "SUBIDO_A_PODER_JUDICIAL"

  const isEditingBlocked = [
    "ARCHIVADA",
    "ADMITIDA",
    "PENDIENTE_AUTORIZACION",
    "SUBIDO_A_PODER_JUDICIAL",
  ].includes(formData?.estado_demanda || "")

  // If it's a petition for report, force tab value to be 1 (Enviar Respuesta)
  // Remove this useEffect that forces the tab value to be 1
  // useEffect(() => {
  //   if (isPeticionDeInforme && tabValue !== 1) {
  //     setTabValue(1)
  //   }
  // }, [isPeticionDeInforme, tabValue])

  // Replace with this useEffect that only sets the initial tab value
  useEffect(() => {
    // Only set the initial tab value when the component first loads
    if (isPeticionDeInforme && !isLoading && formData) {
      setTabValue(1)
    }
  }, [isPeticionDeInforme, isLoading, formData])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Allow changing to any tab, but the form in the Details tab will be read-only
    // if it's a petition for report
    setTabValue(newValue)
  }

  const handleSubmit = (data: any) => {
    // El submit real lo dispara MultiStepForm vía mutation. Acá recibimos el
    // response completo del backend. Para PETICION_DE_INFORME (oficio MPE/MPI):
    // si Rosa seteó tipo_oficio y había vinculos existentes, el backend dispara
    // creación de actividades y las devuelve en actividades_creadas. Mostramos
    // el mismo modal que usa nuevoingreso para visualizar las actividades.
    const response = data as Partial<DemandaCreatedResponse>
    const actividadesCreadas = response?.actividades_creadas
    if (Array.isArray(actividadesCreadas) && actividadesCreadas.length > 0) {
      setSuccessResponse(response as DemandaCreatedResponse)
      setShowSuccessModal(true)
      // Refrescar formData local para que el banner de "Subir al PJ" / estados
      // refleje cualquier cambio que vino del backend (ej. estado_demanda).
      if (formData) {
        setFormData({
          ...formData,
          ...(response.demanda
            ? {
                estado_demanda: response.demanda.estado_demanda as any,
                objetivo_de_demanda: response.demanda.objetivo_de_demanda as any,
              }
            : {}),
        })
      }
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setSuccessResponse(null)
  }

  const handleNavigateToMedidaFromModal = (legajoId: number, medidaId: number) => {
    handleCloseSuccessModal()
    router.push(`/legajo/${legajoId}/medida/${medidaId}`)
  }

  const handleNavigateToMesaFromModal = () => {
    handleCloseSuccessModal()
    router.push("/mesadeentrada")
  }

  const handleEnviarEvaluacion = async () => {
    if (!params.id) return

    setIsSubmitting(true)
    try {
      // Se crea un nuevo FormData y se agrega la clave "data"
      // con el objeto JSON que contiene el estado de la demanda
      const formDataToSend = new FormData()
      formDataToSend.append("data", JSON.stringify({ estado_demanda: "EVALUACION" }))

      const updatedData = await update(
        "registro-demanda-form",
        Number.parseInt(params.id),
        formDataToSend,
        true,
        "Demanda enviada a evaluación exitosamente",
      )

      // Actualiza el estado local para reflejar el cambio
      if (formData) {
        setFormData({
          ...formData,
          estado_demanda: "EVALUACION",
        })
      }

      // Si NO es página completa (es modal/drawer), cerrar automáticamente después de enviar exitosamente
      if (!isFullPage && onClose) {
        // Esperar un momento para que el usuario vea el mensaje de éxito antes de cerrar
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err) {
      console.error("Error updating case status:", err)
      // El manejo del error se realiza en el servicio API
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenInFullPage = () => {
    router.push(`/demanda/${params.id}`)
  }

  const handleMarcarSubidoPJ = async () => {
    if (!params.id || isMarkingSubido) return
    setIsMarkingSubido(true)
    try {
      await create(
        `demanda/${params.id}/marcar-subido-poder-judicial/`,
        {},
        true,
        "Demanda marcada como subida al Poder Judicial",
      )
      if (formData) {
        setFormData({
          ...formData,
          estado_demanda: "SUBIDO_A_PODER_JUDICIAL",
        })
      }
    } catch (err) {
      console.error("Error al marcar como subido al Poder Judicial:", err)
    } finally {
      setIsMarkingSubido(false)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: "text.primary",
            }}
          >
            Detalle de la Demanda
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {!isFullPage && (
              <IconButton aria-label="Ver en página completa" onClick={handleOpenInFullPage} color="primary">
                <ArticleIcon />
              </IconButton>
            )}

            {!isFullPage && onClose && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {formData?.unassigned && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "warning.light",
              "& .MuiAlert-message": {
                color: "warning.dark",
              },
            }}
          >
            La presente demanda aún no ha sido asignada.
          </Alert>
        )}

        {isEvaluacionDisabled && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: "info.lighter",
              "& .MuiAlert-message": {
                color: "info.dark",
              },
            }}
          >
            Esta demanda ya se encuentra en evaluación.
          </Alert>
        )}

        {isEditingBlocked && !isSubidoAPoderJudicial && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: "info.lighter",
              "& .MuiAlert-message": {
                color: "info.dark",
              },
            }}
          >
            Esta demanda no puede ser editada debido a su estado actual.
          </Alert>
        )}

        {isSubidoAPoderJudicial && (
          <Alert
            severity="success"
            icon={<GavelIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Subido al Poder Judicial
            </Typography>
            <Typography variant="body2">
              El informe de respuesta ya fue cargado en la plataforma del Poder Judicial. La demanda queda en estado terminal.
            </Typography>
          </Alert>
        )}

        {isPeticionDeInforme && !isSubidoAPoderJudicial && !isPendienteSubirPJ && (
          <Alert
            severity="info"
            icon={<CloudUploadIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Oficio MPE/MPI vigente
            </Typography>
            <Typography variant="body2">
              Mientras legales/equipos completan las actividades, la demanda queda en seguimiento.
              Cuando todas las actividades estén aprobadas, vas a poder cargarla al SAC del Poder Judicial.
            </Typography>
          </Alert>
        )}

        {isPeticionDeInforme && isPendienteSubirPJ && (
          <Alert
            severity="warning"
            icon={<CloudUploadIcon />}
            sx={{ mb: 3 }}
            action={
              <Button
                color="warning"
                size="small"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleMarcarSubidoPJ}
                disabled={isMarkingSubido}
              >
                {isMarkingSubido ? "Marcando..." : "Marcar como subido al PJ"}
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Listo para subir al Poder Judicial
            </Typography>
            <Typography variant="body2">
              Todas las actividades originadas por esta demanda están completadas o visadas.
              Descargá el informe, cargálo en el SAC y marcá la demanda como subida para cerrar el ciclo.
            </Typography>
          </Alert>
        )}

        {/* Vínculos a legajos / medidas — visibilidad rápida del lazo creado por Rosa.
            Click navega al legajo o medida correspondiente. */}
        {Array.isArray((formData as any)?.vinculos) && (formData as any).vinculos.length > 0 && (
          <Alert
            severity="info"
            icon={<LinkIcon />}
            variant="outlined"
            sx={{ mb: 3, "& .MuiAlert-message": { width: "100%" } }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Conectada con {(formData as any).vinculos.length === 1 ? "el legajo" : "los legajos"}:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {(formData as any).vinculos.map((v: any, i: number) => {
                const legajoId = v?.legajo ?? v?.legajo_info?.id
                const legajoNum = v?.legajo_info?.numero || legajoId
                const nnyaNombre = v?.legajo_info?.nnya_nombre
                const medida = v?.legajo_info?.medidas_activas?.[0]
                if (!legajoId) return null
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<FolderOpenIcon />}
                      onClick={() =>
                        medida
                          ? router.push(`/legajo/${legajoId}/medida/${medida.id}`)
                          : router.push(`/legajo/${legajoId}`)
                      }
                    >
                      Legajo {legajoNum}
                      {nnyaNombre && nnyaNombre !== String(legajoNum) ? ` · ${nnyaNombre}` : ""}
                      {medida ? ` · ${medida.tipo_medida || "Medida"} ${medida.numero_medida || medida.id}` : ""}
                    </Button>
                  </Box>
                )
              })}
            </Box>
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="demanda tabs" variant="fullWidth">
              <Tab label="Detalles" {...a11yProps(0)} />
              <Tab label="Enviar Respuesta" {...a11yProps(1)} />
              <Tab
                label="Registrar Actividad"
                {...a11yProps(2)}
                disabled={isPeticionDeInforme}
                sx={{ opacity: isPeticionDeInforme ? 0.7 : 1 }}
              />
              {hasVinculacionPermission && (
                <Tab
                  label="Conexiones"
                  {...a11yProps(3)}
                  disabled={isPeticionDeInforme}
                  sx={{ opacity: isPeticionDeInforme ? 0.7 : 1 }}
                />
              )}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {formData && (
              <>
                <MultiStepForm
                  initialData={formData}
                  onSubmit={handleSubmit}
                  // PETICION_DE_INFORME (oficio MPE/MPI vigente) ahora es editable:
                  // Rosa/legales completa tipo_oficio + vínculos después de que Dani
                  // carga lo básico. Sólo bloqueamos en estados terminales
                  // (ARCHIVADA, ADMITIDA, PENDIENTE_AUTORIZACION, SUBIDO_A_PODER_JUDICIAL).
                  readOnly={isEditingBlocked}
                  id={params.id}
                  demandaId={Number.parseInt(params.id)}
                />
                {!isPeticionDeInforme && (
                  <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={handleEnviarEvaluacion}
                      disabled={isSubmitting || isEvaluacionDisabled || isEditingBlocked}
                      sx={{
                        backgroundColor: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      }}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar a Evaluación"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ opacity: isEditingBlocked ? 0.7 : 1, pointerEvents: isEditingBlocked ? "none" : "auto" }}>
              <EnviarRespuestaForm demandaId={Number.parseInt(params.id)} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                opacity: isPeticionDeInforme || isEditingBlocked ? 0.7 : 1,
                pointerEvents: isPeticionDeInforme || isEditingBlocked ? "none" : "auto",
              }}
            >
              <RegistrarActividadForm demandaId={Number.parseInt(params.id)} />
            </Box>
          </TabPanel>

          {hasVinculacionPermission && (
            <TabPanel value={tabValue} index={3}>
              <Box
                sx={{
                  opacity: isPeticionDeInforme || isEditingBlocked ? 0.7 : 1,
                  pointerEvents: isPeticionDeInforme || isEditingBlocked ? "none" : "auto",
                }}
              >
                <ConexionesDemandaTab demandaId={Number.parseInt(params.id)} />
              </Box>
            </TabPanel>
          )}
        </Paper>
      </Box>

      {/* Modal compartido con nuevoingreso. Aparece cuando un edit dispara
          creación automática de actividades (Rosa completa tipo_oficio en
          una demanda con vínculos pre-existentes). */}
      <DemandaSuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        data={successResponse}
        onNavigateToDemanda={handleCloseSuccessModal}
        onNavigateToMesaEntrada={handleNavigateToMesaFromModal}
        onNavigateToMedida={handleNavigateToMedidaFromModal}
      />
    </Box>
  )
}
