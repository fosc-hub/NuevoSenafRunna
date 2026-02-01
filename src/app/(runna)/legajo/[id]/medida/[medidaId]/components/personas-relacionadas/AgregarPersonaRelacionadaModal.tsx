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
  FormLabel,
  RadioGroup,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Autocomplete,
  Divider,
  Grid,
} from "@mui/material"
import { PersonAdd as PersonAddIcon } from "@mui/icons-material"
import {
  useAddPersonaRelacionadaExistente,
  useAddPersonaRelacionadaNueva,
  useTiposVinculoPersona,
  useSearchPersonasRelacionadas,
} from "../../hooks/usePersonasRelacionadas"
import { validateCanAddPersonaRelacionada } from "../../api/personas-relacionadas-api-service"
import {
  OCUPACION_OPTIONS,
  validatePersonaRelacionadaCreate,
  type PersonaVinculo,
  type PersonaRelacionadaCreateExistente,
  type PersonaRelacionadaCreateNueva,
  type Ocupacion,
} from "../../types/personas-relacionadas-api"

interface AgregarPersonaRelacionadaModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  legajoId: number
  nnyaId: number
  existingRelaciones: PersonaVinculo[]
}

type FormMode = "existente" | "nueva"

interface FormState {
  mode: FormMode
  // Existing persona
  persona_existente_id: number | null
  personaSearchTerm: string
  selectedPersona: any | null
  // New persona data
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string
  genero: string
  telefono: string
  adulto: boolean
  // Common fields
  tipo_vinculo: number | null
  conviviente: boolean
  legalmente_responsable: boolean
  ocupacion: Ocupacion | null
  es_referente_principal: boolean
  observaciones: string
}

const initialFormState: FormState = {
  mode: "existente",
  persona_existente_id: null,
  personaSearchTerm: "",
  selectedPersona: null,
  nombre: "",
  apellido: "",
  dni: "",
  fecha_nacimiento: "",
  genero: "",
  telefono: "",
  adulto: true,
  tipo_vinculo: null,
  conviviente: false,
  legalmente_responsable: false,
  ocupacion: null,
  es_referente_principal: false,
  observaciones: "",
}

