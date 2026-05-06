"use client"

/**
 * Post-Cese Tab — read-only view of the POST_CESE etapa for a closed MPE.
 *
 * Fires a single GET /api/medidas/{id}/etapa/POST_CESE/ via useEtapaDetail
 * and renders the etapa metadata + the documents the backend already groups
 * under that etapa (intervenciones, notas, informes, ratificaciones — POST_CESE
 * usually has none of those, so each section is hidden when empty).
 *
 * The "Plan de Trabajo" listing already lives below the tab strip in the parent
 * (mpe-tabs.tsx), so this tab does not duplicate it; it just needs to surface
 * that the medida is closed and what was recorded for the post-cese stage.
 */

import React from "react"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import EventNoteIcon from "@mui/icons-material/EventNote"
import { useEtapaDetail } from "../../../hooks/useEtapaDetail"
import type { MedidaDetailResponse } from "../../../types/medida-api"

interface PostCeseTabProps {
  medidaData: {
    id: number
    tipo_medida: "MPE" | "MPI" | "MPJ"
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }
  medidaApiData?: MedidaDetailResponse
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  onMedidaRefetch?: () => void
}

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export const PostCeseTab: React.FC<PostCeseTabProps> = ({
  medidaData,
  medidaApiData,
}) => {
  const {
    etapaDetail,
    isLoading,
    isError,
    error,
    intervenciones,
    notasAval,
    informesJuridicos,
    ratificaciones,
    totalDocuments,
    fechaInicio,
    fechaFin,
    isActiva,
  } = useEtapaDetail(medidaData.id, "POST_CESE")

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error">
        No se pudo cargar la etapa POST_CESE: {error?.message || "Error desconocido"}
      </Alert>
    )
  }

  if (!etapaDetail) {
    return (
      <Alert severity="info">
        Esta medida aún no tiene etapa POST_CESE. Se crea automáticamente cuando
        se cierra el ciclo (envío de informe jurídico en CESE para MPE, o
        ratificación judicial del cese).
      </Alert>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success" icon={<LockIcon />}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Medida cerrada — Etapa POST_CESE en seguimiento
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          La medida {(medidaApiData as any)?.numero_medida || medidaData.numero_medida} ya
          completó su ciclo. Las actividades de seguimiento se gestionan a través
          del Plan de Trabajo (visible más abajo).
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <EventNoteIcon color="primary" />
            <Typography variant="h6">Etapa POST_CESE</Typography>
            <Chip
              size="small"
              label={isActiva ? "Activa" : "Cerrada"}
              color={isActiva ? "info" : "default"}
              variant="outlined"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha de inicio
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(fechaInicio)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha de cierre
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(fechaFin)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Documentos asociados
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {totalDocuments}
              </Typography>
            </Box>
          </Stack>

          {totalDocuments > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.5}>
                {intervenciones.length > 0 && (
                  <Typography variant="body2">
                    • Intervenciones registradas: <strong>{intervenciones.length}</strong>
                  </Typography>
                )}
                {notasAval.length > 0 && (
                  <Typography variant="body2">
                    • Notas de aval: <strong>{notasAval.length}</strong>
                  </Typography>
                )}
                {informesJuridicos.length > 0 && (
                  <Typography variant="body2">
                    • Informes jurídicos: <strong>{informesJuridicos.length}</strong>
                  </Typography>
                )}
                {ratificaciones.length > 0 && (
                  <Typography variant="body2">
                    • Ratificaciones: <strong>{ratificaciones.length}</strong>
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PostCeseTab
