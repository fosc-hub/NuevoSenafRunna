"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useForm, FormProvider } from "react-hook-form"
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Skeleton,
  Typography,
  Chip,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  NavigateNext,
  NavigateBefore,
  Save,
  Send,
  CheckCircleOutline,
  InfoOutlined,
  WarningAmber,
} from "@mui/icons-material"

import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"
import { useDraftStore } from "./utils/userDraftStore"
import { fetchDropdownData } from "./utils/fetchFormCase"

const steps = [
  {
    label: "Información General",
    description: "Datos básicos de la demanda",
  },
  {
    label: "Adultos Convivientes",
    description: "Información de adultos en el grupo familiar",
  },
  {
    label: "Niños y Adolescentes",
    description: "Información de menores en el grupo familiar",
  },
]

interface MultiStepFormProps {
  initialData?: FormData
  readOnly?: boolean
  onSubmit: (data: FormData) => void
  id?: string
  form?: string
  isPeticionDeInforme?: boolean
  demandaId?: number
}

const FormSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  )
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  initialData,
  readOnly = false,
  onSubmit,
  id,
  form,
  isPeticionDeInforme: propIsPeticionDeInforme,
  demandaId,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const formId = form || "new"
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Get draft store functions
  const { saveDraft, getDraft, clearDraft } = useDraftStore()

  // Get saved draft if it exists
  const savedDraft = getDraft(formId)

  // Check if this is a petition for report from initialData or from prop
  const isPeticionDeInforme = propIsPeticionDeInforme || initialData?.objetivo_de_demanda === "PETICION_DE_INFORME"

  // If it's a petition for report or other blocked state, enforce readOnly
  const isReadOnly = readOnly || isPeticionDeInforme

  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      adultosConvivientes: [],
      ninosAdolescentes: [],
      ...initialData,
      // Use saved draft data if available
      ...savedDraft,
    },
  })

  // Watch for form changes to save draft
  const formValues = methods.watch()

  // Save draft when form values change
  const saveDraftWithFeedback = useCallback(() => {
    if (!isReadOnly) {
      setIsSaving(true)
      saveDraft(formId, formValues)
      setLastSaved(new Date())

      // Show saving indicator briefly
      setTimeout(() => {
        setIsSaving(false)
      }, 800)
    }
  }, [formValues, formId, saveDraft, isReadOnly])

  // Save draft when form values change
  useEffect(() => {
    if (!isReadOnly) {
      const timeoutId = setTimeout(() => {
        saveDraftWithFeedback()
      }, 1500) // Debounce to avoid saving on every keystroke

      return () => clearTimeout(timeoutId)
    }
  }, [formValues, saveDraftWithFeedback, isReadOnly])

  // Manual save function
  const handleManualSave = () => {
    saveDraftWithFeedback()
    toast.success("Borrador guardado manualmente")
  }

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData)
    }
  }, [initialData, methods])

  const {
    data: dropdownData,
    isLoading: isDropdownLoading,
    isError: isDropdownError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
    queryFn: fetchDropdownData,
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => submitFormData(data, id),
    onSuccess: (data) => {
      console.log("Form submitted successfully:", data)
      // Clear draft after successful submission
      clearDraft(formId)
      onSubmit(data)
    },
    onError: (error) => {
      console.error("Error submitting form:", error)
      toast.error("Error al enviar el formulario. Por favor, intente nuevamente.")
    },
  })

  const handleNext = async () => {
    // If in read-only mode, just navigate without validation
    if (isReadOnly) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
      return
    }

    const isValid = await methods.trigger()
    if (isValid) {
      // Save current step data to draft before moving to next step
      saveDraft(formId, methods.getValues())
      setLastSaved(new Date())
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    } else {
      // Show error toast if validation fails
      toast.error("Por favor, complete todos los campos requeridos antes de continuar.")
    }
  }

  const handleBack = () => {
    // Save current step data to draft before moving to previous step
    if (!isReadOnly) {
      saveDraft(formId, methods.getValues())
      setLastSaved(new Date())
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleFormSubmit = methods.handleSubmit((data) => {
    console.log("Form data before submission:", data)
    // Ensure ninosAdolescentes and adultosConvivientes are always arrays
    const formDataWithArrays = {
      ...data,
      ninosAdolescentes: data.ninosAdolescentes || [],
      adultosConvivientes: data.adultosConvivientes || [],
    }
    if (!isReadOnly) {
      mutation.mutate(formDataWithArrays)
    } else {
      onSubmit(formDataWithArrays)
    }
  })

  // Add this new function to handle the final step button click
  const handleFinalSubmit = (e) => {
    e.preventDefault() // Prevent default button behavior
    handleFormSubmit() // Call the form submission handler
  }

  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return ""

    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "hace unos segundos"
    if (diffMins === 1) return "hace 1 minuto"
    if (diffMins < 60) return `hace ${diffMins} minutos`

    const hours = lastSaved.getHours().toString().padStart(2, "0")
    const minutes = lastSaved.getMinutes().toString().padStart(2, "0")
    return `a las ${hours}:${minutes}`
  }

  useEffect(() => {
    if (isReadOnly) {
      // Add a style tag to the document head
      const style = document.createElement("style")
      style.innerHTML = `
        .read-only-form input, 
        .read-only-form select, 
        .read-only-form textarea {
          color: rgba(0, 0, 0, 0.7) !important;
          font-weight: normal !important;
          background-color: rgba(0, 0, 0, 0.03) !important;
        }
        
        /* Fix for checkboxes and switches */
        .read-only-form .MuiCheckbox-root,
        .read-only-form .MuiSwitch-root {
          background-color: transparent !important;
        }
        
        .read-only-form .MuiCheckbox-root .MuiSvgIcon-root,
        .read-only-form .MuiSwitch-thumb {
          opacity: 0.7 !important;
        }
        
        .read-only-form .MuiSwitch-track {
          opacity: 0.3 !important;
        }
        
        /* Remove the gray box around checkboxes */
        .read-only-form .MuiCheckbox-root {
          padding: 9px;
        }
        
        .read-only-form .MuiFormControlLabel-root {
          background-color: transparent !important;
        }
        
        /* Fix for the checkbox container */
        .read-only-form .MuiFormControlLabel-root .MuiBox-root {
          background-color: transparent !important;
        }
      `
      document.head.appendChild(style)

      // Clean up when component unmounts
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [isReadOnly])

  if (isDropdownLoading)
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ mb: 3 }} />
        <FormSkeleton />
      </Box>
    )

  if (isDropdownError)
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        >
          Error al cargar los datos del formulario. Por favor, intente nuevamente.
        </Alert>
        <FormSkeleton />
      </Box>
    )

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className={isReadOnly ? "read-only-form" : ""}>
        <Box sx={{ bgcolor: "background.paper", p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          {/* Progress indicator */}
          <Box sx={{ width: "100%", mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(activeStep / (steps.length - 1)) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{
              mt: 2,
              "& .MuiStepLabel-label": {
                mt: 0.5,
                fontSize: isMobile ? "0.875rem" : "1rem",
              },
              "& .MuiStepLabel-iconContainer": {
                "& .MuiSvgIcon-root": {
                  fontSize: isMobile ? 24 : 28,
                },
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  {step.label}
                  {!isMobile && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      {step.description}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {isPeticionDeInforme && initialData?.objetivo_de_demanda === "PETICION_DE_INFORME" && (
          <Alert
            severity="info"
            icon={<InfoOutlined />}
            sx={{
              m: 3,
              borderRadius: 1,
              backgroundColor: "info.lighter",
              "& .MuiAlert-message": {
                color: "info.dark",
              },
            }}
          >
            <Typography variant="subtitle2">Modo de solo lectura</Typography>
            <Typography variant="body2">
              Esta es una petición de informe. La información solo puede ser visualizada, no modificada.
            </Typography>
          </Alert>
        )}

        {isReadOnly && !isPeticionDeInforme && (
          <Alert
            severity="warning"
            icon={<WarningAmber />}
            sx={{
              m: 3,
              borderRadius: 1,
              backgroundColor: "warning.lighter",
              "& .MuiAlert-message": {
                color: "warning.dark",
              },
            }}
          >
            <Typography variant="subtitle2">Modo de solo lectura</Typography>
            <Typography variant="body2">
              Este formulario está en modo de solo lectura. No se pueden realizar modificaciones.
            </Typography>
          </Alert>
        )}

        <Box sx={{ p: 3 }}>
          {dropdownData && (
            <>
              {activeStep === 0 && <Step1Form dropdownData={dropdownData} readOnly={isReadOnly} id={demandaId} />}
              {activeStep === 1 && <Step2Form dropdownData={dropdownData} readOnly={isReadOnly} id={demandaId} />}
              {activeStep === 2 && (
                <Step3Form
                  dropdownData={dropdownData}
                  adultosConvivientes={methods.watch("adultosConvivientes") || []}
                  readOnly={isReadOnly}
                  id={demandaId}
                />
              )}
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            type="button"
            startIcon={<NavigateBefore />}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Atrás
          </Button>

          {!isReadOnly && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                fontSize: "0.875rem",
                mx: 2,
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              {isSaving ? (
                <Chip
                  label="Guardando..."
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<CircularProgress size={16} color="inherit" />}
                />
              ) : lastSaved ? (
                <Tooltip title={`Último guardado: ${lastSaved.toLocaleString()}`}>
                  <Chip
                    label={`Guardado ${formatLastSaved()}`}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<CheckCircleOutline fontSize="small" />}
                    onClick={handleManualSave}
                  />
                </Tooltip>
              ) : (
                <Chip
                  label="Guardar borrador"
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<Save fontSize="small" />}
                  onClick={handleManualSave}
                />
              )}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? (isReadOnly ? () => {} : handleFinalSubmit) : handleNext}
            type="button"
            endIcon={activeStep === steps.length - 1 ? <Send /> : <NavigateNext />}
            disabled={(activeStep === steps.length - 1 && isReadOnly) || (!isReadOnly && mutation.isPending)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
            }}
          >
            {activeStep === steps.length - 1
              ? isReadOnly
                ? "Finalizar"
                : mutation.isPending
                  ? "Enviando..."
                  : "Enviar"
              : "Siguiente"}
          </Button>
        </Box>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </FormProvider>
  )
}

export default MultiStepForm
