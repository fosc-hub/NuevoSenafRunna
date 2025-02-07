"use client"

import type React from "react"
import { useState } from "react"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import { Typography } from "@mui/material"

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data)
    setFormData(data)
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <main className="max-w-[800px] mx-auto p-5">
      <Typography variant="h4" gutterBottom>
        Nuevo Registro
      </Typography>
      <MultiStepForm onSubmit={handleSubmit} initialData={formData || undefined} readOnly={false} />
    </main>
  )
}

export default Home

