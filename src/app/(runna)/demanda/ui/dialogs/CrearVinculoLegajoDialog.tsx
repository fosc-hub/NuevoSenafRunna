"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material"
import LinkIcon from "@mui/icons-material/Link"
import BaseDialog from "@/components/shared/BaseDialog"
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

// Workflow types
type VinculoWorkflowType = "demanda-only" | "medida-required"

export default function CrearVinculoLegajoDialog({
  open,
  onClose,
  demandaId,
  onVinculoCreated,
}: CrearVinculoLegajoDialogProps) {
  const theme = useTheme()
  const { tiposVinculo, loadTiposVinculo, crearVinculo, loading, error, clearError } = useVinculos()

  // Form state
  const [workflowType, setWorkflowType] = useState<VinculoWorkflowType>("demanda-only")
  const [tipoVinculoId, setTipoVinculoId] = useState<number | null>(null)
  const [selectedLegajo, setSelectedLegajo] = useState<LegajoOption | null>(null)
  const [selectedMedida, setSelectedMedida] = useState<MedidaActiva | null>(null)
  const [justificacion, setJustificacion] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<{
    workflowType?: string
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
      setWorkflowType("demanda-only")
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

    // Medida is only required for "medida-required" workflow
    if (workflowType === "medida-required" && !selectedMedida) {
      newErrors.medida = "Debe seleccionar una medida del legajo para este tipo de vínculo"
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

    if (!selectedLegajo || !tipoVinculoId) {
      return
    }

    if (workflowType === "medida-required") {
      // WORKFLOW: MEDIDA-REQUIRED (CARGA_OFICIOS)
      // Create TWO separate vinculos:
      // 1. LEGAJO → MEDIDA (for backend signal to create PLTM activities)
      // 2. LEGAJO → DEMANDA (for UI display in Conexiones tab)

      if (!selectedMedida) {
        return
      }

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
    } else {
      // WORKFLOW: DEMANDA-ONLY (Direct legajo-demanda connection)
      // Create single vinculo: LEGAJO → DEMANDA

      const vinculoDemanda: TVinculoLegajoCreate = {
        legajo_origen: selectedLegajo.id,
        demanda_destino: demandaId,
        tipo_vinculo: tipoVinculoId,
        justificacion: justificacion.trim(),
      }

      const result = await crearVinculo(vinculoDemanda)

      if (result) {
        // Success
        onClose()
        if (onVinculoCreated) {
          onVinculoCreated()
        }
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
    <BaseDialog
      open={open}
      onClose={handleCancel}
      title="Crear Vínculo de Legajo"
      titleIcon={<LinkIcon color="primary" />}
      error={error}
      loading={loading}
      loadingMessage="Creando..."
      maxWidth="sm"
      fullWidth
      actions={[
        {
          label: "Cancelar",
          onClick: handleCancel,
          disabled: loading,
          color: "inherit",
        },
        {
          label: loading ? "Creando..." : "Crear Vínculo",
          onClick: handleSubmit,
          variant: "contained",
          disabled: loading,
          startIcon: <LinkIcon />,
          loading: loading,
        },
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Workflow Type Selector */}
        <TextField
            select
            fullWidth
            required
            label="Tipo de Vinculación"
            value={workflowType}
            onChange={(e) => {
              setWorkflowType(e.target.value as VinculoWorkflowType)
              setErrors((prev) => ({ ...prev, workflowType: undefined }))
            }}
            error={Boolean(errors.workflowType)}
            helperText={errors.workflowType || "Seleccione el tipo de vinculación que desea realizar"}
            disabled={loading}
          >
            <MenuItem value="demanda-only">
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Vinculación Directa (Legajo → Demanda)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conecta un legajo existente con esta demanda sin medida específica
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="medida-required">
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Vinculación con Medida (CARGA_OFICIOS)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conecta demanda a una medida específica y crea actividades PLTM automáticamente
                </Typography>
              </Box>
            </MenuItem>
          </TextField>

          {/* Info Alert - conditional based on workflow type */}
          {workflowType === "medida-required" && (
            <Alert severity="info">
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Workflow CARGA_OFICIOS:</strong> Se crearán DOS vínculos automáticamente:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ ml: 2, mb: 0 }}>
                <li><strong>LEGAJO → MEDIDA:</strong> Para que el backend cree actividades PLTM en la medida seleccionada</li>
                <li><strong>LEGAJO → DEMANDA:</strong> Para visualizar la conexión en esta pestaña</li>
              </Typography>
            </Alert>
          )}

          {workflowType === "demanda-only" && (
            <Alert severity="info">
              <Typography variant="body2">
                Se creará un vínculo directo: <strong>LEGAJO → DEMANDA</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Útil para vincular legajos relacionados (hermanos, mismo caso judicial) sin medida específica.
              </Typography>
            </Alert>
          )}

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

          {/* Medida Selector - Only show when legajo is selected AND workflow requires medida */}
          {selectedLegajo && workflowType === "medida-required" && (
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
    </BaseDialog>
  )
}
