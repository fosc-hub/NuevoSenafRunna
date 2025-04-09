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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  condicionesVulnerabilidad?: any
  vulneraciones?: any[]
  nacionalidad?: string
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
                    value={nnya.Barrio || ""}
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
                      value={nnya.educacion.nivel || ""}
                      fullWidth
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Curso"
                      value={nnya.educacion.curso || ""}
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
                      value={nnya.cobertura_medica.institucion_sanitaria_nombre || ""}
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
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay información de cobertura médica disponible
                  </Typography>
                )}
              </Grid>

              {/* Enfermedades */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Enfermedades
                </Typography>
                {nnya.persona_enfermedades && nnya.persona_enfermedades.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Enfermedad</TableCell>
                          <TableCell>Diagnóstico</TableCell>
                          <TableCell>Tratamiento</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nnya.persona_enfermedades.map((enfermedad, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{enfermedad.enfermedad_nombre}</TableCell>
                            <TableCell>{enfermedad.diagnostico}</TableCell>
                            <TableCell>{enfermedad.tratamiento}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay enfermedades registradas
                  </Typography>
                )}
              </Grid>

              {/* Vulneraciones */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Vulneraciones
                </Typography>
                {nnya.vulneraciones && nnya.vulneraciones.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Ámbito</TableCell>
                          <TableCell>Observaciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nnya.vulneraciones.map((vulneracion, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{vulneracion.tipo_vulneracion_nombre}</TableCell>
                            <TableCell>{vulneracion.fecha_vulneracion}</TableCell>
                            <TableCell>{vulneracion.ambito_vulneracion_nombre}</TableCell>
                            <TableCell>{vulneracion.observaciones}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay vulneraciones registradas
                  </Typography>
                )}
              </Grid>

              {/* Observaciones */}
              <Grid item xs={12}>
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
    </Paper>
  )
}
