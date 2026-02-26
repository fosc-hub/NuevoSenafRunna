"use client"

import type React from "react"
import { useState } from "react"
import { Box, Chip, Grid, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, Stack, Divider } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CancelIcon from "@mui/icons-material/Cancel"
import BusinessIcon from "@mui/icons-material/Business"
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate"
import GroupIcon from "@mui/icons-material/Group"
import EngineeringIcon from "@mui/icons-material/Engineering"
import HubIcon from "@mui/icons-material/Hub"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"
import GavelIcon from "@mui/icons-material/Gavel"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import PersonIcon from "@mui/icons-material/Person"
import AssignmentIcon from "@mui/icons-material/Assignment"
import WarningIcon from "@mui/icons-material/Warning"
import { useUser } from "@/utils/auth/userZustand"
import { useCeseMedida } from "../../hooks/useCeseMedida"
import { CeseMedidaModal } from "./cese-medida-modal"

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
  /** Medida ID for API calls */
  medidaId?: number
  /** Estado de vigencia (VIGENTE, CERRADA, etc.) */
  estadoVigencia?: string
  /** Etapa actual de la medida */
  etapaActual?: {
    tipo_etapa?: string
    estado?: string
  }
  isActive: boolean
  onViewPersonalData?: () => void
  onFieldChange?: (field: string, value: string) => void
  /** Callback to refresh medida data after cese */
  onMedidaRefetch?: () => void
}

