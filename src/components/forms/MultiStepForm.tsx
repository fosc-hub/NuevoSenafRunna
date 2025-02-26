"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, Paper, CircularProgress } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { fetchDropdownData, submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"

const steps = ["Información General", "Adultos Convivientes", "Niños y Adolescentes"]

interface MultiStepFormProps {
  initialData?: FormData
  readOnly?: boolean
  onSubmit: (data: FormData) => void
  id?: string
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ initialData, readOnly = false, onSubmit, id }) => {
  const [activeStep, setActiveStep] = useState(0)

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

  if (isDropdownLoading) return <CircularProgress />
  if (isDropdownError) return <div>Error al cargar los datos del formulario</div>

  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "background.paper" }}>
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
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleFormSubmit : handleNext}
                type="button"
                disabled={mutation.isPending}
              >
                {activeStep === steps.length - 1 ? (mutation.isPending ? "Enviando..." : "Enviar") : "Siguiente"}
              </Button>
            </Box>
          )}
        </form>
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </FormProvider>
  )
}

export default MultiStepForm

