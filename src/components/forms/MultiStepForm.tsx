"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, CircularProgress } from "@mui/material"
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
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ initialData, readOnly = false, onSubmit, id, form }) => {
  const [activeStep, setActiveStep] = useState(0)
  const formId = form || "new"

  // Get draft store functions
  const { saveDraft, getDraft, clearDraft } = useDraftStore()

  // Get saved draft if it exists
  const savedDraft = getDraft(formId)

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
    if (!readOnly) {
      const timeoutId = setTimeout(() => {
        saveDraft(formId, formValues)
      }, 1000) // Debounce to avoid saving on every keystroke

      return () => clearTimeout(timeoutId)
    }
  }, [formValues, formId, saveDraft, readOnly])

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
    const isValid = await methods.trigger()
    if (isValid) {
      // Save current step data to draft before moving to next step
      saveDraft(formId, methods.getValues())
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    // Save current step data to draft before moving to previous step
    saveDraft(formId, methods.getValues())
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
    if (!readOnly) {
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

  if (isDropdownLoading) return <CircularProgress />
  if (isDropdownError) return <div>Error al cargar los datos del formulario</div>

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4, mb: 4 }}>
          {dropdownData && (
            <>
              {activeStep === 0 && <Step1Form dropdownData={dropdownData} readOnly={readOnly} />}
              {activeStep === 1 && <Step2Form dropdownData={dropdownData} readOnly={readOnly} />}
              {activeStep === 2 && (
                <Step3Form
                  dropdownData={dropdownData}
                  adultosConvivientes={methods.watch("adultosConvivientes") || []}
                  readOnly={readOnly}
                />
              )}
            </>
          )}
        </Box>
        {!readOnly && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} type="button">
              Atrás
            </Button>
            {savedDraft && (
              <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.875rem" }}>
                Borrador guardado automáticamente
              </Box>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? handleFinalSubmit : handleNext}
              type="button"
              disabled={mutation.isPending}
            >
              {activeStep === steps.length - 1 ? (mutation.isPending ? "Enviando..." : "Enviar") : "Siguiente"}
            </Button>
          </Box>
        )}
      </form>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </FormProvider>
  )
}

export default MultiStepForm

