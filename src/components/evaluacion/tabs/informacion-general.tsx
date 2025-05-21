"use client"

import { Paper, Typography, Box, TextField, Grid, Chip, List, ListItem, ListItemText } from "@mui/material"

interface InformacionGeneralProps {
  data: any
}

export default function InformacionGeneral({ data }: InformacionGeneralProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>

      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
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

          {/* Observaciones movidas a la columna izquierda */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observaciones
            </Typography>
            <TextField
              value={data.observaciones || ""}
              fullWidth
              multiline
              rows={5}
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Box>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          {/* Fechas */}
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

          {/* Etiqueta */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Etiqueta
            </Typography>
            {data.etiqueta && (
              <Chip
                label={typeof data.etiqueta === "string" ? data.etiqueta.toUpperCase() : String(data.etiqueta)}
                color={
                  typeof data.etiqueta === "string" && data.etiqueta.toLowerCase() === "urgente" ? "error" : "default"
                }
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Códigos de Demanda */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Códigos de Demanda
            </Typography>
            {data.codigos_demanda && Array.isArray(data.codigos_demanda) && data.codigos_demanda.length > 0 ? (
              <List dense>
                {data.codigos_demanda.map((codigo: any, index: number) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={`Código: ${codigo.codigo || ""}`}
                      secondary={`Tipo: ${codigo.tipo_codigo?.nombre || codigo.tipo_codigo || ""}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay códigos de demanda registrados
              </Typography>
            )}
          </Box>

          {/* Clasificación */}
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
        </Grid>
      </Grid>
    </Paper>
  )
}
