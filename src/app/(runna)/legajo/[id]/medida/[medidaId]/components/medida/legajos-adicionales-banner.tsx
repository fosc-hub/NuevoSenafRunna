"use client"

/**
 * GAP-11 Fase 1: Banner de legajos adicionales en una medida.
 *
 * Cuando una medida MPJ vincula varios NNyAs (hermanos compartiendo SAC),
 * este componente muestra los legajos secundarios para que el usuario sepa
 * que la medida es compartida y pueda navegar a cualquiera.
 *
 * Sólo se renderiza si `legajos_adicionales` tiene al menos 1 elemento.
 */

import React from "react"
import { Alert, Box, Chip, Stack, Typography, Link as MuiLink } from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import NextLink from "next/link"
import type { LegajoAdicionalMedida } from "@/app/(runna)/legajo-mesa/types/medida-api"

interface LegajosAdicionalesBannerProps {
  legajosAdicionales?: LegajoAdicionalMedida[]
  /** Legajo primario actual (el que está abierto) — usado para mostrar contexto. */
  legajoPrimarioNumero?: string
  /** Número SAC compartido (si está disponible). */
  nroSac?: string | null
}

export const LegajosAdicionalesBanner: React.FC<LegajosAdicionalesBannerProps> = ({
  legajosAdicionales,
  legajoPrimarioNumero,
  nroSac,
}) => {
  if (!legajosAdicionales || legajosAdicionales.length === 0) {
    return null
  }

  return (
    <Alert
      severity="info"
      icon={<GroupsIcon />}
      sx={{ mb: 2, alignItems: "flex-start" }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Medida compartida con {legajosAdicionales.length} NNyA adicional
          {legajosAdicionales.length === 1 ? "" : "es"}
          {nroSac ? ` (SAC ${nroSac})` : ""}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          Esta medida MPJ aplica a varios NNyAs. Un único informe jurídico,
          ratificación y plan de trabajo cubren a todos los participantes.
          {legajoPrimarioNumero && ` Legajo primario: ${legajoPrimarioNumero}.`}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {legajosAdicionales.map((adicional) => (
            <MuiLink
              key={adicional.legajo_id}
              component={NextLink}
              href={`/legajo/${adicional.legajo_id}`}
              underline="none"
            >
              <Chip
                size="small"
                clickable
                variant="outlined"
                color="info"
                label={
                  <Box component="span" sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                    <strong>{adicional.legajo_numero}</strong>
                    <span>·</span>
                    <span>{adicional.nnya.nombre_completo}</span>
                    {adicional.nnya.dni && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        DNI {adicional.nnya.dni}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </MuiLink>
          ))}
        </Stack>
      </Box>
    </Alert>
  )
}
