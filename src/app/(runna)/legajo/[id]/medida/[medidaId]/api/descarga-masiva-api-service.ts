/**
 * GAP-14: Descarga masiva de documentos en ZIP
 *
 * Endpoint: POST /api/repositorio-documentos/descarga-masiva/
 *
 * Body:
 *  {
 *    "adjunto_ids": [
 *      {"tipo": "TIntervencionAdjunto", "id": 1},
 *      ...
 *    ]
 *  }
 *
 * Response: archivo ZIP descargable (Content-Type: application/zip).
 */

import axiosInstance from "@/app/api/utils/axiosInstance"

/**
 * Tipos de adjunto soportados por el endpoint de descarga masiva.
 * Mapeo `tipo_modelo` (en repositorio-documentos) → modelo Django.
 */
export const TIPOS_ADJUNTO_DESCARGA_MASIVA = [
  "TIntervencionAdjunto",
  "TNotaAvalAdjunto",
  "TInformeJuridicoAdjunto",
  "TRatificacionAdjunto",
  "TAdjuntoActividad",
  "TInformeCierreAdjunto",
  "TInformeSeguimientoAdjunto",
  "TDemandaAdjunto",
  "TEvaluacionAdjunto",
] as const

export type TipoAdjuntoDescargaMasiva = (typeof TIPOS_ADJUNTO_DESCARGA_MASIVA)[number]

export interface AdjuntoDescargaMasivaItem {
  tipo: TipoAdjuntoDescargaMasiva | string
  id: number
}

/**
 * Descarga un ZIP con los adjuntos solicitados y dispara la descarga en el browser.
 *
 * @param items Lista de adjuntos a descargar (tipo + id)
 * @param filename Nombre sugerido del archivo descargado
 */
export const descargarAdjuntosMasivo = async (
  items: AdjuntoDescargaMasivaItem[],
  filename = "documentos.zip"
): Promise<void> => {
  if (items.length === 0) {
    throw new Error("No hay documentos seleccionados para descargar")
  }

  const response = await axiosInstance.post(
    "repositorio-documentos/descarga-masiva/",
    { adjunto_ids: items },
    { responseType: "blob" }
  )

  const blob = new Blob([response.data], { type: "application/zip" })
  const url = window.URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    // Liberar el object URL después de un breve delay para que la descarga se complete
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  }
}
