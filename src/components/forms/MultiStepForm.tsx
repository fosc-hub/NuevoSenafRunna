"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, CircularProgress, Alert, Skeleton } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"
import { useDraftStore } from "./utils/userDraftStore"
import { fetchDropdownData } from "./utils/fetchFormCase"

const steps = ["Información General", "Adultos Convivientes", "Niños y Adolescentes"]

interface MultiStepFormProps {
  initialData?: FormData
  readOnly?: boolean
  onSubmit: (data: FormData) => void
  id?: string
  form?: string
  isPeticionDeInforme?: boolean
}

const FormSkeleton = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
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
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const formId = form || "new"

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
  useEffect(() => {
    if (!isReadOnly) {
      const timeoutId = setTimeout(() => {
        saveDraft(formId, formValues)
      }, 1000) // Debounce to avoid saving on every keystroke

      return () => clearTimeout(timeoutId)
    }
  }, [formValues, formId, saveDraft, isReadOnly])

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
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    // Save current step data to draft before moving to previous step
    if (!isReadOnly) {
      saveDraft(formId, methods.getValues())
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

  useEffect(() => {
    if (isReadOnly) {
      // Add a style tag to the document head
      const style = document.createElement("style")
      style.innerHTML = `
        .read-only-form input, 
        .read-only-form select, 
        .read-only-form textarea {
          color: gray !important;
          font-weight: normal !important;
          opacity: 0.8 !important;
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

  if (isDropdownLoading) return <CircularProgress />
  if (isDropdownError) return <FormSkeleton />

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className={isReadOnly ? "read-only-form" : ""}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isPeticionDeInforme && initialData?.objetivo_de_demanda === "PETICION_DE_INFORME" && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: "info.lighter",
              "& .MuiAlert-message": {
                color: "info.dark",
              },
            }}
          >
            Esta es una petición de informe. La información solo puede ser visualizada, no modificada.
          </Alert>
        )}

        <Box sx={{ mt: 4, mb: 4 }}>
          {dropdownData && (
            <>
              {activeStep === 0 && <Step1Form dropdownData={dropdownData} readOnly={isReadOnly} />}
              {activeStep === 1 && <Step2Form dropdownData={dropdownData} readOnly={isReadOnly} />}
              {activeStep === 2 && (
                <Step3Form
                  dropdownData={dropdownData}
                  adultosConvivientes={methods.watch("adultosConvivientes") || []}
                  readOnly={isReadOnly}
                />
              )}
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} type="button">
            Atrás
          </Button>

          {!isReadOnly && savedDraft && (
            <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.875rem" }}>
              Borrador guardado automáticamente
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? (isReadOnly ? () => {} : handleFinalSubmit) : handleNext}
            type="button"
            disabled={(activeStep === steps.length - 1 && isReadOnly) || (!isReadOnly && mutation.isPending)}
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </FormProvider>
  )
}

export default MultiStepForm
