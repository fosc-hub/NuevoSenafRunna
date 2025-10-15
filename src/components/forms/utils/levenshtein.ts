/**
 * Levenshtein Distance Algorithm
 * Calcula la distancia mínima de ediciones (inserciones, eliminaciones, sustituciones)
 * necesarias para transformar una cadena en otra.
 *
 * Usado para comparar similaridad de nombres y apellidos en LEG-01.
 */

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @returns Número de ediciones necesarias (0 = idénticos)
 *
 * @example
 * levenshteinDistance("Juan", "Jhuan") // 1 (una sustitución)
 * levenshteinDistance("María", "Maria") // 1 (eliminación de acento)
 * levenshteinDistance("Pedro", "Petra") // 2 (dos sustituciones)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Normalizar strings: lowercase y trim
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  // Casos base
  if (s1 === s2) return 0
  if (s1.length === 0) return s2.length
  if (s2.length === 0) return s1.length

  // Crear matriz de distancias
  const matrix: number[][] = []

  // Inicializar primera fila y columna
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }

  // Llenar la matriz usando programación dinámica
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        // Caracteres iguales: copiar valor diagonal
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        // Caracteres diferentes: tomar el mínimo de las tres operaciones + 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // eliminación
        )
      }
    }
  }

  return matrix[s2.length][s1.length]
}

/**
 * Calcula la similaridad como porcentaje (0-100) basado en Levenshtein
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @returns Porcentaje de similaridad (100 = idénticos, 0 = completamente diferentes)
 *
 * @example
 * levenshteinSimilarity("Juan", "Jhuan") // ~80% (muy similares)
 * levenshteinSimilarity("Pedro", "María") // ~0% (muy diferentes)
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)

  if (maxLength === 0) return 100 // Ambos strings vacíos

  const similarity = ((maxLength - distance) / maxLength) * 100
  return Math.round(similarity * 10) / 10 // Redondear a 1 decimal
}

/**
 * Verifica si dos strings son similares según un threshold de distancia
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @param maxDistance Máxima distancia permitida (default: 2)
 * @returns true si la distancia es <= maxDistance
 *
 * @example
 * isSimilar("Juan", "Jhuan", 2) // true (distancia = 1)
 * isSimilar("Pedro", "María", 2) // false (distancia > 2)
 */
export function isSimilar(str1: string, str2: string, maxDistance: number = 2): boolean {
  return levenshteinDistance(str1, str2) <= maxDistance
}

/**
 * Normaliza un string para comparación (lowercase, sin acentos, sin espacios extra)
 * @param str String a normalizar
 * @returns String normalizado
 */
export function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
}

/**
 * Compara dos strings normalizados (sin acentos, case-insensitive)
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @returns Distancia de Levenshtein entre strings normalizados
 */
export function normalizedLevenshteinDistance(str1: string, str2: string): number {
  const normalized1 = normalizeForComparison(str1)
  const normalized2 = normalizeForComparison(str2)
  return levenshteinDistance(normalized1, normalized2)
}
