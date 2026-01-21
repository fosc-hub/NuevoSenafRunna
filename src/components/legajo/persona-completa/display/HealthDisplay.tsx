"use client"

import type React from "react"
import {
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material"
import {
  MedicalServices as MedicalIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Coronavirus as VirusIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import type { DisplayTabProps, PersonaEnfermedadEmbedded } from "../types/persona-completa.types"

// Helper to format enum values
const formatEnumValue = (value: string | null | undefined): string => {
  if (!value) return "N/A"
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

interface InfoFieldProps {
  label: string
  value: string | number | null | undefined
  icon?: React.ReactNode
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon }) => (
  <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value ?? "N/A"}
      </Typography>
    </Box>
  </Paper>
)

interface EnfermedadCardProps {
  enfermedad: PersonaEnfermedadEmbedded
  index: number
}

const EnfermedadCard: React.FC<EnfermedadCardProps> = ({ enfermedad, index }) => {
  const hasAttachments =
    (enfermedad.certificado_adjunto?.length || 0) > 0 ||
    (enfermedad.oficio_adjunto?.length || 0) > 0

  return (
    <Accordion defaultExpanded={index === 0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
          <VirusIcon color="warning" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {enfermedad.enfermedad?.nombre || "Enfermedad"}
            </Typography>
            {enfermedad.situacion_salud && (
              <Typography variant="caption" color="text.secondary">
                {enfermedad.situacion_salud.nombre}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {enfermedad.recibe_tratamiento && (
              <Chip label="En tratamiento" size="small" color="info" variant="outlined" />
            )}
            <Chip
              label={formatEnumValue(enfermedad.certificacion)}
              size="small"
              color={enfermedad.certificacion === "TIENE" ? "success" : "default"}
              variant="outlined"
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {/* Información del tratamiento */}
          {enfermedad.informacion_tratamiento && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Información del Tratamiento
                </Typography>
                <Typography variant="body2">
                  {enfermedad.informacion_tratamiento}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Institución sanitaria interviniente */}
          {enfermedad.institucion_sanitaria_interviniente && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocalHospitalIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Institución Interviniente
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {enfermedad.institucion_sanitaria_interviniente.nombre}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Médico tratamiento */}
          {enfermedad.medico_tratamiento && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Médico de Tratamiento
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {enfermedad.medico_tratamiento.nombre}
                </Typography>
                {enfermedad.medico_tratamiento.telefono && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {enfermedad.medico_tratamiento.telefono}
                    </Typography>
                  </Box>
                )}
                {enfermedad.medico_tratamiento.mail && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {enfermedad.medico_tratamiento.mail}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          {/* Archivos adjuntos */}
          {hasAttachments && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <DescriptionIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Documentos Adjuntos
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {enfermedad.certificado_adjunto?.map((cert, idx) => (
                    <Chip
                      key={`cert-${idx}`}
                      label={`Certificado ${idx + 1}`}
                      size="small"
                      color="success"
                      variant="outlined"
                      component={Link}
                      href={cert.archivo}
                      target="_blank"
                      clickable
                    />
                  ))}
                  {enfermedad.oficio_adjunto?.map((oficio, idx) => (
                    <Chip
                      key={`oficio-${idx}`}
                      label={`Oficio ${idx + 1}`}
                      size="small"
                      color="info"
                      variant="outlined"
                      component={Link}
                      href={oficio.archivo}
                      target="_blank"
                      clickable
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

const HealthDisplay: React.FC<DisplayTabProps> = ({ persona }) => {
  const coberturaMedica = persona.cobertura_medica
  const enfermedades = persona.persona_enfermedades || []

  const hasAnyHealthData = coberturaMedica || enfermedades.length > 0

  if (!hasAnyHealthData) {
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <MedicalIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Información de Salud
          </Typography>
        </Box>
        <Alert severity="info">
          No hay información de salud registrada para esta persona.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Cobertura Médica Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <MedicalIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Cobertura Médica
          </Typography>
        </Box>

        {coberturaMedica ? (
          <Grid container spacing={2}>
            {/* Institución Sanitaria */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocalHospitalIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Institución Sanitaria
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {coberturaMedica.institucion_sanitaria?.nombre || "No especificada"}
                </Typography>
              </Paper>
            </Grid>

            {/* Obra Social */}
            <Grid item xs={12} md={6}>
              <InfoField
                label="Obra Social"
                value={formatEnumValue(coberturaMedica.obra_social)}
              />
            </Grid>

            {/* Intervención */}
            <Grid item xs={12} md={6}>
              <InfoField
                label="Tipo de Intervención"
                value={coberturaMedica.intervencion}
              />
            </Grid>

            {/* AUH */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Asignación Universal por Hijo (AUH)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {coberturaMedica.auh ? (
                    <>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Chip label="Sí" size="small" color="success" variant="outlined" />
                    </>
                  ) : (
                    <>
                      <CancelIcon color="error" fontSize="small" />
                      <Chip label="No" size="small" color="default" variant="outlined" />
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Médico Cabecera */}
            {coberturaMedica.medico_cabecera && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Médico de Cabecera
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Nombre
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {coberturaMedica.medico_cabecera.nombre}
                      </Typography>
                    </Grid>
                    {coberturaMedica.medico_cabecera.telefono && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Teléfono
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {coberturaMedica.medico_cabecera.telefono}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {coberturaMedica.medico_cabecera.mail && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Email
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {coberturaMedica.medico_cabecera.mail}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Observaciones */}
            {coberturaMedica.observaciones && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Observaciones Médicas
                  </Typography>
                  <Typography variant="body2">
                    {coberturaMedica.observaciones}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No hay información de cobertura médica registrada.
          </Alert>
        )}
      </Box>

      {/* Enfermedades Section */}
      {enfermedades.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <VirusIcon color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Enfermedades Registradas
              </Typography>
              <Chip
                label={`${enfermedades.length} ${enfermedades.length === 1 ? "enfermedad" : "enfermedades"}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {enfermedades.map((enfermedad, index) => (
                <EnfermedadCard key={enfermedad.id} enfermedad={enfermedad} index={index} />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default HealthDisplay
