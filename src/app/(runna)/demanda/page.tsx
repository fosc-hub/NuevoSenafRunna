"use client"

import { useState, useEffect } from "react"
import { CircularProgress, Typography, Modal, IconButton, Box } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
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
  const [isOpen, setIsOpen] = useState(true)

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

  const handleClose = () => {
    setIsOpen(false)
    // You might want to add navigation logic here, e.g., redirect to a list page
  }

  if (isLoading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Modal
      open={isOpen}
      onClose={() => {}} // This empty function prevents closing on outside click
      aria-labelledby="demanda-detail-modal"
      aria-describedby="demanda-detail-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom id="demanda-detail-modal" color="black">
          Detalle de la Demanda
        </Typography>
        {formData && (
          <MultiStepForm
            initialData={formData}
            onSubmit={handleSubmit}
            readOnly={false} // Set to true if you want the form to be read-only initially
          />
        )}
      </Box>
    </Modal>
  )
}

