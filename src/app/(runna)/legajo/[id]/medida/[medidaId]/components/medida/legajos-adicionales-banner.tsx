"use client"

/**
 * GAP-11: Banner contextual de legajos en una medida compartida (MPE/MPJ con SAC).
 *
 * Hace visible al usuario que la medida no es individual sino que se está
 * trabajando sobre VARIOS NNyAs simultáneamente. Resalta el legajo actual
 * (el del URL) y muestra los otros NNyAs alcanzados como chips clickeables
 * para saltar a su vista. Permite vincular o desvincular adicionales.
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
  Tooltip,
} from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import AddLinkIcon from "@mui/icons-material/AddLink"
import CloseIcon from "@mui/icons-material/Close"
import PersonIcon from "@mui/icons-material/Person"
import VisibilityIcon from "@mui/icons-material/Visibility"
import NextLink from "next/link"
import type {
  LegajoAdicionalMedida,
  TipoMedida,
} from "@/app/(runna)/legajo-mesa/types/medida-api"
import { desvincularLegajoAdicional } from "../../api/medida-legajos-api-service"
import { VincularLegajoAdicionalDialog } from "./vincular-legajo-adicional-dialog"

interface PrimarioNnyaBasico {
  id?: number
  nombre?: string
  apellido?: string
  dni?: string | number | null
}

interface LegajosAdicionalesBannerProps {
  legajosAdicionales?: LegajoAdicionalMedida[]
  legajoPrimarioNumero?: string
  legajoPrimarioId?: number
  /** NNyA primario para mostrar el nombre en el chip "estás acá". */
  legajoPrimarioNnya?: PrimarioNnyaBasico
  /** Legajo desde donde se está navegando (URL). Para destacar el chip actual. */
  legajoActualId?: number
  nroSac?: string | null
  medidaId?: number
  medidaTipo?: TipoMedida
  onChange?: () => void
}

interface LegajoChipEntry {
  id: number
  numero: string
  nombre: string
  dni?: string | number | null
  esPrimario: boolean
}

