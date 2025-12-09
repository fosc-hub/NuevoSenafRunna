"use client"

import type React from "react"
import { Box, Typography, Grid, Button, Paper, Chip, Avatar } from "@mui/material"
import {
  ArrowForward as ArrowForwardIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"

interface LegajoHeaderProps {
  legajoData: LegajoDetailResponse
  onViewAllPersonalData: () => void
}

export const LegajoHeader: React.FC<LegajoHeaderProps> = ({ legajoData, onViewAllPersonalData }) => {
  // Extract needed data from the backend response
  const persona = legajoData.persona
  const legajo = legajoData.legajo
  const localizacion = legajoData.localizacion_actual?.localizacion
  const asignacion = legajoData.asignaciones_activas?.[0]

  // Helper to get initials
  const getInitials = (nombre: string = "", apellido: string = ""): string => {
    const n = nombre?.charAt(0) || ""
    const a = apellido?.charAt(0) || ""
    return `${n}${a}`.toUpperCase() || "??"
  }

  // Helper to get avatar color
  const getAvatarColor = (nombre: string = ""): string => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ]
    const index = nombre.charCodeAt(0) % colors.length
    return colors[index] || colors[0]
  }

  // Calculate edad
  const calcularEdad = (fechaNacimiento: string | null | undefined): number | null => {
    if (!fechaNacimiento) return null
    try {
      const fecha = new Date(fechaNacimiento)
      const hoy = new Date()
      let edad = hoy.getFullYear() - fecha.getFullYear()
      const mes = hoy.getMonth() - fecha.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--
      }
      return edad
    } catch {
      return null
    }
  }

  const edad = calcularEdad(persona?.fecha_nacimiento) || persona?.edad_aproximada || persona?.edad_calculada

  // Build address string
  const buildAddress = () => {
    if (!localizacion) return "N/A"
    const addressParts: string[] = []
    if (localizacion.tipo_calle && localizacion.calle) {
      addressParts.push(`${localizacion.tipo_calle} ${localizacion.calle}`)
    }
    if (localizacion.casa_nro) addressParts.push(`N° ${localizacion.casa_nro}`)
    if (localizacion.piso_depto) addressParts.push(`Piso ${localizacion.piso_depto}`)
    if (localizacion.barrio_nombre) addressParts.push(localizacion.barrio_nombre)
    return addressParts.length > 0 ? addressParts.join(", ") : "N/A"
  }

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "N/A"
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return fecha
    }
  }

  const calcularDiasDesdeApertura = (fechaApertura: string | undefined) => {
    if (!fechaApertura) return 0
    try {
      const fecha = new Date(fechaApertura)
      const hoy = new Date()
      const diffTime = Math.abs(hoy.getTime() - fecha.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return 0
    }
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
          backgroundColor: legajo?.urgencia === "ALTA" ? "#e53935" : "#1976d2",
        },
      }}
    >
      <Box sx={{ pl: 2, py: 1 }}>
        {/* Header con Avatar y Nombre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: getAvatarColor(persona?.nombre || ""),
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            {getInitials(persona?.nombre, persona?.apellido)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {persona?.nombre} {persona?.apellido}
            </Typography>
            {persona?.nombre_autopercibido && (
              <Typography variant="body2" color="text.secondary">
                "{persona.nombre_autopercibido}"
              </Typography>
            )}
            {/* Chips de estado rápido */}
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Chip
                icon={<BadgeIcon />}
                label={`DNI: ${persona?.dni || "N/A"}`}
                size="small"
                variant="outlined"
              />
              <Chip icon={<PersonIcon />} label={`${edad || "N/A"} años`} size="small" variant="outlined" />
              {legajo?.urgencia === "ALTA" && <Chip label="URGENTE" color="error" size="small" />}
              {asignacion?.zona && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={asignacion.zona.nombre}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              size="small"
              onClick={onViewAllPersonalData}
              sx={{ textTransform: "none" }}
            >
              Ver todos los datos
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Información del Legajo */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Legajo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {legajo?.numero || "N/A"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {formatFecha(legajo?.fecha_apertura)}
                </Typography>
              </Box>
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                {calcularDiasDesdeApertura(legajo?.fecha_apertura)} días desde apertura
              </Typography>
            </Box>
          </Grid>

          {/* Profesional Asignado */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Profesional Asignado
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {asignacion?.user_responsable?.nombre_completo || "Sin asignar"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {asignacion?.zona?.nombre || "Sin zona"}
              </Typography>
            </Box>
          </Grid>

          {/* Ubicación */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ubicación
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {buildAddress()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {localizacion?.localidad_nombre || "N/A"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
