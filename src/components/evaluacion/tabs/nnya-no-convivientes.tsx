"use client"

import type React from "react"

import {
  Paper,
  Typography,
  TextField,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import { useState } from "react"

interface NnyaNoConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
  LegajoRUNNA: string
  Barrio: string
  Calle: string
  NumeroCasa: string
  nombre?: string
  apellido?: string
  fechaDefuncion?: string | null
  edadAproximada?: string
  situacionDni?: string
  genero?: string
  observaciones?: string
  useDefaultLocalizacion?: boolean
  localizacion?: any
  educacion?: any
  cobertura_medica?: any
  persona_enfermedades?: any[]
  demanda_persona?: any
  condicionesVulnerabilidad?: any[]
  vulneraciones?: any[]
  nacionalidad?: string
  persona?: any
}

interface NnyaNoConvivientesProps {
  nnyaNoConvivientes: NnyaNoConviviente[]
  setNnyaNoConvivientes: React.Dispatch<React.SetStateAction<NnyaNoConviviente[]>>
}

export default function NnyaNoConvivientes({ nnyaNoConvivientes, setNnyaNoConvivientes }: NnyaNoConvivientesProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleAccordionChange = (index: number) => {
    setExpandedId(expandedId === index ? null : index)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        NNYA No Convivientes
      </Typography>

      {/* Lista de NNYAs con detalles expandibles */}
      {nnyaNoConvivientes.map((nnya, index) => (
        <Accordion
          key={index}
          expanded={expandedId === index}
          onChange={() => handleAccordionChange(index)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Typography sx={{ fontWeight: "bold" }}>
                {nnya.ApellidoNombre} - DNI: {nnya.DNI}
              </Typography>
              <Chip label={nnya.VinculoConNNYAPrincipal} size="small" color="primary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Información personal */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información Personal
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  <TextField
                    label="Nombre"
                    value={nnya.nombre || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Apellido"
                    value={nnya.apellido || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Fecha de Nacimiento"
                    value={nnya.FechaNacimiento || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Edad Aproximada"
                    value={nnya.edadAproximada || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Género"
                    value={nnya.genero || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Situación DNI"
                    value={nnya.situacionDni || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Nacionalidad"
                    value={nnya.nacionalidad || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Legajo RUNNA"
                    value={nnya.LegajoRUNNA || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  {nnya.fechaDefuncion && (
                    <TextField
                      label="Fecha de Defunción"
                      value={nnya.fechaDefuncion}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                  {nnya.persona && nnya.persona.nombre_autopercibido && (
                    <TextField
                      label="Nombre Autopercibido"
                      value={nnya.persona.nombre_autopercibido}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Localización */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Localización
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  <TextField
                    label="Calle"
                    value={nnya.localizacion?.calle || nnya.Calle || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Tipo de Calle"
                    value={nnya.localizacion?.tipo_calle || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Número"
                    value={nnya.localizacion?.casa_nro || nnya.NumeroCasa || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Piso/Depto"
                    value={nnya.localizacion?.piso_depto || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Barrio"
                    value={nnya.localizacion?.barrio || nnya.Barrio || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Localidad"
                    value={nnya.localizacion?.localidad || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Referencia Geográfica"
                    value={nnya.localizacion?.referencia_geo || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Geolocalización"
                    value={nnya.localizacion?.geolocalizacion || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="CPC"
                    value={nnya.localizacion?.cpc || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Manzana"
                    value={nnya.localizacion?.mza || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Lote"
                    value={nnya.localizacion?.lote || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  {nnya.localizacion?.id && (
                    <TextField
                      label="ID Localización"
                      value={nnya.localizacion.id}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Educación */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Educación
                </Typography>
                {nnya.educacion ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <TextField
                      label="Institución Educativa"
                      value={nnya.educacion.institucion_educativa?.nombre || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Nivel"
                      value={nnya.educacion.nivel_alcanzado || nnya.educacion.nivel || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Curso"
                      value={nnya.educacion.ultimo_cursado || nnya.educacion.curso || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Turno"
                      value={nnya.educacion.turno || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Escolarizado"
                      value={nnya.educacion.esta_escolarizado ? "Sí" : "No"}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Tipo de Escuela"
                      value={nnya.educacion.tipo_escuela || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    {nnya.educacion.comentarios_educativos && (
                      <TextField
                        label="Comentarios"
                        value={nnya.educacion.comentarios_educativos}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        InputProps={{ readOnly: true }}
                        sx={{ gridColumn: "span 2" }}
                      />
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay información educativa disponible
                  </Typography>
                )}
              </Grid>

              {/* Cobertura médica */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Cobertura Médica
                </Typography>
                {nnya.cobertura_medica ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <TextField
                      label="Obra Social"
                      value={nnya.cobertura_medica.obra_social || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Institución Sanitaria"
                      value={
                        nnya.cobertura_medica.institucion_sanitaria?.nombre ||
                        nnya.cobertura_medica.institucion_sanitaria_nombre ||
                        ""
                      }
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Tipo de Intervención"
                      value={nnya.cobertura_medica.intervencion || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="AUH"
                      value={nnya.cobertura_medica.auh ? "Sí" : "No"}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    {nnya.cobertura_medica.medico_cabecera && (
                      <TextField
                        label="Médico de Cabecera"
                        value={nnya.cobertura_medica.medico_cabecera.nombre || ""}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    )}
                    {nnya.cobertura_medica.observaciones && (
                      <TextField
                        label="Observaciones"
                        value={nnya.cobertura_medica.observaciones}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        InputProps={{ readOnly: true }}
                        sx={{ gridColumn: "span 2" }}
                      />
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay información de cobertura médica disponible
                  </Typography>
                )}
              </Grid>

              {/* Enfermedades */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Enfermedades
                </Typography>
                {nnya.persona_enfermedades && nnya.persona_enfermedades.length > 0 ? (
                  <Box>
                    {nnya.persona_enfermedades.map((enfermedad, idx) => (
                      <Box key={idx} sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                        <Grid container spacing={2}>
                          {/* Información básica de la enfermedad */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Información General
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                              <TextField
                                label="Enfermedad"
                                value={enfermedad.enfermedad?.nombre || "No especificada"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Certificación"
                                value={enfermedad.certificacion || "No especificada"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Recibe Tratamiento"
                                value={enfermedad.recibe_tratamiento ? "Sí" : "No"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Situación Salud"
                                value={enfermedad.situacion_salud || "No especificada"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                            </Box>
                            {enfermedad.informacion_tratamiento && (
                              <TextField
                                label="Información del Tratamiento"
                                value={enfermedad.informacion_tratamiento}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                margin="normal"
                                InputProps={{ readOnly: true }}
                              />
                            )}
                            {enfermedad.beneficios_gestionados && (
                              <TextField
                                label="Beneficios Gestionados"
                                value={enfermedad.beneficios_gestionados}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                margin="normal"
                                InputProps={{ readOnly: true }}
                              />
                            )}
                          </Grid>

                          {/* Institución y médico */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Institución y Médico Tratante
                            </Typography>
                            {enfermedad.institucion_sanitaria_interviniente && (
                              <TextField
                                label="Institución Sanitaria Interviniente"
                                value={enfermedad.institucion_sanitaria_interviniente.nombre || ""}
                                fullWidth
                                size="small"
                                margin="normal"
                                InputProps={{ readOnly: true }}
                              />
                            )}
                            {enfermedad.medico_tratamiento && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                  Médico Tratante:
                                </Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                                  <TextField
                                    label="Nombre"
                                    value={enfermedad.medico_tratamiento.nombre || ""}
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                  <TextField
                                    label="Teléfono"
                                    value={enfermedad.medico_tratamiento.telefono || ""}
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                  <TextField
                                    label="Email"
                                    value={enfermedad.medico_tratamiento.mail || ""}
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                    sx={{ gridColumn: "span 2" }}
                                  />
                                </Box>
                              </Box>
                            )}
                          </Grid>

                          {/* Adjuntos */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Documentos Adjuntos
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" gutterBottom>
                                  Oficios:
                                </Typography>
                                {enfermedad.oficio_adjunto && enfermedad.oficio_adjunto.length > 0 ? (
                                  <List dense>
                                    {enfermedad.oficio_adjunto.map((adjunto: any, adjIdx: number) => (
                                      <ListItem key={adjIdx}>
                                        <ListItemText
                                          primary={
                                            <Link href={adjunto.archivo} target="_blank" rel="noopener">
                                              {adjunto.archivo
                                                ? adjunto.archivo.split("/").pop()
                                                : `Adjunto ${adjIdx + 1}`}
                                            </Link>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay oficios adjuntos
                                  </Typography>
                                )}
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" gutterBottom>
                                  Certificados:
                                </Typography>
                                {enfermedad.certificado_adjunto && enfermedad.certificado_adjunto.length > 0 ? (
                                  <List dense>
                                    {enfermedad.certificado_adjunto.map((adjunto: any, adjIdx: number) => (
                                      <ListItem key={adjIdx}>
                                        <ListItemText
                                          primary={
                                            <Link href={adjunto.archivo} target="_blank" rel="noopener">
                                              {adjunto.archivo
                                                ? adjunto.archivo.split("/").pop()
                                                : `Certificado ${adjIdx + 1}`}
                                            </Link>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay certificados adjuntos
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay enfermedades registradas
                  </Typography>
                )}
              </Grid>

              {/* Condiciones de vulnerabilidad */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones de Vulnerabilidad
                </Typography>
                {nnya.condicionesVulnerabilidad && Array.isArray(nnya.condicionesVulnerabilidad) && nnya.condicionesVulnerabilidad.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {nnya.condicionesVulnerabilidad.map((condicion, idx) => {
                      // Handle different data structures for vulnerability conditions
                      let label = "Condición no especificada"
                      let color: "primary" | "default" = "default"

                      if (typeof condicion === "string") {
                        label = condicion
                      } else if (typeof condicion === "object" && condicion !== null) {
                        if (condicion.condicion_vulnerabilidad) {
                          // If it's a nested object with condicion_vulnerabilidad
                          if (typeof condicion.condicion_vulnerabilidad === "string") {
                            label = condicion.condicion_vulnerabilidad
                          } else if (typeof condicion.condicion_vulnerabilidad === "object" && condicion.condicion_vulnerabilidad.nombre) {
                            label = condicion.condicion_vulnerabilidad.nombre
                          }
                        } else if (condicion.nombre) {
                          // If it's a direct object with nombre
                          label = condicion.nombre
                        } else if (condicion.descripcion) {
                          // Fallback to descripcion
                          label = condicion.descripcion
                        }

                        // Set color based on si_no property if available
                        if (condicion.si_no !== undefined) {
                          color = condicion.si_no ? "primary" : "default"
                        }
                      }

                      return (
                        <Chip
                          key={idx}
                          label={label}
                          size="small"
                          color={color}
                        />
                      )
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay condiciones de vulnerabilidad registradas
                  </Typography>
                )}
              </Grid>

              {/* Vulneraciones */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Vulneraciones
                </Typography>
                {nnya.vulneraciones && nnya.vulneraciones.length > 0 ? (
                  <Box>
                    {nnya.vulneraciones.map((vulneracion, idx) => (
                      <Box key={idx} sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                        <Grid container spacing={2}>
                          {/* Información básica de la vulneración */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Información General
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                              <TextField
                                label="Sumatoria de Pesos"
                                value={vulneracion.sumatoria_de_pesos || ""}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                            </Box>
                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                              <Chip
                                label="Principal Demanda"
                                color={vulneracion.principal_demanda ? "primary" : "default"}
                                size="small"
                                variant={vulneracion.principal_demanda ? "filled" : "outlined"}
                              />
                              <Chip
                                label="Transcurre Actualidad"
                                color={vulneracion.transcurre_actualidad ? "primary" : "default"}
                                size="small"
                                variant={vulneracion.transcurre_actualidad ? "filled" : "outlined"}
                              />
                            </Box>
                          </Grid>

                          {/* Categorías y gravedad */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Categorías y Gravedad
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 2 }}>
                              <TextField
                                label="Categoría Motivo"
                                value={vulneracion.categoria_motivo?.nombre || ""}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Categoría Submotivo"
                                value={vulneracion.categoria_submotivo?.nombre || ""}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Gravedad"
                                value={vulneracion.gravedad_vulneracion?.nombre || ""}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                label="Urgencia"
                                value={vulneracion.urgencia_vulneracion?.nombre || ""}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                            </Box>
                            {vulneracion.autor_dv && (
                              <TextField
                                label="Autor DV"
                                value={vulneracion.autor_dv || ""}
                                fullWidth
                                size="small"
                                margin="normal"
                                InputProps={{ readOnly: true }}
                              />
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay vulneraciones registradas
                  </Typography>
                )}
              </Grid>

              {/* Condiciones de vulnerabilidad */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones de Vulnerabilidad
                </Typography>
                {nnya.condicionesVulnerabilidad && Array.isArray(nnya.condicionesVulnerabilidad) && nnya.condicionesVulnerabilidad.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {nnya.condicionesVulnerabilidad.map((condicion, idx) => {
                      // Handle different data structures for vulnerability conditions
                      let label = "Condición no especificada"
                      let color: "primary" | "default" = "default"

                      if (typeof condicion === "string") {
                        label = condicion
                      } else if (typeof condicion === "object" && condicion !== null) {
                        if (condicion.condicion_vulnerabilidad) {
                          // If it's a nested object with condicion_vulnerabilidad
                          if (typeof condicion.condicion_vulnerabilidad === "string") {
                            label = condicion.condicion_vulnerabilidad
                          } else if (typeof condicion.condicion_vulnerabilidad === "object" && condicion.condicion_vulnerabilidad.nombre) {
                            label = condicion.condicion_vulnerabilidad.nombre
                          }
                        } else if (condicion.nombre) {
                          // If it's a direct object with nombre
                          label = condicion.nombre
                        } else if (condicion.descripcion) {
                          // Fallback to descripcion
                          label = condicion.descripcion
                        }

                        // Set color based on si_no property if available
                        if (condicion.si_no !== undefined) {
                          color = condicion.si_no ? "primary" : "default"
                        }
                      }

                      return (
                        <Chip
                          key={idx}
                          label={label}
                          size="small"
                          color={color}
                        />
                      )
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay condiciones de vulnerabilidad registradas
                  </Typography>
                )}
              </Grid>

              {/* Información de la demanda */}
              {nnya.demanda_persona && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información de la Demanda
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <TextField
                      label="Vínculo con Demanda"
                      value={nnya.demanda_persona.vinculo_demanda || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Vínculo con NNYA Principal"
                      value={nnya.demanda_persona.vinculo_con_nnya_principal || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Conviviente"
                      value={nnya.demanda_persona.conviviente ? "Sí" : "No"}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Legalmente Responsable"
                      value={nnya.demanda_persona.legalmente_responsable ? "Sí" : "No"}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </Grid>
              )}

              {/* Observaciones */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Observaciones
                </Typography>
                <TextField
                  value={nnya.observaciones || ""}
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {nnyaNoConvivientes.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No hay NNYA no convivientes registrados
        </Typography>
      )}
    </Paper>
  )
}
