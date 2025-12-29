/**
 * Hook useNotaAvalAdjuntos
 * Custom hook for managing Nota de Aval adjuntos (attachments) (MED-03)
 *
 * Handles:
 * - Uploading PDF files to nota de aval
 * - File validation (type, size)
 * - Fetching list of adjuntos
 * - Deleting adjuntos
 * - Loading/error states
 * - Progress tracking for uploads
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useState, useCallback } from 'react'
import type { AdjuntoNotaAval } from '../types/nota-aval-api'
import { ADJUNTO_CONFIG } from '../types/nota-aval-api'
import {
  uploadAdjuntoNotaAval,
  getAdjuntosNotaAval,
  deleteAdjuntoNotaAval,
} from '../api/nota-aval-api-service'
import { formatFileSize } from '@/utils/fileUtils'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adjuntoNotaAvalKeys = {
  all: ['adjunto-nota-aval'] as const,
  lists: () => [...adjuntoNotaAvalKeys.all, 'list'] as const,
  list: (medidaId: number) => [...adjuntoNotaAvalKeys.lists(), medidaId] as const,
}

// ============================================================================
// HOOK OPTIONS INTERFACES
// ============================================================================

interface UseNotaAvalAdjuntosOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
}

interface UploadProgress {
  fileName: string
  progress: number // 0-100
  isUploading: boolean
  error?: string
}

// ============================================================================
// FILE VALIDATION UTILS
// ============================================================================

/**
 * Validate file type (must be PDF)
 */
const validateFileType = (file: File): { valid: boolean; error?: string } => {
  if (!ADJUNTO_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten archivos PDF',
    }
  }

  // Also check extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!ADJUNTO_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'El archivo debe tener extensión .pdf',
    }
  }

  return { valid: true }
}

/**
 * Validate file size (max 10MB)
 */
const validateFileSize = (file: File): { valid: boolean; error?: string } => {
  if (file.size > ADJUNTO_CONFIG.MAX_SIZE_BYTES) {
    const maxSizeMB = ADJUNTO_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Validate file completely
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check type
  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) {
    return typeValidation
  }

  // Check size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  return { valid: true }
}

// ============================================================================
// MAIN HOOK: useNotaAvalAdjuntos
// ============================================================================

/**
 * Hook principal para gestión de Adjuntos de Nota de Aval
 *
 * @param medidaId ID de la medida
 * @param options Opciones de configuración
 * @returns Query data, mutations y utilidades
 */
