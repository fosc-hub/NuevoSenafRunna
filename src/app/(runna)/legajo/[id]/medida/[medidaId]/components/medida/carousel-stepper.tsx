"use client"

import type React from "react"
import { useState } from "react"
import {
    Box,
    Paper,
    IconButton,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepButton,
    useTheme
} from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"

interface CarouselStep {
    id: string
    title: string
    content: React.ReactNode
}

interface CarouselStepperProps {
    steps: CarouselStep[]
    initialStep?: number
}

export const CarouselStepper: React.FC<CarouselStepperProps> = ({
    steps,
    initialStep = 0
}) => {
    const [activeStep, setActiveStep] = useState(initialStep)
    const theme = useTheme()

    const handleNext = () => {
        setActiveStep((prevActiveStep) =>
            prevActiveStep < steps.length - 1 ? prevActiveStep + 1 : prevActiveStep
        )
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) =>
            prevActiveStep > 0 ? prevActiveStep - 1 : prevActiveStep
        )
    }

    const handleStepClick = (step: number) => {
        setActiveStep(step)
    }

    if (steps.length === 0) return null

    return (
        <Box sx={{ width: "100%" }}>
            {/* Stepper Navigation */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                        <Step key={step.id}>
                            <StepButton
                                color="inherit"
                                onClick={() => handleStepClick(index)}
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.875rem',
                                        fontWeight: activeStep === index ? 600 : 400,
                                        color: activeStep === index ? 'primary.main' : 'text.secondary'
                                    },
                                    '& .MuiStepIcon-root': {
                                        color: activeStep === index ? 'primary.main' : 'action.disabled',
                                        '&.Mui-completed': {
                                            color: 'primary.main',
                                        }
                                    }
                                }}
                            >
                                <StepLabel>{step.title}</StepLabel>
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Navigation Controls */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                px: 1
            }}>
                <IconButton
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{
                        backgroundColor: activeStep === 0 ? 'action.disabledBackground' : 'primary.main',
                        color: activeStep === 0 ? 'action.disabled' : 'white',
                        '&:hover': {
                            backgroundColor: activeStep === 0 ? 'action.disabledBackground' : 'primary.dark',
                        },
                        borderRadius: 2,
                        p: 1.5
                    }}
                >
                    <ArrowBackIosIcon />
                </IconButton>

                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 3
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Paso {activeStep + 1} de {steps.length}
                    </Typography>
                </Box>

                <IconButton
                    onClick={handleNext}
                    disabled={activeStep === steps.length - 1}
                    sx={{
                        backgroundColor: activeStep === steps.length - 1 ? 'action.disabledBackground' : 'primary.main',
                        color: activeStep === steps.length - 1 ? 'action.disabled' : 'white',
                        '&:hover': {
                            backgroundColor: activeStep === steps.length - 1 ? 'action.disabledBackground' : 'primary.dark',
                        },
                        borderRadius: 2,
                        p: 1.5
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>

            {/* Current Step Content */}
            <Box sx={{ minHeight: 400 }}>
                {steps[activeStep]?.content}
            </Box>
        </Box>
    )
} 