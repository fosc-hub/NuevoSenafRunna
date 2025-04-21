import ExcelExportService from "./excel-export-service"

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
 * Export demandas data to Excel
 */
export const exportDemandasToExcel = (rows: any[]) => {
  // Define field mappings (raw field name -> display name)
  const fieldMappings = {
    id: "ID",
    score: "Score",
    nombre: "Nombre",
    dni: "DNI",
    calificacion: "Calificación",
    ultimaActualizacion: "Última Actualización",
    localidad: "Localidad",
    zonaEquipo: "Zona/Equipo",
    estado_demanda: "Estado",
    envioRespuesta: "Envío Respuesta",
    objetivoDemanda: "Objetivo de Demanda",
    etiqueta: "Etiqueta",
    adjuntos: "Cantidad de Adjuntos",
  }

  // Define formatters for specific fields
  const formatters = {
    calificacion: (value: string) => formatUnderscoreText(value),
    estado_demanda: (value: string) => formatUnderscoreText(value),
    envioRespuesta: (value: string) => formatUnderscoreText(value),
    objetivoDemanda: (value: string) => formatUnderscoreText(value),
    adjuntos: (value: any[]) => (Array.isArray(value) ? value.length : 0),
  }

  // Format the data for export
  const formattedData = ExcelExportService.formatDataForExport(rows, fieldMappings, formatters)

  // Export to Excel
  const currentDate = new Date().toISOString().split("T")[0]
  return ExcelExportService.exportToExcel(formattedData, {
    fileName: `Demandas_${currentDate}`,
    sheetName: "Demandas",
  })
}