export const useNotaAvalAdjuntos = (
  medidaId: number,
  options: UseNotaAvalAdjuntosOptions = {}
) => {
  const queryClient = useQueryClient()

  // State for upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

  // Query: Get list of adjuntos
  const {
    data: adjuntos,
    isLoading: isLoadingAdjuntos,
    error: adjuntosError,
    refetch: refetchAdjuntos,
  } = useQuery<AdjuntoNotaAval[], Error>({
    queryKey: adjuntoNotaAvalKeys.list(medidaId),
    queryFn: () => getAdjuntosNotaAval(medidaId),
    enabled: options.enabled !== false,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation: Upload adjunto
  const uploadMutation = useMutation<AdjuntoNotaAval, Error, File>({
    mutationFn: async (file: File) => {
      // Validate file before upload
      const validation = validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Set upload progress
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        isUploading: true,
      })

      // Simulate progress (since we don't have real progress from fetch)
      // In a real scenario, you'd use XMLHttpRequest for progress tracking
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (!prev || prev.progress >= 90) return prev
          return {
            ...prev,
            progress: prev.progress + 10,
          }
        })
      }, 200)

      try {
        const result = await uploadAdjuntoNotaAval(medidaId, file)

        // Complete progress
        clearInterval(progressInterval)
        setUploadProgress({
          fileName: file.name,
          progress: 100,
          isUploading: false,
        })

        return result
      } catch (error) {
        clearInterval(progressInterval)
        setUploadProgress(null)
        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: adjuntoNotaAvalKeys.list(medidaId) })

      // Show success toast
      toast.success(`Archivo "${data.nombre_archivo}" subido exitosamente`, {
        position: 'top-center',
        autoClose: 3000,
      })

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(null)
      }, 1000)
    },
    onError: (error: any) => {
      // Extract error message
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Error al subir el archivo'

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      console.error('Error uploading adjunto:', error)

      // Clear progress
      setUploadProgress(null)
    },
  })

  // Mutation: Delete adjunto
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (adjuntoId: number) => deleteAdjuntoNotaAval(medidaId, adjuntoId),
    onSuccess: (_, adjuntoId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: adjuntoNotaAvalKeys.list(medidaId) })

      // Show success toast
      toast.success('Archivo eliminado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })
    },
    onError: (error: any) => {
      // Extract error message
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Error al eliminar el archivo'

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      console.error('Error deleting adjunto:', error)
    },
  })

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Check if adjuntos list has any items
   */
  const hasAdjuntos = adjuntos && adjuntos.length > 0

  /**
   * Get count of adjuntos
   */
  const adjuntosCount = adjuntos?.length || 0

  /**
   * Upload file with validation
   */
  const uploadFile = useCallback(
    (file: File) => {
      return uploadMutation.mutateAsync(file)
    },
    [uploadMutation]
  )

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(
    async (files: File[]) => {
      const results: AdjuntoNotaAval[] = []
      const errors: { file: string; error: string }[] = []

      for (const file of files) {
        try {
          const result = await uploadFile(file)
          results.push(result)
        } catch (error: any) {
          errors.push({
            file: file.name,
            error: error?.message || 'Error desconocido',
          })
        }
      }

      // Show summary if there were errors
      if (errors.length > 0) {
        const errorMessage = errors.map((e) => `${e.file}: ${e.error}`).join('\n')
        toast.error(`Algunos archivos no pudieron subirse:\n${errorMessage}`, {
          position: 'top-center',
          autoClose: 7000,
        })
      }

      return { results, errors }
    },
    [uploadFile]
  )

  /**
   * Delete adjunto by ID
   */
  const deleteAdjunto = useCallback(
    (adjuntoId: number) => {
      return deleteMutation.mutateAsync(adjuntoId)
    },
    [deleteMutation]
  )

  /**
   * Validate file before upload (without uploading)
   */
  const validateFileBeforeUpload = useCallback((file: File) => {
    return validateFile(file)
  }, [])

  /**
   * Get adjunto by ID
   */
  const getAdjuntoById = useCallback(
    (adjuntoId: number) => {
      return adjuntos?.find((adj) => adj.id === adjuntoId)
    },
    [adjuntos]
  )

  // ============================================================================
  // RETURN HOOK DATA
  // ============================================================================

  return {
    // Query data
    adjuntos,

    // Loading states
    isLoadingAdjuntos,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: isLoadingAdjuntos || uploadMutation.isPending || deleteMutation.isPending,

    // Error states
    adjuntosError,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
    error: adjuntosError || uploadMutation.error || deleteMutation.error,

    // Upload progress
    uploadProgress,

    // Refetch functions
    refetchAdjuntos,

    // Mutations
    uploadMutation,
    deleteMutation,

    // Utility values
    hasAdjuntos,
    adjuntosCount,

    // Actions
    uploadFile,
    uploadFiles,
    deleteAdjunto,
    validateFileBeforeUpload,
    getAdjuntoById,
    formatFileSize,

    // Validation config
    maxSizeBytes: ADJUNTO_CONFIG.MAX_SIZE_BYTES,
    allowedTypes: ADJUNTO_CONFIG.ALLOWED_TYPES,
    allowedExtensions: ADJUNTO_CONFIG.ALLOWED_EXTENSIONS,
  }
}

// ============================================================================
// HOOK: useAdjuntoValidation
// ============================================================================

/**
 * Hook standalone para validación de archivos (sin queries/mutations)
 * Útil para validar archivos antes de seleccionarlos en el UI
 */
export const useAdjuntoValidation = () => {
  const validate = useCallback((file: File) => {
    return validateFile(file)
  }, [])

  const validateType = useCallback((file: File) => {
    return validateFileType(file)
  }, [])

  const validateSize = useCallback((file: File) => {
    return validateFileSize(file)
  }, [])

  return {
    validate,
    validateType,
    validateSize,
    maxSizeBytes: ADJUNTO_CONFIG.MAX_SIZE_BYTES,
    allowedTypes: ADJUNTO_CONFIG.ALLOWED_TYPES,
    allowedExtensions: ADJUNTO_CONFIG.ALLOWED_EXTENSIONS,
  }
}
