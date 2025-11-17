"use client"

import type React from "react"
import { Typography, Paper, Grid, Chip, Box } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface LocalizacionSectionProps {
  legajoData: LegajoDetailResponse
}

export const LocalizacionSection: React.FC<LocalizacionSectionProps> = ({ legajoData }) => {
  const localizacion = legajoData.localizacion_actual

  if (!localizacion) {
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
        <Typography variant="body1" color="text.secondary">
          No hay información de localización registrada.
        </Typography>
      </Paper>
    )
  }

  const loc = localizacion.localizacion

  if (!loc) {
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
        <Typography variant="body1" color="text.secondary">
          No hay información de localización registrada.
        </Typography>
      </Paper>
    )
  }

  // Build full address
  const buildFullAddress = () => {
    const parts: string[] = []
    if (loc.tipo_calle && loc.calle) {
      parts.push(`${loc.tipo_calle} ${loc.calle}`)
    }
    if (loc.casa_nro) parts.push(`N° ${loc.casa_nro}`)
    if (loc.piso_depto) parts.push(`Piso ${loc.piso_depto}`)
    if (loc.lote) parts.push(`Lote ${loc.lote}`)
    if (loc.mza) parts.push(`Mza ${loc.mza}`)
    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

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
            {localizacion.principal && (
              <Chip
                label="Principal"
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
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
            {loc.tipo_calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.tipo_calle}</Typography>
                </Grid>
              </>
            )}

            {loc.calle && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Calle:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.calle}</Typography>
                </Grid>
              </>
            )}

            {loc.casa_nro && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.casa_nro}</Typography>
                </Grid>
              </>
            )}

            {loc.piso_depto && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Piso/Depto:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.piso_depto}</Typography>
                </Grid>
              </>
            )}

            {loc.lote && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Lote:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.lote}</Typography>
                </Grid>
              </>
            )}

            {loc.mza && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Manzana:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{loc.mza}</Typography>
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
                {loc.localidad_nombre || "N/A"}
              </Typography>
            </Grid>

            {loc.barrio_nombre && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Barrio:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {loc.barrio_nombre}
                  </Typography>
                </Grid>
              </>
            )}

            {loc.cpc_nombre && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPC:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {loc.cpc_nombre}
                  </Typography>
                </Grid>
              </>
            )}

            {loc.referencia_geo && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Referencia geográfica:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {loc.referencia_geo}
                  </Typography>
                </Grid>
              </>
            )}

            {loc.geolocalizacion && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Geolocalización:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {loc.geolocalizacion}
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
