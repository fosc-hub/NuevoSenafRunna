"use client"

/**
 * GAP-11 Fase 1: Banner de legajos adicionales en una medida MPJ.
 *
 * Muestra los NNyAs vinculados a la misma medida (SAC compartido) y permite
 * agregar o desvincular legajos adicionales. El legajo primario no se puede
 * desvincular desde acá; se gestiona como cualquier otra medida.
 */

import React, { useState } from "react"
import {
  Alert,
  Box,
  Chip,
  Stack,
  Typography,
  Link as MuiLink,
  Button,
  CircularProgress,
} from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import AddLinkIcon from "@mui/icons-material/AddLink"
import CloseIcon from "@mui/icons-material/Close"
import NextLink from "next/link"
import type {
  LegajoAdicionalMedida,
  TipoMedida,
} from "@/app/(runna)/legajo-mesa/types/medida-api"
import { desvincularLegajoAdicional } from "../../api/medida-legajos-api-service"
import { VincularLegajoAdicionalDialog } from "./vincular-legajo-adicional-dialog"

interface LegajosAdicionalesBannerProps {
  legajosAdicionales?: LegajoAdicionalMedida[]
  legajoPrimarioNumero?: string
  legajoPrimarioId?: number
  nroSac?: string | null
  medidaId?: number
  medidaTipo?: TipoMedida
  onChange?: () => void
}

export const LegajosAdicionalesBanner: React.FC<LegajosAdicionalesBannerProps> = ({
  legajosAdicionales,
  legajoPrimarioNumero,
  legajoPrimarioId,
  nroSac,
  medidaId,
  medidaTipo,
  onChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null)

  const adicionales = legajosAdicionales ?? []
  const isMPJ = medidaTipo === "MPJ"
  const canManage = isMPJ && typeof medidaId === "number"

  if (!isMPJ && adicionales.length === 0) {
    return null
  }

  const handleUnlink = async (legajoId: number) => {
    if (!medidaId) return
    const ok = window.confirm("¿Desvincular este legajo de la medida?")
    if (!ok) return
    setUnlinkingId(legajoId)
    try {
      await desvincularLegajoAdicional(medidaId, legajoId)
      onChange?.()
    } finally {
      setUnlinkingId(null)
    }
  }

  return (
    <>
      <Alert
        severity="info"
        icon={<GroupsIcon />}
        sx={{ mb: 2, alignItems: "flex-start" }}
        action={
          canManage ? (
            <Button
              size="small"
              variant="outlined"
              color="info"
              startIcon={<AddLinkIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Vincular legajo
            </Button>
          ) : undefined
        }
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {adicionales.length === 0
              ? `Medida MPJ sin legajos adicionales${nroSac ? ` (SAC ${nroSac})` : ""}`
              : `Medida compartida con ${adicionales.length} NNyA adicional${
                  adicionales.length === 1 ? "" : "es"
                }${nroSac ? ` (SAC ${nroSac})` : ""}`}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: adicionales.length > 0 ? 1 : 0 }}
          >
            {adicionales.length === 0
              ? "Si hay hermanos u otros NNyAs alcanzados por el mismo SAC, podés vincularlos a esta medida en vez de crear medidas separadas."
              : "Esta medida MPJ aplica a varios NNyAs. Un único informe jurídico, ratificación y plan de trabajo cubren a todos los participantes."}
            {legajoPrimarioNumero && adicionales.length > 0
              ? ` Legajo primario: ${legajoPrimarioNumero}.`
              : ""}
          </Typography>
          {adicionales.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {adicionales.map((adicional) => {
                const unlinking = unlinkingId === adicional.legajo_id
                return (
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
                        <Box component="span" sx={{ display: "inline-flex", gap: 0.75, alignItems: "center" }}>
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
                      onDelete={
                        canManage
                          ? () => handleUnlink(adicional.legajo_id)
                          : undefined
                      }
                      deleteIcon={
                        unlinking ? (
                          <CircularProgress size={14} sx={{ ml: 0.5 }} />
                        ) : (
                          <CloseIcon />
                        )
                      }
                      disabled={unlinking}
                    />
                  </MuiLink>
                )
              })}
            </Stack>
          )}
        </Box>
      </Alert>

      {canManage && (
        <VincularLegajoAdicionalDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          medidaId={medidaId!}
          legajoPrimarioId={legajoPrimarioId}
          legajosAdicionalesIds={adicionales.map((a) => a.legajo_id)}
          onSuccess={() => onChange?.()}
        />
      )}
    </>
  )
}
