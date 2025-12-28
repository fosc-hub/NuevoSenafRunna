/**
 * Date Utility Functions
 *
 * Centralized date formatting and manipulation utilities.
 * Extracted from 12+ duplicate implementations across the codebase.
 */

/**
 * Get current date in ISO format (YYYY-MM-DD)
 *
 * Replaces the pattern: new Date().toISOString().split("T")[0]
 * Found in 12+ locations across the codebase.
 *
 * @returns Current date in YYYY-MM-DD format
 *
 * @example
 * getCurrentDateISO() // "2025-12-25"
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString().split("T")[0]
}

/**
 * Format date for Argentina locale (es-AR) - Date only
 *
 * Replaces multiple .toLocaleDateString("es-AR", ...) implementations
 *
 * @param date - Date string or Date object to format
 * @returns Date formatted as DD/MM/YYYY
 *
 * @example
 * formatDateLocaleAR("2025-12-25") // "25/12/2025"
 * formatDateLocaleAR(new Date()) // "25/12/2025"
 */
export const formatDateLocaleAR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date and time for Argentina locale (es-AR)
 *
 * @param date - Date string or Date object to format
 * @returns Date and time formatted as DD/MM/YYYY HH:MM
 *
 * @example
 * formatDateTimeLocaleAR("2025-12-25T14:30:00Z") // "25/12/2025 14:30"
 */
export const formatDateTimeLocaleAR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format date for Spain locale (es-ES) - Date only
 *
 * Alternative locale for compatibility
 *
 * @param date - Date string or Date object to format
 * @returns Date formatted as DD/MM/YYYY
 *
 * @example
 * formatDateLocaleES("2025-12-25") // "25/12/2025"
 */
export const formatDateLocaleES = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date and time for Spain locale (es-ES)
 *
 * @param date - Date string or Date object to format
 * @returns Date and time formatted as DD/MM/YYYY HH:MM
 *
 * @example
 * formatDateTimeLocaleES("2025-12-25T14:30:00Z") // "25/12/2025 14:30"
 */
export const formatDateTimeLocaleES = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Parse ISO date string to Date object
 *
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Date object
 *
 * @example
 * parseISODate("2025-12-25") // Date object
 */
export const parseISODate = (isoDate: string): Date => {
  return new Date(isoDate)
}

/**
 * Check if a date string is valid
 *
 * @param dateString - Date string to validate
 * @returns true if the date is valid
 *
 * @example
 * isValidDate("2025-12-25") // true
 * isValidDate("invalid") // false
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}
