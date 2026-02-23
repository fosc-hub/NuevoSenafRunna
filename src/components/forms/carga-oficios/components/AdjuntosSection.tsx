"use client"

/**
 * AdjuntosSection - File attachments section for CARGA_OFICIOS form
 *
 * Wraps the shared FileUploadSection component
 */

import type React from "react"
import { Box } from "@mui/material"
import { FileUploadSection } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"
import type { AdjuntosSectionProps } from "../types/carga-oficios.types"

const AdjuntosSection: React.FC<AdjuntosSectionProps> = ({
  files,
  onFilesChange,
  onFileUpload,
  onFileDelete,
  readOnly = false,
  isUploading = false,
}) => {

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
    </Box>
  )
}

export default AdjuntosSection
