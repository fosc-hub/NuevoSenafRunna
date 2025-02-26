"use client"

import type React from "react"
import { useState } from "react"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import { Typography, CircularProgress } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { submitFormData } from "../../../components/forms/utils/api"
import { toast } from "react-toastify"

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: (data) => {
      console.log("Form submitted successfully:", data)
      toast.success("Formulario enviado exitosamente.")
      setFormData(data)
      setError(null)
    },
    onError: (error: any) => {
      console.error("Error submitting form:", error)
      setError("Error al enviar el formulario. Por favor, intente nuevamente.")
      toast.error("Error al enviar el formulario. Por favor, intente nuevamente.")
    },
  })

  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data)
    mutation.mutate(data)
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

