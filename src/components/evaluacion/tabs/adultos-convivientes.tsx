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
  condicionesVulnerabilidad?: number[]
  nacionalidad?: string
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

              {/* Condiciones de vulnerabilidad */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones de Vulnerabilidad
                </Typography>
                {adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {adulto.condicionesVulnerabilidad.map((condicion, idx) => (
                      <Chip key={idx} label={`Condición ${condicion}`} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay condiciones de vulnerabilidad registradas
                  </Typography>
                )}
              </Grid>

              {/* Observaciones */}
              <Grid item xs={12}>
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
    </Paper>
  )
}
