"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
} from "@mui/material"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { useQuery, useMutation } from "@tanstack/react-query"
import { fetchDropdownData, submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const steps = ["Información General", "Adultos Convivientes", "Niños y Adolescentes"]

interface MultiStepFormProps {
  initialData?: FormData
  readOnly?: boolean
  onSubmit: (data: FormData) => void
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ initialData, readOnly = false, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0)
  const isNewForm = !initialData

  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: initialData || {
      adultosConvivientes: [],
      ninosAdolescentes: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData)
    }
  }, [initialData, methods])

  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
    queryFn: fetchDropdownData,
  })

  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: (data) => {
      console.log("Form submitted successfully:", data)
      toast.success("Formulario enviado exitosamente.")
      onSubmit(data)
    },
    onError: (error) => {
      console.error("Error submitting form:", error)
      toast.error("Error al enviar el formulario. Por favor, intente nuevamente.")
    },
  })

  // Handler for navigating to the next step (used in update mode)
  const handleNext = async () => {
    const isValid = await methods.trigger()
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleFormSubmit = methods.handleSubmit((data: FormData) => {
    console.log("Form data before submission:", data)
    if (!readOnly) {
      mutation.mutate(data)
    } else {
      onSubmit(data)
    }
  })

  if (isLoading) return <CircularProgress />
  if (isError) return <div>Error al cargar los datos del formulario</div>

  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "background.paper" }}>
        <form onSubmit={handleFormSubmit}>
          {/* Render the Stepper only in update mode */}
          {!isNewForm && (
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}
          <Box sx={{ mt: 4, mb: 4 }}>
            {dropdownData && (
              <>
                {(activeStep === 0 || isNewForm) && (
                  <Step1Form dropdownData={dropdownData} readOnly={readOnly} />
                )}
                {/* In update mode, render the additional steps */}
                {!isNewForm && activeStep === 1 && (
                  <Step2Form dropdownData={dropdownData} readOnly={readOnly} />
                )}
                {!isNewForm && activeStep === 2 && (
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
              {/* "Atrás" button available in update mode (when not on the first step) */}
              {!isNewForm && (
                <Button disabled={activeStep === 0} onClick={handleBack} type="button">
                  Atrás
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                // In new form mode we always submit the form.
                // In update mode, if we’re not on the last step, navigate to the next step.
                // On the final step, show "Guardar" with no action for now.
                onClick={
                  isNewForm
                    ? handleFormSubmit
                    : activeStep < steps.length - 1
                      ? handleNext
                      : undefined
                }
                type="button"
                disabled={mutation.isPending}
              >
                {isNewForm
                  ? mutation.isPending
                    ? "Enviando..."
                    : "Enviar"
                  : activeStep < steps.length - 1
                    ? "Siguiente"
                    : "Guardar"}
              </Button>
            </Box>
          )}
        </form>
      </Paper>
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </FormProvider>
  )
}

export default MultiStepForm
