"use client"

/**
 * EtapaScopeIndicator
 *
 * Banner contextual que se monta arriba del WorkflowStepper para que el
 * usuario vea de un vistazo si la etapa actual aplica a TODOS los NNyAs
 * vinculados a la medida (grupal) o solo a un subconjunto (específico).
 *
 * Se oculta cuando la medida tiene un único legajo (granularidad no aplica).
 */

import React from "react"
import { Alert, Box, Chip, Stack, Typography } from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import PersonIcon from "@mui/icons-material/Person"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

interface EtapaScopeIndicatorProps {
  /** Lista de IDs de legajos en el scope. Vacío = grupal. */
  legajosAlcance?: number[]
  /** Bandera computada del backend (true = grupal). */
  esGrupal?: boolean
  /** Legajo primario de la medida. */
  legajoPrimarioId?: number
  legajoPrimarioNumero?: string
  legajoPrimarioNombre?: string
  /** Adicionales (GAP-11). */
  legajosAdicionales?: LegajoAdicionalMedida[]
  /** Etiqueta de la etapa (ej: "Innovación") para personalizar el texto. */
  etapaLabel?: string
}

export const EtapaScopeIndicator: React.FC<EtapaScopeIndicatorProps> = ({
  legajosAlcance,
  esGrupal,
  legajoPrimarioId,
  legajoPrimarioNumero,
  legajoPrimarioNombre,
  legajosAdicionales,
  etapaLabel,
}) => {
  const adicionales = legajosAdicionales ?? []
  const hasMultipleLegajos = adicionales.length > 0

  // Si la medida tiene un único NNyA, la granularidad no aplica → no renderizar.
  if (!hasMultipleLegajos) return null

  // Lista unificada [primario, ...adicionales] para resolver labels.
  const allLegajos: Array<{ id: number; numero: string; nombre: string; esPrimario: boolean }> = []
  if (typeof legajoPrimarioId === "number" && legajoPrimarioNumero) {
    allLegajos.push({
      id: legajoPrimarioId,
      numero: legajoPrimarioNumero,
      nombre: legajoPrimarioNombre || "NNyA primario",
      esPrimario: true,
    })
  }
  adicionales.forEach((a) => {
    allLegajos.push({
      id: a.legajo_id,
      numero: a.legajo_numero,
      nombre: a.nnya.nombre_completo,
      esPrimario: false,
    })
  })

  const scopeIds = legajosAlcance ?? []
  // Si el backend marca es_grupal o el scope está vacío → grupal.
  // (es_grupal es la fuente de verdad; legajosAlcance vacío es el espejo.)
  const isGrupal = esGrupal === true || scopeIds.length === 0
  const labelEtapa = etapaLabel ? `Etapa ${etapaLabel}` : "Esta etapa"

  if (isGrupal) {
    return (
      <Alert
        severity="info"
        icon={<GroupsIcon />}
        sx={{
          mb: 2,
          borderLeft: "4px solid",
          borderLeftColor: "info.main",
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {labelEtapa} · GRUPAL — aplica a los {allLegajos.length} NNyAs vinculados
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cualquier cambio en esta etapa (registro de intervención, nota de aval, ratificación)
            impacta a todos los NNyAs por igual.
          </Typography>
        </Box>
      </Alert>
    )
  }

  // Modo "específico": resolver los chips de los legajos en scope.
  const inScope = allLegajos.filter((l) => scopeIds.includes(l.id))
  const outOfScope = allLegajos.filter((l) => !scopeIds.includes(l.id))

  return (
    <Alert
      severity="warning"
      icon={<PersonIcon />}
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "warning.main",
        py: 1,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {labelEtapa} · ESPECÍFICA — aplica solo a {inScope.length} de {allLegajos.length} NNyAs
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Typography variant="caption" color="text.primary">
            Incluidos en el alcance:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {inScope.map((l) => (
              <Chip
                key={l.id}
                size="small"
                icon={<PersonIcon />}
                color="warning"
                variant="filled"
                label={
                  <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
                    <strong>{l.numero}</strong>
                    <span>·</span>
                    <span>{l.nombre}</span>
                    {l.esPrimario && (
                      <Typography component="span" variant="caption" sx={{ fontWeight: 600 }}>
                        (primario)
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </Stack>
        </Box>

        {outOfScope.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="caption" color="text.secondary">
              Fuera del alcance (esta etapa NO los afecta):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {outOfScope.map((l) => (
                <Chip
                  key={l.id}
                  size="small"
                  icon={<PersonIcon />}
                  variant="outlined"
                  label={
                    <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center", opacity: 0.7 }}>
                      <span>{l.numero}</span>
                      <span>·</span>
                      <span>{l.nombre}</span>
                      {l.esPrimario && (
                        <Typography component="span" variant="caption" sx={{ fontWeight: 600 }}>
                          (primario)
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Alert>
  )
}

export default EtapaScopeIndicator
