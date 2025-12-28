/**
 * String Utility Functions
 *
 * Centralized string manipulation utilities to avoid duplication across the codebase.
 * Extracted from multiple files violating DRY principle.
 */

/**
 * Format underscore-separated text to Title Case
 *
 * Converts text like "TIPO_MEDIDA_MPE" to "Tipo Medida Mpe"
 *
 * @param text - Text with underscores to format
 * @returns Formatted text in Title Case, or "N/A" if invalid input
 *
 * @example
 * formatUnderscoreText("TIPO_MEDIDA_MPE") // "Tipo Medida Mpe"
 * formatUnderscoreText("") // "N/A"
 * formatUnderscoreText(null) // "N/A"
 */
export const formatUnderscoreText = (text: any): string => {
  if (!text || typeof text !== "string" || text === "N/A") {
    return "N/A"
  }
  return text
    .split("_")
    .join(" ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Check if a string is non-empty after trimming whitespace
 *
 * @param value - String to validate
 * @returns true if string exists and has non-whitespace content
 *
 * @example
 * isNonEmptyString("  hello  ") // true
 * isNonEmptyString("   ") // false
 * isNonEmptyString(null) // false
 */
export const isNonEmptyString = (value: string | null | undefined): boolean => {
  return Boolean(value && value.trim().length > 0)
}

/**
 * Check if a string meets minimum length requirement
 *
 * @param value - String to validate
 * @param minLength - Minimum required length
 * @returns true if string meets minimum length after trimming
 *
 * @example
 * hasMinLength("hello", 3) // true
 * hasMinLength("  hi  ", 5) // false
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength
}

/**
 * Safely trim a string value, handling null/undefined
 *
 * @param value - String to trim
 * @returns Trimmed string or empty string if null/undefined
 *
 * @example
 * safeTrim("  hello  ") // "hello"
 * safeTrim(null) // ""
 * safeTrim(undefined) // ""
 */
export const safeTrim = (value: string | null | undefined): string => {
  return value?.trim() || ""
}
