"use client"

import { useMemo } from "react"
import type React from "react"
import { Typography, Grid, Chip, Box, CircularProgress, Alert } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { useApiQuery } from "@/hooks/useApiQuery"
import { SectionCard } from "../medida/shared/section-card"

interface LocalizacionSectionProps {
  legajoData: LegajoDetailResponse
}

export const LocalizacionSection: React.FC<LocalizacionSectionProps> = ({ legajoData }) => {
  // Extract demanda ID from legajoData
  const demandaId = useMemo(() => {
    const demandas = legajoData?.demandas_relacionadas?.resultados || []
    if (demandas.length === 0) {
      console.log("LocalizacionSection - No demandas relacionadas found")
      return null
    }

    const firstDemanda = demandas[0]
    let extractedId: number | null = null

    if (firstDemanda?.demanda?.demanda_id) {
      extractedId = firstDemanda.demanda.demanda_id
    } else if (firstDemanda?.demanda_id) {
      extractedId = firstDemanda.demanda_id
    } else if (firstDemanda?.id) {
      extractedId = firstDemanda.id
    }

    if (!extractedId) {
      console.log("LocalizacionSection - Could not extract demanda ID")
    } else {
      console.log(`LocalizacionSection - Extracted demanda ID: ${extractedId}`)
    }

    return extractedId
  }, [legajoData])

  // Fetch demanda full-detail using TanStack Query
  const { data: demandaDetail, isLoading: loading, error: queryError } = useApiQuery<any>(
    `registro-demanda-form/${demandaId}/full-detail/`,
    undefined,
    {
      enabled: !!demandaId,
    }
  )

  // Extract localizacion from response with fallbacks
  const localizacion = useMemo(() => {
    // If no demanda ID or no response, try fallback
    if (!demandaId || !demandaDetail) {
      if (legajoData?.localizacion_actual?.localizacion) {
        console.log("LocalizacionSection - Using fallback legajo localizacion_actual")
        return legajoData.localizacion_actual.localizacion
      }
      return null
    }

    console.log("LocalizacionSection - Full-detail response:", demandaDetail)

    let foundLocalizacion = null

    // 1. Try from personas array (matching persona ID)
    if (demandaDetail?.personas && legajoData?.persona?.id) {
      const persona = demandaDetail.personas.find((p: any) => p.persona?.id === legajoData.persona.id)
      if (persona?.localizacion) {
        console.log("LocalizacionSection - Using localizacion from persona in personas array")
        foundLocalizacion = persona.localizacion
      }
    }

    // 2. Try from first persona if exists
    if (!foundLocalizacion && demandaDetail?.personas?.[0]?.localizacion) {
      console.log("LocalizacionSection - Using localizacion from first persona")
      foundLocalizacion = demandaDetail.personas[0].localizacion
    }

    // 3. Try root localizacion
    if (!foundLocalizacion && demandaDetail?.localizacion) {
      console.log("LocalizacionSection - Using root localizacion from response")
      foundLocalizacion = demandaDetail.localizacion
    }

    // 4. Fallback to legajo localizacion_actual
    if (!foundLocalizacion && legajoData?.localizacion_actual?.localizacion) {
      console.log("LocalizacionSection - Using fallback legajoData.localizacion_actual.localizacion")
      foundLocalizacion = legajoData.localizacion_actual.localizacion
    }

    console.log("LocalizacionSection - Final localizacion:", foundLocalizacion)
    return foundLocalizacion
  }, [demandaDetail, demandaId, legajoData])

  const error = queryError ? "Error al cargar la información de localización" : null

  if (loading) {
    return (
      <SectionCard title="Localización Actual">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard title="Localización Actual">
        <Alert severity="error">{error}</Alert>
      </SectionCard>
    )
  }

  if (!localizacion) {
    return (
      <SectionCard title="Localización Actual">
        <Alert severity="info">No hay información de localización registrada.</Alert>
      </SectionCard>
    )
  }

  // Build full address
  const buildFullAddress = () => {
    const parts: string[] = []
    if (localizacion.tipo_calle && localizacion.calle) {
      parts.push(`${localizacion.tipo_calle} ${localizacion.calle}`)
    }
    if (localizacion.casa_nro) parts.push(`N° ${localizacion.casa_nro}`)
    if (localizacion.piso_depto) parts.push(`Piso ${localizacion.piso_depto}`)
    if (localizacion.lote) parts.push(`Lote ${localizacion.lote}`)
    if (localizacion.mza) parts.push(`Mza ${localizacion.mza}`)
    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

  return (
    <SectionCard title="Localización Actual">
      <Grid container spacing={3}>
        {/* Dirección completa */}
        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: "primary.light",
              p: 2,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HomeIcon sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Dirección completa
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {buildFullAddress()}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Detalles de ubicación */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Detalles de Ubicación
          </Typography>

          <Grid container spacing={2}>
            {localizacion.tipo_calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.tipo_calle}</Typography>
                </Grid>
              </>
            )}

            {localizacion.calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.calle}</Typography>
                </Grid>
              </>
            )}

            {localizacion.casa_nro && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.casa_nro}</Typography>
                </Grid>
              </>
            )}

            {localizacion.piso_depto && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Piso/Depto:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.piso_depto}</Typography>
                </Grid>
              </>
            )}

            {localizacion.lote && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Lote:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.lote}</Typography>
                </Grid>
              </>
            )}

            {localizacion.mza && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Manzana:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.mza}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        {/* Información administrativa */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Información Administrativa
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Localidad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {localizacion.localidad?.nombre || localizacion.localidad_nombre || "N/A"}
              </Typography>
            </Grid>

            {(localizacion.barrio?.nombre || localizacion.barrio_nombre || localizacion.barrio) && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Barrio:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {localizacion.barrio?.nombre || localizacion.barrio_nombre || localizacion.barrio}
                  </Typography>
                </Grid>
              </>
            )}

            {(localizacion.cpc || localizacion.cpc_nombre) && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPC:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {localizacion.cpc || localizacion.cpc_nombre}
                  </Typography>
                </Grid>
              </>
            )}

            {localizacion.referencia_geo && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Referencia geográfica:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {localizacion.referencia_geo}
                  </Typography>
                </Grid>
              </>
            )}

            {localizacion.geolocalizacion && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Geolocalización:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {localizacion.geolocalizacion}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  )
}
