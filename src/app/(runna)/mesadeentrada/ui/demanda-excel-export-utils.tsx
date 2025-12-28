import ExcelExportService from "./excel-export-service"
import { formatUnderscoreText } from "@/utils/stringUtils"
import { getCurrentDateISO } from "@/utils/dateUtils"

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
  const currentDate = getCurrentDateISO()
  return ExcelExportService.exportToExcel(formattedData, {
    fileName: `Demandas_${currentDate}`,
    sheetName: "Demandas",
  })
}
