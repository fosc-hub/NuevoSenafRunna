"use client"

import type React from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio
} from "@mui/material"
import { useState } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { InformacionEducativaSection } from "../shared/InformacionEducativaSection"
import { InformacionSaludSection } from "../shared/InformacionSaludSection"
import { TalleresSection } from "../shared/TalleresSection"
import { INSTITUTOS_MPJ, getSectoresByInstituto } from "../../../constants/institutos-mpj"
import type { SituacionInstitutoMPJ, CambioLugarResguardo, NotaSeguimiento } from "../../../types/seguimiento-dispositivo"
import { mapEducacionFromDemanda, mapSaludFromDemandaEnhanced } from "../../../utils/seguimiento-mapper"
import { useMemo } from "react"

// Mock data for testing - replace with API calls
const mockCambiosResguardo: CambioLugarResguardo[] = [
  { id: 1, lugar_anterior: "Lugar 1", lugar_nuevo: "Lugar 2", fecha_cambio: "2025-01-15", motivo: "Cambio de sector" },
  { id: 2, lugar_anterior: "Lugar 2", lugar_nuevo: "Lugar 3", fecha_cambio: "2025-02-10", motivo: "Traslado" },
]

const mockNotas: NotaSeguimiento[] = [
  { id: 1, fecha: "2025-01-20", detalle: "Primera visita realizada", autor: "Juan Pérez" },
  { id: 2, fecha: "2025-02-15", detalle: "Seguimiento mensual", autor: "María González" },
]

