"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, Paper, Typography, CircularProgress } from "@mui/material"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { useQuery, useMutation } from "@tanstack/react-query"
import { fetchDropdownData, submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"

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
      onSubmit(data)
    },
    onError: (error) => {
      console.error("Error submitting form:", error)
      // Handle error (e.g., show an error message)
    },
  })

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
                {(activeStep === 0 || isNewForm) && <Step1Form dropdownData={dropdownData} readOnly={readOnly} />}
                {!isNewForm && activeStep === 1 && <Step2Form dropdownData={dropdownData} readOnly={readOnly} />}
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
              {!isNewForm && (
                <Button disabled={activeStep === 0} onClick={handleBack} type="button">
                  Atrás
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={isNewForm || activeStep === steps.length - 1 ? handleFormSubmit : handleNext}
                type={isNewForm || activeStep === steps.length - 1 ? "submit" : "button"}
                disabled={mutation.isPending}
              >
                {isNewForm
                  ? mutation.isPending
                    ? "Enviando..."
                    : "Enviar"
                  : activeStep === steps.length - 1
                    ? mutation.isPending
                      ? "Enviando..."
                      : "Enviar"
                    : "Siguiente"}
              </Button>
            </Box>
          )}
        </form>
      </Paper>
      {mutation.isError && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error al enviar el formulario. Por favor, intente nuevamente.
        </Typography>
      )}
      {mutation.isSuccess && (
        <Typography color="success" sx={{ mt: 2 }}>
          Formulario enviado exitosamente.
        </Typography>
      )}
    </FormProvider>
  )
}

export default MultiStepForm
