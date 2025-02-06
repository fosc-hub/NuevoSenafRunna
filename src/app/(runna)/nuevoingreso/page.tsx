"use client"

import type React from "react"
import { useState, useEffect } from "react"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import { Button, Box, CircularProgress, Typography } from "@mui/material"
import { fetchCaseData } from "@/components/forms/utils/api"

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Current state:", { formData, isEditing, isLoading, error })
  }, [formData, isEditing, isLoading, error])

  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data)
    setFormData(data)
    setIsEditing(false)
  }

  const loadCaseData = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCaseData(id)
      console.log("Loaded case data:", data)
      setFormData(data)
      setIsEditing(true)
      console.log("State after loading data:", { formData: data, isEditing: true })
    } catch (err) {
      setError("Error loading case data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Multi-Step Form Example</h1>
      {!formData && !isEditing && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Create New Form
          </Button>
          <Button variant="contained" onClick={() => loadCaseData("5")}>
            Load Case Data
          </Button>
        </Box>
      )}
      {isLoading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {(isEditing || formData) && (
        <>
          <p>
            Debug: isEditing={String(isEditing)}, formData exists={String(!!formData)}
          </p>
          <MultiStepForm
            onSubmit={handleSubmit}
            initialData={formData || undefined}
            readOnly={!isEditing && !!formData}
          />
        </>
      )}
      {formData && !isEditing && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit Form
          </Button>
        </Box>
      )}
    </div>
  )
}

export default Home

