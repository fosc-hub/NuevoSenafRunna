"use client"

import type React from "react"
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Chip,
  useTheme,
} from "@mui/material"
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  HelpOutline as UnknownIcon,
} from "@mui/icons-material"
import type { DataComparison, MatchType } from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface LegajoComparisonViewProps {
  /** Datos de comparación del match */
  comparison: DataComparison

  /** Mostrar distancia Levenshtein para campos de texto */
  showLevenshtein?: boolean
}

/**
 * Vista de comparación lado a lado de datos ingresados vs existentes
 *
 * Características:
 * - Grid de campos lado a lado
 * - Iconos visuales según tipo de match (✅ exacto, ⚠️ similar, ❌ diferente)
 * - Distancia Levenshtein visible
 * - Formato de fechas amigable
 *
 * @example
 * ```tsx
 * <LegajoComparisonView
 *   comparison={match.comparacion}
 *   showLevenshtein={true}
 * />
 * ```
 */
const LegajoComparisonView: React.FC<LegajoComparisonViewProps> = ({
  comparison,
  showLevenshtein = true,
}) => {
  const theme = useTheme()

  /**
   * Obtiene el icono según el tipo de match
   */
  const getMatchIcon = (matchType: MatchType) => {
    switch (matchType) {
      case "exacto":
        return <CheckIcon sx={{ color: theme.palette.success.main }} fontSize="small" />
      case "similar":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} fontSize="small" />
      case "diferente":
        return <CancelIcon sx={{ color: theme.palette.error.main }} fontSize="small" />
      case "no_disponible":
        return <UnknownIcon sx={{ color: theme.palette.grey[400] }} fontSize="small" />
      default:
        return null
    }
  }

  /**
   * Obtiene el texto descriptivo del match
   */
  const getMatchText = (matchType: MatchType, levenshteinDistance?: number): string => {
    switch (matchType) {
      case "exacto":
        return "Coincide exactamente"
      case "similar":
        return levenshteinDistance !== undefined
          ? `Similar (${levenshteinDistance} diferencias)`
          : "Similar"
      case "diferente":
        return "No coincide"
      case "no_disponible":
        return "No disponible"
      default:
        return ""
    }
  }

  /**
   * Formatea un valor para mostrar
   */
  const formatValue = (value: any, type: "date" | "dni" | "text"): string => {
    if (value === null || value === undefined) {
      return "No disponible"
    }

    switch (type) {
      case "date":
        try {
          const date = typeof value === "string" ? parseISO(value) : value
          return format(date, "dd/MM/yyyy", { locale: es })
        } catch {
          return value.toString()
        }
      case "dni":
        return value.toString().padStart(8, "0")
      case "text":
      default:
        return value.toString()
    }
  }

  /**
   * Renderiza una fila de comparación
   */
  const renderComparisonRow = (
    label: string,
    fieldComparison: {
      match: MatchType
      input: any
      existente: any
      levenshtein_distance?: number
    },
    type: "date" | "dni" | "text" = "text"
  ) => {
    const matchIcon = getMatchIcon(fieldComparison.match)
    const matchText = getMatchText(fieldComparison.match, fieldComparison.levenshtein_distance)

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderColor:
            fieldComparison.match === "exacto"
              ? theme.palette.success.light
              : fieldComparison.match === "similar"
                ? theme.palette.warning.light
                : theme.palette.grey[300],
          backgroundColor:
            fieldComparison.match === "exacto"
              ? `${theme.palette.success.main}08`
              : fieldComparison.match === "similar"
                ? `${theme.palette.warning.main}08`
                : "transparent",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Label y match icon */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {matchIcon}
              <Typography variant="subtitle2" fontWeight={600}>
                {label}
              </Typography>
            </Box>
            <Chip
              label={matchText}
              size="small"
              variant="outlined"
              sx={{
                mt: 0.5,
                fontSize: "0.7rem",
                height: 20,
                borderColor:
                  fieldComparison.match === "exacto"
                    ? theme.palette.success.main
                    : fieldComparison.match === "similar"
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
                color:
                  fieldComparison.match === "exacto"
                    ? theme.palette.success.main
                    : fieldComparison.match === "similar"
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
              }}
            />
          </Grid>

          {/* Valor ingresado */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tu ingreso:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatValue(fieldComparison.input, type)}
            </Typography>
          </Grid>

          {/* Valor existente */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Legajo existente:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatValue(fieldComparison.existente, type)}
            </Typography>
          </Grid>

          {/* Distancia Levenshtein (solo para campos de texto con similar/diferente) */}
          {showLevenshtein &&
            fieldComparison.levenshtein_distance !== undefined &&
            fieldComparison.match !== "exacto" && (
              <Grid item xs={12} md={1}>
                <Typography variant="caption" color="text.secondary">
                  Dist: {fieldComparison.levenshtein_distance}
                </Typography>
              </Grid>
            )}
        </Grid>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Comparación Detallada
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* DNI */}
      {renderComparisonRow("DNI", comparison.dni, "dni")}

      {/* Nombre */}
      {renderComparisonRow("Nombre", comparison.nombre, "text")}

      {/* Apellido */}
      {renderComparisonRow("Apellido", comparison.apellido, "text")}

      {/* Fecha de Nacimiento */}
      {renderComparisonRow("Fecha de Nacimiento", comparison.fecha_nacimiento, "date")}

      {/* Género (opcional) */}
      {comparison.genero && renderComparisonRow("Género", comparison.genero, "text")}

      {/* Nombre Autopercibido (opcional) */}
      {comparison.nombre_autopercibido &&
        renderComparisonRow("Nombre Autopercibido", comparison.nombre_autopercibido, "text")}

      {/* Leyenda */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Leyenda:</strong>
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
            <Typography variant="caption">Coincide exactamente</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
            <Typography variant="caption">Similar (leves diferencias)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CancelIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
            <Typography variant="caption">No coincide</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <UnknownIcon sx={{ color: theme.palette.grey[400], fontSize: 16 }} />
            <Typography variant="caption">No disponible</Typography>
          </Box>
        </Box>
        {showLevenshtein && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            <strong>Dist:</strong> Distancia de Levenshtein (número de cambios necesarios para
            transformar un texto en otro)
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default LegajoComparisonView
