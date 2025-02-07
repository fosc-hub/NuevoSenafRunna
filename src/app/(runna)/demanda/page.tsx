"use client"

import { useState, useEffect } from "react"
import {
  CircularProgress,
  Typography,
  IconButton,
  Box
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { fetchCaseData } from "@/components/forms/utils/api"
import type { FormData } from "@/components/forms/types/formTypes"

interface DemandaDetailProps {
  params: {
    id: string
  }
  // This must come from the parent component
  onClose: () => void
}

export default function DemandaDetail({ params, onClose }: DemandaDetailProps) {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCaseData = async () => {
      if (params.id) {
        try {
          setIsLoading(true)
          const data = await fetchCaseData(params.id)
          setFormData(data)
        } catch (err) {
          console.error("Error loading case data:", err)
          setError("Error loading case data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCaseData()
  }, [params.id])

  const handleSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    // e.g., update the case data
  }

  if (isLoading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <IconButton
        aria-label="close"
        onClick={onClose} // Make sure this is present
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ pt: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          id="demanda-detail-modal"
          sx={{
            color: "text.primary",
            mb: 3,
          }}
        >
          Detalle de la Demanda
        </Typography>
        {formData && (
          <MultiStepForm
            initialData={formData}
            onSubmit={handleSubmit}
            readOnly={false}
          />
        )}
      </Box>
    </Box>
  )
}
