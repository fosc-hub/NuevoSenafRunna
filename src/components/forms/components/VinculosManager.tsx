"use client"

import React, { useState } from "react"
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Divider,
  useTheme,
  alpha,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkIcon from "@mui/icons-material/Link"
import { useFormContext } from "react-hook-form"
import type { FormData, DropdownData, VinculoFormData } from "../types/formTypes"
import LegajoSearchAutocomplete, {
  type LegajoOption,
} from "@/app/(runna)/demanda/ui/components/LegajoSearchAutocomplete"
import { MIN_CARACTERES_JUSTIFICACION_VINCULO } from "@/app/(runna)/legajo-mesa/types/vinculo-types"

interface VinculosManagerProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

export default function VinculosManager({ dropdownData, readOnly = false }: VinculosManagerProps) {
  const theme = useTheme()
  const { watch, setValue } = useFormContext<FormData>()

  const vinculos = watch("vinculos") || []
  const [expandedVinculos, setExpandedVinculos] = useState<Set<number>>(new Set())

  // Validation errors per vinculo
  const [vinculoErrors, setVinculoErrors] = useState<Record<number, {
    legajo?: string
    medida?: string
    tipo_vinculo?: string
    justificacion?: string
  }>>({})

  const handleAddVinculo = () => {
    const newVinculo: VinculoFormData = {
      legajo: null,
      medida: null,
      tipo_vinculo: null,
      justificacion: "",
    }

    setValue("vinculos", [...vinculos, newVinculo])
  }

  const handleRemoveVinculo = (index: number) => {
    const newVinculos = vinculos.filter((_, i) => i !== index)
    setValue("vinculos", newVinculos)

    // Clear errors for this vinculo
    const newErrors = { ...vinculoErrors }
    delete newErrors[index]
    setVinculoErrors(newErrors)
  }

  const handleUpdateVinculo = (index: number, field: keyof VinculoFormData, value: any) => {
    const newVinculos = [...vinculos]
    newVinculos[index] = {
      ...newVinculos[index],
      [field]: value,
    }
    setValue("vinculos", newVinculos)

    // Clear error for this field
    if (vinculoErrors[index]) {
      const newErrors = { ...vinculoErrors }
      const errorsCopy = { ...newErrors[index] }
      delete errorsCopy[field as keyof typeof errorsCopy]
      newErrors[index] = errorsCopy
      setVinculoErrors(newErrors)
    }
  }

  const handleLegajoSelect = (index: number, legajoOption: LegajoOption | null) => {
    const newVinculos = [...vinculos]

    if (legajoOption) {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: legajoOption.id,
        medida: null, // Reset medida when legajo changes
        legajo_info: {
          id: legajoOption.id,
          numero: legajoOption.numero,
          nnya_nombre: legajoOption.displayText, // Use displayText as name
          medidas_activas: legajoOption.medidas_activas || [],
        },
      }
    } else {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: null,
        medida: null,
        legajo_info: undefined,
      }
    }

    setValue("vinculos", newVinculos)
  }

  const validateVinculo = (vinculo: VinculoFormData, index: number): boolean => {
    const errors: typeof vinculoErrors[0] = {}

    if (!vinculo.legajo) {
      errors.legajo = "Debe seleccionar un legajo"
    }

    if (!vinculo.tipo_vinculo) {
      errors.tipo_vinculo = "Debe seleccionar un tipo de vínculo"
    }

    if (!vinculo.justificacion.trim()) {
      errors.justificacion = "La justificación es obligatoria"
    } else if (vinculo.justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO) {
      errors.justificacion = `Mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
    }

    if (Object.keys(errors).length > 0) {
      setVinculoErrors((prev) => ({ ...prev, [index]: errors }))
      return false
    }

    return true
  }

  const validateAllVinculos = (): boolean => {
    if (vinculos.length === 0) return true // No vinculos is valid

    let allValid = true
    vinculos.forEach((vinculo, index) => {
      if (!validateVinculo(vinculo, index)) {
        allValid = false
      }
    })

    return allValid
  }

  if (readOnly && vinculos.length === 0) {
    return null
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon color="primary" />
          Vínculos con Legajos y Medidas
        </Typography>

        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddVinculo}
            size="small"
          >
            Agregar Vínculo
          </Button>
        )}
      </Box>

      {vinculos.length === 0 && !readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Puede agregar vínculos durante el registro de la demanda. Los vínculos permiten relacionar
            esta demanda con legajos y medidas existentes.
          </Typography>
        </Alert>
      )}

      {vinculos.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {vinculos.map((vinculo, index) => {
            const errors = vinculoErrors[index] || {}

            return (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Vínculo #{index + 1}
                    </Typography>

                    {!readOnly && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVinculo(index)}
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Fields */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Legajo Search */}
                    <LegajoSearchAutocomplete
                      value={vinculo.legajo_info ? ({
                        id: vinculo.legajo_info.id,
                        numero: vinculo.legajo_info.numero,
                        displayText: vinculo.legajo_info.nnya_nombre,
                        subtitle: `Legajo ${vinculo.legajo_info.numero}`,
                        medidas_activas: vinculo.legajo_info.medidas_activas,
                      } as LegajoOption) : null}
                      onChange={(value) => handleLegajoSelect(index, value)}
                      label="Legajo *"
                      placeholder="Buscar legajo por número o nombre del NNyA..."
                      error={Boolean(errors.legajo)}
                      helperText={errors.legajo}
                      disabled={readOnly}
                    />

                    {/* Medida Selector */}
                    {vinculo.legajo && vinculo.legajo_info && (
                      <TextField
                        select
                        fullWidth
                        label="Medida (Opcional)"
                        value={vinculo.medida || ""}
                        onChange={(e) =>
                          handleUpdateVinculo(index, "medida", e.target.value ? Number(e.target.value) : null)
                        }
                        error={Boolean(errors.medida)}
                        helperText={
                          errors.medida ||
                          (vinculo.legajo_info.medidas_activas.length === 0
                            ? "Este legajo no tiene medidas activas"
                            : "Seleccione una medida específica (opcional)")
                        }
                        disabled={
                          readOnly ||
                          !vinculo.legajo_info.medidas_activas ||
                          vinculo.legajo_info.medidas_activas.length === 0
                        }
                      >
                        <MenuItem value="">
                          <em>Sin medida específica</em>
                        </MenuItem>
                        {vinculo.legajo_info.medidas_activas.map((medida) => (
                          <MenuItem key={medida.id} value={medida.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {medida.numero_medida} - {medida.tipo_medida}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Estado: {medida.estado_vigencia}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Tipo de Vínculo */}
                    <TextField
                      select
                      fullWidth
                      required
                      label="Tipo de Vínculo *"
                      value={vinculo.tipo_vinculo || ""}
                      onChange={(e) =>
                        handleUpdateVinculo(index, "tipo_vinculo", e.target.value ? Number(e.target.value) : null)
                      }
                      error={Boolean(errors.tipo_vinculo)}
                      helperText={errors.tipo_vinculo}
                      disabled={readOnly || !dropdownData.tipos_vinculo || dropdownData.tipos_vinculo.length === 0}
                    >
                      {dropdownData.tipos_vinculo?.map((tipo) => (
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
                      ))}
                    </TextField>

                    {/* Justificación */}
                    <Box>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={readOnly ? 2 : 4}
                        label="Justificación *"
                        placeholder={`Explique el motivo de esta vinculación (mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres)...`}
                        value={vinculo.justificacion}
                        onChange={(e) => handleUpdateVinculo(index, "justificacion", e.target.value)}
                        error={Boolean(errors.justificacion)}
                        helperText={errors.justificacion}
                        disabled={readOnly}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                          },
                        }}
                      />

                      {!readOnly && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography
                            variant="caption"
                            color={
                              vinculo.justificacion.length >= MIN_CARACTERES_JUSTIFICACION_VINCULO
                                ? "success.main"
                                : "text.secondary"
                            }
                          >
                            {vinculo.justificacion.length} / {MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres
                          </Typography>
                          {vinculo.justificacion.length < MIN_CARACTERES_JUSTIFICACION_VINCULO && (
                            <Typography variant="caption" color="warning.main">
                              Faltan{" "}
                              {Math.max(0, MIN_CARACTERES_JUSTIFICACION_VINCULO - vinculo.justificacion.length)}{" "}
                              caracteres
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Summary chips (read-only mode) */}
                    {readOnly && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {vinculo.legajo_info && (
                          <Chip
                            label={`Legajo: ${vinculo.legajo_info.numero}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {vinculo.medida && (
                          <Chip
                            label={`Medida: ${vinculo.medida}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Global validation warning */}
      {!readOnly && vinculos.length > 0 && Object.keys(vinculoErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Por favor, complete todos los campos obligatorios en los vínculos antes de enviar el formulario.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
