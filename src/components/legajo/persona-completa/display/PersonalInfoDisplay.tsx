"use client"

import type React from "react"
import {
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  ContentCopy as ContentCopyIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"
import type { DisplayTabProps } from "../types/persona-completa.types"

// Helper functions
const formatFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "No registrado"
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return fecha || "No registrado"
  }
}

const formatSituacionDNI = (situacion: string | null | undefined): string => {
  if (!situacion) return "N/A"
  return situacion.split("_").join(" ")
}

const formatGenero = (genero: string | null | undefined): string => {
  if (!genero) return "N/A"
  return genero.charAt(0) + genero.slice(1).toLowerCase()
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error("Error al copiar:", error)
  }
}

interface InfoFieldProps {
  label: string
  value: string | number | null | undefined
  icon?: React.ReactNode
  copyable?: boolean
  chip?: boolean
  chipColor?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  icon,
  copyable = false,
  chip = false,
  chipColor = "default",
}) => {
  const displayValue = value ?? "N/A"

  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        {chip ? (
          <Chip label={displayValue} size="small" color={chipColor} variant="outlined" />
        ) : (
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {displayValue}
          </Typography>
        )}
        {copyable && value && (
          <Tooltip title="Copiar">
            <IconButton size="small" onClick={() => copyToClipboard(String(value))}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  )
}

const PersonalInfoDisplay: React.FC<DisplayTabProps> = ({ persona }) => {
  const localizacion = persona.localizacion
  const edad = persona.edad_calculada ?? persona.edad_aproximada

  // Build full address
  const buildAddress = (): string => {
    if (!localizacion) return "No registrada"
    const parts = [
      localizacion.tipo_calle,
      localizacion.calle,
      localizacion.casa_nro ? `N° ${localizacion.casa_nro}` : null,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "No registrada"
  }

  return (
    <Box>
      {/* Información Personal Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Información Personal
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Nombre completo */}
          <Grid item xs={12} md={6}>
            <InfoField
              label="Nombre Completo"
              value={`${persona.nombre} ${persona.apellido}`}
              copyable
            />
          </Grid>

          {/* Nombre autopercibido */}
          {persona.nombre_autopercibido && (
            <Grid item xs={12} md={6}>
              <InfoField
                label="Nombre Autopercibido"
                value={persona.nombre_autopercibido}
              />
            </Grid>
          )}

          {/* DNI */}
          <Grid item xs={12} md={6}>
            <InfoField
              label="DNI"
              value={persona.dni}
              icon={<BadgeIcon color="action" fontSize="small" />}
              copyable
            />
          </Grid>

          {/* Situación DNI */}
          <Grid item xs={12} md={6}>
            <InfoField
              label="Situación DNI"
              value={formatSituacionDNI(persona.situacion_dni)}
              chip
              chipColor={persona.situacion_dni === "VALIDO" ? "success" : "warning"}
            />
          </Grid>

          {/* Fecha de nacimiento */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Fecha de Nacimiento
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon color="action" fontSize="small" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatFecha(persona.fecha_nacimiento)}
                </Typography>
              </Box>
              {edad && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Edad: {edad} años
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Género */}
          <Grid item xs={12} md={6}>
            <InfoField
              label="Género"
              value={formatGenero(persona.genero)}
            />
          </Grid>

          {/* Nacionalidad */}
          <Grid item xs={12} md={6}>
            <InfoField
              label="Nacionalidad"
              value={formatGenero(persona.nacionalidad)}
            />
          </Grid>

          {/* Teléfono */}
          {persona.telefono && (
            <Grid item xs={12} md={6}>
              <InfoField
                label="Teléfono"
                value={persona.telefono}
                icon={<PhoneIcon color="action" fontSize="small" />}
                copyable
              />
            </Grid>
          )}

          {/* Fecha de defunción */}
          {persona.fecha_defuncion && (
            <Grid item xs={12}>
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha de Defunción
                </Typography>
                <Typography variant="body2">
                  {formatFecha(persona.fecha_defuncion)}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Observaciones */}
          {persona.observaciones && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Observaciones
                </Typography>
                <Typography variant="body2">
                  {persona.observaciones}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Ubicación y Contacto Section */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <HomeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ubicación y Contacto
          </Typography>
        </Box>

        {localizacion ? (
          <Grid container spacing={2}>
            {/* Dirección */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Dirección
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {buildAddress()}
                </Typography>
              </Paper>
            </Grid>

            {/* Piso/Depto */}
            {localizacion.piso_depto && (
              <Grid item xs={12} md={6}>
                <InfoField label="Piso/Depto" value={localizacion.piso_depto} />
              </Grid>
            )}

            {/* Manzana/Lote */}
            {(localizacion.mza || localizacion.lote) && (
              <>
                {localizacion.mza && (
                  <Grid item xs={12} md={6}>
                    <InfoField label="Manzana" value={localizacion.mza} />
                  </Grid>
                )}
                {localizacion.lote && (
                  <Grid item xs={12} md={6}>
                    <InfoField label="Lote" value={localizacion.lote} />
                  </Grid>
                )}
              </>
            )}

            {/* Barrio */}
            <Grid item xs={12} md={6}>
              <InfoField label="Barrio" value={localizacion.barrio_nombre} />
            </Grid>

            {/* Localidad */}
            <Grid item xs={12} md={6}>
              <InfoField label="Localidad" value={localizacion.localidad_nombre} />
            </Grid>

            {/* CPC */}
            <Grid item xs={12} md={6}>
              <InfoField label="CPC" value={localizacion.cpc_nombre} />
            </Grid>

            {/* Referencia geográfica */}
            {localizacion.referencia_geo && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Referencia Geográfica
                  </Typography>
                  <Typography variant="body2">
                    {localizacion.referencia_geo}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        ) : (
          <Alert severity="info">
            No hay información de ubicación registrada para esta persona.
          </Alert>
        )}
      </Box>
    </Box>
  )
}

export default PersonalInfoDisplay
