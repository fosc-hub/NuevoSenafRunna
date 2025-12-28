/**
 * File Utility Functions
 *
 * Centralized file manipulation utilities.
 * Consolidates 3 different file size formatting implementations.
 */

/**
 * Format file size in bytes to human-readable format
 *
 * Consolidates multiple implementations across the codebase:
 * - file-validation.ts
 * - adjuntos-informe-juridico.tsx
 * - file-management.tsx
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(512) // "512 B"
 * formatFileSize(1536, 1) // "1.5 KB"
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(decimals)
    return `${kb} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    const mb = (bytes / (1024 * 1024)).toFixed(decimals)
    return `${mb} MB`
  }

  const gb = (bytes / (1024 * 1024 * 1024)).toFixed(decimals)
  return `${gb} GB`
}

/**
 * Get file extension from filename
 *
 * @param filename - Full filename with extension
 * @returns Lowercase file extension without dot
 *
 * @example
 * getFileExtension("document.pdf") // "pdf"
 * getFileExtension("archive.tar.gz") // "gz"
 * getFileExtension("noextension") // ""
 */
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || ""
}

/**
 * Check if a file extension is in the allowed list
 *
 * @param filename - Filename to check
 * @param allowedExtensions - Array of allowed extensions (lowercase, without dot)
 * @returns true if extension is allowed
 *
 * @example
 * isAllowedExtension("doc.pdf", ["pdf", "doc", "docx"]) // true
 * isAllowedExtension("file.exe", ["pdf", "doc"]) // false
 */
export const isAllowedExtension = (
  filename: string,
  allowedExtensions: string[]
): boolean => {
  const extension = getFileExtension(filename)
  return allowedExtensions.includes(extension)
}

/**
 * Common allowed file extensions for document uploads
 */
export const COMMON_DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
] as const

/**
 * Common allowed file extensions for images only
 */
export const COMMON_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"] as const

/**
 * Maximum file size constants (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  /** 10 MB */
  DEFAULT: 10 * 1024 * 1024,
  /** 5 MB */
  IMAGE: 5 * 1024 * 1024,
  /** 20 MB */
  DOCUMENT: 20 * 1024 * 1024,
} as const
