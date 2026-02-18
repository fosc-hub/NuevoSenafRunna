"use client"

/**
 * OrganoJudicialSection - Órgano Judicial section with placeholder fields
 *
 * Contains fields that are not yet implemented in the backend:
 * - Tipo de Órgano
 * - Departamento Judicial
 * - Órgano Judicial
 * - Delitos (multi-select)
 *
 * All fields are disabled and show "Próximamente" tooltips.
 */

import type React from "react"
import { Box, Grid, Typography, Paper, alpha } from "@mui/material"
import { Info as InfoIcon } from "@mui/icons-material"
import {
  PlaceholderAutocomplete,
  PlaceholderMultiSelect,
} from "./PlaceholderField"
import type { OrganoJudicialSectionProps } from "../types/carga-oficios.types"

const OrganoJudicialSection: React.FC<OrganoJudicialSectionProps> = ({
  // readOnly prop is reserved for future use when backend implements these fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readOnly = false,
}) => {
  return (
    <Box>
      {/* Info banner about upcoming features */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
          borderRadius: 1,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <InfoIcon sx={{ color: "info.main", fontSize: 20, mt: 0.25 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ color: "info.main", fontWeight: 600, mb: 0.5 }}>
            Campos en desarrollo
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Los siguientes campos estarán disponibles próximamente cuando se complete la
            integración con el sistema judicial. Por ahora, puede continuar con los demás campos
            del formulario.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Row 1: Tipo de Órgano + Departamento Judicial */}
        <Grid item xs={12} md={6}>
          <PlaceholderAutocomplete
            label="Tipo de Órgano"
            tooltip="Selección del tipo de órgano judicial (Juzgado, Fiscalía, etc.)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PlaceholderAutocomplete
            label="Departamento Judicial"
            tooltip="Circunscripción judicial correspondiente al caso"
          />
        </Grid>

        {/* Row 2: Órgano Judicial (full width) */}
        <Grid item xs={12}>
          <PlaceholderAutocomplete
            label="Órgano Judicial"
            tooltip="Órgano judicial específico que emite el oficio"
          />
        </Grid>

        {/* Row 3: Delitos (multi-select) */}
        <Grid item xs={12}>
          <PlaceholderMultiSelect
            label="Delitos"
            tooltip="Delitos relacionados con el caso (selección múltiple)"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrganoJudicialSection
