import * as XLSX from "xlsx"

interface ExportOptions {
  fileName?: string
  sheetName?: string
  includeHeaders?: boolean
}

/**
 * Service for exporting data to Excel (XLSX) format
 */
export const ExcelExportService = {
  /**
   * Export data to Excel file
   * @param data Array of objects to export
   * @param options Export options
   */
  exportToExcel: (data: any[], options: ExportOptions = {}) => {
    if (!data || data.length === 0) {
      console.warn("No data to export")
      return
    }

    const {
      fileName = `Export_${new Date().toISOString().split("T")[0]}`,
      sheetName = "Sheet1",
      includeHeaders = true,
    } = options

    try {
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data, { header: includeHeaders ? undefined : [] })

      // Auto-size columns based on content
      const columnWidths = []
      const maxWidth = 50 // Maximum column width
      const minWidth = 10 // Minimum column width

      // Get all keys from the first object to determine columns
      const keys = Object.keys(data[0])

      // Calculate column widths based on content
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        // Start with the header length
        let maxLength = key.length

        // Check each row's value length
        for (const row of data) {
          const value = row[key]
          const valueStr = value !== null && value !== undefined ? String(value) : ""
          maxLength = Math.max(maxLength, valueStr.length)
        }

        // Apply min/max constraints
        const width = Math.min(Math.max(minWidth, maxLength + 2), maxWidth)
        columnWidths.push({ wch: width })
      }

      // Set column widths
      worksheet["!cols"] = columnWidths

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `${fileName}.xlsx`)

      return true
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      return false
    }
  },

  /**
   * Format data for export, transforming field names and values
   * @param data Raw data array
   * @param fieldMappings Object mapping raw field names to display names
   * @param formatters Object with functions to format specific fields
   */
  formatDataForExport: (
    data: any[],
    fieldMappings: Record<string, string> = {},
    formatters: Record<string, (value: any) => any> = {},
  ) => {
    return data.map((item) => {
      const formattedItem: Record<string, any> = {}

      // Process each field in the item
      for (const [key, value] of Object.entries(item)) {
        // Get the display name from mappings or use the original key
        const displayName = fieldMappings[key] || key

        // Format the value if a formatter exists, otherwise use the original value
        const formattedValue = formatters[key] ? formatters[key](value) : value

        formattedItem[displayName] = formattedValue
      }

      return formattedItem
    })
  },
}

export default ExcelExportService
