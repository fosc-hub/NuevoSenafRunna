"use client"

/**
 * AdjuntosSection - File attachments section for CARGA_OFICIOS form
 *
 * Wraps the shared FileUploadSection component and adds:
 * - Sticker SUAC placeholder field (backend gap)
 * - Integration with form state
 */

import type React from "react"
import { Box, Grid, Typography, Paper, alpha, Divider } from "@mui/material"
import { QrCode as QrCodeIcon } from "@mui/icons-material"
import { useFormContext } from "react-hook-form"
import { FileUploadSection } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"
import PlaceholderField from "./PlaceholderField"
import type { AdjuntosSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"

const AdjuntosSection: React.FC<AdjuntosSectionProps> = ({
  files,
  onFilesChange,
  onFileUpload,
  onFileDelete,
  readOnly = false,
  isUploading = false,
}) => {
  // Access form context for future enhancements (e.g., sticker_suac field)
  useFormContext<CargaOficiosFormData>()

  // Convert files to FileItem format for FileUploadSection
  const fileItems = files.map((file, index) => {
    if (file instanceof File) {
      return {
        id: `new-${index}`,
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
      }
    } else {
      return {
        id: file.id || `existing-${index}`,
        nombre: file.nombre || file.archivo.split("/").pop() || "Archivo",
        url: file.archivo,
      }
    }
  })

  const handleFileUpload = async (file: File) => {
    if (onFileUpload) {
      await onFileUpload(file)
    } else {
      // If no custom upload handler, just add to local state
      onFilesChange([...files, file])
    }
  }

  const handleFileDelete = async (fileId: number | string) => {
    if (onFileDelete) {
      await onFileDelete(fileId)
    } else {
      // Remove from local state
      onFilesChange(
        files.filter((f, index) => {
          if (f instanceof File) {
            return `new-${index}` !== fileId
          } else {
            return f.id !== fileId && `existing-${index}` !== fileId
          }
        })
      )
    }
  }

  const handleFileDownload = (file: { url?: string; nombre: string }) => {
    if (file.url) {
      window.open(file.url, "_blank")
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12} lg={8}>
          <FileUploadSection
            files={fileItems}
            isLoading={false}
            onUpload={readOnly ? undefined : handleFileUpload}
            onDownload={handleFileDownload}
            onDelete={readOnly ? undefined : handleFileDelete}
            disabled={readOnly}
            readOnly={readOnly}
            multiple
            enableDragDrop={!readOnly}
            dragDropMessage="Arrastra y suelta archivos del oficio aquí"
            dragDropHeight={180}
            title="Documentos Adjuntos"
            uploadButtonLabel="Subir Documento"
            emptyMessage="No hay documentos adjuntos"
            isUploading={isUploading}
            allowedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            maxSizeInMB={10}
          />
        </Grid>

        {/* Sticker SUAC and metadata */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <QrCodeIcon sx={{ color: "primary.main" }} />
              Información Adicional
            </Typography>

            {/* Sticker SUAC placeholder */}
            <Box sx={{ mb: 3 }}>
              <PlaceholderField
                label="Sticker SUAC"
                tooltip="Número de sticker del Sistema Único de Atención al Ciudadano"
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* File statistics */}
            <Box
              sx={{
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                borderRadius: 1,
                p: 2,
                mt: "auto",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 1 }}
              >
                Resumen de archivos
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total archivos:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {files.length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Nuevos:
                </Typography>
                <Typography variant="body2">
                  {files.filter((f) => f instanceof File).length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Existentes:
                </Typography>
                <Typography variant="body2">
                  {files.filter((f) => !(f instanceof File)).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdjuntosSection
