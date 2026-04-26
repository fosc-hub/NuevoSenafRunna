"use client"

/**
 * CompletarInformeModal Component - PLTM-03
 *
 * Modal for completing monthly follow-up reports.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Template download button
 * - File upload for completed template
 * - Loading state during submission
 * - Late delivery warning
 * - API integration with useCompletarInforme
 */

import type React from "react"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import SendIcon from "@mui/icons-material/Send"
import DescriptionIcon from "@mui/icons-material/Description"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DeleteIcon from "@mui/icons-material/Delete"
import WarningIcon from "@mui/icons-material/Warning"
import BaseDialog from "@/components/shared/BaseDialog"
import { FileUploadSection, type FileItem } from "@/components/shared/FileUploadSection"
import { useCompletarInforme, useDescargarPlantilla, usePlantillaInfo } from "../../hooks/useInformesSeguimiento"
import { ADJUNTO_INFORME_SEGUIMIENTO_CONFIG } from "../../types/informe-seguimiento-api"

// ============================================================================
// TYPES
// ============================================================================

interface CompletarInformeModalProps {
  open: boolean
  onClose: () => void
  medidaId: number
  informeId: number
  numeroInforme: number
  fechaVencimiento: string
  isVencido?: boolean
  onSuccess?: () => void
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const completarInformeSchema = z.object({
  contenido: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(10000, 'El contenido no puede exceder los 10000 caracteres'),
  observaciones: z
    .string()
    .max(2000, 'Las observaciones no pueden exceder los 2000 caracteres')
    .optional()
    .nullable(),
})

type CompletarInformeFormData = z.infer<typeof completarInformeSchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CompletarInformeModal: React.FC<CompletarInformeModalProps> = ({
  open,
  onClose,
  medidaId,
  informeId,
  numeroInforme,
  fechaVencimiento,
  isVencido = false,
  onSuccess,
}) => {
  // State
  const [archivo, setArchivo] = useState<File | null>(null)
  const [etiquetaPlantilla, setEtiquetaPlantilla] = useState<number | null>(null)

  // API Hooks
  const { data: plantillaInfo } = usePlantillaInfo({ medidaId })
  const descargarPlantillaMutation = useDescargarPlantilla()
  const completarInformeMutation = useCompletarInforme({
    onSuccess: () => {
      onSuccess?.()
      handleClose()
    },
  })

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompletarInformeFormData>({
    resolver: zodResolver(completarInformeSchema),
    defaultValues: {
      contenido: '',
      observaciones: '',
    },
  })

  // Handlers
  const handleClose = () => {
    reset()
    setArchivo(null)
    onClose()
  }

  const handleDescargarPlantilla = () => {
    descargarPlantillaMutation.mutate({
      medidaId,
      filename: plantillaInfo?.nombre || `plantilla_informe_${numeroInforme}.docx`,
    })
  }

  const handleUpload = (file: File, etiquetaId?: number | null) => {
    if (file.size > ADJUNTO_INFORME_SEGUIMIENTO_CONFIG.MAX_SIZE_BYTES) {
      alert('El archivo excede el tamaño máximo permitido de 10MB')
      return
    }
    setArchivo(file)
    setEtiquetaPlantilla(etiquetaId ?? null)
  }

  const handleRemoveFile = () => {
    setArchivo(null)
    setEtiquetaPlantilla(null)
  }

  const fileItems: FileItem[] = archivo
    ? [{ id: 'plantilla', nombre: archivo.name, tipo: archivo.type, tamano: archivo.size }]
    : []

  const onSubmit = async (data: CompletarInformeFormData) => {
    await completarInformeMutation.mutateAsync({
      medidaId,
      informeId,
      payload: {
        contenido: data.contenido,
        observaciones: data.observaciones || null,
        plantilla: archivo || undefined,
      },
    })
  }

  const isLoading = completarInformeMutation.isPending || isSubmitting

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      title={`Informe de Seguimiento N° ${numeroInforme}`}
      titleIcon={<DescriptionIcon />}
      centerTitle
      showCloseButton
      contentSx={{ px: 4, py: 3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header Info */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Fecha de vencimiento: <strong>{formatDate(fechaVencimiento)}</strong>
            </Typography>
          </Box>

          {/* Late Delivery Warning */}
          {isVencido && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                <strong>Atención:</strong> Este informe está vencido. Se registrará como entrega tardía.
              </Typography>
            </Alert>
          )}

          {/* Download Plantilla Button */}
          {plantillaInfo?.disponible && (
            <Button
              fullWidth
              variant="contained"
              startIcon={descargarPlantillaMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDescargarPlantilla}
              disabled={descargarPlantillaMutation.isPending}
              sx={{
                backgroundColor: '#36d6d0',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#2cc2bc' },
              }}
            >
              {descargarPlantillaMutation.isPending ? 'Descargando...' : 'Descargar plantilla'}
            </Button>
          )}

          {/* Contenido Field */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Contenido del informe *
            </Typography>
            <TextField
              {...register('contenido')}
              multiline
              minRows={4}
              maxRows={8}
              fullWidth
              placeholder="Escriba el contenido detallado del informe aquí..."
              variant="outlined"
              error={!!errors.contenido}
              helperText={errors.contenido?.message}
              disabled={isLoading}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
              }}
            />
          </Box>

          {/* Observaciones Field */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Observaciones (opcional)
            </Typography>
            <TextField
              {...register('observaciones')}
              multiline
              minRows={2}
              maxRows={4}
              fullWidth
              placeholder="Observaciones adicionales..."
              variant="outlined"
              error={!!errors.observaciones}
              helperText={errors.observaciones?.message}
              disabled={isLoading}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
              }}
            />
          </Box>

          {/* File Upload Zone */}
          <FileUploadSection
            files={fileItems}
            onUpload={handleUpload}
            onDelete={handleRemoveFile}
            multiple={false}
            disabled={isLoading}
            title="Adjuntar plantilla completada (opcional)"
            emptyMessage="No hay plantilla seleccionada"
            allowedTypes=".pdf,.doc,.docx"
            maxSizeInMB={10}
            enableEtiqueta
            etiquetaValue={etiquetaPlantilla}
            onEtiquetaChange={setEtiquetaPlantilla}
            etiquetaHelperText="Etiqueta clasificatoria del informe (opcional)"
          />

          {/* Error Message */}
          {completarInformeMutation.isError && (
            <Alert severity="error">
              {(completarInformeMutation.error as Error)?.message || 'Error al completar el informe'}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={isLoading}
            sx={{
              backgroundColor: '#4f3ff0',
              color: 'white',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { backgroundColor: '#3a2cc2' },
            }}
          >
            {isLoading ? 'Enviando...' : 'Enviar informe'}
          </Button>
        </Box>
      </form>
    </BaseDialog>
  )
}