// Situación del NNyA en Instituto (MPJ specific)
const SituacionInstitutoSection = () => {
  const [instituto, setInstituto] = useState("")
  const [sector, setSector] = useState("")
  const [permiso, setPermiso] = useState(false)
  const [visitaRecibida, setVisitaRecibida] = useState<'SI' | 'NO' | null>(null)
  const [fechaVisita, setFechaVisita] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [sectoresDisponibles, setSectoresDisponibles] = useState<string[]>([])

  const handleInstitutoChange = (institutoId: string) => {
    setInstituto(institutoId)
    setSector("") // Reset sector when instituto changes
    setSectoresDisponibles(getSectoresByInstituto(institutoId))
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Situación del NNyA en Instituto
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Instituto</InputLabel>
              <Select
                value={instituto}
                onChange={(e) => handleInstitutoChange(e.target.value)}
                label="Instituto"
              >
                <MenuItem value="">- Seleccionar -</MenuItem>
                {INSTITUTOS_MPJ.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Sector</InputLabel>
              <Select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                label="Sector"
                disabled={!instituto}
              >
                <MenuItem value="">- Seleccionar -</MenuItem>
                {sectoresDisponibles.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={permiso}
                  onChange={(e) => setPermiso(e.target.checked)}
                />
              }
              label="Permiso Otorgado"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Visita Recibida
              </Typography>
              <RadioGroup
                row
                value={visitaRecibida || ''}
                onChange={(e) => setVisitaRecibida(e.target.value as 'SI' | 'NO')}
              >
                <FormControlLabel value="SI" control={<Radio />} label="Sí" />
                <FormControlLabel value="NO" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>
          </Grid>
          {visitaRecibida === 'SI' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Visita"
                value={fechaVisita}
                onChange={(e) => setFechaVisita(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Guardar Situación
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

// Cambio de Lugar de Resguardo Section (shared between MPE and MPJ)
const CambioLugarResguardoSection = () => {
  const [cambios] = useState<CambioLugarResguardo[]>(mockCambiosResguardo)
  const [selectedLugar, setSelectedLugar] = useState("")
  const [fecha, setFecha] = useState("")
  const [motivo, setMotivo] = useState("")

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Cambio de Lugar de Resguardo
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography sx={{ color: "#6C3EB8", fontWeight: 500, mb: 1 }}>
          <span style={{ color: "#3B3BB3", textDecoration: "underline", cursor: "pointer" }}>
            Ubicación actual: Instituto Central
          </span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fecha de ingreso: 12/12/2024
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Nuevo Lugar de Resguardo"
            value={selectedLugar}
            onChange={(e) => setSelectedLugar(e.target.value)}
            size="small"
          >
            <MenuItem value="">- Seleccionar -</MenuItem>
            {INSTITUTOS_MPJ.map((instituto) => (
              <MenuItem key={instituto.id} value={instituto.id}>
                {instituto.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Cambio"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            size="small"
            placeholder="Motivo del cambio de lugar"
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              sx={{ background: "#6C3EB8", borderRadius: 2, textTransform: "none" }}
            >
              Registrar Cambio
            </Button>
            <Button
              variant="contained"
              sx={{ background: "#3B3BB3", borderRadius: 2, textTransform: "none" }}
            >
              Adjuntar Nota
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {cambios.map((cambio) => (
          <Card key={cambio.id} elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {cambio.lugar_anterior} → {cambio.lugar_nuevo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cambio.fecha_cambio}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Motivo: {cambio.motivo}
                  </Typography>
                </Box>
                <IconButton color="primary" sx={{ backgroundColor: "rgba(25, 118, 210, 0.1)" }}>
                  <AttachFileIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// Notas de Seguimiento Section (shared between MPE and MPJ)
const NotasSeguimientoSection = () => {
  const [notas] = useState<NotaSeguimiento[]>(mockNotas)
  const [nuevaNota, setNuevaNota] = useState("")
  const [fecha, setFecha] = useState("")

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Notas de Seguimiento
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nota"
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            size="small"
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            <Button
              variant="contained"
              sx={{ background: "#6C3EB8", borderRadius: 2, textTransform: "none", flex: 1 }}
            >
              Agregar Nota
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {notas.map((nota) => (
          <Card key={nota.id} elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Nota de Seguimiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {nota.fecha}
                  </Typography>
                  <Typography variant="body2">
                    {nota.detalle}
                  </Typography>
                  {nota.autor && (
                    <Typography variant="caption" color="text.secondary">
                      Autor: {nota.autor}
                    </Typography>
                  )}
                </Box>
                <IconButton color="primary" sx={{ backgroundColor: "rgba(25, 118, 210, 0.1)" }}>
                  <AttachFileIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// Main MPJ Seguimiento Dispositivo Tab
interface SeguimientoDispositivoMPJProps {
  demandaData?: any // Full demanda data from the full-detail endpoint
  personaId?: number // Optional specific persona ID to use
}

export const SeguimientoDispositivoMPJ: React.FC<SeguimientoDispositivoMPJProps> = ({
  demandaData,
  personaId
}) => {
  const [selectedSection, setSelectedSection] = useState<string>("situacion-instituto")

  // Transform demanda data to seguimiento format
  const educacionData = useMemo(() => {
    if (!demandaData) return undefined
    return mapEducacionFromDemanda(demandaData, personaId)
  }, [demandaData, personaId])

  const saludData = useMemo(() => {
    if (!demandaData) return undefined
    return mapSaludFromDemandaEnhanced(demandaData, personaId)
  }, [demandaData, personaId])

  const sidebarOptions = [
    { id: "situacion-instituto", label: "Situación del NNyA" },
    { id: "informacion-educativa", label: "Información Educativa" },
    { id: "informacion-salud", label: "Información de Salud" },
    { id: "talleres", label: "Talleres Recreativos y Sociolaborales" },
    { id: "cambio-lugar", label: "Cambio de Lugar de Resguardo" },
    { id: "notas-seguimiento", label: "Notas de Seguimiento" }
  ]

  const renderContent = () => {
    switch (selectedSection) {
      case "situacion-instituto":
        return <SituacionInstitutoSection />
      case "informacion-educativa":
        return <InformacionEducativaSection data={educacionData} />
      case "informacion-salud":
        return <InformacionSaludSection data={saludData} />
      case "talleres":
        return <TalleresSection maxTalleres={5} />
      case "cambio-lugar":
        return <CambioLugarResguardoSection />
      case "notas-seguimiento":
        return <NotasSeguimientoSection />
      default:
        return <SituacionInstitutoSection />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Sidebar */}
        <Box sx={{ width: 300, flexShrink: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sidebarOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedSection === option.id ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedSection(option.id)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  justifyContent: "flex-start",
                  py: 1.5,
                  px: 2,
                  fontWeight: selectedSection === option.id ? 600 : 400,
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            {renderContent()}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
