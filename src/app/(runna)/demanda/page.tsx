"use client"

import { useState, useEffect } from "react"
import { CircularProgress, Typography } from "@mui/material"
import MultiStepForm from "@/components/forms/MultiStepForm"
import { fetchCaseData } from "@/components/forms/utils/api"
import type { FormData } from "@/components/forms/types/formTypes"

interface DemandaDetailProps {
  params: {
    id: string
  }
}

export default function DemandaDetail({ params }: DemandaDetailProps) {
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
    // Handle form submission (e.g., update the case data)
  }

  if (isLoading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Demanda Details
      </Typography>
      {formData && <MultiStepForm initialData={formData} onSubmit={handleSubmit} />}
    </div>
  )
}

