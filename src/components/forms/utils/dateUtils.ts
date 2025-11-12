import { parse, format, isValid, parseISO } from "date-fns"

/**
 * Parsea de forma segura un valor de fecha que puede venir en diferentes formatos
 * @param value - Valor a parsear (puede ser Date, string, null, undefined)
 * @returns Date válido o null
 */
export function parseDateSafely(value: any): Date | null {
  // Si es null o undefined, retornar null
  if (value == null) {
    return null
  }

  // Si ya es un Date válido, retornarlo
  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  // Si es un string, intentar parsearlo
  if (typeof value === "string") {
    // Primero intentar con el formato esperado "yyyy-MM-dd"
    try {
      const parsedDate = parse(value, "yyyy-MM-dd", new Date())
      if (isValid(parsedDate)) {
        return parsedDate
      }
    } catch (error) {
      // Continuar con otros intentos
    }

    // Intentar con formato ISO completo (con hora)
    try {
      const isoDate = parseISO(value)
      if (isValid(isoDate)) {
        return isoDate
      }
    } catch (error) {
      // Continuar con otros intentos
    }

    // Intentar crear un Date directamente
    try {
      const directDate = new Date(value)
      if (isValid(directDate)) {
        return directDate
      }
    } catch (error) {
      // Si falla todo, retornar null
    }
  }

  // Si no se pudo parsear, retornar null
  return null
}

/**
 * Formatea de forma segura una fecha al formato yyyy-MM-dd
 * @param date - Fecha a formatear
 * @returns String en formato yyyy-MM-dd o null
 */
export function formatDateSafely(date: Date | null): string | null {
  if (!date || !isValid(date)) {
    return null
  }

  try {
    return format(date, "yyyy-MM-dd")
  } catch (error) {
    return null
  }
}
