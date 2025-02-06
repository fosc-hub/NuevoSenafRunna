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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Multi-Step Form</h1>
      <MultiStepForm onSubmit={handleSubmit} initialData={formData || undefined} readOnly={false} />
    </div>
  )
}

export default Home

