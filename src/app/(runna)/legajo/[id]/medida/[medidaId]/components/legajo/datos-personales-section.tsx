"use client"

import type React from "react"
import { Typography, Grid, Divider, Chip, IconButton, Tooltip } from "@mui/material"
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
        localidad_nombre: fetchedLocalizacion.localidad?.nombre || null,
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

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Información Personal
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Nombre completo:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                {persona?.nombre || ""} {persona?.apellido || ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Nombre autopercibido:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{persona?.nombre_autopercibido || "N/A"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                DNI:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{persona?.dni || "N/A"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Situación DNI:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{formatSituacionDNI(persona?.situacion_dni)}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha de nacimiento:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{formatFecha(persona?.fecha_nacimiento)}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Edad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                {persona?.edad_aproximada || persona?.edad_calculada || "N/A"} años
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Género:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{formatGenero(persona?.genero)}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Nacionalidad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{formatGenero(persona?.nacionalidad)}</Typography>
            </Grid>

            {persona?.fecha_defuncion && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de defunción:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="error.main">
                    {formatFecha(persona.fecha_defuncion)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        {/* Ubicación y Contacto */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Ubicación y Contacto
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Dirección:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{direccion || "No registrada"}</Typography>
            </Grid>

            {localizacion?.piso_depto && (
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

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Barrio:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{localizacion?.barrio_nombre || "N/A"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Localidad:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{localizacion?.localidad_nombre || "N/A"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                CPC:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{localizacion?.cpc_nombre || "N/A"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Teléfono:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{persona?.telefono || "No registrado"}</Typography>
            </Grid>

            {localizacion?.referencia_geo && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Referencia:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{localizacion.referencia_geo}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        {/* Información del Legajo */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            Información del Legajo
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Número de legajo:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {legajo?.numero || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Fecha de apertura:
              </Typography>
              <Typography variant="body1">{formatFecha(legajo?.fecha_apertura)}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Días desde apertura:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: "primary.main" }}>
                {calcularDiasDesdeApertura(legajo?.fecha_apertura)} días
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Estado:
              </Typography>
              <Typography variant="body1">
                {(() => {
                  // Safely extract estado string from object or string
                  if (!legajo?.estado) return "N/A"
                  if (typeof legajo.estado === 'string') return legajo.estado
                  if (typeof legajo.estado === 'object' && 'estado' in legajo.estado) {
                    return legajo.estado.estado || "N/A"
                  }
                  return "N/A"
                })()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Profesional asignado:
              </Typography>
              <Typography variant="body1">{asignacion?.user_responsable?.nombre_completo || "Sin asignar"}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Zona asignada:
              </Typography>
              <Typography variant="body1">{asignacion?.zona?.nombre || "Sin asignar"}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Urgencia:
              </Typography>
              <Chip
                label={legajo?.urgencia?.nombre || "MEDIA"}
                color={legajo?.urgencia?.nombre === "ALTA" ? "error" : "default"}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Grid>

            {persona?.observaciones && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Observaciones:
                </Typography>
                <Typography variant="body2">{persona.observaciones}</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  )
}
