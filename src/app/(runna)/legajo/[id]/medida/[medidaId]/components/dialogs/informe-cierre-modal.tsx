"use client"

/**
 * Informe de Cierre Modal - MED-MPI-CIERRE
 *
 * Modal for Equipo Técnico to register closure report for MPI measures
 *
 * REFACTORED: Uses BaseDialog + useFormSubmission hook
 * Previous implementation: ~110 lines of form/submit logic
 * Current implementation: ~70 lines with hook
 * Savings: ~40 lines of duplicate boilerplate
 *
 * Features:
 * - Tipo de cese selector (required)
 * - Observaciones textarea with min 20 character validation
 * - File upload with validation
 * - Multi-step submission (create informe, upload files)
 */

import React, { useState } from "react"
import {
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AssignmentIcon from "@mui/icons-material/Assignment"
import BaseDialog from "@/components/shared/BaseDialog"
import { FileUploadSection, type FileItem } from "@/components/shared/FileUploadSection"
import { useFormSubmission } from "@/hooks"
import {
  createInformeCierre,
  uploadAdjuntoInformeCierre,
  getInformeCierreActivo,
} from "../../api/informe-cierre-api-service"
import { validateFile, getAcceptAttribute } from "../../utils/file-validation"
import type { InformeCierre, TipoCeseMPI } from "../../types/informe-cierre-api"
import { TipoCeseMPILabels } from "../../types/informe-cierre-api"

// ============================================================================
// PROPS
// ============================================================================

interface InformeCierreModalProps {
  open: boolean
  onClose: () => void
  medidaId: number
  onSuccess?: (informe: InformeCierre) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InformeCierreModal: React.FC<InformeCierreModalProps> = ({
  open,
  onClose,
  medidaId,
  onSuccess,
}) => {
  // ========== State ==========
  const [tipoCese, setTipoCese] = useState<TipoCeseMPI | "">("")
  const [observaciones, setObservaciones] = useState("")
  const [archivos, setArchivos] = useState<File[]>([])
  const [etiquetaCierre, setEtiquetaCierre] = useState<number | null>(null)

  // ========== Validation ==========
  const isObservacionesValid = observaciones.trim().length >= 20
  const isTipoCeseValid = tipoCese !== ""

  // ========== Form Submission Hook ==========
  const { submit, isLoading, error, close } = useFormSubmission<void, InformeCierre | null>({
    onSubmit: async () => {
      // Step 1: Create informe de cierre
      const informeCreado = await createInformeCierre(medidaId, {
        tipo_cese: tipoCese as TipoCeseMPI,
        observaciones: observaciones.trim(),
      })

      // Step 2: Upload adjuntos if any (con etiqueta opcional global)
      if (archivos.length > 0) {
        await Promise.all(archivos.map((archivo) =>
          uploadAdjuntoInformeCierre(
            medidaId,
            informeCreado.id,
            archivo,
            "INFORME_CIERRE",
            `Adjunto: ${archivo.name}`,
            etiquetaCierre,
          )
        ))
      }

      // Step 3: Fetch the updated informe with adjuntos
      return await getInformeCierreActivo(medidaId)
    },
    validate: () => {
      if (!isTipoCeseValid) return "Debe seleccionar un tipo de cese"
      if (!isObservacionesValid) return "Las observaciones deben tener al menos 20 caracteres"
      return undefined
    },
    showSuccessToast: false,
    showErrorToast: false, // BaseDialog handles error display
    onSuccess: (data) => {
      if (data && onSuccess) onSuccess(data)
    },
    onReset: () => {
      setTipoCese("")
      setObservaciones("")
      setArchivos([])
    },
    onClose,
  })

  // ========== File Handlers ==========
  const handleUpload = (file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      alert(validation.error || "Archivo inválido")
      return
    }
    setArchivos((prev) => [...prev, file])
  }

  const handleDelete = (id: number | string) => {
    const idx = typeof id === "string" ? Number(id.replace("file-", "")) : id
    setArchivos((prev) => prev.filter((_, i) => i !== idx))
  }

  const fileItems: FileItem[] = archivos.map((archivo, index) => ({
    id: `file-${index}`,
    nombre: archivo.name,
    tipo: archivo.type,
    tamano: archivo.size,
  }))

  const handleSubmit = () => submit({})
  const handleClose = () => close()

  // ========== Render ==========
  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      title="Registrar Informe de Cierre"
      titleIcon={<AssignmentIcon />}
      showCloseButton={!isLoading}
      error={error}
      info="Complete la fundamentación del cierre de esta medida MPI. Describa los objetivos alcanzados, la situación estabilizada del NNyA y su familia, y las razones para el cierre de la intervención."
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "text",
          disabled: isLoading
        },
        {
          label: isLoading ? "Enviando..." : "Enviar Informe",
          onClick: handleSubmit,
          variant: "contained",
          color: "primary",
          disabled: isLoading || !isTipoCeseValid || !isObservacionesValid,
          loading: isLoading
        }
      ]}
    >
      {/* Tipo de Cese Selector */}
      <FormControl
        fullWidth
        required
        error={tipoCese === "" && !!error}
        sx={{ mb: 3 }}
      >
        <InputLabel id="tipo-cese-label">Tipo de Cese *</InputLabel>
        <Select
          labelId="tipo-cese-label"
          id="tipo-cese-select"
          value={tipoCese}
          label="Tipo de Cese *"
          onChange={(e) => setTipoCese(e.target.value as TipoCeseMPI)}
          disabled={isLoading}
        >
          <MenuItem value="">
            <em>Seleccione un tipo de cese</em>
          </MenuItem>
          {(Object.entries(TipoCeseMPILabels) as [TipoCeseMPI, string][]).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Seleccione el tipo de cese que corresponde a esta medida
        </FormHelperText>
      </FormControl>

      {/* Observaciones Field */}
      <TextField
        label="Observaciones *"
        multiline
        rows={6}
        fullWidth
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Describa los objetivos alcanzados, la situación actual del NNyA y familia, y las razones para el cierre de la intervención..."
        helperText={
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <span>
              {observaciones.length} / 20 caracteres mínimo
            </span>
            {isObservacionesValid && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Válido"
                color="success"
                size="small"
              />
            )}
          </Box>
        }
        error={observaciones.length > 0 && !isObservacionesValid}
        disabled={isLoading}
        sx={{ mb: 3 }}
      />

      {/* File Upload Section */}
      <FileUploadSection
        files={fileItems}
        onUpload={handleUpload}
        onDelete={handleDelete}
        multiple
        title="Adjuntos (Opcional)"
        emptyMessage="No hay archivos adjuntos"
        allowedTypes={getAcceptAttribute()}
        maxSizeInMB={10}
        disabled={isLoading}
        enableEtiqueta
        etiquetaValue={etiquetaCierre}
        onEtiquetaChange={setEtiquetaCierre}
        etiquetaHelperText="Etiqueta común para los adjuntos del cierre"
      />
    </BaseDialog>
  )
}
