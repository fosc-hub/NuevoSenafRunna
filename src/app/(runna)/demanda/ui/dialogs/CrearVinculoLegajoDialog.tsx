"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import LinkIcon from "@mui/icons-material/Link"
import { useVinculos } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useVinculos"
import {
  MIN_CARACTERES_JUSTIFICACION_VINCULO,
  type TVinculoLegajoCreate,
} from "@/app/(runna)/legajo-mesa/types/vinculo-types"
import LegajoSearchAutocomplete, {
  type LegajoOption,
  type MedidaActiva
} from "../components/LegajoSearchAutocomplete"

interface CrearVinculoLegajoDialogProps {
  open: boolean
  onClose: () => void
  demandaId: number
  onVinculoCreated?: () => void
}

export default function CrearVinculoLegajoDialog({
  open,
  onClose,
  demandaId,
  onVinculoCreated,
}: CrearVinculoLegajoDialogProps) {
  const theme = useTheme()
  const { tiposVinculo, loadTiposVinculo, crearVinculo, loading, error, clearError } = useVinculos()

  // Form state
  const [tipoVinculoId, setTipoVinculoId] = useState<number | null>(null)
  const [selectedLegajo, setSelectedLegajo] = useState<LegajoOption | null>(null)
  const [selectedMedida, setSelectedMedida] = useState<MedidaActiva | null>(null)
  const [justificacion, setJustificacion] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<{
    tipoVinculo?: string
    legajo?: string
    medida?: string
    justificacion?: string
  }>({})

  // Load tipos vinculo on mount
  useEffect(() => {
    if (open && tiposVinculo.length === 0) {
      loadTiposVinculo()
    }
  }, [open, tiposVinculo.length, loadTiposVinculo])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTipoVinculoId(null)
      setSelectedLegajo(null)
      setSelectedMedida(null)
      setJustificacion("")
      setErrors({})
      clearError()
    }
  }, [open, clearError])

  // Reset medida when legajo changes
  useEffect(() => {
    setSelectedMedida(null)
    setErrors((prev) => ({ ...prev, medida: undefined }))
  }, [selectedLegajo])

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!tipoVinculoId) {
      newErrors.tipoVinculo = "Debe seleccionar un tipo de vínculo"
    }

    if (!selectedLegajo) {
      newErrors.legajo = "Debe seleccionar un legajo para vincular"
    }

    if (!selectedMedida) {
      newErrors.medida = "Debe seleccionar una medida del legajo"
    }

    if (!justificacion.trim()) {
      newErrors.justificacion = "La justificación es obligatoria"
    } else if (justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO) {
      newErrors.justificacion = `La justificación debe tener al menos ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!selectedLegajo || !selectedMedida || !tipoVinculoId) {
      return
    }

    // For CARGA_OFICIOS workflow, we create TWO separate vinculos:
    // 1. LEGAJO → MEDIDA (for backend signal to create PLTM activities)
    // 2. LEGAJO → DEMANDA (for UI display in Conexiones tab)

    // Vínculo 1: LEGAJO → MEDIDA
    const vinculoMedida: TVinculoLegajoCreate = {
      legajo_origen: selectedLegajo.id,
      medida_destino: selectedMedida.id,
      tipo_vinculo: tipoVinculoId,
      justificacion: `[MEDIDA: ${selectedMedida.numero_medida}] ${justificacion.trim()}`,
    }

    const resultMedida = await crearVinculo(vinculoMedida)

    if (!resultMedida) {
      // Error creating medida vinculo - stop here
      return
    }

    // Vínculo 2: LEGAJO → DEMANDA
    const vinculoDemanda: TVinculoLegajoCreate = {
      legajo_origen: selectedLegajo.id,
      demanda_destino: demandaId,
      tipo_vinculo: tipoVinculoId,
      justificacion: `[DEMANDA→MEDIDA: ${selectedMedida.numero_medida}] ${justificacion.trim()}`,
    }

    const resultDemanda = await crearVinculo(vinculoDemanda)

    if (resultDemanda) {
      // Success - both vinculos created
      onClose()
      if (onVinculoCreated) {
        onVinculoCreated()
      }
    }
    // Error handling is done by the hook and displayed in the dialog
  }

  const handleCancel = () => {
    onClose()
  }

  const caracteresFaltantes = Math.max(0, MIN_CARACTERES_JUSTIFICACION_VINCULO - justificacion.length)
  const isJustificacionValid = justificacion.length >= MIN_CARACTERES_JUSTIFICACION_VINCULO

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkIcon color="primary" />
            <Typography variant="h6">Vincular Demanda a Medida</Typography>
          </Box>
          <IconButton
            aria-label="cerrar"
            onClick={handleCancel}
            size="small"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Workflow CARGA_OFICIOS:</strong> Se crearán DOS vínculos automáticamente:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ ml: 2, mb: 0 }}>
              <li><strong>LEGAJO → MEDIDA:</strong> Para que el backend cree actividades PLTM en la medida seleccionada</li>
              <li><strong>LEGAJO → DEMANDA:</strong> Para visualizar la conexión en esta pestaña</li>
            </Typography>
          </Alert>

          {/* Tipo de Vínculo Selector */}
          <TextField
            select
            fullWidth
            required
            label="Tipo de Vínculo"
            value={tipoVinculoId || ""}
            onChange={(e) => {
              setTipoVinculoId(Number(e.target.value) || null)
              setErrors((prev) => ({ ...prev, tipoVinculo: undefined }))
            }}
            error={Boolean(errors.tipoVinculo)}
            helperText={errors.tipoVinculo}
            disabled={loading || tiposVinculo.length === 0}
          >
            {tiposVinculo.length === 0 ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Cargando tipos de vínculo...
              </MenuItem>
            ) : (
              tiposVinculo.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {tipo.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tipo.descripcion}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>

          {/* Legajo Search */}
          <LegajoSearchAutocomplete
            value={selectedLegajo}
            onChange={(value) => {
              setSelectedLegajo(value)
              setErrors((prev) => ({ ...prev, legajo: undefined }))
            }}
            label="Legajo a Vincular *"
            placeholder="Buscar por número de legajo o nombre del NNyA..."
            error={Boolean(errors.legajo)}
            helperText={errors.legajo || "Busque el legajo que desea vincular a esta demanda"}
            disabled={loading}
          />

          {/* Medida Selector - Only show when legajo is selected */}
          {selectedLegajo && (
            <TextField
              select
              fullWidth
              required
              label="Medida del Legajo *"
              value={selectedMedida?.id || ""}
              onChange={(e) => {
                const medidaId = Number(e.target.value)
                const medida = selectedLegajo.medidas_activas?.find(m => m.id === medidaId)
                setSelectedMedida(medida || null)
                setErrors((prev) => ({ ...prev, medida: undefined }))
              }}
              error={Boolean(errors.medida)}
              helperText={
                errors.medida ||
                (selectedLegajo.medidas_activas?.length === 0
                  ? "Este legajo no tiene medidas activas"
                  : "Seleccione la medida específica donde se cargará el oficio")
              }
              disabled={loading || !selectedLegajo.medidas_activas || selectedLegajo.medidas_activas.length === 0}
            >
              {selectedLegajo.medidas_activas && selectedLegajo.medidas_activas.length > 0 ? (
                selectedLegajo.medidas_activas.map((medida) => (
                  <MenuItem key={medida.id} value={medida.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {medida.numero_medida} - {medida.tipo_medida}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estado: {medida.estado_vigencia}
                        {medida.etapa_actual__nombre && ` • Etapa: ${medida.etapa_actual__nombre}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  No hay medidas activas disponibles
                </MenuItem>
              )}
            </TextField>
          )}

          {/* Justificación */}
          <Box>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Justificación"
              placeholder={`Explique detalladamente el motivo de esta vinculación (mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres)...`}
              value={justificacion}
              onChange={(e) => {
                setJustificacion(e.target.value)
                setErrors((prev) => ({ ...prev, justificacion: undefined }))
              }}
              error={Boolean(errors.justificacion)}
              helperText={errors.justificacion}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography
                variant="caption"
                color={isJustificacionValid ? "success.main" : "text.secondary"}
              >
                {justificacion.length} / {MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres
              </Typography>
              {!isJustificacionValid && caracteresFaltantes > 0 && (
                <Typography variant="caption" color="warning.main">
                  Faltan {caracteresFaltantes} caracteres
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
        >
          {loading ? "Creando..." : "Crear Vínculo"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