export const LegajosAdicionalesBanner: React.FC<LegajosAdicionalesBannerProps> = ({
  legajosAdicionales,
  legajoPrimarioNumero,
  legajoPrimarioId,
  legajoPrimarioNnya,
  legajoActualId,
  nroSac,
  medidaId,
  medidaTipo,
  onChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null)

  const adicionales = legajosAdicionales ?? []
  // Granularidad: el escenario de SAC compartido aplica tanto a MPJ como a MPE.
  // MPI queda fuera hasta que el backend lo declare soportado.
  const isShareable = medidaTipo === "MPJ" || medidaTipo === "MPE"
  const canManage = isShareable && typeof medidaId === "number"

  if (!isShareable && adicionales.length === 0) {
    return null
  }

  // Lista unificada [primario, ...adicionales] para render. El primario primero
  // siempre. Cada chip puede ser el "actual" (resaltado) si su id coincide con
  // el del URL.
  const allLegajos: LegajoChipEntry[] = []
  if (typeof legajoPrimarioId === "number" && legajoPrimarioNumero) {
    const nombreCompleto = [legajoPrimarioNnya?.nombre, legajoPrimarioNnya?.apellido]
      .filter(Boolean)
      .join(" ")
      .trim()
    allLegajos.push({
      id: legajoPrimarioId,
      numero: legajoPrimarioNumero,
      nombre: nombreCompleto || "NNyA primario",
      dni: legajoPrimarioNnya?.dni,
      esPrimario: true,
    })
  }
  adicionales.forEach((a) =>
    allLegajos.push({
      id: a.legajo_id,
      numero: a.legajo_numero,
      nombre: a.nnya.nombre_completo,
      dni: a.nnya.dni,
      esPrimario: false,
    })
  )

  const legajoActual = allLegajos.find((l) => l.id === legajoActualId)
  const otros = allLegajos.filter((l) => l.id !== legajoActualId)
  const totalNnyas = allLegajos.length

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

  const headerText =
    adicionales.length === 0
      ? `Medida ${medidaTipo ?? ""} individual${nroSac ? ` · SAC ${nroSac}` : ""}`
      : `Medida compartida · ${totalNnyas} NNyAs alcanzados${nroSac ? ` · SAC ${nroSac}` : ""}`

  return (
    <>
      <Alert
        severity={adicionales.length > 0 ? "warning" : "info"}
        icon={<GroupsIcon />}
        sx={{
          mb: 2,
          alignItems: "flex-start",
          // Borde lateral más grueso para que destaque cuando es compartida
          ...(adicionales.length > 0 && {
            borderLeft: "4px solid",
            borderLeftColor: "warning.main",
          }),
        }}
        action={
          canManage ? (
            <Button
              size="small"
              variant="outlined"
              color={adicionales.length > 0 ? "warning" : "info"}
              startIcon={<AddLinkIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Vincular legajo
            </Button>
          ) : undefined
        }
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {headerText}
          </Typography>

          {adicionales.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Si hay hermanos u otros NNyAs alcanzados por el mismo SAC, podés vincularlos a
              esta medida en vez de crear medidas separadas.
            </Typography>
          )}

          {adicionales.length > 0 && (
            <>
              {/* Sub-header: "Estás trabajando desde…" para anclar contexto */}
              {legajoActual && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, mb: 1 }}>
                  <VisibilityIcon fontSize="inherit" color="action" />
                  <Typography variant="caption" color="text.primary">
                    Estás trabajando desde{" "}
                    <strong>{legajoActual.nombre}</strong>{" "}
                    (Legajo {legajoActual.numero}
                    {legajoActual.esPrimario ? " · primario" : ""}).
                  </Typography>
                </Box>
              )}

              {/* Chip "actual" siempre visible para reforzar */}
              {legajoActual && (
                <Box sx={{ mb: 1 }}>
                  <Chip
                    icon={<PersonIcon />}
                    size="small"
                    color="primary"
                    label={
                      <Box component="span" sx={{ display: "inline-flex", gap: 0.75, alignItems: "center" }}>
                        <strong>{legajoActual.nombre}</strong>
                        <span>· Legajo {legajoActual.numero}</span>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ ml: 0.5, fontWeight: 600 }}
                        >
                          (acá)
                        </Typography>
                      </Box>
                    }
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              )}

              {/* "Esta medida también cubre a:" + chips clickeables a otros legajos */}
              {otros.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                    Esta medida también cubre a {otros.length === 1 ? "este NNyA" : `estos ${otros.length} NNyAs`} (mismo SAC).
                    Cualquier cambio grupal impacta a todos.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {otros.map((legajo) => {
                      const unlinking = unlinkingId === legajo.id
                      return (
                        <Tooltip
                          key={legajo.id}
                          title={`Ver legajo ${legajo.numero} de ${legajo.nombre}`}
                          arrow
                        >
                          <MuiLink
                            component={NextLink}
                            href={`/legajo/${legajo.id}`}
                            underline="none"
                          >
                            <Chip
                              size="small"
                              clickable
                              variant="outlined"
                              color={legajo.esPrimario ? "primary" : "default"}
                              label={
                                <Box component="span" sx={{ display: "inline-flex", gap: 0.75, alignItems: "center" }}>
                                  <strong>{legajo.numero}</strong>
                                  <span>·</span>
                                  <span>{legajo.nombre}</span>
                                  {legajo.esPrimario && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="primary"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      (primario)
                                    </Typography>
                                  )}
                                  {legajo.dni && (
                                    <Typography component="span" variant="caption" color="text.secondary">
                                      DNI {legajo.dni}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              // El primario nunca se puede desvincular
                              onDelete={
                                canManage && !legajo.esPrimario
                                  ? (e: React.MouseEvent) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleUnlink(legajo.id)
                                    }
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
                        </Tooltip>
                      )
                    })}
                  </Stack>
                </>
              )}
            </>
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
