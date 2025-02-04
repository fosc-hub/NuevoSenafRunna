import type React from "react"
import { useState, useCallback } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, Paper, Typography, CircularProgress } from "@mui/material"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { useQuery, useMutation } from "@tanstack/react-query"
import { fetchDropdownData, submitFormData } from "./utils/api"
import type { DropdownData, FormData } from "./types/formTypes"

const steps = ["Información General", "Adultos Convivientes", "Niños y Adolescentes"]

const MultiStepForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      adultosConvivientes: [],
      ninosAdolescentes: [],
    },
  })

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
      // Handle success (e.g., show a success message, redirect, etc.)
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

  const onSubmit = useCallback(
    (data: FormData) => {
      console.log("Form data before submission:", data)
      mutation.mutate(data)
    },
    [mutation],
  )

  const handleFormSubmit = methods.handleSubmit(onSubmit)

  if (isLoading) return <CircularProgress />
  if (isError) return <div>Error al cargar los datos del formulario</div>

  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "background.paper" }}>
        <Typography variant="h4" gutterBottom>
          Formulario Multi-Paso
        </Typography>
        <form onSubmit={handleFormSubmit}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 4, mb: 4 }}>
            {activeStep === 0 && dropdownData && <Step1Form dropdownData={dropdownData} />}
            {activeStep === 1 && dropdownData && <Step2Form dropdownData={dropdownData} />}
            {activeStep === 2 && dropdownData && (
              <Step3Form dropdownData={dropdownData} adultosConvivientes={methods.watch("adultosConvivientes") || []} />
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} type="button">
              Atrás
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? handleFormSubmit : handleNext}
              type={activeStep === steps.length - 1 ? "submit" : "button"}
              disabled={mutation.isPending}
            >
              {activeStep === steps.length - 1 ? (mutation.isPending ? "Enviando..." : "Enviar") : "Siguiente"}
            </Button>
          </Box>
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

