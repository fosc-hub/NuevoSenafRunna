import ExcelExportService from "../../mesadeentrada/ui/excel-export-service"
import type { IndicadoresLegajo, OficioConSemaforo } from "../types/legajo-api"

/**
 * Format text with underscores for display
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
 * Format oficios with semaphore status for Excel
 */
const formatOficios = (oficios: OficioConSemaforo[]): string => {
  if (!oficios || oficios.length === 0) return "Sin oficios"

  // Group by type and get most critical semaphore
  const oficiosPorTipo: { [key: string]: { count: number; semaforo: string } } = {}

  oficios.forEach(oficio => {
    if (!oficiosPorTipo[oficio.tipo]) {
      oficiosPorTipo[oficio.tipo] = { count: 0, semaforo: oficio.semaforo }
    }
    oficiosPorTipo[oficio.tipo].count++

    // Update to most critical semaphore (rojo > amarillo > verde)
    if (oficio.semaforo === "rojo") {
      oficiosPorTipo[oficio.tipo].semaforo = "rojo"
    } else if (oficio.semaforo === "amarillo" && oficiosPorTipo[oficio.tipo].semaforo !== "rojo") {
      oficiosPorTipo[oficio.tipo].semaforo = "amarillo"
    }
  })

  return Object.entries(oficiosPorTipo)
    .map(([tipo, data]) => `${tipo}: ${data.count} (${data.semaforo.toUpperCase()})`)
    .join("; ")
}

/**
 * Format medidas activas for Excel
 */
const formatMedidasActivas = (medidas: any[]): string => {
  if (!medidas || medidas.length === 0) return "Sin medidas"

  return medidas
    .map(medida => `${medida.tipo_medida || "N/A"} - ${medida.estado || "N/A"}`)
    .join("; ")
}

/**
 * Format plan de trabajo activities for Excel
 */
const formatPlanTrabajo = (actividades: any): string => {
  if (!actividades) return "Sin PT"

  const { pendientes, en_progreso, vencidas, realizadas } = actividades
  const total = pendientes + en_progreso + vencidas + realizadas

  if (total === 0) return "Sin PT"

  return `Total: ${total} (Pend: ${pendientes}, Progr: ${en_progreso}, Venc: ${vencidas}, Real: ${realizadas})`
}

/**
 * Format alertas for Excel
 */
const formatAlertas = (alertas: string[]): string => {
  if (!alertas || alertas.length === 0) return "Sin alertas"
  return alertas.join("; ")
}

/**
 * Export legajos data to Excel with indicators and filter metadata
 */
