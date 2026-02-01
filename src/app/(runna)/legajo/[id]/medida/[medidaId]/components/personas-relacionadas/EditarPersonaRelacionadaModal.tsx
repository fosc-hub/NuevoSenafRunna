"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Grid,
  Avatar,
} from "@mui/material"
import { Edit as EditIcon } from "@mui/icons-material"
import {
  useUpdatePersonaRelacionada,
  useTiposVinculoPersona,
} from "../../hooks/usePersonasRelacionadas"
import {
  OCUPACION_OPTIONS,
  type PersonaVinculo,
  type PersonaRelacionadaUpdate,
  type Ocupacion,
} from "../../types/personas-relacionadas-api"

interface EditarPersonaRelacionadaModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  legajoId: number
  persona: PersonaVinculo
}

interface FormState {
  tipo_vinculo: number
  conviviente: boolean
  legalmente_responsable: boolean
  ocupacion: Ocupacion | null
  es_referente_principal: boolean
  observaciones: string
}

// Helper to get avatar color based on name
const getAvatarColor = (nombre: string = ""): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ]
  const index = nombre.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

// Helper to get initials
const getInitials = (nombre: string = "", apellido: string = ""): string => {
  const n = nombre?.charAt(0) || ""
  const a = apellido?.charAt(0) || ""
  return `${n}${a}`.toUpperCase() || "??"
}

export default function EditarPersonaRelacionadaModal({
  open,
  onClose,
  onSuccess,
  legajoId,
  persona,
}: EditarPersonaRelacionadaModalProps) {
  const [form, setForm] = useState<FormState>({
    tipo_vinculo: persona.tipo_vinculo,
    conviviente: persona.conviviente,
    legalmente_responsable: persona.legalmente_responsable,
    ocupacion: persona.ocupacion,
    es_referente_principal: persona.es_referente_principal,
    observaciones: persona.observaciones || "",
  })
  const [errors, setErrors] = useState<string[]>([])

  const { data: tiposVinculo, isLoading: loadingTipos } = useTiposVinculoPersona()
  const updateMutation = useUpdatePersonaRelacionada(legajoId)

  const { persona_destino_info: info } = persona

  // Reset form when persona changes
  useEffect(() => {
    if (open && persona) {
      setForm({
        tipo_vinculo: persona.tipo_vinculo,
        conviviente: persona.conviviente,
        legalmente_responsable: persona.legalmente_responsable,
        ocupacion: persona.ocupacion,
        es_referente_principal: persona.es_referente_principal,
        observaciones: persona.observaciones || "",
      })
      setErrors([])
    }
  }, [open, persona])

  const handleSubmit = async () => {
    setErrors([])

    if (!form.tipo_vinculo) {
      setErrors(["El tipo de vinculo es obligatorio"])
      return
    }

    const data: PersonaRelacionadaUpdate = {
      id: persona.id,
      tipo_vinculo: form.tipo_vinculo,
      conviviente: form.conviviente,
      legalmente_responsable: form.legalmente_responsable,
      ocupacion: form.ocupacion || undefined,
      es_referente_principal: form.es_referente_principal,
      observaciones: form.observaciones || undefined,
    }

    try {
      await updateMutation.mutateAsync(data)
      onSuccess()
    } catch (err) {
      console.error("Error updating:", err)
    }
  }

  const handleClose = () => {
    if (updateMutation.isPending) return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon color="primary" />
          <Typography variant="h6">Editar Persona Relacionada</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, idx) => (
              <Typography key={idx} variant="body2">
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Persona Info (read-only) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: getAvatarColor(info.nombre),
              width: 48,
              height: 48,
            }}
          >
            {getInitials(info.nombre, info.apellido)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {info.nombre} {info.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DNI: {info.dni || "Sin DNI"}
            </Typography>
          </Box>
        </Box>

        {/* Editable Fields */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Tipo de Vinculo *</InputLabel>
              <Select
                value={form.tipo_vinculo || ""}
                label="Tipo de Vinculo *"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tipo_vinculo: e.target.value as number }))
                }
                disabled={loadingTipos}
              >
                {tiposVinculo?.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Ocupacion</InputLabel>
              <Select
                value={form.ocupacion || ""}
                label="Ocupacion"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ocupacion: (e.target.value || null) as Ocupacion | null,
                  }))
                }
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {OCUPACION_OPTIONS.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.conviviente}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, conviviente: e.target.checked }))
                  }
                />
              }
              label="Conviviente"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.legalmente_responsable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      legalmente_responsable: e.target.checked,
                    }))
                  }
                />
              }
              label="Legalmente Responsable"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.es_referente_principal}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      es_referente_principal: e.target.checked,
                    }))
                  }
                />
              }
              label="Referente Principal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              value={form.observaciones}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, observaciones: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        {form.es_referente_principal && !persona.es_referente_principal && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Solo puede haber un referente principal activo por NNyA. Si ya existe uno, se
            desmarcara automaticamente.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={updateMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          startIcon={
            updateMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <EditIcon />
            )
          }
        >
          {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
