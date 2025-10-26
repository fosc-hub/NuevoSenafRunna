/**
 * Estado Etapa API Service - MED-01 V2
 *
 * Service for interacting with the estado catalog endpoints.
 * Provides catalog loading, filtering, and estado validation functions.
 *
 * Backend Endpoints:
 * - GET /api/estados-etapa-medida/ - List all estados
 * - GET /api/estados-etapa-medida/{id}/ - Get single estado
 * - GET /api/estados-etapa-medida/{id}/siguiente/ - Get next estado
 * - GET /api/medidas/{id}/estados-permitidos/ - Get allowed estados for measure
 */

import { get } from '@/app/api/apiService'
import type {
  TEstadoEtapaMedida,
  TEstadoEtapaResponse,
  EstadoCatalogQueryParams,
  TipoEtapa,
} from '../types/estado-etapa'
import type { TipoMedida } from '../types/medida-api'

// ============================================================================
// CATALOG ENDPOINTS
// ============================================================================

/**
 * Get all estados from catalog
 *
 * @param params - Query parameters for filtering
 * @returns Array of estado catalog entries
 */
export async function getAllEstados(
  params?: EstadoCatalogQueryParams
): Promise<TEstadoEtapaMedida[]> {
  try {
    // Build query string
    const queryParams = new URLSearchParams()

    if (params?.tipo_medida) {
      queryParams.append('tipo_medida', params.tipo_medida)
    }
    if (params?.tipo_etapa) {
      queryParams.append('tipo_etapa', params.tipo_etapa)
    }
    if (params?.activo !== undefined) {
      queryParams.append('activo', params.activo.toString())
    }
    if (params?.orden) {
      queryParams.append('orden', params.orden.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
      ? `estados-etapa-medida/?${queryString}`
      : 'estados-etapa-medida/'

    console.log('[EstadoEtapaService] Fetching estados from:', url)

    const response = await get<TEstadoEtapaResponse>(url)

    console.log(`[EstadoEtapaService] Fetched ${response.results.length} estados`)

    return response.results
  } catch (error) {
    console.error('[EstadoEtapaService] Error fetching estados:', error)
    throw error
  }
}

/**
 * Get estados applicable to specific measure type and stage
 *
 * This is the primary method for loading estados in components.
 * Automatically filters by activo=true and applicability.
 *
 * @param tipoMedida - Measure type (MPI, MPE, MPJ)
 * @param tipoEtapa - Stage type (APERTURA, etc.)
 * @returns Array of applicable estados, ordered by orden
 */
export async function getEstadosForMedida(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): Promise<TEstadoEtapaMedida[]> {
  try {
    console.log(
      `[EstadoEtapaService] Getting estados for ${tipoMedida} ${tipoEtapa}`
    )

    // MPJ never uses estados
    if (tipoMedida === 'MPJ') {
      console.log('[EstadoEtapaService] MPJ type - returning empty array (no estados)')
      return []
    }

    // MPI Cese doesn't use estados
    if (tipoMedida === 'MPI' && tipoEtapa === 'CESE') {
      console.log('[EstadoEtapaService] MPI CESE - returning empty array (no estados)')
      return []
    }

    // MPE POST_CESE doesn't use estados
    if (tipoMedida === 'MPE' && tipoEtapa === 'POST_CESE') {
      console.log('[EstadoEtapaService] MPE POST_CESE - returning empty array (no estados)')
      return []
    }

    // Fetch estados from catalog
    const estados = await getAllEstados({
      tipo_medida: tipoMedida,
      tipo_etapa: tipoEtapa,
      activo: true,
    })

    // Filter by applicability (double-check client-side)
    const aplicables = estados.filter(
      (estado) =>
        estado.aplica_a_tipos_medida.includes(tipoMedida) &&
        estado.aplica_a_tipos_etapa.includes(tipoEtapa)
    )

    // Sort by orden to ensure correct sequence
    const sorted = aplicables.sort((a, b) => a.orden - b.orden)

    console.log(
      `[EstadoEtapaService] Found ${sorted.length} applicable estados:`,
      sorted.map((e) => `${e.orden}. ${e.codigo}`).join(', ')
    )

    return sorted
  } catch (error) {
    console.error('[EstadoEtapaService] Error getting estados for medida:', error)
    // Return empty array on error to prevent crashes
    return []
  }
}

/**
 * Get single estado by ID
 *
 * @param id - Estado catalog ID
 * @returns Estado catalog entry
 */
export async function getEstadoById(id: number): Promise<TEstadoEtapaMedida> {
  try {
    console.log(`[EstadoEtapaService] Fetching estado ${id}`)

    const estado = await get<TEstadoEtapaMedida>(`estados-etapa-medida/${id}/`)

    console.log(`[EstadoEtapaService] Fetched estado:`, estado.nombre_display)

    return estado
  } catch (error) {
    console.error('[EstadoEtapaService] Error fetching estado:', error)
    throw error
  }
}

/**
 * Get next sequential estado
 *
 * @param currentEstadoId - Current estado ID
 * @returns Next estado or null if no next estado
 */
export async function getNextEstado(
  currentEstadoId: number
): Promise<TEstadoEtapaMedida | null> {
  try {
    console.log(`[EstadoEtapaService] Getting next estado after ${currentEstadoId}`)

    const nextEstado = await get<TEstadoEtapaMedida | null>(
      `estados-etapa-medida/${currentEstadoId}/siguiente/`
    )

    if (nextEstado) {
      console.log(
        `[EstadoEtapaService] Next estado: ${nextEstado.nombre_display}`
      )
    } else {
      console.log('[EstadoEtapaService] No next estado (final state)')
    }

    return nextEstado
  } catch (error) {
    console.error('[EstadoEtapaService] Error getting next estado:', error)
    // Return null on error (assume final state)
    return null
  }
}

// ============================================================================
// VALIDATION HELPERS (CLIENT-SIDE)
// ============================================================================

/**
 * Check if estado is applicable to measure type and stage (client-side validation)
 *
 * @param estado - Estado to check
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @returns True if applicable
 */
export function isEstadoApplicable(
  estado: TEstadoEtapaMedida,
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa
): boolean {
  return (
    estado.aplica_a_tipos_medida.includes(tipoMedida) &&
    estado.aplica_a_tipos_etapa.includes(tipoEtapa)
  )
}

/**
 * Get available next estados from current estado (client-side filtering)
 *
 * @param currentEstado - Current estado (null if no estado yet)
 * @param allEstados - All applicable estados for this measure/stage
 * @returns Array of next estados (empty if final state or invalid)
 */
export function getAvailableNextEstados(
  currentEstado: TEstadoEtapaMedida | null,
  allEstados: TEstadoEtapaMedida[]
): TEstadoEtapaMedida[] {
  // If no current estado, return first estado (orden = 1)
  if (!currentEstado) {
    return allEstados.filter((e) => e.orden === 1)
  }

  // Get next sequential estado (orden + 1)
  const nextOrden = currentEstado.orden + 1
  const nextEstados = allEstados.filter((e) => e.orden === nextOrden)

  return nextEstados
}

// ============================================================================
// CACHING LAYER (OPTIONAL)
// ============================================================================

/**
 * Simple in-memory cache for estados catalog
 * Reduces API calls for frequently accessed data
 */
class EstadoCatalogCache {
  private cache: Map<string, { data: TEstadoEtapaMedida[]; timestamp: number }> =
    new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  getCacheKey(tipoMedida: TipoMedida, tipoEtapa: TipoEtapa): string {
    return `${tipoMedida}:${tipoEtapa}`
  }

  get(tipoMedida: TipoMedida, tipoEtapa: TipoEtapa): TEstadoEtapaMedida[] | null {
    const key = this.getCacheKey(tipoMedida, tipoEtapa)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    console.log(`[EstadoEtapaCache] Cache HIT for ${key}`)
    return cached.data
  }

  set(
    tipoMedida: TipoMedida,
    tipoEtapa: TipoEtapa,
    data: TEstadoEtapaMedida[]
  ): void {
    const key = this.getCacheKey(tipoMedida, tipoEtapa)
    this.cache.set(key, { data, timestamp: Date.now() })
    console.log(`[EstadoEtapaCache] Cached ${data.length} estados for ${key}`)
  }

  clear(): void {
    this.cache.clear()
    console.log('[EstadoEtapaCache] Cache cleared')
  }
}

// Singleton cache instance
const catalogCache = new EstadoCatalogCache()

/**
 * Get estados with caching (recommended for performance)
 *
 * @param tipoMedida - Measure type
 * @param tipoEtapa - Stage type
 * @param skipCache - Force fresh fetch (default: false)
 * @returns Array of applicable estados
 */
export async function getEstadosForMedidaWithCache(
  tipoMedida: TipoMedida,
  tipoEtapa: TipoEtapa,
  skipCache = false
): Promise<TEstadoEtapaMedida[]> {
  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = catalogCache.get(tipoMedida, tipoEtapa)
    if (cached !== null) {
      return cached
    }
  }

  // Fetch from API
  const estados = await getEstadosForMedida(tipoMedida, tipoEtapa)

  // Cache the result
  catalogCache.set(tipoMedida, tipoEtapa, estados)

  return estados
}

/**
 * Clear the estado catalog cache
 * Call this when estados are updated on the backend
 */
export function clearEstadoCache(): void {
  catalogCache.clear()
}

// ============================================================================
// EXPORTS
// ============================================================================

export const estadoEtapaService = {
  // Catalog operations
  getAll: getAllEstados,
  getForMedida: getEstadosForMedida,
  getForMedidaWithCache: getEstadosForMedidaWithCache,
  getById: getEstadoById,
  getNextEstado: getNextEstado,

  // Client-side validation
  isApplicable: isEstadoApplicable,
  getAvailableNext: getAvailableNextEstados,

  // Cache management
  clearCache: clearEstadoCache,
}

export default estadoEtapaService
