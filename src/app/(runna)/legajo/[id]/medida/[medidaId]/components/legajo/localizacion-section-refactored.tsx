"use client"

import type React from "react"
import { Typography, Paper, Grid, Box, CircularProgress, Alert } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { usePersonaLocalizacion } from "../../hooks/usePersonaData"
import { buildFullAddress, getLocalidadNombre } from "../../api/localizacion-api-service"

interface LocalizacionSectionProps {
  legajoData: LegajoDetailResponse
}

export const LocalizacionSection: React.FC<LocalizacionSectionProps> = ({ legajoData }) => {
  // Get persona ID from legajo data
  const personaId = legajoData?.persona?.id

  // DEBUG: Log component render and persona ID
  console.log("🔍 LocalizacionSection REFACTORED rendering with personaId:", personaId)
  console.log("🔍 Full legajoData:", legajoData)

  // Fetch localization using React Query hook
  const { data: localizacion, isLoading, error } = usePersonaLocalizacion(personaId, {
    enabled: !!personaId,
  })

  // DEBUG: Log hook results
  console.log("🔍 usePersonaLocalizacion results:", { localizacion, isLoading, error })

  // Loading state
  if (isLoading) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Paper>
    )
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Alert severity="error">Error al cargar la información de localización</Alert>
      </Paper>
    )
  }

  // No data state (with fallback to legajo localizacion_actual)
  const displayLocalizacion = localizacion || legajoData?.localizacion_actual?.localizacion

  if (!displayLocalizacion) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Alert severity="info">No hay información de localización registrada.</Alert>
      </Paper>
    )
  }

  // Build full address string
  const fullAddress = buildFullAddress(displayLocalizacion)
  const localidadNombre = getLocalidadNombre(displayLocalizacion)

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Localización Actual
            </Typography>
          </Box>
        </Grid>

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
                {fullAddress}
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
            {displayLocalizacion.tipo_calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.tipo_calle}</Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.calle}</Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.casa_nro && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.casa_nro}</Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.piso_depto && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Piso/Depto:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.piso_depto}</Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.lote && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Lote:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.lote}</Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.mza && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Manzana:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{displayLocalizacion.mza}</Typography>
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
                {localidadNombre}
              </Typography>
            </Grid>

            {displayLocalizacion.barrio && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Barrio:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayLocalizacion.barrio}
                  </Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.cpc && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPC:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {displayLocalizacion.cpc}
                  </Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.referencia_geo && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Referencia geográfica:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {displayLocalizacion.referencia_geo}
                  </Typography>
                </Grid>
              </>
            )}

            {displayLocalizacion.geolocalizacion && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Geolocalización:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {displayLocalizacion.geolocalizacion}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}
