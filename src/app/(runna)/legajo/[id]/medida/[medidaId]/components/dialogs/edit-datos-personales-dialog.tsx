"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
} from "@mui/material"
import type { PersonaDetailData } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface EditDatosPersonalesDialogProps {
  open: boolean
  persona: PersonaDetailData | null
  onClose: () => void
  onSave: (updatedPersona: Partial<PersonaDetailData>) => Promise<void>
}

export const EditDatosPersonalesDialog: React.FC<EditDatosPersonalesDialogProps> = ({
  open,
  persona,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<PersonaDetailData>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (persona) {
      setFormData({
        nombre: persona.nombre || "",
        nombre_autopercibido: persona.nombre_autopercibido || "",
        apellido: persona.apellido || "",
        fecha_nacimiento: persona.fecha_nacimiento || "",
        nacionalidad: persona.nacionalidad || "",
        dni: persona.dni || null,
        situacion_dni: persona.situacion_dni || "",
        genero: persona.genero || "",
        telefono: persona.telefono || null,
        observaciones: persona.observaciones || "",
      })
    }
  }, [persona])

  const handleChange = (field: keyof PersonaDetailData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error("Error saving datos personales:", err)
      setError(err instanceof Error ? err.message : "Error al guardar los datos")
    } finally {
      setIsSaving(false)
    }
  }

  if (!persona) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Datos Personales</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Nombre */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre || ""}
                onChange={handleChange("nombre")}
                required
              />
            </Grid>

            {/* Apellido */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.apellido || ""}
                onChange={handleChange("apellido")}
                required
              />
            </Grid>

            {/* Nombre Autopercibido */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Autopercibido"
                value={formData.nombre_autopercibido || ""}
                onChange={handleChange("nombre_autopercibido")}
              />
            </Grid>

            {/* DNI */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DNI"
                type="number"
                value={formData.dni || ""}
                onChange={handleChange("dni")}
              />
            </Grid>

            {/* Situación DNI */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Situación DNI"
                value={formData.situacion_dni || ""}
                onChange={handleChange("situacion_dni")}
              >
                <MenuItem value="VALIDO">Válido</MenuItem>
                <MenuItem value="EN_TRAMITE">En trámite</MenuItem>
                <MenuItem value="EXTRAVIADO">Extraviado</MenuItem>
                <MenuItem value="SIN_DNI">Sin DNI</MenuItem>
              </TextField>
            </Grid>

            {/* Fecha de Nacimiento */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ""}
                onChange={handleChange("fecha_nacimiento")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Género */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Género"
                value={formData.genero || ""}
                onChange={handleChange("genero")}
              >
                <MenuItem value="MASCULINO">Masculino</MenuItem>
                <MenuItem value="FEMENINO">Femenino</MenuItem>
                <MenuItem value="NO_BINARIO">No Binario</MenuItem>
                <MenuItem value="OTRO">Otro</MenuItem>
              </TextField>
            </Grid>

            {/* Nacionalidad */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Nacionalidad"
                value={formData.nacionalidad || ""}
                onChange={handleChange("nacionalidad")}
              >
                <MenuItem value="ARGENTINA">Argentina</MenuItem>
                <MenuItem value="BOLIVIANA">Boliviana</MenuItem>
                <MenuItem value="BRASILEÑA">Brasileña</MenuItem>
                <MenuItem value="CHILENA">Chilena</MenuItem>
                <MenuItem value="PARAGUAYA">Paraguaya</MenuItem>
                <MenuItem value="PERUANA">Peruana</MenuItem>
                <MenuItem value="URUGUAYA">Uruguaya</MenuItem>
                <MenuItem value="VENEZOLANA">Venezolana</MenuItem>
                <MenuItem value="OTRA">Otra</MenuItem>
              </TextField>
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                type="tel"
                value={formData.telefono || ""}
                onChange={handleChange("telefono")}
              />
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observaciones"
                value={formData.observaciones || ""}
                onChange={handleChange("observaciones")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : null}>
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
