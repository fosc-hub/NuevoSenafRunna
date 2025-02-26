"use client"

import type React from "react"
import { useState } from "react"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import { Typography, CircularProgress } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The mutation is no longer needed in this component since MultiStepForm handles submission
  const mutation = useMutation({
    mutationFn: async (data: FormData) => data,
    onSuccess: (data) => {
      console.log("Form data received:", data)
      setFormData(data)
      setError(null)
      toast.success("Formulario enviado exitosamente.")
    },
    onError: (error: any) => {
      console.error("Error with form data:", error)
      setError("Error al procesar el formulario. Por favor, intente nuevamente.")
      toast.error("Error al procesar el formulario. Por favor, intente nuevamente.")
    },
  })

  const handleSubmit = (data: FormData) => {
    console.log("Form data received from MultiStepForm:", data)
    // We're just receiving the data here, not submitting it again
    mutation.mutate(data) // This just passes the data through the mutation for state management
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <main className="max-w-[800px] mx-auto p-5">
      <Typography variant="h4" gutterBottom>
        Nuevo Registro
      </Typography>
      {mutation.isPending ? (
        <CircularProgress />
      ) : (
        <MultiStepForm onSubmit={handleSubmit} initialData={formData || undefined} readOnly={false} />
      )}
    </main>
  )
}

export default Home

