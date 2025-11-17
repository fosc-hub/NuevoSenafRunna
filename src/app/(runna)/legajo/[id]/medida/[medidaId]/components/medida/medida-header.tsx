"use client"

import type React from "react"
import { useState } from "react"
import { Box, Chip, Grid, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

interface MedidaHeaderProps {
  medidaData: {
    tipo: string
    tipo_display?: string  // Display name for the tipo
    numero: string
    fecha_apertura: string
    origen_demanda?: string
    motivo?: string
    actores_intervinientes?: string
    equipos?: string
    articulacion?: string
    persona: {
      nombre: string
      dni: string
    }
    ubicacion: string
    direccion?: string
    juzgado?: string
    nro_sac?: string
    urgencia?: string
    estado_actual?: string
    // MPJ specific fields
    tipo_medida_mpj?: string
    subtipo_medida_mpj?: string
  }
  isActive: boolean
  onViewPersonalData?: () => void
  onFieldChange?: (field: string, value: string) => void
}

export const MedidaHeader: React.FC<MedidaHeaderProps> = ({ medidaData, isActive, onViewPersonalData, onFieldChange }) => {
  const [tipoMedidaMPJ, setTipoMedidaMPJ] = useState(medidaData.tipo_medida_mpj || '')
  const [subtipoMedidaMPJ, setSubtipoMedidaMPJ] = useState(medidaData.subtipo_medida_mpj || '')

  const isMPJ = medidaData.tipo === 'MPJ'

  // Generate subtipo options for MPJ based on tipo
  const getSubtipoOptionsMPJ = () => {
    const options: JSX.Element[] = []

    if (tipoMedidaMPJ === 'NO_PRIVATIVAS') {
      options.push(
        <MenuItem key="ACOMPAÑAMIENTO" value="ACOMPAÑAMIENTO">Acompañamiento comunitario y prevención temprana</MenuItem>,
        <MenuItem key="SUPERVISION" value="SUPERVISION">Supervisión en territorio</MenuItem>,
        <MenuItem key="JUSTICIA_RESTAURATIVA" value="JUSTICIA_RESTAURATIVA">Justicia restaurativa</MenuItem>,
        <MenuItem key="MEDIACION" value="MEDIACION">Mediación penal juvenil</MenuItem>,
        <MenuItem key="LIBERTAD_ASISTIDA" value="LIBERTAD_ASISTIDA">Libertad asistida</MenuItem>,
        <MenuItem key="DISPOSITIVOS" value="DISPOSITIVOS">Dispositivos electrónicos</MenuItem>
      )
    } else if (tipoMedidaMPJ === 'PRIVATIVAS' || tipoMedidaMPJ === 'RESGUARDO') {
      options.push(
        <MenuItem key="INGRESA_CE" value="INGRESA_CE">Ingresa a CE</MenuItem>
      )
    }

    console.log('getSubtipoOptionsMPJ called - tipo:', tipoMedidaMPJ, 'options count:', options.length)
    return options
  }

  const handleTipoMedidaMPJChange = (value: string) => {
    console.log('MPJ Tipo changed to:', value)
    setTipoMedidaMPJ(value)
    setSubtipoMedidaMPJ('') // Reset subtipo when tipo changes
    onFieldChange?.('tipo_medida_mpj', value)
  }

  const handleSubtipoMedidaMPJChange = (value: string) => {
    console.log('MPJ Subtipo changed to:', value)
    setSubtipoMedidaMPJ(value)
    onFieldChange?.('subtipo_medida_mpj', value)
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          backgroundColor: "#2196f3",
        },
      }}
    >
      <Box sx={{ pl: 2, py: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {medidaData.tipo_display || medidaData.tipo}: {medidaData.numero}
              </Typography>
              <Chip
                label={isActive ? "ACTIVA" : "CERRADA"}
                color={isActive ? "primary" : "default"}
                size="small"
                sx={{ fontWeight: 500 }}
              />
              {medidaData.urgencia && (
                <Chip
                  label={`Urgencia: ${medidaData.urgencia}`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              )}
              {medidaData.estado_actual && (
                <Chip
                  label={medidaData.estado_actual}
                  color="info"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Fecha de apertura:
                </Typography>{" "}
                {medidaData.fecha_apertura}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Origen de la demanda:
                </Typography>{" "}
                {medidaData.origen_demanda || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Motivo:
                </Typography>{" "}
                {medidaData.motivo || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Actores intervinientes:
                </Typography>{" "}
                {medidaData.actores_intervinientes || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Equipos:
                </Typography>{" "}
                {medidaData.equipos || "No especificado"}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Articulación:
                </Typography>{" "}
                {medidaData.articulacion || "No especificado"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { md: "right" } }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {medidaData.persona.nombre} | DNI {medidaData.persona.dni}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Ubicación del NNyA:
                </Typography>{" "}
                {medidaData.ubicacion}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Dirección:
                </Typography>{" "}
                {medidaData.direccion || "No especificada"}
              </Typography>

              {medidaData.juzgado && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Juzgado:
                  </Typography>{" "}
                  {medidaData.juzgado}
                </Typography>
              )}

              {medidaData.nro_sac && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Nro. SAC:
                  </Typography>{" "}
                  {medidaData.nro_sac}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* MPJ Specific Fields */}
          {isMPJ && (
            <Grid item xs={12}>
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  Información específica MPJ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Medida (MPJ)</InputLabel>
                      <Select
                        value={tipoMedidaMPJ}
                        onChange={(e) => handleTipoMedidaMPJChange(e.target.value)}
                        label="Tipo de Medida (MPJ)"
                      >
                        <MenuItem value="">Sin especificar</MenuItem>
                        <MenuItem value="NO_PRIVATIVAS">Medidas socioeducativas no privativas de la libertad</MenuItem>
                        <MenuItem value="PRIVATIVAS">Medidas socioeducativas privativas de la libertad</MenuItem>
                        <MenuItem value="RESGUARDO">Medidas socioeducativas de resguardo institucional</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Subtipo de Medida (MPJ)</InputLabel>
                      <Select
                        value={subtipoMedidaMPJ}
                        onChange={(e) => {
                          console.log('Subtipo onChange fired! Event value:', e.target.value)
                          handleSubtipoMedidaMPJChange(e.target.value)
                        }}
                        onOpen={() => console.log('Subtipo dropdown opened. tipoMedidaMPJ:', tipoMedidaMPJ, 'disabled:', !tipoMedidaMPJ)}
                        label="Subtipo de Medida (MPJ)"
                        disabled={!tipoMedidaMPJ}
                      >
                        <MenuItem key="empty" value="">Sin especificar</MenuItem>
                        {getSubtipoOptionsMPJ()}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                endIcon={<ArrowForwardIcon />}
                size="small"
                onClick={onViewPersonalData}
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                Ver todos los datos personales
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
