"use client"

import {
  Paper,
  Typography,
  Box,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import { useState } from "react"

interface InformacionGeneralProps {
  data: any
}

export default function InformacionGeneral({ data }: InformacionGeneralProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
            <TextField
              label="Localidad"
              name="Localidad"
              value={data.Localidad || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="Fecha" name="Fecha" value={data.Fecha || ""} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Cargo/Función"
              name="CargoFuncion"
              value={data.CargoFuncion || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Nombre y Apellido"
              name="NombreApellido"
              value={data.NombreApellido || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Número de Demanda"
              name="NumerosDemanda"
              value={data.NumerosDemanda || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Remitente"
              name="BloqueDatosRemitente"
              value={data.BloqueDatosRemitente || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Tipo Institución"
              name="TipoInstitucion"
              value={data.TipoInstitucion || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Institución"
              name="Institucion"
              value={data.Institucion || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>
        </Grid>
      </Grid>

      {/* Información adicional en acordeón */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{ mt: 3, boxShadow: "none", border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="informacion-adicional-content"
          id="informacion-adicional-header"
          sx={{
            backgroundColor: "rgba(14, 165, 233, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(14, 165, 233, 0.12)",
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Información Adicional
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Fechas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Fecha Oficio/Documento"
                      value={data.fecha_oficio_documento || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Fecha Ingreso SENAF"
                      value={data.fecha_ingreso_senaf || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Etiqueta
                </Typography>
                {data.etiqueta && (
                  <Chip
                    label={data.etiqueta.toUpperCase()}
                    color={data.etiqueta === "urgente" ? "error" : "default"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Códigos de Demanda
                </Typography>
                {data.codigosDemanda &&
                  data.codigosDemanda.map((codigo: any, index: number) => (
                    <Box key={index} sx={{ display: "flex", mt: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        Tipo {codigo.tipo}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {codigo.codigo}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Clasificación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Tipo de Demanda"
                      value={data.tipo_demanda || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Objetivo de Demanda"
                      value={data.objetivo_de_demanda || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Motivo Ingreso"
                      value={data.motivo_ingreso || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Submotivo Ingreso"
                      value={data.submotivo_ingreso || ""}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Observaciones
                </Typography>
                <TextField
                  value={data.observaciones || ""}
                  fullWidth
                  multiline
                  rows={3}
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}
