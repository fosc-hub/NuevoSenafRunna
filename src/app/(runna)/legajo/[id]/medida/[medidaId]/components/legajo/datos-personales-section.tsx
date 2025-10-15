"use client"

import type React from "react"
import { Typography, Paper, Grid, Divider, Chip, Box, IconButton, Tooltip } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import PersonIcon from "@mui/icons-material/Person"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"

interface DatosPersonalesSectionProps {
  legajoData: LegajoDetailResponse
  onEdit?: () => void
}

export const DatosPersonalesSection: React.FC<DatosPersonalesSectionProps> = ({ legajoData, onEdit }) => {
  const persona = legajoData.persona
  const legajo = legajoData.legajo
  const localizacion = legajoData.localizacion_actual?.localizacion
  const asignacion = legajoData.asignaciones_activas?.[0]
  const permisos = legajoData.permisos_usuario
  const { user } = useUser()

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
      {/* Header with Edit button */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Datos Personales
          </Typography>
        </Box>
        {puedeEditar && onEdit && (
          <Tooltip title={`Editar datos personales${isAdmin ? ' (Admin)' : ''}`}>
            <IconButton color="primary" onClick={onEdit} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

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
              <Typography variant="body2">
                {localizacion?.tipo_calle} {localizacion?.calle} {localizacion?.casa_nro || ""}
              </Typography>
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
                Estado:
              </Typography>
              <Typography variant="body1">{legajo?.estado || "N/A"}</Typography>
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
                label={legajo?.urgencia || "MEDIA"}
                color={legajo?.urgencia === "ALTA" ? "error" : "default"}
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
    </Paper>
  )
}
