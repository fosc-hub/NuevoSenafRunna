"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import {
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { useDraftStore } from "@/components/forms/utils/userDraftStore"

const Home: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDraftModal, setShowDraftModal] = useState(false)

  // Use a consistent ID for the draft
  const formId = "new-registro"

  // Get draft store functions
  const { getDraft, clearDraft } = useDraftStore()

  // Add a key state to force re-render of the form
  const [formKey, setFormKey] = useState(0)

  // Check for existing draft on component mount
  useEffect(() => {
    const draft = getDraft(formId)
    if (draft && isDraftNotEmpty(draft)) {
      console.log("Draft found:", draft)
      // Show the modal if a draft exists with content
      setShowDraftModal(true)
    }
  }, [getDraft, formId])

  // Helper function to check if a draft has meaningful content
  const isDraftNotEmpty = (draft: FormData): boolean => {
    // Check if any top-level string/number fields have values
    const hasBasicFields = Object.entries(draft).some(([key, value]) => {
      return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    })

    // Check if adultosConvivientes array has any items with content
    const hasAdultos =
      Array.isArray(draft.adultosConvivientes) &&
      draft.adultosConvivientes.length > 0 &&
      draft.adultosConvivientes.some((adulto) =>
        Object.values(adulto).some((val) => val !== "" && val !== null && val !== undefined),
      )

    // Check if ninosAdolescentes array has any items with content
    const hasNinos =
      Array.isArray(draft.ninosAdolescentes) &&
      draft.ninosAdolescentes.length > 0 &&
      draft.ninosAdolescentes.some((nino) =>
        Object.values(nino).some((val) => val !== "" && val !== null && val !== undefined),
      )

    return hasBasicFields || hasAdultos || hasNinos
  }

  const handleLoadDraft = () => {
    const draft = getDraft(formId)
    if (draft) {
      setFormData(draft)
      toast.info("Borrador cargado exitosamente")
    }
    setShowDraftModal(false)
  }

  const handleClearDraft = () => {
    clearDraft(formId)
    setFormData(null)
    // Increment the key to force a complete re-render of the form
    setFormKey((prev) => prev + 1)
    toast.info("Borrador eliminado")
    setShowDraftModal(false)
  }

  // The mutation is no longer needed in this component since MultiStepForm handles submission
  const mutation = useMutation({
    mutationFn: async (data: FormData) => data,
    onSuccess: (data) => {
      console.log("Form data received:", data)
      setFormData(data)
      setError(null)
      toast.success("Formulario enviado exitosamente.")

      // Clear the draft after successful submission
      clearDraft(formId)

      // Redirect to mesadeentrada after successful submission
      router.push("/mesadeentrada")
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

      {/* Draft Modal */}
      <Dialog
        open={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        aria-labelledby="draft-dialog-title"
        aria-describedby="draft-dialog-description"
      >
        <DialogTitle id="draft-dialog-title">Borrador encontrado</DialogTitle>
        <DialogContent>
          <DialogContentText id="draft-dialog-description">
            Se ha encontrado un borrador guardado. ¿Desea continuar con el borrador o comenzar de nuevo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearDraft} color="error">
            Comenzar de nuevo
          </Button>
          <Button onClick={handleLoadDraft} color="primary" autoFocus>
            Continuar con borrador
          </Button>
        </DialogActions>
      </Dialog>

      {mutation.isPending ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <MultiStepForm
            key={formKey}
            onSubmit={handleSubmit}
            initialData={formData || undefined}
            readOnly={false}
            form={formId} // Pass the formId to MultiStepForm for draft saving
          />
        </Paper>
      )}
    </main>
  )
}

export default Home

