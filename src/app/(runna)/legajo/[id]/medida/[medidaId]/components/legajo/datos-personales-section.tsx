"use client"

import type React from "react"
import { Typography, Grid, Divider, Chip, IconButton, Tooltip, Box } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"
import { SectionCard } from "../medida/shared/section-card"
import { usePersonaLocalizacion } from "../../hooks/usePersonaData"

interface DatosPersonalesSectionProps {
  legajoData: LegajoDetailResponse
  onEdit?: () => void
}

type LocalizacionDisplay = {
  tipo_calle?: string | null
  calle?: string | null
  casa_nro?: string | number | null
  piso_depto?: string | null
  barrio_nombre?: string | null
  localidad_nombre?: string | null
  cpc_nombre?: string | null
  referencia_geo?: string | null
}

export const DatosPersonalesSection: React.FC<DatosPersonalesSectionProps> = ({ legajoData, onEdit }) => {
  const persona = legajoData.persona
  const legajo = legajoData.legajo
  const personaId = persona?.id ?? null
  const asignacion = legajoData.asignaciones_activas?.[0]
  const permisos = legajoData.permisos_usuario
  const { user } = useUser()
  const shouldFetchLocalizacion = !persona?.localizacion
  const { data: fetchedLocalizacion } = usePersonaLocalizacion(personaId, {
    enabled: !!personaId && shouldFetchLocalizacion,
  })

  // @ts-ignore - Ignoring complex nested type mismatch from API
  const localizacion: LocalizacionDisplay | null = (() => {
    if (persona?.localizacion) {
      return persona.localizacion
    }

    if (legajoData.localizacion_actual?.localizacion) {
      return legajoData.localizacion_actual.localizacion
    }

    if (fetchedLocalizacion) {
      return {
        tipo_calle: fetchedLocalizacion.tipo_calle,
        calle: fetchedLocalizacion.calle,
        casa_nro: fetchedLocalizacion.casa_nro,
        piso_depto: fetchedLocalizacion.piso_depto,
        barrio_nombre: fetchedLocalizacion.barrio,
        localidad_nombre: (fetchedLocalizacion as any).localidad?.nombre || null,
        cpc_nombre: fetchedLocalizacion.cpc,
        referencia_geo: fetchedLocalizacion.referencia_geo,
      }
    }

    return null
  })()

  // Determinar si el usuario puede editar
  // Admins (is_superuser o is_staff) bypassean todas las restricciones
  const isAdmin = user?.is_superuser || user?.is_staff
  const puedeEditar = isAdmin || permisos?.puede_editar

  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "No registrado"
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

  const formatSituacionDNI = (situacion: string | null | undefined) => {
    if (!situacion) return "N/A"
    return situacion.split("_").join(" ")
  }

  const formatGenero = (genero: string | null | undefined) => {
    if (!genero) return "N/A"
    return genero.charAt(0) + genero.slice(1).toLowerCase()
  }

  const calcularDiasDesdeApertura = (fechaApertura: string | null | undefined) => {
    if (!fechaApertura) return "N/A"
    try {
      const fecha = new Date(fechaApertura)
      const hoy = new Date()
      const diffTime = Math.abs(hoy.getTime() - fecha.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return "N/A"
    }
  }

  const direccion = localizacion
    ? [localizacion.tipo_calle, localizacion.calle, localizacion.casa_nro]
      .filter((value) => value !== null && value !== undefined && value !== "")
      .join(" ")
      .trim()
    : ""

  return (
    <SectionCard
      title="Datos Personales"
      headerActions={
        puedeEditar && onEdit ? (
          <Tooltip title={`Editar datos personales${isAdmin ? ' (Admin)' : ''}`}>
            <IconButton color="primary" onClick={onEdit} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
        ) : undefined
      }
    >

      <Grid container spacing={2}>
        {/* Información Personal y Ubicación combinadas en 3 columnas */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "primary.main", fontSize: '0.75rem' }}>
            Información General y de Ubicación
          </Typography>
          <Grid container spacing={1}>
            {/* Columna 1 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Nombre completo:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{persona?.nombre || ""} {persona?.apellido || ""}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">DNI:</Typography>
                <Typography variant="body2">{persona?.dni || "N/A"}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Fecha de nacimiento:</Typography>
                <Typography variant="body2">{formatFecha(persona?.fecha_nacimiento)} ({persona?.edad_aproximada || persona?.edad_calculada || "N/A"} años)</Typography>
              </Box>
            </Grid>

            {/* Columna 2 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Dirección:</Typography>
                <Typography variant="body2" sx={{ lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{direccion || "No registrada"}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Barrio/Localidad:</Typography>
                <Typography variant="body2">{localizacion?.barrio_nombre || "N/A"} - {localizacion?.localidad_nombre || "N/A"}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Género/Nacionalidad:</Typography>
                <Typography variant="body2">{formatGenero((persona as any)?.genero?.nombre || persona?.genero)} / {formatGenero((persona as any)?.nacionalidad?.nombre || persona?.nacionalidad)}</Typography>
              </Box>
            </Grid>

            {/* Columna 3 */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Situación DNI:</Typography>
                <Typography variant="body2">{formatSituacionDNI(persona?.situacion_dni)}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">Teléfono:</Typography>
                <Typography variant="body2">{persona?.telefono || "No registrado"}</Typography>
              </Box>
              {persona?.nombre_autopercibido && persona.nombre_autopercibido !== "N/A" && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Nombre autopercibido:</Typography>
                  <Typography variant="body2">{persona.nombre_autopercibido}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Información del Legajo - Más compacta y horizontal */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary" display="block">Nro Legajo:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{legajo?.numero || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary" display="block">Apertura:</Typography>
              <Typography variant="body2">{formatFecha(legajo?.fecha_apertura)}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary" display="block">Días:</Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>{calcularDiasDesdeApertura(legajo?.fecha_apertura)}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary" display="block">Urgencia:</Typography>
              <Chip
                label={legajo?.urgencia?.nombre || "MEDIA"}
                color={legajo?.urgencia?.nombre === "ALTA" ? "error" : "default"}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">Profesional / Zona:</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {asignacion?.user_responsable?.nombre_completo || "Sin asignar"} - {asignacion?.zona?.nombre || "Sin asignar"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  )
}
