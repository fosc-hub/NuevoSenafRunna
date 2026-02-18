"use client"

/**
 * useAdjuntosManager - Hook for managing file attachments in CARGA_OFICIOS form
 *
 * Provides state management and handlers for file uploads, including:
 * - File list management
 * - Upload state tracking
 * - File validation
 * - Integration with react-hook-form
 */

import { useState, useCallback, useMemo } from "react"
import type { FileItem } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/file-upload-section"

type FileWithMeta = File | { archivo: string; id?: number; nombre?: string }

interface UseAdjuntosManagerResult {
  /** Current list of files (both new and existing) */
  files: FileWithMeta[]

  /** Files formatted for FileUploadSection component */
  fileItems: FileItem[]

  /** Whether a file is currently being uploaded */
  isUploading: boolean

  /** Error message from last upload attempt */
  uploadError: string | null

  /** Add a new file to the list */
  addFile: (file: File) => void

  /** Add multiple files to the list */
  addFiles: (files: File[]) => void

  /** Remove a file by index or ID */
  removeFile: (indexOrId: number | string) => void

  /** Clear all files */
  clearFiles: () => void

  /** Set upload loading state */
  setUploading: (isUploading: boolean) => void

  /** Set upload error */
  setUploadError: (error: string | null) => void

  /** Get only new files (File objects) */
  getNewFiles: () => File[]

  /** Get only existing files (with archivo property) */
  getExistingFiles: () => Array<{ archivo: string; id?: number; nombre?: string }>
}

interface UseAdjuntosManagerOptions {
  /** Initial files (typically from existing demanda) */
  initialFiles?: FileWithMeta[]

  /** Maximum file size in MB */
  maxSizeMB?: number

  /** Allowed file types (MIME types) */
  allowedTypes?: string[]

  /** Callback when files change */
  onFilesChange?: (files: FileWithMeta[]) => void
}

const DEFAULT_MAX_SIZE_MB = 10
const DEFAULT_ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

/**
 * Hook for managing file attachments
 *
 * @param options - Configuration options
 * @returns File management utilities
 */
export const useAdjuntosManager = (
  options: UseAdjuntosManagerOptions = {}
): UseAdjuntosManagerResult => {
  const {
    initialFiles = [],
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    onFilesChange,
  } = options

  const [files, setFiles] = useState<FileWithMeta[]>(initialFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Validate file before adding
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSizeMB) {
        return `El archivo "${file.name}" excede el tamaño máximo de ${maxSizeMB}MB`
      }

      // Check file type if restrictions are set
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `Tipo de archivo no permitido: ${file.type}`
      }

      return null
    },
    [maxSizeMB, allowedTypes]
  )

  // Add a single file
  const addFile = useCallback(
    (file: File) => {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        return
      }

      setUploadError(null)
      setFiles((prev) => {
        const newFiles = [...prev, file]
        onFilesChange?.(newFiles)
        return newFiles
      })
    },
    [validateFile, onFilesChange]
  )

  // Add multiple files
  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: File[] = []
      const errors: string[] = []

      for (const file of newFiles) {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      }

      if (errors.length > 0) {
        setUploadError(errors.join(". "))
      } else {
        setUploadError(null)
      }

      if (validFiles.length > 0) {
        setFiles((prev) => {
          const updatedFiles = [...prev, ...validFiles]
          onFilesChange?.(updatedFiles)
          return updatedFiles
        })
      }
    },
    [validateFile, onFilesChange]
  )

  // Remove a file
  const removeFile = useCallback(
    (indexOrId: number | string) => {
      setFiles((prev) => {
        let newFiles: FileWithMeta[]

        if (typeof indexOrId === "number") {
          // If it's an existing file with an ID
          newFiles = prev.filter((file) => {
            if ("id" in file && file.id !== undefined) {
              return file.id !== indexOrId
            }
            return true
          })

          // If no file was removed by ID, try removing by index
          if (newFiles.length === prev.length) {
            newFiles = prev.filter((_, index) => index !== indexOrId)
          }
        } else {
          // String ID
          newFiles = prev.filter((file) => {
            if ("id" in file) {
              return String(file.id) !== indexOrId
            }
            return true
          })
        }

        onFilesChange?.(newFiles)
        return newFiles
      })
    },
    [onFilesChange]
  )

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([])
    setUploadError(null)
    onFilesChange?.([])
  }, [onFilesChange])

  // Get new files only
  const getNewFiles = useCallback((): File[] => {
    return files.filter((f): f is File => f instanceof File)
  }, [files])

  // Get existing files only
  const getExistingFiles = useCallback((): Array<{
    archivo: string
    id?: number
    nombre?: string
  }> => {
    return files.filter((f): f is { archivo: string; id?: number; nombre?: string } => {
      return typeof f === "object" && "archivo" in f
    })
  }, [files])

  // Convert files to FileItem format for FileUploadSection
  const fileItems = useMemo((): FileItem[] => {
    return files.map((file, index) => {
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
  }, [files])

  return {
    files,
    fileItems,
    isUploading,
    uploadError,
    addFile,
    addFiles,
    removeFile,
    clearFiles,
    setUploading: setIsUploading,
    setUploadError,
    getNewFiles,
    getExistingFiles,
  }
}

export default useAdjuntosManager
