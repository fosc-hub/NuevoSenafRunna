/**
 * useEtiquetasDocumento — fetches the unified document-label catalog from
 * the backend (TEtiquetaDocumento). Cached with the same TTL as the rest of
 * the catalog dropdowns. Returns activos primero (orden asc).
 */

import type { EtiquetaDocumento } from "@/app/interfaces/etiquetaDocumento"
import { useCatalogData, extractArray } from "./useApiQuery"

export const useEtiquetasDocumento = () => {
  const query = useCatalogData<EtiquetaDocumento[] | { results: EtiquetaDocumento[] }>(
    "etiquetas-documento/",
    { staleTime: 24 * 60 * 60 * 1000 }, // 24h, mismo TTL del cache backend
  )

  const etiquetas = extractArray<EtiquetaDocumento>(query.data).filter(
    (e) => e.activo,
  )

  return {
    ...query,
    etiquetas,
  }
}

/** Identificador estable del default que el backend asigna cuando no se manda etiqueta. */
export const ETIQUETA_DEFAULT_CODIGO = "SIN_CLASIFICAR"
