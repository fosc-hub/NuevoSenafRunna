"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MultiStepForm, { type FormData } from "../../../components/forms/MultiStepForm"
import {
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Container,
  Card,
  CardContent,
  LinearProgress,
  Fade,
} from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { useDraftStore } from "@/components/forms/utils/userDraftStore"
import { ArrowBack, Save, Delete, Refresh } from "@mui/icons-material"

const Home: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use a consistent ID for the draft
  const formId = "new-registro"

  // Get draft store functions
  const { getDraft, clearDraft } = useDraftStore()

  // Add a key state to force re-render of the form
  const [formKey, setFormKey] = useState(0)

  // Check for existing draft on component mount
  useEffect(() => {
    const checkForDraft = async () => {
      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      const draft = getDraft(formId)
      if (draft && isDraftNotEmpty(draft)) {
        console.log("Draft found:", draft)
        // Show the modal if a draft exists with content
        setShowDraftModal(true)
      }
      setIsLoading(false)
    }

    checkForDraft()
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

  const handleGoBack = () => {
    router.push("/mesadeentrada")
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
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ mb: 4, bgcolor: "error.lighter", color: "error.main" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Error
            </Typography>
            <Typography>{error}</Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={() => setError(null)}
              sx={{ mt: 2 }}
            >
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 2 }}>
          Volver a Mesa de Entrada
        </Button>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Nuevo Registro
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Complete el formulario con la información requerida. Los campos marcados con * son obligatorios.
        </Typography>
      </Box>

      {/* Draft Modal */}
      <Dialog
        open={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        aria-labelledby="draft-dialog-title"
        aria-describedby="draft-dialog-description"
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2, px: 1 },
        }}
      >
        <DialogTitle id="draft-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Borrador encontrado
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="draft-dialog-description" sx={{ mb: 2 }}>
            Se ha encontrado un borrador guardado anteriormente. ¿Desea continuar con el borrador o comenzar un nuevo
            registro?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClearDraft} color="error" variant="outlined" startIcon={<Delete />}>
            Comenzar nuevo
          </Button>
          <Button onClick={handleLoadDraft} color="primary" variant="contained" startIcon={<Save />} autoFocus>
            Continuar borrador
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading ? (
        <Card sx={{ p: 4, mb: 4 }}>
          <Box sx={{ width: "100%", mb: 4 }}>
            <LinearProgress />
          </Box>
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            Cargando formulario...
          </Typography>
        </Card>
      ) : mutation.isPending ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6">Procesando su solicitud</Typography>
          <Typography variant="body2" color="text.secondary">
            Esto puede tomar unos momentos...
          </Typography>
        </Card>
      ) : (
        <Fade in={!isLoading} timeout={500}>
          <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <CardContent sx={{ p: 0 }}>
              <MultiStepForm
                key={formKey}
                onSubmit={handleSubmit}
                initialData={formData || undefined}
                readOnly={false}
                form={formId} // Pass the formId to MultiStepForm for draft saving
              />
            </CardContent>
          </Card>
        </Fade>
      )}
    </Container>
  )
}

export default Home
