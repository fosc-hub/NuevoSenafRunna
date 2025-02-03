import type React from "react"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Box, Button, Paper } from "@mui/material"
import FormStepper from "./FormStepper"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import Step3Form from "./Step3Form"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  subscribe: z.boolean(),
  comments: z.string().optional(),
})

export type FormData = z.infer<typeof schema>

interface MultiStepFormProps {
  onSubmit: (data: FormData) => void
  initialData?: Partial<FormData>
  readOnly?: boolean
}

const steps = ["Personal Information", "Address Information", "Preferences"]

const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSubmit, initialData, readOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0)
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: initialData,
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

  const handleStepClick = (step: number) => {
    setActiveStep(step)
  }

  const handleSubmit = methods.handleSubmit(onSubmit)

  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <FormStepper steps={steps} activeStep={activeStep} onStepClick={handleStepClick} />
        <Box sx={{ mt: 2, mb: 2 }}>
          {activeStep === 0 && <Step1Form control={methods.control} readOnly={readOnly} />}
          {activeStep === 1 && <Step2Form control={methods.control} readOnly={readOnly} />}
          {activeStep === 2 && <Step3Form control={methods.control} readOnly={readOnly} />}
        </Box>
        {!readOnly && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              {activeStep !== steps.length - 1 && (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
              {activeStep === steps.length - 1 && (
                <Button variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </FormProvider>
  )
}

export default MultiStepForm

