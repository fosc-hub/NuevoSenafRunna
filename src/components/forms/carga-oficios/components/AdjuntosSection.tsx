"use client"

/**
 * AdjuntosSection - File attachments section for CARGA_OFICIOS form
 *
 * Wraps the shared FileUploadSection component
 */

import type React from "react"
import { useState } from "react"
import { Box } from "@mui/material"
import { FileUploadSection } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"
import { useEtiquetasDocumento } from "@/hooks/useEtiquetasDocumento"
import type { AdjuntosSectionProps } from "../types/carga-oficios.types"

/** Tag attached at runtime onto File instances so submission code can read it. */
type FileWithEtiqueta = File & { __etiquetaId?: number | null }

const AdjuntosSection: React.FC<AdjuntosSectionProps> = ({
  files,
  onFilesChange,
  onFileUpload,
  onFileDelete,
  readOnly = false,
  isUploading = false,
}) => {
  // Etiqueta global aplicada al próximo archivo subido en esta sesión.
  // Cada archivo queda etiquetado al momento de subir (la selección puede
  // cambiar para los siguientes archivos).
  const [etiquetaActual, setEtiquetaActual] = useState<number | null>(null)
  const { etiquetas } = useEtiquetasDocumento()

  const etiquetaPorId = (id?: number | null) =>
    id ? etiquetas.find((e) => e.id === id)?.nombre ?? null : null

  // Convert files to FileItem format for FileUploadSection
  const fileItems = files.map((file, index) => {
    if (file instanceof File) {
      const tagged = file as FileWithEtiqueta
      return {
        id: `new-${index}`,
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
        etiqueta_nombre: etiquetaPorId(tagged.__etiquetaId),
      }
    } else {
      return {
        id: file.id || `existing-${index}`,
        nombre: file.nombre || file.archivo.split("/").pop() || "Archivo",
        url: file.archivo,
        etiqueta_nombre: etiquetaPorId((file as any).etiqueta ?? null),
      }
    }
  })

  const handleFileUpload = async (file: File, etiquetaId?: number | null) => {
    // Stamp etiqueta directly on the File so submission code can read it.
    const tagged = file as FileWithEtiqueta
    tagged.__etiquetaId = etiquetaId ?? null
    if (onFileUpload) {
      await onFileUpload(tagged)
    } else {
      // If no custom upload handler, just add to local state
      onFilesChange([...files, tagged])
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
        enableEtiqueta={!readOnly}
        etiquetaValue={etiquetaActual}
        onEtiquetaChange={setEtiquetaActual}
        etiquetaHelperText="Aplica al próximo archivo cargado. Podés cambiarla entre archivos."
      />
    </Box>
  )
}

export default AdjuntosSection
