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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import { useState } from "react"

interface AdultoConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
  nombre?: string
  apellido?: string
  fechaDefuncion?: string | null
  edadAproximada?: string
  situacionDni?: string
  genero?: string
  conviviente?: boolean
  legalmenteResponsable?: boolean
  ocupacion?: string
  supuesto_autordv?: string
  garantiza_proteccion?: boolean
  observaciones?: string
  useDefaultLocalizacion?: boolean
  telefono?: string
  vinculacion?: string
  vinculo_con_nnya_principal?: number
  vinculo_demanda?: string
  condicionesVulnerabilidad?: any[]
  nacionalidad?: string
  persona?: any
  persona_enfermedades?: any[]
  cobertura_medica?: any
}

interface AdultosConvivientesProps {
  adultosConvivientes: AdultoConviviente[]
  setAdultosConvivientes: React.Dispatch<React.SetStateAction<AdultoConviviente[]>>
}

export default function AdultosConvivientes({ adultosConvivientes, setAdultosConvivientes }: AdultosConvivientesProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleAccordionChange = (index: number) => {
    setExpandedId(expandedId === index ? null : index)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Adultos Convivientes
      </Typography>

      {/* Lista de Adultos con detalles expandibles */}
      {adultosConvivientes.map((adulto, index) => (
        <Accordion
          key={index}
          expanded={expandedId === index}
          onChange={() => handleAccordionChange(index)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Typography sx={{ fontWeight: "bold" }}>
                {adulto.ApellidoNombre} - DNI: {adulto.DNI}
              </Typography>
              <Chip label={adulto.VinculoConNNYAPrincipal} size="small" color="primary" />
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
                    value={adulto.nombre || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Apellido"
                    value={adulto.apellido || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Fecha de Nacimiento"
                    value={adulto.FechaNacimiento || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Edad Aproximada"
                    value={adulto.edadAproximada || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Género"
                    value={adulto.genero || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Situación DNI"
                    value={adulto.situacionDni || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Nacionalidad"
                    value={adulto.nacionalidad || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Teléfono"
                    value={adulto.telefono || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  {adulto.fechaDefuncion && (
                    <TextField
                      label="Fecha de Defunción"
                      value={adulto.fechaDefuncion}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                  {adulto.persona && adulto.persona.nombre_autopercibido && (
                    <TextField
                      label="Nombre Autopercibido"
                      value={adulto.persona.nombre_autopercibido}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Información adicional */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información Adicional
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  <TextField
                    label="Ocupación"
                    value={adulto.ocupacion || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Vinculación"
                    value={adulto.vinculacion || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Vínculo con Demanda"
                    value={adulto.vinculo_demanda || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Legalmente Responsable"
                    value={adulto.legalmenteResponsable ? "Sí" : "No"}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Supuesto Autor DV"
                    value={adulto.supuesto_autordv || ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Garantiza Protección"
                    value={adulto.garantiza_proteccion ? "Sí" : "No"}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Grid>

              {/* Cobertura médica */}
              {adulto.cobertura_medica && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cobertura Médica
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <TextField
                      label="Obra Social"
                      value={adulto.cobertura_medica.obra_social || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Institución Sanitaria"
                      value={
                        adulto.cobertura_medica.institucion_sanitaria?.nombre ||
                        adulto.cobertura_medica.institucion_sanitaria_nombre ||
                        ""
                      }
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Tipo de Intervención"
                      value={adulto.cobertura_medica.intervencion || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    {adulto.cobertura_medica.medico_cabecera && (
                      <TextField
                        label="Médico de Cabecera"
                        value={adulto.cobertura_medica.medico_cabecera.nombre || ""}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    )}
                    {adulto.cobertura_medica.observaciones && (
                      <TextField
                        label="Observaciones"
                        value={adulto.cobertura_medica.observaciones}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        InputProps={{ readOnly: true }}
                        sx={{ gridColumn: "span 2" }}
                      />
                    )}
                  </Box>
                </Grid>
              )}

              {/* Enfermedades */}
              {adulto.persona_enfermedades && adulto.persona_enfermedades.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Enfermedades
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Enfermedad</TableCell>
                          <TableCell>Diagnóstico</TableCell>
                          <TableCell>Tratamiento</TableCell>
                          <TableCell>Certificación</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {adulto.persona_enfermedades.map((enfermedad, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {enfermedad.enfermedad?.nombre || enfermedad.enfermedad_nombre || "No especificada"}
                            </TableCell>
                            <TableCell>{enfermedad.diagnostico || "No especificado"}</TableCell>
                            <TableCell>
                              {enfermedad.recibe_tratamiento
                                ? enfermedad.informacion_tratamiento || "Sí"
                                : "No recibe tratamiento"}
                            </TableCell>
                            <TableCell>{enfermedad.certificacion || "No especificada"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}

              {/* Condiciones de vulnerabilidad */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones de Vulnerabilidad
                </Typography>
                {adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {adulto.condicionesVulnerabilidad.map((condicion, idx) => {
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

              {/* Observaciones */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Observaciones
                </Typography>
                <TextField
                  value={adulto.observaciones || ""}
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

      {adultosConvivientes.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No hay adultos convivientes registrados
        </Typography>
      )}
    </Paper>
  )
}
