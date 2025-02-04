import type React from "react"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Box, Button, Stepper, Step, StepLabel, Paper, Typography } from "@mui/material"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"
import { useQuery } from "@tanstack/react-query"
import { fetchDropdownData } from "./utils/api"
import type { DropdownData } from "./types/formTypes"

const steps = ["Información General", "Adultos Convivientes", "Niños y Adolescentes"]

const MultiStepForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const methods = useForm<FormData>()

  const {
    data: dropdownData,
    isLoading,
    isError,
  } = useQuery<DropdownData>({
    queryKey: ["dropdowns"],
    queryFn: fetchDropdownData,
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

  const onSubmit = (data: FormData) => {
    console.log(data)
    // Handle form submission
  }

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar los datos del formulario</div>

  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "background.paper" }}>
        <Typography variant="h4" gutterBottom>
          Formulario Multi-Paso
        </Typography>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
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
            {activeStep === 2 && dropdownData && <Step3Form dropdownData={dropdownData} />}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} type="button">
              Atrás
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? methods.handleSubmit(onSubmit) : handleNext}
              type="button"
            >
              {activeStep === steps.length - 1 ? "Enviar" : "Siguiente"}
            </Button>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  )
}

export default MultiStepForm

