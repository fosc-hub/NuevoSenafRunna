"use client"

/**
 * AdjuntosNotaAval Component (MED-03)
 * Componente para gestionar y visualizar adjuntos de Nota de Aval
 *
 * Características:
 * - Drag-drop upload zone
 * - Card-based file display (responsive grid)
 * - Enhanced empty state with illustration
 * - Download de archivos PDF
 * - Eliminación de adjuntos (solo Director o Superusuario)
 * - Validación de archivos (PDF, máx 10MB)
 */

import React from "react"
import { Box, Typography, Chip, CircularProgress, Alert } from "@mui/material"
import { useNotaAvalAdjuntos } from "../../hooks/useNotaAvalAdjuntos"
import type { AdjuntoNotaAval } from "../../types/nota-aval-api"
import { FileUploadSection, type FileItem } from "@/components/shared/FileUploadSection"

// ============================================================================
// INTERFACES
// ============================================================================

interface AdjuntosNotaAvalProps {
  medidaId: number
  canDelete?: boolean // Si el usuario puede eliminar adjuntos (Director o Superusuario)
  canUpload?: boolean // Si el usuario puede subir adjuntos (Director o Superusuario)
  showUploadButton?: boolean // Mostrar botón de upload
  dense?: boolean // Modo compacto
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdjuntosNotaAval: React.FC<AdjuntosNotaAvalProps> = ({
  medidaId,
  canDelete = false,
  canUpload = false,
  // showUploadButton is kept for API compatibility but drag-drop zone replaces it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showUploadButton = false,
  dense = false,
}) => {
  // ============================================================================
  // STATE + HOOKS
  // ============================================================================

  const {
    adjuntos,
    isLoadingAdjuntos,
    adjuntosError,
    deleteAdjunto,
    uploadFile,
    isUploading,
    hasAdjuntos,
    adjuntosCount,
    validateFileBeforeUpload,
    allowedExtensions,
    maxSizeBytes,
  } = useNotaAvalAdjuntos(medidaId)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Map adjuntos del hook a FileItem para el componente compartido
  const fileItems: FileItem[] = (adjuntos || []).map((adj: AdjuntoNotaAval) => ({
    id: adj.id,
    nombre: adj.nombre_archivo,
    tipo: "application/pdf",
    tamano: adj.tamano_bytes,
    url: adj.archivo,
    fecha_subida: adj.fecha_carga,
  }))

  const handleUpload = async (file: File) => {
    const validation = validateFileBeforeUpload(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }
    try {
      await uploadFile(file)
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleDelete = async (adjuntoId: number | string) => {
    if (!canDelete) return
    if (!confirm("¿Está seguro que desea eliminar este adjunto? Esta acción no se puede deshacer.")) return
    try {
      await deleteAdjunto(typeof adjuntoId === "number" ? adjuntoId : Number(adjuntoId))
    } catch (error) {
      console.error("Error deleting adjunto:", error)
    }
  }

  const handleDownload = (file: FileItem) => {
    if (file.url) window.open(file.url, "_blank")
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingAdjuntos) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (adjuntosError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar adjuntos: {adjuntosError.message}
      </Alert>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2">
            Documentos Adjuntos
          </Typography>
          {hasAdjuntos && (
            <Chip label={adjuntosCount} size="small" color="primary" />
          )}
        </Box>
      </Box>

      <FileUploadSection
        files={fileItems}
        isLoading={isLoadingAdjuntos}
        onUpload={canUpload ? handleUpload : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        onDownload={handleDownload}
        readOnly={!canUpload}
        multiple={false}
        title="Documentos Adjuntos"
        emptyMessage="Sin documentos adjuntos"
        allowedTypes={allowedExtensions.join(",")}
        maxSizeInMB={Math.round(maxSizeBytes / (1024 * 1024))}
        isUploading={isUploading}
      />
    </Box>
  )
}
