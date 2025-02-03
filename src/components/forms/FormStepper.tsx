import type React from "react"
import { Stepper, Step, StepLabel, StepButton } from "@mui/material"

interface FormStepperProps {
  steps: string[]
  activeStep: number
  onStepClick: (step: number) => void
}

const FormStepper: React.FC<FormStepperProps> = ({ steps, activeStep, onStepClick }) => {
  return (
    <Stepper activeStep={activeStep} nonLinear>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepButton onClick={() => onStepClick(index)}>
            <StepLabel>{label}</StepLabel>
          </StepButton>
        </Step>
      ))}
    </Stepper>
  )
}

export default FormStepper

