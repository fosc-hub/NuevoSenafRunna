import ExcelExportService from "../../mesadeentrada/ui/excel-export-service"

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
 * Export legajos data to Excel
 */
export const exportDemandasToExcel = (rows: any[]) => {
  // Define field mappings (raw field name -> display name)
  const fieldMappings = {
    id: "ID",
    numero_legajo: "Nº Legajo",
    nombre: "Nombre",
    dni: "DNI",
    prioridad: "Prioridad",
    ultimaActualizacion: "Última Actualización",
    localidad: "Localidad",
    zonaEquipo: "Zona/Equipo",
    estado_legajo: "Estado",
    tipo_legajo: "Tipo",
    profesional_asignado: "Profesional",
    fecha_apertura: "Fecha Apertura",
    adjuntos: "Cantidad de Adjuntos",
  }

  // Define formatters for specific fields
  const formatters = {
    estado_legajo: (value: string) => formatUnderscoreText(value),
    tipo_legajo: (value: string) => formatUnderscoreText(value),
    prioridad: (value: string) => formatUnderscoreText(value),
    adjuntos: (value: any[]) => (Array.isArray(value) ? value.length : 0),
  }

  // Format the data for export
  const formattedData = ExcelExportService.formatDataForExport(rows, fieldMappings, formatters)

  // Export to Excel
  const currentDate = new Date().toISOString().split("T")[0]
  return ExcelExportService.exportToExcel(formattedData, {
    fileName: `Legajos_${currentDate}`,
    sheetName: "Legajos",
  })
}
