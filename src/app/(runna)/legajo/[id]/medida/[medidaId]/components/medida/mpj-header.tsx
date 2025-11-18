"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useState } from "react"
import { SeguimientoDispositivoMPJ } from "./mpj-tabs/seguimiento-dispositivo-tab"

interface MPJHeaderProps {
  medidaData: {
    numero: string
    fecha_apertura: string
    tipo_display?: string
    origen_demanda?: string
    motivo?: string
    actores_intervinientes?: string
    equipos?: string
    articulacion?: string
    persona: {
      nombre: string
      id?: number
    }
    ubicacion: string
    direccion?: string
    juzgado?: string
    nro_sac?: string
    urgencia?: string
    estado_actual?: string
    tipo_medida_mpj?: string
    subtipo_medida_mpj?: string
  }
  demandaData?: any // Full demanda data from the full-detail endpoint
  estados?: {
    apertura: boolean
    proceso: boolean
    cese: boolean
  }
  onFieldChange?: (field: string, value: string) => void
}

export const MPJHeader: React.FC<MPJHeaderProps> = ({ medidaData, demandaData, estados, onFieldChange }) => {
  const [seguimientoModalOpen, setSeguimientoModalOpen] = useState(false)
  const [tipoMedidaMPJ, setTipoMedidaMPJ] = useState(medidaData.tipo_medida_mpj || '')
  const [subtipoMedidaMPJ, setSubtipoMedidaMPJ] = useState(medidaData.subtipo_medida_mpj || '')

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

  // Log current state for debugging
  console.log('MPJHeader render - tipoMedidaMPJ:', tipoMedidaMPJ, 'subtipoMedidaMPJ:', subtipoMedidaMPJ)

  // Generate subtipo options based on tipo
  const getSubtipoOptions = () => {
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

    console.log('getSubtipoOptions called - tipo:', tipoMedidaMPJ, 'options count:', options.length)
    return options
  }

  const getChipColor = (active?: boolean) => {
    return active ? "primary" : "default"
  }

  const getChipVariant = (active?: boolean) => {
    return active ? "filled" : "outlined"
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
      {/* MPJ Title */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {medidaData.tipo_display || "MPJ"}: {medidaData.numero}
        </Typography>
      </Box>

      {/* Estado de Medida Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
            Estado de Medida
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
        </Box>

        {/* Status Chips */}
        {estados && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            <Chip
              label="Apertura"
              color={getChipColor(estados.apertura)}
              variant={getChipVariant(estados.apertura)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label="Proceso"
              color={getChipColor(estados.proceso)}
              variant={getChipVariant(estados.proceso)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label="Cese"
              color={getChipColor(estados.cese)}
              variant={getChipVariant(estados.cese)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        )}

        {/* Information Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: "bold" }}>
                Fecha de apertura: {medidaData.fecha_apertura}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Origen de la demanda:</strong> {medidaData.origen_demanda || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Motivo:</strong> {medidaData.motivo || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Actores intervinientes:</strong> {medidaData.actores_intervinientes || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Equipos:</strong> {medidaData.equipos || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Articulación:</strong> {medidaData.articulacion || "No especificado"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { md: "right" } }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "primary.main" }}>
                {medidaData.persona.nombre}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Ubicación del NNyA:</strong> {medidaData.ubicacion}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Dirección:</strong> {medidaData.direccion || "No especificada"}
              </Typography>
              {medidaData.juzgado && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Juzgado:</strong> {medidaData.juzgado}
                </Typography>
              )}
              {medidaData.nro_sac && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Número de Sac:</strong> {medidaData.nro_sac}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* MPJ Specific Fields */}
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
                  {getSubtipoOptions()}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setSeguimientoModalOpen(true)}
          sx={{
            py: 1.5,
            mt: 3,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "1rem"
          }}
        >
          SEGUIMIENTO EN DISPOSITIVO
        </Button>
      </Box>

      {/* Seguimiento Dispositivo Modal */}
      <Dialog
        open={seguimientoModalOpen}
        onClose={() => setSeguimientoModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '1.5rem',
          position: 'relative',
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          SEGUIMIENTO EN DISPOSITIVO
          <IconButton
            onClick={() => setSeguimientoModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <SeguimientoDispositivoMPJ
            demandaData={demandaData}
            personaId={medidaData.persona?.id}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  )
}
