import type { NnyaData } from "../types/formTypes"
import type { DuplicateSearchRequest } from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"

/**
 * Validadores para el módulo de detección de duplicados (LEG-01)
 */

/**
 * Valida que los datos mínimos estén presentes para realizar búsqueda
 */
export function validateSearchMinimumData(data: Partial<DuplicateSearchRequest>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Nombre y apellido son obligatorios
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push("El nombre es obligatorio para buscar duplicados")
  }

  if (!data.apellido || data.apellido.trim().length === 0) {
    errors.push("El apellido es obligatorio para buscar duplicados")
  }

  // Validar longitud mínima
  if (data.nombre && data.nombre.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres")
  }

  if (data.apellido && data.apellido.trim().length < 2) {
    errors.push("El apellido debe tener al menos 2 caracteres")
  }

  // Si tiene DNI, validar formato
  if (data.dni !== null && data.dni !== undefined) {
    if (data.dni <= 0) {
      errors.push("El DNI debe ser un número válido")
    }
    if (data.dni.toString().length < 7 || data.dni.toString().length > 8) {
      errors.push("El DNI debe tener 7 u 8 dígitos")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida que un NNyA tiene los datos necesarios para detección de duplicados
 */
export function validateNnyaForDuplicateCheck(nnya: Partial<NnyaData>): {
  isValid: boolean
  errors: string[]
  canSkip: boolean
} {
  const errors: string[] = []

  // Si ya está vinculado o marcado para skip, no validar
  if (nnya.legajo_existente_vinculado?.fue_vinculado || nnya.skip_duplicate_check) {
    return {
      isValid: true,
      errors: [],
      canSkip: true,
    }
  }

  // Validar datos mínimos
  if (!nnya.nombre || nnya.nombre.trim().length === 0) {
    errors.push("El nombre es obligatorio")
  }

  if (!nnya.apellido || nnya.apellido.trim().length === 0) {
    errors.push("El apellido es obligatorio")
  }

  return {
    isValid: errors.length === 0,
    errors,
    canSkip: false,
  }
}

/**
 * Valida que la justificación cumple con requisitos mínimos
 */
export function validateJustification(justification: string, minLength: number = 20): {
  isValid: boolean
  error: string | null
  charactersLeft: number
} {
  const trimmed = justification.trim()
  const charactersLeft = minLength - trimmed.length

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "La justificación es obligatoria",
      charactersLeft: minLength,
    }
  }

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `La justificación debe tener al menos ${minLength} caracteres`,
      charactersLeft,
    }
  }

  return {
    isValid: true,
    error: null,
    charactersLeft: 0,
  }
}

/**
 * Valida que el motivo de solicitud de permisos cumple requisitos
 */
export function validatePermisoMotivo(motivo: string, minLength: number = 10): {
  isValid: boolean
  error: string | null
  charactersLeft: number
} {
  const trimmed = motivo.trim()
  const charactersLeft = minLength - trimmed.length

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "El motivo es obligatorio",
      charactersLeft: minLength,
    }
  }

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `El motivo debe tener al menos ${minLength} caracteres`,
      charactersLeft,
    }
  }

  return {
    isValid: true,
    error: null,
    charactersLeft: 0,
  }
}

/**
 * Valida DNI argentino (7-8 dígitos)
 */
export function validateDNI(dni: number | null | undefined): boolean {
  if (dni === null || dni === undefined) {
    return false
  }

  const dniString = dni.toString()
  const length = dniString.length

  // DNI debe tener entre 7 y 8 dígitos
  if (length < 7 || length > 8) {
    return false
  }

  // DNI debe ser solo números
  if (!/^\d+$/.test(dniString)) {
    return false
  }

  // DNI no puede ser 0
  if (dni === 0) {
    return false
  }

  return true
}

/**
 * Formatea errores para mostrar al usuario
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) {
    return ""
  }

  if (errors.length === 1) {
    return errors[0]
  }

  return `Se encontraron ${errors.length} errores:\n${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}`
}

/**
 * Verifica si un NNyA requiere búsqueda de duplicados antes de submit
 */
export function requiresDuplicateCheck(nnya: Partial<NnyaData>): boolean {
  // Si ya está vinculado, no requiere check
  if (nnya.legajo_existente_vinculado?.fue_vinculado) {
    return false
  }

  // Si fue marcado para skip (justificación completada), no requiere check
  if (nnya.skip_duplicate_check) {
    return false
  }

  // Si tiene nombre y apellido, requiere check
  if (nnya.nombre && nnya.apellido) {
    return true
  }

  return false
}