export default function AgregarPersonaRelacionadaModal({
  open,
  onClose,
  onSuccess,
  legajoId,
  nnyaId,
  existingRelaciones,
}: AgregarPersonaRelacionadaModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const { data: tiposVinculo, isLoading: loadingTipos } = useTiposVinculoPersona()
  const { data: searchResults, isLoading: searching } = useSearchPersonasRelacionadas(
    form.personaSearchTerm
  )

  const addExistenteMutation = useAddPersonaRelacionadaExistente(legajoId)
  const addNuevaMutation = useAddPersonaRelacionadaNueva(legajoId)

  const isPending = addExistenteMutation.isPending || addNuevaMutation.isPending

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm(initialFormState)
      setErrors([])
      setValidationError(null)
    }
  }, [open])

  // Validate selected persona
  useEffect(() => {
    if (form.persona_existente_id) {
      const error = validateCanAddPersonaRelacionada(
        form.persona_existente_id,
        existingRelaciones,
        nnyaId
      )
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [form.persona_existente_id, existingRelaciones, nnyaId])

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...initialFormState,
      mode: event.target.value as FormMode,
      tipo_vinculo: form.tipo_vinculo,
    })
    setErrors([])
    setValidationError(null)
  }

  const handlePersonaSelect = (persona: any | null) => {
    setForm((prev) => ({
      ...prev,
      selectedPersona: persona,
      persona_existente_id: persona?.id || null,
    }))
  }

  const handleSubmit = async () => {
    setErrors([])

    if (form.mode === "existente") {
      if (!form.persona_existente_id) {
        setErrors(["Debe seleccionar una persona"])
        return
      }
      if (validationError) {
        setErrors([validationError])
        return
      }
      if (!form.tipo_vinculo) {
        setErrors(["El tipo de vinculo es obligatorio"])
        return
      }

      const data: PersonaRelacionadaCreateExistente = {
        persona_existente_id: form.persona_existente_id,
        tipo_vinculo: form.tipo_vinculo,
        conviviente: form.conviviente,
        legalmente_responsable: form.legalmente_responsable,
        ocupacion: form.ocupacion || undefined,
        es_referente_principal: form.es_referente_principal,
        observaciones: form.observaciones || undefined,
      }

      const validationErrors = validatePersonaRelacionadaCreate(data)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      try {
        await addExistenteMutation.mutateAsync(data)
        onSuccess()
      } catch (err) {
        console.error("Error adding existente:", err)
      }
    } else {
      // Nueva persona
      if (!form.nombre.trim()) {
        setErrors(["El nombre es obligatorio"])
        return
      }
      if (!form.apellido.trim()) {
        setErrors(["El apellido es obligatorio"])
        return
      }
      if (!form.tipo_vinculo) {
        setErrors(["El tipo de vinculo es obligatorio"])
        return
      }

      const data: PersonaRelacionadaCreateNueva = {
        persona_datos: {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          dni: form.dni ? parseInt(form.dni, 10) : undefined,
          fecha_nacimiento: form.fecha_nacimiento || undefined,
          genero: form.genero || undefined,
          adulto: form.adulto,
          nnya: !form.adulto,
          telefono: form.telefono || undefined,
        },
        tipo_vinculo: form.tipo_vinculo,
        conviviente: form.conviviente,
        legalmente_responsable: form.legalmente_responsable,
        ocupacion: form.ocupacion || undefined,
        es_referente_principal: form.es_referente_principal,
        observaciones: form.observaciones || undefined,
      }

      try {
        await addNuevaMutation.mutateAsync(data)
        onSuccess()
      } catch (err) {
        console.error("Error adding nueva:", err)
      }
    }
  }

  const handleClose = () => {
    if (isPending) return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6">Agregar Persona Relacionada</Typography>
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

        {/* Mode Selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Tipo de persona</FormLabel>
          <RadioGroup row value={form.mode} onChange={handleModeChange}>
            <FormControlLabel
              value="existente"
              control={<Radio />}
              label="Buscar persona existente"
            />
            <FormControlLabel
              value="nueva"
              control={<Radio />}
              label="Crear nueva persona"
            />
          </RadioGroup>
        </FormControl>

        {form.mode === "existente" ? (
          /* Existing Persona Search */
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              value={form.selectedPersona}
              onChange={(_, newValue) => handlePersonaSelect(newValue)}
              inputValue={form.personaSearchTerm}
              onInputChange={(_, newInputValue) =>
                setForm((prev) => ({ ...prev, personaSearchTerm: newInputValue }))
              }
              options={searchResults || []}
              loading={searching}
              getOptionLabel={(option) =>
                `${option.nombre} ${option.apellido}${option.dni ? ` - DNI: ${option.dni}` : ""}`
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar persona por nombre o DNI"
                  placeholder="Escriba al menos 2 caracteres..."
                  error={!!validationError}
                  helperText={validationError}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searching ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">
                      {option.nombre} {option.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DNI: {option.dni || "Sin DNI"} |{" "}
                      {option.adulto ? "Adulto" : "NNyA"}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText={
                form.personaSearchTerm.length < 2
                  ? "Escriba al menos 2 caracteres"
                  : "No se encontraron resultados"
              }
              fullWidth
            />
          </Box>
        ) : (
          /* New Persona Form */
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Datos de la nueva persona
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre *"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido *"
                  value={form.apellido}
                  onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="DNI"
                  value={form.dni}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dni: e.target.value.replace(/\D/g, "") }))
                  }
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 8 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fecha_nacimiento: e.target.value }))
                  }
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Genero</InputLabel>
                  <Select
                    value={form.genero}
                    label="Genero"
                    onChange={(e) => setForm((prev) => ({ ...prev, genero: e.target.value }))}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefono"
                  value={form.telefono}
                  onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.adulto}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, adulto: e.target.checked }))
                      }
                    />
                  }
                  label="Es adulto (mayor de 18 anos)"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Common Fields */}
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
          Datos del vinculo
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Ocupacion</InputLabel>
              <Select
                value={form.ocupacion || ""}
                label="Ocupacion"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ocupacion: (e.target.value || null) as Ocupacion | null }))
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
                    setForm((prev) => ({ ...prev, legalmente_responsable: e.target.checked }))
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
                    setForm((prev) => ({ ...prev, es_referente_principal: e.target.checked }))
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
              onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        {form.es_referente_principal && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Solo puede haber un referente principal activo por NNyA. Si ya existe uno, se
            desmarcara automaticamente.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || (form.mode === "existente" && !form.persona_existente_id)}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
        >
          {isPending ? "Guardando..." : "Agregar Persona"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
