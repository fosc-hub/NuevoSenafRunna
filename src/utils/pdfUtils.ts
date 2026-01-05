/**
 * PDF Utility Functions
 *
 * Centralized utilities for PDF handling.
 * Part of the DRY refactoring initiative.
 */

// ============================================================================
// FILE TYPE DETECTION
// ============================================================================

/**
 * Check if a file is a PDF based on name or MIME type
 *
 * @param fileName - File name to check
 * @param mimeType - Optional MIME type
 * @returns true if the file is a PDF
 *
 * @example
 * isPdfFile("document.pdf") // true
 * isPdfFile("image.png") // false
 * isPdfFile("file", "application/pdf") // true
 */
export const isPdfFile = (fileName: string, mimeType?: string): boolean => {
  if (mimeType) {
    return mimeType === "application/pdf"
  }
  return fileName.toLowerCase().endsWith(".pdf")
}

/**
 * Check if a file is an image based on name or MIME type
 *
 * @param fileName - File name to check
 * @param mimeType - Optional MIME type
 * @returns true if the file is an image
 */
export const isImageFile = (fileName: string, mimeType?: string): boolean => {
  if (mimeType) {
    return mimeType.startsWith("image/")
  }
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
  const lowerName = fileName.toLowerCase()
  return imageExtensions.some((ext) => lowerName.endsWith(ext))
}

/**
 * Check if a file can be previewed in the browser
 *
 * @param fileName - File name to check
 * @param mimeType - Optional MIME type
 * @returns true if the file can be previewed
 */
export const isPreviewableFile = (fileName: string, mimeType?: string): boolean => {
  return isPdfFile(fileName, mimeType) || isImageFile(fileName, mimeType)
}

// ============================================================================
// URL HANDLING
// ============================================================================

/**
 * Extract file name from URL
 *
 * @param url - URL to extract filename from
 * @param fallback - Fallback name if extraction fails
 * @returns Extracted or fallback filename
 *
 * @example
 * getFileNameFromUrl("https://api.com/files/doc.pdf") // "doc.pdf"
 * getFileNameFromUrl("https://api.com/files/") // "documento.pdf"
 */
export const getFileNameFromUrl = (url: string, fallback = "documento.pdf"): string => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split("/").pop()

    if (fileName && fileName.includes(".")) {
      return decodeURIComponent(fileName)
    }
    return fallback
  } catch {
    // Try simple split if URL parsing fails
    const parts = url.split("/")
    const lastPart = parts[parts.length - 1]
    if (lastPart && lastPart.includes(".")) {
      return decodeURIComponent(lastPart)
    }
    return fallback
  }
}

/**
 * Ensure URL is absolute (add base URL if needed)
 *
 * @param url - URL to process
 * @param baseUrl - Base URL to prepend if needed
 * @returns Absolute URL
 */
export const ensureAbsoluteUrl = (url: string, baseUrl?: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url
  }

  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || ""
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

// ============================================================================
// DATA CONVERSION
// ============================================================================

/**
 * Convert Base64 string to Blob
 *
 * @param base64 - Base64 encoded string
 * @param mimeType - MIME type for the blob
 * @returns Blob object
 */
export const base64ToBlob = (base64: string, mimeType = "application/pdf"): Blob => {
  // Remove data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64

  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Convert Blob to Base64 string
 *
 * @param blob - Blob to convert
 * @returns Promise resolving to Base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Return just the base64 part without the data URL prefix
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Create a downloadable blob URL
 *
 * @param blob - Blob to create URL for
 * @returns Object URL that can be used for download
 */
export const createBlobUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

/**
 * Revoke a blob URL to free memory
 *
 * @param url - Blob URL to revoke
 */
export const revokeBlobUrl = (url: string): void => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

// ============================================================================
// DOWNLOAD UTILITIES
// ============================================================================

/**
 * Trigger a file download
 *
 * @param url - URL or blob URL to download
 * @param fileName - Name for the downloaded file
 */
export const downloadFile = (url: string, fileName: string): void => {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download a file from URL with fetch (handles CORS)
 *
 * @param url - URL to download from
 * @param fileName - Name for the downloaded file
 */
export const downloadFileWithFetch = async (url: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = createBlobUrl(blob)

    downloadFile(blobUrl, fileName)

    // Clean up after a short delay
    setTimeout(() => revokeBlobUrl(blobUrl), 100)
  } catch (error) {
    // Fallback to simple download if fetch fails
    downloadFile(url, fileName)
  }
}

// ============================================================================
// PRINT UTILITIES
// ============================================================================

/**
 * Print a PDF from URL
 *
 * @param url - URL of the PDF to print
 */
export const printPdf = (url: string): void => {
  const printWindow = window.open(url, "_blank")
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate PDF file before upload
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns Validation result
 */
export const validatePdfFile = (
  file: File,
  maxSizeMB = 10
): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "Solo se permiten archivos PDF" }
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}
