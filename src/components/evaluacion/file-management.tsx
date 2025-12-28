"use client"

import type React from "react"

import { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Box } from "@mui/material"
import { toast } from "react-toastify"
import { formatFileSize } from "@/utils/fileUtils"
import { FileUploadSection, type FileItem as FileUploadItem } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"

interface FileInfo {
  id: string
  name: string
  type: string
  size: number
  date: string
  url: string
  archivo?: string
  file?: File // Store the original File object
}

interface FileManagementProps {
  demandaId?: number | null
  existingAdjuntos?: Array<{ archivo: string }>
}

// Export the handle type for TypeScript support
export interface FileManagementHandle {
  addGeneratedPDF: (pdfBlob: Blob, fileName: string) => FileInfo
  getFiles: () => File[] // Add method to get original File objects
}

const FileManagement = forwardRef<FileManagementHandle, FileManagementProps>(({ demandaId, existingAdjuntos = [] }, ref) => {
  const [files, setFiles] = useState<FileInfo[]>([])

  // Load existing adjuntos when component mounts or when existingAdjuntos changes
  useEffect(() => {
    if (existingAdjuntos && existingAdjuntos.length > 0) {
      const existingFiles = existingAdjuntos.map((adjunto, index) => {
        // Extract filename from URL
        const url = adjunto.archivo
        const fileName = url.split('/').pop() || `archivo_${index + 1}`

        // Determine if it's a full URL or relative path
        const fileUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`

        // Detect file type from extension
        let fileType = 'application/octet-stream'
        const extension = fileName.split('.').pop()?.toLowerCase()
        if (extension === 'pdf') {
          fileType = 'application/pdf'
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
          fileType = `image/${extension}`
        } else if (['doc', 'docx'].includes(extension || '')) {
          fileType = 'application/msword'
        }

        return {
          id: `existing_${index}`,
          name: fileName,
          type: fileType,
          size: 0, // Unknown size for existing files
          date: 'Archivo existente',
          url: fileUrl,
          archivo: url,
          // No File object for existing files from server
        }
      })
      setFiles(existingFiles)
    }
  }, [existingAdjuntos])

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    addGeneratedPDF: (pdfBlob: Blob, fileName = "informe_valoracion.pdf") => {
      // Crear un objeto URL para el blob
      const blobUrl = URL.createObjectURL(pdfBlob)

      // Convert Blob to File
      const file = new File([pdfBlob], fileName, { type: "application/pdf" })

      // Crear un nuevo archivo en el formato esperado por la API
      const newFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: fileName,
        type: "application/pdf",
        size: pdfBlob.size,
        date: new Date().toLocaleString(),
        url: blobUrl,
        archivo: `/media/TDemandaAdjunto/archivo_${Math.floor(Math.random() * 1000)}/${fileName}`,
        file: file, // Store the File object
      }

      setFiles((prev) => [...prev, newFile])

      // Añadir el archivo a los adjuntos si existe la función setAdjuntos
      if (typeof window !== "undefined" && window.dispatchEvent) {
        // Crear un evento personalizado para notificar que se ha generado un nuevo archivo
        const event = new CustomEvent("newFileGenerated", { detail: { file: newFile } })
        window.dispatchEvent(event)
      }

      toast.success("Informe generado y guardado exitosamente", {
        position: "top-center",
        autoClose: 3000,
      })

      return newFile
    },
    getFiles: () => {
      // Return only the File objects from files that have them
      return files.filter(f => f.file).map(f => f.file!)
    },
  }))

  // Convert FileInfo[] to FileUploadItem[] for FileUploadSection
  const displayFiles: FileUploadItem[] = files.map((file) => ({
    id: file.id,
    nombre: file.name,
    tipo: file.type,
    url: file.url,
    tamano: file.size,
    fecha_subida: file.date,
  }))

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const newFile: FileInfo = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      date: new Date().toLocaleString(),
      url: URL.createObjectURL(file),
      archivo: '', // Will be set after upload to server
      file: file,
    }

    setFiles((prev) => [...prev, newFile])

    toast.success("Archivo subido exitosamente", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  // Handle file download
  const handleFileDownload = (file: FileUploadItem) => {
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }

  // Handle file deletion
  const handleFileDelete = (fileId: number | string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
    toast.info("Archivo eliminado", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <FileUploadSection
        files={displayFiles}
        onUpload={handleFileUpload}
        onDownload={handleFileDownload}
        onDelete={handleFileDelete}
        title="ARCHIVOS"
        multiple={true}
        emptyMessage="No hay archivos existentes"
        dragDropMessage="Arrastra y suelta archivos aquí"
        uploadButtonLabel="SELECCIONAR ARCHIVOS"
      />
    </Box>
  )
})

FileManagement.displayName = "FileManagement"

export default FileManagement