export const exportLegajosToExcel = (rows: any[], filterMetadata?: { filters: any; totalCount: number }) => {
  // Define field mappings (raw field name -> display name)
  const fieldMappings = {
    id: "ID",
    numero_legajo: "Nº Legajo",
    nombre: "Nombre",
    dni: "DNI",
    prioridad: "Prioridad",
    urgencia: "Urgencia",
    ultimaActualizacion: "Última Actualización",
    localidad: "Localidad",
    zona: "Zona",
    zonaEquipo: "Zona/Equipo",
    estado_legajo: "Estado",
    tipo_legajo: "Tipo",
    profesional_asignado: "Profesional",
    fecha_apertura: "Fecha Apertura",
    adjuntos: "Cantidad de Adjuntos",
    // Indicator fields
    demanda_pi_count: "Cantidad Demandas PI",
    oficios_resumen: "Oficios (Resumen)",
    medidas_activas_resumen: "Medidas Activas",
    medida_andarivel: "Andarivel de Medidas",
    plan_trabajo_resumen: "Plan de Trabajo",
    alertas_resumen: "Alertas",
  }

  // Define formatters for specific fields
  const formatters: Record<string, (value: any, row?: any) => any> = {
    estado_legajo: (value: string) => formatUnderscoreText(value),
    tipo_legajo: (value: string) => formatUnderscoreText(value),
    prioridad: (value: string) => formatUnderscoreText(value),
    urgencia: (value: string) => formatUnderscoreText(value),
    adjuntos: (value: any[]) => (Array.isArray(value) ? value.length : 0),
    // Indicator formatters
    demanda_pi_count: (_value: any, row: any) => row.indicadores?.demanda_pi_count || 0,
    oficios_resumen: (_value: any, row: any) => formatOficios(row.oficios || []),
    medidas_activas_resumen: (_value: any, row: any) => formatMedidasActivas(row.medidas_activas || []),
    medida_andarivel: (_value: any, row: any) => row.indicadores?.medida_andarivel || "Sin medidas",
    plan_trabajo_resumen: (_value: any, row: any) => formatPlanTrabajo(row.indicadores?.pt_actividades),
    alertas_resumen: (_value: any, row: any) => formatAlertas(row.indicadores?.alertas || []),
  }

  // Format the data for export
  const formattedData = ExcelExportService.formatDataForExport(rows, fieldMappings, formatters)

  // Add filter metadata as additional information
  const metadataRows: any[] = []
  if (filterMetadata && filterMetadata.filters) {
    const { filters, totalCount } = filterMetadata
    metadataRows.push({})
    metadataRows.push({ "ID": "=== FILTROS APLICADOS ===" })
    metadataRows.push({ "ID": `Total de registros filtrados: ${rows.length} de ${totalCount}` })

    if (filters.search) {
      metadataRows.push({ "ID": `Búsqueda: "${filters.search}"` })
    }
    if (filters.zona !== null) {
      metadataRows.push({ "ID": `Zona: ${filters.zona}` })
    }
    if (filters.urgencia) {
      metadataRows.push({ "ID": `Prioridad: ${filters.urgencia}` })
    }
    if (filters.fecha_apertura__gte || filters.fecha_apertura__lte) {
      const dateRange = `${filters.fecha_apertura__gte || "..."} a ${filters.fecha_apertura__lte || "..."}`
      metadataRows.push({ "ID": `Fecha Apertura: ${dateRange}` })
    }
    if (filters.id__gte || filters.id__lte || filters.id__gt || filters.id__lt) {
      let idFilter = "ID: "
      if (filters.id__gte && filters.id__lte && filters.id__gte === filters.id__lte) {
        idFilter += `= ${filters.id__gte}`
      } else if (filters.id__gte && filters.id__lte) {
        idFilter += `Entre ${filters.id__gte} y ${filters.id__lte}`
      } else if (filters.id__gt) {
        idFilter += `> ${filters.id__gt}`
      } else if (filters.id__lt) {
        idFilter += `< ${filters.id__lt}`
      } else if (filters.id__gte) {
        idFilter += `>= ${filters.id__gte}`
      } else if (filters.id__lte) {
        idFilter += `<= ${filters.id__lte}`
      }
      metadataRows.push({ "ID": idFilter })
    }

    const booleanFilters = []
    if (filters.tiene_medidas_activas) booleanFilters.push("Con Medidas Activas")
    if (filters.tiene_oficios) booleanFilters.push("Con Oficios")
    if (filters.tiene_plan_trabajo) booleanFilters.push("Con Plan de Trabajo")
    if (filters.tiene_alertas) booleanFilters.push("Con Alertas")
    if (filters.tiene_demanda_pi) booleanFilters.push("Con Demanda (PI)")

    if (booleanFilters.length > 0) {
      metadataRows.push({ "ID": `Filtros: ${booleanFilters.join(", ")}` })
    }

    metadataRows.push({})
    metadataRows.push({ "ID": "=== DATOS ===" })
  }

  // Combine metadata and data
  const dataWithMetadata = [...metadataRows, ...formattedData]

  // Export to Excel
  const currentDate = new Date().toISOString().split("T")[0]
  return ExcelExportService.exportToExcel(dataWithMetadata, {
    fileName: `Legajos_${currentDate}`,
    sheetName: "Legajos",
  })
}

/**
 * @deprecated Use exportLegajosToExcel instead
 */
export const exportDemandasToExcel = exportLegajosToExcel