export const MedidaHeader: React.FC<MedidaHeaderProps> = ({
  medidaData,
  medidaId,
  estadoVigencia,
  etapaActual,
  isActive,
  onViewPersonalData,
  onFieldChange,
  onMedidaRefetch,
}) => {
  const [tipoMedidaMPJ, setTipoMedidaMPJ] = useState(medidaData.tipo_medida_mpj || '')
  const [subtipoMedidaMPJ, setSubtipoMedidaMPJ] = useState(medidaData.subtipo_medida_mpj || '')
  const [ceseModalOpen, setCeseModalOpen] = useState(false)

  const isMPJ = medidaData.tipo === 'MPJ'
  const isMPI = medidaData.tipo === 'MPI'

  // Get user data for permission check
  const { user } = useUser()
  const isSuperuser = user?.is_superuser || false
  const isJZ = user?.zonas?.some(z => z.jefe) || false
  const canCesarMedida = isSuperuser || isJZ

  // Determine if cese button should be visible
  const showCeseButton = isMPI && estadoVigencia === 'VIGENTE' && canCesarMedida && medidaId

  // Cese medida hook
  const { cesarMPI, isCesandoMPI } = useCeseMedida({
    medidaId: medidaId || 0,
    onSuccess: () => {
      setCeseModalOpen(false)
      onMedidaRefetch?.()
    },
  })

  // Handle cese confirmation
  const handleCeseConfirm = async (observaciones: string, cancelarActividades: boolean) => {
    await cesarMPI(observaciones, cancelarActividades)
  }

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

  // Helper for info items
  const InfoItem = ({ icon: Icon, label, value, color = "text.secondary" }: any) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
      <Icon sx={{ color: "primary.main", fontSize: "1.1rem", mt: 0.2 }} />
      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, display: "block", lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: value ? "text.primary" : "text.disabled" }}>
          {value || "No especificado"}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        mb: 4,
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          backgroundColor: isActive ? "primary.main" : "text.disabled",
          background: isActive ? "linear-gradient(to bottom, #2196f3, #1565c0)" : "linear-gradient(to bottom, #9e9e9e, #616161)",
        },
      }}
    >
      {/* Header section with title and badges */}
      <Box sx={{ p: 2.5, pb: 2, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "grey.100" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <AssignmentIcon color="primary" sx={{ fontSize: "1.5rem" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                {medidaData.tipo_display || medidaData.tipo} {medidaData.numero}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={isActive ? "ACTIVA" : "CERRADA"}
                color={isActive ? "primary" : "default"}
                size="small"
                variant={isActive ? "filled" : "outlined"}
                sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
              />
              {medidaData.urgencia && (
                <Chip
                  icon={<WarningIcon style={{ fontSize: '0.8rem', color: 'inherit' }} />}
                  label={`Urgencia: ${medidaData.urgencia.toUpperCase()}`}
                  color={medidaData.urgencia.toLowerCase().includes('alta') ? "error" : "warning"}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                />
              )}
              {medidaData.estado_actual && (
                <Chip
                  label={medidaData.estado_actual}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20, color: "text.secondary" }}
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {showCeseButton && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => setCeseModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderColor: "error.light",
                }}
              >
                Cesar Medida
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={onViewPersonalData}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                boxShadow: "none",
                "&:hover": { boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)" }
              }}
            >
              Ver Legajo Completo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 2.5, pt: 3 }}>
        {/* Child Name Section - More Prominent */}
        <Box sx={{ mb: 3.5, pl: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: "primary.light",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.15
              }}
            >
              <PersonIcon sx={{ fontSize: "2rem" }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.2 }}>
                {medidaData.persona.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: "0.02em" }}>
                Identificación: <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>DNI {medidaData.persona.dni}</Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3.5, opacity: 0.6 }} />

        <Grid container spacing={4} sx={{ px: 1 }}>
          {/* Column 1: Record Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
              Detalles de la Medida
            </Typography>
            <InfoItem icon={CalendarTodayIcon} label="Fecha de Apertura" value={medidaData.fecha_apertura} />
            <InfoItem icon={BusinessIcon} label="Origen de la Demanda" value={medidaData.origen_demanda} />
            <InfoItem icon={AssignmentLateIcon} label="Motivo de Intervención" value={medidaData.motivo} />
          </Grid>

          {/* Column 2: Intervention/Teams */}
          <Grid item xs={12} md={4}>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
              Equipos e Intervención
            </Typography>
            <InfoItem icon={EngineeringIcon} label="Equipo Responsable" value={medidaData.equipos} />
            <InfoItem icon={GroupIcon} label="Actores Intervinientes" value={medidaData.actores_intervinientes} />
            <InfoItem icon={HubIcon} label="Articulación Institucional" value={medidaData.articulacion} />
          </Grid>

          {/* Column 3: Location/Legal */}
          <Grid item xs={12} md={4}>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
              Ubicación y Datos Judiciales
            </Typography>
            <InfoItem icon={LocationOnIcon} label="Ubicación del NNyA" value={medidaData.ubicacion} />
            <InfoItem icon={HomeIcon} label="Dirección Detallada" value={medidaData.direccion} />
            {medidaData.juzgado && <InfoItem icon={GavelIcon} label="Juzgado Interviniente" value={medidaData.juzgado} />}
            {medidaData.nro_sac && <InfoItem icon={AccountBalanceIcon} label="Expediente (Nro. SAC)" value={medidaData.nro_sac} />}
          </Grid>
        </Grid>

        {/* MPJ Specific Fields */}
        {isMPJ && (
          <Box sx={{ mt: 3, p: 2.5, pt: 2, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'primary.dark', display: "flex", alignItems: "center", gap: 1 }}>
              <GavelIcon sx={{ fontSize: "1.2rem" }} /> Información Específica Penal Juvenil
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ bgcolor: "background.paper" }}>
                  <InputLabel>Tipo de Medida (MPJ)</InputLabel>
                  <Select
                    value={tipoMedidaMPJ}
                    onChange={(e) => handleTipoMedidaMPJChange(e.target.value)}
                    label="Tipo de Medida (MPJ)"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="NO_PRIVATIVAS">No privativas de la libertad</MenuItem>
                    <MenuItem value="PRIVATIVAS">Privativas de la libertad</MenuItem>
                    <MenuItem value="RESGUARDO">Resguardo institucional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ bgcolor: "background.paper" }}>
                  <InputLabel>Subtipo de Medida (MPJ)</InputLabel>
                  <Select
                    value={subtipoMedidaMPJ}
                    onChange={(e) => handleSubtipoMedidaMPJChange(e.target.value)}
                    label="Subtipo de Medida (MPJ)"
                    disabled={!tipoMedidaMPJ}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    {getSubtipoOptionsMPJ()}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Cese Medida Modal */}
      {medidaId && (
        <CeseMedidaModal
          open={ceseModalOpen}
          onClose={() => setCeseModalOpen(false)}
          tipoMedida="MPI"
          onConfirm={handleCeseConfirm}
          isLoading={isCesandoMPI}
        />
      )}
    </Paper>
  )
}
