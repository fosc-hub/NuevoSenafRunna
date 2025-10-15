"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material"
import { createMedida } from "@/app/(runna)/legajo-mesa/api/medidas-api-service"
import type { CreateMedidaRequest, TipoMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

interface CrearMedidaDialogProps {
  open: boolean
  legajoId: number
  onClose: () => void
  onSuccess: () => void
}

export const CrearMedidaDialog: React.FC<CrearMedidaDialogProps> = ({
  open,
  legajoId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateMedidaRequest>({
    tipo_medida: "MPI",
    juzgado: null,
    nro_sac: null,
    urgencia: null,
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof CreateMedidaRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value

    // Handle different field types
    if (field === "tipo_medida") {
      setFormData((prev) => ({
        ...prev,
        [field]: value as TipoMedida,
      }))
    } else if (field === "juzgado" || field === "urgencia") {
      // Convert to number or null
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? null : Number(value),
      }))
    } else {
      // String fields (nro_sac)
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? null : value,
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsCreating(true)
      setError(null)

      // Validate required fields
      if (!formData.tipo_medida) {
        setError("El tipo de medida es obligatorio")
        return
      }

      // Call API to create medida
      const createdMedida = await createMedida(legajoId, formData)

      console.log("Medida created successfully:", createdMedida)

      // Reset form and close dialog
      setFormData({
        tipo_medida: "MPI",
        juzgado: null,
        nro_sac: null,
        urgencia: null,
      })

      // Notify parent component of success
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error creating medida:", err)

      // Extract error message from API response
      if (err?.response?.data) {
        const apiErrors = err.response.data
        // Try to extract meaningful error messages
        if (typeof apiErrors === "object") {
          const errorMessages = Object.entries(apiErrors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`
              }
              return `${field}: ${messages}`
            })
            .join("; ")
          setError(`Error al crear la medida: ${errorMessages}`)
        } else {
          setError(String(apiErrors))
        }
      } else if (err instanceof Error) {
        setError(`Error al crear la medida: ${err.message}`)
      } else {
        setError("Error al crear la medida. Por favor, intente nuevamente.")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      // Reset form on close
      setFormData({
        tipo_medida: "MPI",
        juzgado: null,
        nro_sac: null,
        urgencia: null,
      })
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tomar Medida de Protección</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Complete los datos para registrar una nueva medida de protección para este legajo.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Tipo de Medida */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Tipo de Medida"
                value={formData.tipo_medida}
                onChange={handleChange("tipo_medida")}
                required
                helperText="Seleccione el tipo de medida de protección"
              >
                <MenuItem value="MPI">MPI - Medida de Protección Integral</MenuItem>
                <MenuItem value="MPE">MPE - Medida de Protección Excepcional</MenuItem>
                <MenuItem value="MPJ">MPJ - Medida Penal Juvenil</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Datos adicionales (opcionales)
              </Typography>
            </Grid>

            {/* Juzgado ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="ID Juzgado"
                value={formData.juzgado ?? ""}
                onChange={handleChange("juzgado")}
                helperText="ID del juzgado que interviene (opcional para MPI)"
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>

            {/* Urgencia ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="ID Urgencia"
                value={formData.urgencia ?? ""}
                onChange={handleChange("urgencia")}
                helperText="ID del nivel de urgencia"
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>

            {/* Número SAC */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número SAC"
                value={formData.nro_sac ?? ""}
                onChange={handleChange("nro_sac")}
                helperText="Número del Sistema de Administración de Causas (máx. 50 caracteres)"
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCreating}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCreating}
          startIcon={isCreating ? <CircularProgress size={20} /> : null}
        >
          {isCreating ? "Creando..." : "Crear Medida"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
